/**
 * message.repository.ts - 消息持久化仓库
 * @package vela-server
 * @layer Application
 * @category Repository
 *
 * @description
 *   封装 VelaMessage 表的 CRUD 操作。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface VelaMessageRecord {
  id:           string;
  sessionId:    string;
  role:         'user' | 'assistant' | 'tool';
  content:      string;
  toolId?:      string;
  toolCallId?:  string;
  toolInput?:   unknown;
  toolResult?:  unknown;
  displayHint?: string;
  createdAt:    Date;
}

export type VelaMessageCreateInput = Omit<VelaMessageRecord, 'id' | 'createdAt'>;

interface VelaMessageRow {
  id:          string;
  sessionId:   string;
  role:        string;
  content:     string;
  toolId:      string | null;
  toolCallId:  string | null;
  toolInput:   unknown;
  toolResult:  unknown;
  displayHint: string | null;
  createdAt:   Date;
}

@Injectable()
export class MessageRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMessages(sessionId: string, limit = 50): Promise<VelaMessageRecord[]> {
    const rows = await this.prisma.$queryRawUnsafe<VelaMessageRow[]>(
      `SELECT id, "sessionId", role, content, "toolId", "toolCallId", "toolInput", "toolResult", "displayHint", "createdAt"
       FROM "VelaMessage"
       WHERE "sessionId" = $1
       ORDER BY "createdAt" ASC
       LIMIT $2`,
      sessionId,
      limit,
    );

    return rows.map(toMessageRecord);
  }

  /** 批量写入消息，单次 SQL 往返，减少数据库 round-trip。 */
  async saveMessages(messages: VelaMessageCreateInput[]): Promise<void> {
    if (!messages.length) return;

    // 逐行构造参数占位符：每行 9 个字段（id~displayHint），createdAt 用 NOW()
    const values = messages
      .map((_, i) => {
        const b = i * 9;
        return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7}::jsonb,$${b+8}::jsonb,$${b+9},NOW())`;
      })
      .join(',');

    const params = messages.flatMap((m) => [
      randomUUID(),
      m.sessionId,
      m.role,
      m.content,
      m.toolId       ?? null,
      m.toolCallId   ?? null,
      toJsonText(m.toolInput),
      toJsonText(m.toolResult),
      m.displayHint  ?? null,
    ]);

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "VelaMessage"
         (id,"sessionId",role,content,"toolId","toolCallId","toolInput","toolResult","displayHint","createdAt")
       VALUES ${values}`,
      ...params,
    );
  }

  async create(data: VelaMessageCreateInput): Promise<VelaMessageRecord> {
    const row = await this.insertMessage(data);
    return toMessageRecord(row);
  }

  private async insertMessage(data: VelaMessageCreateInput): Promise<VelaMessageRow> {
    const rows = await this.prisma.$queryRawUnsafe<VelaMessageRow[]>(
      `INSERT INTO "VelaMessage" (
        id, "sessionId", role, content, "toolId", "toolCallId", "toolInput", "toolResult", "displayHint", "createdAt"
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, NOW())
       RETURNING id, "sessionId", role, content, "toolId", "toolCallId", "toolInput", "toolResult", "displayHint", "createdAt"`,
      randomUUID(),
      data.sessionId,
      data.role,
      data.content,
      data.toolId ?? null,
      data.toolCallId ?? null,
      toJsonText(data.toolInput),
      toJsonText(data.toolResult),
      data.displayHint ?? null,
    );
    return rows[0]!;
  }
}

function toJsonText(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function toMessageRecord(row: VelaMessageRow): VelaMessageRecord {
  return {
    id:        row.id,
    sessionId: row.sessionId,
    role:      toMessageRole(row.role),
    content:   row.content,
    ...(row.toolId      != null ? { toolId:      row.toolId }      : {}),
    ...(row.toolCallId  != null ? { toolCallId:  row.toolCallId }  : {}),
    ...(row.toolInput   != null ? { toolInput:   row.toolInput }   : {}),
    ...(row.toolResult  != null ? { toolResult:  row.toolResult }  : {}),
    ...(row.displayHint != null ? { displayHint: row.displayHint } : {}),
    createdAt: row.createdAt,
  };
}

function toMessageRole(role: string): VelaMessageRecord['role'] {
  if (role === 'user' || role === 'assistant' || role === 'tool') return role;
  return 'assistant';
}
