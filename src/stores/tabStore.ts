import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
  icon: string;
  label_short: string;
  label_key?: string; // 翻译键
  type: 'system' | 'custom';
  color?: string;
  order_index: number;
  count?: number;
}

interface TabState {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  addTab: (tab: Tab) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  deleteTab: (id: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      tabs: [
        { id: 'all', name: '全部待办', icon: '📋', label_short: '全部', label_key: 'tabAll', type: 'system', order_index: 0, count: 0, color: '#3B82F6' },
        { id: 'completed', name: '已完成', icon: '✓', label_short: '已完', label_key: 'tabCompleted', type: 'system', order_index: 1, count: 0, color: '#10B981' },
        { id: 'repeat', name: '重复任务', icon: '🔁', label_short: '重复', label_key: 'tabRepeat', type: 'system', order_index: 2, count: 0, color: '#06B6D4' },
        { id: 'overdue', name: '逾期任务', icon: '⏰', label_short: '逾期', label_key: 'tabOverdue', type: 'system', order_index: 3, count: 0, color: '#EF4444' },
        { id: 'work', name: '工作', icon: '💼', label_short: '工作', type: 'custom', color: '#8B5CF6', order_index: 4, count: 0 },
        { id: 'life', name: '生活', icon: '🏠', label_short: '生活', type: 'custom', color: '#EC4899', order_index: 5, count: 0 },
        { id: 'study', name: '学习', icon: '📚', label_short: '学习', type: 'custom', color: '#F59E0B', order_index: 6, count: 0 },
      ],
      setTabs: (tabs) => set({ tabs }),
      addTab: (tab) =>
        set((state) => ({
          tabs: [...state.tabs, tab],
        })),
      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
        })),
      deleteTab: (id) =>
        set((state) => ({
          tabs: state.tabs.filter((tab) => tab.id !== id),
        })),
    }),
    {
      name: 'yamlist-tabs',
      storage: createJSONStorage(() => localStorage),
      // 迁移函数：为旧数据添加 label_key，但不修改 label_short
      migrate: (persistedState: any) => {
        const state = persistedState as TabState;
        if (state.tabs) {
          state.tabs = state.tabs.map((tab) => {
            // 如果是系统标签但没有 label_key，只添加 label_key，不修改其他字段
            if (tab.type === 'system' && !tab.label_key) {
              const keyMap: Record<string, string> = {
                'all': 'tabAll',
                'completed': 'tabCompleted',
                'repeat': 'tabRepeat',
                'overdue': 'tabOverdue',
              };
              // 只添加 label_key，保持原有的 label_short 不变
              return { ...tab, label_key: keyMap[tab.id] };
            }
            return tab;
          });
        }
        return state;
      },
      version: 1,
    }
  )
);
