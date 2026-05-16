import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  softDeleteEmployee,
} from "../services/employeeService";

// ── helpers ──────────────────────────────────────────────────────────────────

function canAdd(userType)    { return userType === "SUPERADMIN" || userType === "ADMIN"; }
function canEdit(userType)   { return userType === "SUPERADMIN" || userType === "ADMIN"; }
function canDelete(userType) { return userType === "SUPERADMIN"; }
function canSeeStamp(userType) { return userType === "SUPERADMIN" || userType === "ADMIN"; }

// ── shared styles (matches project design system) ────────────────────────────

const S = {
  input: {
    width: "100%", padding: "9px 12px", border: "1px solid #d0cec8",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
    background: "#fff", fontFamily: "DM Sans, sans-serif",
  },
  label: { fontSize: 12, color: "#666", display: "block", marginBottom: 4 },
  formGroup: { marginBottom: 14 },
  btnPrimary: {
    padding: "9px 18px", background: "#1a1a18", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: "pointer", fontFamily: "DM Sans, sans-serif",
  },
  btnSecondary: {
    padding: "9px 18px", background: "#fff", color: "#1a1a18",
    border: "1px solid #d0cec8", borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: "pointer", fontFamily: "DM Sans, sans-serif",
  },
  btnDanger: {
    padding: "9px 18px", background: "#A32D2D", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: "pointer", fontFamily: "DM Sans, sans-serif",
  },
  btnSmEdit: {
    padding: "4px 10px", background: "#185FA5", color: "#fff",
    border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", marginRight: 6,
  },
  btnSmDel: {
    padding: "4px 10px", background: "#A32D2D", color: "#fff",
    border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
  },
};

// ── Modal overlay wrapper ─────────────────────────────────────────────────────

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "32px 28px",
          width: "100%", maxWidth: 480, maxHeight: "90vh",
          overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,.18)",
          fontFamily: "DM Sans, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Employee form (shared by Add and Edit) ────────────────────────────────────

const EMPTY_FORM = {
  empno: "", lastname: "", firstname: "",
  gender: "M", birthdate: "", hiredate: "", sepDate: "",
};

function EmployeeForm({ initial = EMPTY_FORM, onSubmit, onCancel, busy, isEdit }) {
  const [form, setForm] = useState(initial);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>
        {isEdit ? "Edit Employee" : "Add Employee"}
      </h2>

      <div style={S.formGroup}>
        <label style={S.label}>Employee No. <span style={{ color: "#A32D2D" }}>*</span></label>
        <input
          style={{ ...S.input, background: isEdit ? "#f5f4f0" : "#fff" }}
          value={form.empno}
          onChange={set("empno")}
          placeholder="e.g. 00064"
          maxLength={5}
          required
          disabled={isEdit}
        />
        {isEdit && <span style={{ fontSize: 11, color: "#999" }}>Employee No. cannot be changed.</span>}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...S.formGroup, flex: 1 }}>
          <label style={S.label}>Last Name <span style={{ color: "#A32D2D" }}>*</span></label>
          <input style={S.input} value={form.lastname} onChange={set("lastname")} placeholder="e.g. Santos" maxLength={15} required />
        </div>
        <div style={{ ...S.formGroup, flex: 1 }}>
          <label style={S.label}>First Name <span style={{ color: "#A32D2D" }}>*</span></label>
          <input style={S.input} value={form.firstname} onChange={set("firstname")} placeholder="e.g. Maria" maxLength={15} required />
        </div>
      </div>

      <div style={S.formGroup}>
        <label style={S.label}>Gender <span style={{ color: "#A32D2D" }}>*</span></label>
        <select style={S.input} value={form.gender} onChange={set("gender")} required>
          <option value="M">Male (M)</option>
          <option value="F">Female (F)</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...S.formGroup, flex: 1 }}>
          <label style={S.label}>Birthdate <span style={{ color: "#A32D2D" }}>*</span></label>
          <input style={S.input} type="date" value={form.birthdate} onChange={set("birthdate")} required />
        </div>
        <div style={{ ...S.formGroup, flex: 1 }}>
          <label style={S.label}>Hire Date <span style={{ color: "#A32D2D" }}>*</span></label>
          <input style={S.input} type="date" value={form.hiredate} onChange={set("hiredate")} required />
        </div>
      </div>

      <div style={S.formGroup}>
        <label style={S.label}>Separation Date <span style={{ fontSize: 11, color: "#aaa" }}>(leave blank if still employed)</span></label>
        <input style={S.input} type="date" value={form.sepDate} onChange={set("sepDate")} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" style={S.btnSecondary} onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" style={S.btnPrimary} disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save Changes" : "Add Employee"}
        </button>
      </div>
    </form>
  );
}

// ── Soft Delete Confirm Dialog ────────────────────────────────────────────────

