import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRights } from "../context/UserRightsContext";
import { getJobs, addJob, updateJob, softDeleteJob } from "../services/jobService";

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

function JobForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    jobCode: initial.jobCode ?? "",
    jobDesc: initial.jobDesc ?? "",
  });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const isEdit = !!initial.jobCode;

  const handleSubmit = () => {
    if (!form.jobCode.trim() || !form.jobDesc.trim()) {
      setErr("Job code and description are required.");
      return;
    }
    setErr("");
    onSave(form);
  };

  return (
    <>
      <label style={S.label}>Job Code *</label>
      <input
        style={{ ...S.input, background: isEdit ? "#f5f4f0" : "#fff", color: isEdit ? "#888" : "#1a1a18" }}
        value={form.jobCode}
        onChange={set("jobCode")}
        readOnly={isEdit}
      />

      <label style={S.label}>Job Description *</label>
      <input style={S.input} value={form.jobDesc} onChange={set("jobDesc")} />

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

function DeactivateConfirm({ job, onConfirm, onCancel, saving }) {
  return (
    <Modal title="Deactivate Job">
      <p style={{ fontSize: 14, margin: "0 0 8px" }}>
        Deactivate <strong>{job.jobCode} — {job.jobDesc}</strong>?
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

export default function JobsPage() {
  const { currentUser } = useAuth();
  const { rights } = useRights();
  const userType = currentUser?.user_type;
  const showStamp = userType === "ADMIN" || userType === "SUPERADMIN";

  const [jobs, setJobs] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await getJobs(userType);
    if (error) setLoadErr(error.message);
    else setJobs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    setSaving(true); setSaveErr("");
    const { error } = await addJob(form, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setShowAdd(false);
    load();
  };

  const handleEdit = async (form) => {
    setSaving(true); setSaveErr("");
    const { error } = await updateJob(editTarget.jobCode, { jobDesc: form.jobDesc }, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await softDeleteJob(deleteTarget.jobCode, currentUser.id);
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setDeleteTarget(null);
    load();
  };

  const colCount = 3 + (showStamp ? 1 : 0) + (rights.JOB_EDIT || rights.JOB_DEL ? 1 : 0);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>Jobs</h1>
        {rights.JOB_ADD && (
          <button style={S.btnPrimary} onClick={() => { setShowAdd(true); setSaveErr(""); }}>
            + Add Job
          </button>
        )}
      </div>

      {loadErr && <p style={S.error}>{loadErr}</p>}

      <div style={{ overflowX: "auto" }}>
      <table style={S.table}>
        <thead>
          <tr>
            <Th>Job Code</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            {showStamp && <Th>Stamp</Th>}
            {(rights.JOB_EDIT || rights.JOB_DEL) && <Th>Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.jobCode}>
              <Td>{job.jobCode}</Td>
              <Td>{job.jobDesc}</Td>
              <Td>
                <span style={S.badge(job.record_status)}>{job.record_status}</span>
              </Td>
              {showStamp && (
                <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{job.stamp}</td>
              )}
              {(rights.JOB_EDIT || rights.JOB_DEL) && (
                <Td>
                  {rights.JOB_EDIT && job.record_status === "ACTIVE" && (
                    <button style={S.btnSmEdit} onClick={() => { setEditTarget(job); setSaveErr(""); }}>
                      Edit
                    </button>
                  )}
                  {rights.JOB_DEL && job.record_status === "ACTIVE" && (
                    <button style={S.btnSmDel} onClick={() => setDeleteTarget(job)}>
                      Deactivate
                    </button>
                  )}
                </Td>
              )}
            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={colCount} style={{ ...S.td, textAlign: "center", color: "#888" }}>
                Loading…
              </td>
            </tr>
          )}
          {!loading && jobs.length === 0 && !loadErr && (
            <tr>
              <td colSpan={colCount} style={{ ...S.td, textAlign: "center", color: "#888" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {showAdd && (
        <Modal title="Add Job">
          <JobForm onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Job">
          <JobForm initial={editTarget} onSave={handleEdit} onCancel={() => setEditTarget(null)} saving={saving} />
          {saveErr && <div style={S.error}>{saveErr}</div>}
        </Modal>
      )}

      {deleteTarget && (
        <DeactivateConfirm
          job={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
