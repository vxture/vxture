## Phase 1 - Shared & Core 层规范化状态报告

**执行日期**: 2026-03-11
**当前状态**: ⏸️ 暂停中（需要用户确认）

---

### 执行顺序
1. ✅ @vxture/shared（已符合规范）
2. ⏸️ @vxture/core-config
3. ⏸️ @vxture/core-utils
4. ⏸️ @vxture/core-api
5. ⏸️ @vxture/core-auth
6. ⏸️ @vxture/core-tenant
7. ⏸️ @vxture/core-locale

---

### @vxture/shared 检查结果
✅ **已符合规范，无需重构**

- ✅ 目录结构：`types/` / `constants/` / `utils/`
- ✅ 文件命名符合规范
- ✅ 统一导出入口正常
- ✅ 文件头注释完整
- ✅ @layer 标记为 "Shared"

---

### @vxture/core-* 重构任务清单

#### 通用重构任务
- [ ] 拆分现有 `src/index.ts` 为子目录
- [ ] 创建 `client/` / `types/` / `utils/` / `context/` 目录
- [ ] 文件重命名为规范格式：`*.types.ts`、`*.client.ts`、`*.context.ts` 等
- [ ] 补充完整文件头注释（中文）
- [ ] 添加 Section 分隔注释（超过 80 行的文件）
- [ ] 修正 `@layer` 标记为 "Infrastructure"
- [ ] 更新 `src/index.ts` 为 Barrel Export
- [ ] 确保纯类型导入使用 `import type`
- [ ] 确保禁止 `any` 类型
- [ ] 为所有 export 函数添加 JSDoc

#### 各包特定规范

| 包 | 目标结构 | 注意事项 |
|----|---------|---------|
| core-api | `client/` / `types/` / `utils/` | 禁止具体业务接口 |
| core-auth | `client/` / `types/` / `utils/` | 禁止业务权限逻辑 |
| core-config | `types/` / `utils/` | 禁止业务配置逻辑 |
| core-locale | `types/` / `utils/` | 禁止业务文本内容 |
| core-tenant | `context/` / `types/` / `utils/` | 禁止租户业务规则 |
| core-utils | `types/` / `utils/` | 禁止重复 shared 的纯工具 |

---

### 技术栈约束检查

#### 允许使用
- ✅ 原生 fetch（禁止 axios）
- ✅ jsonwebtoken + @types/jsonwebtoken
- ✅ zod（仅 @vxture/shared）
- ✅ dayjs（仅 @vxture/shared）
- ✅ 原生 process.env
- ✅ 原生 Intl API

#### 严格禁止
- ❌ NestJS / Next.js / React
- ❌ Prisma / TypeORM / 任何 ORM
- ❌ class-validator / class-transformer
- ❌ axios
- ❌ dotenv
- ❌ 任何浏览器专用 API
- ❌ 任何 Node.js 专用 API

---

### 下一步操作建议

**是否继续执行 Phase 1 重构？**

建议选择：
1. 只重构 core-api 作为示例
2. 重构所有 core-* 包（完整 Phase 1）
3. 暂停，先完成 Phase 0 的遗留问题

**注意**: Phase 1 重构会修改多个包的现有代码结构，建议先确认后再执行。
