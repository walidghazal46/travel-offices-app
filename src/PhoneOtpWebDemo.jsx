import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  sendPhoneVerificationCode,
  verifyPhoneVerificationCode,
} from "./firebase";
import RecaptchaService from "./recaptcha.service";

export default function PhoneOtpWebDemo() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const confirmationRef = useRef(null);

  const recaptchaContainerId = "recaptcha-container";

  const clearRecaptcha = useCallback(() => {
    RecaptchaService.reset();
  }, []);

  useEffect(() => {
    return () => {
      RecaptchaService.destroy();
    };
  }, []);

  const handleSendCode = useCallback(async () => {
    console.log('Starting handleSendCode');

    const normalized = String(phoneNumber || "").trim();
    if (!normalized.startsWith("+") || normalized.length < 8) {
      setStatus("اكتب رقم الجوال بصيغة دولية مثل +20...");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      console.log('Clearing recaptcha...');
      // تنظيف reCAPTCHA قبل كل محاولة
      clearRecaptcha();

      console.log('Initializing verifier...');
      // انتظار تهيئة verifier
      const verifier = await RecaptchaService.init(recaptchaContainerId, { size: "invisible" });

      console.log('Rendering recaptcha...');
      await RecaptchaService.render();

      console.log('Sending phone verification code...');
      const confirmation = await sendPhoneVerificationCode(normalized, verifier);
      confirmationRef.current = confirmation;
      setStatus("تم إرسال الكود. أدخله ثم اضغط تأكيد.");
    } catch (error) {
      console.error("Web phone send failed", error);
      setStatus(`فشل إرسال الكود: ${String(error?.code || error?.message || error)}`);
      clearRecaptcha();
    } finally {
      setBusy(false);
    }
  }, [clearRecaptcha, phoneNumber]);

  const handleVerifyCode = useCallback(async () => {
    const code = String(otpCode || "").trim();
    if (!confirmationRef.current) {
      setStatus("اطلب الكود أولاً.");
      return;
    }
    if (code.length < 4) {
      setStatus("اكتب كود صحيح.");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const user = await verifyPhoneVerificationCode(confirmationRef.current, code);
      setStatus(`تم تسجيل الدخول. UID: ${user?.uid || ""}`);
      clearRecaptcha();
      confirmationRef.current = null;
    } catch (error) {
      console.error("Web phone verify failed", error);
      setStatus(`فشل التحقق: ${String(error?.code || error?.message || error)}`);
    } finally {
      setBusy(false);
    }
  }, [clearRecaptcha, otpCode]);

  return (
    <div style={{ maxWidth: 420, margin: "24px auto", padding: 16, fontFamily: "sans-serif" }}>
      <h3 style={{ margin: "0 0 10px" }}>OTP Demo (Web)</h3>

      <input
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+20xxxxxxxxxx"
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}
      />

      <div id={recaptchaContainerId} style={{ marginTop: 10 }} />

      <button
        onClick={handleSendCode}
        disabled={busy}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          border: "none",
          background: "#2563eb",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        إرسال الكود
      </button>

      <input
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        placeholder="OTP"
        style={{
          width: "100%",
          padding: 10,
          marginTop: 12,
          borderRadius: 10,
          border: "1px solid #cbd5e1",
        }}
      />

      <button
        onClick={handleVerifyCode}
        disabled={busy}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          border: "none",
          background: "#16a34a",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        تأكيد الكود
      </button>

      {!!status && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
          {status}
        </div>
      )}
    </div>
  );
}

