import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmployeesPage from './pages/EmployeesPage'
import JobHistoryPage from './pages/JobHistoryPage'
import JobsPage from './pages/JobsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import AdminPage from './pages/AdminPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import InactivePage from './pages/InactivePage'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/inactive" element={<InactivePage />} />

          {/* Protected Routes */}
          <Route path="/employees" element={
            <ProtectedRoute><EmployeesPage /></ProtectedRoute>
          } />
          <Route path="/jobhistory" element={
            <ProtectedRoute><JobHistoryPage /></ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute><JobsPage /></ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute><DepartmentsPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute><AdminPage /></ProtectedRoute>
          } />
          <Route path="/deleted-items" element={
            <ProtectedRoute><DeletedItemsPage /></ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App