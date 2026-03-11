/**
 * index.ts - Ruin Agent BFF 入口
 * @package @vxture/bff-ruinagent
 *
 * Description: Ruin Agent 前端的后端代理服务入口
 *
 * @author AI-Generated
 * @date 2026-03-11 11:20:00
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Ruin Agent - BFF
 */

import { createServer } from 'http';

/**
 * Ruin Agent BFF 服务器
 */
class RuinAgentBFF {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;

  constructor(port: number = 3002) {
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
          message: 'Ruin Agent BFF server is running',
          timestamp: new Date().toISOString(),
          agent: 'ruinagent',
          mode: 'bff',
        }));
      });

      this.server.listen(this.port, () => {
        console.log(`Ruin Agent BFF server running on port ${this.port}`);
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
            console.log('Ruin Agent BFF server stopped');
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
export function startRuinAgentBFF(port?: number): Promise<RuinAgentBFF> {
  const bff = new RuinAgentBFF(port);
  return bff.start().then(() => bff);
}

/**
 * 默认导出
 */
export default RuinAgentBFF;
