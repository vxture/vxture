# 部署与 CI/CD 指南

此文档提供 Jenkins 为主的 CI/CD 模板示例与部署建议。

## CI 流程建议（Jenkins）
1. Pull Request 时触发：执行 lint、type-check、单元测试、前端构建（vite/next）
2. 合并到 main：触发镜像构建、集成测试与部署到 staging
3. 发布到 production：手动批准 + 逐步 Canary 发布（Istio 流量分配）

## Jenkinsfile（示例）
- 我们在 `infra/jenkins/Jenkinsfile` 提供了一个基础示例 pipeline（checkout, install, test, build, docker build, push）。

## 部署策略
- 使用 Helm / Kustomize 管理 Kubernetes 资源
- 使用 ArgoCD 或 Jenkins 与 kubectl/helm 做自动化部署（本仓库示例使用 Jenkins）

## 密钥与凭证
- Jenkins 使用凭证插件管理 Docker registry（阿里云容器镜像服务）、阿里云凭证和 kubectl kubeconfig
- CI 不应记录明文密钥，所有 API Key 应使用凭证库或阿里云 RAM 角色合并配置

## 回滚策略
- 每次部署都保留镜像 tag 与部署记录，使用 Helm rollback 或 kubectl rollout undo 作为回滚手段
