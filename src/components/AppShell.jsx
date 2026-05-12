import { supabase } from "../lib/supabaseClient";

export default function AppShell({ children, page, setPage, session }) {
  const userEmail = session?.user?.email || "User";
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Dito natin ibabalik lahat ng nawalang menu items
  const NAV = [
    { id: "employees",   label: "Employees",    icon: "👤" },
    { id: "jobhistory",  label: "Job History",  icon: "📋" },
    { id: "jobs",        label: "Jobs",         icon: "💼" },
    { id: "departments", label: "Departments",  icon: "🏢" },
    { id: "reports",     label: "Reports",      icon: "📊" },
    { id: "deleted",     label: "Deleted Items", icon: "🗑️" },
    { id: "admin",       label: "Admin",        icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .ni { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; color: #555; border: none; background: transparent; width: 100%; text-align: left; }
        .ni:hover { background: #eee9e2; color: #1a1a18; } 
        .ni.act { background: #1a1a18; color: #fff; }
        .user-section { padding: 16px; border-top: 1px solid #eee; margin-top: auto; }
        .avatar { width: 32px; height: 32px; background: #185FA5; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
      `}</style>

      <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #e8e4dd", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#1a1a18", borderRadius: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>H</div>
          <span style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>Hope HRS</span>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(item => (
            <button key={item.id} className={`ni ${page === item.id ? "act" : ""}`} onClick={() => setPage(item.id)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="user-section">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="avatar">{userEmail[0].toUpperCase()}</div>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail.split('@')[0]}</div>
          </div>
          <button className="ni" onClick={handleLogout} style={{ color: "#A32D2D" }}>
            <span>⬅️</span> <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}