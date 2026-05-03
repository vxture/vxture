# 钉钉登录配置占位说明

## 使用范围

钉钉三方授权只用于 `website + console` 的同一套租户用户账号体系。

禁止用于 `admin`：

- 不在 `admin-bff` 配置钉钉 OAuth。
- 不配置 `/admin-api/...` 回调地址。
- 不允许钉钉账号签发平台管理员 token。

## 环境变量

配置位置：

- 本地开发：仓库根目录 `.env.local`
- 部署示例：`bff/website-bff/.env.example`

需要填入：

```env
DINGTALK_APP_KEY=
DINGTALK_APP_SECRET=
DINGTALK_SUITE_KEY=
DINGTALK_SUITE_SECRET=
DINGTALK_CALLBACK_TOKEN=
DINGTALK_CALLBACK_AES_KEY=
DINGTALK_REDIRECT_URI=
```

企业内部应用通常填写 `DINGTALK_APP_KEY / DINGTALK_APP_SECRET`。

第三方企业应用通常填写 `DINGTALK_SUITE_KEY / DINGTALK_SUITE_SECRET`。

`CALLBACK_TOKEN` 和 `CALLBACK_AES_KEY` 用于钉钉事件回调加解密。

## OAuth 回调地址

推荐生产回调地址：

```text
https://www.vxture.com/website-api/api/auth/oauth/dingtalk/callback
```

如果生产主域不是 `www.vxture.com`，使用实际 website 域名：

```text
https://你的域名/website-api/api/auth/oauth/dingtalk/callback
```

本地走 gateway 时：

```text
http://localhost:8000/website-api/api/auth/oauth/dingtalk/callback
```

钉钉开放平台里的回调地址必须和 `DINGTALK_REDIRECT_URI` 完全一致。

## 登录流向

建议后端入口：

```text
GET /api/auth/oauth/dingtalk/start
GET /api/auth/oauth/dingtalk/callback
```

经 gateway 暴露：

```text
GET /website-api/api/auth/oauth/dingtalk/start
GET /website-api/api/auth/oauth/dingtalk/callback
```

`callback` 只允许签发租户用户会话：

- `userType = tenant_user`
- `authScope = tenant_console`
- provider = `dingtalk`

回调完成后根据 `state.returnTo` 跳转到 website 或 console。`state.returnTo` 只能允许 `website`、`console`，不能接受 `admin`。
