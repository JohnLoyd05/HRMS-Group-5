import { useState } from "react";
import HeadcountByDeptPage from "./HeadcountByDeptPage";
import SalaryReportPage from "./SalaryReportPage";
import EmployeeHistoryReportPage from "./EmployeeHistoryReportPage";

const TABS = [
  { id: "headcount", label: "Headcount by Dept" },
  { id: "salary",    label: "Salary Summary" },
  { id: "history",   label: "Employee History" },
];

const S = {
  page: { padding: "24px 32px", fontFamily: "sans-serif", color: "#1a1a18" },
  h1: { fontSize: 22, fontWeight: 700, margin: "0 0 20px" },
  tabRow: {
    display: "flex", gap: 4, marginBottom: 20,
    borderBottom: "2px solid #e0deda", paddingBottom: 0,
  },
  tab: (active) => ({
    padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: "none", border: "none", color: active ? "#1a1a18" : "#888",
    borderBottom: active ? "2px solid #1a1a18" : "2px solid transparent",
    marginBottom: "-2px", transition: "color .15s",
  }),
};

export default function ReportsPage() {
  const [tab, setTab] = useState("headcount");

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Reports</h1>

      <div style={S.tabRow}>
        {TABS.map((t) => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "headcount" && <HeadcountByDeptPage />}
      {tab === "salary"    && <SalaryReportPage />}
      {tab === "history"   && <EmployeeHistoryReportPage />}
    </div>
  );
}
