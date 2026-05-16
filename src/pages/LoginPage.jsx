import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500&display=swap');
        .li{width:100%;padding:10px 14px;border:1px solid #d0cec8;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;background:#fff;transition:border .2s;}
        .li:focus{border-color:#185FA5;}
        .lb{width:100%;padding:11px;background:#1a1a18;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .15s;}
        .lb:hover{opacity:.88;} .lb:disabled{opacity:.5;cursor:not-allowed;}
        .lb-google{width:100%;padding:11px;background:#fff;color:#1a1a18;border:1px solid #d0cec8;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .15s;}
        .lb-google:hover{background:#f5f2ee;}
        .divider{display:flex;align-items:center;gap:10px;margin:4px 0;}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:#e8e4dd;}
        .login-card{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:40px 36px;border:1px solid #e0ddd8;box-shadow:0 2px 24px rgba(0,0,0,.07);box-sizing:border-box;}
        @media (max-width:480px){.login-card{padding:28px 20px;}}
      `}</style>

      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1a1a18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#fff", fontSize: 20, fontFamily: "Cormorant Garamond,serif", fontWeight: 600 }}>H</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: "#1a1a18", fontFamily: "Cormorant Garamond,serif" }}>Hope, Inc.</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>Human Resource System</p>
        </div>

        <div style={{ display: "flex", background: "#f5f4f0", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          <button style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "#fff", color: "#1a1a18", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>Sign In</button>
          <button onClick={() => navigate("/register")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "transparent", color: "#888" }}>Register</button>
        </div>

        {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button className="lb-google" onClick={handleGoogle} style={{ marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.8 13.2 17.9 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.2-3.7-13.1-9L2.5 35.7C6.4 43.3 14.6 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="divider"><span style={{ fontSize: 12, color: "#aaa" }}>or</span></div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Email address</label>
            <input className="li" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hope.com" required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Password</label>
            <input className="li" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="lb" type="submit" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}