# Vxture 平台控制面与业务数据面架构概要设计

## 1. 文档目标

本文档定义 Vxture 平台在 AI SaaS 场景下的：

- 平台控制面（Platform Control Plane）
- 业务数据面（Business Data Plane）
- AI Gateway 与统一配额体系
- Beta / Prod 环境治理
- PostgreSQL 容器与数据库边界
- Docker 网络与部署边界
- 面向 CI/CD 的容器组织原则

本文档为概要设计规范。
后续将继续细化：

- 数据库详细设计
- Docker Compose 设计
- CI/CD 设计
- AI Gateway 详细设计
- Quota / Billing 详细设计
- 租户与环境治理设计

---

# 2. 核心架构思想

Vxture 平台采用：

```txt
Platform Control Plane
+
Business Data Plane
```

的双平面架构。

其核心原则：

```txt
平台负责控制
业务负责执行
```

即：

| 层级 | 职责 |
|---|---|
| Platform Control Plane | 用户、租户、认证、订阅、计费、配额、审计、平台治理 |
| Business Data Plane | AI业务、GIS业务、无人机业务、业务任务、业务文件、模型结果 |

---

# 3. Platform Control Plane（平台控制面）

## 3.1 定位

平台控制面是：

```txt
全平台唯一真实来源（Single Source of Truth）
```

负责：

- 平台经营数据
- 平台治理数据
- 平台权限数据
- 平台计费与配额数据

平台控制面不承载业务执行数据。

---

## 3.2 平台数据库

生产环境：

```txt
Container:
  vxture-pg-platform-prod

Database:
  vxturestudio_platform_main
```

当前阶段：

- 一个 PostgreSQL 容器
- 一个主业务 Database
- 多 Schema

后续可按需拆分服务。

---

## 3.3 平台数据库承载内容

`vxturestudio_platform_main` 承载：

```txt
iam.*
tenant.*
subscription.*
billing.*
payment.*
invoice.*
audit.*
notification.*
system.*
quota.*
usage.*
```

包括：

- 用户
- 登录认证
- 租户与组织
- RBAC 权限
- 订阅
- 套餐
- 订单
- 支付
- 发票
- Token 配额
- AI 用量
- 平台审计
- 系统配置

---

## 3.4 平台数据库不承载内容

平台主库不允许存储：

```txt
灾害监测业务数据
无人机业务数据
GIS 图层数据
AI任务过程数据
模型输出结果
业务文件数据
业务缓存
向量数据
```

这些属于业务数据面。

---

# 4. Business Data Plane（业务数据面）

## 4.1 定位

业务数据面负责：

```txt
业务执行
AI任务
业务数据
业务文件
业务流程
```

业务数据面允许：

```txt
beta / prod 双环境
```

并允许：

- 公测
- 试用
- 生命周期清理
- 数据迁移
- 环境独立

---

## 4.2 业务数据库设计

每个业务独立数据库容器。

例如：

```txt
vxture-pg-disaster-prod
└─ vxturebiz_disaster_main

vxture-pg-disaster-beta
└─ vxturebiz_disaster_beta

vxture-pg-uav-prod
└─ vxturebiz_uav_main

vxture-pg-uav-beta
└─ vxturebiz_uav_beta
```

---

## 4.3 业务数据库职责

业务数据库负责：

```txt
业务任务
业务对象
业务文件
GIS数据
AI结果
工作流数据
向量索引
模型推理结果
```

业务数据库不负责：

```txt
用户认证
订阅
支付
计费
Token额度
平台权限
```

---

## 4.4 业务与平台关联

业务库只保存：

```txt
tenant_id
app_instance_id
user_id
```

用于关联平台。

但不复制平台主数据。

---

# 5. Beta / Prod 环境治理

## 5.1 平台层

平台层：

```txt
只有 Prod
```

即：

```txt
vxturestudio_platform_main
```

为全平台唯一正式经营库。

原因：

```txt
支付不能双份
订阅不能双份
租户不能双份
权限不能双份
```

平台控制面必须唯一可信。

---

## 5.2 业务层

业务层允许：

```txt
beta
prod
```

beta 用于：

- 试用
- 公测
- 功能验证
- 沙箱环境
- AI能力测试

prod 用于：

- 正式客户
- 正式数据
- 正式订阅

---

## 5.3 Beta → Prod 转换

