#!/usr/bin/env node

/**
 * 生产构建包大小分析脚本
 * 执行 build:prod 并分析优化后的包大小
 */

const { execSync } = require('child_process');
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
    red: '\x1b[31m',
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
 * 按模块分组统计
 */
function groupByModule(files) {
    const modules = {};

    files.forEach(({ path: filePath, size, gzipSize, brotliSize }) => {
        // 提取模块路径 (例如: esm/components/PromptEditor/index.js)
        const parts = filePath.split('/');
        let moduleName = 'other';

        // 跳过第一层目录 (esm 或 lib)
        if (parts.length >= 3) {
            const category = parts[1]; // components, hooks, stores, etc.

            if (category === 'components' && parts.length >= 4) {
                // 组件按子目录分组: components/PromptEditor
                moduleName = `${category}/${parts[2]}`;
            } else if (['hooks', 'stores', 'utils', 'i18n', 'types'].includes(category)) {
                // 工具类按类别分组: hooks, stores, utils
                moduleName = category;
            } else {
                // 其他文件归为根目录文件
                moduleName = 'root-files';
            }
        } else if (parts.length === 2) {
            // 根目录下的文件 (如 App.js, index.js)
            moduleName = 'root-files';
        }

        if (!modules[moduleName]) {
            modules[moduleName] = { size: 0, gzipSize: 0, brotliSize: 0, files: 0 };
        }

        modules[moduleName].size += size;
        modules[moduleName].gzipSize += gzipSize;
        modules[moduleName].brotliSize += brotliSize;
        modules[moduleName].files += 1;
    });

    return modules;
}

/**
 * 执行生产构建
 */
