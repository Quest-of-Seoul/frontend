import { create } from 'zustand';
import { signIn, signUp, signOut, getCurrentUser } from '../utils/supabase';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    try {
      const { user, error } = await signIn(email, password);
      if (error) throw error;

      set({ user, isAuthenticated: true });
      return { user, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error };
    }
  },

  register: async (email, password, nickname) => {
    try {
      const { user, error } = await signUp(email, password, nickname);
      if (error) throw error;

      set({ user, isAuthenticated: true });
      return { user, error: null };
    } catch (error) {
      console.error('Register error:', error);
      return { user: null, error };
    }
  },

  logout: async () => {
    try {
      await signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      });
    } catch (error) {
      console.error('Check auth error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },
}));

export default useAuthStore;
