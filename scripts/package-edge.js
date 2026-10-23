/**
 * ==============================================================================
 * Aria2-Next-Explorer - Edge 浏览器插件一键打包脚本
 * ==============================================================================
 * 功能说明：
 * 1. 验证插件核心文件完整性与 JavaScript 语法规范。
 * 2. 收集发布所需的所有资源文件（忽略 git、脚本、开发文档、测试文件等）。
 * 3. 生成专供 Microsoft Edge (Chromium 内核) 浏览器的开发解压包和 .zip 发布压缩包。
 * 4. 输出打包统计信息与在 Edge 浏览器中安装测试的详细指引。
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
// 打包输出目录
const DIST_DIR = path.join(ROOT_DIR, 'dist');
// 临时解压包目录（可直接在 Edge 中作为已解压扩展加载）
const STAGING_DIR = path.join(DIST_DIR, 'Aria2-Next-Explorer-Edge');

/**
 * 递归复制目录
 * @param {string} src 源目录路径
 * @param {string} dest 目标目录路径
 * @param {Array<string>} excludes 排除的文件或目录名
 */
function copyDirSync(src, dest, excludes = []) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        if (excludes.includes(entry.name)) {
            continue;
        }

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath, excludes);
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * 主打包流程
 */
function runPackaging() {
    console.log('=================================================================');
    console.log('🚀 开始打包 Aria2-Next-Explorer (Microsoft Edge 插件专用包)');
    console.log('=================================================================');

    // 1. 读取并校验 manifest.json
    const manifestPath = path.join(ROOT_DIR, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('❌ 错误: 未在根目录找到 manifest.json 文件！');
        process.exit(1);
    }

    let manifest;
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        manifest = JSON.parse(manifestContent);
        console.log(`📋 插件名称: ${manifest.name} (版本号: v${manifest.version})`);
        console.log(`📋 Manifest 版本: V${manifest.manifest_version}`);
    } catch (e) {
        console.error('❌ 错误: manifest.json 格式非法，解析 JSON 失败:', e.message);
        process.exit(1);
    }

    // 2. 检查多语言配置（严格保证仅保留 zh_CN 与 en）
    const localesDir = path.join(ROOT_DIR, '_locales');
    if (fs.existsSync(localesDir)) {
        const locales = fs.readdirSync(localesDir);
        console.log(`🌐 包含的多语言目录: ${locales.join(', ')}`);
        const unexpected = locales.filter(l => l !== 'zh_CN' && l !== 'en');
        if (unexpected.length > 0) {
            console.warn(`⚠️ 警告: 发现非要求的语言包: ${unexpected.join(', ')}`);
        }
    }

    // 3. 准备输出目录
    if (fs.existsSync(DIST_DIR)) {
        console.log('🧹 清理旧的 dist 打包目录...');
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR, { recursive: true });
    fs.mkdirSync(STAGING_DIR, { recursive: true });

    // 4. 定义需要打包的文件与目录清单
    const includeEntries = [
        'manifest.json',
        'background.js',
        'options.html',
        'aria2.html',
        'acknowledgment.txt',
        '_locales',
        'js',
        'css',
        'images',
        'ui'
    ];

    console.log('📦 正在复制扩展必要资源文件至发布暂存目录...');
    let copiedCount = 0;

    for (const entryName of includeEntries) {
        const srcPath = path.join(ROOT_DIR, entryName);
        const destPath = path.join(STAGING_DIR, entryName);

        if (!fs.existsSync(srcPath)) {
            console.warn(`⚠️ 跳过不存在的资源: ${entryName}`);
            continue;
        }

        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            copyDirSync(srcPath, destPath, ['.git', '.DS_Store', 'Thumbs.db']);
        } else if (stat.isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
        copiedCount++;
    }

    console.log(`✅ 已复制 ${copiedCount} 个顶级资源模块。`);

    // 5. 校验暂存区中所有关键 JS 文件的语法
    console.log('🔍 正在对打包包内的 JavaScript 文件进行语法完整性校验...');
    function checkJsFiles(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                checkJsFiles(fullPath);
            } else if (item.isFile() && item.name.endsWith('.js')) {
                try {
                    execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
                } catch (err) {
                    console.error(`❌ JavaScript 语法校验失败: ${fullPath}`);
                    process.exit(1);
                }
            }
        }
    }
    checkJsFiles(STAGING_DIR);
    console.log('✅ 所有核心 JavaScript 脚本语法校验通过！');

    // 6. 生成 ZIP 压缩包
    const zipFileName = `Aria2-Next-Explorer-Edge-v${manifest.version}.zip`;
    const zipFilePath = path.join(DIST_DIR, zipFileName);
    console.log(`🗜️ 正在压缩生成 Edge 扩展安装包: ${zipFileName} ...`);

    try {
        if (process.platform === 'win32') {
            // 在 Windows 环境下使用 PowerShell 的 Compress-Archive 快速创建标准 ZIP
            const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${STAGING_DIR}\\*' -DestinationPath '${zipFilePath}' -Force"`;
            execSync(psCommand, { stdio: 'inherit' });
        } else {
            // Linux / macOS 环境下使用 zip 命令
            execSync(`cd "${STAGING_DIR}" && zip -r "${zipFilePath}" ./*`, { stdio: 'inherit' });
        }
    } catch (zipErr) {
        console.error('❌ 压缩生成 ZIP 文件时出错:', zipErr.message);
        process.exit(1);
    }

    // 7. 统计输出
    const zipStat = fs.statSync(zipFilePath);
    const sizeInMB = (zipStat.size / (1024 * 1024)).toFixed(2);

    console.log('=================================================================');
    console.log('🎉 恭喜！Aria2-Next-Explorer (Edge 版) 打包成功！');
    console.log('=================================================================');
    console.log(`📁 1. 解压版目录 (开发模式直接加载):`);
    console.log(`   ${STAGING_DIR}`);
    console.log(`📦 2. ZIP 压缩包 (分发发布/商城上传):`);
    console.log(`   ${zipFilePath} (${sizeInMB} MB)`);
    console.log('-----------------------------------------------------------------');
    console.log('💡 如何在 Microsoft Edge 浏览器中安装测试此插件：');
    console.log('   步骤 1: 打开 Edge 浏览器，在地址栏输入: edge://extensions');
    console.log('   步骤 2: 打开左侧边栏底部的【开发人员模式】开关');
    console.log('   步骤 3: 点击顶部的【加载解压缩的扩展】按钮');
    console.log(`   步骤 4: 选择上述目录: ${STAGING_DIR}`);
    console.log('   步骤 5: 开启右上角拼图图标中的 Aria2-Next-Explorer，即可开始使用！');
    console.log('=================================================================');
}

runPackaging();
