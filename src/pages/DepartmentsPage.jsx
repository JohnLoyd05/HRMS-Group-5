import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRights } from "../context/UserRightsContext";
import { getDepts, addDept, updateDept, softDeleteDept } from "../services/departmentService";

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
    background: "#fff", borderRadius: 12, padding: 28, minWidth: 360,
    maxWidth: 440, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  modalTitle: { fontSize: 17, fontWeight: 700, marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 14 },
  input: {
    width: "100%", padding: "8px 10px", borderRadius: 6,
    border: "1px solid #d0cec8", fontSize: 13, boxSizing: "border-box",
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

function Th({ children }) { return <th style={S.th}>{children}</th>; }
function Td({ children }) { return <td style={S.td}>{children}</td>; }

function Modal({ title, children }) {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function DeptForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    deptCode: initial.deptCode ?? "",
    deptName: initial.deptName ?? "",
  });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const isEdit = !!initial.deptCode;

  const handleSubmit = () => {
    if (!form.deptCode.trim() || !form.deptName.trim()) {
      setErr("Department code and name are required.");
      return;
    }
    setErr("");
    onSave(form);
  };

  return (
    <>
      <label style={S.label}>Department Code *</label>
      <input
        style={{ ...S.input, background: isEdit ? "#f5f4f0" : "#fff", color: isEdit ? "#888" : "#1a1a18" }}
        value={form.deptCode}
        onChange={set("deptCode")}
        readOnly={isEdit}
      />

      <label style={S.label}>Department Name *</label>
      <input style={S.input} value={form.deptName} onChange={set("deptName")} />

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

function DeactivateConfirm({ dept, onConfirm, onCancel, saving }) {
  return (
    <Modal title="Deactivate Department">
      <p style={{ fontSize: 14, margin: "0 0 8px" }}>
        Deactivate <strong>{dept.deptCode} — {dept.deptName}</strong>?
      </p>
      <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
        It will no longer appear for regular users. Recoverable from Deleted Items.
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

export default function DepartmentsPage() {
  const { currentUser } = useAuth();
  const { rights } = useRights();
  const userType = currentUser?.user_type;
  const showStamp = userType === "ADMIN" || userType === "SUPERADMIN";

  const [depts, setDepts] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const load = async () => {
    const { data, error } = await getDepts(userType);
    if (error) setLoadErr(error.message);
    else setDepts(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    setSaving(true); setSaveErr("");
    const { error } = await addDept(form, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setShowAdd(false);
    load();
  };

  const handleEdit = async (form) => {
    setSaving(true); setSaveErr("");
    const { error } = await updateDept(editTarget.deptCode, { deptName: form.deptName }, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await softDeleteDept(deleteTarget.deptCode, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setDeleteTarget(null);
    load();
  };

  const colCount = 3 + (showStamp ? 1 : 0) + (rights.DEPT_EDIT || rights.DEPT_DEL ? 1 : 0);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>Departments</h1>
        {rights.DEPT_ADD && (
          <button style={S.btnPrimary} onClick={() => { setShowAdd(true); setSaveErr(""); }}>
            + Add Department
          </button>
        )}
      </div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <table style={S.table}>
        <thead>
          <tr>
            <Th>Dept Code</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            {showStamp && <Th>Stamp</Th>}
            {(rights.DEPT_EDIT || rights.DEPT_DEL) && <Th>Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {depts.map((dept) => (
            <tr key={dept.deptCode}>
              <Td>{dept.deptCode}</Td>
              <Td>{dept.deptName}</Td>
              <Td>
                <span style={S.badge(dept.record_status)}>{dept.record_status}</span>
              </Td>
              {showStamp && (
                <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{dept.stamp}</td>
              )}
              {(rights.DEPT_EDIT || rights.DEPT_DEL) && (
                <Td>
                  {rights.DEPT_EDIT && dept.record_status === "ACTIVE" && (
                    <button style={S.btnSmEdit} onClick={() => { setEditTarget(dept); setSaveErr(""); }}>
                      Edit
                    </button>
                  )}
                  {rights.DEPT_DEL && dept.record_status === "ACTIVE" && (
                    <button style={S.btnSmDel} onClick={() => setDeleteTarget(dept)}>
                      Deactivate
                    </button>
                  )}
                </Td>
              )}
            </tr>
          ))}
          {depts.length === 0 && !loadErr && (
            <tr>
              <td colSpan={colCount} style={{ ...S.td, textAlign: "center", color: "#888" }}>
                No departments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAdd && (
        <Modal title="Add Department">
          <DeptForm onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Department">
          <DeptForm initial={editTarget} onSave={handleEdit} onCancel={() => setEditTarget(null)} saving={saving} />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {deleteTarget && (
        <DeactivateConfirm
          dept={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
