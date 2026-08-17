import React, { useState, useMemo } from 'react';
import { Task, useTaskStore } from '../../stores/taskStore';
import { formatDateWithWeekday } from '../../utils/dateFormat';
import { useTranslation } from '../../i18n/useTranslation';
import './AddTaskDialog.css';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { tasks } = useTaskStore();

  // 搜索任务
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const noteMatch = task.note?.toLowerCase().includes(query);
      return titleMatch || noteMatch;
    });
  }, [searchQuery, tasks]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setSearchQuery('');
    }
  };

  const handleSelectTask = (task: Task) => {
    onSelectTask(task);
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">🔍 {t('search')}</h2>
          <button
            className="dialog-close-btn"
            onClick={() => {
              onClose();
              setSearchQuery('');
            }}
          >
            ✕
          </button>
        </div>

        <div className="dialog-form" style={{ maxHeight: '70vh' }}>
          {/* 搜索输入框 */}
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder={`${t('search')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* 搜索结果 */}
          <div className="search-results">
            {searchQuery.trim() === '' ? (
              <div className="search-placeholder">
                <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>🔍</div>
                <div style={{ color: '#999', fontSize: '14px' }}>{t('search')}</div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="search-placeholder">
                <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>😢</div>
                <div style={{ color: '#999', fontSize: '14px' }}>{t('noTasks')}</div>
              </div>
            ) : (
              <div className="search-result-list">
                {searchResults.map((task) => (
                  <div
                    key={task.id}
                    className="search-result-item"
                    onClick={() => handleSelectTask(task)}
                  >
                    <div className="search-result-title">
                      {task.status === 'done' && <span style={{ marginRight: '8px' }}>✓</span>}
                      {task.title}
                    </div>
                    {task.note && (
                      <div className="search-result-note">💬 {task.note}</div>
                    )}
                    {task.due_date && (
                      <div className="search-result-meta">
                        📅 {formatDateWithWeekday(task.due_date)} {task.due_time || ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
