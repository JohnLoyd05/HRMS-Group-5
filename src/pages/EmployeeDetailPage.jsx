import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEmployees } from "../services/employeeService";
import {
  getJobHistory,
  addJobHistory,
  updateJobHistory,
  softDeleteJobHistory,
} from "../services/jobHistoryService";
import { getJobs } from "../services/jobService";
import { getDepts } from "../services/departmentService";

// --- Rights helpers ---
const canAdd = (t) => t === "ADMIN" || t === "SUPERADMIN";
const canEdit = (t) => t === "ADMIN" || t === "SUPERADMIN";
const canDelete = (t) => t === "SUPERADMIN";
const canSeeStamp = (t) => t === "ADMIN" || t === "SUPERADMIN";

// --- Formatters ---
function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}
function formatSalary(val) {
  if (val == null) return "—";
  return Number(val).toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

// --- Shared styles ---
const S = {
  page: { padding: "24px 32px", fontFamily: "sans-serif", color: "#1a1a18", maxWidth: 900 },
  backBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#555", fontSize: 13, padding: "0 0 16px", display: "flex", alignItems: "center", gap: 4,
  },
  card: {
    background: "#fff", border: "1px solid #e0deda", borderRadius: 12,
    padding: "20px 24px", marginBottom: 24,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#1a1a18" },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 2 },
  fieldVal: { fontSize: 13, color: "#1a1a18" },
  badge: (status) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
    background: status === "ACTIVE" ? "#d4f7dc" : "#fde8e8",
    color: status === "ACTIVE" ? "#1a7a36" : "#a02020",
  }),
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: 700, margin: 0 },
  btnPrimary: {
    padding: "7px 16px", background: "#1a1a18", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "8px 12px", background: "#f5f4f0",
    borderBottom: "2px solid #d0cec8", fontWeight: 600,
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #ebebeb" },
  btnSmEdit: {
    padding: "4px 10px", background: "#e8f0fe", color: "#1a56db",
    border: "1px solid #c3d4fa", borderRadius: 6, fontSize: 12,
    cursor: "pointer", marginRight: 6,
  },
  btnSmDel: {
    padding: "4px 10px", background: "#fde8e8", color: "#a02020",
    border: "1px solid #f5c6c6", borderRadius: 6, fontSize: 12, cursor: "pointer",
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modal: {
    background: "#fff", borderRadius: 12, padding: 28, minWidth: 380,
    maxWidth: 460, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  modalTitle: { fontSize: 17, fontWeight: 700, marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 14 },
  input: {
    width: "100%", padding: "8px 10px", borderRadius: 6,
    border: "1px solid #d0cec8", fontSize: 13, boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "8px 10px", borderRadius: 6,
    border: "1px solid #d0cec8", fontSize: 13, boxSizing: "border-box", background: "#fff",
  },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 },
  btnCancel: {
    padding: "8px 18px", background: "#f5f4f0", color: "#1a1a18",
    border: "1px solid #d0cec8", borderRadius: 8, fontSize: 13, cursor: "pointer",
  },
  btnConfirm: {
    padding: "8px 18px", background: "#1a1a18", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 18px", background: "#a02020", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer",
  },
  error: { color: "#a02020", fontSize: 12, marginTop: 10 },
  empty: { textAlign: "center", color: "#888", padding: "16px 0", fontSize: 13 },
};

function Th({ children }) { return <th style={S.th}>{children}</th>; }
function Td({ children, style }) { return <td style={{ ...S.td, ...style }}>{children}</td>; }

function Modal({ title, onClose, children }) {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <div style={S.fieldLabel}>{label}</div>
      <div style={S.fieldVal}>{value || "—"}</div>
    </div>
  );
}

// --- Add Job History Form ---
function AddJobHistoryForm({ empNo, jobs, depts, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ jobCode: "", effDate: "", salary: "", deptCode: "" });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = () => {
    if (!form.jobCode || !form.effDate || !form.salary || !form.deptCode) {
      setErr("All fields are required.");
      return;
    }
    setErr("");
    onSave({ empNo, ...form, salary: Number(form.salary) });
  };

  const activeJobs = jobs.filter((j) => j.record_status === "ACTIVE");
  const activeDepts = depts.filter((d) => d.record_status === "ACTIVE");

  return (
    <>
      <label style={S.label}>Job *</label>
      <select style={S.select} value={form.jobCode} onChange={set("jobCode")}>
        <option value="">— select job —</option>
        {activeJobs.map((j) => (
          <option key={j.jobCode} value={j.jobCode}>{j.jobCode} — {j.jobDesc}</option>
        ))}
      </select>

      <label style={S.label}>Department *</label>
      <select style={S.select} value={form.deptCode} onChange={set("deptCode")}>
        <option value="">— select department —</option>
        {activeDepts.map((d) => (
          <option key={d.deptCode} value={d.deptCode}>{d.deptCode} — {d.deptName}</option>
        ))}
      </select>

      <label style={S.label}>Effective Date *</label>
      <input style={S.input} type="date" value={form.effDate} onChange={set("effDate")} />

      <label style={S.label}>Salary *</label>
      <input style={S.input} type="number" min="0" placeholder="0.00" value={form.salary} onChange={set("salary")} />

      {err && <div style={S.error}>{err}</div>}

      <div style={S.modalFooter}>
        <button style={S.btnCancel} onClick={onCancel} disabled={saving}>Cancel</button>
        <button style={S.btnConfirm} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </>
  );
}

