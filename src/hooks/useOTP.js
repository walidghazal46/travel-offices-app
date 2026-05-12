import { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase.config';
import { startNativePhoneSignIn, confirmNativePhoneCodeAndSync } from '../firebase';

export function useOTP() {
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const appVerifierRef = useRef(null);
  const confirmationResultRef = useRef(null);

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  function clearRecaptcha() {
    if (appVerifierRef.current) {
      try {
        appVerifierRef.current.clear();
      } catch (e) {
        console.warn('Unable to clear RecaptchaVerifier', e);
      }
      appVerifierRef.current = null;
    }

    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  function setupRecaptcha() {
    clearRecaptcha();

    appVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        clearRecaptcha();
      },
      'error-callback': () => {
        clearRecaptcha();
      },
    });
  }

  async function sendOTP(phoneNumber) {
    setError('');
    setLoading(true);
    setSuccess('');

    try {
      if (Capacitor.getPlatform() === 'android') {
        const nativeResult = await startNativePhoneSignIn(phoneNumber);
        if (nativeResult?.autoVerified) {
          setOtpSent(true);
          setSuccess('✅ تم التحقق تلقائياً');
          return;
        }

        confirmationResultRef.current = nativeResult;
        setOtpSent(true);
        setSuccess('✅ تم إرسال الكود بنجاح');
        return;
      }

      setupRecaptcha();
      await appVerifierRef.current.render();

      confirmationResultRef.current = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifierRef.current
      );

      setOtpSent(true);
      setSuccess('✅ تم إرسال الكود بنجاح');
    } catch (err) {
      console.error(err);
      clearRecaptcha();

      if (err?.code === 'auth/invalid-phone-number') {
        setError('رقم الهاتف غير صحيح');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('محاولات كثيرة، حاول بعد قليل');
      } else {
        setError('فشل الإرسال، حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP(code) {
    setError('');
    setLoading(true);
    setSuccess('');

    try {
      if (!confirmationResultRef.current) {
        throw new Error('لم يتم إرسال OTP');
      }

      let user;
      if (Capacitor.getPlatform() === 'android') {
        const verificationId = String(confirmationResultRef.current?.verificationId || '').trim();
        if (!verificationId) {
          throw new Error('phone-verification-id-required');
        }
        user = await confirmNativePhoneCodeAndSync(verificationId, code);
      } else {
        const result = await confirmationResultRef.current.confirm(code);
        user = result.user;
      }

      setSuccess('✅ تم التحقق بنجاح');
      return user;
    } catch (err) {
      console.error(err);

      if (err?.code === 'auth/invalid-verification-code') {
        setError('الكود غير صحيح');
      } else {
        setError('فشل التحقق، حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    otpSent,
    loading,
    error,
    success,
    sendOTP,
    verifyOTP,
  };
}