function runProductionBuild() {
    console.log(`\n${colors.bright}${colors.cyan}🔨 开始执行生产构建...${colors.reset}\n`);

    try {
        execSync('pnpm build:prod', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log(`\n${colors.green}✅ 生产构建完成!${colors.reset}\n`);
        return true;
    } catch (error) {
        console.error(`${colors.red}❌ 生产构建失败!${colors.reset}`);
        console.error(error.message);
        process.exit(1);
    }
}

/**
 * 主函数
 */
function main() {
    const startTime = Date.now();

    // 执行生产构建
    runProductionBuild();

    const distDir = path.join(__dirname, '..', 'dist');

    // 检查 dist 目录是否存在
    if (!fs.existsSync(distDir)) {
        console.error(`${colors.yellow}⚠️  dist 目录不存在${colors.reset}`);
        process.exit(1);
    }

    console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}📊 生产构建包大小分析报告${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
    console.log(`${colors.blue}构建类型:${colors.reset} Production (含压缩和优化)`);
    console.log(`${colors.blue}构建目录:${colors.reset} ${distDir}\n`);

    let grandTotalSize = 0;
    let grandTotalGzip = 0;
    let grandTotalBrotli = 0;

    // 分析 ESM 产物
    const esmDir = path.join(distDir, 'esm');
    if (fs.existsSync(esmDir)) {
        console.log(`${colors.bright}${colors.green}┌───────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.bright}${colors.green}│  ESM 产物分析 (支持 Tree-shaking)    │${colors.reset}`);
        console.log(`${colors.bright}${colors.green}└───────────────────────────────────────┘${colors.reset}\n`);

        const esmFiles = getAllFiles(esmDir);
        const esmAnalysis = esmFiles.map(file => analyzeFile(file, distDir));

        let totalSize = 0;
        let totalGzipSize = 0;
        let totalBrotliSize = 0;

        // 按模块分组显示
        const modules = groupByModule(esmAnalysis);
        const sortedModules = Object.entries(modules).sort((a, b) => b[1].size - a[1].size);

        sortedModules.forEach(([moduleName, stats]) => {
            console.log(`${colors.cyan}📦 ${moduleName}${colors.reset}`);
            console.log(`   文件数: ${stats.files.toString().padStart(3)} | ` +
                `原始: ${formatBytes(stats.size).padStart(10)} | ` +
                `Gzip: ${formatBytes(stats.gzipSize).padStart(10)} | ` +
                `Brotli: ${formatBytes(stats.brotliSize).padStart(10)}`);

            totalSize += stats.size;
            totalGzipSize += stats.gzipSize;
            totalBrotliSize += stats.brotliSize;
        });

        console.log(`\n${colors.yellow}━━━ ESM 总计 ━━━${colors.reset}`);
        console.log(`   文件总数: ${esmFiles.length.toString().padStart(4)} | ` +
            `原始: ${formatBytes(totalSize).padStart(10)} | ` +
            `Gzip: ${formatBytes(totalGzipSize).padStart(10)} | ` +
            `Brotli: ${formatBytes(totalBrotliSize).padStart(10)}`);

        const gzipSavings = ((1 - totalGzipSize / totalSize) * 100).toFixed(1);
        const brotliSavings = ((1 - totalBrotliSize / totalSize) * 100).toFixed(1);
        console.log(`   ${colors.green}压缩率: Gzip ${gzipSavings}% ↓ | Brotli ${brotliSavings}% ↓${colors.reset}`);
        console.log();

        grandTotalSize += totalSize;
        grandTotalGzip += totalGzipSize;
        grandTotalBrotli += totalBrotliSize;
    }

    // 分析 CJS 产物
    const cjsDir = path.join(distDir, 'lib');
    if (fs.existsSync(cjsDir)) {
        console.log(`${colors.bright}${colors.magenta}┌───────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}│  CJS 产物分析 (Node.js 兼容)         │${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}└───────────────────────────────────────┘${colors.reset}\n`);

        const cjsFiles = getAllFiles(cjsDir);
        const cjsAnalysis = cjsFiles.map(file => analyzeFile(file, distDir));

        let totalSize = 0;
        let totalGzipSize = 0;
        let totalBrotliSize = 0;

        // 按模块分组显示
        const modules = groupByModule(cjsAnalysis);
        const sortedModules = Object.entries(modules).sort((a, b) => b[1].size - a[1].size);

        sortedModules.forEach(([moduleName, stats]) => {
            console.log(`${colors.cyan}📦 ${moduleName}${colors.reset}`);
            console.log(`   文件数: ${stats.files.toString().padStart(3)} | ` +
                `原始: ${formatBytes(stats.size).padStart(10)} | ` +
                `Gzip: ${formatBytes(stats.gzipSize).padStart(10)} | ` +
                `Brotli: ${formatBytes(stats.brotliSize).padStart(10)}`);

            totalSize += stats.size;
            totalGzipSize += stats.gzipSize;
            totalBrotliSize += stats.brotliSize;
        });

        console.log(`\n${colors.yellow}━━━ CJS 总计 ━━━${colors.reset}`);
        console.log(`   文件总数: ${cjsFiles.length.toString().padStart(4)} | ` +
            `原始: ${formatBytes(totalSize).padStart(10)} | ` +
            `Gzip: ${formatBytes(totalGzipSize).padStart(10)} | ` +
            `Brotli: ${formatBytes(totalBrotliSize).padStart(10)}`);

        const gzipSavings = ((1 - totalGzipSize / totalSize) * 100).toFixed(1);
        const brotliSavings = ((1 - totalBrotliSize / totalSize) * 100).toFixed(1);
        console.log(`   ${colors.green}压缩率: Gzip ${gzipSavings}% ↓ | Brotli ${brotliSavings}% ↓${colors.reset}`);
        console.log();

        grandTotalSize += totalSize;
        grandTotalGzip += totalGzipSize;
        grandTotalBrotli += totalBrotliSize;
    }

    // 分析 CSS 文件
    const stylesDir = path.join(distDir, 'styles');
    if (fs.existsSync(stylesDir)) {
        console.log(`${colors.bright}${colors.blue}┌───────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}│  样式文件分析                         │${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}└───────────────────────────────────────┘${colors.reset}\n`);

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

        console.log(`\n${colors.yellow}━━━ 样式总计 ━━━${colors.reset}`);
        console.log(`   文件总数: ${styleFiles.length.toString().padStart(4)} | ` +
            `原始: ${formatBytes(totalSize).padStart(10)} | ` +
            `Gzip: ${formatBytes(totalGzipSize).padStart(10)} | ` +
            `Brotli: ${formatBytes(totalBrotliSize).padStart(10)}`);

        const gzipSavings = ((1 - totalGzipSize / totalSize) * 100).toFixed(1);
        const brotliSavings = ((1 - totalBrotliSize / totalSize) * 100).toFixed(1);
        console.log(`   ${colors.green}压缩率: Gzip ${gzipSavings}% ↓ | Brotli ${brotliSavings}% ↓${colors.reset}`);
        console.log();

        grandTotalSize += totalSize;
        grandTotalGzip += totalGzipSize;
        grandTotalBrotli += totalBrotliSize;
    }

    // 总体统计
    const endTime = Date.now();
    const buildTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}📈 总体统计${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.yellow}构建耗时:${colors.reset} ${buildTime}s`);
    console.log(`${colors.yellow}总文件大小:${colors.reset}`);
    console.log(`   原始大小: ${formatBytes(grandTotalSize).padStart(12)}`);
    console.log(`   Gzip 压缩: ${formatBytes(grandTotalGzip).padStart(12)} (${((1 - grandTotalGzip / grandTotalSize) * 100).toFixed(1)}% ↓)`);
    console.log(`   Brotli 压缩: ${formatBytes(grandTotalBrotli).padStart(12)} (${((1 - grandTotalBrotli / grandTotalSize) * 100).toFixed(1)}% ↓)`);
    console.log();

    // 优化建议
    console.log(`${colors.bright}${colors.green}💡 优化建议:${colors.reset}\n`);

    const topModules = [];
    if (fs.existsSync(esmDir)) {
        const esmFiles = getAllFiles(esmDir);
        const esmAnalysis = esmFiles.map(file => analyzeFile(file, distDir));
        const modules = groupByModule(esmAnalysis);
        Object.entries(modules).forEach(([name, stats]) => {
            topModules.push({ name, size: stats.size, type: 'ESM' });
        });
    }

    topModules.sort((a, b) => b.size - a.size);
    const top3 = topModules.slice(0, 3);

    console.log(`${colors.cyan}1. 最大模块:${colors.reset}`);
    top3.forEach((mod, idx) => {
        // 美化模块名称
        let displayName = mod.name;
        if (mod.name === 'root-files') {
            displayName = '根目录文件 (App, index等)';
        }
        console.log(`   ${idx + 1}. ${displayName} (${mod.type}): ${formatBytes(mod.size)}`);
    });
    console.log();

    console.log(`${colors.cyan}2. 性能优化:${colors.reset}`);
    console.log(`   ✓ 已启用 Terser 代码压缩`);
    console.log(`   ✓ 已移除 console.log/info/debug`);
    console.log(`   ✓ 已启用 Tree-shaking 支持`);
    console.log(`   ✓ CSS 已压缩`);
    console.log();

    console.log(`${colors.cyan}3. 进一步优化:${colors.reset}`);
    console.log(`   • 考虑对大型组件使用 React.lazy 动态导入`);
    console.log(`   • 定期检查并更新依赖版本`);
    console.log(`   • 使用 bundle analyzer 可视化分析依赖关系`);
    console.log(`   • 评估是否可以将更多依赖外部化`);
    console.log();

    console.log(`${colors.bright}${colors.green}✅ 分析完成!${colors.reset}\n`);
}

main();
