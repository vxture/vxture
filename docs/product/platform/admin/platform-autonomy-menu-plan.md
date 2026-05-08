# 平台自治域菜单统一规划

> 目标：统一“平台自治域”菜单命名、路径、code、i18n key 与建设状态，作为后续 AI Coding 重构导航、权限、菜单数据初始化的输入文档。

---

## 1. 命名原则

### 1.1 中文命名

- 平台自治域分组：统一四个字
- 平台自治域菜单：统一四个字
- 命名以“对象 / 能力”为主，避免动词化表达
- 避免使用“管理 / 配置 / 中心”等泛化词，除非语义确实成立
- 平台自治域强调系统级、内核级、治理级语义

### 1.2 code 命名

- 使用 `snake_case`
- 语义稳定，面向数据库和权限模型
- 不直接使用中文拼音
- 不使用弱语义词：`management`、`config`、`handle`

### 1.3 i18n key 命名

- 统一前缀：`menu.platform.*`
- 分组与菜单均配置 i18n key
- i18n key 使用 `snake_case`
- 中文 name 不直接写死在业务逻辑中

### 1.4 path 命名

- 路由路径统一使用 `kebab-case`
- 保留当前已有路径，避免不必要的路由迁移
- 新增待建设菜单使用语义清晰的新路径

---

## 2. 平台自治域完整菜单结构

```text
平台总览

身份权限
- 平台用户
- 平台角色
- 权限策略

平台资源
- 模型网关
- 密钥管理

运行保障
- 服务监控
- 任务调度

安全审计
- 审计日志
- 审批中心

系统配置（待建设）
- 参数配置（待建设）
- 字典管理（待建设）
- 开关控制（待建设）
```

---

## 3. 菜单明细规划

### 3.1 平台总览

| 字段 | 值 |
|---|---|
| type | menu |
| name | 平台总览 |
| code | platform_overview |
| path | /platform |
| i18n | menu.platform.overview |
| status | active |
| description | 平台自治域首页，展示平台运行状态、关键指标、风险提醒与治理入口。 |

---

### 3.2 身份权限

| 字段 | 值 |
|---|---|
| type | group |
| name | 身份权限 |
| code | identity_access |
| path | - |
| i18n | menu.platform.identity_access |
| status | active |
| description | 面向平台内部管理员、平台角色和权限策略的统一治理。 |

#### 3.2.1 平台用户

| 字段 | 值 |
|---|---|
| type | menu |
| name | 平台用户 |
| code | platform_admin |
| path | /platform-admins |
| i18n | menu.platform.admin_user |
| status | active |
| description | 管理平台自治域内部用户，不面向租户最终用户。 |

#### 3.2.2 平台角色

| 字段 | 值 |
|---|---|
| type | menu |
| name | 平台角色 |
| code | platform_role |
| path | /admin-roles |
| i18n | menu.platform.admin_role |
| status | active |
| description | 管理平台内部角色，包括预置角色、自定义角色、角色状态与角色授权。 |

#### 3.2.3 权限策略

| 字段 | 值 |
|---|---|
| type | menu |
| name | 权限策略 |
| code | permission_policy |
| path | /admin-permissions |
| i18n | menu.platform.permission_policy |
| status | active |
| description | 管理平台自治域权限点、权限分组、策略绑定与授权范围。 |

---

### 3.3 平台资源

| 字段 | 值 |
|---|---|
| type | group |
| name | 平台资源 |
| code | platform_resource |
| path | - |
| i18n | menu.platform.platform_resource |
| status | active |
| description | 管理平台级基础资源、能力网关与敏感资源。 |

#### 3.3.1 模型网关

| 字段 | 值 |
|---|---|
| type | menu |
| name | 模型网关 |
| code | model_gateway |
| path | /model-gateway |
| i18n | menu.platform.model_gateway |
| status | active |
| description | 管理大模型供应商、模型路由、调用策略、限流策略与可用性状态。 |

#### 3.3.2 密钥管理

| 字段 | 值 |
|---|---|
| type | menu |
| name | 密钥管理 |
| code | secret_store |
| path | /platform-secrets |
| i18n | menu.platform.secret_store |
| status | active |
| description | 管理平台级密钥、访问凭证、服务令牌和敏感配置引用。 |

---

### 3.4 运行保障

| 字段 | 值 |
|---|---|
| type | group |
| name | 运行保障 |
| code | runtime_ops |
| path | - |
| i18n | menu.platform.runtime_ops |
| status | active |
| description | 面向平台运行状态、后台任务与可靠性治理。 |

