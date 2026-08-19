import { create } from 'zustand';

// Read saved theme from localStorage, default to 'dark'
const getSavedTheme = () => {
  try { return localStorage.getItem('doccraft_theme') || 'dark'; }
  catch { return 'dark'; }
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('doccraft_theme', theme);
};

// Apply theme immediately on module load (before React renders)
applyTheme(getSavedTheme());

export const useThemeStore = create((set, get) => ({
  theme: getSavedTheme(),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
