import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { globalSearch } from "../services/searchService";

const TYPE_META = {
  employee:   { icon: "👤", label: "Employee" },
  department: { icon: "🏢", label: "Department" },
  job:        { icon: "💼", label: "Job" },
};

export default function GlobalSearch() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const { results: res } = await globalSearch(q, currentUser?.user_type);
    setResults(res);
    setOpen(true);
    setLoading(false);
    setActiveIdx(-1);
  }, [currentUser?.user_type]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item) => {
    setQuery("");
    setOpen(false);
    navigate(item.href);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 420 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: 10, fontSize: 14, color: "#999", pointerEvents: "none" }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search employees, departments, jobs…"
          style={{
            width: "100%",
            padding: "8px 12px 8px 34px",
            borderRadius: 8,
            border: "1px solid #d0cec8",
            fontSize: 13,
            background: "#f5f4f0",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "'DM Sans', sans-serif",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.target.style.borderColor = "#aaa"}
          onMouseLeave={e => e.target.style.borderColor = open ? "#1a1a18" : "#d0cec8"}
          aria-label="Global search"
          autoComplete="off"
        />
        {loading && (
          <span style={{ position: "absolute", right: 10, fontSize: 11, color: "#999" }}>…</span>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #e0ddd8",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 500,
          overflow: "hidden",
          maxHeight: 380,
          overflowY: "auto",
        }}>
          {results.length === 0 && !loading && (
            <div style={{ padding: "14px 16px", fontSize: 13, color: "#888", textAlign: "center" }}>
              No results for "{query}"
            </div>
          )}

          {results.length > 0 && (() => {
            const groups = ["employee", "department", "job"];
            return groups.map(type => {
              const items = results.filter(r => r.type === type);
              if (items.length === 0) return null;
              const meta = TYPE_META[type];
              const flatIdx = results.indexOf(items[0]);
              return (
                <div key={type}>
                  <div style={{
                    padding: "6px 14px 4px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    borderTop: type !== "employee" ? "1px solid #f0ede8" : "none",
                  }}>
                    {meta.label}s
                  </div>
                  {items.map((item, i) => {
                    const idx = flatIdx + i;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={idx}
                        onMouseDown={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 14px",
                          border: "none",
                          background: isActive ? "#f5f4f0" : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <span style={{ fontSize: 15, flexShrink: 0 }}>{meta.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1a1a18" }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 11, color: "#888" }}>{item.sub}</div>
                        </div>
                        {item.status === "INACTIVE" && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "1px 6px",
                            borderRadius: 10, background: "#fde8e8", color: "#a02020", flexShrink: 0,
                          }}>
                            INACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
