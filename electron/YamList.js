const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createWindow, resizeWindow, expandWindow, restoreWindow } = require('./window');
const {
  setupDatabase,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  importTasks,
  clearCompletedTasks,
  getAllTabs,
  createTab,
  updateTab,
  deleteTab,
  closeDatabase,
} = require('./database');
const { registerHotkeys } = require('./hotkey');
const { createTray } = require('./tray');
const { setupLockMode } = require('./lock');
const { performMigration } = require('./migrate');
const { createSplashWindow } = require('./splash');

// Allow demos and CI to use an isolated profile instead of the developer's local data.
if (process.env.YAMLIST_USER_DATA_DIR) {
  app.setPath('userData', path.resolve(process.env.YAMLIST_USER_DATA_DIR));
}

// 配置存储
const store = new Store();

let mainWindow = null;
let calendarWindow = null;
let tray = null;

// 开发环境检测
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 创建日历窗口
function createCalendarWindow() {
  // 如果窗口已经存在，关闭它（toggle功能）
  if (calendarWindow) {
    calendarWindow.close();
    calendarWindow = null;
    return;
  }

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  calendarWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    x: Math.floor((screenWidth - 1200) / 2),
    y: Math.floor((screenHeight - 800) / 2),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: true,
    skipTaskbar: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  calendarWindow.setMenu(null);

  // 加载相同的URL，但React会根据路由显示日历
  if (isDev) {
    calendarWindow.loadURL('http://localhost:5173?calendar=1');
  } else {
    calendarWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'calendar',
    });
  }

  calendarWindow.on('closed', () => {
    calendarWindow = null;
  });
}

function closeCalendarWindow() {
  if (calendarWindow) {
    calendarWindow.close();
    calendarWindow = null;
  }
}


function initialize() {
  // 创建启动欢迎窗口
  createSplashWindow(isDev);

  // 创建主窗口
  mainWindow = createWindow(store, isDev);

  // 初始化数据库
  try {
    setupDatabase();
    console.log('[YamList] 数据库初始化成功');
  } catch (error) {
    console.error('[YamList] 数据库初始化失败:', error);
  }

  // 设置锁定模式
  setupLockMode(mainWindow, ipcMain);

  // 注册快捷键
  registerHotkeys(mainWindow, store);

  // 创建系统托盘
  tray = createTray(mainWindow);

  // 窗口控制事件
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window-close', () => {
    mainWindow.close();
  });

  ipcMain.on('app-restart', () => {
    if (isDev) {
      // 开发环境：重新加载窗口而不是重启整个应用
      mainWindow.reload();
      if (calendarWindow) {
        calendarWindow.reload();
      }
    } else {
      // 生产环境：重启应用
      app.relaunch();
      app.exit(0);
    }
  });

  ipcMain.on('window-resize', (_, width, height) => {
    resizeWindow(mainWindow, width, height);
  });

  // 打开日历窗口
  ipcMain.on('calendar-open', () => {
    createCalendarWindow();
  });

  // 关闭日历窗口
  ipcMain.on('calendar-close', () => {
    closeCalendarWindow();
  });

  // 获取当前窗口大小
  ipcMain.handle('get-window-size', () => {
    const bounds = mainWindow.getBounds();
    return { width: bounds.width, height: bounds.height };
  });

  // 快捷键配置
  ipcMain.handle('get-hotkeys', () => {
    return store.get('hotkeys', {
      toggleLock: 'Ctrl+Shift+L',
      toggleWindow: 'Ctrl+Alt+Y',
      newTask: 'Ctrl+N',
      search: 'Ctrl+F',
    });
  });

  ipcMain.handle('save-hotkeys', (_, hotkeys) => {
    try {
      // 先注销所有快捷键
      globalShortcut.unregisterAll();
      // 保存新配置
      store.set('hotkeys', hotkeys);
      // 重新注册快捷键
      registerHotkeys(mainWindow, store);
      return true;
    } catch (error) {
      console.error('保存快捷键失败:', error);
      return false;
    }
  });

  // ==================== 数据库操作IPC处理 ====================

  // 获取所有任务
  ipcMain.handle('load-tasks', () => {
    try {
      const tasks = getAllTasks();
      return tasks;
    } catch (error) {
      console.error('加载任务失败:', error);
      return [];
    }
  });

  // 保存/更新任务
  ipcMain.handle('save-task', (_, task) => {
    try {
      if (task.id) {
        // 更新现有任务
        const updated = updateTask(task.id, task);
        return updated;
      } else {
        // 创建新任务
        const created = createTask(task);
        return created;
      }
    } catch (error) {
      console.error('保存任务失败:', error);
      return null;
    }
  });

  // 删除任务
  ipcMain.handle('delete-task', (_, taskId) => {
    try {
      deleteTask(taskId);
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      return false;
    }
  });

  // 批量导入任务（数据迁移用）
  ipcMain.handle('import-tasks', (_, tasks) => {
    try {
      const count = importTasks(tasks);
      console.log(`[YamList] 成功导入 ${count} 个任务`);
      return count;
    } catch (error) {
      console.error('导入任务失败:', error);
      return 0;
    }
  });

  // 清空已完成任务
  ipcMain.handle('clear-completed', () => {
    try {
      const count = clearCompletedTasks();
      return count;
    } catch (error) {
      console.error('清空已完成任务失败:', error);
      return 0;
    }
  });

  // 获取所有标签
  ipcMain.handle('load-tabs', () => {
    try {
      const tabs = getAllTabs();
      return tabs;
    } catch (error) {
      console.error('加载标签失败:', error);
      return [];
    }
  });

  // 保存标签
  ipcMain.handle('save-tab', (_, tab) => {
    try {
      if (tab.id) {
        const updated = updateTab(tab.id, tab);
        return updated;
      } else {
        const created = createTab(tab);
        return created;
      }
    } catch (error) {
      console.error('保存标签失败:', error);
      return null;
    }
  });

  // 删除标签
  ipcMain.handle('delete-tab', (_, tabId) => {
    try {
      deleteTab(tabId);
      return true;
    } catch (error) {
      console.error('删除标签失败:', error);
      return false;
    }
  });

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具（独立窗口模式，更明显）
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 窗口加载完成后执行数据迁移
  mainWindow.webContents.on('did-finish-load', async () => {
    // 延迟一点以确保React应用完全加载
    setTimeout(async () => {
      const result = await performMigration(mainWindow);
      if (result.status === 'success') {
        console.log(`[YamList] 数据迁移完成，导入了 ${result.count} 个任务`);
        // 通知渲染进程刷新数据
        mainWindow.webContents.send('migration-completed', result);
      }
    }, 1000);
  });
}

// 应用就绪
app.whenReady().then(initialize);

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 激活应用
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initialize();
  }
});

// 应用退出前
app.on('will-quit', () => {
  // 关闭数据库连接（确保数据正确写入磁盘）
  console.log('[YamList] 应用即将退出，正在清理资源...');
  closeDatabase();
  // 注销所有快捷键
  globalShortcut.unregisterAll();
  console.log('[YamList] 资源清理完成');
});

// 导出
module.exports = { mainWindow };
