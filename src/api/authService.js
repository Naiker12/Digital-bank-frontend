import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      return { success: false, message };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al registrarse';
      return { success: false, message };
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/profile/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al obtener perfil';
      return { success: false, message };
    }
  }
};
