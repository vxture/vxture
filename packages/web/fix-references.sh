#!/bin/bash
# 批量修复引用路径脚本

echo "开始批量修复引用路径..."

# 进入项目目录
cd "D:\MyWebSite\vxture\packages\web\src"

# 修复 @/hooks/ 引用
echo "修复 @/hooks/ 引用..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s|from '@/hooks/|from '@/application/hooks/|g" {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|from "@/hooks/|from "@/application/hooks/|g' {} +

# 修复 @/components/ 引用
echo "修复 @/components/ 引用..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s|from '@/components/|from '@/Presentation/components/|g" {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|from "@/components/|from "@/Presentation/components/|g' {} +

# 修复 @/theme/ 引用
echo "修复 @/theme/ 引用..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s|from '@/theme/|from '@/shared/theme/|g" {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|from "@/theme/|from "@/shared/theme/|g' {} +

echo "修复完成！"