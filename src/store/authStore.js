import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
          // La respuesta de la Lambda puede usar distintos nombres de campo
          const data = result.data;
          const userData = {
            name: data.user?.name || data.name,
            lastName: data.user?.lastName || data.lastName,
            email: data.user?.email || data.email || email,
            uuid: data.user_id || data.user?.uuid || data.uuid,
            token: data.access_token || data.token,
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

      updateUser: (newData) => {
        set((state) => ({
          user: { ...state.user, ...newData }
        }));
      },
    }),
    {
      name: 'digital-bank-auth',
    }
  )
);
