import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ session, children }) {
  if (session === undefined) return null; // initial session load — render nothing to avoid flash
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
