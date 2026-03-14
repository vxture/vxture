#!/usr/bin/env node
/**
 * 批量更新 Vxture 包的文件头注释
 * 按照 claude-coding-comments.md 规范执行
 */

const fs = require('fs');
const path = require('path');

// 包配置
const packages = [
  {
    name: '@vxture/shared',
    baseDir: path.join(__dirname, 'packages', 'shared', 'shared', 'src'),
    layer: 'Shared',
    categories: {
      constants: 'Constants',
      types: 'Types',
      utils: 'Utils'
    }
  },
  {
    name: '@vxture/core-config',
    baseDir: path.join(__dirname, 'packages', 'core', 'config', 'src'),
    layer: 'Infrastructure',
    categories: {
      schemas: 'Schemas',
      module: 'Module',
      service: 'Service',
      types: 'Types'
    }
  },
  {
    name: '@vxture/core-utils',
    baseDir: path.join(__dirname, 'packages', 'core', 'utils', 'src'),
    layer: 'Infrastructure',
    categories: {
      utils: 'Utils',
      types: 'Types'
    }
  },
  {
    name: '@vxture/core-locale',
    baseDir: path.join(__dirname, 'packages', 'core', 'locale', 'src'),
    layer: 'Infrastructure',
    categories: {
      utils: 'Utils',
      types: 'Types'
    }
  }
];

// 获取文件分类
function getCategory(filePath, pkg) {
  const relPath = path.relative(pkg.baseDir, filePath);
  const parts = relPath.split(path.sep);
  if (parts.length > 1) {
    const dirName = parts[0];
    if (pkg.categories[dirName]) {
      return pkg.categories[dirName];
    }
  }
  return 'Entry';
}

// 提取现有描述
function extractExistingDescription(content) {
  const match = content.match(/@description\s+([^*]+)/);
  if (match) {
    return match[1].trim();
  }
  return '';
}

// 提取文件名中的简短描述
function getShortDescription(fileName) {
  const baseName = path.basename(fileName, '.ts');
  const parts = baseName.split('.');
  if (parts.length >= 2) {
    const type = parts[1];
    const name = parts[0];
    const descriptions = {
      constants: '相关常量',
      types: '相关类型',
      utils: '相关工具',
      index: '出口'
    };
    if (type === 'index') {
      return name + descriptions[type];
    }
    return name + descriptions[type] || baseName;
  }
  return baseName;
}

// 生成文件头
function generateHeader(filePath, pkg) {
  const fileName = path.basename(filePath);
  const category = getCategory(filePath, pkg);
  const shortDesc = getShortDescription(fileName);

  return `/**
 * ${fileName} - ${shortDesc}
 * @package ${pkg.name}
 * @layer ${pkg.layer}
 * @category ${category}
 * @author AI-Generated
 * @date 2026-03-14
 * @copyright Vxture Team
 * @description
 *   文件功能描述
 */
`;
}

// 处理单个文件
function processFile(filePath, pkg) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否有文件头
    if (content.startsWith('/**')) {
      // 找到现有文件头结束位置
      const headerEnd = content.indexOf('*/') + 2;
      const restOfFile = content.substring(headerEnd).trim();

      // 生成新文件头
      const newHeader = generateHeader(filePath, pkg);
      const newContent = newHeader + '\n' + restOfFile;

      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ 更新: ${filePath}`);
      return true;
    } else {
      console.log(`! 跳过（无文件头）: ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`✗ 错误: ${filePath}`, err.message);
    return false;
  }
}

// 递归遍历目录
function traverseDirectory(dir, pkg, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      traverseDirectory(filePath, pkg, callback);
    } else if (file.endsWith('.ts')) {
      callback(filePath, pkg);
    }
  });
}

// 主函数
function main() {
  console.log('开始批量更新文件头...\n');
  let updatedCount = 0;
  let skippedCount = 0;

  packages.forEach(pkg => {
    console.log(`\n处理包: ${pkg.name}`);
    console.log('='.repeat(60));

    if (fs.existsSync(pkg.baseDir)) {
      traverseDirectory(pkg.baseDir, pkg, (filePath, pkg) => {
        const success = processFile(filePath, pkg);
        if (success) updatedCount++;
        else skippedCount++;
      });
    } else {
      console.log(`! 目录不存在: ${pkg.baseDir}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`完成! 更新: ${updatedCount}, 跳过: ${skippedCount}`);
}

main();
