import React from 'react';

export default function SignOutConfirmPanel({
  lang, dark, dir, styles, t,
  signOutConfirmOpen, onConfirmSignOut, onCancelSignOut,
}) {
  if (!signOutConfirmOpen) return null;
  return (

    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.60)", backdropFilter: "blur(8px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          borderRadius: 24,
          padding: "22px 18px 18px",
          background: dark ? "linear-gradient(180deg, rgba(91, 20, 20, 0.96) 0%, rgba(57, 18, 18, 0.98) 100%)" : "linear-gradient(180deg, #fff5f5 0%, #fee2e2 100%)",
          border: "1px solid rgba(248,113,113,0.28)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ fontSize: 34, textAlign: "center", marginBottom: 10 }}>🚪</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: dark ? "#fecaca" : "#b91c1c", textAlign: "center", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? "هل تريد تسجيل الخروج؟" : "Do you want to sign out?"}
        </div>
        <div style={{ fontSize: 12, color: dark ? "rgba(254,202,202,0.92)" : "#7f1d1d", lineHeight: 1.8, textAlign: "center", marginBottom: 16, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar"
            ? "سيتم إرجاعك إلى شاشة تسجيل الدخول، وستحتاج إلى تسجيل الدخول مرة أخرى للمتابعة."
            : "You will be returned to the sign-in screen and will need to log in again to continue."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={closeSignOutConfirm}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(148,163,184,0.24)",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.86)",
              color: dark ? "#fff" : "#334155",
              fontSize: 13,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "لا" : "No"}
          </button>
          <button
            onClick={async () => {
              setSignOutConfirmOpen(false);
              await handleAuthSignOut();
            }}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "نعم" : "Yes"}
          </button>
        </div>
      </div>
    </div>
  
  );
}
