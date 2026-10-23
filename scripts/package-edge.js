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

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, "..");
// 打包输出目录
const DIST_DIR = path.join(ROOT_DIR, "dist");
// 临时解压包目录（可直接在 Edge 中作为已解压扩展加载）
const STAGING_DIR = path.join(DIST_DIR, "Aria2-Next-Explorer-Edge");

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
    if (
      excludes.includes(entry.name) ||
      excludes.some((ex) => ex.startsWith("*") && entry.name.endsWith(ex.slice(1)))
    ) {
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
 * 查找本地 Microsoft Edge 或 Chromium 浏览器执行文件
 * 支持标准安装路径、EdgeCore 以及 Canary/Dev 分支
 */
function findEdgeExecutable() {
  const candidateDirs = [
    "C:\\Program Files (x86)\\Microsoft\\EdgeCore",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application",
    "C:\\Program Files\\Microsoft\\Edge\\Application",
    path.join(process.env.LOCALAPPDATA || "", "Microsoft\\Edge\\Application"),
    "C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application",
    "C:\\Program Files (x86)\\Microsoft\\Edge Canary\\Application",
    "C:\\Program Files\\Google\\Chrome\\Application",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application",
  ];

  for (const baseDir of candidateDirs) {
    if (!fs.existsSync(baseDir)) continue;

    // 1. 直接检查当前目录下是否存在 msedge.exe 或 chrome.exe
    for (const exeName of ["msedge.exe", "chrome.exe"]) {
      const directPath = path.join(baseDir, exeName);
      if (fs.existsSync(directPath)) return directPath;
    }

    // 2. 遍历版本子目录（例如 EdgeCore/155.0.4283.45/msedge.exe）
    try {
      const subEntries = fs.readdirSync(baseDir, { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.isDirectory()) {
          for (const exeName of ["msedge.exe", "chrome.exe"]) {
            const subExePath = path.join(baseDir, sub.name, exeName);
            if (fs.existsSync(subExePath)) return subExePath;
          }
        }
      }
    } catch (e) {
      // 忽略无权限或已锁定的目录
    }
  }

  return null;
}

/**
 * 使用 Edge/Chromium 原生内核将解压目录打包为 .crx 文件
 * @param {string} edgeExe 浏览器可执行文件路径
 * @param {string} stagingDir 解压目录
 * @param {string} distDir 输出目录
 * @param {string} version 插件版本号
 * @returns {string|null} 打包成功后的 .crx 文件路径
 */
function packCrxExtension(edgeExe, stagingDir, distDir, version) {
  const keyPath = path.join(ROOT_DIR, "scripts", "developer-key.pem");
  const tempProfileDir = path.join(distDir, ".temp-pack-profile");

  let keyArg = "";
  if (fs.existsSync(keyPath)) {
    keyArg = ` --pack-extension-key="${keyPath}"`;
  }

  try {
    // 确保临时用户目录存在
    fs.mkdirSync(tempProfileDir, { recursive: true });

    // 调用 Edge 命令行进行扩展包打包
    const packCmd = `"${edgeExe}" --pack-extension="${stagingDir}"${keyArg} --user-data-dir="${tempProfileDir}" --no-message-box`;
    execSync(packCmd, { stdio: "ignore" });

    // Edge 默认在 stagingDir 的同级目录输出 <stagingDirName>.crx 和 <stagingDirName>.pem
    const defaultCrx = `${stagingDir}.crx`;
    const defaultPem = `${stagingDir}.pem`;
    const finalCrxPath = path.join(
      distDir,
      `Aria2-Next-Explorer-Edge-v${version}.crx`
    );

    // 如果首次打包生成了私钥，自动持久化保存到 scripts/developer-key.pem，确保后续版本拥有相同的扩展 ID
    if (fs.existsSync(defaultPem) && !fs.existsSync(keyPath)) {
      fs.copyFileSync(defaultPem, keyPath);
      console.log(`🔑 已自动保存开发者私钥至: ${keyPath}`);
    }

    // 清理 staging 同级生成的临时 pem
    if (fs.existsSync(defaultPem)) {
      fs.unlinkSync(defaultPem);
    }

    // 重命名并移动 crx 到最终规范名称
    if (fs.existsSync(defaultCrx)) {
      if (fs.existsSync(finalCrxPath)) {
        fs.unlinkSync(finalCrxPath);
      }
      fs.renameSync(defaultCrx, finalCrxPath);
      return finalCrxPath;
    }
  } catch (err) {
    console.warn(`⚠️ 打包 .crx 时发生异常: ${err.message}`);
  } finally {
    // 清理临时 profile 目录
    if (fs.existsSync(tempProfileDir)) {
      try {
        fs.rmSync(tempProfileDir, { recursive: true, force: true });
      } catch (e) {
        // 允许静默忽略
      }
    }
  }

  return null;
}

/**
 * 主打包流程
 */
function runPackaging() {
  console.log(
    "=================================================================",
  );
  console.log("🚀 开始打包 Aria2-Next-Explorer (Microsoft Edge 插件专用包)");
  console.log(
    "=================================================================",
  );

  // 1. 读取并校验 manifest.json
  const manifestPath = path.join(ROOT_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("❌ 错误: 未在根目录找到 manifest.json 文件！");
    process.exit(1);
  }

  let manifest;
  try {
    const manifestContent = fs.readFileSync(manifestPath, "utf8");
    manifest = JSON.parse(manifestContent);
    console.log(`📋 插件名称: ${manifest.name} (版本号: v${manifest.version})`);
    console.log(`📋 Manifest 版本: V${manifest.manifest_version}`);
  } catch (e) {
    console.error(
      "❌ 错误: manifest.json 格式非法，解析 JSON 失败:",
      e.message,
    );
    process.exit(1);
  }

  // 2. 检查多语言配置（严格保证仅保留 zh_CN 与 en）
  const localesDir = path.join(ROOT_DIR, "_locales");
  if (fs.existsSync(localesDir)) {
    const locales = fs.readdirSync(localesDir);
    console.log(`🌐 包含的多语言目录: ${locales.join(", ")}`);
    const unexpected = locales.filter((l) => l !== "zh_CN" && l !== "en");
    if (unexpected.length > 0) {
      console.warn(`⚠️ 警告: 发现非要求的语言包: ${unexpected.join(", ")}`);
    }
  }

  // 3. 准备输出目录
  if (fs.existsSync(DIST_DIR)) {
    console.log("🧹 清理旧的 dist 打包目录...");
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  // 3.5 自动执行现代化 WebUI 构建
  console.log("⚡ 正在执行 Vue 3 现代化 WebUI 编译构建 (pnpm run build)...");
  try {
    execSync("pnpm run build", { cwd: ROOT_DIR, stdio: "inherit" });
  } catch (buildErr) {
    console.error("❌ WebUI 构建失败:", buildErr.message);
    process.exit(1);
  }

  // 4. 定义需要打包的文件与目录清单
  const includeEntries = [
    "manifest.json",
    "acknowledgment.txt",
    "_locales",
    "src",
  ];

  console.log("📦 正在复制扩展必要资源文件至发布暂存目录...");
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
      // 复制 src 目录时排除开发期 Vue 源码，运行时直接使用 dist/webui 编译产物
      const excludes = entryName === "src" 
        ? ["components", "views", "public", "store", "router", "i18n", "*.vue", "App.vue", "main.js", "index.html", ".git", ".DS_Store", "Thumbs.db"]
        : [".git", ".DS_Store", "Thumbs.db"];
      copyDirSync(srcPath, destPath, excludes);
    } else if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
    copiedCount++;
  }

  // 复制静态图标与图片资源至扩展包根目录下的 images/
  const publicImagesDir = path.join(ROOT_DIR, "src", "public", "images");
  const destImagesDir = path.join(STAGING_DIR, "images");
  if (fs.existsSync(publicImagesDir)) {
    copyDirSync(publicImagesDir, destImagesDir);
    copiedCount++;
  } else {
    console.warn("⚠️ 警告: 未在 src/public/ 下找到 images 目录！");
  }

  // 复制已编译好的 Vue 3 WebUI 产物至扩展包中的 webui/ 目录
  const builtWebUiDir = path.join(DIST_DIR, "webui");
  const destWebUiDir = path.join(STAGING_DIR, "webui");
  if (fs.existsSync(builtWebUiDir)) {
    copyDirSync(builtWebUiDir, destWebUiDir);
    copiedCount++;
  } else {
    console.error("❌ 错误: 未能在 dist/ 目录下找到 webui 编译产物！");
    process.exit(1);
  }

  console.log(`✅ 已复制 ${copiedCount} 个顶级资源模块。`);

  // 5. 校验暂存区中所有关键 JS 文件的语法
  console.log("🔍 正在对打包包内的 JavaScript 文件进行语法完整性校验...");
  function checkJsFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        checkJsFiles(fullPath);
      } else if (item.isFile() && item.name.endsWith(".js")) {
        try {
          execSync(`node --check "${fullPath}"`, { stdio: "pipe" });
        } catch (err) {
          console.error(`❌ JavaScript 语法校验失败: ${fullPath}`);
          process.exit(1);
        }
      }
    }
  }
  checkJsFiles(STAGING_DIR);
  console.log("✅ 所有核心 JavaScript 脚本语法校验通过！");

  // 6. 生成 ZIP 压缩包
  const zipFileName = `Aria2-Next-Explorer-Edge-v${manifest.version}.zip`;
  const zipFilePath = path.join(DIST_DIR, zipFileName);
  console.log(`🗜️ 正在压缩生成 Edge 扩展安装包: ${zipFileName} ...`);

  try {
    if (process.platform === "win32") {
      // 在 Windows 环境下使用 PowerShell 的 Compress-Archive 快速创建标准 ZIP
      const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${STAGING_DIR}\\*' -DestinationPath '${zipFilePath}' -Force"`;
      execSync(psCommand, { stdio: "inherit" });
    } else {
      // Linux / macOS 环境下使用 zip 命令
      execSync(`cd "${STAGING_DIR}" && zip -r "${zipFilePath}" ./*`, {
        stdio: "inherit",
      });
    }
  } catch (zipErr) {
    console.error("❌ 压缩生成 ZIP 文件时出错:", zipErr.message);
    process.exit(1);
  }

  // 7. 生成 CRX 离线安装包
  console.log(`📦 正在检查环境并生成 Edge .crx 格式安装包...`);
  const edgeExe = findEdgeExecutable();
  let crxFilePath = null;
  let crxSizeInMB = null;

  if (edgeExe) {
    console.log(`🌐 发现 Edge/Chromium 内核执行程序: ${edgeExe}`);
    crxFilePath = packCrxExtension(
      edgeExe,
      STAGING_DIR,
      DIST_DIR,
      manifest.version
    );
    if (crxFilePath && fs.existsSync(crxFilePath)) {
      const crxStat = fs.statSync(crxFilePath);
      crxSizeInMB = (crxStat.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ 成功生成 .crx 安装包: ${path.basename(crxFilePath)}`);
    } else {
      console.warn("⚠️ 未能生成 .crx 文件，请参考下方 ZIP 方式使用。");
    }
  } else {
    console.warn("⚠️ 未检测到可用的 Edge/Chrome 浏览器核心路径，跳过 .crx 自动打包。");
  }

  // 8. 统计输出
  const zipStat = fs.statSync(zipFilePath);
  const sizeInMB = (zipStat.size / (1024 * 1024)).toFixed(2);

  console.log(
    "=================================================================",
  );
  console.log("🎉 恭喜！Aria2-Next-Explorer (Edge 版) 打包成功！");
  console.log(
    "=================================================================",
  );
  console.log(`📁 1. 解压版目录 (开发模式直接加载):`);
  console.log(`   ${STAGING_DIR}`);
  console.log(`📦 2. ZIP 压缩包 (商城上传 / 归档分发):`);
  console.log(`   ${zipFilePath} (${sizeInMB} MB)`);
  if (crxFilePath) {
    console.log(`💿 3. CRX 离线安装包 (Edge 拖拽一键安装):`);
    console.log(`   ${crxFilePath} (${crxSizeInMB} MB)`);
  }
  console.log(
    "-----------------------------------------------------------------",
  );
  console.log("💡 如何在 Microsoft Edge 浏览器中安装此插件：");
  console.log("   方法 A (推荐，CRX 拖拽安装):");
  console.log("     1. 打开 Edge 浏览器，访问 edge://extensions");
  console.log("     2. 开启页面左侧底部的【开发人员模式】开关");
  console.log(`     3. 将 ${path.basename(crxFilePath || '扩展包.crx')} 文件直接拖拽进该网页即可完成安装！`);
  console.log("   方法 B (解压目录直接加载):");
  console.log("     1. 打开 Edge 浏览器，访问 edge://extensions");
  console.log("     2. 开启左侧【开发人员模式】开关");
  console.log("     3. 点击【加载解压缩的扩展】按钮，选中上述解压版目录即可！");
  console.log(
    "=================================================================",
  );
}

runPackaging();