#### 3.4.1 服务监控

| 字段 | 值 |
|---|---|
| type | menu |
| name | 服务监控 |
| code | service_monitor |
| path | /service-monitor |
| i18n | menu.platform.service_monitor |
| status | active |
| description | 查看服务健康状态、接口可用性、异常趋势和核心运行指标。 |

#### 3.4.2 任务调度

| 字段 | 值 |
|---|---|
| type | menu |
| name | 任务调度 |
| code | job_scheduler |
| path | /platform-jobs |
| i18n | menu.platform.job_scheduler |
| status | active |
| description | 管理平台后台任务、异步队列、执行记录、失败重试与调度状态。 |

---

### 3.5 安全审计

| 字段 | 值 |
|---|---|
| type | group |
| name | 安全审计 |
| code | security_audit |
| path | - |
| i18n | menu.platform.security_audit |
| status | active |
| description | 面向平台安全、审计追踪和敏感操作审批。 |

#### 3.5.1 审计日志

| 字段 | 值 |
|---|---|
| type | menu |
| name | 审计日志 |
| code | audit_log |
| path | /audit-logs |
| i18n | menu.platform.audit_log |
| status | active |
| description | 查询平台操作日志、登录日志、权限变更日志和安全事件日志。 |

#### 3.5.2 审批中心

| 字段 | 值 |
|---|---|
| type | menu |
| name | 审批中心 |
| code | approval_flow |
| path | /approval-center |
| i18n | menu.platform.approval_flow |
| status | active |
| description | 处理敏感操作审批、权限申请、密钥申请和高风险变更确认。 |

---

### 3.6 系统配置（待建设）

| 字段 | 值 |
|---|---|
| type | group |
| name | 系统配置 |
| code | system_setting |
| path | - |
| i18n | menu.platform.system_setting |
| status | planned |
| description | 待建设模块，用于承载平台级参数、字典、功能开关等全局配置能力。 |

#### 3.6.1 参数配置（待建设）

| 字段 | 值 |
|---|---|
| type | menu |
| name | 参数配置 |
| code | system_parameter |
| path | /system-parameters |
| i18n | menu.platform.system_parameter |
| status | planned |
| description | 待建设模块，用于维护平台级参数、默认值、运行参数和全局策略参数。 |

#### 3.6.2 字典管理（待建设）

| 字段 | 值 |
|---|---|
| type | menu |
| name | 字典管理 |
| code | data_dictionary |
| path | /data-dictionaries |
| i18n | menu.platform.data_dictionary |
| status | planned |
| description | 待建设模块，用于维护系统字典、枚举项、业务选项和可配置静态数据。 |

#### 3.6.3 开关控制（待建设）

| 字段 | 值 |
|---|---|
| type | menu |
| name | 开关控制 |
| code | feature_toggle |
| path | /feature-toggles |
| i18n | menu.platform.feature_toggle |
| status | planned |
| description | 待建设模块，用于控制平台功能开关、灰度开关、实验开关和风险隔离开关。 |

---

## 4. 推荐排序

```text
1. 平台总览
2. 身份权限
3. 平台资源
4. 运行保障
5. 安全审计
6. 系统配置（待建设）
```

说明：

- 平台总览作为自治域入口，置顶。
- 身份权限优先级最高，是平台自治的基础。
- 平台资源承载模型、密钥等核心基础能力。
- 运行保障承载服务可靠性。
- 安全审计承载合规、追踪和审批。
- 系统配置作为待建设能力放在末尾，避免干扰当前核心流程。

---

## 5. AI Coding 执行要求

### 5.1 需要统一替换的旧名称

| 旧名称 | 新名称 |
|---|---|
| 身份与权限 | 身份权限 |
| 用户管理 | 平台用户 |
| 角色权限 | 平台角色 |
| 权限管理 | 权限策略 |
| 模型接入 | 模型网关 |
| 密钥配置 | 密钥管理 |
| 运行与可靠性 | 运行保障 |
| 任务队列 | 任务调度 |
| 安全与审计 | 安全审计 |

### 5.2 保留路径

现有已实现页面路径原则上保持不变：

```text
/platform
/platform-admins
/admin-roles
/admin-permissions
/model-gateway
/platform-secrets
/service-monitor
/platform-jobs
/audit-logs
/approval-center
```

新增待建设路径：

```text
/system-parameters
/data-dictionaries
/feature-toggles
```

### 5.3 建设状态

