import type { StateCreator } from 'zustand';
import axios from 'axios';
import type { AuthState, UserManagementActions } from '../types/authTypes';

/**
 * ユーザー管理アクションの実装
 */
export const createUserManagementActions: StateCreator<
  AuthState,
  [],
  [],
  UserManagementActions
> = (set) => ({
  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put('users/profile', data);
      
      set({
        user: response.data,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'プロフィール更新に失敗しました',
      });
      throw error;
    }
  },
});