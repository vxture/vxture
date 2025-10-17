# 系统架构概览

本档描述 vxture 智能体平台的高层架构，适用于微服务部署与扩展。

## 高层组件

- 前端：Next.js (SSR) + 可选 Vite 微前端
- BFF / API Gateway：统一认证与路由（建议使用 Kong/Envoy + Istio）
- 后端服务：Node.js (NestJS/Express) 与 Golang 服务（业务分层）
- 数据层：PostgreSQL、MongoDB、InfluxDB、Elasticsearch
- 消息中间件：RocketMQ
- 缓存：Redis
- 存储：阿里云 OSS
- 运维：Kubernetes (ACK)、Prometheus、Grafana、ELK

## 部署模式（建议）
1. 每个服务用容器化部署（Docker），通过 Helm chart 管理 K8s 资源。
2. 使用 Istio 做服务发现、流量管理与策略控制。
3. 配置中央化日志与监控：所有微服务导出 /metrics 与 structured logs（JSON）。

## 网络与安全
- 对外 API 通过 API Gateway + WAF 保护
- 内部服务通信基于 mTLS（由 Istio 提供）
- 身份验证集中管理：OAuth2 / OIDC

## 可视化
请将此文件配合架构图（draw.io / mermaid / PlantUML）使用，建议在 README 中附带一张 PNG/SVG。
