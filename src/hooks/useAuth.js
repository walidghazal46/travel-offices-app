import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  subscribeToAuthState,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signInWithGooglePopup,
  signOutCurrentUser,
  sendResetEmail,
  sendPhoneVerificationCode,
  verifyPhoneVerificationCode,
  startNativePhoneSignIn,
  confirmNativePhoneCodeAndSync,
  syncNativeAuthToWebSdk,
  upsertAuthUserProfileInFirebase,
  fetchUserProfileFromFirebase,
  getCurrentAuthUser,
  updateAuthUserProfile,
  updateCurrentUserEmail,
  sendCurrentUserPasswordReset,
  sendCurrentUserPhoneUpdateCode,
  verifyCurrentUserPhoneUpdateCode,
  updateUserProfileStatusInFirebase,
  deleteAuthUserByAdminInFirebase
} from '../firebase';
import { Capacitor } from '@capacitor/core';

const PRIMARY_ADMIN_EMAIL = "walidghazal46@gmail.com";
const ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL];
const DISABLED_ADMIN_EMAILS = ["walidghazal51@yahoo.com"];

export const useAuth = (lang = 'ar', selectedCountry = 'مصر', selectedNationality = '') => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [adminRole, setAdminRole] = useState('user');
  const [accountCoins, setAccountCoins] = useState(0);

  // UI State for Auth Preview Modal
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // login, signup, forgot, otp
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdminEmail = useCallback((email) =>
    ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase()), []);

  const shapeUser = useCallback((firebaseUser) => firebaseUser ? {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || "",
    phoneNumber: firebaseUser.phoneNumber || "",
    email: firebaseUser.email || "",
  } : null, []);

  // Initial Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(shapeUser(firebaseUser));
      setIsReady(true);
    });
    return () => unsubscribe();
  }, [shapeUser]);

  // Profile Sync & Validation
  useEffect(() => {
    if (!isReady || !user?.uid) return;

    let cancelled = false;

    (async () => {
      try {
        const normalizedEmail = String(user.email || "").trim().toLowerCase();
        const baseProfilePayload = {
          uid: user.uid,
          email: user.email,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          country: selectedCountry,
          nationality: selectedNationality,
          providerId: user.phoneNumber ? "phone" : (user.email ? "email" : "unknown"),
        };

        await upsertAuthUserProfileInFirebase({
          ...baseProfilePayload,
          ...(isAdminEmail(normalizedEmail) ? { role: "admin" } : {}),
        });

        const profileSnapshot = await fetchUserProfileFromFirebase(user.uid);
        if (cancelled || !profileSnapshot) return;

        const profileStatus = String(profileSnapshot.status || "active").trim().toLowerCase();
        const profileRole = String(profileSnapshot.role || "user").trim().toLowerCase();
        const profileCoins = Number(profileSnapshot?.requestCredits?.coins) || 0;

        setAccountCoins(profileCoins);
        setAdminRole(profileRole);

        if (DISABLED_ADMIN_EMAILS.includes(normalizedEmail) && profileRole !== "user") {
          await upsertAuthUserProfileInFirebase({ ...baseProfilePayload, role: "user" });
          setAdminRole("user");
        }

        if (profileStatus === "blocked") {
          await signOutCurrentUser();
          setAdminRole("user");
          setMode("login");
          setIsOpen(true);
          // Note: App-level modal trigger might be needed here
        }
      } catch (err) {
        console.error("Auth profile sync error:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [isReady, user, selectedCountry, selectedNationality, isAdminEmail]);

  const login = useCallback(async (email, password) => {
    setBusy(true);
    setError('');
    try {
      await signInWithEmailPassword(email, password);
      setIsOpen(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutCurrentUser();
      setGuestMode(false);
      setAdminRole('user');
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  const isAdmin = useMemo(() => adminRole === 'admin' || adminRole === 'admin_delegate', [adminRole]);
  const isPrimaryAdmin = useMemo(() => user?.email === PRIMARY_ADMIN_EMAIL, [user]);

  return {
    user,
    isReady,
    guestMode,
    setGuestMode,
    adminRole,
    isAdmin,
    isPrimaryAdmin,
    accountCoins,
    authModal: {
      isOpen,
      setIsOpen,
      mode,
      setMode,
      busy,
      setBusy,
      error,
      setError,
      success,
      setSuccess
    },
    actions: {
      login,
      logout,
      // Add more actions as needed
    }
  };
};
