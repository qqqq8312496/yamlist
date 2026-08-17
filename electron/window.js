const { BrowserWindow, screen } = require('electron');
const path = require('path');

/**
 * 创建主窗口
 */
function createWindow(store, isDev) {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // 获取保存的窗口位置和大小
  const savedBounds = store.get('windowBounds', {
    x: 20,
    y: screenHeight - 800,
    width: 350,
    height: 780,
  });

  const win = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    x: savedBounds.x,
    y: savedBounds.y,
    minWidth: 300,
    minHeight: 600,
    maxWidth: 530,
    maxHeight: 1200,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000', // 完全透明
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    hasShadow: false, // 禁用阴影避免透明问题
    webPreferences: {
      // ✅ 安全配置
      nodeIntegration: false,           // 禁止渲染进程直接访问 Node.js
      contextIsolation: true,           // 启用上下文隔离
      enableRemoteModule: false,        // 禁用已废弃的 remote 模块
      preload: path.join(__dirname, 'preload.js'),  // 使用 preload 脚本
      backgroundThrottling: false,      // 保持动画流畅
      sandbox: false,                   // 暂时禁用沙箱（某些功能需要）
    },
  });

  // 保存窗口位置
  win.on('moved', () => {
    const bounds = win.getBounds();
    store.set('windowBounds', bounds);
  });

  // 保存窗口大小
  win.on('resized', () => {
    const bounds = win.getBounds();
    store.set('windowBounds', bounds);
  });

  // 阻止默认菜单
  win.setMenu(null);

  return win;
}

/**
 * 设置窗口置顶
 */
function setAlwaysOnTop(win, flag) {
  win.setAlwaysOnTop(flag);
}

/**
 * 最小化窗口
 */
function minimizeWindow(win) {
  win.minimize();
}

/**
 * 关闭窗口
 */
function closeWindow(win) {
  win.close();
}

/**
 * 设置窗口大小
 */
function resizeWindow(win, width, height) {
  // 确保在限制范围内
  const minWidth = 300;
  const minHeight = 600;
  const maxWidth = 530;
  const maxHeight = 1200;

  const finalWidth = Math.max(minWidth, Math.min(maxWidth, width));
  const finalHeight = Math.max(minHeight, Math.min(maxHeight, height));

  win.setSize(finalWidth, finalHeight);
}

/**
 * 扩展窗口到大尺寸（用于日历视图）
 */
function expandWindow(win) {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  // 移除尺寸限制
  win.setMaximumSize(screenWidth, screenHeight);
  win.setMinimumSize(300, 600);
  // 固定日历窗口尺寸为 1200×800，保持当前位置不变
  win.setSize(1200, 800);
}

/**
 * 恢复窗口到正常尺寸
 */
function restoreWindow(win, store) {
  // 恢复尺寸限制
  win.setMinimumSize(300, 600);
  win.setMaximumSize(530, 1200);
  // 恢复到保存的尺寸和位置
  const savedBounds = store.get('windowBounds', {
    x: 20,
    y: 100,
    width: 350,
    height: 780,
  });
  win.setBounds({
    x: savedBounds.x,
    y: savedBounds.y,
    width: savedBounds.width,
    height: savedBounds.height,
  });
}

module.exports = {
  createWindow,
  setAlwaysOnTop,
  minimizeWindow,
  closeWindow,
  resizeWindow,
  expandWindow,
  restoreWindow,
};
