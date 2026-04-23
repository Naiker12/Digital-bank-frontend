import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function GuestGuard({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
