import { useState, useEffect } from 'react';
import { useToastStore } from '../../stores/toastStore';
import '../Task/AddTaskDialog.css';

interface HotkeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HotkeyConfig {
  toggleLock: string;
  toggleWindow: string;
  newTask: string;
  search: string;
}

export const HotkeyDialog: React.FC<HotkeyDialogProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToastStore();
  const [hotkeys, setHotkeys] = useState<HotkeyConfig>({
    toggleLock: 'Ctrl+Shift+L',
    toggleWindow: 'Ctrl+Alt+Y',
    newTask: 'Ctrl+N',
    search: 'Ctrl+F',
  });
  const [recording, setRecording] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 加载当前快捷键配置
      window.electronAPI.getHotkeys().then((config: HotkeyConfig) => {
        setHotkeys(config);
      });
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof HotkeyConfig) => {
    if (recording !== key) return;

    e.preventDefault();
    const parts: string[] = [];

    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    // 忽略单独的修饰键
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    // 获取按键名称
    let keyName = e.key.toUpperCase();
    if (e.key === ' ') keyName = 'Space';
    if (e.key === 'Escape') {
      setRecording(null);
      return;
    }

    parts.push(keyName);
    const shortcut = parts.join('+');

    setHotkeys(prev => ({ ...prev, [key]: shortcut }));
    setRecording(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await window.electronAPI.saveHotkeys(hotkeys);
      if (success) {
        addToast('快捷键保存成功', 'success');
        onClose();
      } else {
        addToast('保存失败，请重试', 'error');
      }
    } catch (error) {
      addToast('保存失败：' + error, 'error');
    }
    setSaving(false);
  };

  const hotkeyLabels: Record<keyof HotkeyConfig, string> = {
    toggleLock: '锁定/解锁窗口',
    toggleWindow: '显示/隐藏窗口',
    newTask: '新建任务',
    search: '搜索任务',
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="add-task-dialog" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
        <div className="dialog-header">
          <h3 className="dialog-title">⌨️ 快捷键设置</h3>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-form">
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
            点击输入框后按下新的快捷键组合，按 ESC 取消
          </p>

          {(Object.keys(hotkeyLabels) as Array<keyof HotkeyConfig>).map(key => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#666' }}>
                {hotkeyLabels[key]}
              </label>
              <input
                type="text"
                value={recording === key ? '按下快捷键...' : hotkeys[key]}
                readOnly
                onFocus={() => setRecording(key)}
                onBlur={() => setRecording(null)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: recording === key ? '2px solid #8b5cf6' : '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: recording === key ? '#f5f3ff' : '#fff',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            </div>
          ))}

          <div className="dialog-actions" style={{ marginTop: '20px' }}>
            <button
              className="btn btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              取消
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
