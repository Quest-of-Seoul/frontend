import { create } from 'zustand';
import { getUserPoints } from '../api/fastapi';

const useUserStore = create((set, get) => ({
  // State
  points: 0,
  isLoadingPoints: false,

  // Actions
  setPoints: (points) => set({ points }),

  fetchPoints: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoadingPoints: true });
      const response = await getUserPoints(userId);
      set({
        points: response.data.points,
        isLoadingPoints: false
      });
    } catch (error) {
      console.error('Failed to fetch points:', error);
      set({ isLoadingPoints: false });
    }
  },

  addPoints: (amount) => set((state) => ({
    points: state.points + amount
  })),

  subtractPoints: (amount) => set((state) => ({
    points: Math.max(0, state.points - amount)
  })),

  reset: () => set({ points: 0, isLoadingPoints: false }),
}));

export default useUserStore;
