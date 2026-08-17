import React, { useState } from 'react';
import { useTabStore } from '../../stores/tabStore';
import { useTranslation } from '../../i18n/useTranslation';
import { ToothTab } from './ToothTab';
import { TabManageDialog } from '../Tab/TabManageDialog';
import './ToothTabs.css';

interface ToothTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const ToothTabs: React.FC<ToothTabsProps> = ({ activeTab, onTabChange }) => {
  const { tabs } = useTabStore();
  const { t } = useTranslation();
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const systemTabs = tabs.filter((t) => t.type === 'system');
  const customTabs = tabs.filter((t) => t.type === 'custom');

  const startTop = 140;
  const spacing = 4; // 标签之间的间距
  const labelHeight = 20; // 每个字的高度
  const tabPadding = 16; // 标签内边距

  // 获取标签显示文本（优先使用翻译）
  const getTabLabel = (tab: any) => {
    if (tab.label_key) {
      return t(tab.label_key as any);
    }
    return tab.label_short;
  };

  return (
    <>
      <div className="tooth-tabs">
      {/* 系统标签 */}
      {systemTabs.map((tab, index) => {
        const label = getTabLabel(tab);
        return (
          <ToothTab
            key={tab.id}
            label={label}
            top={startTop + index * (label.length * labelHeight + tabPadding + spacing)}
            active={activeTab === tab.id}
            color={tab.color}
            onClick={() => onTabChange(tab.id)}
          />
        );
      })}

      {/* 分隔线 */}
      <div className="tooth-divider" style={{ top: startTop + systemTabs.reduce((sum, tab) => {
        const label = getTabLabel(tab);
        return sum + label.length * labelHeight + tabPadding + spacing;
      }, 0) + 4 }}>
        <div className="divider-line" />
      </div>

      {/* 自定义标签 */}
      {customTabs.map((tab, index) => {
        const systemHeight = systemTabs.reduce((sum, t) => {
          const label = getTabLabel(t);
          return sum + label.length * labelHeight + tabPadding + spacing;
        }, 0);
        const prevHeight = customTabs.slice(0, index).reduce((sum, t) => sum + t.label_short.length * labelHeight + tabPadding + spacing, 0);
        return (
          <ToothTab
            key={tab.id}
            label={tab.label_short}
            top={startTop + systemHeight + 12 + prevHeight}
            active={activeTab === tab.id}
            color={tab.color}
            onClick={() => onTabChange(tab.id)}
          />
        );
      })}

      {/* 添加按钮 */}
      <ToothTab
        label="+"
        top={startTop + systemTabs.reduce((sum, t) => {
          const label = getTabLabel(t);
          return sum + label.length * labelHeight + tabPadding + spacing;
        }, 0) + 12 + customTabs.reduce((sum, t) => sum + t.label_short.length * labelHeight + tabPadding + spacing, 0) + 8}
        onClick={() => setIsManageDialogOpen(true)}
      />
    </div>

    {/* 标签管理对话框 */}
    <TabManageDialog
      isOpen={isManageDialogOpen}
      onClose={() => setIsManageDialogOpen(false)}
    />
  </>
  );
};
