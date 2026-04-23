import axios from 'axios';
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
export const userApi = createInstance(import.meta.env.VITE_USER_SERVICE_URL);
export const cardApi = createInstance(import.meta.env.VITE_CARD_SERVICE_URL);
export const paymentApi = createInstance(import.meta.env.VITE_PAYMENT_SERVICE_URL);
export const catalogApi = createInstance(import.meta.env.VITE_CATALOG_SERVICE_URL);
export default userApi;
