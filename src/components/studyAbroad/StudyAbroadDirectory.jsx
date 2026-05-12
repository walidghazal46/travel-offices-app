import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { fetchStudyAbroadOffices } from "../../services/studyAbroadOffices";
import {
  createOrderViaFirebaseFunction,
  fetchUserOrdersFromFirebase,
  fetchUserProfileFromFirebase,
  subscribeStudyOfficesInlineAdFromFirebase,
  upsertAuthUserProfileInFirebase,
} from "../../firebase";
import FilterBar from "./FilterBar";
import OfficeCard from "./OfficeCard";
import SearchBar from "./SearchBar";
import StudyAbroadOfficeDetail from "./StudyAbroadOfficeDetail";
import styles from "../../styles/studyAbroad.module.css";

const GOVERNORATES = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "الغربية"];
const COUNTRIES = ["بريطانيا", "أمريكا", "كندا", "أستراليا", "ألمانيا", "فرنسا", "روسيا", "أوروبا"];
const RATINGS = ["ممتاز", "جيد جداً", "جيد"];
const OFFICES_PER_PAGE = 5;
const FREE_OFFICES_PREVIEW_LIMIT = 2;
const STUDY_ACCESS_BASE_PRICE_USD = 10;
const STUDY_ACCESS_DISCOUNTED_PRICE_USD = 5;
const STUDY_ACCESS_DISCOUNT_PERCENT = 50;
const STUDY_ACCESS_SERVICE_KEY = "study-offices-access";
const WHATSAPP_NUMBER = "201064463650";
const STUDY_INLINE_AD_FALLBACK_IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/travel-offices-90c53.firebasestorage.app/o/studyads%2FChatGPT%20Image%20Apr%2028%2C%202026%2C%2010_52_43%20AM.png?alt=media&token=6e14882b-8807-4c82-9461-41769058ce51";
const STUDY_INLINE_AD_FALLBACK_LINK_URL = "https://wa.me/201064463650?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AD%D8%AC%D8%B2%20%D8%A7%D8%B9%D9%84%D8%A7%D9%86%20%D8%A8%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%B5%D9%81%D8%AD%D8%A9%20%D9%85%D9%83%D8%A7%D8%AA%D8%A8%20%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9";

function generateStudyAccessOrderSerial() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `STUDY-${ts}-${rand}`;
}

