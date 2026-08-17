const { screen } = require('electron');

/**
 * 锁定模式管理
 */
function setupLockMode(mainWindow, ipcMain) {
  let isLocked = false;
  let mouseCheckInterval = null;
  let lastInUnlockArea = false; // 记录上次是否在解锁区域，避免频繁切换

  // 是否启用调试模式（显示鼠标位置信息）
  const DEBUG_MODE = true;

  /**
   * 检查鼠标是否在解锁区域
   */
  function isMouseInUnlockArea() {
    if (!mainWindow || mainWindow.isDestroyed()) return false;

    try {
      const cursorPos = screen.getCursorScreenPoint();
      const windowBounds = mainWindow.getBounds();

      // 动态获取窗口宽度，而不是硬编码
      const unlockArea = {
        x: 0,
        y: 0,
        width: windowBounds.width,  // 使用实际窗口宽度
        height: 100
      };

      // 计算解锁区域的屏幕坐标
      const unlockAreaX = windowBounds.x + unlockArea.x;
      const unlockAreaY = windowBounds.y + unlockArea.y;

      // 检查鼠标是否在解锁区域内
      const inArea = cursorPos.x >= unlockAreaX &&
                     cursorPos.x <= unlockAreaX + unlockArea.width &&
                     cursorPos.y >= unlockAreaY &&
                     cursorPos.y <= unlockAreaY + unlockArea.height;

      // 调试信息
      if (DEBUG_MODE) {
        if (inArea && !lastInUnlockArea) {
          console.log('🟢 [Lock] 鼠标进入解锁区域');
          console.log(`   鼠标位置: (${cursorPos.x}, ${cursorPos.y})`);
          console.log(`   窗口位置: (${windowBounds.x}, ${windowBounds.y})`);
          console.log(`   解锁区域: (${unlockAreaX}, ${unlockAreaY}) - (${unlockAreaX + unlockArea.width}, ${unlockAreaY + unlockArea.height})`);
        } else if (!inArea && lastInUnlockArea) {
          console.log('🔴 [Lock] 鼠标离开解锁区域');
        }
      }

      return inArea;
    } catch (error) {
      console.error('❌ [Lock] 检查鼠标位置时出错:', error);
      return false;
    }
  }

  /**
   * 启动鼠标位置检测
   */
  function startMouseTracking() {
    if (mouseCheckInterval) return;

    const windowBounds = mainWindow.getBounds();
    console.log('🚀 [Lock] 启动鼠标位置检测 (检测频率: 每50ms)');
    console.log(`📍 [Lock] 解锁区域大小: ${windowBounds.width}x100 px (动态宽度)`);

    // 每 50ms 检查一次鼠标位置
    mouseCheckInterval = setInterval(() => {
      if (!isLocked) return;

      const inUnlockArea = isMouseInUnlockArea();

      // 只有状态变化时才执行操作，避免频繁调用
      if (inUnlockArea !== lastInUnlockArea) {
        lastInUnlockArea = inUnlockArea;

        if (inUnlockArea) {
          // 鼠标在解锁区域，允许鼠标事件
          console.log('✅ [Lock] 启用鼠标交互');
          mainWindow.setIgnoreMouseEvents(false);

          // 通知渲染进程（用于视觉反馈）
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('unlock-area-hover', true);
          }
        } else {
          // 鼠标离开解锁区域，恢复鼠标穿透
          console.log('⛔ [Lock] 恢复鼠标穿透');
          mainWindow.setIgnoreMouseEvents(true, { forward: true });

          // 通知渲染进程
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('unlock-area-hover', false);
          }
        }
      }
    }, 50);
  }

  /**
   * 停止鼠标位置检测
   */
  function stopMouseTracking() {
    if (mouseCheckInterval) {
      clearInterval(mouseCheckInterval);
      mouseCheckInterval = null;
      lastInUnlockArea = false;
      console.log('🛑 [Lock] 停止鼠标位置检测');
    }
  }

  // 监听锁定/解锁请求
  ipcMain.on('toggle-lock', (event) => {
    isLocked = !isLocked;

    if (isLocked) {
      console.log('🔒 [Lock] 窗口已锁定');
      startMouseTracking();
    } else {
      console.log('🔓 [Lock] 窗口已解锁');
      stopMouseTracking();
    }

    applyLockMode(mainWindow, isLocked);

    // 通知渲染进程锁定状态变化
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('lock-state-changed', isLocked);
    }
  });

  // 获取锁定状态
  ipcMain.on('get-lock-state', (event) => {
    event.reply('lock-state-changed', isLocked);
  });

  // 窗口关闭时清理定时器
  mainWindow.on('closed', () => {
    stopMouseTracking();
  });
}

/**
 * 应用锁定模式
 */
function applyLockMode(win, locked) {
  if (locked) {
    // 锁定：鼠标穿透 + 降低不透明度 + 取消置顶
    win.setIgnoreMouseEvents(true, { forward: true });
    win.setAlwaysOnTop(false);
    win.setSkipTaskbar(true);
    win.setOpacity(0.85);
    console.log('📌 [Lock] 锁定模式已应用 (透明度: 0.85, 置顶: 关闭)');
  } else {
    // 解锁：恢复正常
    win.setIgnoreMouseEvents(false);
    win.setAlwaysOnTop(true);
    win.setSkipTaskbar(false);
    win.setOpacity(1);
    console.log('📌 [Lock] 正常模式已应用 (透明度: 1.0, 置顶: 开启)');
  }
}

module.exports = {
  setupLockMode,
  applyLockMode,
};
