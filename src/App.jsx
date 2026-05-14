import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import InactivePage from "./pages/InactivePage";
import EmployeesPage from "./pages/EmployeesPage";
import JobHistoryPage from "./pages/JobHistoryPage";
import JobsPage from "./pages/JobsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ReportsPage from "./pages/ReportsPage";
import DeletedPage from "./pages/DeletedItemsPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/employees" replace />} />
      <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/employees" replace />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/inactive" element={<InactivePage />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/employees" replace />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="jobhistory" element={<JobHistoryPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="deleted-items" element={<DeletedPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to={currentUser ? "/employees" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
