import { getApp, getApps, initializeApp } from "firebase/app";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getRedirectResult,
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateEmail,
  updatePhoneNumber,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  getFirestore,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDr4xrvIrZw3FOd4cMpjVZ-d7E0g1q_3Oo",
  authDomain: "travel-offices-90c53.firebaseapp.com",
  projectId: "travel-offices-90c53",
  storageBucket: "travel-offices-90c53.appspot.com",
  messagingSenderId: "376340221289",
  appId: "1:376340221289:web:d19ce800c4bd64428041f8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firestoreDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

export const firebaseAuth = getAuth(app);
export const CREATE_ORDER_FUNCTION_URL = "https://us-central1-travel-offices-90c53.cloudfunctions.net/createOrder";
export const UPLOAD_ORDER_RECEIPT_FUNCTION_URL = "https://us-central1-travel-offices-90c53.cloudfunctions.net/uploadOrderReceipt";
export const EXCHANGE_CUSTOM_TOKEN_URL = "https://us-central1-travel-offices-90c53.cloudfunctions.net/exchangeIdTokenForCustomToken";
export const DELETE_AUTH_USER_BY_ADMIN_FUNCTION_URL = "https://us-central1-travel-offices-90c53.cloudfunctions.net/deleteAuthUserByAdmin";
const DEVICE_ID_STORAGE_KEY = "travel-offices-device-id";
let cachedClientDeviceId = "";
let cachedDeviceIdentityPlugin = null;
let cachedGoogleProvider = null;
const currentUserPhoneConfirmationResults = new Map();

function removeUndefined(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((value) => value !== undefined);
  }
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, removeUndefined(value)])
  );
}

