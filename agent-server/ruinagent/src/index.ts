/**
 * index.ts - Ruin Agent Server 入口
 * @package @vxture/agent-server-ruinagent
 *
 * Description: Ruin Agent 的私有后端服务入口
 *
 * @author AI-Generated
 * @date 2026-03-11 11:20:00
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application / Domain
 * @category Ruin Agent - Server
 */

import { createServer } from 'http';

/**
 * Ruin Agent Server
 */
class RuinAgentServer {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;

  constructor(port: number = 4002) {
    this.port = port;
  }

  /**
   * 启动服务器
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Ruin Agent Server is running',
          timestamp: new Date().toISOString(),
          agent: 'ruinagent',
          mode: 'agent-server',
        }));
      });

      this.server.listen(this.port, () => {
        console.log(`Ruin Agent Server running on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  }

  /**
   * 停止服务器
   */
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

/**
 * 启动服务器的函数
 */
export function startRuinAgentServer(port?: number): Promise<RuinAgentServer> {
  const server = new RuinAgentServer(port);
  return server.start().then(() => server);
}

/**
 * 默认导出
 */
export default RuinAgentServer;
