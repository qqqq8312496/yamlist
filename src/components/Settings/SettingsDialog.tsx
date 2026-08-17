import React, { useState, useEffect } from 'react';
import { useLanguageStore, Language } from '../../stores/languageStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useToastStore } from '../../stores/toastStore';
import '../Task/AddTaskDialog.css';
import './SettingsDialog.css';

interface SettingsDialogProps {
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

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const [width, setWidth] = useState(350);
  const [height, setHeight] = useState(780);
  const [currentSize, setCurrentSize] = useState({ width: 350, height: 780 });
  const [activeTab, setActiveTab] = useState<'window' | 'language'>('window');
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

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
    window.electronAPI.resizeWindow(width, height);
    addToast(`${t('windowSize')} ${width}×${height}`, 'success');
    onClose();
  };

  const handlePreset = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
  };

  const handleLanguageSelect = (languageCode: Language) => {
    // 如果选择的是当前语言，不需要提示
    if (languageCode === currentLanguage) {
      return;
    }

    // 保存选择的语言并显示确认对话框
    setSelectedLanguage(languageCode);
    setShowRestartDialog(true);
  };

  const handleConfirmRestart = () => {
    if (selectedLanguage) {
      // 保存语言设置
      setLanguage(selectedLanguage);
      // 关闭确认对话框
      setShowRestartDialog(false);
      // 重启应用（需要重新加载页面以应用语言更改）
      window.location.reload();
    }
  };

  const handleCancelRestart = () => {
    if (selectedLanguage) {
      // 只保存语言设置，不重启
      setLanguage(selectedLanguage);
    }
    setShowRestartDialog(false);
    setSelectedLanguage(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="add-task-dialog settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">⚙️ {t('settings')}</h2>
          <button className="dialog-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 标签切换 */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'window' ? 'active' : ''}`}
            onClick={() => setActiveTab('window')}
          >
            📐 {t('windowSize')}
          </button>
          <button
            className={`settings-tab ${activeTab === 'language' ? 'active' : ''}`}
            onClick={() => setActiveTab('language')}
          >
            🌐 {t('language')}
          </button>
        </div>

        <div className="dialog-form">
          {activeTab === 'window' ? (
            <>
              {/* 当前尺寸 */}
              <div className="current-size-box">
                <div className="current-size-label">当前窗口大小</div>
                <div className="current-size-value">
                  {currentSize.width} × {currentSize.height}
                </div>
              </div>

              {/* 预设尺寸 */}
              <div className="form-group">
                <label className="form-label">快速选择</label>
                <div className="preset-grid">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePreset(preset.width, preset.height)}
                      className={`preset-button ${width === preset.width && height === preset.height ? 'active' : ''}`}
                    >
                      <div>{preset.name}</div>
                      <div className="preset-size">
                        {preset.width}×{preset.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义尺寸 */}
              <div className="form-group">
                <label className="form-label">自定义尺寸</label>
                <div className="custom-size-inputs">
                  <div>
                    <label className="input-label">宽度 (300-530)</label>
                    <input
                      type="number"
                      className="form-input"
                      min={300}
                      max={530}
                      value={width}
                      onChange={(e) => setWidth(Math.max(300, Math.min(530, Number(e.target.value))))}
                    />
                  </div>
                  <div>
                    <label className="input-label">高度 (600-1200)</label>
                    <input
                      type="number"
                      className="form-input"
                      min={600}
                      max={1200}
                      value={height}
                      onChange={(e) => setHeight(Math.max(600, Math.min(1200, Number(e.target.value))))}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-tip">
                💡 提示: 调整窗口大小会立即生效，位置会自动保存
              </div>

              {/* 按钮组 */}
              <div className="dialog-actions">
                <button type="button" className="btn btn-cancel" onClick={onClose}>
                  {t('cancel')}
                </button>
                <button type="button" className="btn btn-primary" onClick={handleApply}>
                  {t('save')} ({width}×{height})
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="language-grid">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-card ${currentLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    <span className="language-flag">{lang.flag}</span>
                    <div className="language-info">
                      <div className="language-native">{lang.nativeName}</div>
                      <div className="language-english">{lang.name}</div>
                    </div>
                    {currentLanguage === lang.code && (
                      <span className="language-check">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="settings-tip" style={{ marginTop: '16px' }}>
                💡 提示: 语言切换会立即生效，下次启动自动应用
              </div>

              <div className="dialog-actions">
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  {t('close')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 重启确认对话框 */}
      {showRestartDialog && (
        <div className="dialog-backdrop" onClick={(e) => e.stopPropagation()}>
          <div className="add-task-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">🔄 {currentLanguage === 'zh-CN' ? '重启应用' : currentLanguage === 'zh-TW' ? '重啟應用' : currentLanguage === 'ja' ? 'アプリを再起動' : currentLanguage === 'ko' ? '앱 재시작' : currentLanguage === 'ar' ? 'إعادة تشغيل التطبيق' : 'Restart App'}</h2>
            </div>
            <div className="dialog-form">
              <p style={{ margin: '16px 0', lineHeight: '1.6', color: '#666' }}>
                {currentLanguage === 'zh-CN' ? '语言已切换为' : currentLanguage === 'zh-TW' ? '語言已切換為' : currentLanguage === 'ja' ? '言語を次に切り替えました' : currentLanguage === 'ko' ? '언어가 다음으로 변경되었습니다' : currentLanguage === 'ar' ? 'تم تغيير اللغة إلى' : 'Language changed to'} <strong>{languages.find(l => l.code === selectedLanguage)?.nativeName}</strong>
                <br /><br />
                {currentLanguage === 'zh-CN' ? '是否立即重启应用以使所有更改生效？' : currentLanguage === 'zh-TW' ? '是否立即重啟應用以使所有更改生效？' : currentLanguage === 'ja' ? 'すべての変更を有効にするために今すぐアプリを再起動しますか？' : currentLanguage === 'ko' ? '모든 변경사항을 적용하려면 지금 앱을 재시작하시겠습니까?' : currentLanguage === 'ar' ? 'هل تريد إعادة تشغيل التطبيق الآن لتطبيق جميع التغييرات؟' : 'Restart app now to apply all changes?'}
              </p>
              <div className="dialog-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCancelRestart}>
                  {currentLanguage === 'zh-CN' ? '稍后重启' : currentLanguage === 'zh-TW' ? '稍後重啟' : currentLanguage === 'ja' ? '後で再起動' : currentLanguage === 'ko' ? '나중에 재시작' : currentLanguage === 'ar' ? 'إعادة التشغيل لاحقًا' : 'Restart Later'}
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmRestart}>
                  {currentLanguage === 'zh-CN' ? '立即重启' : currentLanguage === 'zh-TW' ? '立即重啟' : currentLanguage === 'ja' ? '今すぐ再起動' : currentLanguage === 'ko' ? '지금 재시작' : currentLanguage === 'ar' ? 'إعادة التشغيل الآن' : 'Restart Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
