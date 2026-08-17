import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';
import './DataDialog.css';

interface DataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

export const DataDialog: React.FC<DataDialogProps> = ({ isOpen, onClose, onExportClick, onImportClick }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExport = () => {
    onClose();
    onExportClick();
  };

  const handleImport = () => {
    onClose();
    onImportClick();
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog data-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">💾 数据管理</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form">
          <div className="data-options">
            <button className="data-option-card" onClick={handleExport}>
              <div className="data-option-icon">📤</div>
              <div className="data-option-content">
                <div className="data-option-title">{t('exportData')}</div>
                <div className="data-option-desc">将任务数据导出为文件</div>
              </div>
              <div className="data-option-arrow">→</div>
            </button>

            <button className="data-option-card" onClick={handleImport}>
              <div className="data-option-icon">📥</div>
              <div className="data-option-content">
                <div className="data-option-title">{t('importData')}</div>
                <div className="data-option-desc">从文件导入任务数据</div>
              </div>
              <div className="data-option-arrow">→</div>
            </button>
          </div>

          <div className="data-tip">
            💡 提示：导出的数据可用于备份或迁移到其他设备
          </div>
        </div>
      </div>
    </div>
  );
};
