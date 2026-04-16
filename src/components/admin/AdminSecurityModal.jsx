import React, { useState } from 'react';

export default function AdminSecurityModal({
  lang, dark, dir, styles, t,
  adminSecurityOpen, isAdminUser,
  adminSecurityInput, setAdminSecurityInput,
  adminSecurityError, setAdminSecurityError,
  onSecurityConfirm, onSecurityCancel,
  isCompactPhone,
}) {
  if (!(adminSecurityOpen && isAdminUser)) return null;
  return (

    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.72)", backdropFilter: "blur(10px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          borderRadius: 22,
          padding: "20px 16px 16px",
          background: dark
            ? "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,0.98) 100%)"
            : "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          border: dark ? "1px solid rgba(148,163,184,0.35)" : "1px solid rgba(51,65,85,0.18)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.30)",
        }}
      >
        <div style={{ fontSize: 30, textAlign: "center", marginBottom: 8 }}>🛡️</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a", textAlign: "center", marginBottom: 6, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? "أمان لوحة الأدمن" : "Admin Security Check"}
        </div>
        <div style={{ fontSize: 12, color: dark ? "rgba(226,232,240,0.92)" : "#334155", lineHeight: 1.7, textAlign: "center", marginBottom: 12, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar"
            ? "أدخل كود الأدمن (6 أرقام) للمتابعة إلى لوحة التحكم."
            : "Enter the 6-digit admin code to continue to the admin panel."}
        </div>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={adminSecurityCode}
          onChange={(e) => {
            setAdminSecurityCode(String(e.target.value || "").replace(/\D/g, "").slice(0, 6));
            if (adminSecurityError) setAdminSecurityError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdminSecuritySubmit();
          }}
          placeholder={lang === "ar" ? "••••••" : "••••••"}
          style={{
            width: "100%",
            borderRadius: 14,
            border: dark ? "1px solid rgba(148,163,184,0.42)" : "1px solid rgba(51,65,85,0.22)",
            background: dark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.95)",
            color: dark ? "#f8fafc" : "#0f172a",
            fontSize: 18,
            letterSpacing: 5,
            textAlign: "center",
            padding: "12px 10px",
            outline: "none",
            fontWeight: 900,
            fontFamily: "'Cairo',sans-serif",
            marginBottom: 8,
          }}
        />

        {!!adminSecurityError && (
          <div style={{ fontSize: 11, color: "#ef4444", textAlign: "center", marginBottom: 8, fontWeight: 800, lineHeight: 1.6, fontFamily: "'Cairo',sans-serif" }}>
            {adminSecurityError}
          </div>
        )}

        <div style={{ fontSize: 10, color: dark ? "rgba(148,163,184,0.9)" : "#475569", textAlign: "center", marginBottom: 12, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? `عدد الأخطاء: ${adminSecurityAttempts}/2` : `Failed attempts: ${adminSecurityAttempts}/2`}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={closeAdminSecurityModal}
            disabled={adminSecurityBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: dark ? "1px solid rgba(148,163,184,0.4)" : "1px solid rgba(51,65,85,0.22)",
              background: dark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.85)",
              color: dark ? "#f8fafc" : "#334155",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: adminSecurityBusy ? 0.7 : 1,
            }}
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleAdminSecuritySubmit}
            disabled={adminSecurityBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#22c55e,#15803d)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: adminSecurityBusy ? 0.75 : 1,
            }}
          >
            {adminSecurityBusy
              ? (lang === "ar" ? "جارٍ التحقق..." : "Checking...")
              : (lang === "ar" ? "دخول" : "Enter")}
          </button>
        </div>
      </div>
    </div>
  
  );
}
