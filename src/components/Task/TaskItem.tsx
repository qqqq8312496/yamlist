import React from 'react';
import { motion } from 'framer-motion';
import { Task, useTaskStore } from '../../stores/taskStore';
import { formatDateWithWeekday } from '../../utils/dateFormat';

interface TaskItemProps {
  task: Task;
  onEditClick?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEditClick }) => {
  const { toggleTaskStatus, deleteTask } = useTaskStore();

  const handleToggle = () => {
    toggleTaskStatus(task.id);
  };

  const handleClick = () => {
    if (onEditClick) {
      onEditClick(task);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除任务 "${task.title}" 吗？`)) {
      deleteTask(task.id);
    }
  };

  return (
    <motion.div
      className={`task-item ${task.is_overdue ? 'overdue' : ''} ${task.is_pinned ? 'pinned' : ''} ${task.status === 'done' ? 'done' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      layout
    >
      <div className="task-checkbox" onClick={handleToggle}>
        {task.status === 'done' ? '☑️' : '☐'}
      </div>

      <div className="task-content" onClick={handleClick}>
        <div className="task-title">{task.title}</div>
        {(task.due_date || task.repeat_type || task.is_pinned) && (
          <div className="task-meta">
            {task.is_pinned && <span className="meta-icon">📌</span>}
            {task.due_date && (
              <span className="meta-date">
                📅 {formatDateWithWeekday(task.due_date)} {task.due_time || ''}
              </span>
            )}
            {task.repeat_type && task.repeat_type !== 'none' && (
              <span className="meta-repeat">🔁</span>
            )}
            {task.is_overdue && <span className="meta-overdue">已逾期!</span>}
          </div>
        )}
        {task.note && <div className="task-note">💬 {task.note}</div>}
        {task.status === 'progress' && task.progress !== undefined && (
          <div className="task-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${task.progress}%` }} />
            </div>
            <div className="progress-text">{task.progress}%</div>
          </div>
        )}
      </div>

      <button className="task-delete-btn" onClick={handleDelete} title="删除任务">
        🗑️
      </button>
    </motion.div>
  );
};
