import React from 'react';
import { saveAddedOfficeInFirebase, saveOfficeOverrideInFirebase, deleteAddedOfficeInFirebase } from '../../firebase';

export default function AdminAddOfficeModal({
  lang, dark, dir, styles, t,
  adminAddOfficeOpen, isAdminUser,
  adminAddOfficeForm, setAdminAddOfficeForm,
  adminAddOfficeMode, setAdminAddOfficeMode,
  adminAddOfficeError, setAdminAddOfficeError,
  adminAddOfficeBusy, setAdminAddOfficeBusy,
  onSaveOffice, onCloseModal,
  isCompactPhone,
}) {
  if (!(adminAddOfficeOpen && isAdminUser)) return null;
  return (

    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.72)", backdropFilter: "blur(8px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 22,
          padding: "18px 14px 14px",
          background: dark
            ? "linear-gradient(180deg, rgba(16,84,53,0.95) 0%, rgba(6,78,59,0.95) 100%)"
            : "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)",
          border: "1px solid rgba(34,197,94,0.48)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.34), 0 0 22px rgba(34,197,94,0.22)",
        }}
      >
        <div style={{ fontSize: 30, textAlign: "center", marginBottom: 8 }}>➕</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: dark ? "#d1fae5" : "#065f46", textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? "إضافة مكتب جديد" : "Add New Office"}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={adminAddOfficeDraft.name}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={lang === "ar" ? "اسم المكتب" : "Office name"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" }}
          />
          <input
            value={adminAddOfficeDraft.license}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, license: String(e.target.value || "").replace(/[^0-9]/g, "") }))}
            placeholder={lang === "ar" ? "رقم الترخيص" : "License number"}
            inputMode="numeric"
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" }}
          />
          <textarea
            rows={2}
            value={adminAddOfficeDraft.address}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, address: e.target.value }))}
            placeholder={lang === "ar" ? "العنوان" : "Address"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", resize: "vertical", fontFamily: "'Cairo',sans-serif" }}
          />
          <select
            value={adminAddOfficeDraft.gov}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, gov: e.target.value }))}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" }}
          >
            {egyptGovernorates.map((govItem) => (
              <option key={govItem.name} value={govItem.name}>{govItem.name}</option>
            ))}
          </select>
        </div>

        {!!adminAddOfficeError && (
          <div style={{ marginTop: 8, color: "#fecaca", background: "rgba(127,29,29,0.20)", border: "1px solid rgba(248,113,113,0.34)", borderRadius: 10, padding: "6px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {adminAddOfficeError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <button
            onClick={() => {
              setAdminAddOfficeOpen(false);
              setAdminAddOfficeError("");
            }}
            style={{ width: "100%", padding: "10px", borderRadius: 12, border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(71,85,105,0.28)", background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.90)", color: dark ? "#fff" : "#334155", fontSize: 12, fontWeight: 800, fontFamily: "'Cairo',sans-serif", cursor: "pointer" }}
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={saveAdminAddedOffice}
            style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: "pointer" }}
          >
            {lang === "ar" ? "حفظ المكتب" : "Save Office"}
          </button>
        </div>
      </div>
    </div>
  );
}
