import { create } from 'zustand';
import api from '../lib/api';

export const useDocStore = create((set, get) => ({
  documents: [],
  trashedDocuments: [],
  currentDoc: null,
  stats: null,
  isLoading: false,
  isSaving: false,
  error: null,
  history: [],

  fetchDocuments: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/documents', { params });
      set({ documents: data.documents, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch documents', isLoading: false });
    }
  },

  fetchTrashedDocuments: async () => {
    try {
      const { data } = await api.get('/documents/trash');
      set({ trashedDocuments: data.documents || [] });
      return data.documents;
    } catch { return []; }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/documents/stats/overview');
      set({ stats: data.stats });
    } catch {}
  },

  fetchDocument: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/documents/${id}`);
      set({ currentDoc: data.document, isLoading: false });
      return data.document;
    } catch (err) {
      set({ isLoading: false, error: 'Document not found' });
      return null;
    }
  },

  createDocument: async (docData) => {
    set({ isSaving: true });
    try {
      const { data } = await api.post('/documents', docData);
      set(state => ({
        documents: [data.document, ...state.documents],
        currentDoc: data.document,
        isSaving: false,
      }));
      return data.document;
    } catch (err) {
      set({ isSaving: false });
      return null;
    }
  },

  saveDocument: async (id, updates) => {
    set({ isSaving: true });
    try {
      const { data } = await api.put(`/documents/${id}`, updates);
      set(state => ({
        documents: state.documents.map(d => d._id === id ? data.document : d),
        currentDoc: data.document,
        isSaving: false,
      }));
      return data.document;
    } catch (err) {
      set({ isSaving: false });
      return null;
    }
  },

  // Soft delete — moves to trash
  deleteDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      set(state => ({
        documents: state.documents.filter(d => d._id !== id),
        currentDoc: state.currentDoc?._id === id ? null : state.currentDoc,
      }));
      return true;
    } catch { return false; }
  },

  // Restore from trash
  restoreDocument: async (id) => {
    try {
      const { data } = await api.post(`/documents/${id}/restore`);
      set(state => ({
        trashedDocuments: state.trashedDocuments.filter(d => d._id !== id),
        documents: [data.document, ...state.documents],
      }));
      return true;
    } catch { return false; }
  },

  // Permanently delete
  permanentlyDeleteDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}/permanent`);
      set(state => ({
        trashedDocuments: state.trashedDocuments.filter(d => d._id !== id),
      }));
      return true;
    } catch { return false; }
  },

  setCurrentDoc: (doc) => set({ currentDoc: doc }),

  fetchHistory: async (docId) => {
    try {
      const { data } = await api.get(`/documents/${docId}/history`);
      set({ history: data.history });
      return data.history;
    } catch { return []; }
  },

  clearError: () => set({ error: null }),
}));
