const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Compiling Tailwind CSS...');

const srcPath = path.resolve(__dirname, '../src/styles/tailwind.css');
const distPath = path.resolve(__dirname, '../dist');
const outputPath = path.resolve(distPath, 'styles');

// Ensure dist/styles directory exists
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Compile Tailwind CSS using CLI with explicit config to ensure animations are included
// Output to styles/index.css for cleaner import path
try {
    execSync(
        `npx tailwindcss -i ${srcPath} -o ${path.resolve(outputPath, 'index.css')} --minify --config ./tailwind.config.js`,
        { stdio: 'inherit' }
    );
    console.log('✅ Tailwind CSS compiled successfully!');
    console.log('📁 Output: dist/styles/index.css');
} catch (error) {
    console.error('❌ Failed to compile Tailwind CSS:', error.message);
    process.exit(1);
}
