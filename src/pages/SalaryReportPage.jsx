import { useState, useEffect } from "react";
import { getSalarySummaryByJob } from "../services/reportService";

function fmt(val) {
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
  avgBadge: {
    display: "inline-block", padding: "2px 8px", borderRadius: 12,
    background: "#d4f7dc", color: "#1a7a36", fontSize: 12, fontWeight: 600,
  },
  countBadge: {
    display: "inline-block", padding: "2px 8px", borderRadius: 12,
    background: "#f5f4f0", color: "#555", fontSize: 12, fontWeight: 600,
  },
  error: { color: "#a02020", fontSize: 13 },
  empty: { textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 },
};

export default function SalaryReportPage() {
  const [rows, setRows] = useState([]);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    getSalarySummaryByJob().then(({ data, error }) => {
      if (error) setLoadErr(error.message);
      else setRows(data ?? []);
    });
  }, []);

  return (
    <div style={S.section}>
      <div style={S.title}>Salary Summary by Job</div>
      <div style={S.sub}>Min / max / average salary per job code</div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Job Code</th>
            <th style={S.th}>Job Description</th>
            <th style={S.thRight}>Assignments</th>
            <th style={S.thRight}>Min Salary</th>
            <th style={S.thRight}>Max Salary</th>
            <th style={S.thRight}>Avg Salary</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.jobcode}>
              <td style={S.td}>{r.jobcode}</td>
              <td style={S.td}>{r.jobdesc}</td>
              <td style={S.tdRight}>
                <span style={S.countBadge}>{r.assignments}</span>
              </td>
              <td style={S.tdRight}>{fmt(r.minsalary)}</td>
              <td style={S.tdRight}>{fmt(r.maxsalary)}</td>
              <td style={S.tdRight}>
                <span style={S.avgBadge}>{fmt(r.avgsalary)}</span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !loadErr && (
            <tr><td colSpan={6} style={S.empty}>No data available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
