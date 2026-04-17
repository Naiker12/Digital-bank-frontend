import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/api/authService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
          // Ajustamos para que coincida con el contrato del backend real
          const userData = {
            ...result.data.user,
            uuid: result.data.user_id,
            token: result.data.access_token
          };
          set({ user: userData, isAuthenticated: true });
          return { success: true };
        }
        // Limpiamos cualquier rastro de sesión si el login falla
        set({ user: null, isAuthenticated: false });
        return { success: false, message: result.message };
      },

      register: async (userData) => {
        const result = await authService.register(userData);
        if (result.success) {
          // El registro del backend no retorna token, 
          // así que marcamos como no autenticado para que inicie sesión manualmente
          set({ user: null, isAuthenticated: false });
          return { success: true, message: 'Registro exitoso. Por favor inicia sesión.' };
        }
        return { success: false, message: result.message };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('digital-bank-auth');
      },
    }),
    {
      name: 'digital-bank-auth',
    }
  )
);
