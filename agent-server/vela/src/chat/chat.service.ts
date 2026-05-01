/**
 * chat.service.ts - Vela 对话编排主逻辑（Tool Use Loop）
 * @package vela-server
 * @layer Application
 * @category Service
 *
 * @description
 *   Tool Use Loop：调用 LLM → 发现 tool_call → 执行工具 → 追加结果 → 再次调用 LLM。
 *   最大循环次数 MAX_TOOL_ITERATIONS = 5，防止无限循环。
 *   所有 LLM 调用通过 @vxture/ai-sdk/llm，禁止直接 import provider SDK（spec §11.3）。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { Inject, Injectable } from '@nestjs/common';
import { GatewayLLMClient } from '@vxture/ai-sdk/llm';
import type { LLMMessage } from '@vxture/ai-sdk/llm';
import type { CallerContext } from '../context/caller-context.types';
import { MessageRepository, type VelaMessageCreateInput, type VelaMessageRecord } from '../storage/message.repository';
import { SessionRepository, type VelaSessionRecord } from '../storage/session.repository';
import { ToolRegistry } from '../tools/tool-registry';
import { buildSystemPrompt } from './prompts/system.prompt';
import type { ChatStreamEvent } from './chat.types';

// ============================================================================
// 常量
// ============================================================================

const MAX_TOOL_ITERATIONS = 5;

/** admin surface 无 tenantId，使用平台/运营租户 UUID 用于 LLM 网关计费追踪 */
const PLATFORM_LLM_TENANT_ID =
  process.env['VELA_PLATFORM_LLM_TENANT_ID'] ?? '82cf3e39-f7f0-4597-bb55-b1303ca19d46';

const DEFAULT_MODEL_CODE =
  process.env['VELA_DEFAULT_MODEL_CODE'] ?? 'doubao-seed-2-0-lite-260215';

const VELA_LLM_AGENT_ID = process.env['VELA_LLM_AGENT_ID']?.trim() || undefined;

// ============================================================================
// ChatService
// ============================================================================

@Injectable()
export class ChatService {
  constructor(
    @Inject(ToolRegistry) private readonly toolRegistry: ToolRegistry,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(MessageRepository) private readonly messageRepository: MessageRepository,
  ) {}

