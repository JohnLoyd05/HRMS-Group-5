import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RegisterPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!username.trim()) { setError("Please enter a username."); return; }
    
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    if (data?.user) {
      await supabase.from("user").insert({
        userId: data.user.id,
        username: username.trim(),
        email: email,
        user_type: "USER",
        record_status: "INACTIVE",
        // stamp: `${new Date().toISOString().slice(0,10)}|PENDING|SYSTEM` // Optional, depende sa db schema mo
      });
    }

    setBusy(false);
    setSuccess(true);
  }

  // Google OAuth handle (logic placeholder mula sa fullText)
  async function handleGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: '20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500&display=swap');
        .auth-card { width: 400px; background: #fff; border-radius: 16px; padding: 40px 36px; border: 1px solid #e0ddd8; box-shadow: 0 2px 24px rgba(0,0,0,.07); box-sizing: border-box; }
        .auth-logo { width: 48px; height: 48px; border-radius: 12px; background: #1a1a18; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #fff; font-size: 20px; font-family: 'Cormorant Garamond', serif; font-weight: 600; }
        .auth-title { margin: 0; font-size: 24px; font-weight: 600; color: #1a1a18; letter-spacing: -.01em; font-family: 'Cormorant Garamond', serif; text-align: center; }
        .auth-sub { margin: 4px 0 0; font-size: 13px; color: #888; text-align: center; margin-bottom: 24px; }
        
        .tab-group { display: flex; background: #f5f4f0; border-radius: 10px; padding: 4px; margin-bottom: 20px; }
        .tab-btn { flex: 1; padding: 8px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; transition: all .15s; font-family: 'DM Sans', sans-serif; }
        
        .lb-google { width: 100%; padding: 11px; background: #fff; color: #1a1a18; border: 1px solid #d0cec8; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .15s; font-family: 'DM Sans', sans-serif; margin-bottom: 12px; }
        .lb-google:hover { background: #f5f2ee; }
        
        .divider { display: flex; align-items: center; gap: 10px; margin: 4px 0 12px; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e8e4dd; }
        
        .form-group { margin-bottom: 12px; }
        .form-group label { fontSize: 12px; color: #666; display: block; margin-bottom: 4px; font-weight: 400;}
        .auth-input { width: 100%; padding: 10px 14px; border: 1px solid #d0cec8; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; background: #fff; transition: border .2s; font-family: 'DM Sans', sans-serif; }
        .auth-input:focus { border-color: #185FA5; }
        
        .btn-main { width: 100%; padding: 11px; background: #1a1a18; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity .15s; font-family: 'DM Sans', sans-serif; margin-top: 4px; }
        .btn-main:hover { opacity: .88; }
        .btn-main:disabled { opacity: .5; cursor: not-allowed; }
        
        .err-box { background: #FCEBEB; color: #A32D2D; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; font-family: 'DM Sans', sans-serif; }
        .review-text { fontSize: 12px; color: #999; textAlign: center; margin: 20px 0 0; line-height: 1.4; }
      `}</style>

      <div className="auth-card">
        {/* Header Section */}
        <div className="auth-logo">H</div>
        <h1 className="auth-title">Hope, Inc.</h1>
        <p className="auth-sub">Human Resource System</p>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>Registration Submitted!</h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>Your account is pending activation by an HR administrator.</p>
            <button className="btn-main" onClick={onSwitchToLogin}>Back to Sign In</button>
          </div>
        ) : (
          <>
            {/* Tab Toggle - Register is Active */}
            <div className="tab-group">
              <button className="tab-btn" onClick={onSwitchToLogin} style={{ background: "transparent", color: "#888" }}>
                Sign In
              </button>
              <button className="tab-btn" style={{ background: "#fff", color: "#1a1a18", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
                Register
              </button>
            </div>

            {error && <div className="err-box">{error}</div>}

            {/* Google Button */}
            <button className="lb-google" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.8 13.2 17.9 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/><path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.2-3.7-13.1-9L2.5 35.7C6.4 43.3 14.6 48 24 48z"/></svg>
              Register with Google
            </button>

            <div className="divider"><span style={{ fontSize: 12, color: "#aaa" }}>or</span></div>

            {/* Register Form */}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Username</label>
                <input className="auth-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. jdelacruz" required />
              </div>
              
              <div className="form-group">
                <label>Email address</label>
                <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hope.com" required />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="auth-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
              </div>
              
              <button className="btn-main" type="submit" disabled={busy}>
                {busy ? "Registering…" : "Create Account"}
              </button>
              
              <p className="review-text">
                Your account will be reviewed by an admin before you can log in.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}