我需要把 core-* 包的所有文件注释都改成这个风格。
/**
 * filename.ts - 配置模块
 * @package @vxture/{package-name}
 * @description
 *   NestJS 配置模块，负责加载和解析环境变量
 */

## 按包提交

遵循: docs\standards\Vxture-Git-Workflow-Specification.md
权限：仅对 @vxture/website-bff，update version；git status, add, commit, and push.

其他包的变更仅执行：git status, add, don't commit, don't push


严格按照：core-config 包的三个配置文件 package.json, tsconfig.json, tsup.config.ts
严格修订：core-api 包的三个对应文件，要求内容高度一致，除了依赖按需调整。
完成三个文件修订即可停止，严禁执行其他工作


遵循：docs\ai-coding\claude-coding-comments.md
严格给 core-utils/scr/* 的源文件修正文件整体注释，不要使用脚本，会导致代码出错。
注意：1需要严格遵守采用英文注释，有中文的翻译为英文 2，包括文件头，代码分区，函数参数等

/**
 * index.ts - 语言常量导出
 * @package @vxture/core-locale
 * @description
 *   语言常量统一导出
 */


检查结果
严重问题（❌）：4个，必须修复后才能进入下一阶段

shared 包导出问题：使用 export * from 破坏了 isolatedModules 规范
core-utils 枚举规范：LogLevel 使用 TypeScript enum 而不是 as const 对象
core-locale 常量重复定义：SUPPORTED_LOCALES、Locale、DEFAULT_LOCALE 在本地重复定义，未从 @vxture/shared 导入
core-utils 类型导入问题：错误类相关类型未正确使用 type 导入
警告（⚠️）：7个，建议修复，不阻塞进度

整体评分：7.5分

是否通过检查：不通过（需修复严重问题）

检查重点
依赖边界：所有包均符合要求，无跨 core 包依赖
导出结构：大部分包符合单一入口原则，但 shared 包存在导出规范问题
目录职责：各目录职责明确，但 core-locale 存在常量重复定义问题
TypeScript 规范：严格模式合规，但存在 enum 使用问题
包配置：配置文件基本符合规范，但有一些小的优化空间
检查详细内容已保存在 packages/core/CHECKALL.md 文件中，包含了每个问题的具体位置和修复建议。