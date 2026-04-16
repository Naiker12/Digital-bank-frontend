import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Componente que protege rutas privadas.
 * Si el usuario no está autenticado, lo redirige al login.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir al login pero guardando la ubicación actual para volver después si fuera necesario
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
