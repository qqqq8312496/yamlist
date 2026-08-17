import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import './AddTaskButton.css';

interface AddTaskButtonProps {
  onClick?: () => void;
}

export const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div className="add-task-button-container">
      <button className="add-task-button" onClick={onClick}>
        <div className="button-icon">➕</div>
        <div className="button-text">{t('newTask')}</div>
      </button>
    </div>
  );
};
