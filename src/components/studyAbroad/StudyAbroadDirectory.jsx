import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { fetchStudyAbroadOffices } from "../../services/studyAbroadOffices";
import {
  subscribeStudyOfficesInlineAdFromFirebase,
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
const STUDY_INLINE_AD_FALLBACK_IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/travel-offices-90c53.firebasestorage.app/o/studyads%2FChatGPT%20Image%20Apr%2028%2C%202026%2C%2010_52_43%20AM.png?alt=media&token=6e14882b-8807-4c82-9461-41769058ce51";
const STUDY_INLINE_AD_FALLBACK_LINK_URL = "https://wa.me/201064463650?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AD%D8%AC%D8%B2%20%D8%A7%D8%B9%D9%84%D8%A7%D9%86%20%D8%A8%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%B5%D9%81%D8%AD%D8%A9%20%D9%85%D9%83%D8%A7%D8%AA%D8%A8%20%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9";

function loadAdsenseClientScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }

  if (window.adsbygoogle) {
    return Promise.resolve(true);
  }

  const scriptId = "adsbygoogle-script";
  const existingScript = document.getElementById(scriptId);
  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6810176545596111";
    script.addEventListener("load", () => resolve(true), { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
    document.head.appendChild(script);
  });
}

function StudyAdSenseSlot({ lang = "ar", dark = false }) {
  const ref = React.useRef(null);
  const [adFilled, setAdFilled] = React.useState(false);
  const [adChecked, setAdChecked] = React.useState(false);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    let cancelled = false;
    let timer = 0;

    loadAdsenseClientScript().then((loaded) => {
      if (cancelled || !loaded) {
        setAdChecked(true);
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Keep silent if the ad network skips the request in local/dev environments.
      }

      timer = window.setTimeout(() => {
        if (cancelled) return;
      const ins = ref.current;
      if (ins && ins.getAttribute("data-ad-status") === "filled") {
        setAdFilled(true);
      }
      setAdChecked(true);
      }, 2500);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (adChecked && !adFilled) return null;

  return (
    <div style={{ margin: "0 16px 12px", overflow: "hidden", minHeight: 336, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 10, position: "relative", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block", minHeight: 336, width: "100%" }}
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
  onAdminManageAd,
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
  const [studyInlineAd, setStudyInlineAd] = useState({
    active: true,
    imageUrl: STUDY_INLINE_AD_FALLBACK_IMAGE_URL,
    linkUrl: STUDY_INLINE_AD_FALLBACK_LINK_URL,
    title: "",
    startDate: "",
    endDate: "",
  });

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

  // Study offices are fully free for any signed-in (non-guest) account — no paywall.
  const visibleOfficesByAccess = filteredOffices;

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

  const renderStudyInlineAdCard = (cardClassName) => (
    <article className={cardClassName} style={studyInlineAdImageUrl ? { padding: 0, overflow: "hidden", borderRadius: 14, position: "relative", minHeight: 336 } : { position: "relative", minHeight: 336, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {isAdminUser && typeof onAdminManageAd === "function" && (
        <button
          onClick={onAdminManageAd}
          style={{ position: "absolute", top: 6, insetInlineEnd: 8, border: "1px solid rgba(212,175,55,0.65)", background: "rgba(18,43,99,0.88)", color: "#f5d77b", borderRadius: 10, padding: "4px 9px", fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif", zIndex: 3, backdropFilter: "blur(4px)", boxShadow: "0 2px 8px rgba(0,0,0,0.28)" }}
        >
          ✏️ {lang === "ar" ? "إدارة الإعلان" : "Manage Ad"}
        </button>
      )}
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
              height: 336,
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

      <StudyAdSenseSlot lang={lang} dark={dark} />

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

      {!isAuthenticated ? null : (
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
