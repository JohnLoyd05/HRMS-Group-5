function ProtectedRoute({ children }) {
  // Auth check will be wired here by M4 (Rights & Auth Specialist)
  // For now, all routes are accessible for development purposes
  return children
}

export default ProtectedRoute