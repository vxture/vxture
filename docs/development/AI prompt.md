我需要把 core-\* 包的所有文件注释都改成这个风格。
/\*\*

- filename.ts - 配置模块
- @package @vxture/{package-name}
- @description
- NestJS 配置模块，负责加载和解析环境变量
  \*/

## 按包提交

遵循: docs\standards\Vxture-Git-Workflow-Specification.md
权限：仅对 @vxture/shared 操作，须严格遵循至任务结束，禁止越界操作
任务：

1. update version ->1.2.2
2. git status, add all, commit, and push

---

其他包的变更仅执行：git status, add, don't commit, don't push

## 统一注释

遵循：docs\ai-coding\claude-coding-comments.md
权限：仅对 @vxture/core-locale/ 包操作，须严格遵循至任务结束，禁止越界操作
任务：严格给包内/scr/\*源文件完善注释，不要使用脚本，会导致代码出错。
注意: 1. 需要严格遵守采用英文注释，有中文的翻译为英文 2. 包括文件头，代码分区，函数参数等 3. 无逻辑和具体业务内容，非常简单的文件头适合simple style

/\*\*

- index.ts - 语言常量导出
- @package @vxture/core-locale
- @description
- 语言常量统一导出
  \*/

---

## 统一配置

严格按照：core-config 包的三个配置文件 package.json, tsconfig.json, tsup.config.ts
严格修订：design-system 包的三个对应文件，要求内容高度一致，除了依赖按需调整。
完成三个文件修订即可停止，严禁执行其他工作
