import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Componente que protege rutas públicas (Login/Registro).
 * Si el usuario ya está autenticado, lo redirige al dashboard.
 */
export default function GuestGuard({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
