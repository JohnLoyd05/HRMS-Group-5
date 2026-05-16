import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  softDeleteEmployee,
} from "../services/employeeService";

// --- Rights helpers ---
const canAdd = (t) => t === "ADMIN" || t === "SUPERADMIN";
const canEdit = (t) => t === "ADMIN" || t === "SUPERADMIN";
const canDelete = (t) => t === "SUPERADMIN";
const canSeeStamp = (t) => t === "ADMIN" || t === "SUPERADMIN";

// --- Shared styles ---
const S = {
  page: { padding: "24px 32px", fontFamily: "sans-serif", color: "#1a1a18" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  h1: { fontSize: 22, fontWeight: 700, margin: 0 },
  btnPrimary: {
    padding: "8px 18px", background: "#1a1a18", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer",
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
  btnSmView: {
    padding: "4px 10px", background: "#f5f4f0", color: "#1a1a18",
    border: "1px solid #d0cec8", borderRadius: 6, fontSize: 12,
    cursor: "pointer", marginRight: 6,
  },
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
    maxWidth: 480, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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
};

// --- Reusable wrappers ---
function Th({ children }) {
  return <th style={S.th}>{children}</th>;
}
function Td({ children }) {
  return <td style={S.td}>{children}</td>;
}

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

// --- Add / Edit form (shared) ---
function EmployeeForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    lastname: initial.lastname ?? "",
    firstname: initial.firstname ?? "",
    gender: initial.gender ?? "",
    birthdate: initial.birthdate ?? "",
    hiredate: initial.hiredate ?? "",
    sepDate: initial.sepDate ?? "",
  });
  const [err, setErr] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.lastname.trim() || !form.firstname.trim()) {
      setErr("Last name and first name are required.");
      return;
    }
    setErr("");
    onSave(form);
  };

  return (
    <>
      <label style={S.label}>Last Name *</label>
      <input style={S.input} value={form.lastname} onChange={set("lastname")} />

      <label style={S.label}>First Name *</label>
      <input style={S.input} value={form.firstname} onChange={set("firstname")} />

      <label style={S.label}>Gender</label>
      <select style={S.select} value={form.gender} onChange={set("gender")}>
        <option value="">— select —</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <label style={S.label}>Birthdate</label>
      <input style={S.input} type="date" value={form.birthdate} onChange={set("birthdate")} />

      <label style={S.label}>Hire Date</label>
      <input style={S.input} type="date" value={form.hiredate} onChange={set("hiredate")} />

      <label style={S.label}>Separation Date</label>
      <input style={S.input} type="date" value={form.sepDate} onChange={set("sepDate")} />

      {err && <div style={S.error}>{err}</div>}

      <div style={S.modalFooter}>
        <button style={S.btnCancel} onClick={onCancel} disabled={saving}>Cancel</button>
        <button style={S.btnConfirm} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </>
  );
}

// --- Soft-delete confirm dialog ---
function SoftDeleteConfirmDialog({ emp, onConfirm, onCancel, saving }) {
  return (
    <Modal title="Deactivate Employee" onClose={onCancel}>
      <p style={{ fontSize: 14, margin: "0 0 8px" }}>
        Deactivate <strong>{emp.firstname} {emp.lastname}</strong>?
      </p>
      <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
        Their job history will also be deactivated. An admin can recover them later.
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
export default function EmployeesPage() {
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type;
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const load = async () => {
    const { data, error } = await getEmployees(userType);
    if (error) setLoadErr(error.message);
    else setEmployees(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    setSaving(true);
    setSaveErr("");
    const { error } = await addEmployee(form, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setShowAdd(false);
    load();
  };

  const handleEdit = async (form) => {
    setSaving(true);
    setSaveErr("");
    const { error } = await updateEmployee(editTarget.empno, form, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await softDeleteEmployee(deleteTarget.empno, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setDeleteTarget(null);
    load();
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>Employees</h1>
        {canAdd(userType) && (
          <button style={S.btnPrimary} onClick={() => { setShowAdd(true); setSaveErr(""); }}>
            + Add Employee
          </button>
        )}
      </div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <table style={S.table}>
        <thead>
          <tr>
            <Th>Emp No</Th>
            <Th>Last Name</Th>
            <Th>First Name</Th>
            <Th>Gender</Th>
            <Th>Hire Date</Th>
            <Th>Status</Th>
            {canSeeStamp(userType) && <Th>Stamp</Th>}
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.empno}>
              <Td>{emp.empno}</Td>
              <Td>{emp.lastname}</Td>
              <Td>{emp.firstname}</Td>
              <Td>{emp.gender}</Td>
              <Td>{emp.hiredate}</Td>
              <Td>
                <span style={S.badge(emp.record_status)}>{emp.record_status}</span>
              </Td>
              {canSeeStamp(userType) && <Td style={{ fontSize: 11, color: "#888" }}>{emp.stamp}</Td>}
              <Td>
                <button
                  style={S.btnSmView}
                  onClick={() => navigate(`/employees/${emp.empno}`)}
                >
                  View
                </button>
                {canEdit(userType) && emp.record_status === "ACTIVE" && (
                  <button style={S.btnSmEdit} onClick={() => { setEditTarget(emp); setSaveErr(""); }}>
                    Edit
                  </button>
                )}
                {canDelete(userType) && emp.record_status === "ACTIVE" && (
                  <button style={S.btnSmDel} onClick={() => setDeleteTarget(emp)}>
                    Deactivate
                  </button>
                )}
              </Td>
            </tr>
          ))}
          {employees.length === 0 && !loadErr && (
            <tr>
              <td colSpan={canSeeStamp(userType) ? 8 : 7} style={{ ...S.td, textAlign: "center", color: "#888" }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add Employee" onClose={() => setShowAdd(false)}>
          <EmployeeForm onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title="Edit Employee" onClose={() => setEditTarget(null)}>
          <EmployeeForm
            initial={editTarget}
            onSave={handleEdit}
            onCancel={() => setEditTarget(null)}
            saving={saving}
          />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {/* Soft-delete confirm */}
      {deleteTarget && (
        <SoftDeleteConfirmDialog
          emp={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
