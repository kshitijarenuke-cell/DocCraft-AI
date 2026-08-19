import { create } from 'zustand';
import api from '../lib/api';

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('doccraft_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('doccraft_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('doccraft_token', data.token);
      localStorage.setItem('doccraft_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('doccraft_token', data.token);
      localStorage.setItem('doccraft_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('doccraft_token');
    localStorage.removeItem('doccraft_user');
    set({ user: null, token: null });
  },

  updatePreferences: async (preferences) => {
    try {
      const { data } = await api.put('/auth/preferences', { preferences });
      const user = { ...get().user, preferences: data.user.preferences };
      localStorage.setItem('doccraft_user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
