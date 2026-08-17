import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useMoodStore } from '../../stores/moodStore';
import { useUIStore } from '../../stores/uiStore';
import { useBackgroundStore } from '../../stores/backgroundStore';
import { MoodEditDialog } from './MoodEditDialog';
import './MoodSection.css';

export const MoodSection: React.FC = () => {
  const { mood, emoji } = useMoodStore();
  const { isLocked, setIsLocked } = useUIStore();
  const { topColor, opacity } = useBackgroundStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // 监听锁定状态变化
    const unsubscribe = window.electronAPI.onLockStateChanged((locked: boolean) => {
      setIsLocked(locked);
    });

    return unsubscribe;
  }, [setIsLocked]);

  const handleLockToggle = () => {
    window.electronAPI.toggleLock();
  };

  const handleMinimize = () => {
    window.electronAPI.minimize();
  };

  const handleClose = () => {
    window.electronAPI.close();
  };

  return (
    <div className="mood-section" style={{ background: topColor, opacity: opacity / 100 }}>
      {/* 背景层 */}
      <div className="mood-background">
        {/* TODO: 自定义背景图 */}
      </div>

      {/* 标题栏 */}
      <div className="title-bar">
        <div
          className="title-text-wrapper"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="title-text">山药List</div>
          {showTooltip && ReactDOM.createPortal(
            <div className="title-tooltip" style={{ opacity: 1, visibility: 'visible', transform: 'translateX(-50%) translateY(0)' }}>
              <div className="tooltip-item">
                <span className="tooltip-icon">👨‍💻</span>
                <div className="tooltip-content">
                  <span className="tooltip-label">项目维护</span>
                  <span className="tooltip-value">YamList Team</span>
                </div>
              </div>
              <div className="tooltip-divider"></div>
              <div className="tooltip-item">
                <span className="tooltip-icon">💡</span>
                <div className="tooltip-content">
                  <span className="tooltip-label">欢迎贡献</span>
                  <span className="tooltip-value">Open Source</span>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
        <div className="window-controls">
          <button className="control-btn minimize" onClick={handleMinimize}>
            ─
          </button>
          <button
            className="control-btn lock"
            onClick={handleLockToggle}
            title={isLocked ? '点击解锁 (或将鼠标移动到此区域)' : '点击锁定'}
          >
            {isLocked ? '🔓' : '🔒'}
          </button>
          <button className="control-btn close" onClick={handleClose}>
            ✕
          </button>
        </div>
      </div>

      {/* 心情文字 */}
      <div className="mood-content" onClick={() => setIsEditDialogOpen(true)} style={{ cursor: 'pointer' }}>
        <div className="mood-text">
          {emoji && `${emoji} `}{mood}
        </div>
        <div className="mood-date">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'long',
          })}
        </div>
      </div>

      {/* 编辑对话框 */}
      <MoodEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
};
