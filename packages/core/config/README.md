# @vxture/core-config — 配置管理基础设施

> **面向开发人员/AI 的使用文档**
> 如需了解开发该包的约束和规范，请查看 `CLAUDE.md`。

---

## 概述

把 `process.env` 解析成强类型的配置对象，通过 NestJS DI 注入给消费方。

**核心特性：**
- 基于 Zod 的类型安全验证
- NestJS 动态模块集成
- 域级按需加载
- Fail-fast 启动验证
- 支持开发/测试/生产多环境

---

## 安装

```bash
pnpm add @vxture/core-config
```

---

## 快速开始

### 1. 在 AppModule 中注册

```typescript
import { Module } from '@nestjs/common';
import { VxConfigModule } from '@vxture/core-config';

@Module({
  imports: [
    // BFF / Service（不需要 AI 配置）
    VxConfigModule.register({
      domains: ['app', 'database', 'redis', 'auth'],
    }),
    // Agent Server（需要 AI 配置）
    VxConfigModule.register({
      domains: ['app', 'database', 'redis', 'auth', 'ai'],
    }),
  ],
})
export class AppModule {}
```

### 2. 在 Service 中使用

```typescript
import { Injectable } from '@nestjs/common';
import { VxConfigService } from '@vxture/core-config';

@Injectable()
export class MyService {
  constructor(private readonly config: VxConfigService) {}

  doSomething() {
    // 全类型推导，IDE 自动补全
    const { DB_HOST, DB_PORT } = this.config.database;
    const { JWT_SECRET } = this.config.auth;
    const { PORT, NODE_ENV } = this.config.app;

    if (this.config.isProduction) {
      // 生产环境专用逻辑
    }
  }
}
```

---

## 配置域

| 域 | 消费方 | 内容 |
|----|--------|------|
| `app` | 所有 | NODE_ENV、PORT、LOG_LEVEL、APP_NAME |
| `database` | BFF / services / agent-server | PostgreSQL 连接配置 |
| `redis` | BFF / services / agent-server | Redis 连接配置 |
| `auth` | BFF / agent-server | JWT、bcrypt 配置 |
| `ai` | agent-server | 豆包、Claude、ChatGPT、通义千问、自定义模型配置 |

---

## API 参考

### VxConfigModule

```typescript
import { VxConfigModule } from '@vxture/core-config';

VxConfigModule.register({
  // 需要加载的配置域
  domains: ['app', 'database', 'redis', 'auth'],
  // strict: true (默认) — 缺少必填 env 直接 process.exit(1)
  // strict: false — 仅用于测试场景
});
```

### VxConfigService

```typescript
import { VxConfigService } from '@vxture/core-config';

@Injectable()
export class MyService {
  constructor(private readonly config: VxConfigService) {}

  // Getters（全类型）
  get app(): AppConfig
  get database(): DatabaseConfig
  get redis(): RedisConfig
  get auth(): AuthConfig
  get ai(): AiConfig  // 仅 agent-server

  // 环境判断
  get isProduction(): boolean
  get isDevelopment(): boolean
  get isTest(): boolean
}
```

### 直接注入单个域

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_TOKEN } from '@vxture/core-config';
import type { DatabaseConfig } from '@vxture/core-config';

@Injectable()
export class DatabaseProvider {
  constructor(
    @Inject(CONFIG_TOKEN.DATABASE)
    private readonly dbConfig: DatabaseConfig,
  ) {}
}
```

---

## 测试中 Mock 配置

```typescript
import { Test } from '@nestjs/testing';
import { CONFIG_TOKEN } from '@vxture/core-config';

const mockDb = {
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_NAME: 'test_db',
  DB_USER: 'test',
  DB_PASSWORD: 'test',
  DB_POOL_MAX: 5,
  DB_SSL: 'disable',
};

const module = await Test.createTestingModule({
  providers: [
    YourService,
    { provide: CONFIG_TOKEN.DATABASE, useValue: mockDb },
  ],
}).compile();
```

---

## 环境变量示例

```bash
# App
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
APP_NAME=vxture

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
# 或分项配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vxture
DB_USER=postgres
DB_PASSWORD=secret
DB_POOL_MAX=10
DB_SSL=prefer

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=3600
REDIS_KEY_PREFIX=vx:

# Auth
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_BLACKLIST_STORAGE=redis
BCRYPT_ROUNDS=12

# AI（仅 agent-server）
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_DEFAULT_MODEL=doubao-pro-32k
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_DEFAULT_MODEL=claude-sonnet-4-20250514
OPENAI_API_KEY=your-openai-api-key
OPENAI_DEFAULT_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
QWEN_API_KEY=your-qwen-api-key
QWEN_DEFAULT_MODEL=qwen-plus
QWEN_EMBEDDING_MODEL=text-embedding-v2
AI_REQUEST_TIMEOUT_MS=60000
AI_MAX_RETRIES=2
```

---

## 目录结构

```
packages/core/config/
├── src/
│   ├── module/       # NestJS 动态模块
│   ├── schemas/      # Zod schemas（app、database、redis、auth、ai）
│   ├── service/      # VxConfigService
│   ├── types/        # VxConfig、CONFIG_TOKEN
│   └── index.ts      # 公共入口
├── CLAUDE.md         # AI 编码指南
└── README.md         # 使用文档（本文档）
```

---

## 新增配置域

参见 `CLAUDE.md` 中的「新增配置域（标准流程）」。
