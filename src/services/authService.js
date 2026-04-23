import { userApi } from '@/api/apiClient';
import { parseResponse, handleError } from './serviceUtils';

export const authService = {

  login: async (email, password) => {
    try {
      const response = await userApi.post('/users/login', { email, password });
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'Error al iniciar sesión');
    }
  },

  register: async (userData) => {
    try {
      const response = await userApi.post('/users/register', userData);
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'Error al registrarse');
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await userApi.get(`/users/profile/${userId}`);
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'Error al obtener perfil');
    }
  }
};
