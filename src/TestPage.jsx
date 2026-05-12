import React from 'react';
import PhoneAuth from './components/PhoneAuth';

export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>اختبار Phone Auth</h1>
      <p>هذه الصفحة لاختبار تدفق OTP مع reCAPTCHA</p>
      <PhoneAuth />
    </div>
  );
}