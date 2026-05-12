import { useState } from 'react';
import { useOTP } from '../hooks/useOTP';

export default function PhoneAuth() {
  const [phone, setPhone] = useState('+');
  const [code, setCode] = useState('');
  const { otpSent, loading, error, success, sendOTP, verifyOTP } = useOTP();

  function normalizePhoneInput(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return `+${digits}`;
  }

  async function handleSendOTP() {
    if (!phone) return;
    await sendOTP(normalizePhoneInput(phone));
  }

  async function handleVerify() {
    if (!code) return;
    const user = await verifyOTP(code);
    if (user) {
      console.log('User logged in:', user);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto', padding: 16, fontFamily: 'sans-serif' }}>
      <div id="recaptcha-container" />

      {!otpSent ? (
        <div>
          <input
            type="tel"
            placeholder="+ كود الدولة ثم الرقم"
            value={phone}
            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', direction: 'ltr', textAlign: 'left' }}
          />
          <button
            onClick={handleSendOTP}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              border: 'none',
              background: '#2563eb',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الكود'}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="أدخل الكود المرسل"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', marginTop: 12 }}
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              border: 'none',
              background: '#16a34a',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'جاري التحقق...' : 'تأكيد'}
          </button>
          <button
            onClick={handleSendOTP}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              border: 'none',
              background: '#f59e0b',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            إعادة إرسال الكود
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: 12 }}>{success}</p>}
    </div>
  );
}
