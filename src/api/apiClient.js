import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token JWT en las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('digital-bank-auth');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.user?.token) {
          config.headers.Authorization = `Bearer ${state.user.token}`;
        }
      } catch (err) {
        console.error('Error parsing auth data from localStorage', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
