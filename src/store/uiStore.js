import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LANG, THEME, VIEWS, TABS } from '../constants';

export const useUiStore = create(
  persist(
    (set) => ({
      // Language
      lang: LANG.AR,
      setLang: (lang) => set({ lang }),

      // Theme
      theme: THEME.LIGHT,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT,
        })),

      // Navigation
      view: VIEWS.LANDING,
      setView: (view) => set({ view }),

      mainTab: TABS.HOME,
      setMainTab: (mainTab) => set({ mainTab }),

      // Selected country (nationality selector)
      selectedNationality: null,
      setSelectedNationality: (country) => set({ selectedNationality: country }),

      selectedCountry: null,
      setSelectedCountry: (country) => set({ selectedCountry: country }),
    }),
    {
      name: 'civix-ui-store',
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        selectedNationality: state.selectedNationality,
      }),
    }
  )
);
