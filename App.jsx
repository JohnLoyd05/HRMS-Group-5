import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import EmployeesPage from './pages/EmployeesPage'
import JobHistoryPage from './pages/JobHistoryPage'
import JobsPage from './pages/JobsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import AdminPage from './pages/AdminPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
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
    </BrowserRouter>
  )
}

export default App
import { useState, createContext, useContext, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Context ──────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
function useApp() { return useContext(AppCtx); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(first, last) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}
const AVATAR_COLORS = ["#185FA5","#0F6E56","#993C1D","#993556","#3B6D11","#BA7517","#A32D2D","#534AB7"];
function avatarColor(id) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function Badge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:500,
      background: active ? "#EAF3DE" : "#FCEBEB", color: active ? "#3B6D11" : "#A32D2D" }}>
      {status}
    </span>
  );
}
function RoleBadge({ type }) {
  const cfg = { SUPERADMIN:{bg:"#EEEDFE",color:"#3C3489"}, ADMIN:{bg:"#E1F5EE",color:"#085041"}, USER:{bg:"#E6F1FB",color:"#0C447C"} }[type] ?? {bg:"#F1EFE8",color:"#444441"};
  return <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:500, background:cfg.bg, color:cfg.color }}>{type}</span>;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUser(session);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) await loadUser(session);
      else { setCurrentUser(null); setRights({}); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUser(session) {
    setLoading(true);
    const { data: userRow } = await supabase.from("user").select("*").eq("userId", session.user.id).single();
    if (!userRow || userRow.record_status !== "ACTIVE") {
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    setCurrentUser(userRow);
    const { data: rightsRows } = await supabase.from("UserModule_Rights").select("*").eq("userId", session.user.id);
    const rMap = {};
    (rightsRows ?? []).forEach(r => { rMap[r.rightCode] = r.right_value; });
    setRights(rMap);
    setLoading(false);
  }

  const isSA = currentUser?.user_type === "SUPERADMIN";
  const isAdminPlus = currentUser?.user_type === "SUPERADMIN" || currentUser?.user_type === "ADMIN";

  async function signOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setRights({});
  }

  return (
    <AppCtx.Provider value={{ currentUser, session, rights, loading, isSA, isAdminPlus, signOut, supabase }}>
      {children}
    </AppCtx.Provider>
  );
}

