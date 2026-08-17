import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '../../stores/taskStore';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';
import './WeekCalendarDialog.css';

interface WeekCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskClick?: (taskId: number) => void;
}

export const WeekCalendarDialog: React.FC<WeekCalendarDialogProps> = ({ isOpen, onClose, onTaskClick }) => {
  const { tasks } = useTaskStore();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 当对话框打开时扩展窗口，关闭时恢复
  useEffect(() => {
    if (isOpen) {
      // window.electronAPI.expandWindow(); // TODO: 实现窗口扩展功能
      // 重置位置到居中
      setPosition({ x: 0, y: 0 });
    } else {
      // window.electronAPI.restoreWindow(); // TODO: 实现窗口恢复功能
    }
  }, [isOpen]);

  // 鼠标按下开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // 鼠标移动时更新位置
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 获取本周的日期范围（周一到周日）
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }, []);

  // 获取本月的30天
  const monthDays = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - 15 + i); // 前15天到后15天
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }, []);

  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekLabelsChinese = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // 根据日期筛选任务
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDateStr = task.due_date.split('T')[0];
      return taskDateStr === dateStr;
    });
  };

  if (!isOpen) return null;

  const renderDayCard = (date: Date, index: number, isWeekView: boolean) => {
    const tasksForDay = getTasksForDate(date);
    const isToday = new Date().toDateString() === date.toDateString();
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 转换为周一=0

    return (
      <div key={index} className={`day-card ${isToday ? 'today' : ''} ${isWeekView ? 'week-view' : 'month-view'}`}>
        <div className="day-card-header">
          <div className="day-number-circle">
            {date.getDate()}
          </div>
          <div className="day-name-section">
            <div className="day-name-en">{weekLabels[dayIndex]}</div>
            <div className="day-name-cn">{weekLabelsChinese[dayIndex]}</div>
          </div>
        </div>

        <div className="day-card-content">
          {tasksForDay.length === 0 ? (
            <div className="no-tasks-card">{t('noTasks')}</div>
          ) : (
            tasksForDay.map(task => (
              <div
                key={task.id}
                className={`task-card ${task.status === 'done' ? 'done' : ''} ${task.is_overdue ? 'overdue' : ''}`}
                onClick={() => onTaskClick?.(task.id)}
              >
                <div className="task-card-indicator" style={{
                  background: task.status === 'done' ? '#10b981' : task.is_overdue ? '#ef4444' : '#8b5cf6'
                }} />
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

  return createPortal(
    <div
      className="week-calendar-dialog large"
      style={{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div className="dialog-header" onMouseDown={handleMouseDown} style={{ cursor: 'grab' }}>
        <h2 className="dialog-title">📅 {t('calendar')}</h2>
        <div className="view-toggle" onMouseDown={(e) => e.stopPropagation()}>
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
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
        >✕</button>
      </div>

      <div className="calendar-view-container">
        {viewMode === 'week' ? (
          <div className="week-grid-view">
            {weekDays.map((date, index) => renderDayCard(date, index, true))}
          </div>
        ) : (
          <div className="month-grid-view">
            {monthDays.map((date, index) => renderDayCard(date, index, false))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
