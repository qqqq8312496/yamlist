const { BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let splashWindow = null;
let autoCloseTimer = null;

/**
 * 创建启动欢迎窗口
 */
function createSplashWindow(isDev) {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // 窗口尺寸（更大更醒目）
  const windowWidth = 700;
  const windowHeight = 500;

  splashWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor((screenWidth - windowWidth) / 2),
    y: Math.floor((screenHeight - windowHeight) / 2),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 加载启动页
  if (isDev) {
    splashWindow.loadFile(path.join(__dirname, '../splash.html'));
  } else {
    splashWindow.loadFile(path.join(__dirname, '../splash.html'));
  }

  // 15秒后自动关闭
  autoCloseTimer = setTimeout(() => {
    closeSplashWindow();
  }, 15000);

  // 监听手动关闭事件
  ipcMain.once('close-splash', () => {
    closeSplashWindow();
  });

  return splashWindow;
}

/**
 * 关闭启动窗口
 */
function closeSplashWindow() {
  // 清除自动关闭定时器
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }

  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
    splashWindow = null;
  }
}

module.exports = {
  createSplashWindow,
  closeSplashWindow,
};