  async *chat(
    message:   string,
    sessionId: string | null,
    ctx:       CallerContext,
  ): AsyncGenerator<ChatStreamEvent> {
    const llmTenantId = ctx.tenantId ?? PLATFORM_LLM_TENANT_ID;

    const client = new GatewayLLMClient(
      VELA_LLM_AGENT_ID
        ? { tenantId: llmTenantId, agentId: VELA_LLM_AGENT_ID }
        : { tenantId: llmTenantId },
    );

    // 1. 获取可用工具
    const availableTools = this.toolRegistry.getAvailableTools(ctx);
    const llmTools       = this.toolRegistry.toLLMTools(availableTools);

    // 2. 加载并校验会话历史
    const existingSession = sessionId
      ? await this.sessionRepository.findSession(sessionId)
      : null;

    if (sessionId && !existingSession) {
      yield { type: 'error', message: 'Session not found' };
      return;
    }

    if (existingSession && !isSessionAccessible(existingSession, ctx)) {
      yield { type: 'error', message: 'Session not accessible in current context' };
      return;
    }

    const history = existingSession
      ? await this.messageRepository.findMessages(existingSession.id)
      : [];

    const messages: LLMMessage[] = [
      { role: 'system', content: buildSystemPrompt(ctx) },
      ...toLLMHistory(history),
      { role: 'user',   content: message },
    ];

    // 3. Tool Use Loop
    let iterations = 0;
    let assistantText = '';
    const toolMessages: VelaMessageCreateInput[] = [];

    while (iterations < MAX_TOOL_ITERATIONS) {
      let toolCallId:   string | null = null;
      let toolCallName: string | null = null;
      let toolCallArgs: Record<string, unknown> = {};
      let hasText      = false;

      try {
        for await (const chunk of client.chatStream(
          messages,
          { model: DEFAULT_MODEL_CODE, temperature: 0.7 },
          { tools: llmTools.length > 0 ? llmTools : undefined, toolChoice: 'auto' },
        )) {
          if (chunk.type === 'text') {
            hasText = true;
            assistantText += chunk.delta;
            yield { type: 'text', delta: chunk.delta };
          } else if (chunk.type === 'tool_call') {
            toolCallId   = chunk.toolCall.id;
            toolCallName = chunk.toolCall.name;
            toolCallArgs = chunk.toolCall.arguments;
            yield { type: 'tool_call', toolId: chunk.toolCall.name, status: 'running' };
          } else if (chunk.type === 'error') {
            yield { type: 'error', message: chunk.message };
            return;
          }
          // 'done' chunk：继续外层循环判断
        }
      } catch (err) {
        yield { type: 'error', message: `LLM error: ${String(err)}` };
        return;
      }

      // 无工具调用 → 本轮对话结束
      if (!toolCallName) break;

      // 4. 执行前预检：执行类工具须用户确认
      const preparation = await this.toolRegistry.prepareExecution(toolCallName, toolCallArgs, ctx);
      if (preparation.status === 'confirmation_required') {
        yield {
          type:    'confirm_required',
          auditId: preparation.auditId,
          toolId:  toolCallName,
          summary: preparation.summary,
        };
        // 挂起：本轮流结束，等待用户通过 /confirm 接口响应
        break;
      }

      // 只读工具直接执行
      const toolResult = await this.toolRegistry.execute(toolCallName, toolCallArgs, ctx);
      toolMessages.push({
        sessionId:  existingSession?.id ?? '',
        role:       'tool',
        content:    JSON.stringify(toolResult),
        toolId:     toolCallName,
        toolCallId: toolCallId!,
        toolInput:  toolCallArgs,
        toolResult,
        displayHint: toolResult.displayHint,
      });

      yield {
        type:        'tool_result',
        toolId:      toolCallName,
        data:        toolResult.data,
        displayHint: toolResult.displayHint,
      };

      // 5. 将 assistant + tool 结果追加到消息历史，继续循环
      messages.push(
        {
          role:      'assistant',
          content:   '',
          toolCalls: [{
            id:        toolCallId!,
            name:      toolCallName,
            arguments: toolCallArgs,
          }],
        },
        {
          role:       'tool',
          content:    JSON.stringify(toolResult),
          toolCallId: toolCallId!,
          name:       toolCallName,
        },
      );

      iterations++;
    }

    // 6. 持久化本轮会话与消息
    const finalSession = existingSession ?? await this.sessionRepository.createSession({
      userId:   ctx.userId,
      tenantId: ctx.tenantId,
      surface:  ctx.surface,
      title:    buildSessionTitle(message),
    });

    const pendingMessages: VelaMessageCreateInput[] = [
      {
        sessionId: finalSession.id,
        role:      'user',
        content:   message,
      },
    ];

    if (assistantText.trim()) {
      pendingMessages.push({
        sessionId: finalSession.id,
        role:      'assistant',
        content:   assistantText,
      });
    }

    pendingMessages.push(
      ...toolMessages.map((toolMessage) => ({
        ...toolMessage,
        sessionId: finalSession.id,
      })),
    );

    await this.messageRepository.saveMessages(pendingMessages);

    if (!finalSession.title) {
      await this.sessionRepository.updateTitle(finalSession.id, buildSessionTitle(message));
    }

    const finalSessionId = finalSession.id;
    yield { type: 'done', sessionId: finalSessionId };
  }
}

function isSessionAccessible(session: VelaSessionRecord, ctx: CallerContext): boolean {
  return (
    session.userId === ctx.userId &&
    session.surface === ctx.surface &&
    session.tenantId === ctx.tenantId
  );
}

function toLLMHistory(records: VelaMessageRecord[]): LLMMessage[] {
  const messages: LLMMessage[] = [];

  for (const record of records) {
    if (record.role === 'user' || record.role === 'assistant') {
      messages.push({ role: record.role, content: record.content });
      continue;
    }

    if (record.role === 'tool' && record.toolId && record.toolCallId) {
      // 还原 assistant tool-call 消息（LLM 需要先看到 assistant 发起调用才能接受 tool 结果）
      messages.push({
        role:      'assistant',
        content:   '',
        toolCalls: [{
          id:        record.toolCallId,
          name:      record.toolId,
          arguments: (record.toolInput as Record<string, unknown>) ?? {},
        }],
      });
      // 还原 tool result 消息
      messages.push({
        role:       'tool',
        content:    JSON.stringify(record.toolResult),
        toolCallId: record.toolCallId,
        name:       record.toolId,
      });
    }
    // toolCallId 为 null（migration 前的旧数据）：跳过，避免向 LLM 发送格式不完整的消息
  }

  return messages;
}

function buildSessionTitle(message: string): string {
  const compact = message.trim().replace(/\s+/g, ' ');
  return compact.length > 20 ? `${compact.slice(0, 20)}...` : compact;
}
