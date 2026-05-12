import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f4f0",
      fontFamily: "DM Sans,sans-serif",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid #e0ddd8",
          borderTop: "3px solid #1a1a18",
          borderRadius: "50%",
          margin: "0 auto 12px",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#888", fontSize: 13 }}>Signing you in…</p>
      </div>
    </div>
  );
}