import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import './ActionBar.css';

interface ActionBarProps {
  onCalendarClick?: () => void;
  onSearchClick?: () => void;
  onStatsClick?: () => void;
  onManageTabsClick?: () => void;
  onSettingsClick?: () => void;
  onBackgroundClick?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ onCalendarClick, onSearchClick, onStatsClick, onManageTabsClick, onSettingsClick, onBackgroundClick }) => {
  const { t } = useTranslation();

  return (
    <div className="action-bar">
      <button className="icon-button" onClick={onSearchClick} title={t('search')}>
        🔍
      </button>
      <button className="icon-button" onClick={onCalendarClick} title={t('calendar')}>
        📅
      </button>
      <button className="icon-button" onClick={onManageTabsClick} title={t('manageTabs')}>
        🏷️
      </button>
      <button className="icon-button" onClick={onStatsClick} title={t('statistics')}>
        📊
      </button>
      <button className="icon-button" onClick={onBackgroundClick} title={t('background')}>
        🎨
      </button>
      <button className="icon-button" onClick={onSettingsClick} title={t('settings')}>
        ⚙️
      </button>
    </div>
  );
};
