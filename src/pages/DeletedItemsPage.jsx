import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getEmployees, recoverEmployee } from "../services/employeeService";
import { getJobs, recoverJob } from "../services/jobService";
import { getDepts, recoverDept } from "../services/departmentService";
import { getJobHistory, recoverJobHistory } from "../services/jobHistoryService";

const TABS = ["Employees", "Job History", "Jobs", "Departments"];

const S = {
  page: { padding: "24px 32px", fontFamily: "sans-serif", color: "#1a1a18" },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  tabRow: { display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e0deda" },
  tab: (active) => ({
    padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: "none", background: "none",
    color: active ? "#1a1a18" : "#888",
    borderBottom: active ? "2px solid #1a1a18" : "2px solid transparent",
    marginBottom: -2,
  }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "8px 12px", background: "#f5f4f0",
    borderBottom: "2px solid #d0cec8", fontWeight: 600,
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #ebebeb" },
  btnRecover: {
    padding: "4px 12px", background: "#d4f7dc", color: "#1a7a36",
    border: "1px solid #a3e6b0", borderRadius: 6, fontSize: 12, cursor: "pointer",
  },
  empty: { textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 },
  error: { color: "#a02020", fontSize: 13, marginBottom: 12 },
};

function Th({ children }) { return <th style={S.th}>{children}</th>; }
function Td({ children }) { return <td style={S.td}>{children}</td>; }

// --- Employees tab ---
function DeletedEmployees({ userId }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getEmployees("SUPERADMIN");
    if (error) { setErr(error.message); setLoading(false); return; }
    setRows((data ?? []).filter((r) => r.record_status === "INACTIVE"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRecover = async (empno) => {
    setRecovering(empno);
    const { error } = await recoverEmployee(empno, userId);
    setRecovering(null);
    if (error) { setErr(error.message); return; }
    load();
  };

  return (
    <>
      {err && <p style={S.error}>{err}</p>}
      <table style={S.table}>
        <thead>
          <tr>
            <Th>Emp No</Th>
            <Th>Last Name</Th>
            <Th>First Name</Th>
            <Th>Gender</Th>
            <Th>Hire Date</Th>
            <Th>Stamp</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.empno}>
              <Td>{r.empno}</Td>
              <Td>{r.lastname}</Td>
              <Td>{r.firstname}</Td>
              <Td>{r.gender}</Td>
              <Td>{r.hiredate}</Td>
              <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{r.stamp}</td>
              <Td>
                <button
                  style={S.btnRecover}
                  disabled={recovering === r.empno}
                  onClick={() => handleRecover(r.empno)}
                >
                  {recovering === r.empno ? "Recovering…" : "Recover"}
                </button>
              </Td>
            </tr>
          ))}
          {loading && (
            <tr><td colSpan={7} style={S.empty}>Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && !err && (
            <tr><td colSpan={7} style={S.empty}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

// --- Job History tab ---
function DeletedJobHistory({ userId }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data: emps, error: empErr } = await getEmployees("SUPERADMIN");
    if (empErr) { setErr(empErr.message); setLoading(false); return; }

    const results = await Promise.all(
      (emps ?? []).map((e) => getJobHistory(e.empno, "SUPERADMIN"))
    );

    const all = results.flatMap((r) => r.data ?? []);
    setRows(all.filter((r) => r.record_status === "INACTIVE"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRecover = async (row) => {
    const key = `${row.empno}-${row.jobcode}-${row.effdate}`;
    setRecovering(key);
    const { error } = await recoverJobHistory(row.empno, row.jobcode, row.effdate, userId);
    setRecovering(null);
    if (error) { setErr(error.message); return; }
    load();
  };

  return (
    <>
      {err && <p style={S.error}>{err}</p>}
      <table style={S.table}>
        <thead>
          <tr>
            <Th>Emp No</Th>
            <Th>Job Code</Th>
            <Th>Eff. Date</Th>
            <Th>Dept Code</Th>
            <Th>Salary</Th>
            <Th>Stamp</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const key = `${r.empno}-${r.jobcode}-${r.effdate}`;
            return (
              <tr key={key}>
                <Td>{r.empno}</Td>
                <Td>{r.jobcode}</Td>
                <Td>{r.effdate}</Td>
                <Td>{r.deptcode}</Td>
                <Td>{r.salary}</Td>
                <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{r.stamp}</td>
                <Td>
                  <button
                    style={S.btnRecover}
                    disabled={recovering === key}
                    onClick={() => handleRecover(r)}
                  >
                    {recovering === key ? "Recovering…" : "Recover"}
                  </button>
                </Td>
              </tr>
            );
          })}
          {loading && (
            <tr><td colSpan={7} style={S.empty}>Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && !err && (
            <tr><td colSpan={7} style={S.empty}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

// --- Jobs tab ---
function DeletedJobs({ userId }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getJobs("SUPERADMIN");
    if (error) { setErr(error.message); setLoading(false); return; }
    setRows((data ?? []).filter((r) => r.record_status === "INACTIVE"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRecover = async (jobcode) => {
    setRecovering(jobcode);
    const { error } = await recoverJob(jobcode, userId);
    setRecovering(null);
    if (error) { setErr(error.message); return; }
    load();
  };

  return (
    <>
      {err && <p style={S.error}>{err}</p>}
      <table style={S.table}>
        <thead>
          <tr>
            <Th>Job Code</Th>
            <Th>Description</Th>
            <Th>Stamp</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.jobcode}>
              <Td>{r.jobcode}</Td>
              <Td>{r.jobdesc}</Td>
              <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{r.stamp}</td>
              <Td>
                <button
                  style={S.btnRecover}
                  disabled={recovering === r.jobcode}
                  onClick={() => handleRecover(r.jobcode)}
                >
                  {recovering === r.jobcode ? "Recovering…" : "Recover"}
                </button>
              </Td>
            </tr>
          ))}
          {loading && (
            <tr><td colSpan={4} style={S.empty}>Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && !err && (
            <tr><td colSpan={4} style={S.empty}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

// --- Departments tab ---
function DeletedDepts({ userId }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getDepts("SUPERADMIN");
    if (error) { setErr(error.message); setLoading(false); return; }
    setRows((data ?? []).filter((r) => r.record_status === "INACTIVE"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRecover = async (deptcode) => {
    setRecovering(deptcode);
    const { error } = await recoverDept(deptcode, userId);
    setRecovering(null);
    if (error) { setErr(error.message); return; }
    load();
  };

  return (
    <>
      {err && <p style={S.error}>{err}</p>}
      <table style={S.table}>
        <thead>
          <tr>
            <Th>Dept Code</Th>
            <Th>Name</Th>
            <Th>Stamp</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.deptcode}>
              <Td>{r.deptcode}</Td>
              <Td>{r.deptname}</Td>
              <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{r.stamp}</td>
              <Td>
                <button
                  style={S.btnRecover}
                  disabled={recovering === r.deptcode}
                  onClick={() => handleRecover(r.deptcode)}
                >
                  {recovering === r.deptcode ? "Recovering…" : "Recover"}
                </button>
              </Td>
            </tr>
          ))}
          {loading && (
            <tr><td colSpan={4} style={S.empty}>Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && !err && (
            <tr><td colSpan={4} style={S.empty}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

// --- Main page ---
export default function DeletedItemsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Deleted Items</h1>

      <div style={S.tabRow}>
        {TABS.map((tab, i) => (
          <button key={tab} style={S.tab(activeTab === i)} onClick={() => setActiveTab(i)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <DeletedEmployees userId={currentUser?.id} />}
      {activeTab === 1 && <DeletedJobHistory userId={currentUser?.id} />}
      {activeTab === 2 && <DeletedJobs userId={currentUser?.id} />}
      {activeTab === 3 && <DeletedDepts userId={currentUser?.id} />}
    </div>
  );
}
