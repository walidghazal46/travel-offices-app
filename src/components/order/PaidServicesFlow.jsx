import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import {
  createOrderViaFirebaseFunction,
  fetchServiceOrdersFromFirebase,
  fetchReviewedServiceOrdersFromFirebase,
  saveOrderToFirebase,
  updateOrderInFirebase,
  deleteOrderInFirebase,
  uploadReceiptToFirebase,
  saveServiceReviewToFirebase,
  fetchUserProfileFromFirebase,
  upsertAuthUserProfileInFirebase,
  grantOfficeReviewCoinsIfEligible,
} from '../../firebase';
import { EGYPT_BANKS_DATA, INTL_BANKS_DATA } from '../../data/paymentData';
import { STATUS_STEPS_AR, STATUS_STEPS_EN, STATUS_STEP_KEYS } from '../../data/orderStatus';
import {
  createInitialStageConfirmations,
  hydratePaidOrder,
  getNextPendingStageIndex,
  MAX_RECEIPT_SIZE_BYTES,
  RECEIPT_UPLOAD_TIMEOUT_MS,
  RECEIPT_UPLOAD_NOTICE_MS,
  withTimeout,
  normalizePaidService,
  isOtherSubServiceValue,
  generateOrderSerial,
  getLocalOrdersFromStorage,
  getRecentOrderCountWithinDays,
  getRequestLimitMessage,
  openOrderEmailDraft,
  sendOrderEmails,
} from '../../utils/orderUtils';
import {
  getServiceReviewBucketKey,
  formatReviewDateValue,
  buildReviewerInitials,
  buildServiceReviewMap,
} from '../../utils/reviewUtils';
import { T } from '../../i18n/translations';
import { NATIONALITY_DIAL_CODES } from '../../constants/index';

const WHATSAPP = "201064463650";

export function PaidBackBtn({ onClick, isAr, t }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:`1px solid ${t.border}`, borderRadius:10, padding:"7px 14px", cursor:"pointer", color:t.gold, fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700, marginBottom:14 }}>
      {isAr ? "›" : "‹"} {isAr ? "رجوع" : "Back"}
    </button>
  );
}

export function PaidSectionHead({ icon, label, t }) {
  return (
    <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:12, display:"flex", alignItems:"center", gap:6, fontFamily:"'Cairo',sans-serif" }}>
      <span>{icon}</span> {label}
    </div>
  );
}

export function PaidFieldWrap({ label: lbl, labelStyle, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <label style={labelStyle}>{lbl}</label>
      {children}
    </div>
  );
}

