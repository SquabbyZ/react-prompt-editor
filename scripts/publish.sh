#!/bin/bash

# React Prompt Editor 发布脚本
# 使用方法: 
#   ./scripts/publish.sh          # 发布正式版本
#   ./scripts/publish.sh beta     # 发布 beta 版本
#   ./scripts/publish.sh alpha    # 发布 alpha 版本

set -e  # 遇到错误立即退出

TAG=${1:-latest}

echo "🚀 开始发布 react-prompt-editor (tag: $TAG)"
echo ""

# 1. 检查当前分支
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo "⚠️  警告: 当前不在 main/master 分支上 (当前: $BRANCH)"
  read -p "是否继续? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 发布取消"
    exit 1
  fi
fi

# 2. 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 错误: 有未提交的更改，请先提交或暂存"
  git status
  exit 1
fi

# 3. 清理并重新构建
echo "🔨 清理缓存..."
pnpm clean-cache

echo "🔨 执行生产构建..."
pnpm build:prod

# 4. 运行检查
echo "🔍 运行 doctor 检查..."
pnpm doctor

# 5. 运行测试
echo "🧪 运行测试..."
pnpm test

# 6. 显示将要发布的内容
echo ""
echo "📦 将要发布的文件:"
npm pack --dry-run

echo ""
read -p "确认发布? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 发布取消"
  exit 1
fi

# 7. 发布
echo ""
echo "📤 发布到 npm (tag: $TAG)..."
if [ "$TAG" = "latest" ]; then
  npm publish
else
  npm publish --tag $TAG
fi

echo ""
echo "✅ 发布成功!"
echo ""
echo "📝 后续步骤:"
echo "1. 创建 Git tag: git tag v$(node -p \"require('./package.json').version\")"
echo "2. 推送 tag: git push origin v$(node -p \"require('./package.json').version\")"
echo "3. 创建 GitHub Release"
echo ""
echo "🔗 查看包: https://www.npmjs.com/package/react-prompt-editor"
