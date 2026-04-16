import React, { useState } from 'react';
import {
  sendCurrentUserPasswordReset, updateAuthUserProfile,
  updateCurrentUserEmail, sendCurrentUserPhoneUpdateCode,
  verifyCurrentUserPhoneUpdateCode, upsertAuthUserProfileInFirebase,
  updateUserProfileStatusInFirebase,
} from '../../firebase';

export default function AccountPanel({
  lang, dark, dir, styles, t,
  accountPanelOpen, authPreviewUser, userProfile,
  accountPanelMode, setAccountPanelMode,
  accountEditName, setAccountEditName,
  accountEditEmail, setAccountEditEmail,
  accountEditPhone, setAccountEditPhone,
  accountEditOtp, setAccountEditOtp,
  accountEditStep, setAccountEditStep,
  accountEditLoading, setAccountEditLoading,
  accountEditError, setAccountEditError,
  accountEditMsg, setAccountEditMsg,
  handleAccountBackAction, closeAccountPanel,
  isCompactPhone, coinBalance, onSignOut,
}) {
  if (!(accountPanelOpen && authPreviewUser)) return null;
  return (

    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.78)", backdropFilter: "blur(10px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 356,
          borderRadius: 24,
          padding: isCompactPhone ? "16px 14px 14px" : "20px 18px 18px",
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          border: "1px solid rgba(212,175,55,0.34)",
          boxShadow: "0 24px 80px rgba(7, 15, 35, 0.6), 0 0 0 1px rgba(212,175,55,0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          onClick={handleAccountBackAction}
          style={{
            position: "absolute",
            top: 12,
            right: dir === "rtl" ? "auto" : 12,
            left: dir === "rtl" ? 12 : "auto",
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5d77b",
            borderRadius: 10,
            padding: "6px 10px",
            fontFamily: "'Cairo',sans-serif",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "رجوع" : "Back"}
        </button>
        <button
          onClick={closeAccountPanel}
          style={{
            position: "absolute",
            top: 12,
            right: dir === "rtl" ? 12 : "auto",
            left: dir === "rtl" ? "auto" : 12,
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5d77b",
            borderRadius: 10,
            padding: "6px 10px",
            fontFamily: "'Cairo',sans-serif",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "إغلاق" : "Close"}
        </button>

        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <img
            src={logo}
            alt="Trusted Offices"
            style={{
              width: isCompactPhone ? 58 : 68,
              height: isCompactPhone ? 58 : 68,
              objectFit: "contain",
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.38))",
              marginBottom: 6,
            }}
          />
          <div style={{ color: "#e7c55b", fontSize: isCompactPhone ? 20 : 23, fontWeight: 900, lineHeight: 1.1, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "الحساب" : "Account"}
          </div>
          <div style={{ color: "rgba(245,215,123,0.92)", fontSize: 11, fontWeight: 700, marginTop: 3, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "إدارة بياناتك وتسجيل الخروج بأمان" : "Manage your profile and sign out safely"}
          </div>
        </div>

        <div style={{ marginTop: 10, borderRadius: 16, border: "1px solid rgba(212,175,55,0.45)", background: "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(245,215,123,0.08))", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🪙</span>
            <div>
              <div style={{ color: "#f5d77b", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "رصيد الكوينز" : "Coins Balance"}
              </div>
              <div style={{ color: "rgba(245,215,123,0.88)", fontSize: 10, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "يمكنك استخدامه في طرق الدفع المتاحة" : "Can be used in available payment options"}
              </div>
            </div>
          </div>
          <div style={{ color: "#fde68a", fontSize: 18, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
            {Number(accountCoins) || 0}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {[
            {
              icon: "✨",
              value: accountProfileName,
              setter: setAccountProfileName,
              placeholder: lang === "ar" ? "الاسم الكامل" : "Full name",
            },
            {
              icon: "📧",
              value: accountProfileEmail,
              setter: setAccountProfileEmail,
              placeholder: lang === "ar" ? "البريد الإلكتروني" : "Email address",
            },
            {
              icon: "📱",
              value: accountProfilePhone,
              setter: setAccountProfilePhone,
              placeholder: lang === "ar" ? "رقم الجوال" : "Phone number",
            },
          ].map((field) => (
            <div
              key={field.placeholder}
              style={{
                borderRadius: 18,
                border: "1.5px solid rgba(212,175,55,0.65)",
                background: "rgba(255,255,255,0.03)",
                minHeight: 48,
                width: "100%",
                position: "relative",
                padding: dir === "rtl" ? "0 46px 0 15px" : "0 15px 0 46px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>{field.icon}</span>
              <input
                value={field.icon === "📱"
                  ? ensurePhoneInputWithPlus(field.value)
                  : field.value}
                onChange={(e) => field.setter(
                  field.icon === "📱"
                    ? ensurePhoneInputWithPlus(e.target.value)
                    : e.target.value
                )}
                placeholder={field.icon === "📱" ? accountPhonePlaceholder : field.placeholder}
                style={{
                  width: "100%",
                  height: 46,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f8fafc",
                  fontFamily: "'Cairo',sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: field.icon === "📱" ? "left" : (dir === "rtl" ? "right" : "left"),
                  direction: field.icon === "📱" ? "ltr" : dir,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", fontSize: 10, lineHeight: 1.75, fontWeight: 700, fontFamily: "'Cairo',sans-serif", textAlign: dir === "rtl" ? "right" : "left" }}>
          {lang === "ar"
            ? "تغيير البريد يرسل رابط تأكيد إلى البريد الجديد، وتغيير رقم الجوال يحتاج رمز تحقق مستقل لحماية الحساب."
            : "Changing the email sends a confirmation link to the new address, and changing the phone number requires a separate verification code to protect the account."}
        </div>

        {accountPhoneVerificationId && (
          <div style={{ marginTop: 12, borderRadius: 16, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "12px 10px" }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.78)", fontSize: 11, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
              {lang === "ar"
                ? `أدخل رمز التحقق المرسل إلى ${accountPhonePendingNumber || accountProfilePhone}.`
                : `Enter the verification code sent to ${accountPhonePendingNumber || accountProfilePhone}.`}
            </div>
            <div style={{ display: "flex", gap: 8, direction: "ltr", justifyContent: "center" }}>
              {accountPhoneOtp.map((digit, index) => (
                <input
                  key={index}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => {
                    const rawValue = String(e.target.value || "");
                    const nextDigit = rawValue.slice(-1);
                    setAccountPhoneOtp((prev) => {
                      const next = [...prev];
                      next[index] = nextDigit;
                      return next;
                    });
                    if (nextDigit && e.target.nextElementSibling instanceof HTMLInputElement) {
                      e.target.nextElementSibling.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !accountPhoneOtp[index] && e.target.previousElementSibling instanceof HTMLInputElement) {
                      e.target.previousElementSibling.focus();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: 38,
                    height: 44,
                    borderRadius: 12,
                    border: "1.5px solid rgba(212,175,55,0.62)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#f8fafc",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontSize: 17,
                    fontWeight: 900,
                    outline: "none",
                    fontFamily: "'Cairo',sans-serif",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <button
                onClick={handleAccountPhoneVerify}
                disabled={accountPhoneBusy}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #e7c55b, #c99a23)",
                  color: "#11244f",
                  fontSize: 12,
                  fontWeight: 900,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                  opacity: accountPhoneBusy ? 0.72 : 1,
                }}
              >
                {accountPhoneBusy
                  ? (lang === "ar" ? "جارٍ التحقق..." : "Verifying...")
                  : (lang === "ar" ? "تأكيد رقم الجوال الجديد" : "Confirm new phone number")}
              </button>
            </div>
          </div>
        )}

        {!!accountProfileError && (
          <div style={{ marginTop: 12, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 12, padding: "9px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {accountProfileError}
          </div>
        )}

        {!!accountProfileSuccess && (
          <div style={{ marginTop: 12, color: "#dcfce7", background: "rgba(20,83,45,0.24)", border: "1px solid rgba(74,222,128,0.28)", borderRadius: 12, padding: "9px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {accountProfileSuccess}
          </div>
        )}

        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          <button
            onClick={handleAccountPhoneSendCode}
            disabled={accountPhoneBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.28)",
              background: "rgba(255,255,255,0.05)",
              color: "#f5d77b",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountPhoneBusy ? 0.72 : 1,
            }}
          >
            {accountPhoneBusy
              ? (lang === "ar" ? "جارٍ إرسال الرمز..." : "Sending code...")
              : accountPhoneVerificationId
                ? (lang === "ar" ? "إعادة إرسال رمز الجوال" : "Resend phone code")
                : (authPreviewUser?.phoneNumber
                    ? (lang === "ar" ? "تغيير رقم الجوال" : "Change phone number")
                    : (lang === "ar" ? "إضافة رقم جوال" : "Add phone number"))}
          </button>

          <button
            onClick={handleAccountProfileSave}
            disabled={accountProfileBusy}
            style={{
              width: "100%",
              padding: "11px 13px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #e7c55b, #c99a23)",
              color: "#11244f",
              fontSize: 13,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountProfileBusy ? 0.72 : 1,
              boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
            }}
          >
            {accountProfileBusy
              ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...")
              : (lang === "ar" ? "حفظ الاسم والبريد" : "Save name and email")}
          </button>

          <button
            onClick={handleAccountPasswordReset}
            disabled={accountProfileBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.28)",
              background: "rgba(255,255,255,0.05)",
              color: "#f5d77b",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountProfileBusy ? 0.72 : 1,
            }}
          >
            {lang === "ar" ? "إرسال رابط تغيير كلمة المرور" : "Send password reset link"}
          </button>

          <button
            onClick={() => setAccountDeleteConfirm((prev) => !prev)}
            disabled={accountProfileBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(248,113,113,0.28)",
              background: "rgba(127,29,29,0.18)",
              color: "#fecaca",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountProfileBusy ? 0.72 : 1,
            }}
          >
            {lang === "ar" ? "حذف الحساب" : "Delete account"}
          </button>
        </div>

        {accountDeleteConfirm && (
          <div
            onClick={() => !accountProfileBusy && setAccountDeleteConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 1500,
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 360,
                borderRadius: 22,
                border: "1px solid rgba(248,113,113,0.58)",
                background: dark
                  ? "linear-gradient(180deg, rgba(127,29,29,0.94) 0%, rgba(69,10,10,0.96) 100%)"
                  : "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)",
                boxShadow: "0 0 0 1px rgba(239,68,68,0.24), 0 0 28px rgba(239,68,68,0.52), 0 22px 56px rgba(0,0,0,0.30)",
                padding: "18px 16px 14px",
              }}
            >
              <div style={{ fontSize: 34, textAlign: "center", marginBottom: 8 }}>⚠️</div>
              <div style={{ color: dark ? "#fee2e2" : "#991b1b", fontSize: 16, fontWeight: 900, textAlign: "center", fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
                {lang === "ar" ? "تحذير حذف الحساب" : "Account Deletion Warning"}
              </div>
              <div style={{ color: dark ? "rgba(254,226,226,0.94)" : "#7f1d1d", fontSize: 12, lineHeight: 1.9, textAlign: "center", fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 14 }}>
                {lang === "ar"
                  ? "سيتم تسجيل طلب حذف الحساب فورًا وإخراجك إلى شاشة تسجيل الدخول. يمكنك استرجاع الحساب خلال 30 يوم عبر الدعم."
                  : "Your deletion request will be applied immediately and you will be returned to sign in. Account recovery is available for 30 days via support."}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  onClick={() => setAccountDeleteConfirm(false)}
                  disabled={accountProfileBusy}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(148,163,184,0.3)",
                    background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.86)",
                    color: dark ? "#fff" : "#334155",
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    opacity: accountProfileBusy ? 0.72 : 1,
                  }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAccountDelete}
                  disabled={accountProfileBusy}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444, #991b1b)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    boxShadow: "0 0 18px rgba(239,68,68,0.52)",
                    opacity: accountProfileBusy ? 0.72 : 1,
                  }}
                >
                  {accountProfileBusy
                    ? (lang === "ar" ? "جارٍ التنفيذ..." : "Processing...")
                    : (lang === "ar" ? "تأكيد الحذف" : "Confirm delete")}
                </button>
              </div>
            </div>
          </div>
        )}
        <div
          id="account-phone-recaptcha-container"
          style={{ width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none", position: "absolute" }}
        />
      </div>
    </div>
  
  );
}
