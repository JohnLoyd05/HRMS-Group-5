//PR 2 M4 update
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUsers, activateUser, deactivateUser } from "../services/adminService";

const S = {
  page: { padding: "24px 32px", fontFamily: "sans-serif", color: "#1a1a18" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  h1: { fontSize: 22, fontWeight: 700, margin: 0 },
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
  typeBadge: (type) => {
    const map = {
      SUPERADMIN: { background: "#f3e8ff", color: "#7e22ce" },
      ADMIN:      { background: "#e8f0fe", color: "#1a56db" },
      USER:       { background: "#f5f4f0", color: "#555" },
    };
    const style = map[type] ?? map.USER;
    return {
      display: "inline-block", padding: "2px 8px", borderRadius: 12,
      fontSize: 11, fontWeight: 600, ...style,
    };
  },
  btnActivate: {
    padding: "4px 10px", background: "#d4f7dc", color: "#1a7a36",
    border: "1px solid #a8e6b8", borderRadius: 6, fontSize: 12, cursor: "pointer", marginRight: 6,
  },
  btnDeactivate: {
    padding: "4px 10px", background: "#fde8e8", color: "#a02020",
    border: "1px solid #f5c6c6", borderRadius: 6, fontSize: 12, cursor: "pointer",
  },
  btnDisabled: {
    padding: "4px 10px", background: "#f5f4f0", color: "#bbb",
    border: "1px solid #e0deda", borderRadius: 6, fontSize: 12,
    cursor: "not-allowed", marginRight: 6,
  },
  error: { color: "#a02020", fontSize: 13, marginTop: 10 },
  empty: { textAlign: "center", color: "#888", padding: "20px 0", fontSize: 13 },
  selfNote: { fontSize: 11, color: "#888", fontStyle: "italic" },
  meta: { fontSize: 12, color: "#888", marginBottom: 12 },
};

function Th({ children }) { return <th style={S.th}>{children}</th>; }
function Td({ children }) { return <td style={S.td}>{children}</td>; }

function ActionButtons({ user, currentUserId, onActivate, onDeactivate, acting }) {
  const isSuperAdmin = user.user_type === "SUPERADMIN";
  const isSelf = user.id === currentUserId;
  const isActing = acting === user.id;

  if (isSuperAdmin) {
    return (
      <span
        style={S.btnDisabled}
        title="SUPERADMIN accounts cannot be modified"
      >
        Protected
      </span>
    );
  }

  return (
    <>
      {user.record_status === "INACTIVE" && (
        <button
          style={S.btnActivate}
          onClick={() => onActivate(user.id)}
          disabled={isActing || isSelf}
          title={isSelf ? "Cannot modify your own account" : "Activate this user"}
        >
          {isActing ? "Activating…" : "Activate"}
        </button>
      )}
      {user.record_status === "ACTIVE" && (
        <button
          style={{ ...S.btnDeactivate, ...(isSelf ? { cursor: "not-allowed", opacity: 0.5 } : {}) }}
          onClick={() => !isSelf && onDeactivate(user.id)}
          disabled={isActing || isSelf}
          title={isSelf ? "Cannot deactivate your own account" : "Deactivate this user"}
        >
          {isActing ? "Deactivating…" : "Deactivate"}
        </button>
      )}
    </>
  );
}

export default function AdminPage() {
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type;
  const showStamp = userType === "ADMIN" || userType === "SUPERADMIN";

  const [users, setUsers] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [acting, setActing] = useState(null);

  const load = async () => {
    const { data, error } = await getUsers();
    if (error) setLoadErr(error.message);
    else setUsers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleActivate = async (userId) => {
    setActing(userId);
    setActionErr("");
    const { error } = await activateUser(userId, currentUser.id);
    setActing(null);
    if (error) { setActionErr(error.message); return; }
    load();
  };

  const handleDeactivate = async (userId) => {
    setActing(userId);
    setActionErr("");
    const { error } = await deactivateUser(userId, currentUser.id);
    setActing(null);
    if (error) { setActionErr(error.message); return; }
    load();
  };

  // ADMIN/SUPERADMIN only — redirect message for USER
  if (userType === "USER") {
    return (
      <div style={S.page}>
        <h1 style={{ ...S.h1, marginBottom: 12 }}>Admin</h1>
        <p style={{ color: "#888", fontSize: 13 }}>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>User Management</h1>
      </div>

      {loadErr && <p style={S.error}>{loadErr}</p>}
      {actionErr && <p style={S.error}>{actionErr}</p>}

      <div style={S.meta}>{users.length} user{users.length !== 1 ? "s" : ""}</div>

      <table style={S.table}>
        <thead>
          <tr>
            <Th>User ID</Th>
            <Th>Username</Th>
            <Th>Name</Th>
            <Th>User Type</Th>
            <Th>Status</Th>
            {showStamp && <Th>Stamp</Th>}
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              style={u.user_type === "SUPERADMIN" ? { background: "#faf8ff" } : {}}
            >
              <Td>
                <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
                  {u.id.slice(0, 8)}…
                </span>
              </Td>
              <Td>
                {u.username ?? "—"}
                {u.id === currentUser.id && (
                  <span style={{ ...S.selfNote, marginLeft: 6 }}>(you)</span>
                )}
              </Td>
              <Td>{u.firstname} {u.lastname}</Td>
              <Td>
                <span style={S.typeBadge(u.user_type)}>{u.user_type}</span>
              </Td>
              <Td>
                <span style={S.badge(u.record_status)}>{u.record_status}</span>
              </Td>
              {showStamp && (
                <td style={{ ...S.td, fontSize: 11, color: "#888" }}>{u.stamp ?? "—"}</td>
              )}
              <td style={S.td}>
                <ActionButtons
                  user={u}
                  currentUserId={currentUser.id}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  acting={acting}
                />
              </td>
            </tr>
          ))}
          {users.length === 0 && !loadErr && (
            <tr>
              <td colSpan={showStamp ? 7 : 6} style={S.empty}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
