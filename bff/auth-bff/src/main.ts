/**
 * main.ts - Auth BFF 启动入口
 * @package @vxture/bff-auth
 * @description 统一认证服务，唯一有权签发 JWT 的 NestJS 应用
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // cookie 解析（用于读取跨域验证请求中的 cookie）
  const cookieParser = (await import("cookie-parser")).default;
  app.use(cookieParser());

  const port = Number(process.env.AUTH_BFF_PORT ?? 3090);
  await app.listen(port);
  Logger.log(`✅ auth-bff listening on http://localhost:${port}`, "Bootstrap");
}

void bootstrap();