// ─── Login / Register ─────────────────────────────────────────────────────────
function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "success"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!username.trim()) { setError("Please enter a username."); return; }
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setBusy(false); return; }
    if (data?.user) {
      await supabase.from("user").insert({
        userId: data.user.id,
        username: username.trim(),
        email: email,
        user_type: "USER",
        record_status: "INACTIVE",
        stamp: `${new Date().toISOString().slice(0,10)}|PENDING|SYSTEM`
      });
    }
    setBusy(false);
    setMode("success");
  }

  const isLogin = mode === "login";
  const isSuccess = mode === "success";

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f4f0", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
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
        .toggle-link{background:none;border:none;color:#185FA5;font-size:13px;cursor:pointer;padding:0;text-decoration:underline;}
      `}</style>

      <div style={{ width:400, background:"#fff", borderRadius:16, padding:"40px 36px", border:"1px solid #e0ddd8", boxShadow:"0 2px 24px rgba(0,0,0,.07)" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:48,height:48,borderRadius:12,background:"#1a1a18",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:"#fff",fontSize:20,fontFamily:"Cormorant Garamond,serif",fontWeight:600 }}>H</div>
          <h1 style={{ margin:0,fontSize:24,fontWeight:600,color:"#1a1a18",letterSpacing:"-.01em",fontFamily:"Cormorant Garamond,serif" }}>Hope, Inc.</h1>
          <p style={{ margin:"4px 0 0",fontSize:13,color:"#888" }}>Human Resource System</p>
        </div>

        {/* Success screen */}
        {isSuccess ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:600 }}>Registration Submitted!</h3>
            <p style={{ fontSize:13, color:"#666", margin:"0 0 20px" }}>Your account is pending activation by an HR administrator. You will be able to log in once activated.</p>
            <button className="lb" onClick={()=>{ setMode("login"); setEmail(""); setPassword(""); setUsername(""); setConfirmPassword(""); }}>Back to Sign In</button>
          </div>
        ) : (
          <>
            {/* Tab toggle */}
            <div style={{ display:"flex", background:"#f5f4f0", borderRadius:10, padding:4, marginBottom:20 }}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>{ setMode(m); setError(""); }} style={{ flex:1, padding:"8px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background: mode===m?"#fff":"transparent", color: mode===m?"#1a1a18":"#888", boxShadow: mode===m?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s" }}>
                  {m==="login"?"Sign In":"Register"}
                </button>
              ))}
            </div>

            {error && <div style={{ background:"#FCEBEB",color:"#A32D2D",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:14 }}>{error}</div>}

            {/* Google button */}
            <button className="lb-google" onClick={handleGoogle} style={{ marginBottom:12 }}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.8 13.2 17.9 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.5 46.5 31.4 46.5 24.5z"/><path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.2-3.7-13.1-9L2.5 35.7C6.4 43.3 14.6 48 24 48z"/></svg>
              {isLogin ? "Sign in with Google" : "Register with Google"}
            </button>

            <div className="divider"><span style={{ fontSize:12, color:"#aaa" }}>or</span></div>

            {/* Login form */}
            {isLogin && (
              <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:12,marginTop:12 }}>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:4 }}>Email address</label>
                  <input className="li" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@hope.com" required /></div>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:4 }}>Password</label>
                  <input className="li" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required /></div>
                <button className="lb" type="submit" disabled={busy} style={{ marginTop:4 }}>{busy?"Signing in…":"Sign in"}</button>
              </form>
            )}

            {/* Register form */}
            {!isLogin && (
              <form onSubmit={handleRegister} style={{ display:"flex",flexDirection:"column",gap:12,marginTop:12 }}>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:4 }}>Username</label>
                  <input className="li" type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. jdelacruz" required /></div>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:4 }}>Email address</label>
                  <input className="li" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@hope.com" required /></div>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:4 }}>Password</label>
                  <input className="li" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" required /></div>
                <div><label style={{ fontSize:12,color:"#666",display:"block",marginBottom:4 }}>Confirm Password</label>
                  <input className="li" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter password" required /></div>
                <button className="lb" type="submit" disabled={busy} style={{ marginTop:4 }}>{busy?"Registering…":"Create Account"}</button>
                <p style={{ fontSize:12,color:"#999",textAlign:"center",margin:0 }}>Your account will be reviewed by an admin before you can log in.</p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"employees",   label:"Employees",    icon:"👤" },
  { id:"jobhistory",  label:"Job History",  icon:"📋" },
  { id:"jobs",        label:"Jobs",         icon:"💼" },
  { id:"departments", label:"Departments",  icon:"🏢" },
  { id:"reports",     label:"Reports",      icon:"📊" },
  { id:"deleted",     label:"Deleted Items",icon:"🗑️", adminOnly:true },
  { id:"admin",       label:"Admin",        icon:"⚙️", adminOnly:true },
];

function Shell({ children, page, setPage }) {
  const { currentUser, isAdminPlus, signOut } = useApp();
  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#f5f4f0",fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500&display=swap');
        .ni{display:flex;align-items:center;gap:10px;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:14px;transition:background .12s,color .12s;color:#555;border:none;background:transparent;width:100%;text-align:left;}
        .ni:hover{background:#eee9e2;color:#1a1a18;} .ni.act{background:#1a1a18;color:#fff;}
        .cc{background:#fff;border-radius:14px;border:1px solid #e8e4dd;padding:24px 28px;}
        .tbl{width:100%;border-collapse:collapse;font-size:13.5px;} .tbl th{text-align:left;padding:8px 12px;color:#888;font-weight:500;font-size:12px;border-bottom:1px solid #eee;}
        .tbl td{padding:10px 12px;border-bottom:1px solid #f4f1ec;vertical-align:middle;} .tbl tr:last-child td{border-bottom:none;} .tbl tr:hover td{background:#faf8f5;}
        .ab{padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #d0cdc6;background:#fff;transition:background .12s;}
        .ab:hover{background:#f0ede8;} .ab.danger{color:#A32D2D;border-color:#F7C1C1;} .ab.danger:hover{background:#FCEBEB;}
        .ab.recover{color:#3B6D11;border-color:#C0DD97;} .ab.recover:hover{background:#EAF3DE;}
        .mbg{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:100;}
        .mo{background:#fff;border-radius:14px;padding:28px 32px;width:480px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.12);}
        .fr{display:flex;flex-direction:column;gap:4px;} .fl{font-size:12px;color:#666;font-weight:500;}
        .fi{padding:9px 12px;border:1px solid #d0cdc6;border-radius:8px;font-size:14px;outline:none;transition:border .15s;} .fi:focus{border-color:#185FA5;}
        .bp{padding:9px 20px;background:#1a1a18;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;} .bp:hover{opacity:.88;}
        .bg{padding:9px 20px;background:transparent;color:#555;border:1px solid #d0cdc6;border-radius:8px;font-size:13px;cursor:pointer;} .bg:hover{background:#f5f2ee;}
        .si{padding:8px 14px;border:1px solid #d0cdc6;border-radius:8px;font-size:13px;outline:none;background:#fff;width:220px;} .si:focus{border-color:#185FA5;}
        .av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;color:#fff;flex-shrink:0;}`}
      </style>
      <aside style={{ width:220,background:"#fff",borderRight:"1px solid #e8e4dd",display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"20px 16px 16px",borderBottom:"1px solid #eee",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,background:"#1a1a18",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontFamily:"Cormorant Garamond,serif",fontWeight:600 }}>H</div>
          <span style={{ fontFamily:"Cormorant Garamond,serif",fontSize:17,fontWeight:600,color:"#1a1a18" }}>Hope HRS</span>
        </div>
        <nav style={{ flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2 }}>
          {NAV.filter(n=>!n.adminOnly||isAdminPlus).map(item=>(
            <button key={item.id} className={`ni${page===item.id?" act":""}`} onClick={()=>setPage(item.id)}>
              <span style={{ fontSize:16,width:18,textAlign:"center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 10px",borderTop:"1px solid #eee" }}>
          <div style={{ padding:"8px 12px",borderRadius:8,background:"#f5f4f0",marginBottom:8 }}>
            <div style={{ fontSize:12,fontWeight:500,color:"#1a1a18",marginBottom:4 }}>{currentUser?.username}</div>
            <RoleBadge type={currentUser?.user_type} />
          </div>
          <button className="ni" onClick={signOut} style={{ color:"#A32D2D" }}>
            <span style={{ fontSize:16 }}>→</span><span>Sign out</span>
          </button>
        </div>
      </aside>
      <main style={{ flex:1,padding:"28px 32px",overflowY:"auto" }}>{children}</main>
    </div>
  );
}

// ─── Employees ────────────────────────────────────────────────────────────────
function EmployeesPage() {
  const { supabase, rights, isAdminPlus } = useApp();
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [{ data: e }, { data: j }, { data: d }, { data: jh }] = await Promise.all([
      supabase.from("employee").select("*").order("empno"),
      supabase.from("job").select("*"),
      supabase.from("department").select("*"),
      supabase.from("jobhistory").select("*").order("effdate", { ascending: false }),
    ]);
    setEmployees(e ?? []);
    setJobs(j ?? []);
    setDepartments(d ?? []);
    setJobHistory(jh ?? []);
  }

  function getCurrentJob(empno) {
    const rows = (jobHistory ?? []).filter(j => j.empno === empno && j.record_status === "ACTIVE");
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      jobDesc: jobs.find(j => j.jobcode === row.jobcode)?.jobdesc ?? row.jobcode,
      deptName: departments.find(d => d.deptcode === row.deptcode)?.deptname ?? row.deptcode,
    };
  }

  const visible = employees.filter(e =>
    (isAdminPlus || e.record_status === "ACTIVE") &&
    `${e.firstname} ${e.lastname} ${e.empno}`.toLowerCase().includes(search.toLowerCase())
  );

  async function saveAdd() {
    setBusy(true);
    await supabase.from("employee").insert({ ...form, record_status: "ACTIVE", stamp: `${new Date().toISOString().slice(0,10)}|ADD` });
    await fetchAll(); setModal(null); setBusy(false);
  }
  async function saveEdit() {
    setBusy(true);
    await supabase.from("employee").update({ ...form, stamp: `${new Date().toISOString().slice(0,10)}|EDIT` }).eq("empno", form.empno);
    await fetchAll(); setModal(null); setBusy(false);
  }
  async function softDel(emp) {
    setBusy(true);
    await supabase.from("employee").update({ record_status:"INACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|DEL` }).eq("empno", emp.empno);
    await supabase.from("jobhistory").update({ record_status:"INACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|CASCADE` }).eq("empno", emp.empno);
    await fetchAll(); setModal(null); setBusy(false);
  }

  return (
    <div>
      <h2 style={{ fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18" }}>Employees</h2>
      <div className="cc">
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <input className="si" placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)} />
          {rights.EMP_ADD===1 && <button className="bp" onClick={()=>{setForm({empno:"",lastname:"",firstname:"",gender:"M",birthdate:"",hiredate:"",sepdate:""});setModal({type:"add"});}}>+ Add Employee</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Emp #</th><th>Name</th><th>Gender</th><th>Hire Date</th><th>Current Job</th><th>Dept</th><th>Status</th>{isAdminPlus&&<th>Stamp</th>}<th></th></tr></thead>
          <tbody>
            {visible.map(emp => {
              const cj = getCurrentJob(emp.empno);
              return (
                <tr key={emp.empno}>
                  <td style={{ fontFamily:"monospace",color:"#888",fontSize:12 }}>{emp.empno}</td>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div className="av" style={{ background:avatarColor(emp.empno) }}>{getInitials(emp.firstname,emp.lastname)}</div>
                      <div><div style={{ fontWeight:500 }}>{emp.firstname} {emp.lastname}</div><div style={{ fontSize:11,color:"#aaa" }}>{emp.birthdate}</div></div>
                    </div>
                  </td>
                  <td>{emp.gender==="M"?"Male":"Female"}</td>
                  <td style={{ fontSize:12,color:"#666" }}>{emp.hiredate}</td>
                  <td style={{ fontSize:12 }}>{cj?.jobDesc ?? <span style={{color:"#ccc"}}>—</span>}</td>
                  <td style={{ fontSize:12 }}>{cj?.deptName ?? <span style={{color:"#ccc"}}>—</span>}</td>
                  <td><Badge status={emp.record_status} /></td>
                  {isAdminPlus&&<td style={{ fontSize:10,color:"#bbb",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{emp.stamp}</td>}
                  <td>
                    <div style={{ display:"flex",gap:6 }}>
                      <button className="ab" onClick={()=>setDetail(emp)}>View</button>
                      {rights.EMP_EDIT===1&&emp.record_status==="ACTIVE"&&<button className="ab" onClick={()=>{setForm({...emp});setModal({type:"edit"});}}>Edit</button>}
                      {rights.EMP_DEL===1&&emp.record_status==="ACTIVE"&&<button className="ab danger" onClick={()=>setModal({type:"del",data:emp})}>Delete</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length===0&&<tr><td colSpan={isAdminPlus?9:8} style={{ textAlign:"center",color:"#bbb",padding:"32px 0" }}>No employees found.</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="mbg" onClick={()=>setDetail(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()} style={{ width:560 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
              <div style={{ display:"flex",gap:14,alignItems:"center" }}>
                <div className="av" style={{ width:48,height:48,fontSize:16,background:avatarColor(detail.empno) }}>{getInitials(detail.firstname,detail.lastname)}</div>
                <div><div style={{ fontSize:18,fontWeight:600 }}>{detail.firstname} {detail.lastname}</div>
                  <div style={{ fontSize:12,color:"#888" }}>Emp # {detail.empno} · {detail.gender==="M"?"Male":"Female"} · Born {detail.birthdate}</div></div>
              </div>
              <button className="bg" style={{ padding:"6px 12px",fontSize:12 }} onClick={()=>setDetail(null)}>Close</button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20 }}>
              {[{label:"Hire Date",value:detail.hiredate},{label:"Sep Date",value:detail.sepdate??'Active'},{label:"Status",value:<Badge status={detail.record_status}/>}].map(s=>(
                <div key={s.label} style={{ background:"#f5f4f0",borderRadius:8,padding:"10px 14px" }}>
                  <div style={{ fontSize:11,color:"#999" }}>{s.label}</div>
                  <div style={{ fontSize:13,fontWeight:500 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:13,fontWeight:600,marginBottom:10 }}>Job History</div>
            <table className="tbl" style={{ fontSize:12 }}>
              <thead><tr><th>Eff. Date</th><th>Job</th><th>Department</th><th>Salary</th><th>Status</th></tr></thead>
              <tbody>
                {jobHistory.filter(j=>j.empno===detail.empno&&(isAdminPlus||j.record_status==="ACTIVE")).map((j,i)=>(
                  <tr key={i}>
                    <td>{j.effdate}</td>
                    <td>{jobs.find(x=>x.jobcode===j.jobcode)?.jobdesc??j.jobcode}</td>
                    <td>{departments.find(x=>x.deptcode===j.deptcode)?.deptname??j.deptcode}</td>
                    <td>₱{Number(j.salary).toLocaleString()}</td>
                    <td><Badge status={j.record_status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(modal?.type==="add"||modal?.type==="edit")&&(
        <div className="mbg" onClick={()=>setModal(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()}>
            <h3 style={{ margin:"0 0 20px",fontSize:18,fontWeight:600 }}>{modal.type==="add"?"Add Employee":"Edit Employee"}</h3>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {modal.type==="add"&&<div className="fr" style={{ gridColumn:"1/-1" }}><label className="fl">Employee #</label><input className="fi" value={form.empno} onChange={e=>setForm(p=>({...p,empno:e.target.value}))} placeholder="00001"/></div>}
              <div className="fr"><label className="fl">First Name</label><input className="fi" value={form.firstname} onChange={e=>setForm(p=>({...p,firstname:e.target.value}))}/></div>
              <div className="fr"><label className="fl">Last Name</label><input className="fi" value={form.lastname} onChange={e=>setForm(p=>({...p,lastname:e.target.value}))}/></div>
              <div className="fr"><label className="fl">Gender</label><select className="fi" value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))}><option value="M">Male</option><option value="F">Female</option></select></div>
              <div className="fr"><label className="fl">Birthdate</label><input className="fi" type="date" value={form.birthdate} onChange={e=>setForm(p=>({...p,birthdate:e.target.value}))}/></div>
              <div className="fr"><label className="fl">Hire Date</label><input className="fi" type="date" value={form.hiredate} onChange={e=>setForm(p=>({...p,hiredate:e.target.value}))}/></div>
              <div className="fr"><label className="fl">Sep. Date</label><input className="fi" type="date" value={form.sepdate??""} onChange={e=>setForm(p=>({...p,sepdate:e.target.value||null}))}/></div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:20 }}>
              <button className="bg" onClick={()=>setModal(null)}>Cancel</button>
              <button className="bp" onClick={modal.type==="add"?saveAdd:saveEdit} disabled={busy}>{busy?"Saving…":modal.type==="add"?"Add":"Save"}</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type==="del"&&(
        <div className="mbg" onClick={()=>setModal(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()} style={{ width:360 }}>
            <h3 style={{ margin:"0 0 12px",fontSize:17 }}>Soft-delete employee?</h3>
            <p style={{ color:"#666",fontSize:14,margin:"0 0 20px" }}>This will set <strong>{modal.data.firstname} {modal.data.lastname}</strong> and all their job history to INACTIVE.</p>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
              <button className="bg" onClick={()=>setModal(null)}>Cancel</button>
              <button className="bp" style={{ background:"#A32D2D" }} onClick={()=>softDel(modal.data)} disabled={busy}>{busy?"Deleting…":"Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Job History ──────────────────────────────────────────────────────────────
function JobHistoryPage() {
  const { supabase, rights, isAdminPlus } = useApp();
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [{ data: jh }, { data: e }, { data: j }, { data: d }] = await Promise.all([
      supabase.from("jobhistory").select("*").order("effdate", { ascending: false }),
      supabase.from("employee").select("*"),
      supabase.from("job").select("*"),
      supabase.from("department").select("*"),
    ]);
    setRows(jh ?? []); setEmployees(e ?? []); setJobs(j ?? []); setDepartments(d ?? []);
  }

  const visible = rows.filter(j => {
    if (!isAdminPlus && j.record_status !== "ACTIVE") return false;
    const emp = employees.find(e => e.empno === j.empno);
    return `${j.empno} ${emp?.firstname} ${emp?.lastname}`.toLowerCase().includes(search.toLowerCase());
  });

  async function saveAdd() {
    setBusy(true);
    await supabase.from("jobhistory").insert({ empno:form.empno, jobcode:form.jobcode, effdate:form.effdate, salary:form.salary, deptcode:form.deptcode, record_status:"ACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|ADD` });
    await fetchAll(); setModal(null); setBusy(false);
  }
  async function saveEdit() {
    setBusy(true);
    await supabase.from("jobhistory").update({ salary:form.salary, deptcode:form.deptcode, stamp:`${new Date().toISOString().slice(0,10)}|EDIT` }).eq("empno",form.empno).eq("jobcode",form.jobcode).eq("effdate",form.effdate);
    await fetchAll(); setModal(null); setBusy(false);
  }
  async function softDel(row) {
    await supabase.from("jobhistory").update({ record_status:"INACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|DEL` }).eq("empno",row.empno).eq("jobcode",row.jobcode).eq("effdate",row.effdate);
    await fetchAll();
  }

  return (
    <div>
      <h2 style={{ fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18" }}>Job History</h2>
      <div className="cc">
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <input className="si" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {rights.JH_ADD===1&&<button className="bp" onClick={()=>{setForm({empno:"",jobcode:"",effdate:"",salary:"",deptcode:""});setModal({type:"add"});}}>+ Add Record</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Employee</th><th>Job</th><th>Department</th><th>Eff. Date</th><th>Salary</th><th>Status</th>{isAdminPlus&&<th>Stamp</th>}<th></th></tr></thead>
          <tbody>
            {visible.slice(0,50).map((j,i)=>{
              const emp = employees.find(e=>e.empno===j.empno);
              const job = jobs.find(x=>x.jobcode===j.jobcode);
              const dept = departments.find(x=>x.deptcode===j.deptcode);
              return (
                <tr key={i}>
                  <td><div style={{fontSize:12}}><strong>{emp?.firstname} {emp?.lastname}</strong><br/><span style={{color:"#aaa",fontFamily:"monospace"}}>{j.empno}</span></div></td>
                  <td><strong style={{fontSize:13}}>{job?.jobdesc??j.jobcode}</strong></td>
                  <td style={{fontSize:12}}>{dept?.deptname??j.deptcode}</td>
                  <td style={{fontSize:12,color:"#666"}}>{j.effdate}</td>
                  <td style={{fontSize:12}}>₱{Number(j.salary).toLocaleString()}</td>
                  <td><Badge status={j.record_status}/></td>
                  {isAdminPlus&&<td style={{fontSize:10,color:"#bbb",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.stamp}</td>}
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      {rights.JH_EDIT===1&&j.record_status==="ACTIVE"&&<button className="ab" onClick={()=>{setForm({...j});setModal({type:"edit"});}}>Edit</button>}
                      {rights.JH_DEL===1&&j.record_status==="ACTIVE"&&<button className="ab danger" onClick={()=>softDel(j)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length===0&&<tr><td colSpan={isAdminPlus?8:7} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>
      {(modal?.type==="add"||modal?.type==="edit")&&(
        <div className="mbg" onClick={()=>setModal(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:600}}>{modal.type==="add"?"Add Job History":"Edit Job History"}</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="fr"><label className="fl">Employee</label><select className="fi" value={form.empno} onChange={e=>setForm(p=>({...p,empno:e.target.value}))}><option value="">—</option>{employees.filter(e=>e.record_status==="ACTIVE").map(e=><option key={e.empno} value={e.empno}>{e.empno} — {e.firstname} {e.lastname}</option>)}</select></div>
              <div className="fr"><label className="fl">Job Code</label><select className="fi" value={form.jobcode} onChange={e=>setForm(p=>({...p,jobcode:e.target.value}))}><option value="">—</option>{jobs.filter(j=>j.record_status==="ACTIVE").map(j=><option key={j.jobcode} value={j.jobcode}>{j.jobcode} — {j.jobdesc}</option>)}</select></div>
              <div className="fr"><label className="fl">Eff. Date</label><input className="fi" type="date" value={form.effdate} onChange={e=>setForm(p=>({...p,effdate:e.target.value}))}/></div>
              <div className="fr"><label className="fl">Salary</label><input className="fi" type="number" value={form.salary} onChange={e=>setForm(p=>({...p,salary:e.target.value}))}/></div>
              <div className="fr" style={{gridColumn:"1/-1"}}><label className="fl">Department</label><select className="fi" value={form.deptcode} onChange={e=>setForm(p=>({...p,deptcode:e.target.value}))}><option value="">—</option>{departments.filter(d=>d.record_status==="ACTIVE").map(d=><option key={d.deptcode} value={d.deptcode}>{d.deptcode} — {d.deptname}</option>)}</select></div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}>
              <button className="bg" onClick={()=>setModal(null)}>Cancel</button>
              <button className="bp" onClick={modal.type==="add"?saveAdd:saveEdit} disabled={busy}>{busy?"Saving…":modal.type==="add"?"Add":"Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
function JobsPage() {
  const { supabase, rights, isAdminPlus } = useApp();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(()=>{ supabase.from("job").select("*").order("jobcode").then(({data})=>setJobs(data??[])); },[]);

  const visible = jobs.filter(j=>(isAdminPlus||j.record_status==="ACTIVE")&&`${j.jobcode} ${j.jobdesc}`.toLowerCase().includes(search.toLowerCase()));

  async function saveAdd() { setBusy(true); await supabase.from("job").insert({jobcode:form.jobcode,jobdesc:form.jobdesc,record_status:"ACTIVE",stamp:`${new Date().toISOString().slice(0,10)}|ADD`}); const {data}=await supabase.from("job").select("*").order("jobcode"); setJobs(data??[]); setModal(null); setBusy(false); }
  async function saveEdit() { setBusy(true); await supabase.from("job").update({jobdesc:form.jobdesc,stamp:`${new Date().toISOString().slice(0,10)}|EDIT`}).eq("jobcode",form.jobcode); const {data}=await supabase.from("job").select("*").order("jobcode"); setJobs(data??[]); setModal(null); setBusy(false); }
  async function softDel(row) { await supabase.from("job").update({record_status:"INACTIVE",stamp:`${new Date().toISOString().slice(0,10)}|DEL`}).eq("jobcode",row.jobcode); const {data}=await supabase.from("job").select("*").order("jobcode"); setJobs(data??[]); }

  return (
    <div>
      <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18"}}>Jobs</h2>
      <div className="cc">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <input className="si" placeholder="Search jobs…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {rights.JOB_ADD===1&&<button className="bp" onClick={()=>{setForm({jobcode:"",jobdesc:""});setModal({type:"add"});}}>+ Add Job</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Code</th><th>Description</th><th>Status</th>{isAdminPlus&&<th>Stamp</th>}<th></th></tr></thead>
          <tbody>
            {visible.map(j=>(
              <tr key={j.jobcode}>
                <td style={{fontFamily:"monospace",fontWeight:500}}>{j.jobcode}</td>
                <td>{j.jobdesc}</td>
                <td><Badge status={j.record_status}/></td>
                {isAdminPlus&&<td style={{fontSize:10,color:"#bbb"}}>{j.stamp}</td>}
                <td><div style={{display:"flex",gap:6}}>
                  {rights.JOB_EDIT===1&&j.record_status==="ACTIVE"&&<button className="ab" onClick={()=>{setForm({...j});setModal({type:"edit"});}}>Edit</button>}
                  {rights.JOB_DEL===1&&j.record_status==="ACTIVE"&&<button className="ab danger" onClick={()=>softDel(j)}>Delete</button>}
                </div></td>
              </tr>
            ))}
            {visible.length===0&&<tr><td colSpan={isAdminPlus?5:4} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No jobs found.</td></tr>}
          </tbody>
        </table>
      </div>
      {(modal?.type==="add"||modal?.type==="edit")&&(
        <div className="mbg" onClick={()=>setModal(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()} style={{width:360}}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:600}}>{modal.type==="add"?"Add Job":"Edit Job"}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {modal.type==="add"&&<div className="fr"><label className="fl">Job Code</label><input className="fi" value={form.jobcode} onChange={e=>setForm(p=>({...p,jobcode:e.target.value}))} placeholder="e.g. PR3"/></div>}
              <div className="fr"><label className="fl">Description</label><input className="fi" value={form.jobdesc} onChange={e=>setForm(p=>({...p,jobdesc:e.target.value}))}/></div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}>
              <button className="bg" onClick={()=>setModal(null)}>Cancel</button>
              <button className="bp" onClick={modal.type==="add"?saveAdd:saveEdit} disabled={busy}>{busy?"Saving…":modal.type==="add"?"Add":"Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Departments ──────────────────────────────────────────────────────────────
function DepartmentsPage() {
  const { supabase, rights, isAdminPlus } = useApp();
  const [depts, setDepts] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(()=>{ supabase.from("department").select("*").order("deptcode").then(({data})=>setDepts(data??[])); },[]);

  const visible = depts.filter(d=>(isAdminPlus||d.record_status==="ACTIVE")&&`${d.deptcode} ${d.deptname}`.toLowerCase().includes(search.toLowerCase()));

  async function saveAdd() { setBusy(true); await supabase.from("department").insert({deptcode:form.deptcode,deptname:form.deptname,record_status:"ACTIVE",stamp:`${new Date().toISOString().slice(0,10)}|ADD`}); const {data}=await supabase.from("department").select("*").order("deptcode"); setDepts(data??[]); setModal(null); setBusy(false); }
  async function saveEdit() { setBusy(true); await supabase.from("department").update({deptname:form.deptname,stamp:`${new Date().toISOString().slice(0,10)}|EDIT`}).eq("deptcode",form.deptcode); const {data}=await supabase.from("department").select("*").order("deptcode"); setDepts(data??[]); setModal(null); setBusy(false); }
  async function softDel(row) { await supabase.from("department").update({record_status:"INACTIVE",stamp:`${new Date().toISOString().slice(0,10)}|DEL`}).eq("deptcode",row.deptcode); const {data}=await supabase.from("department").select("*").order("deptcode"); setDepts(data??[]); }

  return (
    <div>
      <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18"}}>Departments</h2>
      <div className="cc">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <input className="si" placeholder="Search departments…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {rights.DEPT_ADD===1&&<button className="bp" onClick={()=>{setForm({deptcode:"",deptname:""});setModal({type:"add"});}}>+ Add Dept</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Code</th><th>Name</th><th>Status</th>{isAdminPlus&&<th>Stamp</th>}<th></th></tr></thead>
          <tbody>
            {visible.map(d=>(
              <tr key={d.deptcode}>
                <td style={{fontFamily:"monospace",fontWeight:500}}>{d.deptcode}</td>
                <td>{d.deptname}</td>
                <td><Badge status={d.record_status}/></td>
                {isAdminPlus&&<td style={{fontSize:10,color:"#bbb"}}>{d.stamp}</td>}
                <td><div style={{display:"flex",gap:6}}>
                  {rights.DEPT_EDIT===1&&d.record_status==="ACTIVE"&&<button className="ab" onClick={()=>{setForm({...d});setModal({type:"edit"});}}>Edit</button>}
                  {rights.DEPT_DEL===1&&d.record_status==="ACTIVE"&&<button className="ab danger" onClick={()=>softDel(d)}>Delete</button>}
                </div></td>
              </tr>
            ))}
            {visible.length===0&&<tr><td colSpan={isAdminPlus?5:4} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No departments found.</td></tr>}
          </tbody>
        </table>
      </div>
      {(modal?.type==="add"||modal?.type==="edit")&&(
        <div className="mbg" onClick={()=>setModal(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()} style={{width:360}}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:600}}>{modal.type==="add"?"Add Department":"Edit Department"}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {modal.type==="add"&&<div className="fr"><label className="fl">Dept Code</label><input className="fi" value={form.deptcode} onChange={e=>setForm(p=>({...p,deptcode:e.target.value}))} placeholder="e.g. MKT"/></div>}
              <div className="fr"><label className="fl">Dept Name</label><input className="fi" value={form.deptname} onChange={e=>setForm(p=>({...p,deptname:e.target.value}))}/></div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}>
              <button className="bg" onClick={()=>setModal(null)}>Cancel</button>
              <button className="bp" onClick={modal.type==="add"?saveAdd:saveEdit} disabled={busy}>{busy?"Saving…":modal.type==="add"?"Add":"Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function ReportsPage() {
  const { supabase } = useApp();
  const [headcount, setHeadcount] = useState([]);
  const [salary, setSalary] = useState([]);
  const [stats, setStats] = useState({ active:0, total:0, depts:0 });

  useEffect(()=>{ fetchReports(); },[]);

  async function fetchReports() {
    const [{ data: emps }, { data: jh }, { data: jobs }, { data: depts }] = await Promise.all([
      supabase.from("employee").select("*"),
      supabase.from("jobhistory").select("*").eq("record_status","ACTIVE"),
      supabase.from("job").select("*").eq("record_status","ACTIVE"),
      supabase.from("department").select("*").eq("record_status","ACTIVE"),
    ]);

    const activeEmps = (emps??[]).filter(e=>e.record_status==="ACTIVE");
    setStats({ active:activeEmps.length, total:(emps??[]).length, depts:(depts??[]).length });

    const deptMap = {};
    (depts??[]).forEach(d=>{ deptMap[d.deptcode]={ name:d.deptname, count:0 }; });
    const latestJH = {};
    (jh??[]).sort((a,b)=>b.effdate?.localeCompare(a.effdate)).forEach(j=>{
      if (!latestJH[j.empno]) latestJH[j.empno]=j;
    });
    Object.values(latestJH).forEach(j=>{ if(deptMap[j.deptcode]) deptMap[j.deptcode].count++; });
    setHeadcount(Object.entries(deptMap).map(([code,v])=>({code,name:v.name,count:v.count})).filter(d=>d.count>0).sort((a,b)=>b.count-a.count));

    const jobSalary = {};
    (jh??[]).forEach(j=>{
      if (!jobSalary[j.jobcode]) jobSalary[j.jobcode]={ salaries:[], jobdesc:"" };
      jobSalary[j.jobcode].salaries.push(Number(j.salary));
    });
    (jobs??[]).forEach(j=>{ if(jobSalary[j.jobcode]) jobSalary[j.jobcode].jobdesc=j.jobdesc; });
    setSalary(Object.entries(jobSalary).map(([code,v])=>({
      code, jobdesc:v.jobdesc||code,
      min:Math.min(...v.salaries), max:Math.max(...v.salaries),
      avg:Math.round(v.salaries.reduce((a,b)=>a+b,0)/v.salaries.length)
    })).sort((a,b)=>b.avg-a.avg));
  }

  const maxCount = Math.max(...headcount.map(d=>d.count), 1);

  return (
    <div>
      <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18"}}>Reports</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
        {[{label:"Active Employees",value:stats.active},{label:"Total Employees",value:stats.total},{label:"Departments",value:stats.depts}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e8e4dd",borderRadius:12,padding:"18px 20px"}}>
            <div style={{fontSize:12,color:"#999",marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:28,fontWeight:600,color:"#1a1a18",fontFamily:"Cormorant Garamond,serif"}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="cc">
          <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:600}}>Headcount by Department</h3>
          {headcount.map(d=>(
            <div key={d.code} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:"#999",width:32}}>{d.code}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,marginBottom:3}}>{d.name}</div>
                <div style={{height:6,borderRadius:99,background:"#f0ede8",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:99,background:"#1a1a18",width:`${(d.count/maxCount)*100}%`}}/>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:500,minWidth:20,textAlign:"right"}}>{d.count}</div>
            </div>
          ))}
          {headcount.length===0&&<p style={{color:"#bbb",textAlign:"center"}}>No data.</p>}
        </div>
        <div className="cc">
          <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:600}}>Salary Summary by Job</h3>
          <table className="tbl" style={{fontSize:12}}>
            <thead><tr><th>Job</th><th>Min</th><th>Avg</th><th>Max</th></tr></thead>
            <tbody>
              {salary.slice(0,10).map(j=>(
                <tr key={j.code}>
                  <td><strong>{j.jobdesc}</strong></td>
                  <td>₱{j.min.toLocaleString()}</td>
                  <td style={{fontWeight:500}}>₱{j.avg.toLocaleString()}</td>
                  <td>₱{j.max.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Deleted Items ────────────────────────────────────────────────────────────
function DeletedPage() {
  const { supabase } = useApp();
  const [tab, setTab] = useState("employees");
  const [data, setData] = useState({ employees:[], jobhistory:[], jobs:[], departments:[] });

  useEffect(()=>{ fetchAll(); },[]);

  async function fetchAll() {
    const [{ data: e },{ data: jh },{ data: j },{ data: d }] = await Promise.all([
      supabase.from("employee").select("*").eq("record_status","INACTIVE"),
      supabase.from("jobhistory").select("*").eq("record_status","INACTIVE"),
      supabase.from("job").select("*").eq("record_status","INACTIVE"),
      supabase.from("department").select("*").eq("record_status","INACTIVE"),
    ]);
    setData({ employees:e??[], jobhistory:jh??[], jobs:j??[], departments:d??[] });
  }

  async function recover(table, filters) {
    let q = supabase.from(table).update({ record_status:"ACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|RECOVER` });
    Object.entries(filters).forEach(([k,v])=>{ q=q.eq(k,v); });
    await q;
    if (table==="employee") {
      await supabase.from("jobhistory").update({ record_status:"ACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|CASCADE-RECOVER` }).eq("empno", filters.empno);
    }
    await fetchAll();
  }

  const TABS = ["employees","jobhistory","jobs","departments"];

  return (
    <div>
      <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18"}}>Deleted Items</h2>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${tab===t?"#1a1a18":"#ddd"}`,background:tab===t?"#1a1a18":"#fff",color:tab===t?"#fff":"#555",fontSize:13,cursor:"pointer"}}>
            {t==="jobhistory"?"Job History":t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <div className="cc">
        {tab==="employees"&&(<table className="tbl"><thead><tr><th>Emp #</th><th>Name</th><th>Stamp</th><th></th></tr></thead><tbody>
          {data.employees.map(e=><tr key={e.empno}><td style={{fontFamily:"monospace",fontSize:12}}>{e.empno}</td><td>{e.firstname} {e.lastname}</td><td style={{fontSize:10,color:"#bbb"}}>{e.stamp}</td><td><button className="ab recover" onClick={()=>recover("employee",{empno:e.empno})}>Recover</button></td></tr>)}
          {data.employees.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No deleted employees.</td></tr>}
        </tbody></table>)}
        {tab==="jobhistory"&&(<table className="tbl"><thead><tr><th>Emp #</th><th>Job</th><th>Eff. Date</th><th>Stamp</th><th></th></tr></thead><tbody>
          {data.jobhistory.map((j,i)=><tr key={i}><td style={{fontFamily:"monospace",fontSize:12}}>{j.empno}</td><td>{j.jobcode}</td><td style={{fontSize:12}}>{j.effdate}</td><td style={{fontSize:10,color:"#bbb"}}>{j.stamp}</td><td><button className="ab recover" onClick={()=>recover("jobhistory",{empno:j.empno,jobcode:j.jobcode,effdate:j.effdate})}>Recover</button></td></tr>)}
          {data.jobhistory.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No deleted job history.</td></tr>}
        </tbody></table>)}
        {tab==="jobs"&&(<table className="tbl"><thead><tr><th>Code</th><th>Description</th><th>Stamp</th><th></th></tr></thead><tbody>
          {data.jobs.map(j=><tr key={j.jobcode}><td style={{fontFamily:"monospace"}}>{j.jobcode}</td><td>{j.jobdesc}</td><td style={{fontSize:10,color:"#bbb"}}>{j.stamp}</td><td><button className="ab recover" onClick={()=>recover("job",{jobcode:j.jobcode})}>Recover</button></td></tr>)}
          {data.jobs.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No deleted jobs.</td></tr>}
        </tbody></table>)}
        {tab==="departments"&&(<table className="tbl"><thead><tr><th>Code</th><th>Name</th><th>Stamp</th><th></th></tr></thead><tbody>
          {data.departments.map(d=><tr key={d.deptcode}><td style={{fontFamily:"monospace"}}>{d.deptcode}</td><td>{d.deptname}</td><td style={{fontSize:10,color:"#bbb"}}>{d.stamp}</td><td><button className="ab recover" onClick={()=>recover("department",{deptcode:d.deptcode})}>Recover</button></td></tr>)}
          {data.departments.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#bbb",padding:"32px 0"}}>No deleted departments.</td></tr>}
        </tbody></table>)}
      </div>
    </div>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
function AdminPage() {
  const { supabase, currentUser } = useApp();
  const [users, setUsers] = useState([]);

  useEffect(()=>{ supabase.from("user").select("*").then(({data})=>setUsers(data??[])); },[]);

  async function activate(u) {
    await supabase.from("user").update({ record_status:"ACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|ACTIVATED|${currentUser.user_type}` }).eq("userId",u.userId);
    const {data}=await supabase.from("user").select("*"); setUsers(data??[]);
  }
  async function deactivate(u) {
    await supabase.from("user").update({ record_status:"INACTIVE", stamp:`${new Date().toISOString().slice(0,10)}|DEACTIVATED|${currentUser.user_type}` }).eq("userId",u.userId);
    const {data}=await supabase.from("user").select("*"); setUsers(data??[]);
  }

  return (
    <div>
      <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:26,fontWeight:600,margin:"0 0 20px",color:"#1a1a18"}}>User Management</h2>
      <div className="cc">
        <table className="tbl">
          <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Stamp</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u=>{
              const isSup = u.user_type==="SUPERADMIN";
              return (
                <tr key={u.userId}>
                  <td><div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div className="av" style={{background:isSup?"#534AB7":u.user_type==="ADMIN"?"#0F6E56":"#185FA5",fontSize:11}}>{(u.username??"??").slice(0,2).toUpperCase()}</div>
                    <strong style={{fontSize:13}}>{u.username}</strong>
                  </div></td>
                  <td style={{fontSize:12,color:"#666"}}>{u.email}</td>
                  <td><RoleBadge type={u.user_type}/></td>
                  <td><Badge status={u.record_status}/></td>
                  <td style={{fontSize:10,color:"#bbb",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.stamp}</td>
                  <td>{isSup?<span style={{fontSize:12,color:"#bbb",fontStyle:"italic"}}>Protected</span>:(
                    <div style={{display:"flex",gap:6}}>
                      {u.record_status==="INACTIVE"&&<button className="ab recover" onClick={()=>activate(u)}>Activate</button>}
                      {u.record_status==="ACTIVE"&&<button className="ab danger" onClick={()=>deactivate(u)}>Deactivate</button>}
                    </div>
                  )}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function InnerApp() {
  const { currentUser, loading } = useApp();
  const [page, setPage] = useState("employees");

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f4f0",fontFamily:"DM Sans,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid #e0ddd8",borderTop:"3px solid #1a1a18",borderRadius:"50%",margin:"0 auto 12px",animation:"spin 0.8s linear infinite"}}/>
        <p style={{color:"#888",fontSize:13}}>Loading…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!currentUser) return <LoginPage />;

  const pages = { employees:<EmployeesPage/>, jobhistory:<JobHistoryPage/>, jobs:<JobsPage/>, departments:<DepartmentsPage/>, reports:<ReportsPage/>, deleted:<DeletedPage/>, admin:<AdminPage/> };

  return <Shell page={page} setPage={setPage}>{pages[page]??<EmployeesPage/>}</Shell>;
}

export default function App() {
  return <AppProvider><InnerApp/></AppProvider>;
}
