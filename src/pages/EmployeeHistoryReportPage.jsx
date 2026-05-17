import { useState, useEffect } from "react";
import { getEmployees } from "../services/employeeService";
import { getJobs } from "../services/jobService";
import { getDepts } from "../services/departmentService";
import { getEmployeeFullHistory } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
  });
}
function formatSalary(val) {
  if (val == null) return "—";
  return Number(val).toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

const S = {
  section: {
    background: "#fff", border: "1px solid #e0deda",
    borderRadius: 12, padding: "20px 24px",
  },
  title: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 12, color: "#888", marginBottom: 16 },
  selectRow: { display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  select: {
    padding: "8px 12px", borderRadius: 6, border: "1px solid #d0cec8",
    fontSize: 13, background: "#fff", minWidth: 260,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "8px 12px", background: "#f5f4f0",
    borderBottom: "2px solid #d0cec8", fontWeight: 600,
  },
  thRight: {
    textAlign: "right", padding: "8px 12px", background: "#f5f4f0",
    borderBottom: "2px solid #d0cec8", fontWeight: 600,
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #ebebeb" },
  tdRight: { padding: "8px 12px", borderBottom: "1px solid #ebebeb", textAlign: "right" },
  badge: (status) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
    background: status === "ACTIVE" ? "#d4f7dc" : "#fde8e8",
    color: status === "ACTIVE" ? "#1a7a36" : "#a02020",
  }),
  error: { color: "#a02020", fontSize: 13 },
  empty: { textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 },
  prompt: { textAlign: "center", color: "#aaa", padding: "28px 0", fontSize: 13 },
  empCard: {
    display: "flex", gap: 24, flexWrap: "wrap",
    padding: "12px 0 20px", borderBottom: "1px solid #ebebeb", marginBottom: 16,
  },
  empField: {},
  empLabel: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 2 },
  empVal: { fontSize: 13, color: "#1a1a18" },
};

export default function EmployeeHistoryReportPage() {
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type;

  const [employees, setEmployees] = useState([]);
  const [jobMap, setJobMap] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const [selectedEmp, setSelectedEmp] = useState("");
  const [history, setHistory] = useState([]);
  const [empDetail, setEmpDetail] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [histErr, setHistErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getEmployees(userType),
      getJobs(userType),
      getDepts(userType),
    ]).then(([empRes, jobRes, deptRes]) => {
      if (empRes.error) { setLoadErr(empRes.error.message); return; }
      setEmployees(empRes.data ?? []);

      const jMap = {};
      (jobRes.data ?? []).forEach((j) => { jMap[j.jobCode] = j.jobDesc; });
      setJobMap(jMap);

      const dMap = {};
      (deptRes.data ?? []).forEach((d) => { dMap[d.deptCode] = d.deptName; });
      setDeptMap(dMap);
    });
  }, []);

  const handleSelect = async (empno) => {
    setSelectedEmp(empno);
    setHistory([]);
    setHistErr("");
    if (!empno) { setEmpDetail(null); return; }

    const found = employees.find((e) => e.empno === empno);
    setEmpDetail(found ?? null);

    setLoading(true);
    const { data, error } = await getEmployeeFullHistory(empno);
    setLoading(false);
    if (error) setHistErr(error.message);
    else setHistory(data ?? []);
  };

  return (
    <div style={S.section}>
      <div style={S.title}>Employee Job History Report</div>
      <div style={S.sub}>Select an employee to view their complete job history chronologically</div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <div style={S.selectRow}>
        <select
          style={S.select}
          value={selectedEmp}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">— Select an employee —</option>
          {employees.map((e) => (
            <option key={e.empno} value={e.empno}>
              {e.empno} — {e.firstname} {e.lastname}
            </option>
          ))}
        </select>
        {selectedEmp && (
          <span style={{ fontSize: 12, color: "#888" }}>
            {history.length} record{history.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Employee summary card */}
      {empDetail && (
        <div style={S.empCard}>
          <div style={S.empField}>
            <div style={S.empLabel}>Employee No.</div>
            <div style={S.empVal}>{empDetail.empno}</div>
          </div>
          <div style={S.empField}>
            <div style={S.empLabel}>Name</div>
            <div style={S.empVal}>{empDetail.firstname} {empDetail.lastname}</div>
          </div>
          <div style={S.empField}>
            <div style={S.empLabel}>Gender</div>
            <div style={S.empVal}>{empDetail.gender ?? "—"}</div>
          </div>
          <div style={S.empField}>
            <div style={S.empLabel}>Hire Date</div>
            <div style={S.empVal}>{formatDate(empDetail.hiredate)}</div>
          </div>
          <div style={S.empField}>
            <div style={S.empLabel}>Status</div>
            <div>
              <span style={S.badge(empDetail.record_status)}>{empDetail.record_status}</span>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      {histErr && <p style={S.error}>{histErr}</p>}

      {!selectedEmp && (
        <div style={S.prompt}>Select an employee above to view their job history.</div>
      )}

      {selectedEmp && !loading && (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Eff. Date</th>
              <th style={S.th}>Job</th>
              <th style={S.th}>Department</th>
              <th style={S.thRight}>Salary</th>
              <th style={S.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={`${r.empNo}-${r.jobCode}-${r.effDate}-${i}`}>
                <td style={S.td}>{formatDate(r.effDate)}</td>
                <td style={S.td}>{jobMap[r.jobCode] ?? r.jobCode}</td>
                <td style={S.td}>{deptMap[r.deptCode] ?? r.deptCode}</td>
                <td style={S.tdRight}>{formatSalary(r.salary)}</td>
                <td style={S.td}>
                  <span style={S.badge(r.record_status)}>{r.record_status}</span>
                </td>
              </tr>
            ))}
            {history.length === 0 && !histErr && (
              <tr><td colSpan={5} style={S.empty}>No job history records found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {selectedEmp && loading && (
        <div style={S.prompt}>Loading history…</div>
      )}
    </div>
  );
}
