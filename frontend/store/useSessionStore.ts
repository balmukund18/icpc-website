import { create } from "zustand";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  Session,
} from "@/lib/adminService";

interface CreateSessionData {
  title: string;
  details?: string;
  meetLink: string;
  date?: string;
}

interface UpdateSessionData {
  title?: string;
  details?: string;
  meetLink?: string;
  date?: string;
}

interface SessionState {
  // State
  sessions: Session[];
  loading: boolean;
  error: string | null;
  editingId: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  addSession: (data: CreateSessionData) => Promise<void>;
  editSession: (id: string, data: UpdateSessionData) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  setEditingId: (id: string | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  sessions: [],
  loading: false,
  error: null,
  editingId: null,

  // Fetch all sessions
  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await getSessions();
      set({ sessions, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch sessions",
        loading: false,
      });
    }
  },

  // Create a new session
  addSession: async (data) => {
    set({ loading: true, error: null });
    try {
      const newSession = await createSession(data);
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to create session",
        loading: false,
      });
      throw err;
    }
  },

  // Update an existing session
  editSession: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateSession(id, data);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
        loading: false,
        editingId: null,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update session",
        loading: false,
      });
      throw err;
    }
  },

  // Delete a session
  removeSession: async (id) => {
    try {
      await deleteSession(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to delete session",
      });
      throw err;
    }
  },

  // Set which session is being edited
  setEditingId: (id) => set({ editingId: id }),

  // Clear error message
  clearError: () => set({ error: null }),
}));
