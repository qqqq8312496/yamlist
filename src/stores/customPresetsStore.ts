import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CustomPreset {
  name: string;
  top: string;
  task: string;
}

interface CustomPresetsState {
  customPresets: { [key: number]: CustomPreset }; // key是预设的索引位置
  saveCustomPreset: (index: number, preset: CustomPreset) => void;
  getCustomPreset: (index: number) => CustomPreset | undefined;
  deleteCustomPreset: (index: number) => void;
}

export const useCustomPresetsStore = create<CustomPresetsState>()(
  persist(
    (set, get) => ({
      customPresets: {},

      saveCustomPreset: (index: number, preset: CustomPreset) => {
        set({
          customPresets: {
            ...get().customPresets,
            [index]: preset,
          },
        });
      },

      getCustomPreset: (index: number) => {
        return get().customPresets[index];
      },

      deleteCustomPreset: (index: number) => {
        const newPresets = { ...get().customPresets };
        delete newPresets[index];
        set({ customPresets: newPresets });
      },
    }),
    {
      name: 'yamlist-custom-presets',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
