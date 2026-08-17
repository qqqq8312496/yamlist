import React, { useState } from 'react';
import { useTabStore } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useToastStore } from '../../stores/toastStore';
import './AddTaskDialog.css';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    due_date?: string;
    due_time?: string;
    repeat_type?: string;
    tab_id?: string;
    note?: string;
    is_pinned?: boolean;
  }) => void;
}

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isOpen,
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

  const { tabs } = useTabStore();
  // 只显示自定义标签
  const customTabs = tabs.filter((tab) => tab.type === 'custom');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast(t('taskTitle'), 'warning');
      return;
    }

    onSubmit({
      title: title.trim(),
      due_date: dueDate || undefined,
      due_time: dueTime || undefined,
      repeat_type: repeatType || undefined,
      tab_id: tabId || undefined,
      note: note || undefined,
      is_pinned: isPinned,
    });

    // 重置表单
    setTitle('');
    setDueDate('');
    setDueTime('');
    setRepeatType('');
    setTabId('');
    setNote('');
    setIsPinned(false);
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
          <h2 className="dialog-title">📝 {t('newTask')}</h2>
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
              {t('newTask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
