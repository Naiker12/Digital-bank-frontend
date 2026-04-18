import apiClient from './apiClient';

/**
 * Parsea la respuesta de una Lambda detrás de API Gateway Proxy.
 * Las lambdas retornan { statusCode, body } donde body es un string JSON.
 */
function parseLambdaResponse(response) {
  let data = response.data;
  // Si la respuesta es un string, parsearla
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  // Si data tiene body como string (API Gateway proxy), parsear body
  if (typeof data?.body === 'string') {
    data = { ...data, ...JSON.parse(data.body) };
  }
  return data;
}

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      const data = parseLambdaResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.error
        || (typeof error.response?.data?.body === 'string'
          ? JSON.parse(error.response.data.body)?.error
          : null)
        || 'Error al iniciar sesión';
      return { success: false, message };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      const data = parseLambdaResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.error
        || (typeof error.response?.data?.body === 'string'
          ? JSON.parse(error.response.data.body)?.error
          : null)
        || 'Error al registrarse';
      return { success: false, message };
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/profile/${userId}`);
      const data = parseLambdaResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.error
        || (typeof error.response?.data?.body === 'string'
          ? JSON.parse(error.response.data.body)?.error
          : null)
        || 'Error al obtener perfil';
      return { success: false, message };
    }
  }
};
