#!/usr/bin/env node

/**
 * 包大小分析脚本
 * 分析 dist 目录下的构建产物大小
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 颜色代码
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

/**
 * 格式化字节数
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 计算 gzip 压缩后的大小
 */
function getGzipSize(buffer) {
    return zlib.gzipSync(buffer).length;
}

/**
 * 计算 brotli 压缩后的大小
 */
function getBrotliSize(buffer) {
    return zlib.brotliCompressSync(buffer).length;
}

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, arrayOfFiles);
        } else {
            // 只分析 js 和 css 文件
            if (file.endsWith('.js') || file.endsWith('.css')) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath, baseDir) {
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const relativePath = path.relative(baseDir, filePath);

    return {
        path: relativePath,
        size: stats.size,
        gzipSize: getGzipSize(buffer),
        brotliSize: getBrotliSize(buffer),
    };
}

/**
 * 主函数
 */
function main() {
    const distDir = path.join(__dirname, '..', 'dist');

    // 检查 dist 目录是否存在
    if (!fs.existsSync(distDir)) {
        console.error(`${colors.yellow}⚠️  dist 目录不存在，请先运行构建命令${colors.reset}`);
        process.exit(1);
    }

    console.log(`\n${colors.bright}${colors.cyan}📦 包大小分析报告${colors.reset}\n`);
    console.log(`${colors.blue}构建目录:${colors.reset} ${distDir}\n`);

    // 分析 ESM 产物
    const esmDir = path.join(distDir, 'esm');
    if (fs.existsSync(esmDir)) {
        console.log(`${colors.bright}${colors.green}━━━ ESM 产物分析 ━━━${colors.reset}\n`);
        const esmFiles = getAllFiles(esmDir);
        const esmAnalysis = esmFiles.map(file => analyzeFile(file, distDir));

        let totalSize = 0;
        let totalGzipSize = 0;
        let totalBrotliSize = 0;

        esmAnalysis.forEach(({ path: filePath, size, gzipSize, brotliSize }) => {
            console.log(`${colors.cyan}📄 ${filePath}${colors.reset}`);
            console.log(`   原始大小: ${formatBytes(size).padStart(12)} | Gzip: ${formatBytes(gzipSize).padStart(12)} | Brotli: ${formatBytes(brotliSize).padStart(12)}`);

            totalSize += size;
            totalGzipSize += gzipSize;
            totalBrotliSize += brotliSize;
        });

        console.log(`\n${colors.yellow}ESM 总计:${colors.reset}`);
        console.log(`   原始大小: ${formatBytes(totalSize).padStart(12)} | Gzip: ${formatBytes(totalGzipSize).padStart(12)} | Brotli: ${formatBytes(totalBrotliSize).padStart(12)}`);
        console.log();
    }

    // 分析 CJS 产物
    const cjsDir = path.join(distDir, 'lib');
    if (fs.existsSync(cjsDir)) {
        console.log(`${colors.bright}${colors.magenta}━━━ CJS 产物分析 ━━━${colors.reset}\n`);
        const cjsFiles = getAllFiles(cjsDir);
        const cjsAnalysis = cjsFiles.map(file => analyzeFile(file, distDir));

        let totalSize = 0;
        let totalGzipSize = 0;
        let totalBrotliSize = 0;

        cjsAnalysis.forEach(({ path: filePath, size, gzipSize, brotliSize }) => {
            console.log(`${colors.cyan}📄 ${filePath}${colors.reset}`);
            console.log(`   原始大小: ${formatBytes(size).padStart(12)} | Gzip: ${formatBytes(gzipSize).padStart(12)} | Brotli: ${formatBytes(brotliSize).padStart(12)}`);

            totalSize += size;
            totalGzipSize += gzipSize;
            totalBrotliSize += brotliSize;
        });

        console.log(`\n${colors.yellow}CJS 总计:${colors.reset}`);
        console.log(`   原始大小: ${formatBytes(totalSize).padStart(12)} | Gzip: ${formatBytes(totalGzipSize).padStart(12)} | Brotli: ${formatBytes(totalBrotliSize).padStart(12)}`);
        console.log();
    }

    // 分析 CSS 文件
    const stylesDir = path.join(distDir, 'styles');
    if (fs.existsSync(stylesDir)) {
        console.log(`${colors.bright}${colors.blue}━━━ 样式文件分析 ━━━${colors.reset}\n`);
        const styleFiles = getAllFiles(stylesDir);
        const styleAnalysis = styleFiles.map(file => analyzeFile(file, distDir));

        let totalSize = 0;
        let totalGzipSize = 0;
        let totalBrotliSize = 0;

        styleAnalysis.forEach(({ path: filePath, size, gzipSize, brotliSize }) => {
            console.log(`${colors.cyan}🎨 ${filePath}${colors.reset}`);
            console.log(`   原始大小: ${formatBytes(size).padStart(12)} | Gzip: ${formatBytes(gzipSize).padStart(12)} | Brotli: ${formatBytes(brotliSize).padStart(12)}`);

            totalSize += size;
            totalGzipSize += gzipSize;
            totalBrotliSize += brotliSize;
        });

        console.log(`\n${colors.yellow}样式总计:${colors.reset}`);
        console.log(`   原始大小: ${formatBytes(totalSize).padStart(12)} | Gzip: ${formatBytes(totalGzipSize).padStart(12)} | Brotli: ${formatBytes(totalBrotliSize).padStart(12)}`);
        console.log();
    }

    console.log(`${colors.bright}${colors.green}✅ 分析完成!${colors.reset}\n`);
    console.log(`${colors.yellow}💡 优化建议:${colors.reset}`);
    console.log(`   1. 检查是否有未使用的大型依赖`);
    console.log(`   2. 考虑按需加载大型模块`);
    console.log(`   3. 确保 tree-shaking 正常工作`);
    console.log(`   4. 检查是否有重复的依赖\n`);
}

main();
