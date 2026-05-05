// ════════════════════════════════════════════════════════════════════
// نسخة احتياطية من الهيدر — تم حذفه من App.jsx
// الموقع الأصلي: App.jsx السطر 10724 - 10804
// تاريخ الحذف: 2026-05-05
// لإعادة تفعيله: أضفه في App.jsx بعد {Modal()} مباشرةً
// ════════════════════════════════════════════════════════════════════

{/* ── HEADER ───────────────────────────────────────────────────────── */}
<header
  className="premium-header"
  style={{
    ...styles.header,
    background: t.headerGradient,
    borderBottom: `1px solid ${dark ? "rgba(130,160,220,0.12)" : "rgba(30,64,175,0.08)"}`,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: dark
      ? "0 2px 24px rgba(0,0,0,0.35), 0 0 40px rgba(26,86,219,0.06)"
      : "0 2px 20px rgba(15,27,58,0.07), 0 1px 0 rgba(255,255,255,0.8)",
  }}
>
  {/* Animated gradient border at bottom */}
  <div style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 25%, rgba(59,130,246,0.5) 75%, transparent 100%)",
    backgroundSize: "200% 100%",
    animation: "headerLineGlow 5s ease infinite",
    pointerEvents: "none",
  }} />

  <div style={styles.headerInner}>
    {/* Logo badge with cinematic glow */}
    <div
      className="logo-badge-glow"
      style={{
        ...styles.logoIcon,
        background: dark
          ? "linear-gradient(145deg, #0a1e50, #0f2870)"
          : "linear-gradient(145deg, #0e2d6e, #1a3c8a)",
        boxShadow: dark
          ? "0 4px 20px rgba(212,175,55,0.45), 0 0 0 1px rgba(212,175,55,0.22), 0 0 32px rgba(26,86,219,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
          : "0 4px 18px rgba(212,175,55,0.38), 0 0 0 1px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Inner light reflection */}
      <div style={{
        position: "absolute",
        top: -4,
        left: -4,
        right: "50%",
        bottom: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <img src={logo} alt="logo" style={{ width: 30, height: 30, position: "relative", zIndex: 1 }} />
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        ...styles.logoTitle,
        color: t.text,
        fontWeight: 900,
        letterSpacing: 0.2,
      }}>
        {tx.appTitle}
      </div>
      <div style={{
        ...styles.logoSub,
        color: t.gold,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        fontSize: 8.5,
      }}>
        {tx.appSub}
      </div>
    </div>
  </div>
</header>

// ════════════════════════════════════════════════════════════════════
// CSS المرتبط بالهيدر في App.css — السطر 748-780
// .premium-header { ... }
// .premium-header::after { ... }
// styles.header في App.jsx السطر 15782-15789
// styles.headerInner في App.jsx السطر 15790-15796
// styles.logoIcon في App.jsx السطر 15833-15845
// styles.logoTitle في App.jsx السطر 15846
// styles.logoSub في App.jsx السطر 15847
// ════════════════════════════════════════════════════════════════════
