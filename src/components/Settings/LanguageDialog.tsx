import React from 'react';
import { useLanguageStore, Language } from '../../stores/languageStore';
import { useTranslation } from '../../i18n/useTranslation';
import '../Task/AddTaskDialog.css';
import './LanguageDialog.css';

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export const LanguageDialog: React.FC<LanguageDialogProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleLanguageSelect = (languageCode: Language) => {
    setLanguage(languageCode);
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="add-task-dialog language-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{t('language')}</h2>
          <button className="dialog-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dialog-form">
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
        </div>
      </div>
    </div>
  );
};
