const fs = require('fs');
const path = require('path');

/**
 * electron-builder afterPack hook
 * 在打包完成后创建智能安装包
 */
exports.default = async function(context) {
  console.log('\n[AfterPack] 正在处理打包结果...');

  const distPath = path.join(context.appOutDir, '..', '..');
  const smartInstallerPath = path.join(distPath, '智能安装包');

  console.log('[AfterPack] 输出目录:', distPath);
  console.log('[AfterPack] 智能安装包目录:', smartInstallerPath);

  // 创建智能安装包目录
  if (!fs.existsSync(smartInstallerPath)) {
    fs.mkdirSync(smartInstallerPath, { recursive: true });
    console.log('[AfterPack] 已创建智能安装包目录');
  }

  // 复制智能启动器
  const launcherSource = path.join(__dirname, '智能安装.bat');
  const launcherDest = path.join(smartInstallerPath, '山药List-智能安装.bat');

  if (fs.existsSync(launcherSource)) {
    fs.copyFileSync(launcherSource, launcherDest);
    console.log('[AfterPack] 已复制智能启动器');
  }

  // 创建说明文件
  const readmeContent = `
╔═══════════════════════════════════════════════════════╗
║                 山药List 安装说明                      ║
╚═══════════════════════════════════════════════════════╝

感谢使用山药List！

【安装方法】

方法一：智能安装（推荐）
  1. 双击运行 "山药List-智能安装.bat"
  2. 脚本会自动检测您的系统（32位/64位）
  3. 自动启动对应版本的安装程序

方法二：手动选择
  1. 查看您的系统类型：
     - 右键"此电脑" → 属性
     - 查看"系统类型"
  2. 选择对应的安装包：
     - 64位系统：运行 "山药List Setup [版本号].exe"
     - 32位系统：运行 "山药List Setup [版本号]-ia32.exe"

【架构说明】

• 64位版本（推荐）
  - 适用于 Windows 10/11 64位系统
  - 性能更好，内存管理更优
  - 安装包不包含 "ia32" 字样

• 32位版本
  - 适用于 Windows 10 32位系统
  - 兼容老旧电脑
  - 安装包包含 "ia32" 字样

【安装后】

• 桌面快捷方式：双击启动
• 开始菜单：搜索"山药List"
• 系统托盘：最小化后在托盘中运行

【技术支持】

如有问题，请访问项目仓库或联系开发者。

═══════════════════════════════════════════════════════
                    祝您使用愉快！
═══════════════════════════════════════════════════════
`;

  const readmePath = path.join(smartInstallerPath, '安装说明.txt');
  fs.writeFileSync(readmePath, readmeContent.trim(), 'utf8');
  console.log('[AfterPack] 已创建安装说明');

  console.log('[AfterPack] 智能安装包准备完成！\n');
  console.log('打包完成后，请将以下文件复制到智能安装包目录：');
  console.log('  - 64位安装包（山药List Setup [版本号].exe）');
  console.log('  - 32位安装包（山药List Setup [版本号]-ia32.exe）');
  console.log('  - 智能启动器（山药List-智能安装.bat）');
  console.log('  - 安装说明（安装说明.txt）\n');
};
