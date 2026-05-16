import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, loading } = useAuth();

  // Still loading auth state — render nothing yet
  if (loading) return null;

  // Not logged in — send to login
  if (!currentUser) return <Navigate to="/login" />;

  // Logged in but USER trying to access ADMIN-only route
  if (requireAdmin && currentUser.user_type === 'USER') {
    return <Navigate to="/employees" />;
  }

  return children;
}