import React, { useState, useEffect } from 'react';
import { useDiaryStore } from '../../stores/diaryStore';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';
import './DiaryDialog.css';

interface DiaryDialogProps {
  isOpen: boolean;
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

export const DiaryDialog: React.FC<DiaryDialogProps> = ({ isOpen, date, onClose }) => {
  const { getDiaryByDate, saveDiary, deleteDiary } = useDiaryStore();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (isOpen && date) {
      const diary = getDiaryByDate(date);
      setContent(diary?.content || '');
      setWordCount(diary?.content.length || 0);
    }
  }, [isOpen, date, getDiaryByDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (content.trim()) {
      saveDiary(date, content.trim());
    } else {
      deleteDiary(date);
    }
    onClose();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.length);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];
    const weekday = weekdays[d.getDay()];
    return `${year}年${month}月${day}日 ${weekday}`;
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog diary-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="diary-header-content">
            <h2 className="dialog-title">📔 {t('diary')}</h2>
            <div className="diary-date">{formatDate(date)}</div>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form diary-form">
          <div className="diary-editor">
            <textarea
              className="diary-textarea"
              placeholder={t('diaryPlaceholder')}
              value={content}
              onChange={handleContentChange}
              autoFocus
            />
            <div className="diary-footer">
              <div className="diary-word-count">
                {wordCount} {t('characters')}
              </div>
              <div className="diary-tips">
                💡 {t('diaryTip')}
              </div>
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              {t('cancel')}
            </button>
            {content.trim() && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (confirm(t('confirmDeleteDiary'))) {
                    deleteDiary(date);
                    onClose();
                  }
                }}
              >
                {t('delete')}
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
