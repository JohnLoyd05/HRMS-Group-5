import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  if (!currentUser) return <Navigate to="/login" replace />

  return children
}

export default function ProtectedRoute({ session, children }) {
  if (session === undefined) return null; // initial session load — render nothing to avoid flash
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