async function withRetry(fn, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`Firebase attempt ${attempt} failed, retrying in ${delayMs * attempt}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error("retry-failed");
}

function sanitizeFileName(name = "receipt") {
  return String(name)
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function shouldUseFunctionReceiptUpload() {
  if (Capacitor.getPlatform() !== "web") return false;
  try {
    const host = String(window?.location?.hostname || "").toLowerCase();
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

async function uploadReceiptViaFunction(file, orderSerial) {
  const dataUrl = await readFileAsDataUrl(file);
  const response = await withRetry(async () => fetch(UPLOAD_ORDER_RECEIPT_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderSerial,
      fileName: file.name || "receipt",
      contentType: file.type || "application/octet-stream",
      base64Data: dataUrl,
    }),
  }));

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok || !responsePayload?.ok) {
    const nextError = new Error(
      responsePayload?.message ||
      responsePayload?.error ||
      `upload-receipt-http-${response.status}`
    );
    nextError.code = responsePayload?.error || `http-${response.status}`;
    nextError.status = response.status;
    nextError.details = responsePayload || null;
    throw nextError;
  }

  return {
    path: responsePayload.path,
    url: responsePayload.url,
    name: responsePayload.name,
    type: responsePayload.type,
    size: responsePayload.size,
  };
}

function createFallbackDeviceId() {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getClientDeviceId() {
  if (cachedClientDeviceId) return cachedClientDeviceId;

  if (Capacitor.getPlatform() === "android") {
    try {
      if (!cachedDeviceIdentityPlugin) {
        cachedDeviceIdentityPlugin = registerPlugin("DeviceIdentity");
      }
      const result = await cachedDeviceIdentityPlugin.getDeviceId();
      const nativeDeviceId = String(result?.deviceId || "").trim();
      if (nativeDeviceId) {
        cachedClientDeviceId = nativeDeviceId;
        return nativeDeviceId;
      }
    } catch (error) {
      console.warn("Native device id unavailable, using local fallback", error);
    }
  }

  try {
    const existingDeviceId = String(localStorage.getItem(DEVICE_ID_STORAGE_KEY) || "").trim();
    if (existingDeviceId) {
      cachedClientDeviceId = existingDeviceId;
      return existingDeviceId;
    }
    const fallbackDeviceId = createFallbackDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallbackDeviceId);
    cachedClientDeviceId = fallbackDeviceId;
    return fallbackDeviceId;
  } catch (error) {
    console.warn("Local device id storage unavailable, using memory fallback", error);
    const fallbackDeviceId = createFallbackDeviceId();
    cachedClientDeviceId = fallbackDeviceId;
    return fallbackDeviceId;
  }
}

export async function uploadReceiptToFirebase(file, orderSerial) {
  if (!file) return null;
  const cleanName = sanitizeFileName(file.name || "receipt");
  if (shouldUseFunctionReceiptUpload()) {
    try {
      return await uploadReceiptViaFunction(file, orderSerial);
    } catch (error) {
      console.warn("Receipt upload function unavailable on localhost, deferring receipt upload", error);
      return {
        path: "",
        url: "",
        name: file.name || cleanName,
        type: file.type || "",
        size: file.size || 0,
        deferred: true,
        errorCode: String(error?.code || error?.message || "receipt-upload-deferred-localhost"),
      };
    }
  }
  try {
    const storageRef = ref(firebaseStorage, `order-receipts/${orderSerial}/${Date.now()}-${cleanName}`);
    await withRetry(async () => {
      await uploadBytes(storageRef, file, {
        contentType: file.type || "application/octet-stream",
      });
    }, 2, 500);
    const downloadUrl = await getDownloadURL(storageRef);
    return {
      path: storageRef.fullPath,
      url: downloadUrl,
      name: file.name || cleanName,
      type: file.type || "",
      size: file.size || 0,
    };
  } catch (error) {
    if (Capacitor.getPlatform() === "web") {
      console.warn("Direct Firebase Storage upload failed, retrying via function", error);
      try {
        return await uploadReceiptViaFunction(file, orderSerial);
      } catch (fallbackError) {
        if (shouldUseFunctionReceiptUpload()) {
          console.warn("Receipt upload still blocked on localhost, deferring upload", fallbackError);
          return {
            path: "",
            url: "",
            name: file.name || cleanName,
            type: file.type || "",
            size: file.size || 0,
            deferred: true,
            errorCode: String(fallbackError?.code || fallbackError?.message || "receipt-upload-deferred-localhost"),
          };
        }
        throw fallbackError;
      }
    }
    throw error;
  }
}

export async function saveOrderToFirebase(orderData) {
  const cleanData = removeUndefined(orderData);
  const payload = {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await withRetry(async () => addDoc(collection(firestoreDb, "orders"), payload));
  return docRef.id;
}

export async function createOrderViaFirebaseFunction(orderData) {
  const cleanData = removeUndefined(orderData);
  if (!cleanData.deviceId) {
    cleanData.deviceId = await getClientDeviceId();
  }
  const response = await withRetry(async () => fetch(CREATE_ORDER_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: cleanData }),
  }));

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok) {
    const nextError = new Error(
      responsePayload?.message ||
      responsePayload?.error ||
      `create-order-http-${response.status}`
    );
    nextError.code = responsePayload?.error || `http-${response.status}`;
    nextError.status = response.status;
    nextError.details = responsePayload || null;
    throw nextError;
  }

  const result = responsePayload;
  if (!result?.firebaseId) {
    throw new Error("create-order-missing-firebase-id");
  }
  return result.firebaseId;
}

export async function updateOrderInFirebase(firebaseId, updates) {
  if (!firebaseId) return;
  const cleanUpdates = removeUndefined(updates);
  await withRetry(async () => updateDoc(doc(firestoreDb, "orders", firebaseId), {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  }));
}

export async function deleteOrderInFirebase(firebaseId) {
  const cleanOrderId = String(firebaseId || "").trim();
  if (!cleanOrderId) {
    throw new Error("order-id-required");
  }

  await withRetry(async () => deleteDoc(doc(firestoreDb, "orders", cleanOrderId)));
}

export async function saveOfficeReviewToFirebase(reviewData) {
  const payload = {
    ...removeUndefined(reviewData),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await withRetry(async () => addDoc(collection(firestoreDb, "office_reviews"), payload));
  return docRef.id;
}

export async function fetchOfficeReviewsFromFirebase() {
  const snapshot = await withRetry(async () =>
    getDocs(query(collection(firestoreDb, "office_reviews"), orderBy("createdAt", "desc")))
  );

  return snapshot.docs.map((reviewDoc) => ({
    id: reviewDoc.id,
    ...reviewDoc.data(),
  }));
}

export async function updateOfficeReviewInFirebase(reviewId, updates = {}) {
  const cleanReviewId = String(reviewId || "").trim();
  if (!cleanReviewId) {
    throw new Error("office-review-id-required");
  }

  const payload = removeUndefined({
    ...updates,
    updatedAt: serverTimestamp(),
  });

  await withRetry(async () =>
    updateDoc(doc(firestoreDb, "office_reviews", cleanReviewId), payload)
  );
}

export async function deleteOfficeReviewFromFirebase(reviewId) {
  const cleanReviewId = String(reviewId || "").trim();
  if (!cleanReviewId) {
    throw new Error("office-review-id-required");
  }

  await withRetry(async () =>
    deleteDoc(doc(firestoreDb, "office_reviews", cleanReviewId))
  );
}

function normalizeOfficeCustomizationPayload(payload = {}) {
  return removeUndefined({
    officeId: Number(payload?.officeId) || Number(payload?.id) || 0,
    name: String(payload?.name || "").trim(),
    license: Number(payload?.license) || 0,
    address: String(payload?.address || "").trim(),
    gov: String(payload?.gov || "").trim(),
    phone: String(payload?.phone || "").trim(),
    entryType: String(payload?.entryType || "override").trim() || "override",
    updatedAt: serverTimestamp(),
  });
}

export async function fetchOfficeCustomizationsFromFirebase() {
  const snapshot = await withRetry(async () =>
    getDocs(collection(firestoreDb, "office_customizations"))
  );

  const overrides = {};
  const added = [];

  snapshot.docs.forEach((entryDoc) => {
    const data = entryDoc.data() || {};
    const officeId = Number(data?.officeId || 0);
    if (!officeId) return;
    const normalized = {
      id: officeId,
      name: String(data?.name || "").trim(),
      license: Number(data?.license) || 0,
      address: String(data?.address || "").trim(),
      gov: String(data?.gov || "").trim(),
      phone: String(data?.phone || "").trim(),
    };
    const entryType = String(data?.entryType || "override").trim().toLowerCase();
    if (entryType === "added") {
      added.push(normalized);
      return;
    }
    overrides[String(officeId)] = removeUndefined({
      name: normalized.name,
      license: normalized.license,
      address: normalized.address,
      gov: normalized.gov,
      phone: normalized.phone,
    });
  });

  return { overrides, added };
}

export async function saveOfficeOverrideInFirebase(officePayload = {}) {
  const normalized = normalizeOfficeCustomizationPayload({
    ...officePayload,
    entryType: "override",
  });
  const cleanOfficeId = Number(normalized.officeId || 0);
  if (!cleanOfficeId) {
    throw new Error("office-id-required");
  }
  await withRetry(async () =>
    setDoc(
      doc(firestoreDb, "office_customizations", `override-${cleanOfficeId}`),
      normalized,
      { merge: true }
    )
  );
}

export async function saveAddedOfficeInFirebase(officePayload = {}) {
  const normalized = normalizeOfficeCustomizationPayload({
    ...officePayload,
    entryType: "added",
  });
  const cleanOfficeId = Number(normalized.officeId || 0);
  if (!cleanOfficeId) {
    throw new Error("office-id-required");
  }
  await withRetry(async () =>
    setDoc(
      doc(firestoreDb, "office_customizations", `added-${cleanOfficeId}`),
      normalized,
      { merge: true }
    )
  );
}

export async function deleteAddedOfficeInFirebase(officeId) {
  const cleanOfficeId = Number(officeId || 0);
  if (!cleanOfficeId) {
    throw new Error("office-id-required");
  }
  await withRetry(async () =>
    deleteDoc(doc(firestoreDb, "office_customizations", `added-${cleanOfficeId}`))
  );
}

export async function fetchReviewedServiceOrdersFromFirebase() {
  const snapshot = await withRetry(async () =>
    getDocs(query(collection(firestoreDb, "orders"), where("reviewed", "==", true)))
  );

  return snapshot.docs.map((orderDoc) => ({
    id: orderDoc.id,
    ...orderDoc.data(),
  }));
}

export async function fetchServiceReviewsFromFirebase() {
  const snapshot = await withRetry(async () =>
    getDocs(query(collection(firestoreDb, "service_reviews"), orderBy("createdAt", "desc")))
  );

  return snapshot.docs.map((reviewDoc) => ({
    id: reviewDoc.id,
    ...reviewDoc.data(),
  }));
}

export async function fetchServiceOrdersFromFirebase() {
  const snapshot = await withRetry(async () =>
    getDocs(collection(firestoreDb, "orders"))
  );

  return snapshot.docs.map((orderDoc) => ({
    id: orderDoc.id,
    ...orderDoc.data(),
  }));
}

export async function saveServiceReviewToFirebase(reviewData) {
  const payload = {
    ...removeUndefined(reviewData),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await withRetry(async () => addDoc(collection(firestoreDb, "service_reviews"), payload));
  return docRef.id;
}

const CV_PACKAGE_STATS_DEFAULTS = {
  requestsCount: 0,
  reviewsCount: 0,
  ratingsTotal: 0,
  averageRating: 0,
};

function normalizeCvPackageStats(rawStats = {}) {
  return {
    requestsCount: Number(rawStats?.requestsCount) || 0,
    reviewsCount: Number(rawStats?.reviewsCount) || 0,
    ratingsTotal: Number(rawStats?.ratingsTotal) || 0,
    averageRating: Number(rawStats?.averageRating) || 0,
  };
}

export async function fetchCvPackageStatsFromFirebase() {
  const packageKeys = ["builder", "premium", "elite"];
  const entries = await Promise.all(
    packageKeys.map(async (packageKey) => {
      const snapshot = await withRetry(async () =>
        getDoc(doc(firestoreDb, "cv_package_stats", packageKey))
      );
      return [
        packageKey,
        snapshot.exists()
          ? normalizeCvPackageStats(snapshot.data())
          : { ...CV_PACKAGE_STATS_DEFAULTS },
      ];
    })
  );

  return Object.fromEntries(entries);
}

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

async function enforceUserNotBlocked(user) {
  const uid = String(user?.uid || "").trim();
  if (!uid) return user;

  const snapshot = await withRetry(async () => getDoc(doc(firestoreDb, "users", uid)));
  if (!snapshot.exists()) return user;

  const profile = snapshot.data() || {};
  const status = String(profile?.status || "active").trim().toLowerCase();
  if (status === "blocked") {
    await signOut(firebaseAuth);
    const error = new Error("account-blocked");
    error.code = "account-blocked";
    throw error;
  }

  return user;
}

export async function signInWithEmailPassword(email, password) {
  const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return enforceUserNotBlocked(result.user);
}

export async function signUpWithEmailPassword({ email, password, fullName = "" }) {
  const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (fullName.trim()) {
    await updateProfile(result.user, { displayName: fullName.trim() });
  }
  return result.user;
}

export async function sendResetEmail(email) {
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function signInWithGooglePopup() {
  if (!cachedGoogleProvider) {
    cachedGoogleProvider = new GoogleAuthProvider();
    cachedGoogleProvider.addScope("email");
    cachedGoogleProvider.addScope("profile");
  }

  if (Capacitor.getPlatform() === "android") {
    let lastNativeError = null;
    const nativeModes = [false, true];

    for (const useCredentialManager of nativeModes) {
      try {
        const nativeResult = await FirebaseAuthentication.signInWithGoogle({
          skipNativeAuth: true,
          scopes: ["email", "profile"],
          useCredentialManager,
        });
        const nativeIdToken = String(nativeResult?.credential?.idToken || "").trim();
        const nativeAccessToken = String(nativeResult?.credential?.accessToken || "").trim();
        if (!nativeIdToken && !nativeAccessToken) {
          throw new Error("google-native-missing-credential");
        }
        const googleCredential = GoogleAuthProvider.credential(
          nativeIdToken || null,
          nativeAccessToken || null
        );
        const authResult = await signInWithCredential(firebaseAuth, googleCredential);
        return authResult.user;
      } catch (error) {
        lastNativeError = error;
      }
    }

    const nativeError = new Error(
      String(lastNativeError?.message || "google-native-signin-failed")
    );
    nativeError.code = String(lastNativeError?.code || "google-native-signin-failed");
    nativeError.details = {
      nativeMessage: String(lastNativeError?.message || ""),
    };
    throw nativeError;
  }

  try {
    const result = await signInWithPopup(firebaseAuth, cachedGoogleProvider);
    return result.user;
  } catch (error) {
    const code = String(error?.code || "").toLowerCase();
    if (
      code.includes("popup-blocked") ||
      code.includes("cancelled-popup-request") ||
      code.includes("popup-closed-by-user")
    ) {
      await signInWithRedirect(firebaseAuth, cachedGoogleProvider);
      const redirectError = new Error("google-redirect-started");
      redirectError.code = "google-redirect-started";
      throw redirectError;
    }
    throw error;
  }
}

export async function consumeGoogleRedirectResult() {
  if (Capacitor.getPlatform() === "android") {
    return null;
  }

  const result = await getRedirectResult(firebaseAuth);
  if (!result?.user) {
    return null;
  }

  return enforceUserNotBlocked(result.user);
}

export async function signOutCurrentUser() {
  await signOut(firebaseAuth);
}

export async function signInWithFirebaseCustomToken(customToken) {
  const cleanToken = String(customToken || "").trim();
  if (!cleanToken) {
    throw new Error("custom-token-required");
  }
  const result = await signInWithCustomToken(firebaseAuth, cleanToken);
  return result.user;
}

export async function exchangeIdTokenForCustomToken(idToken) {
  const cleanIdToken = String(idToken || "").trim();
  if (!cleanIdToken) {
    throw new Error("id-token-required");
  }
  const response = await withRetry(async () => fetch(EXCHANGE_CUSTOM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: cleanIdToken }),
  }));
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const nextError = new Error(payload?.error || payload?.message || `token-exchange-http-${response.status}`);
    nextError.code = payload?.error || `http-${response.status}`;
    nextError.status = response.status;
    throw nextError;
  }
  const customToken = String(payload?.customToken || "").trim();
  if (!customToken) {
    throw new Error("token-exchange-missing-custom-token");
  }
  return customToken;
}

export async function syncNativeAuthToWebSdk() {
  if (Capacitor.getPlatform() !== "android") {
    throw new Error("native-auth-sync-android-only");
  }

  console.log("=== syncNativeAuthToWebSdk START ===");

  const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true })
    .catch(() => FirebaseAuthentication.getIdToken());

  const idToken = String(tokenResult?.token || "").trim();
  console.log("idToken exists:", !!idToken);

  if (!idToken) {
    throw new Error("native-id-token-missing");
  }

  const customToken = await exchangeIdTokenForCustomToken(idToken);
  console.log("customToken exists:", !!customToken);

  return signInWithFirebaseCustomToken(customToken);
}

export async function startNativePhoneSignIn(phoneNumber, options = {}) {
  if (Capacitor.getPlatform() !== "android") {
    throw new Error("native-phone-android-only");
  }

  const cleanPhone = String(phoneNumber || "").trim();
  if (!cleanPhone.startsWith("+") || cleanPhone.length < 8) {
    throw new Error("invalid-phone-number");
  }

  const timeout = typeof options.timeout === "number" ? options.timeout : 60;
  const resendCode = !!options.resendCode;

  let finished = false;
  const handles = [];

  const cleanup = async () => {
    while (handles.length) {
      const handle = handles.pop();
      try {
        await handle?.remove?.();
      } catch {}
    }
  };

  return new Promise(async (resolve, reject) => {
    try {
      handles.push(await FirebaseAuthentication.addListener("phoneVerificationCompleted", async () => {
        if (finished) return;
        finished = true;
        await cleanup();
        resolve({ autoVerified: true });
      }));

      handles.push(await FirebaseAuthentication.addListener("phoneCodeSent", async (event) => {
        if (finished) return;
        finished = true;
        const verificationId = String(event?.verificationId || "").trim();
        await cleanup();
        if (!verificationId) {
          reject(new Error("native-phone-missing-verification-id"));
          return;
        }
        resolve({ verificationId });
      }));

      handles.push(await FirebaseAuthentication.addListener("phoneVerificationFailed", async (event) => {
        if (finished) return;
        finished = true;
        await cleanup();
        const message = String(event?.message || "phone-verification-failed").trim();
        console.error("phoneVerificationFailed native event:", event);
        const nextError = new Error(message);
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("not allowed") || lowerMsg.includes("operation-not-allowed")) {
          nextError.code = "operation-not-allowed";
        } else if (lowerMsg.includes("quota") || lowerMsg.includes("quota-exceeded")) {
          nextError.code = "quota-exceeded";
        } else if (lowerMsg.includes("too many")) {
          nextError.code = "too-many-requests";
        } else if (lowerMsg.includes("invalid phone") || lowerMsg.includes("invalid-phone")) {
          nextError.code = "invalid-phone-number";
        } else if (lowerMsg.includes("captcha") || lowerMsg.includes("recaptcha")) {
          nextError.code = "captcha-check-failed";
        } else if (lowerMsg.includes("unauthorized") || lowerMsg.includes("app-not-authorized")) {
          nextError.code = "app-not-authorized";
        } else {
          nextError.code = message || "phone-verification-failed";
        }
        reject(nextError);
      }));

      await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: cleanPhone,
        timeout,
        resendCode,
      });
    } catch (error) {
      if (!finished) {
        finished = true;
        await cleanup();
      }
      reject(error);
    }
  });
}

// ✅ الفانكشن المُعدَّلة - تعتمد على Native فقط بدون تعارض مع Web SDK
export async function confirmNativePhoneCodeAndSync(verificationId, verificationCode) {
  if (Capacitor.getPlatform() !== "android") {
    throw new Error("native-phone-android-only");
  }

  const cleanVerificationId = String(verificationId || "").trim();
  const cleanCode = String(verificationCode || "").trim();

  console.log("=== confirmNativePhoneCodeAndSync DEBUG ===");
  console.log("verificationId:", cleanVerificationId);
  console.log("code:", cleanCode);
  console.log("code length:", cleanCode.length);

  if (!cleanVerificationId) throw new Error("phone-verification-id-required");
  if (cleanCode.length < 4) throw new Error("phone-verification-code-required");

  // الخطوة 1: تأكيد الكود عبر Native SDK
  await FirebaseAuthentication.confirmVerificationCode({
    verificationId: cleanVerificationId,
    verificationCode: cleanCode,
  });

  console.log("confirmVerificationCode SUCCESS - now syncing...");

  // الخطوة 2: sync الـ Native session للـ Web SDK
  return syncNativeAuthToWebSdk();
}

export function getCurrentAuthUser() {
  return firebaseAuth.currentUser;
}

export async function updateCurrentUserEmail(nextEmail) {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error("auth-user-required");
  }
  await verifyBeforeUpdateEmail(currentUser, nextEmail);
  return currentUser;
}

export async function sendCurrentUserPasswordReset() {
  const currentUser = firebaseAuth.currentUser;
  const email = String(currentUser?.email || "").trim();
  if (!email) {
    throw new Error("auth-email-required");
  }
  await sendPasswordResetEmail(firebaseAuth, email);
  return email;
}

export async function deleteCurrentAuthUser() {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error("auth-user-required");
  }
  await deleteUser(currentUser);
}

export function createPhoneRecaptcha(containerId, options = {}) {
  return new RecaptchaVerifier(firebaseAuth, containerId, options);
}

export function createAccountPhoneRecaptcha(containerId, options = {}) {
  return new RecaptchaVerifier(firebaseAuth, containerId, options);
}

export async function sendPhoneVerificationCode(phoneNumber, verifier) {
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
}

export async function verifyPhoneVerificationCode(confirmationResult, code) {
  if (!confirmationResult) {
    throw new Error("phone-confirmation-required");
  }
  const result = await confirmationResult.confirm(code);
  return result.user;
}

export async function sendCurrentUserPhoneUpdateCode(phoneNumber, verifier) {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error("auth-user-required");
  }
  const phoneProvider = new PhoneAuthProvider(firebaseAuth);
  const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, verifier);
  currentUserPhoneConfirmationResults.set(verificationId, true);
  return verificationId;
}

export async function verifyCurrentUserPhoneUpdateCode(verificationId, code) {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error("auth-user-required");
  }
  if (!verificationId) {
    throw new Error("phone-verification-id-required");
  }
  if (!currentUserPhoneConfirmationResults.has(verificationId)) {
    throw new Error("phone-confirmation-required");
  }
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const hasLinkedPhoneProvider = Array.isArray(currentUser.providerData)
    && currentUser.providerData.some((entry) => String(entry?.providerId || "").trim() === "phone");

  try {
    if (hasLinkedPhoneProvider) {
      await updatePhoneNumber(currentUser, credential);
      return currentUser;
    }

    const result = await linkWithCredential(currentUser, credential);
    return result.user;
  } finally {
    currentUserPhoneConfirmationResults.delete(verificationId);
  }
}

export async function updateAuthUserProfile(user, profile) {
  if (!user) {
    throw new Error("auth-user-required");
  }
  await updateProfile(user, profile);
  return user;
}

export async function syncCvPackageStatsInFirebase(packageKey, options = {}) {
  if (!packageKey) {
    throw new Error("cv-package-stats-package-key-required");
  }

  const {
    incrementRequest = false,
    rating = null,
    previousRating = null,
  } = options;

  const statsRef = doc(firestoreDb, "cv_package_stats", packageKey);
  const snapshot = await withRetry(async () => getDoc(statsRef));
  const currentStats = snapshot.exists()
    ? normalizeCvPackageStats(snapshot.data())
    : { ...CV_PACKAGE_STATS_DEFAULTS };

  let nextRequestsCount = currentStats.requestsCount + (incrementRequest ? 1 : 0);
  let nextReviewsCount = currentStats.reviewsCount;
  let nextRatingsTotal = currentStats.ratingsTotal;

  const nextRatingValue = Number(rating) || 0;
  const previousRatingValue = Number(previousRating) || 0;

  if (nextRatingValue > 0 && previousRatingValue > 0) {
    nextRatingsTotal = Math.max(0, currentStats.ratingsTotal - previousRatingValue + nextRatingValue);
  } else if (nextRatingValue > 0) {
    nextReviewsCount += 1;
    nextRatingsTotal += nextRatingValue;
  }

  const nextAverageRating = nextReviewsCount > 0
    ? Number((nextRatingsTotal / nextReviewsCount).toFixed(1))
    : 0;

  const nextStats = {
    requestsCount: nextRequestsCount,
    reviewsCount: nextReviewsCount,
    ratingsTotal: nextRatingsTotal,
    averageRating: nextAverageRating,
    updatedAt: serverTimestamp(),
  };

  await withRetry(async () => setDoc(statsRef, nextStats, { merge: true }));

  return normalizeCvPackageStats(nextStats);
}

export async function upsertAuthUserProfileInFirebase(profile = {}) {
  const uid = String(profile?.uid || "").trim();
  if (!uid) {
    throw new Error("auth-user-profile-uid-required");
  }

  const profileRef = doc(firestoreDb, "users", uid);
  const snapshot = await withRetry(async () => getDoc(profileRef));
  const existingData = snapshot.exists() ? snapshot.data() : {};

  const cleanProfile = removeUndefined({
    uid,
    email: String(profile?.email || existingData?.email || "").trim(),
    phoneNumber: String(profile?.phoneNumber || existingData?.phoneNumber || "").trim(),
    displayName: String(profile?.displayName || existingData?.displayName || "").trim(),
    country: String(profile?.country || existingData?.country || "").trim(),
    nationality: String(profile?.nationality || existingData?.nationality || "").trim(),
    providerId: String(profile?.providerId || existingData?.providerId || "").trim(),
    role: String(profile?.role || existingData?.role || "user").trim(),
    status: String(profile?.status || existingData?.status || "active").trim(),
    deletionRequestedAt: profile?.deletionRequestedAt || existingData?.deletionRequestedAt || null,
    deletionGraceUntil: profile?.deletionGraceUntil || existingData?.deletionGraceUntil || null,
    createdAt: existingData?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  await withRetry(async () => setDoc(profileRef, cleanProfile, { merge: true }));
  return cleanProfile;
}

export async function fetchUserProfilesFromFirebase() {
  let snapshot;
  try {
    snapshot = await withRetry(async () =>
      getDocs(query(collection(firestoreDb, "users"), orderBy("lastLoginAt", "desc")))
    );
  } catch (orderErr) {
    console.warn("fetchUserProfiles ordered query failed, retrying without orderBy:", orderErr);
    snapshot = await withRetry(async () =>
      getDocs(collection(firestoreDb, "users"))
    );
  }

  return snapshot.docs.map((userDoc) => ({
    id: userDoc.id,
    ...userDoc.data(),
  }));
}

export async function updateUserProfileStatusInFirebase(uid, status) {
  const cleanUid = String(uid || "").trim();
  if (!cleanUid) {
    throw new Error("auth-user-profile-uid-required");
  }
  await withRetry(async () =>
    setDoc(
      doc(firestoreDb, "users", cleanUid),
      {
        status: String(status || "active").trim() || "active",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  );
}

export async function adjustUserRequestCreditsInFirebase(uid, bucket, delta) {
  const cleanUid = String(uid || "").trim();
  const cleanBucket = String(bucket || "").trim();
  const numericDelta = Number(delta);
  if (!cleanUid) {
    throw new Error("auth-user-profile-uid-required");
  }
  if (!cleanBucket) {
    throw new Error("request-credits-bucket-required");
  }
  if (!Number.isFinite(numericDelta) || numericDelta === 0) {
    throw new Error("request-credits-delta-invalid");
  }

  const profileRef = doc(firestoreDb, "users", cleanUid);
  const snapshot = await withRetry(async () => getDoc(profileRef));
  const existingData = snapshot.exists() ? (snapshot.data() || {}) : {};
  const currentCredits = Number(existingData?.requestCredits?.[cleanBucket]) || 0;
  const nextCredits = Math.max(0, currentCredits + numericDelta);

  await withRetry(async () =>
    setDoc(
      profileRef,
      {
        requestCredits: {
          ...(existingData?.requestCredits || {}),
          [cleanBucket]: nextCredits,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  );

  return nextCredits;
}

export async function deleteUserProfileInFirebase(uid) {
  const cleanUid = String(uid || "").trim();
  if (!cleanUid) {
    throw new Error("auth-user-profile-uid-required");
  }
  await withRetry(async () => deleteDoc(doc(firestoreDb, "users", cleanUid)));
}

export async function deleteAuthUserByAdminInFirebase(uid) {
  const cleanUid = String(uid || "").trim();
  if (!cleanUid) {
    throw new Error("auth-user-profile-uid-required");
  }

  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error("auth-user-required");
  }

  const idToken = await currentUser.getIdToken(true);
  const response = await withRetry(async () => fetch(DELETE_AUTH_USER_BY_ADMIN_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uid: cleanUid }),
  }));

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const nextError = new Error(payload?.error || payload?.message || `admin-delete-http-${response.status}`);
    nextError.code = payload?.error || `http-${response.status}`;
    nextError.status = response.status;
    throw nextError;
  }

  return { ok: true, deletedUid: cleanUid };
}

export async function fetchUserProfileFromFirebase(uid) {
  const cleanUid = String(uid || "").trim();
  if (!cleanUid) return null;
  const snapshot = await withRetry(async () => getDoc(doc(firestoreDb, "users", cleanUid)));
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
