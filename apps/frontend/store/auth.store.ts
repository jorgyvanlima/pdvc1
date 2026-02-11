import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', credentials);
                    const { user, accessToken } = response.data.data;

                    // Set token in header for subsequent requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', credentials);
                    // Auto login after register? or just redirect
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error', error);
                } finally {
                    set({ user: null, isAuthenticated: false });
                    delete api.defaults.headers.common['Authorization'];
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
