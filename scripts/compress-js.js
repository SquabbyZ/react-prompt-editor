#!/usr/bin/env node

/**
 * 生产环境代码压缩和优化脚本
 * 对构建后的 JavaScript 文件进行压缩处理
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗜️  开始压缩和优化构建产物...\n');

// 检查是否安装了 terser
let terserAvailable = false;
try {
    require.resolve('terser');
    terserAvailable = true;
} catch (e) {
    console.log('⚠️  terser 未安装，尝试安装...');
    try {
        execSync('npm install --save-dev terser', { stdio: 'inherit' });
        terserAvailable = true;
        console.log('✅ terser 安装成功\n');
    } catch (error) {
        console.error('❌ 无法安装 terser，请手动安装: npm install --save-dev terser');
        process.exit(1);
    }
}

if (!terserAvailable) {
    console.error('❌ terser 不可用，退出压缩流程');
    process.exit(1);
}

const Terser = require('terser');

let totalFiles = 0;
let compressedFiles = 0;
let totalSavedBytes = 0;

/**
 * 压缩单个 JavaScript 文件
 */
async function compressFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        // 使用 Terser 压缩代码
        const result = await Terser.minify(content, {
            compress: {
                drop_console: false, // 保留 console.warn 和 console.error
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'], // 只移除这些 console
                dead_code: true, // 移除死代码
                unused: true, // 移除未使用的变量和函数
                passes: 2, // 多次压缩以获得更好的效果
            },
            mangle: {
                toplevel: true, // 混淆顶级作用域变量名
                properties: false, // 不混淆属性名（避免破坏 API）
            },
            format: {
                comments: false, // 移除注释
                beautify: false,
            },
            ecma: 2015, // ES6+ 支持
        });

        if (result.code) {
            const originalSize = Buffer.byteLength(content, 'utf-8');
            const compressedSize = Buffer.byteLength(result.code, 'utf-8');
            const savedBytes = originalSize - compressedSize;

            fs.writeFileSync(filePath, result.code, 'utf-8');

            totalFiles++;
            compressedFiles++;
            totalSavedBytes += savedBytes;

            const savedPercent = ((savedBytes / originalSize) * 100).toFixed(2);
            const relativePath = path.relative(process.cwd(), filePath);

            console.log(`  ✓ ${relativePath}`);
            console.log(`    原始: ${(originalSize / 1024).toFixed(2)} KB → 压缩: ${(compressedSize / 1024).toFixed(2)} KB (节省 ${savedPercent}%)`);

            return true;
        }
    } catch (error) {
        console.error(`  ✗ 压缩失败: ${filePath}`);
        console.error(`    错误: ${error.message}`);
        return false;
    }
}

/**
 * 递归处理目录中的所有 JS 文件
 */
async function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 跳过不需要处理的目录
            if (!['node_modules', '.git', '__tests__', '__mocks__'].includes(file)) {
                await processDirectory(filePath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
            await compressFile(filePath);
        }
    }
}

/**
 * 主函数
 */
async function main() {
    const distPath = path.join(__dirname, '..', 'dist');

    if (!fs.existsSync(distPath)) {
        console.error('❌ dist 目录不存在，请先运行 pnpm build');
        process.exit(1);
    }

    console.log(`📁 扫描目录: ${distPath}\n`);

    // 压缩 ESM 产物
    const esmPath = path.join(distPath, 'esm');
    if (fs.existsSync(esmPath)) {
        console.log('📦 压缩 ESM 产物...');
        await processDirectory(esmPath);
        console.log();
    }

    // 压缩 CJS 产物
    const cjsPath = path.join(distPath, 'lib');
    if (fs.existsSync(cjsPath)) {
        console.log('📦 压缩 CJS 产物...');
        await processDirectory(cjsPath);
        console.log();
    }

    // 输出统计信息
    console.log('='.repeat(60));
    console.log('📊 压缩统计:');
    console.log(`   总文件数: ${totalFiles}`);
    console.log(`   成功压缩: ${compressedFiles}`);
    console.log(`   节省空间: ${(totalSavedBytes / 1024).toFixed(2)} KB (${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB)`);
    console.log('='.repeat(60));

    if (compressedFiles > 0) {
        console.log('\n✅ 代码压缩完成！');
        console.log('💡 提示: 已移除 console.log/info/debug，保留 warn/error 用于错误追踪\n');
    } else {
        console.log('\n✨ 没有需要压缩的文件\n');
    }
}

main().catch(error => {
    console.error('❌ 压缩过程出错:', error);
    process.exit(1);
});
