import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Diary {
  id: string;
  date: string; // YYYY-MM-DD 格式
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface DiaryState {
  diaries: Diary[];
  getDiaryByDate: (date: string) => Diary | undefined;
  saveDiary: (date: string, content: string) => void;
  deleteDiary: (date: string) => void;
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      diaries: [],

      getDiaryByDate: (date: string) => {
        return get().diaries.find(d => d.date === date);
      },

      saveDiary: (date: string, content: string) => {
        const now = Date.now();
        const existingDiary = get().diaries.find(d => d.date === date);

        if (existingDiary) {
          // 更新现有日记
          set({
            diaries: get().diaries.map(d =>
              d.date === date
                ? { ...d, content, updatedAt: now }
                : d
            ),
          });
        } else {
          // 创建新日记
          const newDiary: Diary = {
            id: `diary_${now}`,
            date,
            content,
            createdAt: now,
            updatedAt: now,
          };
          set({ diaries: [...get().diaries, newDiary] });
        }
      },

      deleteDiary: (date: string) => {
        set({
          diaries: get().diaries.filter(d => d.date !== date),
        });
      },
    }),
    {
      name: 'yamlist-diaries',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