用户试用满意后：

```txt
beta → prod
```

支持：

```txt
迁移业务数据
或重新开始
```

迁移只迁移：

```txt
业务数据
```

不迁移：

```txt
用户
支付
订阅
权限
```

因为这些已经在 Platform Main。

---

## 5.4 Beta 数据生命周期

业务 beta 数据允许：

```txt
自动清理
自动归档
超期删除
```

需要支持：

```txt
trial_status
trial_expires_at
last_active_at
cleanup_after_at
```

---

# 6. AI Gateway 架构

## 6.1 核心思想

业务系统不允许直接调用模型厂商。

必须通过：

```txt
AI Gateway
```

统一接入。

---

## 6.2 AI Gateway 职责

AI Gateway 负责：

```txt
模型路由
Token统计
配额校验
限流
缓存
Provider抽象
统一审计
```

---

## 6.3 AI 调用链路

```txt
Business Service
    ↓
AI Gateway
    ↓
Quota Service
    ↓
Provider Adapter
    ↓
OpenAI / Claude / DeepSeek / Doubao
```

---

# 7. 配额与计费体系

## 7.1 核心原则

```txt
配额中心化
业务去中心化
```

即：

- 配额由平台统一管理
- 业务只负责上报 usage
- Token 统一扣减

---

## 7.2 平台统一 Token Pool

平台维护：

```txt
tenant_token_pool
```

例如：

```txt
tenant A
├─ GPT-5 quota
├─ Claude quota
├─ DeepSeek quota
└─ Doubao quota
```

---

## 7.3 Usage 统一记录

平台记录：

```txt
tenant_usage
├─ tenant_id
├─ business_code
├─ environment
├─ model
├─ input_tokens
├─ output_tokens
├─ request_count
└─ cost
```

业务数据清理不会影响平台 usage。

---

# 8. Docker 与网络架构

## 8.1 网络设计

统一网络：

```txt
vxture-net
```

容器通过容器名访问。

禁止：

```txt
固定容器IP
```

---

## 8.2 Nginx 入口

统一入口：

```txt
Cloudflare
    ↓
vxture-nginx
    ↓
业务容器
```

Nginx 使用：

```nginx
proxy_pass http://container-name:port;
```

---

## 8.3 容器边界原则

平台容器：

```txt
platform-admin
platform-bff
platform-pg
platform-redis
```

业务容器：

```txt
disaster-web
disaster-bff
disaster-agent-server
disaster-pg
```

不同业务相互隔离。

一个业务崩溃不能影响平台。

---

# 9. Docker Compose 规划

## 9.1 当前阶段

当前阶段采用：

```txt
单机 + docker compose
```

不引入 Kubernetes。

---

## 9.2 Stack 规划

平台 Stack：

```txt
platform-stack
├─ nginx
├─ admin
├─ tenant
├─ admin-bff
├─ tenant-bff
├─ pg-platform-prod
└─ redis-platform-prod
```

业务 Stack：

```txt
disaster-stack
├─ disaster-web
├─ disaster-bff
├─ disaster-agent-server
├─ pg-disaster-prod
└─ redis-disaster-prod
```

---

# 10. CI/CD 架构

## 10.1 总体流程

```txt
GitHub
  ↓
GitHub Actions
  ↓
Docker Build
  ↓
Push ACR
  ↓
ECS Pull
  ↓
Docker Compose Update
  ↓
Nginx Reload
```

---

## 10.2 镜像命名规范

```txt
vxture/admin-prod
vxture/admin-beta

vxture/disaster-web-prod
vxture/disaster-web-beta

vxture/disaster-agent-server-prod
vxture/disaster-agent-server-beta
```

---

## 10.3 环境变量

```txt
APP_ENV=prod/beta
DATABASE_URL
REDIS_URL
AI_GATEWAY_URL
QUOTA_SERVICE_URL
```

---

# 11. 后续详细设计方向

下一阶段继续细化：

```txt
1. PostgreSQL Schema 详细设计
2. IAM 详细设计
3. Subscription / Billing 详细设计
4. Quota / Usage 详细设计
5. AI Gateway 详细设计
6. Docker Compose 详细设计
7. GitHub Actions 详细设计
8. 多业务 Stack 编排设计
9. 业务 beta/prod 生命周期设计
10. 数据迁移与归档设计
```

---

End of document.