export function PaidOrderTimeline({ lang, currentStep, t }) {
  const isAr = lang === "ar";
  const steps = isAr ? STATUS_STEPS_AR : STATUS_STEPS_EN;
  return (
    <div style={{ borderRadius:14, padding:14, background:t.cardBg, border:`1px solid ${t.border}`, marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:12 }}>📊 {isAr ? "حالة الطلب" : "Order Status"}</div>
      {steps.map((s, i) => {
        const isDone = i < currentStep; const isActive = i === currentStep;
        return (
          <div key={s.key} style={{ display:"flex", gap:10, marginBottom:4, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", background: isDone?"#22c55e": isActive?t.gold:t.inputBg, border:`2px solid ${isDone?"#22c55e":isActive?t.gold:t.border}`, color: isDone||isActive?"#fff":t.subText }}>
                {isDone ? "✓" : s.icon}
              </div>
              {i < steps.length-1 && <div style={{ width:2, height:22, background: isDone?"#22c55e":t.border }} />}
            </div>
            <div style={{ paddingTop:3 }}>
              <div style={{ fontSize:11, fontWeight: isActive?700:500, color: isDone?"#22c55e": isActive?t.gold:t.subText }}>{s.label}</div>
              {s.duration && <div style={{ fontSize:10, color:t.subText }}>⏱ {s.duration}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export class PaidFlowErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: String(error?.message || "paid-flow-runtime-error"),
    };
  }

  componentDidCatch(error, info) {
    console.error("PaidServicesFlow runtime error", error, info);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const isAr = this.props.lang === "ar";
    return (
      <div dir={isAr ? "rtl" : "ltr"} style={{ borderRadius: 16, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(127,29,29,0.12)", padding: "14px 12px", color: "#fecaca", fontFamily: "'Cairo',sans-serif", textAlign: isAr ? "right" : "left" }}>
        <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>
          {isAr ? "حدث خطأ في شاشة الخدمات المدفوعة" : "Paid services screen crashed"}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.7, marginBottom: 10 }}>
          {isAr
            ? "تم منع الشاشة البيضاء. جرّب إعادة المحاولة الآن."
            : "White screen was prevented. Try retrying now."}
        </div>
        <div style={{ fontSize: 10, opacity: 0.9, marginBottom: 10 }}>{this.state.message}</div>
        <button
          onClick={() => this.setState({ hasError: false, message: "" })}
          style={{ border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: 10, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
        >
          {isAr ? "إعادة المحاولة" : "Retry"}
        </button>
      </div>
    );
  }
}

// ── MAIN PaidServicesFlow ────────────────────────────────────────────────────
export default function PaidServicesFlow({ services, lang, dark, selectedCountry, selectedCity="", selectedNationality="", storageKey="paidOrders", countryOverride=null, onScreenChange=null, backRequestToken=0, isAdminUser=false, canManageServiceReviews=true, isGuestUser=false }) {
  const isAr = lang === "ar";
  const activeCountry = countryOverride || selectedCountry;
  const isEgypt = activeCountry === "مصر";
  const isSaudi = activeCountry === "المملكة العربية السعودية";
  const dir = isAr ? "rtl" : "ltr";
  const banks = isEgypt ? EGYPT_BANKS_DATA : INTL_BANKS_DATA;
  const normalizedServices = useMemo(
    () => (services || []).map((service) => normalizePaidService(service, isAr)),
    [services, isAr]
  );

  const t = dark
    ? { bg:"#0a1628", cardBg:"rgba(255,255,255,0.04)", inputBg:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.1)", text:"#ffffff", subText:"rgba(255,255,255,0.55)", gold:"#d4af37", goldBg:"rgba(212,175,55,0.12)" }
    : { bg:"#f0f4ff", cardBg:"#ffffff", inputBg:"#f5f7ff", border:"rgba(0,0,0,0.09)", text:"#1a2340", subText:"#556080", gold:"#c8960c", goldBg:"rgba(212,175,55,0.1)" };

  const [screen, setScreen] = useState("list");
  const [selectedService, setSelectedService] = useState(null);
  const [existingOrders, setExistingOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]").map(hydratePaidOrder);
    } catch {
      return [];
    }
  });
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:"",
    providedService:"",
    subService:"",
    customService:"",
    phone:"",
    email:"",
    whatsapp:"",
    idNumber:"",
    notes:"",
    country:activeCountry,
    city:selectedCity,
    paymentMethod:"",
    receiptName:"",
    receiptMeta:null,
    receiptFile:null,
  });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingError, setRatingError] = useState(false);
  const [daysPassed, setDaysPassed] = useState(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [firebaseSubmitError, setFirebaseSubmitError] = useState("");
  const [firebaseFallbackTicket, setFirebaseFallbackTicket] = useState(null);
  const [sharedServiceReviews, setSharedServiceReviews] = useState({});
  const [emailFieldError, setEmailFieldError] = useState("");
  const [savedOrderPreview, setSavedOrderPreview] = useState(null);
  const [requestLimitNotice, setRequestLimitNotice] = useState(null);
  const [requestLimitNoticeTitle, setRequestLimitNoticeTitle] = useState("");
  const [submitStage, setSubmitStage] = useState("");
  const [submitStageElapsedMs, setSubmitStageElapsedMs] = useState(0);
  const [orderEmailStatus, setOrderEmailStatus] = useState("idle");
  const [orderEmailRetryBusy, setOrderEmailRetryBusy] = useState(false);
  const [coinsSoonModalOpen, setCoinsSoonModalOpen] = useState(false);
  const [coinsSoonCountdown, setCoinsSoonCountdown] = useState(10);
  const [googlePaySoonModalOpen, setGooglePaySoonModalOpen] = useState(false);
  const [googlePaySoonCountdown, setGooglePaySoonCountdown] = useState(5);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);
  const [phoneFieldError, setPhoneFieldError] = useState("");
  const [whatsappFieldError, setWhatsappFieldError] = useState("");
  const [adminServiceOrders, setAdminServiceOrders] = useState([]);
  const [adminServiceOrdersLoading, setAdminServiceOrdersLoading] = useState(false);
  const [adminServiceOrdersError, setAdminServiceOrdersError] = useState("");
  const [adminServiceBusyOrderId, setAdminServiceBusyOrderId] = useState("");
  const [adminExpandedServiceKey, setAdminExpandedServiceKey] = useState("");
  const [adminExpandedTrackingOrderId, setAdminExpandedTrackingOrderId] = useState("");
  const [adminServiceOrdersView, setAdminServiceOrdersView] = useState(null);
  const [adminSelectedServiceOrderId, setAdminSelectedServiceOrderId] = useState("");
  const lastBackRequestRef = useRef(backRequestToken);

  const saveOrders = (orders) => {
    const normalized = (orders || []).map(hydratePaidOrder);
    setExistingOrders(normalized);
    try {
      localStorage.setItem(storageKey, JSON.stringify(normalized));
    } catch {
    }
  };

  const createFirebaseFallbackTicket = (orderLike) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const serial = `SUP-${y}${m}${d}-${rand}`;
    const safeName = String(orderLike?.name || form?.name || "-").trim() || "-";
    const safeCountry = String(orderLike?.country || form?.country || "-").trim() || "-";
    const safeService = String(orderLike?.providedService || orderLike?.service || selectedService?.label || "-").trim() || "-";
    const msg = isAr
      ? [
          "السلام عليكم",
          "واجهتني مشكلة في تسجيل طلبي ورفع الإيصال.",
          "مرفق إيصال الدفع.",
          `الاسم: ${safeName}`,
          `الدولة: ${safeCountry}`,
          `الخدمة المطلوبة: ${safeService}`,
          `رقم الطلب الخاص: ${serial}`,
        ].join("\n")
      : [
          "Hello,",
          "I faced an issue while submitting my order and uploading the receipt.",
          "Payment receipt is attached.",
          `Name: ${safeName}`,
          `Country: ${safeCountry}`,
          `Requested Service: ${safeService}`,
          `Support Order Number: ${serial}`,
        ].join("\n");

    return {
      serial,
      name: safeName,
      country: safeCountry,
      service: safeService,
      whatsappHref: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
    };
  };

  useEffect(() => {
    try {
      setExistingOrders(JSON.parse(localStorage.getItem(storageKey) || "[]").map(hydratePaidOrder));
    } catch {
      setExistingOrders([]);
    }
    setScreen("list");
    setSelectedService(null);
    setCurrentOrder(null);
    setStep(1);
    setAdminServiceOrdersView(null);
    setAdminSelectedServiceOrderId("");
  }, [storageKey]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, country: activeCountry, city: selectedCity }));
  }, [activeCountry, selectedCity]);

  useEffect(() => {
    if (screen === "status" && currentOrder) {
      const diff = Math.floor((Date.now() - new Date(currentOrder.date).getTime()) / (1000*60*60*24));
      setDaysPassed(diff);
    }
  }, [screen, currentOrder]);

  useEffect(() => {
    let isMounted = true;
    fetchReviewedServiceOrdersFromFirebase()
      .then((orders) => {
        if (!isMounted) return;
        setSharedServiceReviews(buildServiceReviewMap(orders, lang));
      })
      .catch((error) => {
        console.error("Shared service reviews fetch failed", error);
      });
    return () => {
      isMounted = false;
    };
  }, [lang]);

  useEffect(() => {
    if (!isAdminUser) return undefined;
    let isMounted = true;
    setAdminServiceOrdersLoading(true);
    setAdminServiceOrdersError("");
    fetchServiceOrdersFromFirebase()
      .then((orders) => {
        if (!isMounted) return;
        const normalized = (orders || []).map((order) => {
          const firebaseId = String(order?.firebaseId || order?.id || "").trim();
          const createdAtMs = order?.createdAt?.toDate
            ? order.createdAt.toDate().getTime()
            : new Date(order?.createdAt || order?.date || 0).getTime();
          return {
            ...order,
            firebaseId,
            createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
            countryName: String(order?.country || "").trim(),
            serviceKeyNorm: String(order?.serviceKey || "").trim(),
            serviceNameNorm: String(order?.service || order?.providedService || order?.serviceLabel || "").trim(),
            customerName: String(order?.name || order?.fullName || "").trim(),
            orderSerial: String(order?.serial || firebaseId || "").trim(),
            ratingValue: Number(order?.rating) || 0,
            reviewedValue: !!order?.reviewed,
            reviewTextValue: String(order?.reviewText || "").trim(),
          };
        }).sort((a, b) => b.createdAtMs - a.createdAtMs);
        setAdminServiceOrders(normalized);
      })
      .catch((error) => {
        console.error("Admin paid service orders fetch failed", error);
        if (!isMounted) return;
        setAdminServiceOrdersError(
          isAr ? "تعذر تحميل طلبات الخدمات المدفوعة للأدمن." : "Unable to load paid service orders for admin."
        );
      })
      .finally(() => {
        if (isMounted) setAdminServiceOrdersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdminUser, isAr]);

  const card = { borderRadius:16, padding:16, background:t.cardBg, border:`1px solid ${t.border}`, marginBottom:12 };
  const goldGrad = `linear-gradient(135deg,${t.gold},#b8860b)`;
  const btnStyle = (bg, color="#fff") => ({ width:"100%", padding:"13px", borderRadius:12, border:"none", background:bg, color, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", boxShadow:"0 4px 14px rgba(0,0,0,0.12)", transition:"opacity .2s" });
  const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:10, fontSize:13, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontFamily:"'Cairo',sans-serif", outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:11, fontWeight:700, color:t.subText, fontFamily:"'Cairo',sans-serif", marginBottom:4, display:"block" };

  const defaultDialCode = useMemo(() => {
    const code = String(NATIONALITY_DIAL_CODES[String(selectedNationality || "").trim()] || "").trim();
    return code.startsWith("+") ? code : "+";
  }, [selectedNationality]);

  const normalizeNationalDigits = useCallback((rawValue) => {
    const digits = String(rawValue || "").replace(/\D/g, "");
    return digits.startsWith("0") ? digits.slice(1) : digits;
  }, []);

  const splitPhoneWithDial = useCallback((rawValue, dialCode) => {
    const digits = String(rawValue || "").replace(/\D/g, "");
    const dialDigits = String(dialCode || "").replace(/\D/g, "");
    if (!digits) return { national: "" };
    if (dialDigits && digits.startsWith(dialDigits)) {
      return { national: digits.slice(dialDigits.length) };
    }
    if (digits.startsWith("00") && dialDigits && digits.slice(2).startsWith(dialDigits)) {
      return { national: digits.slice(2 + dialDigits.length) };
    }
    return { national: digits };
  }, []);

  const composeInternationalPhone = useCallback((dialCode, nationalRaw) => {
    const dialDigits = String(dialCode || "").replace(/\D/g, "");
    const nationalDigits = normalizeNationalDigits(nationalRaw);
    if (!dialDigits || !nationalDigits) return "";
    return `+${dialDigits}${nationalDigits}`;
  }, [normalizeNationalDigits]);

  const isValidIntlPhone = useCallback((value) => /^\+[1-9]\d{7,14}$/.test(String(value || "").trim()), []);

  const upd = (f,v) => setForm(p=>({...p,[f]:v}));
  const paymentMethodConfig = form.paymentMethod ? banks[form.paymentMethod] : null;
  const currentPrice = selectedService?.price || 10;
  const originalPrice = selectedService?.originalPrice || currentPrice * 2;
  const amountText = `$${currentPrice} USD`;
  const receiptInputId = `${storageKey}-receipt`;
  const selectedServiceReviewStats = selectedService
    ? sharedServiceReviews[getServiceReviewBucketKey(activeCountry, selectedService.key)] || { count: 0, avg: 0, reviews: [] }
    : { count: 0, avg: 0, reviews: [] };
  const isCvPaidFlow = String(storageKey || "").startsWith("cvPaidOrders");
  const limitBucket = isCvPaidFlow ? "cv-paid" : "country-paid";
  const selectedSubServices = selectedService?.subServices || [];
  const requiresSubService = selectedSubServices.length > 0;
  const isOtherSubService = requiresSubService && isOtherSubServiceValue(form.subService, isAr);
  const phoneNationalDigits = splitPhoneWithDial(form.phone, defaultDialCode).national;
  const whatsappNationalDigits = splitPhoneWithDial(form.whatsapp, defaultDialCode).national;

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: composeInternationalPhone(defaultDialCode, splitPhoneWithDial(prev.phone, defaultDialCode).national),
      whatsapp: composeInternationalPhone(defaultDialCode, splitPhoneWithDial(prev.whatsapp, defaultDialCode).national),
    }));
  }, [defaultDialCode, composeInternationalPhone, splitPhoneWithDial]);

  useEffect(() => {
    onScreenChange?.(screen);
  }, [screen, onScreenChange]);

  const resetPaidFlowScrollPosition = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollTargets = [
      document.scrollingElement,
      document.documentElement,
      document.body,
    ].filter(Boolean);

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }

    scrollTargets.forEach((target) => {
      try {
        target.scrollTop = 0;
        target.scrollLeft = 0;
      } catch {
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let timeoutId = null;
    const frameId = window.requestAnimationFrame(() => {
      resetPaidFlowScrollPosition();
      timeoutId = window.setTimeout(() => {
        resetPaidFlowScrollPosition();
      }, 0);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [screen, step, resetPaidFlowScrollPosition]);

  useEffect(() => {
    if (!isSubmittingOrder) {
      setSubmitStageElapsedMs(0);
      return undefined;
    }
    const startedAt = Date.now();
    setSubmitStageElapsedMs(0);
    const timer = setInterval(() => {
      setSubmitStageElapsedMs(Date.now() - startedAt);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isSubmittingOrder, submitStage]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      providedService: selectedService?.label || "",
      subService: "",
      customService: "",
    }));
  }, [selectedService]);

  const resetRequestDraft = useCallback(() => {
    setStep(1);
    setFirebaseSubmitError("");
    setEmailFieldError("");
    setPhoneFieldError("");
    setWhatsappFieldError("");
    setForm({
      name:"",
      providedService:selectedService?.label || "",
      phone:"",
      email:"",
      whatsapp:"",
      idNumber:"",
      notes:"",
      country:activeCountry,
      city:selectedCity,
      paymentMethod:"",
      receiptName:"",
      receiptMeta:null,
      receiptFile:null,
    });
  }, [activeCountry, selectedCity, selectedService?.label]);

  const goToOrdersOverview = useCallback(() => {
    resetRequestDraft();
    setCurrentOrder(null);
    setSavedOrderPreview(null);
    const persistedOrders = getLocalOrdersFromStorage(storageKey).map(hydratePaidOrder);
    if (persistedOrders.length > 0) {
      setExistingOrders(persistedOrders);
      setScreen("previousOrders");
      return;
    }
    setScreen("existingOrNew");
  }, [resetRequestDraft, storageKey]);

  const cancelCurrentPaidRequest = useCallback(() => {
    setCurrentOrder(null);
    resetRequestDraft();
    setScreen("existingOrNew");
  }, [resetRequestDraft]);

  useEffect(() => {
    if (!requestLimitNotice) return undefined;
    const timer = setTimeout(() => {
      setRequestLimitNotice(null);
      setRequestLimitNoticeTitle("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [requestLimitNotice]);

  useEffect(() => {
    if (!coinsSoonModalOpen) return undefined;
    setCoinsSoonCountdown(10);
    const countdownTimer = setInterval(() => {
      setCoinsSoonCountdown((value) => (value > 1 ? value - 1 : 1));
    }, 1000);
    const closeTimer = setTimeout(() => {
      setCoinsSoonModalOpen(false);
    }, 10000);
    return () => {
      clearInterval(countdownTimer);
      clearTimeout(closeTimer);
    };
  }, [coinsSoonModalOpen]);

  useEffect(() => {
    if (!googlePaySoonModalOpen) return undefined;
    setGooglePaySoonCountdown(5);
    const countdownTimer = setInterval(() => {
      setGooglePaySoonCountdown((value) => (value > 1 ? value - 1 : 1));
    }, 1000);
    const closeTimer = setTimeout(() => {
      setGooglePaySoonModalOpen(false);
    }, 5000);
    return () => {
      clearInterval(countdownTimer);
      clearTimeout(closeTimer);
    };
  }, [googlePaySoonModalOpen]);

  const showRequestLimitNotice = useCallback((details = null) => {
    const windowDays = Number(details?.windowDays) || 7;
    setRequestLimitNoticeTitle(isAr ? "تم الوصول إلى حد الطلبات" : "Request limit reached");
    setRequestLimitNotice(getRequestLimitMessage(windowDays, isAr));
  }, [isAr]);

  const serviceOrderMatches = useCallback((order, serviceItem) => {
    const serviceKey = String(serviceItem?.key || "").trim();
    const serviceLabel = String(serviceItem?.label || "").trim().toLowerCase();
    // Exact key match — skip country filter (keys are unique per service)
    if (serviceKey && String(order?.serviceKeyNorm || "") === serviceKey) return true;
    const orderCountry = String(order?.countryName || order?.country || "").trim();
    if (activeCountry && orderCountry && orderCountry !== activeCountry) return false;
    const orderService = String(order?.serviceNameNorm || "").trim().toLowerCase();
    return !!serviceLabel && orderService.includes(serviceLabel);
  }, [activeCountry]);

  const selectedAdminServiceOrders = useMemo(() => {
    if (!adminServiceOrdersView) return [];
    return adminServiceOrders.filter((entry) => serviceOrderMatches(entry, adminServiceOrdersView));
  }, [adminServiceOrders, adminServiceOrdersView, serviceOrderMatches]);

  const selectedAdminServiceOrder = useMemo(() => {
    if (!adminSelectedServiceOrderId) return null;
    return selectedAdminServiceOrders.find((entry) => String(entry.firebaseId || entry.id || "") === adminSelectedServiceOrderId) || null;
  }, [adminSelectedServiceOrderId, selectedAdminServiceOrders]);

  const openAdminServiceOrdersPage = useCallback((serviceItem) => {
    if (!serviceItem) return;
    setAdminServiceOrdersView({
      key: serviceItem.key,
      label: serviceItem.label,
      icon: serviceItem.icon,
      subtitle: serviceItem.subtitle,
    });
    setAdminSelectedServiceOrderId("");
    setScreen("adminServiceOrders");
  }, []);

  const refreshSharedReviewsForUI = useCallback(async () => {
    const reviewed = await fetchReviewedServiceOrdersFromFirebase();
    setSharedServiceReviews(buildServiceReviewMap(reviewed, lang));
  }, [lang]);

  const handleAdminUpdateServiceReview = useCallback(async (orderItem) => {
    if (!canManageServiceReviews) {
      setAdminServiceOrdersError(isAr ? "صلاحية تعديل التقييم متاحة للأدمن الأساسي فقط." : "Editing reviews is available to the primary admin only.");
      return;
    }
    const firebaseId = String(orderItem?.firebaseId || "").trim();
    if (!firebaseId) return;
    const ratingInput = window.prompt(
      isAr ? "أدخل التقييم الجديد من 1 إلى 5" : "Enter new rating from 1 to 5",
      String(orderItem?.ratingValue || 5)
    );
    if (ratingInput === null) return;
    const nextRating = Number(String(ratingInput).replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(nextRating) || nextRating < 1 || nextRating > 5) {
      setAdminServiceOrdersError(isAr ? "التقييم يجب أن يكون من 1 إلى 5." : "Rating must be between 1 and 5.");
      return;
    }
    const nextText = window.prompt(
      isAr ? "اكتب تعليق التقييم (اختياري)" : "Write review text (optional)",
      String(orderItem?.reviewTextValue || "")
    );
    if (nextText === null) return;

    setAdminServiceBusyOrderId(firebaseId);
    setAdminServiceOrdersError("");
    try {
      await updateOrderInFirebase(firebaseId, {
        reviewed: true,
        rating: Math.round(nextRating),
        reviewText: String(nextText || "").trim(),
        reviewSavedAt: new Date().toISOString(),
      });
      setAdminServiceOrders((prev) => prev.map((entry) => (
        String(entry.firebaseId || "") === firebaseId
          ? {
              ...entry,
              reviewedValue: true,
              ratingValue: Math.round(nextRating),
              reviewTextValue: String(nextText || "").trim(),
              rating: Math.round(nextRating),
              reviewText: String(nextText || "").trim(),
              reviewed: true,
            }
          : entry
      )));
      await refreshSharedReviewsForUI();
    } catch (error) {
      console.error("Admin service review update failed", error);
      setAdminServiceOrdersError(isAr ? "تعذر تعديل التقييم الآن." : "Unable to update the review now.");
    } finally {
      setAdminServiceBusyOrderId("");
    }
  }, [canManageServiceReviews, isAr, refreshSharedReviewsForUI]);

  const handleAdminDeleteServiceReview = useCallback(async (orderItem) => {
    if (!canManageServiceReviews) {
      setAdminServiceOrdersError(isAr ? "صلاحية حذف التقييم متاحة للأدمن الأساسي فقط." : "Deleting reviews is available to the primary admin only.");
      return;
    }
    const firebaseId = String(orderItem?.firebaseId || "").trim();
    if (!firebaseId) return;
    const confirmed = window.confirm(
      isAr ? "حذف التقييم من هذا الطلب؟" : "Delete the review from this order?"
    );
    if (!confirmed) return;

    setAdminServiceBusyOrderId(firebaseId);
    setAdminServiceOrdersError("");
    try {
      await updateOrderInFirebase(firebaseId, {
        reviewed: false,
        rating: 0,
        reviewText: "",
        reviewSavedAt: "",
      });
      setAdminServiceOrders((prev) => prev.map((entry) => (
        String(entry.firebaseId || "") === firebaseId
          ? {
              ...entry,
              reviewedValue: false,
              ratingValue: 0,
              reviewTextValue: "",
              rating: 0,
              reviewText: "",
              reviewed: false,
            }
          : entry
      )));
      await refreshSharedReviewsForUI();
    } catch (error) {
      console.error("Admin service review delete failed", error);
      setAdminServiceOrdersError(isAr ? "تعذر حذف التقييم الآن." : "Unable to delete the review now.");
    } finally {
      setAdminServiceBusyOrderId("");
    }
  }, [canManageServiceReviews, isAr, refreshSharedReviewsForUI]);

  const handleAdminDeleteServiceOrder = useCallback(async (orderItem) => {
    const firebaseId = String(orderItem?.firebaseId || orderItem?.id || "").trim();
    if (!firebaseId) {
      setAdminServiceOrdersError(isAr ? "معرّف الطلب غير صالح للحذف." : "Invalid order identifier for deletion.");
      return;
    }

    setDeleteConfirmOrder(orderItem);
  }, [adminSelectedServiceOrderId, currentOrder, isAr]);

  const handleAdminDeleteConfirmed = useCallback(async () => {
    const orderItem = deleteConfirmOrder;
    setDeleteConfirmOrder(null);
    if (!orderItem) return;
    const firebaseId = String(orderItem?.firebaseId || orderItem?.id || "").trim();
    if (!firebaseId) return;

    setAdminServiceBusyOrderId(firebaseId);
    setAdminServiceOrdersError("");
    try {
      await deleteOrderInFirebase(firebaseId);
      setAdminServiceOrders((prev) => prev.filter((entry) => String(entry.firebaseId || entry.id || "") !== firebaseId));
      setExistingOrders((prev) => prev.filter((entry) => String(entry.firebaseId || entry.id || "") !== firebaseId));
      if (adminSelectedServiceOrderId === firebaseId) {
        setAdminSelectedServiceOrderId("");
      }
      if (currentOrder && String(currentOrder.firebaseId || currentOrder.id || "") === firebaseId) {
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error("Admin service order delete failed", error);
      setAdminServiceOrdersError(isAr ? "تعذر حذف الطلب الآن." : "Unable to delete the order now.");
    } finally {
      setAdminServiceBusyOrderId("");
    }
  }, [deleteConfirmOrder, adminSelectedServiceOrderId, currentOrder, isAr]);

  const handleAdminToggleOrderStage = useCallback(async (orderItem, stageKey, stageIndex) => {
    const firebaseId = String(orderItem?.firebaseId || "").trim();
    if (!firebaseId || !stageKey) return;
    const safeOrder = hydratePaidOrder(orderItem || {});
    const currentMap = { ...safeOrder.stageConfirmations };
    const nextValue = !currentMap[stageKey];
    currentMap[stageKey] = nextValue;

    const highestConfirmedIndex = STATUS_STEP_KEYS.reduce((maxIndex, key, idx) => {
      return currentMap[key] ? idx : maxIndex;
    }, 0);

    setAdminServiceBusyOrderId(firebaseId);
    setAdminServiceOrdersError("");
    try {
      await updateOrderInFirebase(firebaseId, {
        stageConfirmations: currentMap,
        statusIndex: highestConfirmedIndex,
      });
      setAdminServiceOrders((prev) => prev.map((entry) => (
        String(entry.firebaseId || "") === firebaseId
          ? {
              ...entry,
              stageConfirmations: currentMap,
              statusIndex: highestConfirmedIndex,
            }
          : entry
      )));
      if (currentOrder && String(currentOrder.firebaseId || "") === firebaseId) {
        setCurrentOrder((prev) => ({
          ...prev,
          stageConfirmations: currentMap,
          statusIndex: highestConfirmedIndex,
        }));
      }
    } catch (error) {
      console.error("Admin stage update failed", error);
      setAdminServiceOrdersError(isAr ? "تعذر تحديث حالة المراحل الآن." : "Unable to update stage status now.");
    } finally {
      setAdminServiceBusyOrderId("");
    }
  }, [currentOrder, isAr]);

  const handleAdminSetOrderStage = useCallback(async (orderItem, targetStageIndex) => {
    const firebaseId = String(orderItem?.firebaseId || "").trim();
    if (!firebaseId || !Number.isInteger(targetStageIndex) || targetStageIndex < 0 || targetStageIndex >= STATUS_STEP_KEYS.length) return;

    const nextStageMap = STATUS_STEP_KEYS.reduce((acc, key, index) => {
      acc[key] = index <= targetStageIndex;
      return acc;
    }, {});

    setAdminServiceBusyOrderId(firebaseId);
    setAdminServiceOrdersError("");
    try {
      await updateOrderInFirebase(firebaseId, {
        stageConfirmations: nextStageMap,
        statusIndex: targetStageIndex,
      });
      setAdminServiceOrders((prev) => prev.map((entry) => (
        String(entry.firebaseId || "") === firebaseId
          ? {
              ...entry,
              stageConfirmations: nextStageMap,
              statusIndex: targetStageIndex,
            }
          : entry
      )));
      if (currentOrder && String(currentOrder.firebaseId || "") === firebaseId) {
        setCurrentOrder((prev) => ({
          ...prev,
          stageConfirmations: nextStageMap,
          statusIndex: targetStageIndex,
        }));
      }
    } catch (error) {
      console.error("Admin exact stage update failed", error);
      setAdminServiceOrdersError(isAr ? "تعذر تحديث متابعة الطلب الآن." : "Unable to update the order tracking now.");
    } finally {
      setAdminServiceBusyOrderId("");
    }
  }, [currentOrder, isAr]);

  const openPaidNewRequest = useCallback(() => {
    if (isGuestUser) {
      setRequestLimitNoticeTitle(isAr ? "تنبيه" : "Notice");
      setRequestLimitNotice(
        isAr
          ? "وضع الضيف يسمح بعرض الخدمات المدفوعة فقط. لتقديم طلب جديد، سجل الدخول بحسابك."
          : "Guest mode allows viewing paid services only. Sign in with your account to create a new request."
      );
      return;
    }

    const recentOrders = isCvPaidFlow
      ? Object.keys(localStorage)
          .filter((key) => key.startsWith("cvPaidOrders-"))
          .flatMap((key) => getLocalOrdersFromStorage(key))
      : getLocalOrdersFromStorage(storageKey);

    const limit = 3;
    const windowDays = 7;
    if (getRecentOrderCountWithinDays(recentOrders, windowDays) >= limit) {
      setRequestLimitNoticeTitle(isAr ? "تم الوصول إلى حد الطلبات" : "Request limit reached");
      setRequestLimitNotice(getRequestLimitMessage(windowDays, isAr));
      return;
    }

    setStep(1);
    setScreen("form");
  }, [isAr, isCvPaidFlow, isGuestUser, storageKey]);

  const handleInternalBack = useCallback(() => {
    setFirebaseSubmitError("");

    if (screen === "paymentInfo") {
      setScreen("form");
      return true;
    }

    if (screen === "form") {
      if (step > 1) {
        setStep((prev) => Math.max(1, prev - 1));
      } else {
        setScreen("existingOrNew");
      }
      return true;
    }

    if (screen === "existingOrNew") {
      setSelectedService(null);
      setScreen("list");
      return true;
    }

    if (screen === "adminServiceOrders") {
      if (adminSelectedServiceOrderId) {
        setAdminSelectedServiceOrderId("");
      } else {
        setAdminServiceOrdersView(null);
        setScreen("list");
      }
      return true;
    }

    if (screen === "previousOrders") {
      setScreen("existingOrNew");
      return true;
    }

    if (screen === "confirm") {
      goToOrdersOverview();
      return true;
    }

    if (screen === "status") {
      goToOrdersOverview();
      return true;
    }

    if (screen === "review") {
      setScreen("status");
      return true;
    }

    if (screen === "reviewLocked") {
      setScreen("status");
      return true;
    }

    if (screen === "success") {
      setCurrentOrder(null);
      setSelectedService(null);
      setScreen("list");
      return true;
    }

    return false;
  }, [screen, step, goToOrdersOverview, adminSelectedServiceOrderId]);

  useEffect(() => {
    if (backRequestToken === lastBackRequestRef.current) return;
    lastBackRequestRef.current = backRequestToken;
    handleInternalBack();
  }, [backRequestToken, handleInternalBack]);

  const syncCurrentOrder = (updater) => {
    if (!currentOrder) return;
    let nextOrder = null;
    const updatedOrders = existingOrders.map((order) => {
      if (order.serial !== currentOrder.serial) return order;
      nextOrder = hydratePaidOrder(typeof updater === "function" ? updater(hydratePaidOrder(order)) : updater);
      return nextOrder;
    });
    if (!nextOrder) return;
    saveOrders(updatedOrders);
    setCurrentOrder(nextOrder);
    if (nextOrder.firebaseId) {
      updateOrderInFirebase(nextOrder.firebaseId, {
        stageConfirmations: nextOrder.stageConfirmations,
        statusIndex: nextOrder.statusIndex,
        reviewed: !!nextOrder.reviewed,
        rating: nextOrder.rating || 0,
        reviewText: nextOrder.reviewText || "",
      }).catch((error) => {
        console.error("Firebase order update failed", error);
      });
    }
  };

  const handlePaymentMethodSelect = (key) => {
    const method = banks[key];
    setFirebaseSubmitError("");
    if (key === "tabbyTamara") {
      setGooglePaySoonModalOpen(true);
      return;
    }
    setForm((prev) => ({ ...prev, paymentMethod:key, receiptName:"", receiptMeta:null, receiptFile:null }));
    if (method?.coinsSoon) {
      setCoinsSoonModalOpen(true);
      return;
    }
    if (method?.disabled) return;
    setScreen("paymentInfo");
  };

  const renderPaymentMethodIcon = (key, bank) => {
    if (key === "coins" || bank?.coinsSoon) {
      return (
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(145deg,#fbbf24,#f59e0b)", border: "1px solid rgba(180,83,9,0.38)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.45), 0 2px 8px rgba(180,83,9,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#7c2d12", fontFamily: "'Cairo',sans-serif", lineHeight: 1 }}>C</span>
        </div>
      );
    }

    return <span style={{ fontSize:18, width:22, textAlign:"center" }}>{bank.icon}</span>;
  };

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFirebaseSubmitError(
        isAr
          ? "تعذر قراءة ملف الإيصال. جرّب اختيار صورة أخرى أو ملف PDF."
          : "Could not read the receipt file. Please choose another image or PDF."
      );
      return;
    }
    setFirebaseSubmitError("");
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setForm((prev) => ({
        ...prev,
        receiptName: "",
        receiptMeta: null,
        receiptFile: null,
      }));
      setFirebaseSubmitError(
        isAr
          ? "حجم إيصال التحويل يجب ألا يزيد عن 2 ميجابايت."
          : "The transfer receipt must not be larger than 2 MB."
      );
      event.target.value = "";
      return;
    }
    const safeName = file.name && file.name.trim()
      ? file.name.trim()
      : `receipt_${Date.now()}.${(file.type || "image/jpeg").split("/").pop()}`;
    setForm((prev) => ({
      ...prev,
      receiptName: safeName,
      receiptMeta: {
        name: safeName,
        size: file.size,
        type: file.type || "",
        lastModified: file.lastModified,
      },
      receiptFile: file,
    }));
  };

  const buildOrder = () => {
    const serial = generateOrderSerial();
    const now = new Date();
    const dateStr = now.toLocaleString(isAr ? "ar-EG" : "en-US",{dateStyle:"medium",timeStyle:"short"});
    const normalizedPhone = composeInternationalPhone(defaultDialCode, splitPhoneWithDial(form.phone, defaultDialCode).national);
    const normalizedWhatsapp = composeInternationalPhone(defaultDialCode, splitPhoneWithDial(form.whatsapp, defaultDialCode).national);
    const providedServiceValue = requiresSubService
      ? `${selectedService?.label || ""}${form.subService ? ` — ${isOtherSubService ? form.customService.trim() : form.subService}` : ""}`
      : (selectedService?.label || form.providedService || "");
    return hydratePaidOrder({
      serial,
      serviceKey:selectedService?.key || selectedService?.label || serial,
      limitBucket,
      service:selectedService?.label||"",
      providedService: providedServiceValue,
      serviceIcon:selectedService?.icon||"💳",
      serviceSubtitle:selectedService?.subtitle || "",
      country:form.country,
      city:form.city,
      name:form.name,
      phone:normalizedPhone,
      email:form.email,
      whatsapp:normalizedWhatsapp,
      paymentMethod: isAr ? banks[form.paymentMethod]?.label : banks[form.paymentMethod]?.labelEn,
      paymentMethodKey:form.paymentMethod,
      notes:form.notes,
      date:now.toISOString(),
      dateStr,
      statusIndex:0,
      price: currentPrice,
      originalPrice,
      billingLabel: selectedService?.billingLabel || (isAr ? "دفعة واحدة لكل طلب جديد" : "One-time payment for each new request"),
      features: selectedService?.features || [],
      serviceCategory: isCvPaidFlow ? "cv" : "country-service",
      customerSupport: !!selectedService?.customerSupport,
      receiptName: form.receiptName,
      receiptAttached: !!form.receiptName,
      receiptMeta: form.receiptMeta,
      emailDeliveryStatus: "pending",
      stageConfirmations: createInitialStageConfirmations(),
    });
  };

  const confirmOrder = async (order) => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    setFirebaseSubmitError("");
    setFirebaseFallbackTicket(null);
    setSubmitStage("save");
    let submitStageTracker = "save";
    let nextOrder = hydratePaidOrder(order);
    let receiptUploadStartedAt = 0;

    try {
      const orderPayload = {
        ...Object.fromEntries(Object.entries(nextOrder).filter(([key]) => key !== "receiptFile")),
        uploadStatus: "pending",
      };

      let firebaseId = "";
      try {
        firebaseId = await withTimeout(
          createOrderViaFirebaseFunction(orderPayload),
          25000,
          "order save"
        );
      } catch (primarySaveError) {
        const primaryCode = String(primarySaveError?.code || primarySaveError?.details?.error || "");
        if (primaryCode === "device-request-limit-exceeded") {
          throw primarySaveError;
        }
        console.error("createOrderViaFirebaseFunction failed, fallback to Firestore save", primarySaveError);
        firebaseId = await withTimeout(
          saveOrderToFirebase(orderPayload),
          25000,
          "order save fallback"
        );
      }

      if (!firebaseId) {
        throw new Error("order-save-failed");
      }
      nextOrder = hydratePaidOrder({ ...nextOrder, firebaseId, uploadStatus: "pending" });

      setSubmitStage("receipt");
      submitStageTracker = "receipt";
      receiptUploadStartedAt = Date.now();
      let uploadedReceipt = null;
      try {
        uploadedReceipt = await withTimeout(
          uploadReceiptToFirebase(form.receiptFile, order.serial),
          RECEIPT_UPLOAD_TIMEOUT_MS,
          "receipt upload"
        );
      } catch (uploadError) {
        console.warn("Receipt upload timed out or failed, deferring", uploadError);
        uploadedReceipt = {
          path: "", url: "", name: form.receiptFile?.name || "",
          type: form.receiptFile?.type || "", size: form.receiptFile?.size || 0,
          deferred: true, errorCode: String(uploadError?.message || "receipt-upload-deferred"),
        };
      }
      if (!uploadedReceipt?.url && !uploadedReceipt?.deferred) {
        throw new Error("receipt-upload-failed");
      }

      const receiptUploadDeferred = !!uploadedReceipt?.deferred;
      const receiptUploadError = String(uploadedReceipt?.errorCode || "");

      nextOrder = hydratePaidOrder({
        ...nextOrder,
        receiptUrl: uploadedReceipt?.url || "",
        receiptStoragePath: uploadedReceipt?.path || "",
        receiptMeta: {
          ...(nextOrder.receiptMeta || {}),
          uploadedName: uploadedReceipt?.name || nextOrder?.receiptName || "",
          uploadedType: uploadedReceipt?.type || nextOrder?.receiptMeta?.type || "",
          uploadedSize: uploadedReceipt?.size || nextOrder?.receiptMeta?.size || 0,
        },
        uploadStatus: receiptUploadDeferred ? "deferred" : "uploaded",
        receiptUploadDeferred,
        receiptUploadError,
      });

      await withTimeout(
        updateOrderInFirebase(firebaseId, {
          receiptUrl: uploadedReceipt?.url || "",
          receiptStoragePath: uploadedReceipt?.path || "",
          receiptMeta: {
            ...(nextOrder.receiptMeta || {}),
          },
          uploadStatus: receiptUploadDeferred ? "deferred" : "uploaded",
          receiptUploadDeferred,
          receiptUploadError,
        }),
        60000,
        "order update"
      );

      setSubmitStage("email");
      submitStageTracker = "email";

      let nextStats = null;
      try {
        nextStats = await syncCvPackageStatsInFirebase(nextOrder.serviceKey, {
          incrementRequest: !nextOrder.statsCounted,
        });
        nextOrder = hydratePaidOrder({
          ...nextOrder,
          statsCounted: true,
        });
        window.dispatchEvent(
          new CustomEvent("cv-package-stats-updated", {
            detail: { packageKey: nextOrder.serviceKey, stats: nextStats },
          })
        );
        await updateOrderInFirebase(firebaseId, {
          statsCounted: true,
        });
      } catch (error) {
        console.error("CV package stats request sync failed", error);
      }

      const updated = [nextOrder, ...existingOrders];
      saveOrders(updated);
      setCurrentOrder(nextOrder);
      setScreen("confirm");
      setOrderEmailStatus("sending");
      setOrderEmailRetryBusy(false);
      setTimeout(() => {
        void sendOrderEmails(nextOrder)
          .then((result) => {
            const nextStatus = result?.ok ? "sent" : "failed";
            const emailErrorCode = String(result?.errorCode || "");
            setOrderEmailStatus(nextStatus);
            const updatedAt = new Date().toISOString();
            if (nextOrder?.firebaseId) {
              updateOrderInFirebase(nextOrder.firebaseId, {
                emailDeliveryStatus: nextStatus,
                emailDeliveryUpdatedAt: updatedAt,
                emailDeliveryError: nextStatus === "failed" ? (emailErrorCode || "background-send-failed") : "",
              }).catch((error) => {
                console.error("Email delivery status update failed", error);
              });
            }
            setExistingOrders((prev) => {
              const merged = prev.map((entry) => (
                entry.serial === nextOrder.serial
                  ? {
                    ...entry,
                    emailDeliveryStatus: nextStatus,
                    emailDeliveryUpdatedAt: updatedAt,
                    emailDeliveryError: nextStatus === "failed" ? (emailErrorCode || "background-send-failed") : "",
                  }
                  : entry
              ));
              try { localStorage.setItem(storageKey, JSON.stringify(merged)); } catch {}
              return merged;
            });
            setCurrentOrder((prev) => prev?.serial === nextOrder.serial
              ? {
                ...prev,
                emailDeliveryStatus: nextStatus,
                emailDeliveryUpdatedAt: updatedAt,
                emailDeliveryError: nextStatus === "failed" ? (emailErrorCode || "background-send-failed") : "",
              }
              : prev);
          })
          .catch(() => {
            setOrderEmailStatus("failed");
            const updatedAt = new Date().toISOString();
            if (nextOrder?.firebaseId) {
              updateOrderInFirebase(nextOrder.firebaseId, {
                emailDeliveryStatus: "failed",
                emailDeliveryUpdatedAt: updatedAt,
                emailDeliveryError: "background-send-exception",
              }).catch((error) => {
                console.error("Email delivery status update failed", error);
              });
            }
          });
      }, 0);
    } catch (error) {
      console.error("Firebase order save failed", error);
      if (String(error?.code || error?.details?.error || "") === "device-request-limit-exceeded") {
        showRequestLimitNotice(error?.details);
        setIsSubmittingOrder(false);
        return;
      }

      const receiptStageElapsedMs = receiptUploadStartedAt ? (Date.now() - receiptUploadStartedAt) : 0;
      const shouldCreateFallbackTicket =
        submitStageTracker === "receipt" && receiptStageElapsedMs >= RECEIPT_UPLOAD_TIMEOUT_MS;
      if (shouldCreateFallbackTicket) {
        const nextTicket = createFirebaseFallbackTicket(nextOrder);
        setFirebaseFallbackTicket(nextTicket);
      }

      const errorCode = error?.code ? ` [${error.code}]` : "";
      const errorMessage = error?.message ? ` ${error.message}` : "";
      const stageLabel = submitStageTracker === "receipt"
        ? (isAr ? "مرحلة رفع الإيصال" : "Receipt upload stage")
        : submitStageTracker === "email"
          ? (isAr ? "مرحلة إرسال الإيميل" : "Email sending stage")
          : (isAr ? "مرحلة حفظ الطلب" : "Order save stage");
      setFirebaseSubmitError(
        isAr
          ? `فشل التنفيذ في ${stageLabel}.${errorCode}${errorMessage} تأكد من اتصال الإنترنت ثم حاول مرة أخرى.`
          : `Operation failed in ${stageLabel}.${errorCode}${errorMessage} Please check your connection and try again.`
      );
    } finally {
      setIsSubmittingOrder(false);
      setSubmitStage("");
    }
  };

  const buildOrderSummaryRows = (order) => {
    const safe = hydratePaidOrder(order || {});
    return [
      [isAr ? "رقم الطلب" : "Order Serial", safe.serial || "-"],
      [isAr ? "الخدمة" : "Service", safe.service || "-"],
      [isAr ? "الخدمة المقدمة" : "Provided Service", safe.providedService || safe.service || "-"],
      [isAr ? "السعر" : "Price", `$${safe.price || 10}`],
      [isAr ? "الدولة" : "Country", safe.country || "-"],
      [isAr ? "المدينة" : "City", safe.city || "-"],
      [isAr ? "الاسم" : "Name", safe.name || "-"],
      [isAr ? "الموبايل" : "Phone", safe.phone || "-"],
      [isAr ? "البريد الإلكتروني" : "Email", safe.email || "-"],
      [isAr ? "الواتساب" : "WhatsApp", safe.whatsapp || "-"],
      [isAr ? "طريقة الدفع" : "Payment Method", safe.paymentMethod || "-"],
      [isAr ? "نوع الدفع" : "Billing Type", safe.billingLabel || "-"],
      [isAr ? "الإيصال" : "Receipt", safe.receiptName || (isAr ? "مرفق" : "Attached")],
      [isAr ? "تاريخ الطلب" : "Order Date", safe.dateStr || "-"],
    ];
  };

  const handleSaveOrderSummary = async (order) => {
    const safe = hydratePaidOrder(order || currentOrder || {});
    if (!safe?.serial) return;
    setSavedOrderPreview(safe);
  };

  const requestLimitNoticeNode = requestLimitNotice ? (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.28)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:360, borderRadius:24, padding:"22px 20px", background:"linear-gradient(180deg,#fffaf0 0%,#fff5db 100%)", border:"1px solid rgba(212,175,55,0.35)", boxShadow:"0 22px 55px rgba(0,0,0,0.18)", textAlign:"center", fontFamily:"'Cairo',sans-serif" }}>
        <div style={{ fontSize:34, marginBottom:10 }}>⏳</div>
        <div style={{ fontSize:16, fontWeight:900, color:t.gold, marginBottom:8 }}>
          {requestLimitNoticeTitle || (isAr ? "تم الوصول إلى حد الطلبات" : "Request limit reached")}
        </div>
        <div style={{ fontSize:13, lineHeight:1.9, color:t.text }}>
          {requestLimitNotice}
        </div>
      </div>
    </div>
  ) : null;

  const renderCancelCurrentPaidRequestButton = () => {
    if (isCvPaidFlow) {
      return (
        <div style={{ display:"flex", justifyContent:"center" }}>
          <button
            onClick={cancelCurrentPaidRequest}
            style={{
              maxWidth:260,
              width:"100%",
              padding:"11px 18px",
              borderRadius:12,
              border:"1px solid #dc262655",
              background:"linear-gradient(135deg,#fff8e6,#fff1f2)",
              color:"#dc2626",
              fontSize:13,
              fontWeight:800,
              cursor:"pointer",
              fontFamily:"'Cairo',sans-serif",
              boxShadow:"0 8px 22px rgba(220,38,38,0.08)",
            }}
          >
            {isAr ? "إلغاء الطلب الحالي" : "Cancel Current Request"}
          </button>
        </div>
      );
    }

    return (
      <button onClick={cancelCurrentPaidRequest} style={{ ...btnStyle(t.inputBg, t.gold), boxShadow:"none", border:`1px solid ${t.gold}` }}>
        {isAr ? "إلغاء الطلب الحالي" : "Cancel Current Request"}
      </button>
    );
  };

  // ── SCREEN: list ──────────────────────────────────────────────────────────
  if (screen === "list") return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
      <div style={{ ...card, padding: "12px 14px", background:`linear-gradient(135deg,${t.gold}16,${t.gold}07)`, border:`1px solid ${t.gold}30` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize:14, fontWeight:900, color:t.gold, marginBottom:4 }}>{isAr?"الخدمات المدفوعة":"Paid Services"}</div>
            <div style={{ fontSize:11, color:t.subText, lineHeight:1.7 }}>
              {isSaudi
                ? (isAr ? "اختر الخدمة الرئيسية ثم حدّد الخدمة الفرعية المناسبة داخل الطلب" : "Choose the main service, then select the matching sub-service in the request")
                : (isAr ? "اختر الخدمة المطلوبة وأكمل طلبك بدفعة واحدة لكل طلب جديد" : "Choose the required service and complete your request with one payment per new request")}
            </div>
          </div>
          <div style={{ fontSize:20, flexShrink:0 }}>💳</div>
        </div>
      </div>
      {!String(storageKey || "").startsWith("cvPaidOrders") && (
        <div style={{ ...card, padding: "10px 14px", background: dark ? "rgba(255,255,255,0.03)" : "#ffffff", border:`1px solid ${t.gold}26` }}>
          <div style={{ fontSize:11, fontWeight:800, color:t.gold, marginBottom:4 }}>
            {isAr ? "ملحوظة مهمة" : "Important Note"}
          </div>
          <div style={{ fontSize:10, color:t.subText, lineHeight:1.8 }}>
            {isAr
              ? "المبلغ المدفوع هنا هو مبلغ لبدء تنفيذ الطلب وليس أتعاب الخدمة النهائية. أتعاب الخدمات تُحدد لاحقًا حسب تفاصيل الطلب وحالته عند التواصل مع العميل. وفي حال عدم تنفيذ الخدمة أو رفض المستخدم استكمال التنفيذ، يتم استرداد 50٪ من المبلغ المدفوع."
              : "This payment is a request-start fee and not the final service fee. Final fees are determined later based on the request details and status during client communication. If the service is not executed or the user declines to continue, 50% of the paid amount is refunded."}
          </div>
        </div>
      )}
      {!!adminServiceOrdersError && isAdminUser && (
        <div style={{ marginBottom: 10, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 12, padding: "8px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.6, fontWeight: 700 }}>
          {adminServiceOrdersError}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:8 }}>
        {normalizedServices.map((srv,i) => {
          const serviceStats = sharedServiceReviews[getServiceReviewBucketKey(activeCountry, srv.key)] || { count: 0, avg: 0, reviews: [] };
          const serviceOrders = isAdminUser
            ? adminServiceOrders.filter((entry) => serviceOrderMatches(entry, srv))
            : [];
          const isAdminExpanded = adminExpandedServiceKey === String(srv.key || i);
          return (
          <div key={srv.key || i}>
            <button onClick={() => {
                if (srv.soon) return;
                setSelectedService(srv);
                setScreen("existingOrNew");
              }}
              style={{ display:"flex", flexDirection:"column", alignItems:isAr?"flex-start":"flex-start", gap:8, width:"100%", minHeight:isSaudi ? 118 : 132, padding:isSaudi ? "11px" : "12px", borderRadius:14, background:srv.soon ? `${t.gold}10` : t.cardBg, border:`1px solid ${srv.soon ? `${t.gold}55` : t.border}`, cursor:srv.soon ? "default" : "pointer", textAlign:isAr?"right":"left", fontFamily:"'Cairo',sans-serif", opacity:srv.soon ? 0.82 : 1 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", gap:8 }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{srv.icon}</span>
                {srv.soon ? (
                  <div style={{ fontSize:9, background:"#64748b18", color:"#64748b", border:"1px solid #64748b30", borderRadius:999, padding:"3px 7px", fontWeight:800, flexShrink:0 }}>
                    {srv.soonLabel || (isAr ? "⏳ قريبًا" : "⏳ Soon")}
                  </div>
                ) : (
                  <div style={{ width:22, height:22, borderRadius:"50%", background:t.goldBg, display:"flex", alignItems:"center", justifyContent:"center", color:t.gold, fontSize:12, flexShrink:0 }}>{isAr?"‹":"›"}</div>
                )}
              </div>
              <div style={{ fontSize:11, fontWeight:800, color:t.text, lineHeight:1.6 }}>{srv.label}</div>
              <div style={{ fontSize:isSaudi ? 8.5 : 9, color:t.subText, lineHeight:1.7 }}>{srv.subtitle}</div>
              <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
                {[1,2,3,4,5].map((star) => (
                  <span key={star} style={{ fontSize:10, color: Number(serviceStats.avg || 0) >= star ? "#f59e0b" : t.border }}>★</span>
                ))}
                <span style={{ fontSize:9, color:t.subText }}>
                  {serviceStats.count ? `${serviceStats.avg} (${serviceStats.count})` : (isAr ? "بدون تقييمات بعد" : "No ratings yet")}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:"auto", flexWrap:"wrap" }}>
                <span style={{ fontSize:13, fontWeight:900, color:t.gold }}>${srv.price}</span>
                <span style={{ fontSize:9, color:t.subText, textDecoration:"line-through" }}>${srv.originalPrice}</span>
                <span style={{ fontSize:9, background:"#e53e3e", color:"#fff", borderRadius:999, padding:"2px 7px", fontWeight:700 }}>{isAr?"خصم 50٪":"50% OFF"}</span>
              </div>
            </button>

            {isAdminUser && !srv.soon && (
              <div style={{ marginTop: 6, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(15,23,42,0.08)", padding: "8px 8px 7px" }}>
                <button
                  onClick={() => openAdminServiceOrdersPage(srv)}
                  style={{ width: "100%", border: `1px solid ${t.border}`, background: t.inputBg, color: t.gold, borderRadius: 9, padding: "6px 7px", fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
                >
                  {isAr
                    ? `طلبات القسم (${serviceOrders.length})`
                    : `Section Orders (${serviceOrders.length})`}
                </button>
              </div>
            )}
          </div>
        )})}
      </div>
      {existingOrders.length > 0 && (
        <button onClick={() => setScreen("previousOrders")} style={{ ...btnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", marginTop:8 }}>
          📋 {isAr?`طلباتي السابقة (${existingOrders.length})`:`My Orders (${existingOrders.length})`}
        </button>
      )}
    </div>
  );

  // ── SCREEN: adminServiceOrders ───────────────────────────────────────────
  if (screen === "adminServiceOrders" && adminServiceOrdersView) {
    const detailOrder = selectedAdminServiceOrder ? hydratePaidOrder(selectedAdminServiceOrder) : null;
    const steps = isAr ? STATUS_STEPS_AR : STATUS_STEPS_EN;
    const detailOrderId = String(detailOrder?.firebaseId || detailOrder?.id || "");
    const detailBusy = adminServiceBusyOrderId === detailOrderId;
    const currentStageIndex = Number.isInteger(detailOrder?.statusIndex) ? detailOrder.statusIndex : 0;
    const getStageTone = (stageIndex) => {
      if (stageIndex >= 4) {
        return {
          color: "#166534",
          background: "rgba(34,197,94,0.16)",
          border: "rgba(34,197,94,0.34)",
        };
      }
      if (stageIndex >= 2) {
        return {
          color: "#1d4ed8",
          background: "rgba(59,130,246,0.14)",
          border: "rgba(59,130,246,0.30)",
        };
      }
      return {
        color: "#b45309",
        background: "rgba(245,158,11,0.15)",
        border: "rgba(245,158,11,0.30)",
      };
    };
    const detailRows = detailOrder ? [
      [isAr ? "رقم الطلب" : "Order Serial", detailOrder.orderSerial || detailOrder.serial || "-"],
      [isAr ? "اسم صاحب الطلب" : "Customer Name", detailOrder.customerName || detailOrder.name || "-"],
      [isAr ? "رقم التليفون" : "Phone Number", detailOrder.phone || "-"],
      [isAr ? "البريد الإلكتروني" : "Email", detailOrder.email || "-"],
      [isAr ? "الدولة" : "Country", detailOrder.countryName || detailOrder.country || "-"],
      [isAr ? "المحافظة / المدينة" : "Governorate / City", detailOrder.city || "-"],
      [isAr ? "الخدمة" : "Service", detailOrder.providedService || detailOrder.serviceNameNorm || detailOrder.service || "-"],
      [isAr ? "طريقة الدفع" : "Payment Method", detailOrder.paymentMethod || "-"],
      [isAr ? "الإيصال" : "Receipt", detailOrder.receiptName || (isAr ? "مرفق" : "Attached")],
      [isAr ? "التاريخ" : "Date", detailOrder.dateStr || detailOrder.createdAtLabel || "-"],
      [isAr ? "ملاحظات العميل" : "Client Notes", detailOrder.notes || (isAr ? "لا توجد ملاحظات" : "No notes")],
    ] : [];

    return (
      <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
        <div style={{ ...card, background:`linear-gradient(135deg,${t.gold}18,${t.gold}08)`, border:`1px solid ${t.gold}30` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:t.goldBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {adminServiceOrdersView.icon || "📋"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:900, color:t.gold }}>{adminServiceOrdersView.label}</div>
              <div style={{ fontSize:11, color:t.subText, lineHeight:1.7 }}>
                {isAr
                  ? "صفحة مستقلة لطلبات هذا القسم مع متابعة الأدمن والتقييم فقط."
                  : "A dedicated page for this section orders with admin tracking and review controls only."}
              </div>
            </div>
          </div>
        </div>

        {!!adminServiceOrdersError && (
          <div style={{ marginBottom: 10, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 12, padding: "8px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.6, fontWeight: 700 }}>
            {adminServiceOrdersError}
          </div>
        )}

        {!detailOrder && (
          <div style={{ ...card, padding:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:800, color:t.text }}>
                {isAr ? `عدد الطلبات: ${selectedAdminServiceOrders.length}` : `Orders count: ${selectedAdminServiceOrders.length}`}
              </div>
              <div style={{ fontSize:10, color:t.subText }}>
                {isAr ? "اضغط على أي طلب لعرض تفاصيله" : "Tap any order to show its details"}
              </div>
            </div>

            {adminServiceOrdersLoading ? (
              <div style={{ fontSize: 11, color: t.subText, textAlign: "center", padding: "18px 0" }}>
                {isAr ? "جارٍ تحميل الطلبات..." : "Loading orders..."}
              </div>
            ) : selectedAdminServiceOrders.length === 0 ? (
              <div style={{ fontSize: 11, color: t.subText, textAlign: "center", padding: "18px 0" }}>
                {isAr ? "لا توجد طلبات لهذا القسم في هذه الدولة." : "No orders for this section in this country."}
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(92px, 1fr))", gap:10 }}>
                {selectedAdminServiceOrders.map((orderItem) => {
                  const oid = String(orderItem.firebaseId || orderItem.id || "");
                  const safeOrder = hydratePaidOrder(orderItem || {});
                  const orderStageIndex = Number.isInteger(safeOrder.statusIndex) ? safeOrder.statusIndex : 0;
                  const isOrderBusy = adminServiceBusyOrderId === oid;
                  const stageLabel = steps[orderStageIndex]?.label || steps[0]?.label || "-";
                  const stageTone = getStageTone(orderStageIndex);
                  return (
                    <div key={oid} style={{ position: "relative" }}>
                      <button
                        onClick={() => setAdminSelectedServiceOrderId(oid)}
                        disabled={isOrderBusy}
                        style={{
                          width:"100%",
                          border:`1px solid ${detailOrderId === oid ? t.gold : t.border}`,
                          background: dark
                            ? "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                          borderRadius:16,
                          padding:"10px 9px",
                          cursor:isOrderBusy ? "not-allowed" : "pointer",
                          textAlign:isAr ? "right" : "left",
                          fontFamily:"'Cairo',sans-serif",
                          minHeight:132,
                          display:"flex",
                          flexDirection:"column",
                          gap:6,
                          boxShadow: dark
                            ? "0 10px 22px rgba(2,6,23,0.22)"
                            : "0 10px 20px rgba(148,163,184,0.14)",
                          opacity: isOrderBusy ? 0.72 : 1,
                        }}
                      >
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
                          <div style={{ fontSize:10, fontWeight:900, color:t.gold, direction:"ltr", textAlign:isAr ? "right" : "left" }}>
                            {orderItem.orderSerial || safeOrder.serial || "-"}
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                            <div style={{ fontSize:8.5, color:stageTone.color, background:stageTone.background, border:`1px solid ${stageTone.border}`, borderRadius:999, padding:"2px 6px", fontWeight:900, whiteSpace:"nowrap" }}>
                              {isAr ? "الحالة" : "Status"}
                            </div>
                            <span
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleAdminDeleteServiceOrder(orderItem);
                              }}
                              role="button"
                              aria-label={isAr ? "حذف الطلب" : "Delete order"}
                              title={isAr ? "حذف الطلب" : "Delete order"}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                border: "1px solid rgba(220,38,38,0.45)",
                                background: "rgba(220,38,38,0.12)",
                                color: "#dc2626",
                                fontSize: 12,
                                fontWeight: 900,
                                cursor: isOrderBusy ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                opacity: isOrderBusy ? 0.6 : 1,
                                pointerEvents: isOrderBusy ? "none" : "auto",
                              }}
                            >
                              ×
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize:11, fontWeight:800, color:t.text, lineHeight:1.5 }}>
                          {orderItem.customerName || safeOrder.name || (isAr ? "بدون اسم" : "No name")}
                        </div>
                        <div style={{ fontSize:9, color:t.subText, lineHeight:1.6, direction:"ltr", textAlign:isAr ? "right" : "left" }}>
                          {safeOrder.phone || (isAr ? "بدون رقم" : "No phone")}
                        </div>
                        <div style={{ fontSize:8.5, color:stageTone.color, lineHeight:1.6, fontWeight:900, background:stageTone.background, border:`1px solid ${stageTone.border}`, borderRadius:10, padding:"5px 6px" }}>
                          {stageLabel}
                        </div>
                        <div style={{ marginTop:"auto", fontSize:9, color: orderItem.reviewedValue ? "#16a34a" : "#dc2626", fontWeight:800 }}>
                          {orderItem.reviewedValue
                            ? (isAr ? `التقييم ${orderItem.ratingValue}/5` : `Rating ${orderItem.ratingValue}/5`)
                            : (isAr ? "بدون تقييم" : "No review")}
                        </div>
                        <div style={{ fontSize:8.5, color:t.subText, fontWeight:800, lineHeight:1.5 }}>
                          {isAr ? "اضغط لعرض التفاصيل والمتابعة" : "Tap for details and tracking"}
                        </div>
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!!detailOrder && (
          <>
            <div style={{ ...card, background:t.cardBg }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:t.gold }}>{isAr ? "تفاصيل الطلب" : "Order Details"}</div>
                  <div style={{ fontSize:10, color:t.subText }}>{isAr ? "البيانات التالية للعرض فقط" : "The following fields are read-only"}</div>
                </div>
                <div style={{ fontSize:11, fontWeight:900, color:"#2563eb" }}>
                  {steps[currentStageIndex]?.label || "-"}
                </div>
              </div>

              <div style={{ display:"grid", gap:0, border:`1px solid ${t.border}`, borderRadius:16, overflow:"hidden" }}>
                {detailRows.map(([label, value], index) => (
                  <div key={`${detailOrderId}-${label}`} style={{ display:"grid", gridTemplateColumns:"132px 1fr", gap:12, padding:"10px 12px", background:index % 2 === 0 ? t.cardBg : t.inputBg, borderBottom:index < detailRows.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <div style={{ fontSize:10.5, color:t.subText, fontWeight:800 }}>{label}</div>
                    <div style={{ fontSize:11, color:t.text, fontWeight:900, lineHeight:1.7, wordBreak:"break-word" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, background:t.cardBg }}>
              <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:8 }}>
                {isAr ? "متابعة الأدمن للطلب" : "Admin Order Tracking"}
              </div>
              <div style={{ fontSize:10.5, color:t.subText, lineHeight:1.8, marginBottom:12 }}>
                {isAr ? "تحكم كامل من تم الدفع حتى تم الانتهاء من تنفيذ الخدمة عبر 5 أزرار مرتبة." : "Full control from payment to service completion using 5 ordered buttons."}
              </div>
              <div style={{ display:"grid", gap:8 }}>
                {steps.map((stepItem, stepIndex) => {
                  const active = stepIndex <= currentStageIndex;
                  const exact = stepIndex === currentStageIndex;
                  return (
                    <button
                      key={`${detailOrderId}-${stepItem.key}`}
                      onClick={() => handleAdminSetOrderStage(detailOrder, stepIndex)}
                      disabled={detailBusy}
                      style={{
                        width:"100%",
                        border:`1px solid ${exact ? "rgba(37,99,235,0.45)" : active ? "rgba(34,197,94,0.38)" : "rgba(220,38,38,0.30)"}`,
                        background: exact
                          ? "rgba(37,99,235,0.14)"
                          : active
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(220,38,38,0.08)",
                        color: exact ? "#1d4ed8" : active ? "#15803d" : "#b91c1c",
                        borderRadius:12,
                        padding:"11px 12px",
                        textAlign:isAr ? "right" : "left",
                        fontSize:11,
                        fontWeight:900,
                        cursor:detailBusy ? "not-allowed" : "pointer",
                        opacity:detailBusy ? 0.7 : 1,
                        fontFamily:"'Cairo',sans-serif",
                      }}
                    >
                      <span style={{ marginInlineEnd: 6 }}>{stepItem.icon}</span>
                      {stepItem.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ ...card, background:t.cardBg }}>
              <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:8 }}>
                {isAr ? "التقييم والمراجعة" : "Review Controls"}
              </div>
              <div style={{ fontSize:11, color:t.text, lineHeight:1.8, marginBottom:10 }}>
                {detailOrder.reviewedValue || detailOrder.reviewed
                  ? (isAr
                    ? `التقييم الحالي: ${detailOrder.ratingValue || detailOrder.rating || 0}/5`
                    : `Current rating: ${detailOrder.ratingValue || detailOrder.rating || 0}/5`)
                  : (isAr ? "لا يوجد تقييم على هذا الطلب حتى الآن." : "No review exists for this order yet.")}
              </div>
              <div style={{ fontSize:10.5, color:t.subText, lineHeight:1.8, marginBottom:12 }}>
                {detailOrder.reviewTextValue || detailOrder.reviewText || (isAr ? "لا يوجد نص تقييم." : "No review text.")}
              </div>
              {canManageServiceReviews ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <button
                    disabled={detailBusy}
                    onClick={() => handleAdminUpdateServiceReview(detailOrder)}
                    style={{ border:"none", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", borderRadius:12, padding:"11px 12px", fontSize:11, fontWeight:900, cursor:detailBusy ? "not-allowed" : "pointer", opacity:detailBusy ? 0.7 : 1, fontFamily:"'Cairo',sans-serif" }}
                  >
                    {isAr ? "تعديل التقييم" : "Edit Rating"}
                  </button>
                  <button
                    disabled={detailBusy}
                    onClick={() => handleAdminDeleteServiceReview(detailOrder)}
                    style={{ border:"none", background:"linear-gradient(135deg,#dc2626,#991b1b)", color:"#fff", borderRadius:12, padding:"11px 12px", fontSize:11, fontWeight:900, cursor:detailBusy ? "not-allowed" : "pointer", opacity:detailBusy ? 0.7 : 1, fontFamily:"'Cairo',sans-serif" }}
                  >
                    {isAr ? "حذف التقييم" : "Delete Rating"}
                  </button>
                </div>
              ) : (
                <div style={{ borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, padding:"10px 11px", color:t.subText, fontSize:10.5, lineHeight:1.8, textAlign:isAr ? "right" : "left" }}>
                  {isAr
                    ? "تعديل/حذف التقييم متاح للأدمن الأساسي فقط."
                    : "Editing/deleting reviews is available to the primary admin only."}
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => {
            if (detailOrder) {
              setAdminSelectedServiceOrderId("");
              return;
            }
            setAdminServiceOrdersView(null);
            setScreen("list");
          }}
          style={{ ...btnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", marginTop:8 }}
        >
          {detailOrder
            ? (isAr ? "رجوع إلى طلبات القسم" : "Back to Section Orders")
            : (isAr ? "رجوع إلى الخدمات" : "Back to Services")}
        </button>
      </div>
    );
  }

  // ── SCREEN: existingOrNew ─────────────────────────────────────────────────
  if (screen === "existingOrNew") return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
      {requestLimitNoticeNode}
      {selectedService && (
        <div style={{ ...card, background:t.goldBg, border:`1px solid ${t.gold}33`, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>{selectedService.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:t.gold }}>{selectedService.label}</div>
            <div style={{ fontSize:11, color:t.subText }}>{isAr?"كل خدمة جديدة تحتاج طلبًا مستقلاً":"Each new service requires a separate request"}</div>
            <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", marginTop:6 }}>
              {[1,2,3,4,5].map((star) => (
                <span key={star} style={{ fontSize:11, color:Number(selectedServiceReviewStats.avg || 0) >= star ? "#f59e0b" : t.border }}>★</span>
              ))}
              <span style={{ fontSize:10, color:t.subText }}>
                {selectedServiceReviewStats.count
                  ? (isAr ? `${selectedServiceReviewStats.avg} من 5 (${selectedServiceReviewStats.count} تقييم)` : `${selectedServiceReviewStats.avg} of 5 (${selectedServiceReviewStats.count} ratings)`)
                  : (isAr ? "لا توجد تقييمات مشتركة بعد" : "No shared ratings yet")}
              </span>
            </div>
          </div>
        </div>
      )}
      <button onClick={openPaidNewRequest} style={{ ...btnStyle(goldGrad), marginBottom:12 }}>
        ➕ {isAr?"طلب جديد":"New Request"}
      </button>
      {
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(isAr ? "السلام عليكم، في حالة فشل إرسال الطلب أرسل لكم كل البيانات للمساعدة." : "Hello, if the request fails to submit, I will send all details for support.")}`}
          target="_blank"
          rel="noreferrer"
          className="support-whatsapp-tile"
          style={{ marginBottom:12, display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:14, background: dark ? "rgba(37,211,102,0.07)" : "#f0fdf4", border:"1px solid rgba(37,211,102,0.22)", textDecoration:"none", fontFamily:"'Cairo',sans-serif" }}
        >
          <div style={{ flex:1, fontSize:11, color: dark ? "#86efac" : "#166534", lineHeight:1.8, fontWeight:700, textAlign:isAr ? "right" : "left" }}>
            {isAr ? "في حالة فشل إرسال الطلب يرجى التواصل بالدعم الفني وإرسال كافة البيانات له" : "If the request fails to submit, please contact technical support and send all your data."}
          </div>
          <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width:31, height:31, borderRadius:"50%", background:"#ffffff", padding:2, flexShrink:0 }} />
            <span style={{ fontSize:10, fontWeight:900, color: dark ? "#f0fdf4" : "#0f172a", whiteSpace:"nowrap" }}>{isAr ? "الدعم الفني" : "Support"}</span>
          </div>
        </a>
      }
      {existingOrders.length > 0 ? (
        <button onClick={() => setScreen("previousOrders")} style={{ ...btnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none" }}>
          📋 {isAr?`طلباتي السابقة (${existingOrders.length})`:`My Previous Orders (${existingOrders.length})`}
        </button>
      ) : (
        <div style={{ textAlign:"center", color:t.subText, fontSize:12, padding:16 }}>{isAr?"لا توجد طلبات سابقة":"No previous orders"}</div>
      )}
    </div>
  );

  // ── SCREEN: previousOrders ───────────────────────────────────────────────
  if (screen === "previousOrders") return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
      <div style={{ fontSize:13, fontWeight:700, color:t.subText, marginBottom:10 }}>📋 {isAr?"طلباتي السابقة":"My Previous Orders"}</div>
      {existingOrders.map((o,i) => (
        <div key={o.serial || i} style={{ marginBottom:8 }}>
          <button onClick={() => { setCurrentOrder(hydratePaidOrder(o)); setScreen("status"); }}
            style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"12px 14px", borderRadius:12, background:t.cardBg, border:`1px solid ${t.border}`, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:t.goldBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{o.serviceIcon||"💳"}</div>
            <div style={{ flex:1, textAlign:isAr?"right":"left" }}>
              <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{o.service}</div>
              <div style={{ fontSize:10, color:t.subText }}>{o.serial}</div>
              <div style={{ fontSize:10, color:t.subText }}>{o.dateStr}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              {isAdminUser && (
                <span onClick={(e) => { e.stopPropagation(); handleAdminDeleteServiceOrder(o); }}
                  style={{ fontSize:10, background:"#ef444418", color:"#ef4444", border:"1px solid #ef444430", borderRadius:8, padding:"3px 8px", fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", boxShadow:"0 0 8px #ef444430" }}>
                  {isAr?"حذف":"Delete"}
                </span>
              )}
              <div style={{ fontSize:10, background:"#22c55e18", color:"#22c55e", border:"1px solid #22c55e30", borderRadius:8, padding:"3px 8px", fontWeight:700 }}>{isAr?"متابعة":"Track"}</div>
            </div>
          </button>
        </div>
      ))}
      <button onClick={() => setScreen("existingOrNew")} style={{ ...btnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", marginTop:12 }}>
        {isAr ? "رجوع" : "Back"}
      </button>
      {deleteConfirmOrder && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setDeleteConfirmOrder(null)}>
          <div style={{ width:"100%", maxWidth:360, borderRadius:22, padding:"28px 22px 22px", background:"linear-gradient(160deg,#1a0404 0%,#2d0808 55%,#3f0a0a 100%)", border:"1px solid rgba(239,68,68,0.5)", boxShadow:"0 0 40px rgba(239,68,68,0.45), 0 20px 60px rgba(0,0,0,0.6)", textAlign:"center", fontFamily:"'Cairo',sans-serif" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:54, height:54, borderRadius:"50%", background:"linear-gradient(145deg,#ef4444,#b91c1c)", boxShadow:"0 0 28px rgba(239,68,68,0.7), inset 0 2px 6px rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:24 }}>🗑️</div>
            <div style={{ fontSize:16, fontWeight:900, color:"#fca5a5", marginBottom:8 }}>{isAr ? "حذف الطلب" : "Delete Order"}</div>
            <div style={{ fontSize:12, color:"rgba(252,165,165,0.7)", marginBottom:20, lineHeight:1.8 }}>
              {isAr ? "هل تريد حذف هذا الطلب نهائيًا من النظام؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to permanently delete this order? This action cannot be undone."}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteConfirmOrder(null)} style={{ flex:1, padding:"10px 0", borderRadius:12, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)", color:"#fca5a5", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={handleAdminDeleteConfirmed} style={{ flex:1, padding:"10px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow:"0 0 18px rgba(239,68,68,0.5)", color:"#fff", fontSize:13, fontWeight:900, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                {isAr ? "حذف نهائي" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── SCREEN: form ─────────────────────────────────────────────────────────
  if (screen === "form") {
    const validSubService = !requiresSubService || (form.subService.trim() && (!isOtherSubService || form.customService.trim()));
    const normalizedPhone = composeInternationalPhone(defaultDialCode, phoneNationalDigits);
    const normalizedWhatsapp = composeInternationalPhone(defaultDialCode, whatsappNationalDigits);
    const valid1 = form.name.trim() && isValidIntlPhone(normalizedPhone) && isValidIntlPhone(normalizedWhatsapp) && form.email.trim() && form.country.trim() && form.city.trim() && validSubService;
    return (
      <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
        {requestLimitNoticeNode}
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16 }}>
          {[1,2].map(s => (
            <React.Fragment key={s}>
              <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, background: s<=step?t.gold:t.inputBg, color: s<=step?"#fff":t.subText, border:`2px solid ${s<=step?t.gold:t.border}` }}>
                {s < step ? "✓" : s}
              </div>
              {s < 2 && <div style={{ flex:1, height:2, background: step>s?t.gold:t.border }} />}
            </React.Fragment>
          ))}
          <div style={{ fontSize:12, color:t.subText, marginRight:isAr?8:0, marginLeft:isAr?0:8 }}>{isAr?`الخطوة ${step} من 2`:`Step ${step} of 2`}</div>
        </div>

        {step === 1 && (
          <div>
            <div style={card}>
              <PaidSectionHead icon="👤" label={isAr?"بياناتك الشخصية":"Personal Details"} t={t} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <PaidFieldWrap label={isAr?"الاسم الكامل *":"Full Name *"} labelStyle={labelStyle}>
                  <input style={inputStyle} value={form.name} placeholder={isAr?"محمد أحمد السيد":"Mohamed Ahmed"} onChange={e=>upd("name",e.target.value)} />
                </PaidFieldWrap>
                <PaidFieldWrap label={isAr?"الخدمة المقدمة *":"Provided Service *"} labelStyle={labelStyle}>
                  <input
                    style={{ ...inputStyle, background: dark ? "rgba(255,255,255,0.05)" : "#f7f8fc", fontWeight:700 }}
                    value={selectedService?.label || form.providedService || ""}
                    readOnly
                  />
                </PaidFieldWrap>
              </div>
              {requiresSubService && (
                <>
                  <PaidFieldWrap label={isAr?"الخدمة الفرعية *":"Sub-service *"} labelStyle={labelStyle}>
                    <select
                      style={inputStyle}
                      value={form.subService}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        upd("subService", nextValue);
                        if (!isOtherSubServiceValue(nextValue, isAr)) upd("customService", "");
                      }}
                    >
                      <option value="">{isAr ? "اختر الخدمة الفرعية" : "Select sub-service"}</option>
                      {selectedSubServices.map((subItem) => (
                        <option key={subItem} value={subItem}>{subItem}</option>
                      ))}
                    </select>
                  </PaidFieldWrap>
                  {isOtherSubService && (
                    <PaidFieldWrap label={isAr?"اكتب نوع الخدمة المطلوبة *":"Write the requested service type *"} labelStyle={labelStyle}>
                      <input
                        style={inputStyle}
                        value={form.customService}
                        placeholder={isAr ? "اكتب نوع الخدمة المطلوبة" : "Write the requested service type"}
                        onChange={e=>upd("customService",e.target.value)}
                      />
                    </PaidFieldWrap>
                  )}
                </>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <PaidFieldWrap label={isAr?"رقم الهاتف *":"Phone *"} labelStyle={labelStyle}>
                  <div style={{ display:"grid", gridTemplateColumns:"40px minmax(0, 1.4fr)", gap:6, direction:"ltr" }}>
                    <input style={{ ...inputStyle, textAlign:"center", fontWeight:800, padding:"9px 4px" }} value={defaultDialCode} readOnly dir="ltr" />
                    <input
                      style={{ ...inputStyle, direction:"ltr", textAlign:"left" }}
                      value={phoneNationalDigits}
                      placeholder={isAr ? "اكتب الرقم بدون المفتاح" : "Enter number without dial code"}
                      inputMode="tel"
                      dir="ltr"
                      onChange={e=>{
                        const national = normalizeNationalDigits(e.target.value);
                        upd("phone", composeInternationalPhone(defaultDialCode, national));
                        if (phoneFieldError) setPhoneFieldError("");
                      }}
                    />
                  </div>
                  {!!phoneFieldError && <div style={{ marginTop:6, fontSize:11, color:"#dc2626", fontWeight:800 }}>{phoneFieldError}</div>}
                </PaidFieldWrap>
                <PaidFieldWrap label={isAr?"واتساب *":"WhatsApp *"} labelStyle={labelStyle}>
                  <div style={{ display:"grid", gridTemplateColumns:"40px minmax(0, 1.4fr)", gap:6, direction:"ltr" }}>
                    <input style={{ ...inputStyle, textAlign:"center", fontWeight:800, padding:"9px 4px" }} value={defaultDialCode} readOnly dir="ltr" />
                    <input
                      style={{ ...inputStyle, direction:"ltr", textAlign:"left" }}
                      value={whatsappNationalDigits}
                      placeholder={isAr ? "رقم واتساب بدون المفتاح" : "WhatsApp number without dial code"}
                      inputMode="tel"
                      dir="ltr"
                      onChange={e=>{
                        const national = normalizeNationalDigits(e.target.value);
                        upd("whatsapp", composeInternationalPhone(defaultDialCode, national));
                        if (whatsappFieldError) setWhatsappFieldError("");
                      }}
                    />
                  </div>
                  {!!whatsappFieldError && <div style={{ marginTop:6, fontSize:11, color:"#dc2626", fontWeight:800 }}>{whatsappFieldError}</div>}
                </PaidFieldWrap>
              </div>
              <PaidFieldWrap
                label={
                  <span>
                    {isAr ? "البريد الإلكتروني" : "Email"}{" "}
                    <span style={{ color:"#dc2626", fontSize:10, fontWeight:900 }}>*</span>
                  </span>
                }
                labelStyle={labelStyle}
              >
                <input
                  style={{
                    ...inputStyle,
                    border: emailFieldError ? "1px solid rgba(220,38,38,0.65)" : inputStyle.border,
                    boxShadow: emailFieldError ? "0 0 0 3px rgba(220,38,38,0.10)" : "none",
                  }}
                  type="email"
                  value={form.email}
                  placeholder="example@email.com"
                  onChange={e=>{
                    upd("email",e.target.value);
                    if (emailFieldError && e.target.value.trim()) setEmailFieldError("");
                  }}
                />
                {!!emailFieldError && (
                  <div style={{ marginTop:6, fontSize:11, color:"#dc2626", fontWeight:800, lineHeight:1.7 }}>
                    {emailFieldError}
                  </div>
                )}
              </PaidFieldWrap>
              <PaidFieldWrap label={isAr?"رقم الهوية / الإقامة (اختياري)":"ID / Iqama No. (optional)"} labelStyle={labelStyle}>
                <input style={inputStyle} value={form.idNumber} placeholder="0000000000" onChange={e=>upd("idNumber",e.target.value)} />
              </PaidFieldWrap>
            </div>
            <div style={card}>
              <PaidSectionHead icon="🌍" label={isAr?"الدولة والمدينة":"Country & City"} t={t} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <PaidFieldWrap label={isAr?"الدولة *":"Country *"} labelStyle={labelStyle}>
                  <input style={inputStyle} value={form.country} onChange={e=>upd("country",e.target.value)} />
                </PaidFieldWrap>
                <PaidFieldWrap label={isAr?"المدينة *":"City *"} labelStyle={labelStyle}>
                  <input style={inputStyle} value={form.city} placeholder={isAr?"القاهرة":"Cairo"} onChange={e=>upd("city",e.target.value)} />
                </PaidFieldWrap>
              </div>
              <PaidFieldWrap label={isAr?"ملاحظات إضافية (اختياري)":"Additional Notes (optional)"} labelStyle={labelStyle}>
                <textarea style={{ ...inputStyle, minHeight:70, resize:"vertical" }} value={form.notes} placeholder={isAr?"أي تفاصيل إضافية...":"Any extra details..."} onChange={e=>upd("notes",e.target.value)} />
              </PaidFieldWrap>
            </div>
            <button
              onClick={() => {
                if (!form.email.trim()) {
                  setEmailFieldError(
                    isAr
                      ? "حقل البريد الإلكتروني إجباري قبل الانتقال لخطوة الدفع."
                      : "Email is required before moving to the payment step."
                  );
                  return;
                }
                if (!isValidIntlPhone(normalizedPhone)) {
                  setPhoneFieldError(
                    isAr
                      ? "رقم الهاتف إجباري ويجب أن يكون صحيحًا مع مفتاح الدولة."
                      : "Phone is required and must be valid with a country code."
                  );
                  return;
                }
                if (!isValidIntlPhone(normalizedWhatsapp)) {
                  setWhatsappFieldError(
                    isAr
                      ? "رقم واتساب إجباري ويجب أن يكون صحيحًا مع مفتاح الدولة."
                      : "WhatsApp is required and must be valid with a country code."
                  );
                  return;
                }
                setEmailFieldError("");
                setPhoneFieldError("");
                setWhatsappFieldError("");
                if(valid1) setStep(2);
              }}
              style={{ ...btnStyle(valid1?goldGrad:t.border), opacity:valid1?1:0.5 }}
            >
              {isAr?"التالي — اختر طريقة الدفع ←":"Next — Choose Payment →"}
            </button>
            {renderCancelCurrentPaidRequestButton()}
          </div>
        )}

        {step === 2 && (
          <div>
            {/* بطاقة السعر */}
            <div style={{ ...card, background:`linear-gradient(135deg,${t.gold}20,${t.gold}08)`, border:`1px solid ${t.gold}44`, textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#e53e3e", fontWeight:700, marginBottom:6 }}>🔥 {isAr?"سعر العرض المحدود":"Limited Offer Price"}</div>
              <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:14, marginBottom:6 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:900, color:t.gold, lineHeight:1 }}>${currentPrice}</div>
                  <div style={{ fontSize:10, color:"#22c55e", fontWeight:700 }}>{isAr?"السعر الحالي":"Current Price"}</div>
                </div>
                <div style={{ width:1, height:40, background:t.border }} />
                <div style={{ textAlign:"center", opacity:0.6 }}>
                  <div style={{ fontSize:20, fontWeight:700, color:t.subText, textDecoration:"line-through" }}>${originalPrice}</div>
                  <div style={{ fontSize:10, background:"#e53e3e", color:"#fff", borderRadius:6, padding:"2px 6px", fontWeight:700 }}>{isAr?"خصم 50٪":"50% OFF"}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:t.subText }}>{isAr?"الخدمة: ":"Service: "}<strong style={{ color:t.text }}>{selectedService?.label}</strong></div>
              {requiresSubService && (
                <div style={{ fontSize:11, color:t.subText, marginTop:4 }}>
                  {isAr ? "الخدمة الفرعية ستكون مطلوبة قبل الانتقال للدفع." : "A sub-service is required before continuing to payment."}
                </div>
              )}
              {!!selectedService?.features?.length && (
                <div style={{ marginTop:10, display:"grid", gap:6, textAlign:isAr?"right":"left" }}>
                  {selectedService.features.map((feature, idx) => (
                    <div key={idx} style={{ fontSize:11, color:t.text }}>✓ {feature}</div>
                  ))}
                </div>
              )}
            </div>
            {/* طرق الدفع */}
            <div style={card}>
              <PaidSectionHead icon="💳" label={isAr?"اختر طريقة الدفع":"Choose Payment Method"} t={t} />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:7 }}>
                {Object.entries(banks).map(([key,bank]) => (
                  <button key={key}
                    onClick={() => handlePaymentMethodSelect(key)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", gap:5, width:"100%", minHeight:82, padding:"8px 6px", borderRadius:12, border:`2px solid ${form.paymentMethod===key?bank.color:t.border}`, background: form.paymentMethod===key?`${bank.color}15`:t.cardBg, cursor:"pointer", fontFamily:"'Cairo',sans-serif", opacity: bank.disabled ? 0.82 : 1, textAlign:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", gap:8 }}>
                      {bank.soon ? <div style={{ fontSize:8.5, background:"rgba(239,68,68,0.16)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.45)", borderRadius:999, padding:"2px 6px", fontWeight:900, boxShadow:"0 0 12px rgba(239,68,68,0.28)" }}>{isAr?"قريبًا":"Soon"}</div> : <span />}
                      {renderPaymentMethodIcon(key, bank)}
                    </div>
                    <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", width:"100%" }}>
                      <div style={{ fontSize:11, fontWeight:800, color:t.text, marginBottom:2 }}>{isAr?bank.label:bank.labelEn}</div>
                      <div style={{ fontSize:8.5, color:t.subText, lineHeight:1.45 }}>
                        {bank.soonOptions
                          ? (isAr ? "اعرض الخيارات المتاحة بالداخل" : "Open to view the available options")
                          : bank.disabled
                            ? (isAr ? "قريبًا بدون إدخال بيانات بطاقات الآن" : "Coming soon without card fields for now")
                            : (isAr ? "اعرض البيانات ثم ارفع إيصال التحويل" : "Open details, then attach the transfer receipt")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {coinsSoonModalOpen && (
              <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.35)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                <div style={{ width:"100%", maxWidth:390, borderRadius:24, padding:"20px 18px 16px", background:"linear-gradient(160deg,#fff8e8 0%,#fff2d8 55%,#ffe9bf 100%)", border:"1px solid rgba(245,158,11,0.42)", boxShadow:"0 20px 60px rgba(245,158,11,0.22), 0 0 28px rgba(251,191,36,0.35)", position:"relative", textAlign:isAr?"right":"left", fontFamily:"'Cairo',sans-serif" }}>
                  <button
                    onClick={() => setCoinsSoonModalOpen(false)}
                    style={{ position:"absolute", top:10, left:10, border:"1px solid rgba(148,163,184,0.35)", background:"rgba(255,255,255,0.7)", color:"#475569", borderRadius:10, padding:"5px 10px", fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}
                  >
                    {isAr ? "إغلاق" : "Close"}
                  </button>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
                    <div style={{ position:"relative", width:44, height:44 }}>
                      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"linear-gradient(145deg,#fbbf24,#f59e0b)", boxShadow:"inset 0 2px 5px rgba(255,255,255,0.45), 0 8px 18px rgba(180,83,9,0.28)", border:"1px solid rgba(180,83,9,0.35)" }} />
                      <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#7c2d12", fontFamily:"'Cairo',sans-serif" }}>C</div>
                    </div>
                  </div>
                  <div style={{ fontSize:16, fontWeight:900, color:"#b45309", textAlign:"center", marginBottom:8 }}>
                    {isAr ? "نظام الكوينز قريبًا" : "Coins System Coming Soon"}
                  </div>
                  <div style={{ fontSize:12, color:"#6b4f1f", lineHeight:1.85, textAlign:"center" }}>
                    {isAr
                      ? "الفكرة: بعد إكمال كل خدمة تحصل على كوينز (مثال: 20 كوينز لكل خدمة). عند جمع 100 كوينز يمكنك طلب خدمة مدفوعة مجانية."
                      : "Idea: after each completed service, you earn coins (for example 20 coins per service). When you collect 100 coins, you can redeem one paid service for free."}
                  </div>
                  <div style={{ marginTop:10, textAlign:"center", fontSize:11, fontWeight:800, color:"#a16207" }}>
                    {isAr ? `إغلاق تلقائي خلال ${coinsSoonCountdown} ثوانٍ` : `Auto close in ${coinsSoonCountdown}s`}
                  </div>
                </div>
              </div>
            )}
            {deleteConfirmOrder && (
              <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setDeleteConfirmOrder(null)}>
                <div style={{ width:"100%", maxWidth:360, borderRadius:22, padding:"28px 22px 22px", background:"linear-gradient(160deg,#1a0404 0%,#2d0808 55%,#3f0a0a 100%)", border:"1px solid rgba(239,68,68,0.5)", boxShadow:"0 0 40px rgba(239,68,68,0.45), 0 20px 60px rgba(0,0,0,0.6)", textAlign:"center", fontFamily:"'Cairo',sans-serif", position:"relative" }} onClick={e => e.stopPropagation()}>
                  <div style={{ width:54, height:54, borderRadius:"50%", background:"linear-gradient(145deg,#ef4444,#b91c1c)", boxShadow:"0 0 28px rgba(239,68,68,0.7), inset 0 2px 6px rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:24 }}>🗑️</div>
                  <div style={{ fontSize:16, fontWeight:900, color:"#fca5a5", marginBottom:8 }}>{isAr ? "حذف الطلب" : "Delete Order"}</div>
                  <div style={{ fontSize:12, color:"#fca5a580", marginBottom:20, lineHeight:1.8 }}>
                    {isAr ? "هل تريد حذف هذا الطلب نهائيًا من النظام؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to permanently delete this order? This action cannot be undone."}
                  </div>
                  <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                    <button onClick={() => setDeleteConfirmOrder(null)} style={{ flex:1, padding:"10px 0", borderRadius:12, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)", color:"#fca5a5", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>
                    <button onClick={handleAdminDeleteConfirmed} style={{ flex:1, padding:"10px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow:"0 0 18px rgba(239,68,68,0.5)", color:"#fff", fontSize:13, fontWeight:900, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                      {isAr ? "حذف نهائي" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {googlePaySoonModalOpen && (
              <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.35)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                <div style={{ width:"100%", maxWidth:360, borderRadius:20, padding:"18px 16px", background: dark ? "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)" : "linear-gradient(160deg,#ffffff 0%,#f8fafc 100%)", border:`1px solid ${dark ? "rgba(148,163,184,0.32)" : "rgba(148,163,184,0.28)"}`, boxShadow: dark ? "0 18px 50px rgba(2,6,23,0.45)" : "0 16px 45px rgba(15,23,42,0.18)", textAlign:"center", fontFamily:"'Cairo',sans-serif" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
                    <div style={{ minWidth:92, height:36, borderRadius:999, padding:"0 12px", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, background: dark ? "rgba(15,23,42,0.55)" : "#ffffff", border:`1px solid ${dark ? "rgba(148,163,184,0.4)" : "rgba(148,163,184,0.35)"}`, boxShadow: dark ? "0 8px 20px rgba(2,6,23,0.35)" : "0 8px 20px rgba(15,23,42,0.12)" }}>
                      <span style={{ width:18, height:18, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", background:"linear-gradient(145deg,#34a853,#16a34a)" }}>G</span>
                      <span style={{ fontSize:12, fontWeight:900, color: dark ? "#e2e8f0" : "#0f172a", letterSpacing:0.2 }}>Pay</span>
                    </div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:900, color: dark ? "#f8fafc" : "#0f172a", marginBottom:6 }}>
                    {isAr ? "قريبا سيتم تفعيل الخدمة" : "Service will be activated soon"}
                  </div>
                  <div style={{ fontSize:11, color: dark ? "#cbd5e1" : "#475569" }}>
                    {isAr ? `إغلاق تلقائي خلال ${googlePaySoonCountdown} ثوانٍ` : `Auto close in ${googlePaySoonCountdown}s`}
                  </div>
                </div>
              </div>
            )}
            <div style={{ display:"grid", gap:10 }}>
              <button onClick={() => setStep(1)} style={{ ...btnStyle(t.inputBg, t.text), boxShadow:"none", border:`1px solid ${t.border}` }}>{isAr?"→ السابق":"← Back"}</button>
              {renderCancelCurrentPaidRequestButton()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SCREEN: paymentInfo ───────────────────────────────────────────────────
  if (screen === "paymentInfo" && paymentMethodConfig) {
    return (
      <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
        {requestLimitNoticeNode}
        {!!firebaseSubmitError && (
          <div style={{ ...card, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.24)", color:"#b91c1c" }}>
            <div style={{ fontSize:13, fontWeight:800, marginBottom:4 }}>{isAr?"تعذر إكمال الطلب على Firebase":"Firebase submission failed"}</div>
            <div style={{ fontSize:12, lineHeight:1.8 }}>{firebaseSubmitError}</div>
            {!!firebaseFallbackTicket && (
              <div style={{ marginTop:10, borderTop:"1px dashed rgba(185,28,28,0.35)", paddingTop:10 }}>
                <div style={{ fontSize:12, fontWeight:900, marginBottom:6 }}>
                  {isAr ? `رقم الطلب الخاص: ${firebaseFallbackTicket.serial}` : `Support order number: ${firebaseFallbackTicket.serial}`}
                </div>
                <a
                  href={firebaseFallbackTicket.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:6,
                    padding:"9px 12px",
                    borderRadius:10,
                    textDecoration:"none",
                    fontSize:12,
                    fontWeight:900,
                    background:"#16a34a",
                    color:"#fff",
                  }}
                >
                  {isAr ? "واتساب الدعم وإرسال المشكلة" : "Contact support on WhatsApp"}
                </a>
              </div>
            )}
          </div>
        )}
        {paymentMethodConfig.soonOptions ? (
          <>
            <div style={{ ...card, border:`1px solid ${paymentMethodConfig.color}55`, background:`${paymentMethodConfig.color}12` }}>
              <div style={{ fontSize:18, fontWeight:900, color:paymentMethodConfig.color, marginBottom:10, textAlign:"center" }}>
                {paymentMethodConfig.icon} {isAr ? paymentMethodConfig.label : paymentMethodConfig.labelEn}
              </div>
              <div style={{ fontSize:12, color:t.subText, lineHeight:1.8, textAlign:"center" }}>
                {isAr ? paymentMethodConfig.hint : paymentMethodConfig.hintEn}
              </div>
            </div>
            <div style={{ ...card, background:"#f8fafc", border:`1px solid ${t.border}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:10 }}>
                {paymentMethodConfig.soonOptions.map((option) => (
                  <div key={option.label} style={{ border:`1px solid ${t.border}`, borderRadius:14, padding:"16px 12px", background:t.cardBg, textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{option.icon}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:t.text, marginBottom:6 }}>{isAr ? option.label : option.labelEn}</div>
                    <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"4px 10px", borderRadius:999, border:"1px solid #64748b33", background:"#64748b18", color:"#64748b", fontSize:10, fontWeight:800 }}>
                      {isAr ? "قريبًا" : "Soon"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderCancelCurrentPaidRequestButton()}
          </>
        ) : (
          <>
            <div style={{ ...card, border:`1px solid ${paymentMethodConfig.color}55`, background:`${paymentMethodConfig.color}12` }}>
              <div style={{ fontSize:18, fontWeight:900, color:paymentMethodConfig.color, marginBottom:14, textAlign:"center" }}>
                {paymentMethodConfig.icon} {isAr ? paymentMethodConfig.label : paymentMethodConfig.labelEn}
              </div>
              {paymentMethodConfig.details.map((item) => (
                <div key={`${item.label}-${item.value}`} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 0", borderBottom:`1px solid ${t.border}` }}>
                  <span style={{ fontSize:12, color:t.subText }}>{isAr ? item.label : item.labelEn}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:t.text, direction:"ltr", textAlign:"left" }}>{item.value}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 0" }}>
                <span style={{ fontSize:12, color:t.subText }}>{isAr?"المبلغ":"Amount"}</span>
                <span style={{ fontSize:12, fontWeight:800, color:t.gold, direction:"ltr" }}>{amountText}</span>
              </div>
            </div>
            <div style={{ ...card, background:"#fef3c718", border:"1px solid #fbbf2440" }}>
              <div style={{ fontSize:12, color:"#92400e", lineHeight:1.8, marginBottom:12 }}>⚠️ {isAr ? paymentMethodConfig.hint : paymentMethodConfig.hintEn}</div>
              <input id={receiptInputId} type="file" accept="image/*,.pdf" onChange={handleReceiptChange} style={{ display:"none" }} />
              <label htmlFor={receiptInputId} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, border:`1px dashed ${t.gold}`, background:t.cardBg, color:t.gold, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                📎 {isAr?"إضافة إيصال التحويل":"Attach Transfer Receipt"}
              </label>
              <div style={{ marginTop:8, fontSize:11, color:t.subText, textAlign:"center" }}>
                {isAr?"الحد الأقصى لحجم الإيصال: 2 ميجابايت":"Maximum receipt size: 2 MB"}
              </div>
              <div style={{ marginTop:10, fontSize:11, color: form.receiptName ? "#16a34a" : "#dc2626", fontWeight:700 }}>
                {form.receiptName
                  ? (isAr ? `تم إرفاق الإيصال: ${form.receiptName}` : `Receipt attached: ${form.receiptName}`)
                  : (isAr ? "الإيصال مطلوب قبل تأكيد الدفع" : "Receipt is required before confirming payment")}
              </div>
            </div>
            <button onClick={() => { const o = buildOrder(); void confirmOrder(o); }} disabled={!form.receiptName || isSubmittingOrder} style={{ ...btnStyle(form.receiptName && !isSubmittingOrder ? goldGrad : t.border), opacity: form.receiptName && !isSubmittingOrder ? 1 : 0.45 }}>
              ✅ {isSubmittingOrder
                ? (submitStage === "receipt"
                  ? (isAr
                    ? `جارٍ رفع الإيصال... ${Math.min(Math.floor(submitStageElapsedMs / 1000), Math.floor(RECEIPT_UPLOAD_TIMEOUT_MS / 1000))}ث`
                    : `Uploading receipt... ${Math.min(Math.floor(submitStageElapsedMs / 1000), Math.floor(RECEIPT_UPLOAD_TIMEOUT_MS / 1000))}s`)
                  : submitStage === "email"
                    ? (isAr ? "جارٍ تجهيز الإيميل..." : "Preparing emails...")
                    : (isAr ? "جارٍ حفظ الطلب..." : "Saving order..."))
                : (isAr?"تأكيد الدفع وإرسال الطلب":"Confirm Payment & Submit Request")}
            </button>
            {isSubmittingOrder && submitStage === "receipt" && (
              <div style={{ ...card, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.22)", color:"#92400e", padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:800, marginBottom:4 }}>
                  {isAr
                    ? `مهلة رفع الإيصال الحالية ${Math.floor(RECEIPT_UPLOAD_TIMEOUT_MS / 1000)} ثانية.`
                    : `The current receipt upload timeout is ${Math.floor(RECEIPT_UPLOAD_TIMEOUT_MS / 1000)} seconds.`}
                </div>
                <div style={{ fontSize:11, lineHeight:1.8 }}>
                  {submitStageElapsedMs >= RECEIPT_UPLOAD_NOTICE_MS
                    ? (isAr
                      ? "الرفع متأخر. إذا لم يكتمل سريعًا سنكمل إرسال الطلب ونؤجل ربط الإيصال بدل ما يفضل معلق."
                      : "The upload is taking longer than expected. If it does not finish soon, the order will continue and the receipt will be deferred instead of hanging.")
                    : (isAr
                      ? "إذا تأخر الرفع لن يظل الطلب معلقًا طويلًا، وسيتم تحويله تلقائيًا إلى وضع مؤجل عند تجاوز المهلة."
                      : "If the upload is slow, the request will not stay stuck for long and will automatically switch to deferred mode after the timeout.")}
                </div>
              </div>
            )}
            {renderCancelCurrentPaidRequestButton()}
          </>
        )}
      </div>
    );
  }

  // ── SCREEN: confirm ───────────────────────────────────────────────────────
  if (screen === "confirm" && currentOrder) return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
      <div style={{ ...card, background:"linear-gradient(135deg,#22c55e20,#16a34a10)", border:"1px solid #22c55e44", textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:6 }}>✅</div>
        <div style={{ fontSize:18, fontWeight:900, color:"#22c55e", marginBottom:4 }}>{isAr?"تم إرسال الطلب وتأكيد الدفع":"Payment Confirmed and Request Sent"}</div>
        <div style={{ fontSize:12, color:t.subText }}>{isAr?"تم إرسال بيانات الطلب تلقائيًا إلى بريدك الإلكتروني":"The order details were emailed automatically"}</div>
        <div style={{ fontSize:11, fontWeight:800, marginTop:7, color: "#ffffff" }}>
          {orderEmailStatus === "sending"
            ? (isAr ? "جارٍ إرسال الإيميل تلقائيًا في الخلفية..." : "Sending email automatically in background...")
            : orderEmailStatus === "sent"
              ? (isAr ? "تم إرسال الإيميل بنجاح." : "Email sent successfully.")
              : orderEmailStatus === "failed"
                ? (isAr ? "حفظ الطلب تم بنجاح، وتعذر إرسال الإيميل تلقائيًا الآن." : "Order saved successfully, but automatic email failed for now.")
                : ""}
        </div>
        <div style={{ fontSize:11, color:t.gold, fontWeight:800, marginTop:8 }}>
          {isAr ? "لن يتم التحويل تلقائيًا. اضغط زر الإغلاق عند الانتهاء." : "No automatic redirect. Use the close button when you are done."}
        </div>
        {orderEmailStatus === "failed" && (
          <button
            type="button"
            disabled={orderEmailRetryBusy}
            onClick={async () => {
              if (!currentOrder || orderEmailRetryBusy) return;
              setOrderEmailRetryBusy(true);
              setOrderEmailStatus("sending");
              const retryResult = await sendOrderEmails(currentOrder);
              const retryStatus = retryResult?.ok ? "sent" : "failed";
              const retryErrorCode = String(retryResult?.errorCode || "");
              const retryUpdatedAt = new Date().toISOString();
              setOrderEmailStatus(retryStatus);

              if (currentOrder?.firebaseId) {
                updateOrderInFirebase(currentOrder.firebaseId, {
                  emailDeliveryStatus: retryStatus,
                  emailDeliveryUpdatedAt: retryUpdatedAt,
                  emailDeliveryError: retryStatus === "failed" ? (retryErrorCode || "manual-retry-failed") : "",
                }).catch((error) => {
                  console.error("Manual retry email status update failed", error);
                });
              }

              setExistingOrders((prev) => {
                const merged = prev.map((entry) => (
                  entry.serial === currentOrder.serial
                    ? {
                      ...entry,
                      emailDeliveryStatus: retryStatus,
                      emailDeliveryUpdatedAt: retryUpdatedAt,
                      emailDeliveryError: retryStatus === "failed" ? (retryErrorCode || "manual-retry-failed") : "",
                    }
                    : entry
                ));
                try { localStorage.setItem(storageKey, JSON.stringify(merged)); } catch {}
                return merged;
              });

              setCurrentOrder((prev) => prev?.serial === currentOrder.serial
                ? {
                  ...prev,
                  emailDeliveryStatus: retryStatus,
                  emailDeliveryUpdatedAt: retryUpdatedAt,
                  emailDeliveryError: retryStatus === "failed" ? (retryErrorCode || "manual-retry-failed") : "",
                }
                : prev);

              setOrderEmailRetryBusy(false);
            }}
            style={{
              marginTop: 10,
              padding: "7px 12px",
              borderRadius: 10,
              border: `1px solid ${t.gold}`,
              background: "transparent",
              color: t.gold,
              fontSize: 11,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: orderEmailRetryBusy ? "not-allowed" : "pointer",
              opacity: orderEmailRetryBusy ? 0.65 : 1,
            }}
          >
            {orderEmailRetryBusy
              ? (isAr ? "جارٍ إعادة الإرسال..." : "Retrying...")
              : (isAr ? "إعادة إرسال الإيميل" : "Retry Email")}
          </button>
        )}
      </div>
      <div style={card}>
        <PaidSectionHead icon="📋" label={isAr?"ملخص الطلب":"Order Summary"} t={t} />
        {[[isAr?"رقم الطلب":"Order Serial",currentOrder.serial,t.gold],[isAr?"الخدمة":"Service",currentOrder.service],[isAr?"السعر":"Price",`$${currentOrder.price || 10}`],[isAr?"الدولة":"Country",currentOrder.country],[isAr?"المدينة":"City",currentOrder.city],[isAr?"طريقة الدفع":"Payment Method",currentOrder.paymentMethod],[isAr?"نوع الدفع":"Billing Type",currentOrder.billingLabel],[isAr?"الإيصال":"Receipt",currentOrder.receiptName || (isAr?"مرفق":"Attached")],[isAr?"تاريخ الطلب":"Order Date",currentOrder.dateStr]].map(([k,v,c]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
            <span style={{ fontSize:12, color:t.subText }}>{k}</span>
            <span style={{ fontSize:12, fontWeight:700, color:c||t.text }}>{v}</span>
          </div>
        ))}
      </div>
      <PaidOrderTimeline lang={lang} currentStep={1} t={t} />
      <div style={{ display:"flex", gap:10, marginTop:8 }}>
        <button onClick={() => setScreen("status")} style={{ ...btnStyle(goldGrad), flex:2 }}>{isAr?"متابعة حالة الطلب 📊":"Track Order Status 📊"}</button>
        <button onClick={() => goToOrdersOverview()} style={{ ...btnStyle("#dc2626"), flex:1 }}>{isAr?"إغلاق":"Close"}</button>
        <button onClick={() => { setScreen("list"); setSelectedService(null); setForm(f=>({...f,paymentMethod:"",receiptName:"",receiptMeta:null,receiptFile:null})); }} style={{ ...btnStyle(t.inputBg,t.gold), flex:1, boxShadow:"none", border:`1px solid ${t.gold}` }}>{isAr?"رئيسية":"Home"}</button>
      </div>
    </div>
  );

  // ── SCREEN: status ────────────────────────────────────────────────────────
  if (screen === "status" && currentOrder) {
    const steps = isAr ? STATUS_STEPS_AR : STATUS_STEPS_EN;
    const safeOrder = hydratePaidOrder(currentOrder);
    const nextPendingIndex = getNextPendingStageIndex(safeOrder);
    const allStagesConfirmed = nextPendingIndex === -1;
    const reviewDaysRemaining = Math.max(0, 30 - daysPassed);
    return (
      <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
        <div style={{ ...card, background:t.goldBg, border:`1px solid ${t.gold}33` }}>
          <div style={{ fontSize:12, color:t.subText, marginBottom:2 }}>{isAr?"رقم الطلب":"Order #"}</div>
          <div style={{ fontSize:14, fontWeight:900, color:t.gold, marginBottom:4, direction:"ltr" }}>{safeOrder.serial}</div>
          <div style={{ fontSize:12, color:t.text, fontWeight:700 }}>{safeOrder.service}</div>
          <div style={{ fontSize:11, color:t.subText }}>{safeOrder.dateStr}</div>
        </div>
        <div style={card}>
          {[[isAr?"الدولة":"Country",safeOrder.country],[isAr?"المدينة":"City",safeOrder.city],[isAr?"طريقة الدفع":"Payment",safeOrder.paymentMethod],[isAr?"الإيصال":"Receipt",safeOrder.receiptName || (isAr?"مرفق":"Attached")],[isAr?"السعر":"Price",`$${safeOrder.price || 10}`]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ fontSize:11, color:t.subText }}>{k}</span>
              <span style={{ fontSize:11, fontWeight:700, color:t.text }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <PaidSectionHead icon="📊" label={isAr?"حالة الخدمة وتأكيد العميل":"Service Status and Client Confirmation"} t={t} />
          <div style={{ fontSize:11, color:t.subText, lineHeight:1.8, marginBottom:12 }}>
            {isAr?"كل مرحلة تحتاج تأكيدًا منك مرة واحدة فقط. قبل التأكيد تظهر بالأحمر وبعد التأكيد تتحول للأخضر مع وهج خفيف.":"Each stage needs a one-time client confirmation. It shows red before confirmation and glows green after confirmation."}
          </div>
          {steps.map((s,i) => {
            const confirmed = !!safeOrder.stageConfirmations[s.key];
            const currentAction = !confirmed && i === nextPendingIndex;
            const locked = !confirmed && nextPendingIndex !== -1 && i > nextPendingIndex;
            return (
              <div key={s.key} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start", paddingBottom:10, borderBottom:i < steps.length-1 ? `1px solid ${t.border}` : "none" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, background: confirmed ? "#22c55e" : "#dc2626", border:`2px solid ${confirmed ? "#22c55e" : "#dc2626"}`, color:"#fff", boxShadow: confirmed ? "0 0 18px rgba(34,197,94,0.35)" : currentAction ? "0 0 14px rgba(220,38,38,0.28)" : "none" }}>
                    {confirmed ? "✓" : s.icon}
                  </div>
                  {i < steps.length-1 && <div style={{ width:2, height:34, background:confirmed?"#22c55e":"#ef4444", marginTop:2, opacity:0.55 }} />}
                </div>
                <div style={{ flex:1, paddingTop:2 }}>
                  <div style={{ fontSize:13, fontWeight:800, color: confirmed ? "#22c55e" : "#dc2626" }}>{s.label}</div>
                  {s.duration && (
                    <div style={{ fontSize:10, color:t.subText, marginTop:2 }}>
                      ⏱ {s.duration}
                      {s.key==="inProgress" && confirmed && daysPassed>0 && (
                        <span style={{ marginRight:isAr?6:0, marginLeft:isAr?0:6, background:t.goldBg, color:t.gold, borderRadius:6, padding:"1px 6px", fontWeight:700 }}>{isAr?`اليوم ${daysPassed}`:`Day ${daysPassed}`}</span>
                      )}
                    </div>
                  )}
                  <button
                    disabled={confirmed || locked}
                    onClick={() => {
                      if (!currentAction) return;
                      syncCurrentOrder((order) => ({
                        ...order,
                        stageConfirmations: { ...order.stageConfirmations, [s.key]: true },
                        statusIndex: i,
                      }));
                    }}
                    style={{ marginTop:8, padding:"9px 14px", borderRadius:10, border: confirmed ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(220,38,38,0.35)", background: confirmed ? "rgba(34,197,94,0.14)" : "rgba(220,38,38,0.12)", color: confirmed ? "#16a34a" : "#dc2626", fontSize:12, fontWeight:800, cursor: confirmed || locked ? "default" : "pointer", opacity: locked ? 0.45 : 1, boxShadow: confirmed ? "0 0 16px rgba(34,197,94,0.14)" : currentAction ? "0 0 14px rgba(220,38,38,0.14)" : "none", fontFamily:"'Cairo',sans-serif" }}>
                    {confirmed ? (isAr?"تم التأكيد":"Confirmed") : (currentAction ? (isAr?"تأكيد المرحلة":"Confirm Stage") : (isAr?"بانتظار المرحلة السابقة":"Waiting for previous stage"))}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {allStagesConfirmed && (
          <button
            onClick={() => {
              if (safeOrder.reviewed && reviewDaysRemaining > 0) {
                setScreen("reviewLocked");
                return;
              }
              setScreen("review");
            }}
            style={{ ...btnStyle(goldGrad) }}
          >
            ⭐ {isAr?"قيّم الخدمة":"Rate Service"}
          </button>
        )}
        <button disabled={!allStagesConfirmed||!safeOrder.reviewed} onClick={() => { void handleSaveOrderSummary(safeOrder); }}
          style={{ ...btnStyle(allStagesConfirmed&&safeOrder.reviewed?"#1d4ed8":t.border), marginTop:10, opacity:(allStagesConfirmed&&safeOrder.reviewed)?1:0.4 }}>
          💾 {isAr?"حفظ الطلب":"Save Order"}
          {!(allStagesConfirmed&&safeOrder.reviewed) && <span style={{ fontSize:10, opacity:0.7 }}> ({isAr?"يتطلب إنهاء المراحل والتقييم أولاً":"Requires all stages and rating first"})</span>}
        </button>
        {safeOrder.customerSupport && (
          <button onClick={() => window.open(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(safeOrder.serial + " - دعم الخدمة")}`, "_blank")} style={{ ...btnStyle("#7c3aed"), marginTop:10 }}>
            🎧 {isAr?"خدمة العملاء":"Customer Support"}
          </button>
        )}
        {savedOrderPreview && (
          <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(15,23,42,0.58)", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px" }}>
            <div dir={dir} style={{ width:"100%", maxWidth:440, maxHeight:"82vh", overflowY:"auto", background:"linear-gradient(180deg,#fffdf7,#fff6e2)", border:"1px solid rgba(200,150,12,0.32)", borderRadius:24, boxShadow:"0 24px 70px rgba(15,23,42,0.28)", padding:"14px 14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:8 }}>
                <div style={{ fontSize:12, color:t.subText, fontWeight:800, fontFamily:"'Cairo',sans-serif" }}>
                    {isAr ? "الإغلاق يدوي عبر زر إغلاق" : "Manual close via the Close button"}
                </div>
                <button
                  onClick={() => {
                    setSavedOrderPreview(null);
                    goToOrdersOverview();
                  }}
                  style={{ border:"1px solid rgba(200,150,12,0.3)", background:"#fffaf0", color:t.gold, borderRadius:999, padding:"6px 14px", fontSize:12, fontWeight:900, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
              <div style={{ textAlign:"center", marginBottom:12 }}>
                <div style={{ fontSize:38, lineHeight:1, marginBottom:8 }}>📸</div>
                <div style={{ fontSize:21, fontWeight:900, color:t.gold, marginBottom:6 }}>{isAr ? "احفظ بيانات الطلب" : "Save Your Request"}</div>
                <div style={{ fontSize:12, color:t.subText, lineHeight:1.8 }}>
                  {isAr
                      ? "التقط صورة للشاشة واحتفظ بها للمتابعة، ثم اضغط إغلاق."
                      : "Take a screenshot for follow-up, then press Close."}
                </div>
              </div>
              <div style={{ background:"#ffffffd9", border:`1px solid ${t.border}`, borderRadius:18, padding:"12px 14px", marginBottom:12 }}>
                <div style={{ fontSize:11, color:t.subText, marginBottom:4 }}>{isAr ? "السيريال المرجعي للطلب" : "Request Reference Serial"}</div>
                <div style={{ fontSize:18, fontWeight:900, color:t.gold, direction:"ltr" }}>{savedOrderPreview.serial}</div>
              </div>
              <div style={{ background:"#fffef9", border:`1px solid ${t.border}`, borderRadius:18, padding:"0 14px" }}>
                {buildOrderSummaryRows(savedOrderPreview).map(([label, value], index, array) => (
                  <div key={`${savedOrderPreview.serial}-${label}`} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 0", borderBottom:index < array.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <span style={{ fontSize:11, color:t.subText, fontWeight:700 }}>{label}</span>
                    <span style={{ fontSize:11, color:t.text, fontWeight:900, textAlign:isAr ? "left" : "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SCREEN: review ────────────────────────────────────────────────────────
  if (screen === "review") return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
      <div style={{ ...card, textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>⭐</div>
        <div style={{ fontSize:16, fontWeight:900, color:t.text, marginBottom:4 }}>{isAr?"قيّم تجربتك معنا":"Rate Your Experience"}</div>
        <div style={{ fontSize:12, color:t.subText }}>{isAr?"رأيك يهمنا ويساعدنا على التحسين":"Your feedback helps us improve"}</div>
      </div>
      <div style={{ ...card, textAlign:"center" }}>
        <div style={{ fontSize:12, fontWeight:700, color:t.subText, marginBottom:10 }}>{isAr?"التقييم العام *":"Overall Rating *"}</div>
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:8 }}>
          {[1,2,3,4,5].map(star => (
            <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
              style={{ fontSize:32, cursor:"pointer", background:"none", border:"none", color: star<=(hoverRating||rating)?"#f59e0b":t.border, transition:"transform .1s,color .1s", transform: star<=(hoverRating||rating)?"scale(1.2)":"scale(1)" }}>★</button>
          ))}
        </div>
        {rating>0 && <div style={{ fontSize:12, color:t.gold, fontWeight:700 }}>{isAr?["","ضعيف","مقبول","جيد","جيد جداً","ممتاز"][rating]:["","Poor","Fair","Good","Very Good","Excellent"][rating]}</div>}
        {ratingError && <div style={{ fontSize:11, color:"#e53e3e", marginTop:6 }}>{isAr?"⚠️ التقييم إجباري":"⚠️ Rating is required"}</div>}
      </div>
      <div style={card}>
        <PaidSectionHead icon="💬" label={isAr?"رأيك ومقترحاتك":"Your Comment"} t={t} />
        <textarea style={{ ...inputStyle, minHeight:90, resize:"vertical" }} value={reviewText} placeholder={isAr?"شاركنا تجربتك مع الخدمة...":"Share your experience..."} onChange={e=>setReviewText(e.target.value)} />
      </div>
      <button onClick={async () => {
        if (rating === 0) {
          setRatingError(true);
          return;
        }
        const previousRating = currentOrder?.reviewed
          ? (Number(currentOrder?.rating) || null)
          : null;
        const nextReviewPayload = {
          serviceKey: currentOrder?.serviceKey || selectedService?.key || "",
          serviceName: currentOrder?.service || selectedService?.label || "",
          serviceCategory: "cv",
          country: activeCountry || "",
          rating,
          text: reviewText,
          customerName: currentOrder?.name || "",
          relatedPackage: currentOrder?.serviceKey || selectedService?.key || "",
          orderSerial: currentOrder?.serial || "",
          firebaseOrderId: currentOrder?.firebaseId || "",
        };
        syncCurrentOrder((order) => ({ ...order, reviewed:true, rating, reviewText }));
        if (currentOrder?.firebaseId) {
          try {
            await updateOrderInFirebase(currentOrder.firebaseId, {
              reviewed: true,
              rating,
              reviewText,
            });
          } catch (error) {
            console.error("Paid order review update failed", error);
          }
        }
        try {
          await saveServiceReviewToFirebase(nextReviewPayload);
        } catch (error) {
          console.error("Paid service review save failed", error);
        }
        try {
          const nextStats = await syncCvPackageStatsInFirebase(
            currentOrder?.serviceKey || selectedService?.key || "",
            {
              rating,
              previousRating,
            }
          );
          window.dispatchEvent(
            new CustomEvent("cv-package-stats-updated", {
              detail: {
                packageKey: currentOrder?.serviceKey || selectedService?.key || "",
                stats: nextStats,
              },
            })
          );
        } catch (error) {
          console.error("Paid service review stats sync failed", error);
        }
        setSharedServiceReviews((prev) => {
          const bucketKey = getServiceReviewBucketKey(activeCountry, currentOrder?.serviceKey || selectedService?.key);
          const current = prev[bucketKey] || { count: 0, avg: 0, reviews: [] };
          const nextReviews = [
            {
              id: currentOrder?.firebaseId || currentOrder?.serial || `local-${Date.now()}`,
              rating,
              text: reviewText,
              date: new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US"),
              serial: currentOrder?.serial || "",
            },
            ...current.reviews,
          ];
          const ratingValues = nextReviews.map((review) => Number(review.rating) || 0).filter(Boolean);
          return {
            ...prev,
            [bucketKey]: {
              count: ratingValues.length,
              avg: ratingValues.length ? (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1) : 0,
              reviews: nextReviews,
            },
          };
        });
        setScreen("success");
      }} style={{ ...btnStyle(goldGrad) }}>
        {isAr?"إرسال التقييم ✓":"Submit Rating ✓"}
      </button>
    </div>
  );

  if (screen === "reviewLocked" && currentOrder) {
    const safeOrder = hydratePaidOrder(currentOrder);
    const reviewDaysRemaining = Math.max(0, 30 - daysPassed);
    return (
      <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
        <div style={{ ...card, textAlign:"center", background:t.goldBg, border:`1px solid ${t.gold}30` }}>
          <div style={{ fontSize:40, marginBottom:10 }}>⏳</div>
          <div style={{ fontSize:18, fontWeight:900, color:t.gold, marginBottom:8 }}>
            {isAr ? "تعديل التقييم غير متاح الآن" : "Rating Update Is Not Available Yet"}
          </div>
          <div style={{ fontSize:13, color:t.subText, lineHeight:1.9, marginBottom:14 }}>
            {isAr
              ? "يمكن تعديل التقييم بعد مرور 30 يوم من بداية الطلب."
              : "You can update the rating after 30 days from the start of the request."}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#ffffffcc", border:`1px solid ${t.border}`, borderRadius:999, padding:"10px 16px", color:t.text, fontWeight:900, fontSize:14 }}>
            <span>{isAr ? "الأيام المتبقية" : "Days remaining"}</span>
            <span style={{ color:t.gold, direction:"ltr" }}>{reviewDaysRemaining}</span>
          </div>
          <div style={{ fontSize:11, color:t.subText, marginTop:12 }}>
            {safeOrder.serial}
          </div>
        </div>
        <button onClick={() => setScreen("status")} style={{ ...btnStyle(t.inputBg, t.gold), boxShadow:"none", border:`1px solid ${t.gold}` }}>
          {isAr ? "العودة للطلب" : "Back to Request"}
        </button>
      </div>
    );
  }

  // ── SCREEN: success ───────────────────────────────────────────────────────
  if (screen === "success") return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text, textAlign:"center", padding:"20px 0" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
      <div style={{ fontSize:22, fontWeight:900, color:t.gold, marginBottom:8 }}>{isAr?"سعداء بخدمتكم! 🌟":"Happy to Serve You! 🌟"}</div>
      <div style={{ fontSize:14, color:t.subText, marginBottom:24, lineHeight:1.8 }}>{isAr?"شكراً على ثقتكم بنا، تقييمك يساعدنا على تقديم خدمة أفضل دائماً":"Thank you for your trust. Your feedback helps us serve you better"}</div>
      <div style={{ display:"flex", gap:10, marginTop:20, flexWrap:"wrap" }}>
        <button onClick={() => { void handleSaveOrderSummary(currentOrder); }} style={{ ...btnStyle("#1d4ed8"), flex:1 }}>💾 {isAr?"حفظ الطلب":"Save Order"}</button>
        <button onClick={() => { setScreen("list"); setSelectedService(null); setCurrentOrder(null); }} style={{ ...btnStyle(t.inputBg,t.gold), flex:1, boxShadow:"none", border:`1px solid ${t.gold}` }}>{isAr?"الرئيسية":"Home"}</button>
      </div>
      {currentOrder?.customerSupport && (
        <button onClick={() => window.open(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(currentOrder.serial + " - دعم الخدمة")}`, "_blank")} style={{ ...btnStyle("#7c3aed"), marginTop:10 }}>
          🎧 {isAr?"التواصل مع خدمة العملاء":"Contact Customer Support"}
        </button>
      )}
      {savedOrderPreview && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(15,23,42,0.58)", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px" }}>
          <div dir={dir} style={{ width:"100%", maxWidth:440, maxHeight:"82vh", overflowY:"auto", background:"linear-gradient(180deg,#fffdf7,#fff6e2)", border:"1px solid rgba(200,150,12,0.32)", borderRadius:24, boxShadow:"0 24px 70px rgba(15,23,42,0.28)", padding:"14px 14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ fontSize:12, color:t.subText, fontWeight:800, fontFamily:"'Cairo',sans-serif" }}>
                  {isAr ? "الإغلاق يدوي عبر زر إغلاق" : "Manual close via the Close button"}
              </div>
              <button
                onClick={() => {
                  setSavedOrderPreview(null);
                  goToOrdersOverview();
                }}
                style={{ border:"1px solid rgba(200,150,12,0.3)", background:"#fffaf0", color:t.gold, borderRadius:999, padding:"6px 14px", fontSize:12, fontWeight:900, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
            <div style={{ textAlign:"center", marginBottom:12 }}>
              <div style={{ fontSize:38, lineHeight:1, marginBottom:8 }}>📸</div>
              <div style={{ fontSize:21, fontWeight:900, color:t.gold, marginBottom:6 }}>{isAr ? "احفظ بيانات الطلب" : "Save Your Request"}</div>
              <div style={{ fontSize:12, color:t.subText, lineHeight:1.8 }}>
                {isAr
                    ? "التقط صورة للشاشة واحتفظ بها للمتابعة، ثم اضغط إغلاق."
                    : "Take a screenshot for follow-up, then press Close."}
              </div>
            </div>
            <div style={{ background:"#ffffffd9", border:`1px solid ${t.border}`, borderRadius:18, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:11, color:t.subText, marginBottom:4 }}>{isAr ? "السيريال المرجعي للطلب" : "Request Reference Serial"}</div>
              <div style={{ fontSize:18, fontWeight:900, color:t.gold, direction:"ltr" }}>{savedOrderPreview.serial}</div>
            </div>
            <div style={{ background:"#fffef9", border:`1px solid ${t.border}`, borderRadius:18, padding:"0 14px" }}>
              {buildOrderSummaryRows(savedOrderPreview).map(([label, value], index, array) => (
                <div key={`${savedOrderPreview.serial}-${label}`} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 0", borderBottom:index < array.length - 1 ? `1px solid ${t.border}` : "none" }}>
                  <span style={{ fontSize:11, color:t.subText, fontWeight:700 }}>{label}</span>
                  <span style={{ fontSize:11, color:t.text, fontWeight:900, textAlign:isAr ? "left" : "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return null;
}
// ══════════════════════════════════════════════════════════════════════════════
//  END PaidServicesFlow
// ══════════════════════════════════════════════════════════════════════════════

