import React, { useState, useEffect } from 'react';
import { useToastStore } from '../../stores/toastStore';
import '../Task/AddTaskDialog.css';

interface WindowSizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SIZES = [
  { name: '超紧凑', width: 300, height: 780 },
  { name: '紧凑', width: 350, height: 780 },
  { name: '默认', width: 400, height: 780 },
  { name: '舒适', width: 480, height: 900 },
  { name: '加长', width: 400, height: 1000 },
];

export const WindowSizeDialog: React.FC<WindowSizeDialogProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToastStore();
  const [width, setWidth] = useState(350);
  const [height, setHeight] = useState(780);
  const [currentSize, setCurrentSize] = useState({ width: 350, height: 780 });

  useEffect(() => {
    if (isOpen) {
      // 获取当前窗口大小
      window.electronAPI.getWindowSize().then(size => {
        setWidth(size.width);
        setHeight(size.height);
        setCurrentSize(size);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    // 先关闭对话框，再调整窗口大小，避免窗口resize导致对话框卡住
    onClose();

    // 延迟执行resize，确保对话框已经关闭
    setTimeout(() => {
      window.electronAPI.resizeWindow(width, height);
      addToast(`窗口大小已调整为 ${width}×${height}`, 'success');
    }, 100);
  };

  const handlePreset = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog" style={{ maxWidth: '450px' }}>
        <div className="dialog-header">
          <h2 className="dialog-title">📐 调整窗口大小</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form">
          {/* 当前尺寸 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>当前窗口大小</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#8b5cf6' }}>
              {currentSize.width} × {currentSize.height}
            </div>
          </div>

          {/* 预设尺寸 */}
          <div className="form-group">
            <label className="form-label">快速选择</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {PRESET_SIZES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePreset(preset.width, preset.height)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: width === preset.width && height === preset.height
                      ? '2px solid #8b5cf6'
                      : '2px solid rgba(0, 0, 0, 0.1)',
                    background: width === preset.width && height === preset.height
                      ? 'rgba(139, 92, 246, 0.1)'
                      : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#555',
                  }}
                >
                  <div>{preset.name}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    {preset.width}×{preset.height}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义尺寸 */}
          <div className="form-group">
            <label className="form-label">自定义尺寸</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block' }}>
                  宽度 (300-530)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min={300}
                  max={530}
                  value={width}
                  onChange={(e) => setWidth(Math.max(300, Math.min(530, Number(e.target.value))))}
                  style={{ padding: '8px', textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block' }}>
                  高度 (600-1200)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min={600}
                  max={1200}
                  value={height}
                  onChange={(e) => setHeight(Math.max(600, Math.min(1200, Number(e.target.value))))}
                  style={{ padding: '8px', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          {/* 预览 */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '13px',
            color: '#555',
            marginTop: '12px',
          }}>
            💡 提示: 调整窗口大小会立即生效，位置会自动保存
          </div>

          {/* 按钮组 */}
          <div className="dialog-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
            >
              应用 ({width}×{height})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
