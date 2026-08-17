import React, { useState } from 'react';
import { useTabStore, Tab } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';

interface TabManageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = [
  '💼', '🏠', '📚', '💪', '🎯',
  '🎨', '🎮', '🎵', '✈️', '🍔',
  '⚽', '💡', '🔥', '💖', '📝',
  '💻', '☕', '📷', '🎓', '⭐',
];
const COLOR_OPTIONS = [
  { value: '#8B5CF6', label: '紫色' },
  { value: '#EC4899', label: '粉色' },
  { value: '#F59E0B', label: '橙色' },
  { value: '#10B981', label: '绿色' },
  { value: '#3B82F6', label: '蓝色' },
  { value: '#06B6D4', label: '青色' },
  { value: '#EF4444', label: '红色' },
  { value: '#6366F1', label: '靛蓝' },
  { value: '#F97316', label: '橘色' },
  { value: '#14B8A6', label: '蓝绿' },
  { value: '#A855F7', label: '紫罗兰' },
  { value: '#F43F5E', label: '玫红' },
];

export const TabManageDialog: React.FC<TabManageDialogProps> = ({ isOpen, onClose }) => {
  const { tabs, addTab, updateTab, deleteTab } = useTabStore();
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [newTabName, setNewTabName] = useState('');
  const [newTabIcon, setNewTabIcon] = useState('💼');
  const [newTabColor, setNewTabColor] = useState('#8B5CF6');

  if (!isOpen) return null;

  const customTabs = tabs.filter((tab) => tab.type === 'custom');

  const handleAddTab = () => {
    console.log('handleAddTab called', { newTabName, newTabIcon, newTabColor });

    if (!newTabName.trim()) {
      alert(t('enterTabName'));
      return;
    }

    const maxOrder = customTabs.length > 0 ? Math.max(...customTabs.map(t => t.order_index)) : 2;
    const newId = `custom_${Date.now()}`;

    console.log('Adding tab:', { newId, name: newTabName.trim(), maxOrder });

    addTab({
      id: newId,
      name: newTabName.trim(),
      icon: newTabIcon,
      label_short: newTabName.trim().substring(0, 2),
      type: 'custom',
      color: newTabColor,
      order_index: maxOrder + 1,
      count: 0,
    });

    console.log('Tab added successfully');

    // 重置表单
    setNewTabName('');
    setNewTabIcon('💼');
    setNewTabColor('#8B5CF6');
    setIsAdding(false);
  };

  const handleDeleteTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (window.confirm(t('confirmDeleteTab', tab.name))) {
      deleteTab(tabId);
    }
  };

  const handleUpdateTab = (tabId: string, updates: Partial<Tab>) => {
    updateTab(tabId, updates);
    setEditingId(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog" style={{ maxWidth: '500px' }}>
        <div className="dialog-header">
          <h2 className="dialog-title">🏷️ {t('manageTabs')}</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 现有标签列表 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
              {t('customTabs')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customTabs.map((tab) => (
                <div
                  key={tab.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {editingId === tab.id ? (
                    <>
                      <input
                        type="text"
                        defaultValue={tab.icon}
                        style={{ width: '40px', fontSize: '18px', textAlign: 'center' }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleUpdateTab(tab.id, { icon: e.target.value });
                          }
                        }}
                      />
                      <input
                        type="text"
                        defaultValue={tab.name}
                        style={{ flex: 1, fontSize: '14px', padding: '6px' }}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            handleUpdateTab(tab.id, {
                              name: e.target.value.trim(),
                              label_short: e.target.value.trim().substring(0, 2),
                            });
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                      <input
                        type="color"
                        defaultValue={tab.color}
                        style={{ width: '40px', height: '30px', cursor: 'pointer' }}
                        onChange={(e) => {
                          handleUpdateTab(tab.id, { color: e.target.value });
                        }}
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        {t('close')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '20px' }}>{tab.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                          {tab.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                          {t('tasksCount', tab.count || 0)}
                        </div>
                      </div>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: tab.color,
                        }}
                      />
                      <button
                        onClick={() => setEditingId(tab.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteTab(tab.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        {t('delete')}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 添加新标签 */}
          {isAdding ? (
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              borderRadius: '12px',
              border: '2px dashed rgba(139, 92, 246, 0.3)',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
                {t('newTab')}
              </div>

              {/* 图标选择 */}
              <div className="form-group">
                <label className="form-label">{t('selectIcon')}</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                }}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewTabIcon(emoji)}
                      style={{
                        fontSize: '20px',
                        padding: '8px',
                        background: newTabIcon === emoji ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                        border: newTabIcon === emoji ? '2px solid #8b5cf6' : '2px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 名称输入 */}
              <div className="form-group">
                <label className="form-label">{t('tabName')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('tabNamePlaceholder')}
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  maxLength={10}
                />
              </div>

              {/* 颜色选择 */}
              <div className="form-group">
                <label className="form-label">{t('selectColor')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewTabColor(color.value)}
                      style={{
                        padding: '10px',
                        background: newTabColor === color.value ? color.value : 'rgba(255, 255, 255, 0.5)',
                        color: newTabColor === color.value ? 'white' : '#666',
                        border: newTabColor === color.value ? `2px solid ${color.value}` : '2px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 按钮组 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => setIsAdding(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddTab}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {t('addTab')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                border: '2px dashed rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                color: '#8b5cf6',
              }}
            >
              ➕ {t('addNewTab')}
            </button>
          )}

          {/* 关闭按钮 */}
          <div className="dialog-actions" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: '100%' }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
