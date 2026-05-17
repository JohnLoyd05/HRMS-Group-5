import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (!firstName.trim()) { setError("Please enter your first name."); return; }
    if (!lastName.trim()) { setError("Please enter your last name."); return; }
    if (!username.trim()) { setError("Please enter a username."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setBusy(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    setSuccess(true);
  }

  async function handleGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500&display=swap');
        .ri{width:100%;padding:10px 14px;border:1px solid #d0cec8;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;background:#fff;transition:border .2s;font-family:'DM Sans',sans-serif;}
        .ri:focus{border-color:#185FA5;}
        .rb{width:100%;padding:11px;background:#1a1a18;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .15s;font-family:'DM Sans',sans-serif;}
        .rb:hover{opacity:.88;} .rb:disabled{opacity:.5;cursor:not-allowed;}
        .rb-google{width:100%;padding:11px;background:#fff;color:#1a1a18;border:1px solid #d0cec8;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .15s;font-family:'DM Sans',sans-serif;}
        .rb-google:hover{background:#f5f2ee;}
        .rdivider{display:flex;align-items:center;gap:10px;margin:4px 0;}
        .rdivider::before,.rdivider::after{content:'';flex:1;height:1px;background:#e8e4dd;}
        .reg-card{width:100%;max-width:420px;background:#fff;border-radius:16px;padding:40px 36px;border:1px solid #e0ddd8;box-shadow:0 2px 24px rgba(0,0,0,.07);box-sizing:border-box;}
        .name-row{display:flex;gap:10px;}
        .name-row > div{flex:1;}
        @media (max-width:480px){
          .reg-card{padding:28px 20px;}
          .name-row{flex-direction:column;gap:0;}
        }
      `}</style>

      <div className="reg-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1a1a18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#fff", fontSize: 20, fontFamily: "Cormorant Garamond,serif", fontWeight: 600 }}>H</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: "#1a1a18", fontFamily: "Cormorant Garamond,serif" }}>Hope, Inc.</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>Human Resource System</p>
        </div>

        <div style={{ display: "flex", background: "#f5f4f0", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          <button onClick={() => navigate("/login")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "transparent", color: "#888", fontFamily: "'DM Sans',sans-serif" }}>Sign In</button>
          <button style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "#fff", color: "#1a1a18", boxShadow: "0 1px 4px rgba(0,0,0,.08)", fontFamily: "'DM Sans',sans-serif" }}>Register</button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#1a1a18" }}>Registration Submitted!</h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>Your account is pending activation by an HR administrator.</p>
            <button className="rb" onClick={() => navigate("/login")}>Back to Sign In</button>
          </div>
        ) : (
          <>
            {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{error}</div>}

            <button className="rb-google" onClick={handleGoogle} style={{ marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.8 13.2 17.9 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/>
                <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z"/>
                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.2-3.7-13.1-9L2.5 35.7C6.4 43.3 14.6 48 24 48z"/>
              </svg>
              Register with Google
            </button>

            <div className="rdivider"><span style={{ fontSize: 12, color: "#aaa" }}>or</span></div>

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <div className="name-row">
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>First Name</label>
                  <input className="ri" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Juan" required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Last Name</label>
                  <input className="ri" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Dela Cruz" required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Username</label>
                <input className="ri" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. jdelacruz" required />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Email address</label>
                <input className="ri" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hope.com" required />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Password</label>
                <input className="ri" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Confirm Password</label>
                <input className="ri" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
              </div>

              <button className="rb" type="submit" disabled={busy} style={{ marginTop: 4 }}>
                {busy ? "Registering…" : "Create Account"}
              </button>

              <p style={{ fontSize: 12, color: "#999", textAlign: "center", margin: "4px 0 0", lineHeight: 1.4 }}>
                Your account will be reviewed by an admin before you can log in.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
