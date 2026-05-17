import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) return <Navigate to="/login" />;

  if (requireSuperAdmin && currentUser.user_type !== 'SUPERADMIN') {
    return <Navigate to="/employees" />;
  }

  if (requireAdmin && currentUser.user_type === 'USER') {
    return <Navigate to="/employees" />;
  }

  return children;
}