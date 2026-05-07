export default function Toast({ toasts, remove }) {
  const icons = { success: "✓", error: "✕", info: "★" };
  return (
    <div style={{ position:"fixed", top:80, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: "#0D0D0D", color: "#fff", padding: "12px 18px",
          borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 40px rgba(0,0,0,.3)", cursor: "pointer", maxWidth: 300,
          borderLeft: `3px solid ${t.type==="success"?"#4ade80":t.type==="error"?"#f87171":"#C9A84C"}`,
          animation: "slideIn .3s ease",
        }}>
          <span>{icons[t.type]}</span> {t.msg}
        </div>
      ))}
    </div>
  );
}
