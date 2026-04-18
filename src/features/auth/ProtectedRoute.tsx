import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Ładowanie sesji...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};