// --- Edit Job History Modal ---
function EditJobHistoryModal({ row, jobs, depts, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    jobCode: row.jobCode,
    deptCode: row.deptCode,
    effDate: row.effDate,
    salary: row.salary,
  });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = () => {
    if (!form.salary) { setErr("Salary is required."); return; }
    setErr("");
    onSave(row.empNo, row.jobCode, row.effDate, {
      jobCode: form.jobCode,
      deptCode: form.deptCode,
      salary: Number(form.salary),
    });
  };

  const activeJobs = jobs.filter((j) => j.record_status === "ACTIVE");
  const activeDepts = depts.filter((d) => d.record_status === "ACTIVE");

  return (
    <Modal title="Edit Job History" onClose={onCancel}>
      <label style={S.label}>Job</label>
      <select style={S.select} value={form.jobCode} onChange={set("jobCode")}>
        {activeJobs.map((j) => (
          <option key={j.jobCode} value={j.jobCode}>{j.jobCode} — {j.jobDesc}</option>
        ))}
      </select>

      <label style={S.label}>Department</label>
      <select style={S.select} value={form.deptCode} onChange={set("deptCode")}>
        {activeDepts.map((d) => (
          <option key={d.deptCode} value={d.deptCode}>{d.deptCode} — {d.deptName}</option>
        ))}
      </select>

      <label style={S.label}>Effective Date (read-only)</label>
      <input style={{ ...S.input, background: "#f5f4f0", color: "#888" }} value={form.effDate} readOnly />

      <label style={S.label}>Salary</label>
      <input style={S.input} type="number" min="0" value={form.salary} onChange={set("salary")} />

      {err && <div style={S.error}>{err}</div>}

      <div style={S.modalFooter}>
        <button style={S.btnCancel} onClick={onCancel} disabled={saving}>Cancel</button>
        <button style={S.btnConfirm} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

// --- Delete confirm ---
function JHDeleteConfirm({ row, jobMap, onConfirm, onCancel, saving }) {
  return (
    <Modal title="Deactivate Job History" onClose={onCancel}>
      <p style={{ fontSize: 14, margin: "0 0 8px" }}>
        Deactivate <strong>{jobMap[row.jobCode] ?? row.jobCode}</strong> effective{" "}
        <strong>{formatDate(row.effDate)}</strong>?
      </p>
      <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
        This can be recovered later from Deleted Items.
      </p>
      <div style={S.modalFooter}>
        <button style={S.btnCancel} onClick={onCancel} disabled={saving}>Cancel</button>
        <button style={S.btnDanger} onClick={onConfirm} disabled={saving}>
          {saving ? "Deactivating…" : "Deactivate"}
        </button>
      </div>
    </Modal>
  );
}

// --- Main page ---
export default function EmployeeDetailPage() {
  const { empno } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type;

  const [employee, setEmployee] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [jobMap, setJobMap] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const [loadErr, setLoadErr] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const load = async () => {
    const [empRes, jhRes, jobRes, deptRes] = await Promise.all([
      getEmployees(userType),
      getJobHistory(empno, userType),
      getJobs(userType),
      getDepts(userType),
    ]);

    if (empRes.error) { setLoadErr(empRes.error.message); return; }

    const found = (empRes.data ?? []).find((e) => String(e.empno) === String(empno));
    if (!found) { setLoadErr("Employee not found."); return; }

    setEmployee(found);
    setJobHistory(jhRes.data ?? []);
    setJobs(jobRes.data ?? []);
    setDepts(deptRes.data ?? []);

    const jMap = {};
    (jobRes.data ?? []).forEach((j) => { jMap[j.jobCode] = j.jobDesc; });
    setJobMap(jMap);

    const dMap = {};
    (deptRes.data ?? []).forEach((d) => { dMap[d.deptCode] = d.deptName; });
    setDeptMap(dMap);
  };

  useEffect(() => { load(); }, [empno]);

  const handleAdd = async (rowData) => {
    setSaving(true);
    setSaveErr("");
    const { error } = await addJobHistory(rowData, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setShowAdd(false);
    load();
  };

  const handleEdit = async (empNo, jobCode, effDate, updates) => {
    setSaving(true);
    setSaveErr("");
    const { error } = await updateJobHistory(empNo, jobCode, effDate, updates, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setEditRow(null);
    load();
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await softDeleteJobHistory(
      deleteRow.empNo, deleteRow.jobCode, deleteRow.effDate, currentUser.id
    );
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setDeleteRow(null);
    load();
  };

  if (loadErr) {
    return (
      <div style={S.page}>
        <button style={S.backBtn} onClick={() => navigate("/employees")}>← Back to Employees</button>
        <p style={S.error}>{loadErr}</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={S.page}>
        <button style={S.backBtn} onClick={() => navigate("/employees")}>← Back to Employees</button>
        <p style={{ color: "#888", fontSize: 13 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate("/employees")}>
        ← Back to Employees
      </button>

      {/* Employee profile card */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          {employee.firstname} {employee.lastname}{" "}
          <span style={S.badge(employee.record_status)}>{employee.record_status}</span>
        </div>
        <div style={S.fieldGrid}>
          <ProfileField label="Employee No." value={employee.empno} />
          <ProfileField label="Gender" value={employee.gender} />
          <ProfileField label="Birthdate" value={formatDate(employee.birthdate)} />
          <ProfileField label="Hire Date" value={formatDate(employee.hiredate)} />
          <ProfileField label="Separation Date" value={formatDate(employee.sepDate)} />
          {canSeeStamp(userType) && (
            <ProfileField label="Stamp" value={employee.stamp} />
          )}
        </div>
      </div>

      {/* Job History section */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Job History</h2>
          {canAdd(userType) && employee.record_status === "ACTIVE" && (
            <button style={S.btnPrimary} onClick={() => { setShowAdd(true); setSaveErr(""); }}>
              + Add Job History
            </button>
          )}
        </div>

        {saveErr && <p style={S.error}>{saveErr}</p>}

        <table style={S.table}>
          <thead>
            <tr>
              <Th>Eff. Date</Th>
              <Th>Job</Th>
              <Th>Department</Th>
              <Th>Salary</Th>
              <Th>Status</Th>
              {canSeeStamp(userType) && <Th>Stamp</Th>}
              {(canEdit(userType) || canDelete(userType)) && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {jobHistory.map((row) => (
              <tr key={`${row.empNo}-${row.jobCode}-${row.effDate}`}>
                <Td>{formatDate(row.effDate)}</Td>
                <Td>{jobMap[row.jobCode] ?? row.jobCode}</Td>
                <Td>{deptMap[row.deptCode] ?? row.deptCode}</Td>
                <Td>{formatSalary(row.salary)}</Td>
                <Td>
                  <span style={S.badge(row.record_status)}>{row.record_status}</span>
                </Td>
                {canSeeStamp(userType) && (
                  <Td style={{ fontSize: 11, color: "#888" }}>{row.stamp}</Td>
                )}
                {(canEdit(userType) || canDelete(userType)) && (
                  <Td>
                    {canEdit(userType) && row.record_status === "ACTIVE" && (
                      <button style={S.btnSmEdit} onClick={() => { setEditRow(row); setSaveErr(""); }}>
                        Edit
                      </button>
                    )}
                    {canDelete(userType) && row.record_status === "ACTIVE" && (
                      <button style={S.btnSmDel} onClick={() => setDeleteRow(row)}>
                        Deactivate
                      </button>
                    )}
                  </Td>
                )}
              </tr>
            ))}
            {jobHistory.length === 0 && (
              <tr>
                <td
                  colSpan={canSeeStamp(userType) ? (canEdit(userType) || canDelete(userType) ? 7 : 6) : (canEdit(userType) || canDelete(userType) ? 6 : 5)}
                  style={S.empty}
                >
                  No job history records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Job History modal */}
      {showAdd && (
        <Modal title="Add Job History" onClose={() => setShowAdd(false)}>
          <AddJobHistoryForm
            empNo={empno}
            jobs={jobs}
            depts={depts}
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
            saving={saving}
          />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {/* Edit modal */}
      {editRow && (
        <EditJobHistoryModal
          row={editRow}
          jobs={jobs}
          depts={depts}
          onSave={handleEdit}
          onCancel={() => setEditRow(null)}
          saving={saving}
        />
      )}

      {/* Delete confirm */}
      {deleteRow && (
        <JHDeleteConfirm
          row={deleteRow}
          jobMap={jobMap}
          onConfirm={handleDelete}
          onCancel={() => setDeleteRow(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
