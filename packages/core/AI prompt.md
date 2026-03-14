我需要把 core-* 包的所有文件注释都改成这个风格。
/**
 * filename.ts - 配置模块
 * @package @vxture/{package-name}
 * @description
 *   NestJS 配置模块，负责加载和解析环境变量
 */


遵循 docs\standards\Vxture-git-workflow-Specification.md
仅对 core-auth 执行：git status, add, commit, and push.
其他包的变更仅执行：git status, add, don't commit, don't push


严格按照：core-config 包的三个配置文件 package.json, tsconfig.json, tsup.config.ts
严格修订：core-tenant 包的三个对应文件，要求内容高度一致，除了依赖按需调整。


严格按照以下模式，给scr/* 的源文件修正文件头注释，不要使用脚本，会导致代码出错
/**
 * index.ts - 语言常量导出
 * @package @vxture/core-locale
 * @description
 *   语言常量统一导出
 */



 tenant
 P3: 修正
 P7: 修正
 P5: 修正
 P6: 修正
 P8: 修正
 P9: 修正
 P12: 修正
 P1、2、10、11、13忽略
