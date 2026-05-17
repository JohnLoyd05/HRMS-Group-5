import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) return <Navigate to="/login" />;

  // Only SUPERADMIN can access requireSuperAdmin routes
  if (requireSuperAdmin && currentUser.user_type !== 'SUPERADMIN') {
    return <Navigate to="/employees" />;
  }

  // Only ADMIN or SUPERADMIN can access requireAdmin routes
  if (requireAdmin && currentUser.user_type === 'USER') {
    return <Navigate to="/employees" />;
  }

  return children;
}