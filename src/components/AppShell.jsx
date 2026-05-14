import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function AppShell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = currentUser?.username || currentUser?.firstname || currentUser?.email?.split("@")[0] || "User";
  const page = location.pathname.slice(1) || "employees";

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const NAV = [
    { id: "employees",    label: "Employees",    icon: "👤" },
    { id: "jobhistory",   label: "Job History",  icon: "📋" },
    { id: "jobs",         label: "Jobs",         icon: "💼" },
    { id: "departments",  label: "Departments",  icon: "🏢" },
    { id: "reports",      label: "Reports",      icon: "📊" },
    { id: "deleted-items", label: "Deleted Items", icon: "🗑️" },
    { id: "admin",        label: "Admin",        icon: "⚙️" },
  ];

  const handleNav = (id) => {
    navigate(`/${id}`);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .ni { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; color: #555; border: none; background: transparent; width: 100%; text-align: left; }
        .ni:hover { background: #eee9e2; color: #1a1a18; }
        .ni.act { background: #1a1a18; color: #fff; }
        .user-section { padding: 16px; border-top: 1px solid #eee; margin-top: auto; }
        .avatar { width: 32px; height: 32px; background: #185FA5; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .hamburger { display: none; position: fixed; top: 14px; left: 14px; z-index: 300; background: #1a1a18; color: #fff; border: none; border-radius: 8px; width: 38px; height: 38px; font-size: 18px; cursor: pointer; align-items: center; justify-content: center; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 200; }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .app-sidebar { position: fixed; top: 0; left: 0; height: 100vh; z-index: 250; transform: translateX(-100%); transition: transform .25s ease; }
          .app-sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .app-main { padding: 20px 16px; padding-top: 64px; }
        }
      `}</style>

      {/* Overlay — closes sidebar when tapping outside */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Hamburger button */}
      <button className="hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle menu">☰</button>

      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`} style={{ width: 240, background: "#fff", borderRight: "1px solid #e8e4dd", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#1a1a18", borderRadius: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>H</div>
          <span style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>Hope HRS</span>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(item => (
            <button key={item.id} className={`ni ${page === item.id ? "act" : ""}`} onClick={() => handleNav(item.id)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="user-section">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="avatar">{displayName[0].toUpperCase()}</div>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
          </div>
          <button className="ni" onClick={handleLogout} style={{ color: "#A32D2D" }}>
            <span>⬅️</span> <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="app-main" style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
