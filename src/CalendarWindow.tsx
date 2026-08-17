import React, { useState, useMemo, useEffect } from 'react';
import { useTaskStore } from './stores/taskStore';
import { useDiaryStore } from './stores/diaryStore';
import { useTranslation } from './i18n/useTranslation';
import { useThemeStore } from './stores/themeStore';
import { useBackgroundStore } from './stores/backgroundStore';
import { DiaryDialog } from './components/Diary/DiaryDialog';
import './components/Calendar/WeekCalendarDialog.css';

export const CalendarWindow: React.FC = () => {
  const { tasks } = useTaskStore();
  const { getDiaryByDate } = useDiaryStore();
  const { t } = useTranslation();
  const { colors, updateThemeFromTopColor } = useThemeStore();
  const { topColor, taskAreaColor, opacity, backgroundImage } = useBackgroundStore();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isDiaryDialogOpen, setIsDiaryDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 初始化主题（日历窗口独立初始化）
  useEffect(() => {
    updateThemeFromTopColor(topColor);
  }, []);

  // 注入CSS变量到日历窗口
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

    const rgb = colors.primary.match(/#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/);
    if (rgb) {
      const r = parseInt(rgb[1], 16);
      const g = parseInt(rgb[2], 16);
      const b = parseInt(rgb[3], 16);
      root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }

    root.style.setProperty('--top-color', topColor);
    root.style.setProperty('--task-area-color', taskAreaColor);
    root.style.setProperty('--window-opacity', String(opacity / 100));
    root.style.setProperty('--background-image', backgroundImage ? `url(${backgroundImage})` : 'none');
  }, [colors, topColor, taskAreaColor, opacity, backgroundImage]);

  // 获取本周的日期范围（周一到周日）
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      days.push(date);
    }
    return days;
  }, []);

  // 计算本周任务统计
  const weekStats = useMemo(() => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    const weekTasks = tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    const completed = weekTasks.filter(t => t.status === 'done').length;
    const total = weekTasks.length;
    const weekNumber = Math.ceil((weekStart.getDate() + 6 - weekStart.getDay()) / 7);

    return { weekNumber, completed, total };
  }, [weekDays, tasks]);

  // 获取本月的日历网格（包含上下月日期）
  const monthDays = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // 本月第一天
    const firstDay = new Date(year, month, 1);
    // 本月最后一天
    const lastDay = new Date(year, month + 1, 0);

    // 第一天是周几（0=周日，转换为周一=0）
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    // 最后一天是周几
    const lastDayOfWeek = lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1;

    const days: (Date | null)[] = [];

    // 添加上月末尾日期（填充到周一开始）
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    // 添加本月所有日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // 添加下月开头日期（填充到周日结束）
    const remainingDays = 6 - lastDayOfWeek;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return { days, currentMonth: month };
  }, []);

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const dayNamesEn = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // 获取指定日期的任务
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      return taskDateStr === dateStr;
    });
  };

  // 周历装饰区组件
  const renderWeekDecorator = () => {
    const percentage = weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0;

    return (
      <div className="week-decorator-card">
        <div className="decorator-icon">📅</div>
        <div className="decorator-sparkles">
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">✨</span>
          <span className="sparkle sparkle-3">⭐</span>
        </div>
        <div className="decorator-content">
          <div className="decorator-week">{t('weekNumber', weekStats.weekNumber)}</div>
          <div className="decorator-stats">
            <span className="stats-number">{weekStats.completed}</span>
            <span className="stats-divider">/</span>
            <span className="stats-total">{weekStats.total}</span>
          </div>
          <div className="decorator-label">{t('weekCompleted')}</div>
          {weekStats.total > 0 && (
            <div className="decorator-progress">
              <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDayCard = (date: Date, _index: number, isWeekView: boolean, isOtherMonth: boolean = false) => {
    const tasksForDay = getTasksForDate(date);
    const isToday = new Date().toDateString() === date.toDateString();
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 转换为周一=0
    const dateStr = date.toISOString().split('T')[0];
    const diary = getDiaryByDate(dateStr);
    const hasDiary = !!diary;

    const handleDiaryClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedDate(dateStr);
      setIsDiaryDialogOpen(true);
    };

    return (
      <div
        key={date.toISOString()}
        className={`day-card ${isWeekView ? 'week-view' : 'month-view'} ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
      >
        <div className="day-card-header">
          <div className="day-number-circle">{date.getDate()}</div>
          <div className="day-name-section">
            <div className="day-name-en">{dayNamesEn[dayIndex]}</div>
            <div className="day-name-cn">{dayNames[dayIndex]}</div>
          </div>
          <button
            className={`diary-btn ${hasDiary ? 'has-diary' : ''}`}
            onClick={handleDiaryClick}
            title={hasDiary ? t('diary') : t('diary')}
          >
            {hasDiary ? '📔' : '📓'}
          </button>
        </div>

        <div className="day-card-content">
          {/* 日记预览 - 显示在任务最上方 */}
          {hasDiary && (
            <div className="diary-preview-card" onClick={handleDiaryClick}>
              <div className="diary-preview-header">
                <span className="diary-preview-icon">📔</span>
                <span className="diary-preview-title">{t('diary')}</span>
              </div>
              <div className="diary-preview-content">
                {diary.content.length > 50
                  ? diary.content.substring(0, 50) + '...'
                  : diary.content}
              </div>
            </div>
          )}

          {/* 任务列表 */}
          {tasksForDay.length === 0 && !hasDiary ? (
            <div className="no-tasks-card">{t('noTasks')}</div>
          ) : (
            tasksForDay.map((task) => (
              <div
                key={task.id}
                className={`task-card ${task.status === 'done' ? 'done' : ''}`}
              >
                <div
                  className="task-card-indicator"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                ></div>
                <div className="task-card-title">{task.title}</div>
              </div>
            ))
          )}
        </div>

        <div className="day-card-footer">
          {tasksForDay.length > 0 && t('tasksCount', tasksForDay.length)}
        </div>
      </div>
    );
  };

  return (
    <div className="week-calendar-dialog large">
      <div className="dialog-header" style={{ cursor: 'default' }}>
        <h2 className="dialog-title">📅 {t('calendar')}</h2>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            {t('weekView')}
          </button>
          <button
            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            {t('monthView')}
          </button>
        </div>
        <button
          className="dialog-close-btn"
          onClick={() => window.electronAPI.closeCalendar()}
        >✕</button>
      </div>

      <div className="calendar-view-container">
        {viewMode === 'week' ? (
          <div className="week-grid-view">
            {renderWeekDecorator()}
            {weekDays.map((date, index) => renderDayCard(date, index, true, false))}
          </div>
        ) : (
          <div className="month-grid-view">
            {monthDays.days.map((date, index) => {
              if (!date) return null;
              const isOtherMonth = date.getMonth() !== monthDays.currentMonth;
              return renderDayCard(date, index, false, isOtherMonth);
            })}
          </div>
        )}
      </div>

      {/* 日记对话框 */}
      <DiaryDialog
        isOpen={isDiaryDialogOpen}
        date={selectedDate}
        onClose={() => setIsDiaryDialogOpen(false)}
      />
    </div>
  );
};
