import React, { useState, useEffect } from 'react';
import { Task } from '../../stores/taskStore';
import { useTabStore } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useToastStore } from '../../stores/toastStore';
import './AddTaskDialog.css';

interface EditTaskDialogProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (taskId: number, updates: Partial<Task>) => void;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  isOpen,
  task,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [repeatType, setRepeatType] = useState('');
  const [tabId, setTabId] = useState('');
  const [note, setNote] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'pending' | 'progress' | 'done' | 'strike'>('pending');

  const { tabs } = useTabStore();
  // 只显示自定义标签
  const customTabs = tabs.filter((tab) => tab.type === 'custom');

  // 当task变化时，更新表单
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDueDate(task.due_date || '');
      setDueTime(task.due_time || '');
      setRepeatType(task.repeat_type || '');
      setTabId(task.tab_id || '');
      setNote(task.note || '');
      setIsPinned(task.is_pinned || false);
      setProgress(task.progress || 0);
      setStatus(task.status || 'pending');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast(t('taskTitle'), 'warning');
      return;
    }

    onSubmit(task.id, {
      title: title.trim(),
      due_date: dueDate || undefined,
      due_time: dueTime || undefined,
      repeat_type: repeatType as any,
      tab_id: tabId || undefined,
      note: note || undefined,
      is_pinned: isPinned,
      progress: progress,
      status: status,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">✏️ {t('editTask')}</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          {/* 任务标题 */}
          <div className="form-group">
            <label className="form-label">{t('taskTitle')} *</label>
            <input
              type="text"
              className="form-input"
              placeholder={`${t('taskTitle')}...`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* 日期和时间 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">📅 {t('dueDate')}</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">⏰ {t('dueDate')}</label>
              <input
                type="time"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* 重复类型 */}
          <div className="form-group">
            <label className="form-label">🔁 {t('tabRepeat')}</label>
            <select
              className="form-select"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
            >
              <option value="">{t('tabRepeat')}</option>
              <option value="daily">{t('tabRepeat')} - {t('monday')}</option>
              <option value="weekly">{t('week')}</option>
              <option value="monthly">{t('monthView')}</option>
            </select>
          </div>

          {/* 标签 */}
          <div className="form-group">
            <label className="form-label">🏷️ {t('tags')}</label>
            <select
              className="form-select"
              value={tabId}
              onChange={(e) => setTabId(e.target.value)}
            >
              <option value="">{t('tags')}</option>
              {customTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* 备注 */}
          <div className="form-group">
            <label className="form-label">📝 {t('taskDescription')}</label>
            <textarea
              className="form-textarea"
              placeholder={`${t('taskDescription')}...`}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* 状态选择 */}
          <div className="form-group">
            <label className="form-label">📍 {t('task')}</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="pending">⭕ {t('incomplete')}</option>
              <option value="progress">⏳ {t('incomplete')}</option>
              <option value="done">✓ {t('completed')}</option>
            </select>
          </div>

          {/* 进度条 - 仅在"进行中"状态显示 */}
          {status === 'progress' && (
            <div className="form-group">
              <label className="form-label">📊 {t('task')}: {progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  accentColor: '#8b5cf6',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#888',
                marginTop: '4px',
              }}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* 置顶选项 */}
          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              <span>📌 置顶任务</span>
            </label>
          </div>

          {/* 按钮组 */}
          <div className="dialog-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
