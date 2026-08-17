/**
 * 数据迁移工具
 * 将localStorage中的数据迁移到SQLite数据库
 */

const { getDatabase, importTasks, getAllTabs } = require('./database');
const Store = require('electron-store');

/**
 * 执行数据迁移
 * @param {BrowserWindow} mainWindow - 主窗口实例
 */
async function performMigration(mainWindow) {
  try {
    const db = getDatabase();

    // 检查数据库是否已有数据
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();

    if (taskCount.count > 0) {
      console.log('[Migrate] 数据库已有数据，跳过迁移');
      return {
        status: 'skipped',
        reason: 'database_not_empty',
      };
    }

    console.log('[Migrate] 开始从localStorage迁移数据...');

    // 等待渲染进程加载完成
    await new Promise((resolve) => {
      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once('did-finish-load', resolve);
      } else {
        resolve();
      }
    });

    // 从渲染进程获取localStorage数据
    const tasks = await mainWindow.webContents.executeJavaScript(`
      (function() {
        try {
          const storage = localStorage.getItem('task-storage');
          if (storage) {
            const data = JSON.parse(storage);
            return data.state?.tasks || [];
          }
          return [];
        } catch (error) {
          console.error('读取localStorage失败:', error);
          return [];
        }
      })();
    `);

    if (tasks && tasks.length > 0) {
      console.log(`[Migrate] 找到 ${tasks.length} 个任务，开始导入...`);

      // 导入任务到数据库
      const count = importTasks(tasks);

      console.log(`[Migrate] 成功导入 ${count} 个任务`);

      // 清空localStorage中的任务数据（可选）
      // await mainWindow.webContents.executeJavaScript(`
      //   localStorage.removeItem('task-storage');
      // `);

      return {
        status: 'success',
        count: count,
      };
    } else {
      console.log('[Migrate] localStorage中没有任务数据');
      return {
        status: 'no_data',
      };
    }
  } catch (error) {
    console.error('[Migrate] 数据迁移失败:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * 检查是否需要迁移
 */
function needsMigration() {
  try {
    const db = getDatabase();
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
    return taskCount.count === 0;
  } catch (error) {
    console.error('[Migrate] 检查迁移状态失败:', error);
    return false;
  }
}

module.exports = {
  performMigration,
  needsMigration,
};
