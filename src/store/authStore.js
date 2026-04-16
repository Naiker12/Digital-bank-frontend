import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_USERS } from '@/data/mockData';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const found = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (!found) return { success: false, message: 'Credenciales inválidas' };

        set({ user: found, isAuthenticated: true });
        return { success: true };
      },

      register: (userData) => {
        const exists = MOCK_USERS.find((u) => u.email === userData.email);
        if (exists) return { success: false, message: 'El correo ya está registrado' };

        const newUser = { ...userData, uuid: `u-${Date.now()}`, avatar: null };
        MOCK_USERS.push(newUser);
        set({ user: newUser, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Opcional: limpiar localStorage si se desea una salida total, 
        // aunque persist maneja esto al setear a null.
      },
    }),
    {
      name: 'digital-bank-auth',
    }
  )
);
