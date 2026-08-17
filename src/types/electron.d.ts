/**
 * Electron API 类型定义
 * 定义 preload.js 暴露给渲染进程的 API 类型
 */

export interface ElectronAPI {
  // ==================== 窗口控制 ====================
  /**
   * 最小化窗口
   */
  minimize: () => void;

  /**
   * 关闭窗口
   */
  close: () => void;

  /**
   * 调整窗口大小
   */
  resizeWindow: (width: number, height: number) => void;

  /**
   * 打开日历窗口
   */
  openCalendar: () => void;

  /**
   * 关闭日历窗口
   */
  closeCalendar: () => void;

  /**
   * 获取当前窗口大小
   */
  getWindowSize: () => Promise<{ width: number; height: number }>;

  // ==================== 锁定模式 ====================
  /**
   * 切换锁定/解锁状态
   */
  toggleLock: () => void;

  /**
   * 获取当前锁定状态
   */
  getLockState: () => void;

  /**
   * 监听锁定状态变化
   * @param callback - 回调函数，接收 locked (boolean) 参数
   * @returns 清理函数，用于取消订阅
   */
  onLockStateChanged: (callback: (locked: boolean) => void) => () => void;

  /**
   * 监听解锁区域鼠标进入事件
   * @param callback - 回调函数
   * @returns 清理函数
   */
  onUnlockAreaEnter: (callback: () => void) => () => void;

  /**
   * 监听解锁区域鼠标离开事件
   * @param callback - 回调函数
   * @returns 清理函数
   */
  onUnlockAreaLeave: (callback: () => void) => () => void;

  /**
   * 通知主进程鼠标进入解锁区域
   */
  notifyUnlockAreaEnter: () => void;

  /**
   * 通知主进程鼠标离开解锁区域
   */
  notifyUnlockAreaLeave: () => void;

  // ==================== 快捷键 ====================
  /**
   * 监听快捷键触发事件
   * @param callback - 回调函数，接收 action (string) 参数
   * @returns 清理函数
   */
  onHotkeyTriggered: (callback: (action: string) => void) => () => void;

  /**
   * 获取当前快捷键配置
   * @returns Promise<快捷键配置>
   */
  getHotkeys: () => Promise<{
    toggleLock: string;
    toggleWindow: string;
    newTask: string;
    search: string;
  }>;

  /**
   * 保存快捷键配置
   * @param hotkeys - 快捷键配置
   * @returns Promise<是否保存成功>
   */
  saveHotkeys: (hotkeys: {
    toggleLock: string;
    toggleWindow: string;
    newTask: string;
    search: string;
  }) => Promise<boolean>;

  // ==================== 系统托盘 ====================
  /**
   * 监听托盘操作
   * @param callback - 回调函数，接收 action (string) 参数
   * @returns 清理函数
   */
  onTrayAction: (callback: (action: string) => void) => () => void;

  // ==================== 数据库操作（现已启用） ====================
  /**
   * 加载所有任务
   * @returns Promise<任务列表>
   */
  loadTasks: () => Promise<any[]>;

  /**
   * 保存任务（创建或更新）
   * @param task - 任务对象
   * @returns Promise<保存后的任务对象>
   */
  saveTask: (task: any) => Promise<any>;

  /**
   * 删除任务
   * @param taskId - 任务ID
   * @returns Promise<是否删除成功>
   */
  deleteTask: (taskId: number) => Promise<boolean>;

  /**
   * 批量导入任务（用于数据迁移）
   * @param tasks - 任务列表
   * @returns Promise<导入的任务数量>
   */
  importTasks: (tasks: any[]) => Promise<number>;

  /**
   * 清空已完成的任务
   * @returns Promise<清空的任务数量>
   */
  clearCompleted: () => Promise<number>;

  /**
   * 加载所有标签
   * @returns Promise<标签列表>
   */
  loadTabs: () => Promise<any[]>;

  /**
   * 保存标签（创建或更新）
   * @param tab - 标签对象
   * @returns Promise<保存后的标签对象>
   */
  saveTab: (tab: any) => Promise<any>;

  /**
   * 删除标签
   * @param tabId - 标签ID
   * @returns Promise<是否删除成功>
   */
  deleteTab: (tabId: number) => Promise<boolean>;

  // ==================== 通知 ====================
  /**
   * 显示系统通知
   * @param title - 通知标题
   * @param body - 通知内容
   */
  showNotification: (title: string, body: string) => void;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
