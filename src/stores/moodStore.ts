import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MoodState {
  mood: string;
  emoji: string;
  setMood: (mood: string) => void;
  setEmoji: (emoji: string) => void;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set) => ({
      mood: '今天也要加油鸭~',
      emoji: '😊',
      setMood: (mood) => set({ mood }),
      setEmoji: (emoji) => set({ emoji }),
    }),
    {
      name: 'yamlist-mood',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
