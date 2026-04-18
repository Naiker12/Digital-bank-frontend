import axios from 'axios';

// Función para crear una instancia de axios con el interceptor de JWT
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para incluir el token JWT en las peticiones
  instance.interceptors.request.use(
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

  return instance;
};

// Instancias para los diferentes microservicios
export const userApi = createInstance(import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8000');
export const cardApi = createInstance(import.meta.env.VITE_CARD_SERVICE_URL || 'http://localhost:8001');
export const paymentApi = createInstance(import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8002');

// Exportación por defecto (User Service por compatibilidad)
export default userApi;
