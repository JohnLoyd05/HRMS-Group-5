import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

import EmployeesPage from "./pages/EmployeesPage";
import JobHistoryPage from "./pages/JobHistoryPage";
import JobsPage from "./pages/JobsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import DeletedPage from "./pages/DeletedItemsPage";
import AdminPage from "./pages/AdminPage";

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
    <Routes>
      <Route path="/login"        element={authPage(<LoginPage onSwitchToRegister={() => navigate("/register")} />)} />
      <Route path="/register"     element={authPage(<RegisterPage onSwitchToLogin={() => navigate("/login")} />)} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route path="/employees"    element={guarded(<EmployeesPage userRole={userRole} />)} />
      <Route path="/jobhistory"   element={guarded(<JobHistoryPage />)} />
      <Route path="/jobs"         element={guarded(<JobsPage />)} />
      <Route path="/departments"  element={guarded(<DepartmentsPage />)} />
      <Route path="/deleted-items" element={guarded(<DeletedPage />)} />
      <Route path="/admin"        element={guarded(<AdminPage />)} />

      <Route path="/" element={<Navigate to="/employees" replace />} />
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}

export default App;
