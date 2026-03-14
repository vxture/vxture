#!/usr/bin/env node
/**
 * 严格按照 claude-coding-comments.md 规范更新文件头
 * 支持 Full Style 和 Simple Style
 */

const fs = require('fs');
const path = require('path');

// 包配置
const packages = [
  {
    name: '@vxture/shared',
    baseDir: path.join(__dirname, 'packages', 'shared', 'shared', 'src'),
  },
  {
    name: '@vxture/core-config',
    baseDir: path.join(__dirname, 'packages', 'core', 'config', 'src'),
  },
  {
    name: '@vxture/core-utils',
    baseDir: path.join(__dirname, 'packages', 'core', 'utils', 'src'),
  },
  {
    name: '@vxture/core-locale',
    baseDir: path.join(__dirname, 'packages', 'core', 'locale', 'src'),
  }
];

// 文件分类（用于确定使用哪种风格）
const complexFilePatterns = [
  '*.schema.ts',
  '*.service.ts',
  '*.module.ts',
  '*config*',
  '*service*',
  '*module*',
  '*.utils.ts'
];

// 判断是否应该使用 Full Style
function useFullStyle(filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  return complexFilePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(fileName);
  });
}

// 生成 Simple Style 文件头
function generateSimpleStyle(filePath, packageName) {
  const fileName = path.basename(filePath);
  const shortDesc = getShortDescription(fileName);

  return `/**
 * ${fileName} - ${shortDesc}
 * @package ${packageName}
 * @description
 *   文件功能描述
 */
`;
}

// 生成 Full Style 文件头
function generateFullStyle(filePath, packageName) {
  const fileName = path.basename(filePath);
  const shortDesc = getShortDescription(fileName);

  return `/**
 * ${fileName} - ${shortDesc}
 * @package ${packageName}
 * @description
 *   文件功能描述
 *
 * @author AI-Generated
 * @date 2026-03-14
 * @copyright Vxture Team
 */
`;
}

// 获取文件的简短描述
function getShortDescription(fileName) {
  const namePart = path.basename(fileName, '.ts');

  if (namePart.includes('.')) {
    const [prefix, suffix] = namePart.split('.');
    if (suffix === 'constants') return prefix + ' constants';
    if (suffix === 'types') return prefix + ' types';
    if (suffix === 'utils') return prefix + ' utils';
    if (suffix === 'schema') return prefix + ' schema';
  }

  if (namePart === 'index') {
    const dirName = path.dirname(filePath).split(path.sep).pop();
    if (dirName) return dirName + ' export';
    return 'main export';
  }

  return namePart;
}

// 更新单个文件的文件头
function updateFileHeader(filePath, packageName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 判断是否已经有规范的文件头
    if (hasValidHeader(content)) {
      return false; // 已符合规范，跳过
    }

    // 移除旧文件头
    const contentWithoutHeader = removeOldHeader(content);

    // 生成新文件头
    const style = useFullStyle(filePath) ? 'full' : 'simple';
    const newHeader = style === 'full'
      ? generateFullStyle(filePath, packageName)
      : generateSimpleStyle(filePath, packageName);

    // 合并内容
    const updatedContent = newHeader + contentWithoutHeader;

    // 写入更新后的内容
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// 判断是否有符合规范的文件头
function hasValidHeader(content) {
  if (!content.startsWith('/**')) return false;

  // 检查是否包含规范字段
  const hasPackage = /@package\s+@vxture\//.test(content);
  const hasDescription = /@description/.test(content);

  return hasPackage;
}

// 移除旧文件头
function removeOldHeader(content) {
  if (!content.startsWith('/**')) return content;

  const endIndex = content.indexOf('*/') + 2;
  return content.slice(endIndex).trimStart();
}

// 递归遍历目录
function traverseDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath, callback);
    } else if (fullPath.endsWith('.ts')) {
      callback(fullPath);
    }
  });
}

// 主函数
function main() {
  console.log('开始严格按照规范更新文件头...');
  let updatedCount = 0;
  let skippedCount = 0;

  packages.forEach(pkg => {
    console.log(`\n处理包: ${pkg.name}`);
    console.log('-------------------------');

    if (fs.existsSync(pkg.baseDir)) {
      traverseDirectory(pkg.baseDir, (filePath) => {
        const updated = updateFileHeader(filePath, pkg.name);
        if (updated) updatedCount++;
        else skippedCount++;
      });
    }
  });

  console.log(`\n完成! 更新: ${updatedCount} 个, 跳过: ${skippedCount} 个`);
}

main();
