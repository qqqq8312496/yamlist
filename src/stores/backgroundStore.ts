import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BackgroundState {
  opacity: number; // 0-100 窗口整体透明度
  backgroundImage: string; // 任务区背景图片
  topColor: string; // 顶部区域颜色（心情签名区）
  taskAreaColor: string; // 任务区背景颜色
  setOpacity: (opacity: number) => void;
  setBackgroundImage: (image: string) => void;
  setTopColor: (color: string) => void;
  setTaskAreaColor: (color: string) => void;
}

export const useBackgroundStore = create<BackgroundState>()(
  persist(
    (set) => ({
      opacity: 95,
      backgroundImage: '',
      topColor: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #6366f1 100%)', // 默认渐变紫
      taskAreaColor: 'linear-gradient(180deg, rgba(199, 210, 254, 0.15) 0%, rgba(167, 139, 250, 0.08) 50%, rgba(199, 210, 254, 0.12) 100%)', // 默认淡紫渐变
      setOpacity: (opacity) => set({ opacity }),
      setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
      setTopColor: (topColor) => set({ topColor }),
      setTaskAreaColor: (taskAreaColor) => set({ taskAreaColor }),
    }),
    {
      name: 'background-storage',
    }
  )
);
