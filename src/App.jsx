import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

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
import { AuthProvider } from './context/AuthContext'

function App() {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      if (session) fetchUserRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      if (session) fetchUserRole(session.user.id);
      else setUserRole(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId) {
    const { data } = await supabase.from("user").select("user_type").eq("userId", userId).single();
    if (data) setUserRole(data.user_type);
  }

  // Wraps a page in ProtectedRoute + AppShell
  const guarded = (page) => (
    <ProtectedRoute session={session}>
      <AppShell session={session}>{page}</AppShell>
    </ProtectedRoute>
  );

  // Show nothing while the initial session check is in flight
  const authPage = (element) =>
    session === undefined ? null
    : session ? <Navigate to="/employees" replace />
    : element;

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

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

export default App;
