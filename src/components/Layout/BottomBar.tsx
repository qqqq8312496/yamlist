import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useTranslation } from '../../i18n/useTranslation';
import './BottomBar.css';

interface BottomBarProps {
  onStatsClick?: () => void;
  onDataClick?: () => void;
  onHotkeyClick?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onDataClick, onHotkeyClick }) => {
  const { hideCompleted, toggleHideCompleted } = useUIStore();
  const { t } = useTranslation();

  return (
    <div className="bottom-bar">
      <button className="bottom-btn" onClick={toggleHideCompleted}>
        {hideCompleted ? `👁️ ${t('completed')}` : `👁️‍🗨️ ${t('completed')}`}
      </button>

      <button className="bottom-btn" onClick={onDataClick}>
        💾 数据
      </button>

      <button className="bottom-btn" onClick={onHotkeyClick}>
        ⌨️ {t('hotkeys')}
      </button>
    </div>
  );
};
