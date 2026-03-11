/**
 * index.ts - Ruin Agent Server 应用入口
 * @package agent-server/ruinagent
 *
 * Description: Ruin Agent 的私有后端服务入口，使用 HTTP 服务器响应 BFF 请求
 *
 * @author AI-Generated
 * @date 2026-03-11 22:00:00
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Main
 */

import { createServer } from 'http';
import { aiProvider } from './providers/ai.provider';
import { sessionRouter } from './routers/session.router';

// ============================================================================
// 服务器配置
// ============================================================================

const DEFAULT_PORT = 4002;

// ============================================================================
// 请求处理函数
// ============================================================================

const handleRequest = async (req: any, res: any): Promise<void> => {
  try {
    // 设置 CORS 头部
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 路由处理
    const url = req.url || '';

    // 健康检查
    if (url === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
      return;
    }

    // API 路由
    if (url.startsWith('/api')) {
      await handleApiRequest(req, res, url);
      return;
    }

    // 默认响应
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  } catch (error) {
    console.error('Request handling error:', error);
    res.writeHead(500);
    res.end(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
};

// ============================================================================
// API 请求处理
// ============================================================================

const handleApiRequest = async (req: any, res: any, url: string): Promise<void> => {
  if (url === '/api/session') {
    if (req.method === 'POST') {
      await handleCreateSession(req, res);
    } else {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return;
  }

  if (url.startsWith('/api/session/')) {
    const match = url.match(/\/api\/session\/([^/]+)/);
    if (match) {
      await handleSessionOperations(req, res, match[1]);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
};

// ============================================================================
// 会话操作处理
// ============================================================================

const handleCreateSession = async (req: any, res: any): Promise<void> => {
  let body = '';

  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: any) => (body += chunk));
    req.on('end', resolve);
    req.on('error', reject);
  });

  const requestData = JSON.parse(body);

  const response = await sessionRouter.createSession(requestData);

  res.writeHead(response.code);
  res.end(JSON.stringify(response));
};

const handleSessionOperations = async (req: any, res: any, sessionId: string): Promise<void> => {
  const url = req.url || '';

  if (url === `/api/session/${sessionId}`) {
    if (req.method === 'GET') {
      // 获取会话详情（待实现）
    }
  } else if (url === `/api/session/${sessionId}/history`) {
    if (req.method === 'GET') {
      const response = await sessionRouter.getSessionHistory(sessionId, 50);
      res.writeHead(response.code);
      res.end(JSON.stringify(response));
    }
  } else if (url === `/api/session/${sessionId}/message`) {
    if (req.method === 'POST') {
      let body = '';
      await new Promise<void>((resolve, reject) => {
        req.on('data', (chunk: any) => (body += chunk));
        req.on('end', resolve);
        req.on('error', reject);
      });

      const requestData = JSON.parse(body);
      const response = await sessionRouter.sendMessage({
        sessionId,
        ...requestData,
      });

      res.writeHead(response.code);
      res.end(JSON.stringify(response));
    }
  } else if (url === `/api/session/${sessionId}/task`) {
    if (req.method === 'GET') {
      const taskId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('taskId');
      if (taskId) {
        const response = await sessionRouter.getTaskStatus({ taskId });
        res.writeHead(response.code);
        res.end(JSON.stringify(response));
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing taskId parameter' }));
      }
    }
  }
};

// ============================================================================
// 服务器类
// ============================================================================

class RuinAgentServer {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;

  constructor(port: number = DEFAULT_PORT) {
    this.port = port;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(handleRequest);

      this.server.listen(this.port, async () => {
        try {
          // 初始化 AI Provider
          await aiProvider.initialize();

          console.log(`Ruin Agent Server running on port ${this.port}`);
          resolve();
        } catch (error) {
          console.error('AI Provider initialization failed:', error);
          reject(error);
        }
      });

      this.server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            console.error('Error closing server:', error);
            reject(error);
          } else {
            console.log('Ruin Agent Server stopped');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// ============================================================================
// 启动函数
// ============================================================================

export function startRuinAgentServer(port?: number): Promise<RuinAgentServer> {
  const server = new RuinAgentServer(port);
  return server.start().then(() => server);
}

export default RuinAgentServer;
