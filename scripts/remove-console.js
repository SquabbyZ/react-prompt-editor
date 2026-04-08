#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理 dist 目录中的 console 语句...\n');

let totalFiles = 0;
let modifiedFiles = 0;
let removedCount = 0;

function removeConsoleFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  const consoleMatches = content.match(/console\.(log|info|debug)\([^)]*\);?/g);
  if (consoleMatches) {
    removedCount += consoleMatches.length;
  }
  
  content = content.replace(/console\.(log|info|debug)\([^)]*\);?\s*/g, '');
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '__tests__'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      totalFiles++;
      if (removeConsoleFromFile(filePath)) {
        modifiedFiles++;
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`  ✓ 已清理: ${relativePath}`);
      }
    }
  });
}

const distPath = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist 目录不存在，请先运行 pnpm build');
  process.exit(1);
}

console.log(`📁 扫描目录: ${distPath}\n`);
processDirectory(distPath);

console.log('\n' + '='.repeat(50));
console.log('📊 清理统计:');
console.log(`   总文件数: ${totalFiles}`);
console.log(`   修改文件: ${modifiedFiles}`);
console.log(`   移除 console: ${removedCount} 处`);
console.log('='.repeat(50));

if (removedCount > 0) {
  console.log('\n✅ Console 清理完成！');
  console.log('💡 提示: console.warn 和 console.error 已保留用于错误追踪\n');
} else {
  console.log('\n✨ 未发现需要清理的 console 语句\n');
}