function StudyAdSenseSlot() {
  const ref = React.useRef(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Keep silent if the ad network skips the request in local/dev environments.
    }
  }, []);

  return (
    <div style={{ margin: "0 16px 12px", overflow: "hidden" }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6810176545596111"
        data-ad-slot="2882839892"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

const COPY = {
  ar: {
    title: "مكاتب الدراسة بالخارج",
    subtitle: "دليل شامل لأهم مكاتب الدراسة بالخارج في مصر",
    warning: "تنبيه: تأكد من ترخيص المكتب قبل التعامل، وراجع بيانات التواصل والموقع قبل الدفع أو الحجز.",
    searchPlaceholder: "ابحث باسم المكتب أو المنطقة أو الدولة...",
    clearSearch: "مسح البحث",
    filters: "الفلاتر",
    applyFilters: "تطبيق الفلتر",
    governorate: "المحافظة",
    country: "الدولة المستهدفة",
    rating: "التقييم",
    all: "الكل",
    results: "مكتب",
    clearFilters: "مسح الفلاتر",
    loading: "جاري تحميل المكاتب...",
    empty: "لا توجد مكاتب مطابقة لبحثك الحالي.",
    retry: "إعادة المحاولة",
    call: "اتصال",
    whatsapp: "واتساب",
    countries: "الدول:",
    maps: "فتح على الخرائط",
    website: "الموقع الإلكتروني",
    official: "رسمي",
    verified: "موثق",
    adLabel: "إعلان ممول",
    adTitle: "مساحة إعلانية",
    adText: "يمكنك حجز إعلانك هنا للوصول للمستخدمين المهتمين بمكاتب الدراسة بالخارج.",
    adCta: "احجز إعلانك الآن",
    pagePrev: "السابق",
    pageNext: "التالي",
    pageOf: "صفحة",
    guestAccessTitle: "الدخول لمكاتب الدراسة يحتاج حساب",
    guestAccessMessage: "يجب تسجيل الدخول أو إنشاء حساب جديد لمشاهدة مكاتب الدراسة.",
    guestPreviewTitle: "معاينة قبل التسجيل",
    guestPreviewMessage: "يمكنك مشاهدة عينة سريعة من المكاتب قبل إنشاء حساب.",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب جديد",
    lockedOfficeNotice: "باقي المكاتب مقفلة. فعّل الوصول الكامل لمشاهدة كل المكاتب.",
    activateFullAccess: "تفعيل الوصول الكامل",
    previewCounter: "مكتب مجاني",
    accessPending: "طلب التفعيل قيد المراجعة. بعد الموافقة ستفتح كل المكاتب مباشرة.",
    accessPageTitle: "تفعيل الوصول الكامل لمكاتب الدراسة",
    accessPageSub: "خدمة مدفوعة بسيطة تمنحك مشاهدة كل مكاتب الدراسة بدون قيود.",
    basePrice: "السعر الأساسي",
    discount: "خصم",
    finalPrice: "السعر بعد الخصم",
    payNow: "إرسال طلب الدفع",
    backToOffices: "العودة إلى المكاتب",
    name: "الاسم",
    phone: "رقم الهاتف",
    whatsappNumber: "رقم واتساب",
    email: "البريد الإلكتروني",
    requiredField: "من فضلك أكمل كل البيانات المطلوبة.",
    submitFailed: "تعذر حفظ طلب الدفع الآن. حاول مرة أخرى.",
  },
  en: {
    title: "Study Abroad Offices",
    subtitle: "A curated directory of study abroad offices in Egypt",
    warning: "Important: verify office licensing, contact details, and official website before paying or booking.",
    searchPlaceholder: "Search by office name, area, or destination...",
    clearSearch: "Clear search",
    filters: "Filters",
    applyFilters: "Apply Filters",
    governorate: "Governorate",
    country: "Destination",
    rating: "Rating",
    all: "All",
    results: "offices",
    clearFilters: "Clear filters",
    loading: "Loading offices...",
    empty: "No offices matched your current search.",
    retry: "Try again",
    call: "Call",
    whatsapp: "WhatsApp",
    countries: "Countries:",
    maps: "Open maps",
    website: "Website",
    official: "Official",
    verified: "Verified",
    adLabel: "Sponsored",
    adTitle: "Ad Space",
    adText: "Book your ad here to reach users interested in study abroad offices.",
    adCta: "Book your ad now",
    pagePrev: "Previous",
    pageNext: "Next",
    pageOf: "Page",
    guestAccessTitle: "Study offices require an account",
    guestAccessMessage: "You must sign in or create a new account to view study offices.",
    guestPreviewTitle: "Preview before sign in",
    guestPreviewMessage: "You can view a quick sample of offices before creating an account.",
    login: "Sign In",
    signup: "Create Account",
    lockedOfficeNotice: "The remaining offices are locked. Activate full access to view all offices.",
    activateFullAccess: "Activate Full Access",
    previewCounter: "Free offices",
    accessPending: "Your activation request is under review. All offices will unlock once approved.",
    accessPageTitle: "Activate full access for study offices",
    accessPageSub: "A simple paid service to unlock all study offices with no limits.",
    basePrice: "Base price",
    discount: "Discount",
    finalPrice: "Price after discount",
    payNow: "Submit payment request",
    backToOffices: "Back to offices",
    name: "Name",
    phone: "Phone number",
    whatsappNumber: "WhatsApp number",
    email: "Email",
    requiredField: "Please complete all required fields.",
    submitFailed: "Unable to submit payment request right now. Please try again.",
  },
};

export default function StudyAbroadDirectory({
  lang = "ar",
  dark = false,
  isAdminUser = false,
  authUser = null,
  isGuestUser = false,
  onRequestAuth,
  onRequestAccessAuth,
  onOpenOffice,
  resetSignal = 0,
}) {
  const copy = COPY[lang] || COPY.ar;
  const authUid = String(authUser?.uid || "").trim();
  const isAuthenticated = Boolean(authUid);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    governorate: "",
    country: "",
    rating: "",
  });
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fullAccessEnabled, setFullAccessEnabled] = useState(false);
  const [studyAccessPending, setStudyAccessPending] = useState(false);
  const [paymentScreenOpen, setPaymentScreenOpen] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
  });
  const [studyInlineAd, setStudyInlineAd] = useState({
    active: true,
    imageUrl: STUDY_INLINE_AD_FALLBACK_IMAGE_URL,
    linkUrl: STUDY_INLINE_AD_FALLBACK_LINK_URL,
    title: "",
    startDate: "",
    endDate: "",
  });

  const canViewAllStudyOffices = isAdminUser || fullAccessEnabled;

  const scrollDirectoryToTop = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollTargets = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.querySelector(`.${styles.page}`),
    ].filter(Boolean);

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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

    window.requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        window.scrollTo(0, 0);
      }
    });
  }, []);

  const deferredSearchValue = useDeferredValue(searchValue);

  useEffect(() => {
    if (!authUid) {
      setFullAccessEnabled(false);
      setStudyAccessPending(false);
      setPaymentScreenOpen(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const profile = await fetchUserProfileFromFirebase(authUid);
        if (cancelled) return;

        const accessMeta = profile?.studyAccess || {};
        let hasFull = accessMeta?.fullAccess === true;
        const pendingOrderId = String(accessMeta?.pendingOrderId || "").trim();

        // Fallback: if profile still shows pending, verify the order status directly.
        // This handles cases where the admin approved but the profile update failed or is stale.
        if (!hasFull && pendingOrderId) {
          try {
            const userOrders = await fetchUserOrdersFromFirebase(authUid);
            const matchingOrder = userOrders.find(
              (o) => String(o?.firebaseId || o?.id || "").trim() === pendingOrderId
                || String(o?.serial || o?.orderNumber || "").trim() === String(accessMeta?.pendingOrderSerial || "").trim()
            );
            const isApproved = matchingOrder?.studyAccessApproved === true
              || String(matchingOrder?.status || "").toLowerCase() === "approved"
              || String(matchingOrder?.orderStatus || "").toLowerCase() === "approved";
            if (isApproved) {
              hasFull = true;
              // Silently fix the profile in the background
              upsertAuthUserProfileInFirebase({
                uid: authUid,
                studyAccess: {
                  fullAccess: true,
                  approvedAt: matchingOrder?.studyAccessApprovedAt || new Date().toISOString(),
                  approvedOrderId: pendingOrderId,
                  approvedOrderSerial: String(accessMeta?.pendingOrderSerial || "").trim(),
                  pendingOrderId: null,
                  pendingOrderSerial: null,
                },
              }).catch(() => {});
            }
          } catch {
            // ignore - fallback failed, keep hasFull as false
          }
        }

        const hasPending = !hasFull && Boolean(accessMeta?.pendingOrderId || accessMeta?.pendingOrderSerial);

        setFullAccessEnabled(hasFull);
        setStudyAccessPending(hasPending);
        setPaymentForm((prev) => ({
          name: prev.name || String(profile?.displayName || authUser?.displayName || "").trim(),
          phone: prev.phone || String(profile?.phoneNumber || authUser?.phoneNumber || "").trim(),
          whatsapp: prev.whatsapp || String(profile?.phoneNumber || authUser?.phoneNumber || "").trim(),
          email: prev.email || String(profile?.email || authUser?.email || "").trim(),
        }));
      } catch {
        if (cancelled) return;
        setFullAccessEnabled(false);
        setStudyAccessPending(false);
      } finally {
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUid, authUser?.displayName, authUser?.email, authUser?.phoneNumber]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const nextOffices = await fetchStudyAbroadOffices();
        if (!cancelled) {
          setOffices(nextOffices);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(String(nextError?.message || "Unable to load offices."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeStudyOfficesInlineAdFromFirebase((nextAd) => {
      const hasRemoteImage = Boolean(String(nextAd?.imageUrl || "").trim());
      if (hasRemoteImage) {
        setStudyInlineAd(nextAd);
        return;
      }

      setStudyInlineAd({
        active: true,
        imageUrl: STUDY_INLINE_AD_FALLBACK_IMAGE_URL,
        linkUrl: STUDY_INLINE_AD_FALLBACK_LINK_URL,
        title: "",
        startDate: "",
        endDate: "",
      });
    });

    return () => unsubscribe?.();
  }, []);

  const studyInlineAdImageUrl = String(studyInlineAd?.imageUrl || "").trim();
  const studyInlineAdLinkUrl = String(studyInlineAd?.linkUrl || "").trim() || STUDY_INLINE_AD_FALLBACK_LINK_URL;

  const filteredOffices = useMemo(() => {
    const normalizedSearch = String(deferredSearchValue || "").trim().toLowerCase();

    return offices.filter((office) => {
      if (filters.governorate && office.governorate !== filters.governorate) return false;
      if (filters.country && !office.countries?.some((country) => String(country).includes(filters.country))) return false;
      if (filters.rating && office.ratingLabel !== filters.rating) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        office.name,
        office.area,
        office.address,
        office.governorate,
        office.email,
        ...(office.countries || []),
        ...(office.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [deferredSearchValue, filters, offices]);

  const visibleOfficesByAccess = useMemo(() => {
    if (!isAuthenticated || canViewAllStudyOffices) {
      return filteredOffices;
    }
    return filteredOffices.slice(0, FREE_OFFICES_PREVIEW_LIMIT);
  }, [canViewAllStudyOffices, filteredOffices, isAuthenticated]);

  const lockedOfficesCount = useMemo(() => {
    if (!isAuthenticated || canViewAllStudyOffices) return 0;
    return Math.max(0, filteredOffices.length - visibleOfficesByAccess.length);
  }, [canViewAllStudyOffices, filteredOffices.length, isAuthenticated, visibleOfficesByAccess.length]);

  const totalPages = Math.max(1, Math.ceil(visibleOfficesByAccess.length / OFFICES_PER_PAGE));

  const pagedOffices = useMemo(() => {
    const startIndex = (currentPage - 1) * OFFICES_PER_PAGE;
    return visibleOfficesByAccess.slice(startIndex, startIndex + OFFICES_PER_PAGE);
  }, [currentPage, visibleOfficesByAccess]);

  const guestPreviewOffices = useMemo(
    () => filteredOffices.slice(0, FREE_OFFICES_PREVIEW_LIMIT),
    [filteredOffices]
  );

  const resetFilters = () => {
    startTransition(() => {
      setSearchValue("");
      setFilters({
        governorate: "",
        country: "",
        rating: "",
      });
    });
  };

  useEffect(() => {
    setSelectedOffice(null);
    setPaymentScreenOpen(false);
    setPaymentError("");
    setSearchValue("");
    setFilters({
      governorate: "",
      country: "",
      rating: "",
    });
    setCurrentPage(1);
  }, [resetSignal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchValue, filters.governorate, filters.country, filters.rating]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback((nextPage) => {
    setCurrentPage(nextPage);
    scrollDirectoryToTop();
  }, [scrollDirectoryToTop]);

  const openStudyOffice = useCallback((office) => {
    if (!office) return;
    if (typeof onOpenOffice === "function") {
      onOpenOffice();
    }
    setSelectedOffice(office);
  }, [onOpenOffice]);

  const requestStudyAuth = useCallback((mode) => {
    if (typeof onRequestAccessAuth === "function") {
      onRequestAccessAuth(mode);
      return;
    }
    onRequestAuth?.(mode);
  }, [onRequestAccessAuth, onRequestAuth]);

  const openPaymentScreen = useCallback(() => {
    setPaymentError("");
    setPaymentScreenOpen(true);
    scrollDirectoryToTop();
  }, [scrollDirectoryToTop]);

  const closePaymentScreen = useCallback(() => {
    setPaymentError("");
    setPaymentScreenOpen(false);
  }, []);

  const handlePaymentInputChange = useCallback((field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const submitStudyAccessOrder = useCallback(async () => {
    if (!authUid || paymentBusy) return;

    const cleanName = String(paymentForm.name || "").trim();
    const cleanPhone = String(paymentForm.phone || "").trim();
    const cleanWhatsapp = String(paymentForm.whatsapp || "").trim();
    const cleanEmail = String(paymentForm.email || authUser?.email || "").trim();

    if (!cleanName || !cleanPhone || !cleanWhatsapp) {
      setPaymentError(copy.requiredField);
      return;
    }

    setPaymentBusy(true);
    setPaymentError("");

    const nowIso = new Date().toISOString();
    const serial = generateStudyAccessOrderSerial();

    try {
      const orderPayload = {
        serial,
        orderNumber: serial,
        service: lang === "ar" ? "تفعيل كامل مكاتب الدراسة بالخارج" : "Full access for study offices",
        serviceKey: STUDY_ACCESS_SERVICE_KEY,
        serviceCategory: "study-access",
        price: STUDY_ACCESS_DISCOUNTED_PRICE_USD,
        basePriceUsd: STUDY_ACCESS_BASE_PRICE_USD,
        finalPriceUsd: STUDY_ACCESS_DISCOUNTED_PRICE_USD,
        discountPercent: STUDY_ACCESS_DISCOUNT_PERCENT,
        currency: "USD",
        paymentMethod: "manual-whatsapp",
        billingLabel: lang === "ar" ? "تفعيل مكاتب الدراسة" : "Study offices activation",
        status: "pending",
        orderStatus: "pending",
        reviewed: false,
        requiresReceiptUpload: false,
        name: cleanName,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        email: cleanEmail,
        userUid: authUid,
        country: "مصر",
        date: nowIso,
        createdAtClient: nowIso,
      };

      const firebaseId = await createOrderViaFirebaseFunction(orderPayload);

      await upsertAuthUserProfileInFirebase({
        uid: authUid,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        displayName: cleanName,
        providerId: cleanPhone ? "phone" : (cleanEmail ? "email" : "unknown"),
        studyAccess: {
          fullAccess: false,
          pendingOrderId: firebaseId,
          pendingOrderSerial: serial,
          lastRequestedAt: nowIso,
        },
      });

      const whatsappText = [
        "السلام عليكم، أريد تفعيل الوصول الكامل لمكاتب الدراسة.",
        "",
        `رقم الطلب: ${serial}`,
        `الاسم: ${cleanName}`,
        `الهاتف: ${cleanPhone}`,
        `الواتساب: ${cleanWhatsapp}`,
        `البريد الإلكتروني: ${cleanEmail || "-"}`,
        `السعر الأساسي: ${STUDY_ACCESS_BASE_PRICE_USD}$`,
        `الخصم: ${STUDY_ACCESS_DISCOUNT_PERCENT}%`,
        `المطلوب دفعه: ${STUDY_ACCESS_DISCOUNTED_PRICE_USD}$`,
        "",
        "برجاء إرفاق إيصال الدفع في رسائل الواتساب للمتابعة.",
      ].join("\n");

      setStudyAccessPending(true);
      setPaymentScreenOpen(false);

      if (typeof window !== "undefined") {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener,noreferrer");
      }
    } catch {
      setPaymentError(copy.submitFailed);
    } finally {
      setPaymentBusy(false);
    }
  }, [authUid, authUser?.email, copy.requiredField, copy.submitFailed, lang, paymentBusy, paymentForm.email, paymentForm.name, paymentForm.phone, paymentForm.whatsapp]);

  const renderStudyInlineAdCard = (cardClassName) => (
    <article className={cardClassName} style={studyInlineAdImageUrl ? { padding: 0, overflow: "hidden", borderRadius: 14 } : undefined}>
      {studyInlineAdImageUrl ? (
        <a
          href={studyInlineAdLinkUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            width: "100%",
            lineHeight: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={studyInlineAdImageUrl}
            alt={copy.adTitle}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              minHeight: 190,
              objectFit: "cover",
              display: "block",
            }}
          />
        </a>
      ) : (
        <>
          <span className={styles.inlineAdBadge}>{copy.adLabel}</span>
          <h3 className={styles.inlineAdTitle}>{copy.adTitle}</h3>
          <p className={styles.inlineAdText}>{copy.adText}</p>
          <a
            className={styles.inlineAdAction}
            href={STUDY_INLINE_AD_FALLBACK_LINK_URL}
            target="_blank"
            rel="noreferrer"
          >
            {copy.adCta}
          </a>
        </>
      )}
    </article>
  );

  return (
    <div
      className={styles.page}
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        "--study-primary": dark ? "#3b82f6" : "#1E3A8A",
        "--study-primary-dark": dark ? "#2563eb" : "#0f2460",
        "--study-primary-light": dark ? "rgba(59,130,246,0.16)" : "#dbeafe",
        "--study-accent": dark ? "#93c5fd" : "#1E3A8A",
        "--study-bg": dark ? "#0b1220" : "#FAFAF7",
        "--study-card-bg": dark ? "rgba(15,23,42,0.9)" : "#FFFFFF",
        "--study-text": dark ? "#e5edf9" : "#1F2937",
        "--study-text-muted": dark ? "rgba(226,232,240,0.72)" : "#6B7280",
        "--study-border": dark ? "rgba(148,163,184,0.18)" : "#E5E7EB",
        "--study-warning-bg": dark ? "rgba(245,158,11,0.14)" : "#FEF3C7",
        "--study-warning-text": dark ? "#fde68a" : "#78350F",
      }}
    >
      {selectedOffice ? (
        <StudyAbroadOfficeDetail
          office={selectedOffice}
          lang={lang}
          isAdminUser={isAdminUser}
          onRequestAuth={onRequestAuth}
          onBack={() => setSelectedOffice(null)}
        />
      ) : (
      <>
      {isAuthenticated && paymentScreenOpen ? (
        <section className={styles.accessPaywallSection}>
          <div className={styles.accessPaywallCard}>
            <h2 className={styles.accessPaywallTitle}>{copy.accessPageTitle}</h2>
            <p className={styles.accessPaywallText}>{copy.accessPageSub}</p>

            <div className={styles.accessPriceGrid}>
              <div className={styles.accessPriceItem}>
                <span>{copy.basePrice}</span>
                <strong className={styles.accessOldPrice}>${STUDY_ACCESS_BASE_PRICE_USD}</strong>
              </div>
              <div className={styles.accessPriceItem}>
                <span>{copy.discount}</span>
                <strong>{STUDY_ACCESS_DISCOUNT_PERCENT}%</strong>
              </div>
              <div className={styles.accessPriceItem}>
                <span>{copy.finalPrice}</span>
                <strong className={styles.accessFinalPrice}>${STUDY_ACCESS_DISCOUNTED_PRICE_USD}</strong>
              </div>
              <div className={styles.accessPaymentAccount}>
                <span>حساب انستا باي / محفظة كاش</span>
                <strong className={styles.accessPaymentPhone}>01064463650</strong>
              </div>
            </div>

            <div className={styles.accessFormGrid}>
              <input
                className={styles.accessInput}
                value={paymentForm.name}
                onChange={(event) => handlePaymentInputChange("name", event.target.value)}
                placeholder={copy.name}
              />
              <input
                className={styles.accessInput}
                value={paymentForm.phone}
                onChange={(event) => handlePaymentInputChange("phone", event.target.value)}
                placeholder={copy.phone}
              />
              <input
                className={styles.accessInput}
                value={paymentForm.whatsapp}
                onChange={(event) => handlePaymentInputChange("whatsapp", event.target.value)}
                placeholder={copy.whatsappNumber}
              />
              <input
                className={styles.accessInput}
                value={paymentForm.email}
                onChange={(event) => handlePaymentInputChange("email", event.target.value)}
                placeholder={copy.email}
              />
            </div>

            {paymentError ? <p className={styles.accessError}>{paymentError}</p> : null}

            <div className={styles.accessPaywallActions}>
              <button type="button" className={styles.accessBackBtn} onClick={closePaymentScreen}>
                {copy.backToOffices}
              </button>
              <button
                type="button"
                className={styles.accessPayBtn}
                onClick={submitStudyAccessOrder}
                disabled={paymentBusy}
              >
                {paymentBusy ? (lang === "ar" ? "جارٍ الإرسال..." : "Submitting...") : copy.payNow}
              </button>
            </div>
          </div>

          {renderStudyInlineAdCard(styles.accessAdCard)}
        </section>
      ) : null}

      {!paymentScreenOpen ? (
        <>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <h1 className={styles.title}>{copy.title}</h1>
              <p className={styles.subtitle}>{copy.subtitle}</p>
            </div>
          </header>

          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <p>{copy.warning}</p>
          </div>

          <StudyAdSenseSlot />
        </>
      ) : null}

      {!isAuthenticated ? (
        <section className={styles.lockedAccessSection}>
          {!loading && !error && guestPreviewOffices.length > 0 ? (
            <article className={styles.guestPreviewCard}>
              <h3 className={styles.guestPreviewTitle}>{copy.guestPreviewTitle}</h3>
              <p className={styles.guestPreviewMessage}>{copy.guestPreviewMessage}</p>
              <div className={styles.guestPreviewList}>
                {guestPreviewOffices.map((office) => (
                  <div key={office.id} className={styles.guestPreviewItem}>
                    <div className={styles.guestPreviewName}>{office.name}</div>
                    <div className={styles.guestPreviewMeta}>
                      {office.governorate}
                      {office.area ? ` - ${office.area}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          <div className={styles.lockedAccessCard}>
            <h3 className={styles.lockedAccessTitle}>{copy.guestAccessTitle}</h3>
            <p className={styles.lockedAccessMessage}>{copy.guestAccessMessage}</p>
            <div className={styles.lockedAccessActions}>
              <button type="button" className={styles.lockedAccessPrimaryBtn} onClick={() => requestStudyAuth("login")}>
                {copy.login}
              </button>
              <button type="button" className={styles.lockedAccessSecondaryBtn} onClick={() => requestStudyAuth("signup")}>
                {copy.signup}
              </button>
            </div>
          </div>
          {isGuestUser ? renderStudyInlineAdCard(styles.lockedGuestAdCard) : null}
        </section>
      ) : null}

      {isAuthenticated && !canViewAllStudyOffices && !paymentScreenOpen ? (
        <div className={styles.previewInfoBox}>
          <strong>{copy.previewCounter} : {Math.min(FREE_OFFICES_PREVIEW_LIMIT, filteredOffices.length)}</strong>
          <p>{copy.lockedOfficeNotice}</p>
          {studyAccessPending ? <span className={styles.pendingBadge}>{copy.accessPending}</span> : null}
          <button type="button" className={styles.previewActivateBtn} onClick={openPaymentScreen}>
            {copy.activateFullAccess}
          </button>
        </div>
      ) : null}

      {!isAuthenticated || paymentScreenOpen ? null : (
      <>
      <SearchBar
        value={searchValue}
        onChange={(value) => startTransition(() => setSearchValue(value))}
        placeholder={copy.searchPlaceholder}
        clearLabel={copy.clearSearch}
      />

      <FilterBar
        filters={filters}
        onChange={(value) => startTransition(() => setFilters(value))}
        governorates={GOVERNORATES}
        countries={COUNTRIES}
        ratings={RATINGS}
        labels={copy}
      />

      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          {visibleOfficesByAccess.length} {copy.results}
        </span>
        {searchValue || filters.governorate || filters.country || filters.rating ? (
          <button type="button" className={styles.clearBtn} onClick={resetFilters}>
            {copy.clearFilters}
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className={styles.stateBox}>
          <div className={styles.spinner} />
          <p>{copy.loading}</p>
        </div>
      ) : null}

      {!loading && error ? (
        <div className={styles.stateBox}>
          <p className={styles.errorText}>{error}</p>
          <button type="button" onClick={() => window.location.reload()} className={styles.retryBtn}>
            {copy.retry}
          </button>
        </div>
      ) : null}

      {!loading && !error && filteredOffices.length === 0 ? (
        <div className={styles.stateBox}>
          <p>{copy.empty}</p>
          <button type="button" onClick={resetFilters} className={styles.retryBtn}>
            {copy.clearFilters}
          </button>
        </div>
      ) : null}

      <div className={styles.cardsList}>
        {!loading && !error
          ? pagedOffices.map((office) => (
              <OfficeCard
                key={office.id}
                office={office}
                labels={copy}
                onClick={() => openStudyOffice(office)}
              />
            ))
          : null}

          {!loading && !error && lockedOfficesCount > 0 ? (
            <article className={`${styles.card} ${styles.lockedOfficeCard}`}>
              <span className={styles.lockedOfficeBadge}>🔒</span>
              <h3 className={styles.lockedOfficeTitle}>{copy.lockedOfficeNotice}</h3>
              <p className={styles.lockedOfficeText}>
                {lang === "ar"
                  ? `عدد المكاتب المقفلة حاليًا: ${lockedOfficesCount}`
                  : `Currently locked offices: ${lockedOfficesCount}`}
              </p>
              <button type="button" className={styles.lockedOfficeBtn} onClick={openPaymentScreen}>
                {copy.activateFullAccess}
              </button>
            </article>
          ) : null}

        {!loading && !error && pagedOffices.length > 0 ? renderStudyInlineAdCard(`${styles.card} ${styles.inlineAdCard}`) : null}
      </div>

      {!loading && !error && visibleOfficesByAccess.length > 0 ? (
        <div className={styles.paginationBar}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            {copy.pagePrev}
          </button>
          <span className={styles.pageInfo}>{copy.pageOf} {currentPage} / {totalPages}</span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            {copy.pageNext}
          </button>
        </div>
      ) : null}
      </>
      )}
      </>
      )}
    </div>
  );
}
