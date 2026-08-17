import { create } from 'zustand';

interface UIState {
  isLocked: boolean;
  searchVisible: boolean;
  addDialogVisible: boolean;
  settingsVisible: boolean;
  statsVisible: boolean;
  theme: string;
  hideCompleted: boolean;
  setIsLocked: (locked: boolean) => void;
  setSearchVisible: (visible: boolean) => void;
  setAddDialogVisible: (visible: boolean) => void;
  setSettingsVisible: (visible: boolean) => void;
  setStatsVisible: (visible: boolean) => void;
  setTheme: (theme: string) => void;
  toggleHideCompleted: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLocked: false,
  searchVisible: false,
  addDialogVisible: false,
  settingsVisible: false,
  statsVisible: false,
  theme: 'default',
  hideCompleted: false,
  setIsLocked: (locked) => set({ isLocked: locked }),
  setSearchVisible: (visible) => set({ searchVisible: visible }),
  setAddDialogVisible: (visible) => set({ addDialogVisible: visible }),
  setSettingsVisible: (visible) => set({ settingsVisible: visible }),
  setStatsVisible: (visible) => set({ statsVisible: visible }),
  setTheme: (theme) => set({ theme }),
  toggleHideCompleted: () => set((state) => ({ hideCompleted: !state.hideCompleted })),
}));
