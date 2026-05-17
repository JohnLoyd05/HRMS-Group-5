import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function InactivePage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f4f0",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "40px 36px",
        maxWidth: 400, width: "100%", textAlign: "center",
        border: "1px solid #e0ddd8", boxShadow: "0 2px 24px rgba(0,0,0,.07)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: "#fde8e8",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 22,
        }}>
          🔒
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a18", margin: "0 0 10px" }}>
          Account Inactive
        </h1>

        <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px", lineHeight: 1.6 }}>
          Your account has been deactivated. Please contact your administrator to restore access.
        </p>

        <button
          onClick={handleSignOut}
          style={{
            width: "100%", padding: "11px", background: "#1a1a18", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
