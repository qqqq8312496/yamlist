import React, { useState, useEffect } from 'react';
import { useBackgroundStore } from '../../stores/backgroundStore';
import { useCustomPresetsStore } from '../../stores/customPresetsStore';
import { useThemeStore } from '../../stores/themeStore';
import { useToastStore } from '../../stores/toastStore';
import '../Task/AddTaskDialog.css';

interface BackgroundDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// 15个精心设计的渐变配色方案
const COLOR_PRESETS = [
  { name: '默认', top: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #6366f1 100%)', task: 'linear-gradient(180deg, rgba(199, 210, 254, 0.15) 0%, rgba(167, 139, 250, 0.08) 50%, rgba(199, 210, 254, 0.12) 100%)' },
  { name: '紫罗兰梦', top: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 50%, #a78bfa 100%)', task: 'linear-gradient(180deg, rgba(224, 231, 255, 0.15) 0%, rgba(199, 210, 254, 0.08) 50%, rgba(224, 231, 255, 0.12) 100%)' },
  { name: '樱花粉', top: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)', task: 'linear-gradient(180deg, rgba(254, 243, 199, 0.15) 0%, rgba(253, 230, 138, 0.08) 50%, rgba(254, 243, 199, 0.12) 100%)' },
  { name: '薄荷绿', top: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)', task: 'linear-gradient(180deg, rgba(219, 234, 254, 0.15) 0%, rgba(191, 219, 254, 0.08) 50%, rgba(219, 234, 254, 0.12) 100%)' },
  { name: '蜜桃橙', top: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)', task: 'linear-gradient(180deg, rgba(254, 243, 199, 0.15) 0%, rgba(253, 230, 138, 0.08) 50%, rgba(254, 243, 199, 0.12) 100%)' },
  { name: '晴空蓝', top: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)', task: 'linear-gradient(180deg, rgba(219, 234, 254, 0.15) 0%, rgba(191, 219, 254, 0.08) 50%, rgba(219, 234, 254, 0.12) 100%)' },
  { name: '玫瑰金', top: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 50%, #f87171 100%)', task: 'linear-gradient(180deg, rgba(253, 215, 170, 0.15) 0%, rgba(252, 186, 116, 0.08) 50%, rgba(253, 215, 170, 0.12) 100%)' },
  { name: '青草绿', top: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 50%, #4ade80 100%)', task: 'linear-gradient(180deg, rgba(209, 250, 229, 0.15) 0%, rgba(167, 243, 208, 0.08) 50%, rgba(209, 250, 229, 0.12) 100%)' },
  { name: '薰衣草', top: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 50%, #c084fc 100%)', task: 'linear-gradient(180deg, rgba(243, 232, 255, 0.15) 0%, rgba(233, 213, 255, 0.08) 50%, rgba(243, 232, 255, 0.12) 100%)' },
  { name: '柠檬黄', top: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%)', task: 'linear-gradient(180deg, rgba(254, 249, 195, 0.15) 0%, rgba(254, 240, 138, 0.08) 50%, rgba(254, 249, 195, 0.12) 100%)' },
  { name: '海洋蓝', top: 'linear-gradient(135deg, #a5f3fc 0%, #67e8f9 50%, #22d3ee 100%)', task: 'linear-gradient(180deg, rgba(207, 250, 254, 0.15) 0%, rgba(165, 243, 252, 0.08) 50%, rgba(207, 250, 254, 0.12) 100%)' },
  { name: '珊瑚橙', top: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)', task: 'linear-gradient(180deg, rgba(252, 211, 77, 0.15) 0%, rgba(251, 191, 36, 0.08) 50%, rgba(252, 211, 77, 0.12) 100%)' },
  { name: '翡翠绿', top: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)', task: 'linear-gradient(180deg, rgba(167, 243, 208, 0.15) 0%, rgba(110, 231, 183, 0.08) 50%, rgba(167, 243, 208, 0.12) 100%)' },
  { name: '葡萄紫', top: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)', task: 'linear-gradient(180deg, rgba(216, 180, 254, 0.15) 0%, rgba(192, 132, 252, 0.08) 50%, rgba(216, 180, 254, 0.12) 100%)' },
  { name: '夕阳红', top: 'linear-gradient(135deg, #fca5a5 0%, #f87171 50%, #ef4444 100%)', task: 'linear-gradient(180deg, rgba(254, 205, 211, 0.15) 0%, rgba(252, 165, 165, 0.08) 50%, rgba(254, 205, 211, 0.12) 100%)' },
];

// 常用颜色色板
const COMMON_COLORS = [
  '#fecaca', '#fed7aa', '#fef08a', '#d1fae5', '#a5f3fc',
  '#bfdbfe', '#ddd6fe', '#f5d0fe', '#fce7f3', '#e2e8f0',
  '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#f3e8ff',
];

export const BackgroundDialog: React.FC<BackgroundDialogProps> = ({ isOpen, onClose }) => {
  const { opacity, backgroundImage, topColor, taskAreaColor, setOpacity, setBackgroundImage, setTopColor, setTaskAreaColor } = useBackgroundStore();
  const { customPresets, saveCustomPreset, deleteCustomPreset } = useCustomPresetsStore();
  const { colors, updateThemeFromTopColor } = useThemeStore();
  const { addToast } = useToastStore();

  const [tempOpacity, setTempOpacity] = useState(opacity);
  const [tempImage, setTempImage] = useState(backgroundImage);
  const [tempTopColor, setTempTopColor] = useState(topColor);
  const [tempTaskColor, setTempTaskColor] = useState(taskAreaColor);
  const [topHexInput, setTopHexInput] = useState(topColor);
  const [taskHexInput, setTaskHexInput] = useState(taskAreaColor);
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(null);
  const [customPresetName, setCustomPresetName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTempOpacity(opacity);
      setTempImage(backgroundImage);
      setTempTopColor(topColor);
      setTempTaskColor(taskAreaColor);
      setTopHexInput(topColor);
      setTaskHexInput(taskAreaColor);
    }
  }, [isOpen, opacity, backgroundImage, topColor, taskAreaColor]);

  if (!isOpen) return null;

  const handleApply = () => {
    setOpacity(tempOpacity);
    setBackgroundImage(tempImage);
    setTopColor(tempTopColor);
    setTaskAreaColor(tempTaskColor);
    updateThemeFromTopColor(tempTopColor); // 更新主题
    addToast('背景设置已保存', 'success');
    onClose();
  };

  const handlePreset = (preset: typeof COLOR_PRESETS[0]) => {
    setTempTopColor(preset.top);
    setTempTaskColor(preset.task);
    setTopHexInput(preset.top);
    setTaskHexInput(preset.task);
  };

  const handleTopHexChange = (hex: string) => {
    setTopHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setTempTopColor(hex);
    }
  };

  const handleTaskHexChange = (hex: string) => {
    setTaskHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setTempTaskColor(hex);
    }
  };

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setTempImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleClearImage = () => {
    setTempImage('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 右键保存自定义预设
  const handlePresetRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setEditingPresetIndex(index);
    const existingCustom = customPresets[index];
    setCustomPresetName(existingCustom?.name || `自定义${index + 1}`);
  };

  // 保存自定义预设
  const handleSaveCustomPreset = () => {
    if (editingPresetIndex !== null && customPresetName.trim()) {
      saveCustomPreset(editingPresetIndex, {
        name: customPresetName.trim(),
        top: tempTopColor,
        task: tempTaskColor,
      });
      setEditingPresetIndex(null);
      setCustomPresetName('');
    }
  };

  // 删除自定义预设
  const handleDeleteCustomPreset = (index: number) => {
    if (confirm(`确定要删除自定义预设吗？`)) {
      deleteCustomPreset(index);
    }
  };

  // 获取显示的预设（优先显示自定义，否则显示默认）
  const getDisplayPreset = (index: number) => {
    return customPresets[index] || COLOR_PRESETS[index];
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="dialog-header">
          <h2 className="dialog-title">🎨 外观设置</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form">
          {/* 预设配色方案 */}
          <div className="form-group">
            <label className="form-label">配色方案 <span style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>(右键可保存自定义配色)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {COLOR_PRESETS.map((_, index) => {
                const displayPreset = getDisplayPreset(index);
                const isCustom = !!customPresets[index];

                return (
                  <div key={index} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => handlePreset(displayPreset)}
                      onContextMenu={(e) => handlePresetRightClick(e, index)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '10px',
                        border: tempTopColor === displayPreset.top && tempTaskColor === displayPreset.task
                          ? `2px solid ${colors.primary}`
                          : '2px solid rgba(0, 0, 0, 0.1)',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}>
                        <div style={{
                          flex: 2,
                          background: displayPreset.top,
                        }} />
                        <div style={{
                          flex: 3,
                          background: displayPreset.task,
                        }} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', fontWeight: 600 }}>
                        {displayPreset.name}
                      </div>
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomPreset(index);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                        title="删除自定义预设"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 顶部颜色 */}
          <div className="form-group">
            <label className="form-label">顶部区域颜色</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '10px',
                background: tempTopColor,
                border: '2px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {COMMON_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setTempTopColor(color);
                        setTopHexInput(color);
                      }}
                      style={{
                        width: '100%',
                        height: '32px',
                        borderRadius: '6px',
                        background: color,
                        border: tempTopColor === color ? '2px solid #8b5cf6' : '2px solid rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={topHexInput}
                  onChange={(e) => handleTopHexChange(e.target.value)}
                  placeholder="#RRGGBB"
                  style={{ padding: '8px', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* 任务区颜色 */}
          <div className="form-group">
            <label className="form-label">任务区域颜色</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '10px',
                background: tempTaskColor,
                border: '2px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {COMMON_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setTempTaskColor(color);
                        setTaskHexInput(color);
                      }}
                      style={{
                        width: '100%',
                        height: '32px',
                        borderRadius: '6px',
                        background: color,
                        border: tempTaskColor === color ? '2px solid #8b5cf6' : '2px solid rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={taskHexInput}
                  onChange={(e) => handleTaskHexChange(e.target.value)}
                  placeholder="#RRGGBB"
                  style={{ padding: '8px', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* 透明度控制 */}
          <div className="form-group">
            <label className="form-label">窗口透明度</label>
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
              }}>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={tempOpacity}
                  onChange={(e) => setTempOpacity(Number(e.target.value))}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.8) 100%)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#8b5cf6',
                }}>
                  {tempOpacity}%
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#888',
              }}>
                <span>50% (更透明)</span>
                <span>100% (不透明)</span>
              </div>
            </div>
          </div>

          {/* 任务区背景图片 */}
          <div className="form-group">
            <label className="form-label">任务区背景图片</label>

            {tempImage ? (
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid rgba(139, 92, 246, 0.2)',
              }}>
                <img
                  src={tempImage}
                  alt="背景预览"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '8px',
                }}>
                  <button
                    type="button"
                    onClick={handleImageSelect}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    更换
                  </button>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    清除
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImageSelect}
                style={{
                  width: '100%',
                  height: '100px',
                  border: '2px dashed rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  color: '#8b5cf6',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }}
              >
                <span style={{ fontSize: '28px' }}>🖼️</span>
                <span>点击选择背景图片</span>
              </button>
            )}
          </div>

          {/* 提示 */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '13px',
            color: '#555',
            marginTop: '12px',
          }}>
            💡 提示: 所有设置会立即生效并保存
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
              应用设置
            </button>
          </div>
        </div>
      </div>

      {/* 自定义预设名称编辑对话框 */}
      {editingPresetIndex !== null && (
        <div
          className="dialog-backdrop"
          style={{
            position: 'fixed',
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingPresetIndex(null);
            }
          }}
        >
          <div
            className="add-task-dialog"
            style={{ maxWidth: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h2 className="dialog-title">🎨 保存自定义配色</h2>
              <button
                className="dialog-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPresetIndex(null);
                }}
              >✕</button>
            </div>

            <div className="dialog-form">
              <div className="form-group">
                <label className="form-label">配色名称</label>
                <input
                  type="text"
                  className="form-input"
                  value={customPresetName}
                  onChange={(e) => setCustomPresetName(e.target.value)}
                  placeholder="例如: 我的配色"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCustomPreset();
                    }
                  }}
                />
              </div>

              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13px',
                color: '#555',
              }}>
                💡 当前的顶部和任务区颜色将被保存到此预设
              </div>

              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setEditingPresetIndex(null)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveCustomPreset}
                  disabled={!customPresetName.trim()}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
