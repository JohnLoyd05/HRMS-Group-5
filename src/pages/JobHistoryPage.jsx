import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getJobHistory } from "../services/jobHistoryService";
import { getJobs } from "../services/jobService";
import { getDepts } from "../services/departmentService";
import { getEmployees } from "../services/employeeService";

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
  page: { padding: "24px 32px", fontFamily: "sans-serif", color: "#1a1a18" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  h1: { fontSize: 22, fontWeight: 700, margin: 0 },
  filterRow: { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  input: {
    padding: "7px 10px", borderRadius: 6, border: "1px solid #d0cec8",
    fontSize: 13, minWidth: 220,
  },
  select: {
    padding: "7px 10px", borderRadius: 6, border: "1px solid #d0cec8",
    fontSize: 13, background: "#fff", minWidth: 160,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "8px 12px", background: "#f5f4f0",
    borderBottom: "2px solid #d0cec8", fontWeight: 600,
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #ebebeb" },
  badge: (status) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
    background: status === "ACTIVE" ? "#d4f7dc" : "#fde8e8",
    color: status === "ACTIVE" ? "#1a7a36" : "#a02020",
  }),
  error: { color: "#a02020", fontSize: 13, marginTop: 10 },
  empty: { textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 },
  meta: { fontSize: 12, color: "#888", marginBottom: 8 },
};

function Th({ children }) { return <th style={S.th}>{children}</th>; }
function Td({ children, style }) { return <td style={{ ...S.td, ...style }}>{children}</td>; }

export default function JobHistoryPage() {
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type;
  const showStamp = userType === "ADMIN" || userType === "SUPERADMIN";

  const [rows, setRows] = useState([]);
  const [empMap, setEmpMap] = useState({});
  const [jobMap, setJobMap] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const [jobs, setJobs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loadErr, setLoadErr] = useState("");

  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    (async () => {
      const [empRes, jobRes, deptRes, jhRes] = await Promise.all([
        getEmployees(userType),
        getJobs(userType),
        getDepts(userType),
        getJobHistory(null, userType),
      ]);

      const jobList = jobRes.data ?? [];
      const deptList = deptRes.data ?? [];

      setJobs(jobList);
      setDepts(deptList);

      const eMap = {};
      (empRes.data ?? []).forEach((e) => {
        eMap[e.empno] = `${e.firstname} ${e.lastname}`;
      });
      setEmpMap(eMap);

      const jMap = {};
      jobList.forEach((j) => { jMap[j.jobCode] = j.jobDesc; });
      setJobMap(jMap);

      const dMap = {};
      deptList.forEach((d) => { dMap[d.deptCode] = d.deptName; });
      setDeptMap(dMap);

      if (jhRes.error) setLoadErr(jhRes.error.message);
      else setRows(jhRes.data ?? []);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    const name = (empMap[r.empNo] ?? r.empNo).toLowerCase();
    const matchSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      r.empNo.includes(search);
    const matchJob = !filterJob || r.jobCode === filterJob;
    const matchDept = !filterDept || r.deptCode === filterDept;
    const matchStatus = !filterStatus || r.record_status === filterStatus;
    return matchSearch && matchJob && matchDept && matchStatus;
  });

  const colCount = 7 + (showStamp ? 1 : 0);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>Job History</h1>
      </div>

      <div style={S.filterRow}>
        <input
          style={S.input}
          placeholder="Search employee name or no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={S.select} value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
          <option value="">All Jobs</option>
          {jobs.map((j) => (
            <option key={j.jobCode} value={j.jobCode}>{j.jobCode} — {j.jobDesc}</option>
          ))}
        </select>
        <select style={S.select} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {depts.map((d) => (
            <option key={d.deptCode} value={d.deptCode}>{d.deptCode} — {d.deptName}</option>
          ))}
        </select>
        <select style={S.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <span style={S.meta}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <table style={S.table}>
        <thead>
          <tr>
            <Th>Emp No</Th>
            <Th>Employee Name</Th>
            <Th>Job</Th>
            <Th>Department</Th>
            <Th>Eff. Date</Th>
            <Th>Salary</Th>
            <Th>Status</Th>
            {showStamp && <Th>Stamp</Th>}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={`${r.empNo}-${r.jobCode}-${r.effDate}-${i}`}>
              <Td>{r.empNo}</Td>
              <Td>{empMap[r.empNo] ?? r.empNo}</Td>
              <Td>{jobMap[r.jobCode] ?? r.jobCode}</Td>
              <Td>{deptMap[r.deptCode] ?? r.deptCode}</Td>
              <Td>{formatDate(r.effDate)}</Td>
              <Td>{formatSalary(r.salary)}</Td>
              <Td>
                <span style={S.badge(r.record_status)}>{r.record_status}</span>
              </Td>
              {showStamp && (
                <Td style={{ fontSize: 11, color: "#888" }}>{r.stamp}</Td>
              )}
            </tr>
          ))}
          {filtered.length === 0 && !loadErr && (
            <tr>
              <td colSpan={colCount} style={S.empty}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
