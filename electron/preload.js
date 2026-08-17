const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload 脚本 - 在渲染进程和主进程之间提供安全的桥接
 *
 * 安全原则：
 * 1. 只暴露必要的 API
 * 2. 不暴露完整的 ipcRenderer
 * 3. 对所有输入进行验证
 * 4. 返回清理函数以防止内存泄漏
 */

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // ==================== 窗口控制 ====================

  /**
   * 通用发送消息到主进程
   * @param {string} channel - 消息通道
   * @param {any} data - 数据
   */
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },

  /**
   * 最小化窗口
   */
  minimize: () => {
    ipcRenderer.send('window-minimize');
  },

  /**
   * 关闭窗口
   */
  close: () => {
    ipcRenderer.send('window-close');
  },

  /**
   * 重启应用
   */
  restartApp: () => {
    ipcRenderer.send('app-restart');
  },

  /**
   * 调整窗口大小
   */
  resizeWindow: (width, height) => {
    ipcRenderer.send('window-resize', width, height);
  },

  /**
   * 打开日历窗口
   */
  openCalendar: () => {
    ipcRenderer.send('calendar-open');
  },

  /**
   * 关闭日历窗口
   */
  closeCalendar: () => {
    ipcRenderer.send('calendar-close');
  },

  /**
   * 获取当前窗口大小
   */
  getWindowSize: () => {
    return ipcRenderer.invoke('get-window-size');
  },

  // ==================== 锁定模式 ====================

  /**
   * 切换锁定/解锁状态
   */
  toggleLock: () => {
    ipcRenderer.send('toggle-lock');
  },

  /**
   * 获取当前锁定状态
   */
  getLockState: () => {
    ipcRenderer.send('get-lock-state');
  },

  /**
   * 监听锁定状态变化
   * @param {Function} callback - 回调函数，接收 locked (boolean) 参数
   * @returns {Function} 清理函数，用于取消订阅
   */
  onLockStateChanged: (callback) => {
    const subscription = (_, locked) => {
      if (typeof locked === 'boolean') {
        callback(locked);
      }
    };

    ipcRenderer.on('lock-state-changed', subscription);

    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('lock-state-changed', subscription);
    };
  },

  /**
   * 监听解锁区域鼠标进入事件（用于锁定模式下的交互）
   * @param {Function} callback - 回调函数
   * @returns {Function} 清理函数
   */
  onUnlockAreaEnter: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('unlock-area-enter', subscription);
    return () => ipcRenderer.removeListener('unlock-area-enter', subscription);
  },

  /**
   * 监听解锁区域鼠标离开事件
   * @param {Function} callback - 回调函数
   * @returns {Function} 清理函数
   */
  onUnlockAreaLeave: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('unlock-area-leave', subscription);
    return () => ipcRenderer.removeListener('unlock-area-leave', subscription);
  },

  /**
   * 通知主进程鼠标进入解锁区域
   */
  notifyUnlockAreaEnter: () => {
    ipcRenderer.send('unlock-area-mouse-enter');
  },

  /**
   * 通知主进程鼠标离开解锁区域
   */
  notifyUnlockAreaLeave: () => {
    ipcRenderer.send('unlock-area-mouse-leave');
  },

  // ==================== 快捷键 ====================

  /**
   * 监听快捷键触发事件
   * @param {Function} callback - 回调函数，接收 action (string) 参数
   * @returns {Function} 清理函数
   */
  onHotkeyTriggered: (callback) => {
    const subscription = (_, action) => {
      if (typeof action === 'string') {
        callback(action);
      }
    };

    ipcRenderer.on('hotkey-triggered', subscription);

    return () => {
      ipcRenderer.removeListener('hotkey-triggered', subscription);
    };
  },

  /**
   * 获取当前快捷键配置
   * @returns {Promise<Object>} 快捷键配置
   */
  getHotkeys: () => {
    return ipcRenderer.invoke('get-hotkeys');
  },

  /**
   * 保存快捷键配置
   * @param {Object} hotkeys - 快捷键配置
   * @returns {Promise<boolean>} 是否保存成功
   */
  saveHotkeys: (hotkeys) => {
    return ipcRenderer.invoke('save-hotkeys', hotkeys);
  },

  // ==================== 系统托盘 ====================

  /**
   * 监听托盘操作
   * @param {Function} callback - 回调函数，接收 action (string) 参数
   * @returns {Function} 清理函数
   */
  onTrayAction: (callback) => {
    const subscription = (_, action) => {
      if (typeof action === 'string') {
        callback(action);
      }
    };

    ipcRenderer.on('tray-action', subscription);

    return () => {
      ipcRenderer.removeListener('tray-action', subscription);
    };
  },

  // ==================== 数据库操作（现已启用） ====================

  /**
   * 加载所有任务
   * @returns {Promise<Array>} 任务列表
   */
  loadTasks: () => {
    return ipcRenderer.invoke('load-tasks');
  },

  /**
   * 保存任务（创建或更新）
   * @param {Object} task - 任务对象
   * @returns {Promise<Object>} 保存后的任务对象
   */
  saveTask: (task) => {
    return ipcRenderer.invoke('save-task', task);
  },

  /**
   * 删除任务
   * @param {number} taskId - 任务ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  deleteTask: (taskId) => {
    return ipcRenderer.invoke('delete-task', taskId);
  },

  /**
   * 批量导入任务（用于数据迁移）
   * @param {Array} tasks - 任务列表
   * @returns {Promise<number>} 导入的任务数量
   */
  importTasks: (tasks) => {
    return ipcRenderer.invoke('import-tasks', tasks);
  },

  /**
   * 清空已完成的任务
   * @returns {Promise<number>} 清空的任务数量
   */
  clearCompleted: () => {
    return ipcRenderer.invoke('clear-completed');
  },

  /**
   * 加载所有标签
   * @returns {Promise<Array>} 标签列表
   */
  loadTabs: () => {
    return ipcRenderer.invoke('load-tabs');
  },

  /**
   * 保存标签（创建或更新）
   * @param {Object} tab - 标签对象
   * @returns {Promise<Object>} 保存后的标签对象
   */
  saveTab: (tab) => {
    return ipcRenderer.invoke('save-tab', tab);
  },

  /**
   * 删除标签
   * @param {number} tabId - 标签ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  deleteTab: (tabId) => {
    return ipcRenderer.invoke('delete-tab', tabId);
  },

  // ==================== 通知 ====================

  /**
   * 显示系统通知（预留接口）
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   */
  showNotification: (title, body) => {
    if (typeof title === 'string' && typeof body === 'string') {
      ipcRenderer.send('show-notification', { title, body });
    }
  },
});

// 在控制台输出加载信息（仅开发环境）
console.log('[Preload] 安全 API 已加载');