- `active`：当前主菜单，正常展示
- `planned`：待建设，可展示但需要有“待建设”状态标识，也可根据产品阶段隐藏
- 禁止删除 planned 菜单定义，后续数据库和权限模型需要预留

### 5.4 前端实现建议

- 菜单渲染统一从配置或数据库读取
- 中文名称只作为默认文案，不作为逻辑判断依据
- 前端展示优先读取 i18n key
- 权限判断优先使用 code
- 路由跳转使用 path
- planned 菜单建议显示轻量 Badge：`待建设`

---

## 6. 菜单初始化数据参考

```ts
export const platformAutonomyMenus = [
  {
    type: 'menu',
    name: '平台总览',
    code: 'platform_overview',
    path: '/platform',
    i18nKey: 'menu.platform.overview',
    status: 'active',
  },
  {
    type: 'group',
    name: '身份权限',
    code: 'identity_access',
    i18nKey: 'menu.platform.identity_access',
    status: 'active',
    children: [
      {
        type: 'menu',
        name: '平台用户',
        code: 'platform_admin',
        path: '/platform-admins',
        i18nKey: 'menu.platform.admin_user',
        status: 'active',
      },
      {
        type: 'menu',
        name: '平台角色',
        code: 'platform_role',
        path: '/admin-roles',
        i18nKey: 'menu.platform.admin_role',
        status: 'active',
      },
      {
        type: 'menu',
        name: '权限策略',
        code: 'permission_policy',
        path: '/admin-permissions',
        i18nKey: 'menu.platform.permission_policy',
        status: 'active',
      },
    ],
  },
  {
    type: 'group',
    name: '平台资源',
    code: 'platform_resource',
    i18nKey: 'menu.platform.platform_resource',
    status: 'active',
    children: [
      {
        type: 'menu',
        name: '模型网关',
        code: 'model_gateway',
        path: '/model-gateway',
        i18nKey: 'menu.platform.model_gateway',
        status: 'active',
      },
      {
        type: 'menu',
        name: '密钥管理',
        code: 'secret_store',
        path: '/platform-secrets',
        i18nKey: 'menu.platform.secret_store',
        status: 'active',
      },
    ],
  },
  {
    type: 'group',
    name: '运行保障',
    code: 'runtime_ops',
    i18nKey: 'menu.platform.runtime_ops',
    status: 'active',
    children: [
      {
        type: 'menu',
        name: '服务监控',
        code: 'service_monitor',
        path: '/service-monitor',
        i18nKey: 'menu.platform.service_monitor',
        status: 'active',
      },
      {
        type: 'menu',
        name: '任务调度',
        code: 'job_scheduler',
        path: '/platform-jobs',
        i18nKey: 'menu.platform.job_scheduler',
        status: 'active',
      },
    ],
  },
  {
    type: 'group',
    name: '安全审计',
    code: 'security_audit',
    i18nKey: 'menu.platform.security_audit',
    status: 'active',
    children: [
      {
        type: 'menu',
        name: '审计日志',
        code: 'audit_log',
        path: '/audit-logs',
        i18nKey: 'menu.platform.audit_log',
        status: 'active',
      },
      {
        type: 'menu',
        name: '审批中心',
        code: 'approval_flow',
        path: '/approval-center',
        i18nKey: 'menu.platform.approval_flow',
        status: 'active',
      },
    ],
  },
  {
    type: 'group',
    name: '系统配置',
    code: 'system_setting',
    i18nKey: 'menu.platform.system_setting',
    status: 'planned',
    children: [
      {
        type: 'menu',
        name: '参数配置',
        code: 'system_parameter',
        path: '/system-parameters',
        i18nKey: 'menu.platform.system_parameter',
        status: 'planned',
      },
      {
        type: 'menu',
        name: '字典管理',
        code: 'data_dictionary',
        path: '/data-dictionaries',
        i18nKey: 'menu.platform.data_dictionary',
        status: 'planned',
      },
      {
        type: 'menu',
        name: '开关控制',
        code: 'feature_toggle',
        path: '/feature-toggles',
        i18nKey: 'menu.platform.feature_toggle',
        status: 'planned',
      },
    ],
  },
]
```

---

## 7. 最终结论

平台自治域最终采用：

```text
平台总览
身份权限
平台资源
运行保障
安全审计
系统配置（待建设）
```

菜单统一采用四字对象命名，系统配置作为待建设能力并入整体菜单体系，后续可直接扩展为平台参数、系统字典和功能开关能力。
