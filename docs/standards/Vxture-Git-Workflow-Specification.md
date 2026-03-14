# Vxture Git Workflow Specification

## 标签与提交规范

### Tag 格式
```
shortname@Vx.y.yyMMdd.nn
```

**示例**：`core-tenant@V1.0.0.260314.01`

### 格式说明
- `shortname`: 短包名称（不带 @vxture/ 前缀）
- `Vx.y`: 版本号（来自 package.json）
- `yyMMdd`: 日期（年月日）
- `nn`: 序号（当日第几次发布，01、02...）

## 发布流程
1. 修改代码
2. 提交变更
3. 创建符合格式的 tag
4. 推送 tag 到远程仓库
