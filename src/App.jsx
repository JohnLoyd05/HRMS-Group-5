import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import InactivePage from './pages/InactivePage';
import EmployeesPage from './pages/EmployeesPage';
import JobHistoryPage from './pages/JobHistoryPage';
import JobsPage from './pages/JobsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ReportsPage from './pages/ReportsPage';
import DeletedItemsPage from './pages/DeletedItemsPage';
import AdminPage from './pages/AdminPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/inactive" element={<InactivePage />} />

      {/* Protected routes — all require login */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employees" />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:empno" element={<EmployeeDetailPage />} />
        <Route path="jobhistory" element={<JobHistoryPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin" element={<AdminPage />} />

        {/* ADMIN/SUPERADMIN only — USER gets redirected to /employees */}
        <Route
          path="deleted-items"
          element={
            <ProtectedRoute requireAdmin>
              <DeletedItemsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}