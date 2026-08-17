const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = null;

/**
 * 初始化数据库
 */
function setupDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'yamlist.db');

  console.log('[Database] 用户数据目录:', userDataPath);
  console.log('[Database] 数据库路径:', dbPath);

  // 创建数据库连接
  db = new Database(dbPath);

  // 启用外键约束
  db.pragma('foreign_keys = ON');

  // 创建表
  createTables();

  // 初始化默认数据
  initializeDefaultData();

  console.log('[Database] 数据库初始化成功');
  return db;
}

/**
 * 创建数据库表
 */
function createTables() {
  // 任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      note TEXT,
      tab_id INTEGER,

      due_date TEXT,
      due_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      completed_at TEXT,

      repeat_type TEXT DEFAULT 'none',
      repeat_config TEXT,
      last_triggered TEXT,
      next_trigger TEXT,

      reminder_advance INTEGER,
      is_overdue BOOLEAN DEFAULT 0,

      is_pinned BOOLEAN DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      color_tag TEXT
    )
  `);

  // 任务历史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT,
      completed_at TEXT NOT NULL,
      note TEXT,
      mood_snapshot TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  // 标签表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tabs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '📋',
      label_short TEXT,
      type TEXT NOT NULL,
      color TEXT DEFAULT '#8B5CF6',
      order_index INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      filter_rules TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 心情签名表
  db.exec(`
    CREATE TABLE IF NOT EXISTS mood_signatures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      text TEXT,
      emoji TEXT,
      background_type TEXT,
      background_value TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // 快捷键表
  db.exec(`
    CREATE TABLE IF NOT EXISTS hotkeys (
      action TEXT PRIMARY KEY,
      keys TEXT NOT NULL,
      description TEXT
    )
  `);

  // 背景图表
  db.exec(`
    CREATE TABLE IF NOT EXISTS backgrounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      path TEXT,
      type TEXT,
      is_active BOOLEAN DEFAULT 0
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_tab ON tasks(tab_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks(is_overdue);
    CREATE INDEX IF NOT EXISTS idx_history_task ON task_history(task_id);
    CREATE INDEX IF NOT EXISTS idx_mood_date ON mood_signatures(date);
  `);
}

/**
 * 初始化默认数据
 */
function initializeDefaultData() {
  // 检查是否已有标签
  const tabCount = db.prepare('SELECT COUNT(*) as count FROM tabs').get();

  if (tabCount.count === 0) {
    // 插入系统标签
    const insertTab = db.prepare(`
      INSERT INTO tabs (name, icon, label_short, type, order_index, filter_rules)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertTab.run('全部待办', '📋', '全部', 'system', 0, '{}');
    insertTab.run('已完成', '✓', '已完', 'system', 1, '{"status": "done"}');
    insertTab.run('重复任务', '🔁', '重复', 'system', 2, '{"repeat_type": "!none"}');

    // 插入默认自定义标签
    insertTab.run('工作', '💼', '工作', 'custom', 3, '{}');
    insertTab.run('生活', '🏠', '生活', 'custom', 4, '{}');
    insertTab.run('学习', '📚', '学习', 'custom', 5, '{}');
  }
}

/**
 * 获取数据库实例
 */
function getDatabase() {
  if (!db) {
    setupDatabase();
  }
  return db;
}

// ==================== 任务 CRUD 操作 ====================

/**
 * 获取所有任务
 */
function getAllTasks() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks ORDER BY is_pinned DESC, order_index ASC').all();
}

/**
 * 根据ID获取任务
 */
function getTaskById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * 创建任务
 */
function createTask(task) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO tasks (
      title, status, progress, note, tab_id,
      due_date, due_time, repeat_type, repeat_config,
      is_pinned, order_index
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    task.title,
    task.status || 'pending',
    task.progress || 0,
    task.note || null,
    task.tab_id || null,
    task.due_date || null,
    task.due_time || null,
    task.repeat_type || 'none',
    task.repeat_config ? JSON.stringify(task.repeat_config) : null,
    task.is_pinned || false,
    task.order_index || 0
  );

  return { id: result.lastInsertRowid, ...task };
}

/**
 * 更新任务
 */
function updateTask(id, updates) {
  const db = getDatabase();

  const fields = [];
  const values = [];

  Object.keys(updates).forEach((key) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      // 如果是对象，转换为JSON字符串
      values.push(
        typeof updates[key] === 'object' && updates[key] !== null
          ? JSON.stringify(updates[key])
          : updates[key]
      );
    }
  });

  if (fields.length === 0) return;

  values.push(id);
  fields.push('updated_at = CURRENT_TIMESTAMP');

  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getTaskById(id);
}

/**
 * 删除任务
 */
function deleteTask(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
  return true;
}

/**
 * 批量导入任务（用于数据迁移）
 */
function importTasks(tasks) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO tasks (
      id, title, status, progress, note, tab_id,
      due_date, due_time, repeat_type, repeat_config,
      is_pinned, order_index, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((tasks) => {
    for (const task of tasks) {
      stmt.run(
        task.id,
        task.title,
        task.status || 'pending',
        task.progress || 0,
        task.note || null,
        task.tab_id || null,
        task.due_date || null,
        task.due_time || null,
        task.repeat_type || 'none',
        task.repeat_config ? JSON.stringify(task.repeat_config) : null,
        task.is_pinned || false,
        task.order_index || 0,
        task.created_at || new Date().toISOString()
      );
    }
  });

  insertMany(tasks);
  return tasks.length;
}

/**
 * 清空已完成的任务
 */
function clearCompletedTasks() {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM tasks WHERE status = ?');
  const result = stmt.run('done');
  return result.changes;
}

// ==================== 标签 CRUD 操作 ====================

/**
 * 获取所有标签
 */
function getAllTabs() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tabs WHERE is_visible = 1 ORDER BY order_index').all();
}

/**
 * 创建标签
 */
function createTab(tab) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO tabs (name, icon, label_short, type, color, order_index, filter_rules)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    tab.name,
    tab.icon || '📋',
    tab.label_short || tab.name.substring(0, 2),
    tab.type || 'custom',
    tab.color || '#8B5CF6',
    tab.order_index || 0,
    tab.filter_rules ? JSON.stringify(tab.filter_rules) : '{}'
  );

  return { id: result.lastInsertRowid, ...tab };
}

/**
 * 更新标签
 */
function updateTab(id, updates) {
  const db = getDatabase();
  const fields = [];
  const values = [];

  Object.keys(updates).forEach((key) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(
        typeof updates[key] === 'object' && updates[key] !== null
          ? JSON.stringify(updates[key])
          : updates[key]
      );
    }
  });

  if (fields.length === 0) return;

  values.push(id);
  const stmt = db.prepare(`UPDATE tabs SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return db.prepare('SELECT * FROM tabs WHERE id = ?').get(id);
}

/**
 * 删除标签
 */
function deleteTab(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM tabs WHERE id = ?');
  stmt.run(id);
  return true;
}

/**
 * 关闭数据库连接
 * 确保所有数据正确写入磁盘
 */
function closeDatabase() {
  if (db) {
    try {
      console.log('[Database] 正在关闭数据库连接...');
      db.close();
      db = null;
      console.log('[Database] 数据库已安全关闭');
    } catch (error) {
      console.error('[Database] 关闭数据库时出错:', error);
    }
  }
}

module.exports = {
  setupDatabase,
  getDatabase,
  // 任务操作
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  importTasks,
  clearCompletedTasks,
  // 标签操作
  getAllTabs,
  createTab,
  updateTab,
  deleteTab,
  closeDatabase,
};
