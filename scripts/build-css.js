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

// Compile Tailwind CSS using CLI
try {
    execSync(
        `npx tailwindcss -i ${srcPath} -o ${path.resolve(outputPath, 'tailwind.css')} --minify`,
        { stdio: 'inherit' }
    );
    console.log('✅ Tailwind CSS compiled successfully!');
} catch (error) {
    console.error('❌ Failed to compile Tailwind CSS:', error.message);
    process.exit(1);
}
