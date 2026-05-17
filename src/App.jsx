import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmployeesPage from './pages/EmployeesPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'
import JobHistoryPage from './pages/JobHistoryPage'
import JobsPage from './pages/JobsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import AdminPage from './pages/AdminPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import ReportsPage from './pages/ReportsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import InactivePage from './pages/InactivePage'

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/inactive" element={<InactivePage />} />

      {/* Protected Routes — all wrapped in AppShell layout */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:empno" element={<EmployeeDetailPage />} />
        <Route path="/jobhistory" element={<JobHistoryPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/deleted-items" element={<DeletedItemsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}

export default App
