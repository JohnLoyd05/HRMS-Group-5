import { useState, useEffect } from "react";
import { getHeadcountByDept } from "../services/reportService";

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
  countBadge: {
    display: "inline-block", padding: "2px 10px", borderRadius: 12,
    background: "#e8f0fe", color: "#1a56db", fontSize: 12, fontWeight: 600,
  },
  barWrap: { display: "flex", alignItems: "center", gap: 10 },
  barTrack: { flex: 1, background: "#f0efeb", borderRadius: 4, height: 10, overflow: "hidden" },
  bar: (pct) => ({ width: `${pct}%`, background: "#1a56db", height: "100%", borderRadius: 4, transition: "width .3s" }),
  error: { color: "#a02020", fontSize: 13 },
  empty: { textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 },
  total: { fontSize: 12, color: "#888", marginTop: 10, textAlign: "right" },
};

export default function HeadcountByDeptPage() {
  const [rows, setRows] = useState([]);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    getHeadcountByDept().then(({ data, error }) => {
      if (error) setLoadErr(error.message);
      else setRows(data ?? []);
    });
  }, []);

  const max = Math.max(...rows.map((r) => r.activeheadcount ?? 0), 1);
  const total = rows.reduce((sum, r) => sum + (r.activeheadcount ?? 0), 0);

  return (
    <div style={S.section}>
      <div style={S.title}>Active Headcount by Department</div>
      <div style={S.sub}>Number of active employees per department</div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Dept Code</th>
            <th style={S.th}>Department Name</th>
            <th style={S.th}>Distribution</th>
            <th style={S.thRight}>Active Employees</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = max > 0 ? ((r.activeheadcount ?? 0) / max) * 100 : 0;
            return (
              <tr key={r.deptcode}>
                <td style={S.td}>{r.deptcode}</td>
                <td style={S.td}>{r.deptname}</td>
                <td style={S.td}>
                  <div style={S.barWrap}>
                    <div style={S.barTrack}>
                      <div style={S.bar(pct)} />
                    </div>
                  </div>
                </td>
                <td style={S.tdRight}>
                  <span style={S.countBadge}>{r.activeheadcount ?? 0}</span>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && !loadErr && (
            <tr><td colSpan={4} style={S.empty}>No data available.</td></tr>
          )}
        </tbody>
      </table>

      {rows.length > 0 && (
        <div style={S.total}>Total active employees: <strong>{total}</strong></div>
      )}
    </div>
  );
}
