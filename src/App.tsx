import { useState, useEffect } from 'react';
import { ToothTabs } from './components/ToothTabs/ToothTabs';
import { MoodSection } from './components/Layout/MoodSection';
import { ActionBar } from './components/Layout/ActionBar';
import { TaskList } from './components/Task/TaskList';
import { AddTaskButton } from './components/Task/AddTaskButton';
import { BottomBar } from './components/Layout/BottomBar';
import { ResizeHandle } from './components/Layout/ResizeHandle';
import { ToastContainer } from './components/Toast/Toast';
import { AddTaskDialog } from './components/Task/AddTaskDialog';
import { EditTaskDialog } from './components/Task/EditTaskDialog';
import { SearchDialog } from './components/Task/SearchDialog';
import { ExportDialog } from './components/Export/ExportDialog';
import { ImportDialog } from './components/Import/ImportDialog';
import { StatsDialog } from './components/Statistics/StatsDialog';
import { TabManageDialog } from './components/Tab/TabManageDialog';
import { HotkeyDialog } from './components/Settings/HotkeyDialog';
import { SettingsDialog } from './components/Settings/SettingsDialog';
import { BackgroundDialog } from './components/Settings/BackgroundDialog';
import { DataDialog } from './components/Data/DataDialog';
import { useUIStore } from './stores/uiStore';
import { useTaskStore, Task } from './stores/taskStore';
import { useThemeStore } from './stores/themeStore';
import { useBackgroundStore } from './stores/backgroundStore';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isTabManageDialogOpen, setIsTabManageDialogOpen] = useState(false);
  const [isHotkeyDialogOpen, setIsHotkeyDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isBackgroundDialogOpen, setIsBackgroundDialogOpen] = useState(false);
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { isLocked } = useUIStore();
  const { addTask, updateTask } = useTaskStore();
  const { colors, updateThemeFromTopColor } = useThemeStore();
  const { topColor, taskAreaColor, opacity, backgroundImage } = useBackgroundStore();

  // 初始化主题（从已保存的topColor）
  useEffect(() => {
    updateThemeFromTopColor(topColor);
  }, []);

  // 监听主题变化，注入CSS变量
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--primary-light', colors.primaryLight);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--gradient-start', colors.gradientStart);
    root.style.setProperty('--gradient-mid', colors.gradientMid);
    root.style.setProperty('--gradient-end', colors.gradientEnd);
    root.style.setProperty('--accent-bg', colors.accentBg);
    root.style.setProperty('--border-color', colors.borderColor);
    root.style.setProperty('--shadow-color', colors.shadowColor);

    // 提取RGB值用于不同透明度
    const rgb = colors.primary.match(/#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/);
    if (rgb) {
      const r = parseInt(rgb[1], 16);
      const g = parseInt(rgb[2], 16);
      const b = parseInt(rgb[3], 16);
      root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }

    // 注入用户自定义的背景颜色
    root.style.setProperty('--top-color', topColor);
    root.style.setProperty('--task-area-color', taskAreaColor);
    root.style.setProperty('--window-opacity', String(opacity / 100));
    root.style.setProperty('--background-image', backgroundImage ? `url(${backgroundImage})` : 'none');
  }, [colors, topColor, taskAreaColor, opacity, backgroundImage]);

  useEffect(() => {
    // 监听快捷键触发
    const unsubscribeHotkey = window.electronAPI.onHotkeyTriggered((action) => {
      switch (action) {
        case 'toggle-lock':
          window.electronAPI.toggleLock();
          break;
        case 'new-task':
          setIsAddDialogOpen(true);
          break;
        case 'search':
          setIsSearchDialogOpen(true);
          break;
      }
    });

    // 监听托盘操作
    const unsubscribeTray = window.electronAPI.onTrayAction((action) => {
      if (action === 'hotkey-settings') {
        setIsHotkeyDialogOpen(true);
      }
    });

    return () => {
      unsubscribeHotkey();
      unsubscribeTray();
    };
  }, []);

  const handleAddTask = (taskData: any) => {
    addTask(taskData);
    setIsAddDialogOpen(false);
  };

  const handleEditTask = (taskId: number, updates: Partial<Task>) => {
    updateTask(taskId, updates);
    setIsEditDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSearchSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsSearchDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  return (
    <div className={`app-container ${isLocked ? 'locked' : ''}`}>
      {/* 牙齿标签栏 */}
      <ToothTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 主窗口 */}
      <div className="main-window">
        {/* 心情签名区 */}
        <MoodSection />

        {/* 操作栏 */}
        <ActionBar
          onCalendarClick={() => window.electronAPI.openCalendar()}
          onSearchClick={() => setIsSearchDialogOpen(true)}
          onManageTabsClick={() => setIsTabManageDialogOpen(true)}
          onStatsClick={() => setIsStatsDialogOpen(true)}
          onBackgroundClick={() => setIsBackgroundDialogOpen(true)}
          onSettingsClick={() => setIsSettingsDialogOpen(true)}
        />

        {/* 任务列表 */}
        <TaskList activeTab={activeTab} onEditTask={handleTaskClick} />

        {/* 新建任务按钮 */}
        <AddTaskButton onClick={() => setIsAddDialogOpen(true)} />

        {/* 底部栏 */}
        <BottomBar
          onStatsClick={() => setIsStatsDialogOpen(true)}
          onDataClick={() => setIsDataDialogOpen(true)}
          onHotkeyClick={() => setIsHotkeyDialogOpen(true)}
        />
      </div>

      {/* 添加任务对话框 */}
      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* 编辑任务对话框 */}
      <EditTaskDialog
        isOpen={isEditDialogOpen}
        task={selectedTask}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
      />

      {/* 搜索对话框 */}
      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        onSelectTask={handleSearchSelectTask}
      />

      {/* 导出对话框 */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />

      {/* 导入对话框 */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />

      {/* 统计对话框 */}
      <StatsDialog
        isOpen={isStatsDialogOpen}
        onClose={() => setIsStatsDialogOpen(false)}
      />

      {/* 标签管理对话框 */}
      <TabManageDialog
        isOpen={isTabManageDialogOpen}
        onClose={() => setIsTabManageDialogOpen(false)}
      />

      {/* 快捷键设置对话框 */}
      <HotkeyDialog
        isOpen={isHotkeyDialogOpen}
        onClose={() => setIsHotkeyDialogOpen(false)}
      />

      {/* 设置对话框（包含窗口大小和语言设置） */}
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />

      {/* 背景设置对话框 */}
      <BackgroundDialog
        isOpen={isBackgroundDialogOpen}
        onClose={() => setIsBackgroundDialogOpen(false)}
      />

      {/* 数据管理对话框 */}
      <DataDialog
        isOpen={isDataDialogOpen}
        onClose={() => setIsDataDialogOpen(false)}
        onExportClick={() => {
          setIsDataDialogOpen(false);
          setIsExportDialogOpen(true);
        }}
        onImportClick={() => {
          setIsDataDialogOpen(false);
          setIsImportDialogOpen(true);
        }}
      />

      {/* 锁定提示 */}
      {isLocked && (
        <div className="lock-overlay">
          <div className="lock-icon">🔒</div>
        </div>
      )}

      {/* 窗口调整大小控制 */}
      <ResizeHandle />

      {/* Toast 通知 */}
      <ToastContainer />
    </div>
  );
}

export default App;
