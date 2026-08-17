import { useLanguageStore } from '../stores/languageStore';
import { translations, TranslationKey } from './translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguageStore();

  const t = (key: TranslationKey, ...args: (string | number)[]): string => {
    let text = translations[currentLanguage][key] || translations['zh-CN'][key] || key;

    // 替换占位符 {0}, {1}, etc.
    args.forEach((arg, index) => {
      text = text.replace(`{${index}}`, String(arg));
    });

    return text;
  };

  return { t, currentLanguage };
};
