#!/usr/bin/env node

/**
 * 依赖外部化影响分析脚本
 * 计算将不同依赖外部化后的预期收益
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
 * 估算包的大小（从 node_modules）
 */
function estimatePackageSize(packageName) {
    try {
        const packagePath = path.join(__dirname, '..', 'node_modules', packageName);
        if (!fs.existsSync(packagePath)) {
            return null;
        }

        let totalSize = 0;
        let fileCount = 0;

        function calculateDirSize(dirPath) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // 跳过不必要的目录
                    if (!['node_modules', '.git', 'test', 'tests', '__tests__', 'examples', 'docs'].includes(file)) {
                        calculateDirSize(filePath);
                    }
                } else if (stat.isFile()) {
                    // 只计算 JS 文件
                    if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
                        totalSize += stat.size;
                        fileCount++;
                    }
                }
            });
        }

        calculateDirSize(packagePath);
        return { size: totalSize, files: fileCount };
    } catch (error) {
        return null;
    }
}

/**
 * 主函数
 */
function main() {
    console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}📦 依赖外部化影响分析${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

    // 定义要分析的依赖
    const dependencies = [
        { name: 'antd', priority: 'P0', category: 'UI Framework' },
        { name: '@ant-design/x', priority: 'P0', category: 'AI Components' },
        { name: '@uiw/react-codemirror', priority: 'P0', category: 'Code Editor' },
        { name: '@codemirror/commands', priority: 'P0', category: 'Code Editor' },
        { name: '@codemirror/lang-markdown', priority: 'P0', category: 'Code Editor' },
        { name: '@codemirror/theme-one-dark', priority: 'P0', category: 'Code Editor' },
        { name: 'markdown-it', priority: 'P1', category: 'Markdown Parser' },
        { name: 'markdown-it-container', priority: 'P1', category: 'Markdown Plugin' },
        { name: 'markdown-it-emoji', priority: 'P1', category: 'Markdown Plugin' },
        { name: 'markdown-it-footnote', priority: 'P1', category: 'Markdown Plugin' },
        { name: 'markdown-it-highlightjs', priority: 'P1', category: 'Markdown Plugin' },
        { name: 'markdown-it-task-lists', priority: 'P1', category: 'Markdown Plugin' },
        { name: 'highlight.js', priority: 'P1', category: 'Syntax Highlight' },
        { name: 'zustand', priority: 'P2', category: 'State Management' },
        { name: 'react-window', priority: 'P2', category: 'Virtual Scroll' },
        { name: 'lucide-react', priority: 'P3', category: 'Icons' },
        { name: 'uuid', priority: 'P3', category: 'Utility' },
        { name: 'clsx', priority: 'P3', category: 'Utility' },
        { name: 'tailwind-merge', priority: 'P3', category: 'Utility' },
    ];

    console.log(`${colors.yellow}正在分析依赖大小...${colors.reset}\n`);

    const results = [];
    let totalCurrentSize = 0;

    dependencies.forEach(dep => {
        const info = estimatePackageSize(dep.name);
        if (info) {
            const gzipSize = Math.round(info.size * 0.35); // 估算 Gzip 压缩率 ~65%
            results.push({
                ...dep,
                size: info.size,
                gzipSize: gzipSize,
                files: info.files,
            });
            totalCurrentSize += info.size;
        } else {
            console.log(`${colors.red}⚠️  无法获取 ${dep.name} 的大小信息${colors.reset}`);
        }
    });

    // 按优先级和大小排序
    results.sort((a, b) => {
        const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.size - a.size;
    });

    // 显示详细分析
    console.log(`${colors.bright}${colors.green}┌────────────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.bright}${colors.green}│  依赖包详细分析                                             │${colors.reset}`);
    console.log(`${colors.bright}${colors.green}└────────────────────────────────────────────────────────────────┘${colors.reset}\n`);

    let currentPriority = '';
    results.forEach(dep => {
        if (dep.priority !== currentPriority) {
            currentPriority = dep.priority;
            const priorityLabels = {
                'P0': '强烈建议外部化',
                'P1': '建议外部化',
                'P2': '可选外部化',
                'P3': '不建议外部化',
            };
            console.log(`${colors.bright}${colors.cyan}\n━━━ ${priorityLabels[currentPriority]} ━━━${colors.reset}\n`);
        }

        const percentage = ((dep.size / totalCurrentSize) * 100).toFixed(1);
        const barLength = Math.round(percentage / 2);
        const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);

        console.log(`${colors.cyan}${dep.name.padEnd(40)}${colors.reset}`);
        console.log(`   分类: ${dep.category.padEnd(20)} | ` +
            `原始: ${formatBytes(dep.size).padStart(10)} | ` +
            `Gzip: ${formatBytes(dep.gzipSize).padStart(10)}`);
        console.log(`   占比: ${percentage.padStart(5)}% | ${bar}`);
        console.log();
    });

    // 方案对比
    console.log(`\n${colors.bright}${colors.magenta}┌────────────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}│  外部化方案对比                                             │${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}└────────────────────────────────────────────────────────────────┘${colors.reset}\n`);

    const schemes = [
        {
            name: '当前状态',
            deps: [],
            description: '所有依赖都打包在内',
        },
        {
            name: '方案 A (保守)',
            deps: ['antd'],
            description: '仅外部化 antd',
        },
        {
            name: '方案 B (推荐) ⭐',
            deps: [
                'antd',
                '@ant-design/x',
                '@uiw/react-codemirror',
                '@codemirror/commands',
                '@codemirror/lang-markdown',
                '@codemirror/theme-one-dark',
            ],
            description: '外部化大型通用库',
        },
        {
            name: '方案 C (激进)',
            deps: results.filter(d => d.priority === 'P0' || d.priority === 'P1').map(d => d.name),
            description: '外部化所有 P0 和 P1 依赖',
        },
    ];

    schemes.forEach((scheme, idx) => {
        const externalizedDeps = results.filter(r => scheme.deps.includes(r.name));
        const savedSize = externalizedDeps.reduce((sum, dep) => sum + dep.size, 0);
        const savedGzip = externalizedDeps.reduce((sum, dep) => sum + dep.gzipSize, 0);
        const remainingSize = totalCurrentSize - savedSize;
        const remainingGzip = Math.round(remainingSize * 0.35);
        const savingsPercent = ((savedSize / totalCurrentSize) * 100).toFixed(1);

        console.log(`${colors.yellow}${idx + 1}. ${scheme.name}${colors.reset}`);
        console.log(`   ${scheme.description}`);
        console.log();

        if (externalizedDeps.length > 0) {
            console.log(`   外部化的依赖:`);
            externalizedDeps.forEach(dep => {
                console.log(`     • ${dep.name}: ${formatBytes(dep.size)}`);
            });
            console.log();
        }

        console.log(`   ${colors.green}预计减少体积: ${formatBytes(savedSize)} (${savingsPercent}%)${colors.reset}`);
        console.log(`   ${colors.green}预计减少 Gzip: ${formatBytes(savedGzip)}${colors.reset}`);
        console.log(`   ${colors.blue}剩余依赖体积: ${formatBytes(remainingSize)} (Gzip: ${formatBytes(remainingGzip)})${colors.reset}`);
        console.log();
        console.log(`${colors.cyan}─`.repeat(60) + `${colors.reset}\n`);
    });

    // 总结和建议
    console.log(`${colors.bright}${colors.green}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}💡 总结与建议${colors.reset}`);
    console.log(`${colors.bright}${colors.green}═══════════════════════════════════════════${colors.reset}\n`);

    const recommendedScheme = schemes[2]; // 方案 B
    const recommendedDeps = results.filter(r => recommendedScheme.deps.includes(r.name));
    const recommendedSavings = recommendedDeps.reduce((sum, dep) => sum + dep.size, 0);
    const recommendedSavingsPercent = ((recommendedSavings / totalCurrentSize) * 100).toFixed(1);

    console.log(`${colors.bright}${colors.yellow}✅ 推荐执行: ${recommendedScheme.name}${colors.reset}\n`);
    console.log(`${colors.cyan}主要优势:${colors.reset}`);
    console.log(`   • 减少包体积: ${formatBytes(recommendedSavings)} (${recommendedSavingsPercent}%)`);
    console.log(`   • 外部化 ${recommendedDeps.length} 个大型依赖`);
    console.log(`   • 保持合理的实施复杂度`);
    console.log(`   • 符合行业最佳实践\n`);

    console.log(`${colors.cyan}下一步行动:${colors.reset}`);
    console.log(`   1. 查看详细评估报告: DEPENDENCY_EXTERNALIZATION_ASSESSMENT.md`);
    console.log(`   2. 团队讨论并确认方案`);
    console.log(`   3. 准备迁移文档和示例项目`);
    console.log(`   4. 安排发布时间窗口\n`);

    console.log(`${colors.green}✅ 分析完成!${colors.reset}\n`);
}

main();
