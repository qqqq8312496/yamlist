const { globalShortcut } = require('electron');

/**
 * 注册全局快捷键
 */
function registerHotkeys(mainWindow, store) {
  // 获取用户自定义快捷键配置
  const hotkeys = store.get('hotkeys', {
    toggleLock: 'Ctrl+Shift+L',
    toggleWindow: 'Ctrl+Alt+Y',
    newTask: 'Ctrl+N',
    search: 'Ctrl+F',
  });

  // 注册锁定/解锁快捷键
  if (hotkeys.toggleLock) {
    globalShortcut.register(hotkeys.toggleLock, () => {
      mainWindow.webContents.send('hotkey-triggered', 'toggle-lock');
    });
  }

  // 注册显示/隐藏窗口快捷键
  if (hotkeys.toggleWindow) {
    globalShortcut.register(hotkeys.toggleWindow, () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }

  // 注册新建任务快捷键
  if (hotkeys.newTask) {
    globalShortcut.register(hotkeys.newTask, () => {
      mainWindow.webContents.send('hotkey-triggered', 'new-task');
    });
  }

  // 注册搜索快捷键
  if (hotkeys.search) {
    globalShortcut.register(hotkeys.search, () => {
      mainWindow.webContents.send('hotkey-triggered', 'search');
    });
  }
}

/**
 * 注销所有快捷键
 */
function unregisterAllHotkeys() {
  globalShortcut.unregisterAll();
}

module.exports = {
  registerHotkeys,
  unregisterAllHotkeys,
};
