import React, { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  signInWithEmailPassword, signUpWithEmailPassword, signInWithGooglePopup,
  sendResetEmail, createAccountPhoneRecaptcha, createPhoneRecaptcha,
  verifyPhoneVerificationCode, startNativePhoneSignIn,
  confirmNativePhoneCodeAndSync, syncNativeAuthToWebSdk,
  consumeGoogleRedirectResult, fetchUserProfileFromFirebase,
  upsertAuthUserProfileInFirebase,
} from '../../firebase';

export default function AuthPreview({
  lang, dark, dir, styles, t,
  authPreviewOpen, authPreviewUser, guestMode,
  authPreviewMode, setAuthPreviewMode,
  authPreviewName, setAuthPreviewName,
  authPreviewIdentifier, setAuthPreviewIdentifier,
  authPreviewPassword, setAuthPreviewPassword,
  authPreviewPhone, setAuthPreviewPhone,
  authPreviewOtp, setAuthPreviewOtp,
  authPreviewStep, setAuthPreviewStep,
  authPreviewLoading, setAuthPreviewLoading,
  authPreviewError, setAuthPreviewError,
  authPreviewMsg, setAuthPreviewMsg,
  authPreviewOtpSent, setAuthPreviewOtpSent,
  recaptchaContainerRef,
  onAuthSuccess, closeAuthPreview,
  isCompactPhone,
}) {
  if (!(authPreviewOpen || (!authPreviewUser && !guestMode))) return null;
  return (

    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.84)", backdropFilter: "blur(8px)", alignItems: "center", overflow: "hidden", padding: 12 }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          position: "relative",
          margin: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
      <div
        style={{
          width: "min(100%, 408px)",
          maxWidth: "calc(100vw - 22px)",
          margin: "0 auto",
          borderRadius: 34,
          padding: authPreviewMode === "signup"
            ? (isCompactPhone ? "6px 14px 4px" : "9px 20px 6px")
            : (isCompactPhone ? "10px 14px 8px" : "14px 20px 10px"),
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          border: "1px solid rgba(212,175,55,0.34)",
          boxShadow: "0 24px 80px rgba(7, 15, 35, 0.6), 0 0 0 1px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {!!authPreviewUser && (
          <button
            onClick={closeAuthPreview}
            style={{
              position: "absolute",
              top: 14,
              right: dir === "rtl" ? "auto" : 14,
              left: dir === "rtl" ? 14 : "auto",
              border: "1px solid rgba(212,175,55,0.32)",
              background: "rgba(255,255,255,0.06)",
              color: "#f5d77b",
              borderRadius: 12,
              padding: "7px 12px",
              fontFamily: "'Cairo',sans-serif",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "إغلاق" : "Close"}
          </button>
        )}

        {authPreviewMode === "signup" && (
          <button
            type="button"
            onClick={() => {
              clearAuthPreviewFeedback();
              setAuthPreviewMode("login");
            }}
            style={{
              position: "absolute",
              top: 14,
              left: dir === "rtl" ? "auto" : 14,
              right: dir === "rtl" ? 14 : "auto",
              border: "1px solid rgba(212,175,55,0.32)",
              background: "rgba(255,255,255,0.06)",
              color: "#f5d77b",
              borderRadius: 12,
              padding: "7px 12px",
              fontFamily: "'Cairo',sans-serif",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "رجوع" : "Back"}
          </button>
        )}

        <div style={{ textAlign: "center", paddingTop: 0, paddingBottom: authPreviewMode === "signup" ? 1 : 2 }}>
          <img
            src={logo}
            alt="Trusted Offices"
            style={{
              width: authPreviewMode === "login"
                ? (isCompactPhone ? 124 : 152)
                : (isCompactPhone ? 86 : 106),
              height: authPreviewMode === "login"
                ? (isCompactPhone ? 124 : 152)
                : (isCompactPhone ? 86 : 106),
              objectFit: "contain",
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.38))",
              marginBottom: 2,
            }}
          />
          <div style={{ color: "#e7c55b", fontSize: isCompactPhone ? 22 : 26, fontWeight: 900, lineHeight: 1.05, fontFamily: "'Cairo',sans-serif" }}>
            {authPreviewMode === "login"
              ? (lang === "ar" ? "تسجيل الدخول" : "Login")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "إنشاء حساب" : "Create Account")
                : authPreviewMode === "otp"
                  ? (lang === "ar" ? "رمز التحقق" : "Verification Code")
                  : (lang === "ar" ? "استعادة الحساب" : "Recover Account")}
          </div>
          <div style={{ color: "rgba(245,215,123,0.92)", fontSize: 13, fontWeight: 700, marginTop: 1, letterSpacing: 0.2 }}>
            {authPreviewMode === "login"
              ? (lang === "ar" ? "مرحبًا" : "Welcome")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "انضم إلينا" : "Join Us")
                : authPreviewMode === "otp"
                  ? (lang === "ar" ? "أدخل الكود المرسل" : "Enter the sent code")
                  : (lang === "ar" ? "سنرسل لك رابط أو رمز الاستعادة" : "We will send a recovery link or code")}
          </div>
          {!!authPreviewUser && (
            <div style={{ marginTop: 10, color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? `متصل حاليًا: ${authPreviewUser.displayName || authPreviewUser.phoneNumber || authPreviewUser.email || authPreviewUser.uid}`
                : `Signed in as: ${authPreviewUser.displayName || authPreviewUser.phoneNumber || authPreviewUser.email || authPreviewUser.uid}`}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {authPreviewMode === "signup" && (
            <div style={authFieldShellStyle}>
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>✨</span>
              <input
                value={authPreviewName}
                onChange={(e) => setAuthPreviewName(e.target.value)}
                placeholder={lang === "ar" ? "الاسم الكامل" : "Full name"}
                style={authFieldInputStyle}
              />
            </div>
          )}
          {authPreviewMode !== "otp" && (
            <>
              <div style={authFieldShellStyle}>
                <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>👤</span>
                <input
                  value={authPreviewIdentifier}
                  onChange={(e) => setAuthPreviewIdentifier(e.target.value)}
                  placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email address"}
                  type="text"
                  inputMode="text"
                  style={{ ...authFieldInputStyle, direction: authPreviewIdentifier.includes("@") ? "ltr" : authPreviewIdentifier.startsWith("+") || /^[0-9]/.test(authPreviewIdentifier) ? "ltr" : "rtl", textAlign: authPreviewIdentifier.includes("@") || authPreviewIdentifier.startsWith("+") || /^[0-9]/.test(authPreviewIdentifier) ? "left" : "right" }}
                />
              </div>


              {authPreviewMode !== "forgot" && (
              <div style={authFieldShellStyle}>
                <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>🔒</span>
                <input
                  type="password"
                  value={authPreviewPassword}
                  onChange={(e) => setAuthPreviewPassword(e.target.value)}
                  placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
                  style={authFieldInputStyle}
                />
              </div>
              )}
            </>
          )}

          {authPreviewMode === "signup" && (
            <div style={authFieldShellStyle}>
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>🛡️</span>
              <input
                type="password"
                value={authPreviewConfirmPassword}
                onChange={(e) => setAuthPreviewConfirmPassword(e.target.value)}
                placeholder={lang === "ar" ? "تأكيد كلمة المرور" : "Confirm password"}
                style={authFieldInputStyle}
              />
            </div>
          )}

          {authPreviewMode === "otp" && (
            <>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.78)", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar"
                  ? "أرسلنا رمز تحقق مكوّن من 6 أرقام إلى بريدك الإلكتروني."
                  : "We sent a 6-digit verification code to your email."}
              </div>
              <div style={{ display: "flex", gap: 8, direction: "ltr", justifyContent: "center" }}>
                {authPreviewOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { authPreviewOtpRefs.current[index] = el; }}
                    value={digit}
                    maxLength={1}
                    inputMode="numeric"
                    type="tel"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...authPreviewOtp];
                      next[index] = val;
                      setAuthPreviewOtp(next);
                      if (val && index < 5) {
                        authPreviewOtpRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        authPreviewOtpRefs.current[index - 1]?.focus();
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      maxWidth: 44,
                      height: 52,
                      borderRadius: 16,
                      border: "1.5px solid rgba(212,175,55,0.65)",
                      background: "rgba(255,255,255,0.03)",
                      color: "#f8fafc",
                      boxSizing: "border-box",
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 900,
                      outline: "none",
                      fontFamily: "'Cairo',sans-serif",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <div
                onClick={() => {
                  if (authPreviewOtpResendTimer > 0) return;
                  const phone = authPreviewPhoneFlow?.phoneNumber;
                  if (!phone) return;
                  setAuthPreviewError("");
                  setAuthPreviewSuccess("");
                  setAuthPreviewOtpResendTimer(30);
                  clearInterval(authPreviewOtpResendIntervalRef.current);
                  authPreviewOtpResendIntervalRef.current = setInterval(() => {
                    setAuthPreviewOtpResendTimer((v) => {
                      if (v <= 1) { clearInterval(authPreviewOtpResendIntervalRef.current); return 0; }
                      return v - 1;
                    });
                  }, 1000);

                  const isNativePhoneFlow = !!authPreviewPhoneFlow?.native;
                  const resendPromise = isNativePhoneFlow
                    ? startNativePhoneSignIn(phone, { timeout: 60, resendCode: true })
                    : getAuthPreviewRecaptcha()
                      .then((verifier) => sendPhoneVerificationCode(phone, verifier));

                  resendPromise
                    .then((result) => {
                      if (isNativePhoneFlow) {
                        if (result?.verificationId) {
                          setAuthPreviewPhoneFlow((prev) => ({ ...prev, verificationId: result.verificationId }));
                        }
                      } else if (result) {
                        authPhoneConfirmationRef.current = result;
                      }
                      setAuthPreviewOtp(["", "", "", "", "", ""]);
                      authPreviewOtpRefs.current[0]?.focus();
                      setAuthPreviewSuccess(
                        lang === "ar"
                          ? "تم إرسال رمز تحقق جديد."
                          : "A new verification code has been sent."
                      );
                    })
                    .catch((error) => {
                      const errorCode = String(error?.code || error?.message || "").toLowerCase();
                      if (
                        errorCode.includes("blocked all requests")
                        || errorCode.includes("blocked all requests for this device")
                        || errorCode.includes("device-request-limit-exceeded")
                      ) {
                        setAuthPreviewError(
                          lang === "ar"
                            ? "تم حظر التحقق برقم الهاتف مؤقتًا على هذا الجهاز. يمكنك المحاولة برقم الهاتف مرة أخرى بعد 24 ساعة، ويمكنك تسجيل الدخول الآن باستخدام البريد الإلكتروني."
                            : "Phone verification is temporarily blocked on this device. You can try phone sign-in again after 24 hours, and you can sign in now using your email."
                        );
                      } else if (errorCode.includes("too-many-requests") || errorCode.includes("quota-exceeded")) {
                        setAuthPreviewError(
                          lang === "ar"
                            ? "تم تجاوز عدد محاولات الإرسال مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى."
                            : "Too many resend attempts were made. Please wait and try again."
                        );
                      } else {
                        setAuthPreviewError(
                          lang === "ar"
                            ? "تعذر إعادة إرسال الرمز الآن. حاول مرة أخرى بعد قليل."
                            : "Unable to resend the code right now. Please try again shortly."
                        );
                      }
                    });
                }}
                style={{ textAlign: "center", color: authPreviewOtpResendTimer > 0 ? "rgba(245,215,123,0.45)" : "rgba(245,215,123,0.88)", fontSize: 12, fontWeight: 700, cursor: authPreviewOtpResendTimer > 0 ? "default" : "pointer" }}
              >
                {authPreviewOtpResendTimer > 0
                  ? (lang === "ar" ? `إعادة الإرسال خلال ${authPreviewOtpResendTimer}ث` : `Resend in ${authPreviewOtpResendTimer}s`)
                  : (lang === "ar" ? "إعادة إرسال الرمز" : "Resend code")}
              </div>
            </>
          )}
        </div>

        {!!authPreviewError && (
          <div style={{ marginTop: 14, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 14, padding: "10px 12px", textAlign: "center", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {authPreviewError}
          </div>
        )}

        {!!authPreviewSuccess && (
          <div style={{ marginTop: 14, color: "#dcfce7", background: "rgba(20,83,45,0.24)", border: "1px solid rgba(74,222,128,0.28)", borderRadius: 14, padding: "10px 12px", textAlign: "center", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {authPreviewSuccess}
          </div>
        )}

        {authPreviewMode === "login" && (
          <div
            onClick={() => {
              clearAuthPreviewFeedback();
              setAuthPreviewMode("forgot");
            }}
            style={{ marginTop: 10, color: "rgba(245,215,123,0.88)", fontSize: 13, fontWeight: 700, textAlign: dir === "rtl" ? "right" : "left", cursor: "pointer" }}
          >
            {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </div>
        )}

        {authPreviewMode === "login" ? (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={handleAuthPreviewPrimaryAction}
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #e7c55b, #c99a23)",
                color: "#11244f",
                fontSize: 16,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
                cursor: "pointer",
                boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
                opacity: authPreviewBusy ? 0.72 : 1,
              }}
              disabled={authPreviewBusy}
            >
              {authPreviewBusy ? (lang === "ar" ? "جارٍ المتابعة..." : "Please wait...") : (lang === "ar" ? "دخول" : "Login")}
            </button>

            <button
              type="button"
              onClick={handleAuthPreviewGuestMode}
              style={{
                width: "100%",
                padding: "14px 10px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #e7c55b, #c99a23)",
                color: "#11244f",
                fontSize: 14,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
                cursor: "pointer",
                boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
                opacity: authPreviewBusy ? 0.72 : 1,
              }}
              disabled={authPreviewBusy}
            >
              {lang === "ar" ? "دخول كضيف" : "Guest Login"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAuthPreviewPrimaryAction}
            style={{
              width: "100%",
              marginTop: 18,
              padding: "14px 20px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #e7c55b, #c99a23)",
              color: "#11244f",
              fontSize: 18,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
              opacity: authPreviewBusy ? 0.72 : 1,
            }}
            disabled={authPreviewBusy}
          >
            {authPreviewBusy
              ? (lang === "ar" ? "جارٍ المتابعة..." : "Please wait...")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "إنشاء الحساب" : "Create Account")
                : authPreviewMode === "otp"
                  ? (lang === "ar" ? "تأكيد الرمز" : "Verify Code")
                  : (lang === "ar" ? "إرسال رمز الاستعادة" : "Send Recovery Code")}
          </button>
        )}

        {authPreviewMode !== "otp" && authPreviewMode !== "forgot" && (
          <>
            <div style={{ marginTop: 18, textAlign: "center", color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 700 }}>
              {authPreviewMode === "login"
                ? (lang === "ar" ? "أو الدخول عبر" : "Or continue with")
                : (lang === "ar" ? "أو التسجيل عبر" : "Or sign up with")}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              <button
                type="button"
                onClick={handleAuthPreviewGoogle}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(212,175,55,0.62)",
                  background: "rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
                  opacity: authPreviewBusy ? 0.72 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                disabled={authPreviewBusy}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3.4 14.8 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.8S6.8 21.2 12 21.2c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12Z"/>
                  <path fill="#34A853" d="M3.7 7.2l3.2 2.4C7.7 8 9.7 6.6 12 6.6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3.4 14.8 2.4 12 2.4c-3.7 0-6.9 2.1-8.3 4.8Z"/>
                  <path fill="#FBBC05" d="M12 21.2c2.7 0 5-.9 6.6-2.5l-3.1-2.5c-.8.6-1.9 1-3.5 1-4 0-5.2-2.6-5.5-3.9l-3.2 2.5c1.4 2.8 4.4 5.4 8.7 5.4Z"/>
                  <path fill="#4285F4" d="M21.1 13.9c0-.5 0-.9-.1-1.3H12v3.9h5.5c-.3 1.2-1.1 2.1-2 2.7l3.1 2.5c1.8-1.7 2.5-4.2 2.5-7.8Z"/>
                </svg>
              </button>
            </div>

          </>
        )}

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              clearAuthPreviewFeedback();
              setAuthPreviewOtp(["", "", "", "", "", ""]);
              setAuthPreviewMode((prev) => (prev === "login" ? "signup" : prev === "signup" ? "login" : "login"));
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "rgba(245,215,123,0.92)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              textAlign: dir === "rtl" ? "right" : "left",
              padding: 0,
            }}
          >
            {authPreviewMode === "login"
              ? (lang === "ar" ? "ليس لديك حساب؟ إنشاء حساب" : "No account? Create one")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Already have an account? Login")
                : (lang === "ar" ? "العودة إلى شاشة الدخول" : "Back to login")}
          </button>
          <div
            style={{
              display: "inline-grid",
              gap: 6,
              flexShrink: 0,
              transform: "translateY(-24px)",
            }}
          >
            {[
              { key: "ar", label: "ع" },
              { key: "en", label: "E" },
            ].map((option) => {
              const active = lang === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setLang(option.key)}
                  style={{
                    width: 42,
                    height: 34,
                    borderRadius: 12,
                    border: active ? "1px solid rgba(231,197,91,0.58)" : "1px solid rgba(212,175,55,0.24)",
                    background: active
                      ? "linear-gradient(180deg, rgba(25,55,117,0.98), rgba(11,31,74,0.98))"
                      : "linear-gradient(180deg, rgba(18,43,99,0.92), rgba(11,31,74,0.92))",
                    color: active ? "#f5d77b" : "rgba(245,215,123,0.78)",
                    fontSize: 14,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 0 18px rgba(231,197,91,0.18), inset 0 1px 0 rgba(255,255,255,0.08)"
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        {authPreviewMode !== "otp" && (
          <div style={{ marginTop: -2, width: "min(100%, 270px)", marginInline: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                lang === "ar"
                  ? "مرحبًا، أواجه مشكلة في تسجيل الدخول داخل تطبيق مكاتب السفريات الموثوقة."
                  : "Hello, I am facing a login issue in the Trusted Travel Offices app."
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "100%",
                height: isCompactPhone ? 36 : 37,
                borderRadius: 12,
                border: "1px solid rgba(37,211,102,0.45)",
                background: "linear-gradient(135deg, rgba(16,99,53,0.44), rgba(20,150,71,0.34))",
                color: "#eafff1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none",
                padding: "0 10px",
                boxSizing: "border-box",
                boxShadow: "0 0 12px rgba(37,211,102,0.22)",
                fontSize: 12,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              <span>{lang === "ar" ? "مشاكل التسجيل" : "Login issues"}</span>
              <span style={{ fontSize: 15, lineHeight: 1 }}>☏</span>
            </a>

            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              style={{
                width: "100%",
                height: isCompactPhone ? 36 : 37,
                borderRadius: 12,
                border: "1px solid rgba(248,113,113,0.55)",
                background: "linear-gradient(135deg, rgba(239,68,68,0.32), rgba(127,29,29,0.34))",
                color: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(239,68,68,0.28)",
                fontSize: 13,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
                whiteSpace: "nowrap",
              }}
              aria-label={lang === "ar" ? "خروج من التطبيق" : "Exit app"}
            >
              <span style={{ display: "inline-block", lineHeight: 1, color: "#fee2e2" }}>{lang === "ar" ? "خروج" : "Exit"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <line x1="12" y1="3" x2="12" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div id="auth-phone-recaptcha" style={{ width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }} />
      </div>
      </div>
    </div>
  );
}
