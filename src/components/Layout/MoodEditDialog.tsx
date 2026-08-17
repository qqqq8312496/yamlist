import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMoodStore } from '../../stores/moodStore';
import { useToastStore } from '../../stores/toastStore';
import '../Task/AddTaskDialog.css';

interface MoodEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = [
  '', // 无表情选项
  '😊', '🥰', '😎', '🤗', '😴', '🤔', '😤', '🥺', '🎉', '💪',
  '🌟', '✨', '🎈', '🎁', '🌈', '☀️', '🌙', '⭐', '💖', '❤️',
  '😂', '😍', '🤩', '😇', '🥳', '😋', '😌', '🙃', '🤓', '🧐',
  '😏', '😜', '😝', '🥱', '🤤', '🤯', '🥵', '🥶', '😱', '🤗',
];

export const MoodEditDialog: React.FC<MoodEditDialogProps> = ({ isOpen, onClose }) => {
  const { mood, emoji, setMood, setEmoji } = useMoodStore();
  const { addToast } = useToastStore();
  const [tempMood, setTempMood] = useState('');
  const [tempEmoji, setTempEmoji] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTempMood(mood);
      setTempEmoji(emoji);
    }
  }, [isOpen, mood, emoji]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempMood.trim()) {
      addToast('请输入心情签名', 'warning');
      return;
    }

    setMood(tempMood.trim());
    setEmoji(tempEmoji);
    addToast('心情签名已更新', 'success');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog" style={{ maxWidth: '450px' }}>
        <div className="dialog-header">
          <h2 className="dialog-title">✨ 编辑心情签名</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          {/* 心情文字 */}
          <div className="form-group">
            <label className="form-label">心情签名</label>
            <input
              type="text"
              className="form-input"
              placeholder="今天的心情是..."
              value={tempMood}
              onChange={(e) => setTempMood(e.target.value)}
              autoFocus
              maxLength={50}
            />
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              {tempMood.length}/50
            </div>
          </div>

          {/* 表情选择 */}
          <div className="form-group">
            <label className="form-label">选择表情</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '8px',
              padding: '12px',
              background: 'rgba(139, 92, 246, 0.05)',
              borderRadius: '12px',
            }}>
              {EMOJI_OPTIONS.map((emojiOption, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTempEmoji(emojiOption)}
                  style={{
                    fontSize: emojiOption === '' ? '12px' : '24px',
                    padding: '8px',
                    background: tempEmoji === emojiOption ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    border: tempEmoji === emojiOption ? '2px solid #8b5cf6' : '2px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: emojiOption === '' ? '#888' : 'inherit',
                    fontWeight: emojiOption === '' ? 500 : 'normal',
                  }}
                  onMouseEnter={(e) => {
                    if (tempEmoji !== emojiOption) {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tempEmoji !== emojiOption) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {emojiOption === '' ? '无' : emojiOption}
                </button>
              ))}
            </div>
          </div>

          {/* 预览 */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            borderRadius: '12px',
            marginTop: '8px',
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>预览:</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>
              {tempEmoji && `${tempEmoji} `}{tempMood || '今天也要加油鸭~'}
            </div>
          </div>

          {/* 按钮组 */}
          <div className="dialog-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
