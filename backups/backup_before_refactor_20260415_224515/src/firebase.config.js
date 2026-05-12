import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDr4xrvIrZw3FOd4cMpjVZ-d7E0g1q_3Oo",
  authDomain: "travel-offices-90c53.firebaseapp.com",
  projectId: "travel-offices-90c53",
  storageBucket: "travel-offices-90c53.appspot.com",
  messagingSenderId: "376340221289",
  appId: "1:376340221289:web:d19ce800c4bd64428041f8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
