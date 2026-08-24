import { create } from "zustand";

const THEME_STORAGE_KEY = "theme";

const normalizeTheme = (value) => (value === "dark" ? "dark" : "light");

const readStoredTheme = () => {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "light";
  }
};

const persistTheme = (nextTheme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    return;
  }
};

export const applyTheme = (nextTheme) => {
  document.documentElement.dataset.theme = normalizeTheme(nextTheme);
};

export const useThemeStore = create((set, get) => ({
  theme: readStoredTheme(),

  setTheme: (nextTheme) => {
    const theme = normalizeTheme(nextTheme);
    applyTheme(theme);
    persistTheme(theme);
    set({ theme });
  },

  toggle: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
}));

useThemeStore.subscribe((state) => {
  applyTheme(state.theme);
});
applyTheme(useThemeStore.getState().theme);