function SoftDeleteConfirmDialog({ employee, onConfirm, onCancel, busy }) {
  return (
    <Modal onClose={onCancel}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Deactivate Employee?</h2>
        <p style={{ fontSize: 14, color: "#555", margin: "0 0 4px" }}>
          <strong>{employee.firstname} {employee.lastname}</strong> ({employee.empno})
        </p>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px" }}>
          This will hide the employee and all their job history from regular users.
          An admin can recover them from Deleted Items.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={S.btnSecondary} onClick={onCancel} disabled={busy}>Cancel</button>
          <button style={S.btnDanger} onClick={onConfirm} disabled={busy}>
            {busy ? "Deactivating…" : "Yes, Deactivate"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showAdd, setShowAdd]               = useState(false);
  const [editTarget, setEditTarget]         = useState(null);   // employee object or null
  const [deleteTarget, setDeleteTarget]     = useState(null);   // employee object or null
  const [busy, setBusy]                     = useState(false);
  const [toast, setToast]                   = useState("");     // success message

  // ── fetch ──
  async function fetchEmployees() {
    setLoading(true);
    setError("");
    const { data, error } = await getEmployees(userType);
    if (error) setError(error.message);
    else setEmployees(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchEmployees(); }, []);

  // ── toast helper ──
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── handlers ──
  async function handleAdd(form) {
    setBusy(true);
    const { error } = await addEmployee(
      {
        empno:     form.empno.trim(),
        lastname:  form.lastname.trim(),
        firstname: form.firstname.trim(),
        gender:    form.gender,
        birthdate: form.birthdate || null,
        hiredate:  form.hiredate  || null,
        sepDate:   form.sepDate   || null,
      },
      currentUser.id
    );
    setBusy(false);
    if (error) { setError(error.message); return; }
    setShowAdd(false);
    showToast("Employee added successfully.");
    fetchEmployees();
  }

  async function handleEdit(form) {
    setBusy(true);
    const { error } = await updateEmployee(
      editTarget.empno,
      {
        lastname:  form.lastname.trim(),
        firstname: form.firstname.trim(),
        gender:    form.gender,
        birthdate: form.birthdate || null,
        hiredate:  form.hiredate  || null,
        sepDate:   form.sepDate   || null,
      },
      currentUser.id
    );
    setBusy(false);
    if (error) { setError(error.message); return; }
    setEditTarget(null);
    showToast("Employee updated successfully.");
    fetchEmployees();
  }

  async function handleDelete() {
    setBusy(true);
    const { error } = await softDeleteEmployee(deleteTarget.empno, currentUser.id);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setDeleteTarget(null);
    showToast("Employee deactivated. Recoverable from Deleted Items.");
    fetchEmployees();
  }

  // ── render ──
  return (
    <div style={{ fontFamily: "DM Sans, sans-serif" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#1a1a18" }}>Employees</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            {employees.length} {userType === "USER" ? "active" : "total"} record{employees.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canAdd(userType) && (
          <button style={S.btnPrimary} onClick={() => setShowAdd(true)}>+ Add Employee</button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ background: "#E6F4EA", color: "#1E6B3E", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {toast}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e4dd", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>Loading employees…</div>
        ) : employees.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>No employees found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f5f4f0", borderBottom: "1px solid #e8e4dd" }}>
                  <Th>Emp No.</Th>
                  <Th>Last Name</Th>
                  <Th>First Name</Th>
                  <Th>Gender</Th>
                  <Th>Hire Date</Th>
                  <Th>Sep. Date</Th>
                  {canSeeStamp(userType) && <Th>Status</Th>}
                  {canSeeStamp(userType) && <Th>Stamp</Th>}
                  {(canEdit(userType) || canDelete(userType)) && <Th>Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr
                    key={emp.empno}
                    style={{
                      borderBottom: "1px solid #f0ede8",
                      background: emp.record_status === "INACTIVE" ? "#fff8f8" : (i % 2 === 0 ? "#fff" : "#fafaf9"),
                    }}
                  >
                    <Td><span style={{ fontWeight: 600, color: "#185FA5" }}>{emp.empno}</span></Td>
                    <Td>{emp.lastname}</Td>
                    <Td>{emp.firstname}</Td>
                    <Td>{emp.gender === "M" ? "Male" : "Female"}</Td>
                    <Td>{emp.hiredate ? formatDate(emp.hiredate) : "—"}</Td>
                    <Td>{emp.sepDate  ? formatDate(emp.sepDate)  : <span style={{ color: "#aaa" }}>Active</span>}</Td>
                    {canSeeStamp(userType) && (
                      <Td>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500,
                          background: emp.record_status === "ACTIVE" ? "#E6F4EA" : "#FCEBEB",
                          color:      emp.record_status === "ACTIVE" ? "#1E6B3E" : "#A32D2D",
                        }}>
                          {emp.record_status}
                        </span>
                      </Td>
                    )}
                    {canSeeStamp(userType) && (
                      <Td><span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{emp.stamp || "—"}</span></Td>
                    )}
                    {(canEdit(userType) || canDelete(userType)) && (
                      <Td>
                        {canEdit(userType) && emp.record_status === "ACTIVE" && (
                          <button style={S.btnSmEdit} onClick={() => setEditTarget(emp)}>Edit</button>
                        )}
                        {canDelete(userType) && emp.record_status === "ACTIVE" && (
                          <button style={S.btnSmDel} onClick={() => setDeleteTarget(emp)}>Deactivate</button>
                        )}
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <EmployeeForm
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            busy={busy}
            isEdit={false}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal onClose={() => setEditTarget(null)}>
          <EmployeeForm
            initial={{
              empno:     editTarget.empno,
              lastname:  editTarget.lastname  || "",
              firstname: editTarget.firstname || "",
              gender:    editTarget.gender    || "M",
              birthdate: editTarget.birthdate || "",
              hiredate:  editTarget.hiredate  || "",
              sepDate:   editTarget.sepDate   || "",
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            busy={busy}
            isEdit={true}
          />
        </Modal>
      )}

      {deleteTarget && (
        <SoftDeleteConfirmDialog
          employee={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={busy}
        />
      )}
    </div>
  );
}

// ── tiny table cell components ────────────────────────────────────────────────

function Th({ children }) {
  return (
    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={{ padding: "10px 14px", color: "#333", verticalAlign: "middle" }}>
      {children}
    </td>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}