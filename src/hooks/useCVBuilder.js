import { useState, useEffect, useCallback, useMemo } from 'react';
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import {
  createOrderViaFirebaseFunction,
  fetchServiceOrdersFromFirebase,
  fetchCvPackageStatsFromFirebase,
  saveServiceReviewToFirebase,
  syncCvPackageStatsInFirebase,
  updateOrderInFirebase,
} from "../firebase";
import {
  isCvOrderRecord,
  createEmptyCvPackageStats,
} from '../utils/cvUtils';
import {
  buildCvPdfDocument,
  buildCvWordDocument,
  buildCvSubmissionEmail,
} from '../utils/cvExportUtils';
import {
  getRecentOrderCountWithinDays,
  getRequestLimitMessage,
  sendOrderEmails,
} from '../utils/orderUtils';

const ADMIN_EMAIL = "walidghazal46@gmail.com";

export const createInitialCvData = () => ({
  fullName: "", jobTitle: "", country: "", location: "", phone: "", whatsapp: "", email: "",
  nationality: "", maritalStatus: "", iqama: "", iqamaStatus: "transferable",
  memberships: [{ id: Date.now(), name: "", number: "", hasNo: false }],
  summary: "",
  experiences: [{ id: 1, jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: [""], projects: [] }],
  coreCompetencies: [],
  toolsSoftware: [],
  achievements: [""],
  awards: [{ id: Date.now(), name: "", issuer: "", year: "" }],
  education: [{ degree: "", major: "", university: "", year: "" }],
  certifications: [{ name: "", issuer: "", year: "" }],
  languages: [{ lang: "", level: "intermediate" }],
  keywords: "",
});

export const useCVBuilder = ({ lang = 'ar', authUser = null, guestMode = false, selectedCountry = "مصر", setModal, setAuthPreviewOpen, setAuthPreviewMode }) => {
  const [cvStep, setCvStep] = useState(0);
  const [cvUnlocked, setCvUnlocked] = useState(false);
  const [cvPdfExporting, setCvPdfExporting] = useState(false);
  const [cvMode, setCvMode] = useState(null);
  const [selectedCvPackage, setSelectedCvPackage] = useState(null);
  const [cvBuilderScreen, setCvBuilderScreen] = useState("menu");
  const [selectedCvBuilderOrder, setSelectedCvBuilderOrder] = useState(null);
  const [cvBuilderOrders, setCvBuilderOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cvBuilderOrders") || "[]");
    } catch {
      return [];
    }
  });
  const [cvBuilderRating, setCvBuilderRating] = useState(0);
  const [cvBuilderHoverRating, setCvBuilderHoverRating] = useState(0);
  const [cvBuilderReviewText, setCvBuilderReviewText] = useState("");
  const [cvBuilderReviewSubmitting, setCvBuilderReviewSubmitting] = useState(false);
  const [cvBuilderReviewError, setCvBuilderReviewError] = useState("");
  const [cvBuilderReviewSaved, setCvBuilderReviewSaved] = useState(false);
  const [cvBuilderReviewSavedAt, setCvBuilderReviewSavedAt] = useState("");
  const [cvBuilderReviewEditMode, setCvBuilderReviewEditMode] = useState(false);
  const [cvBuilderLimitNotice, setCvBuilderLimitNotice] = useState("");
  const [cvStepValidationError, setCvStepValidationError] = useState("");
  const [cvBuilderOrderSyncBusy, setCvBuilderOrderSyncBusy] = useState(false);
  const [cvBuilderOrderSyncError, setCvBuilderOrderSyncError] = useState("");
  const [compTag, setCompTag] = useState("");
  const [toolTag, setToolTag] = useState("");
  const [cvData, setCvData] = useState(createInitialCvData);
  const [cvSectionsSaved, setCvSectionsSaved] = useState({
    step0: false,
    step1: false,
    step2: false,
    step3: false,
  });
  const [cvPackageStats, setCvPackageStats] = useState({
    builder: createEmptyCvPackageStats(),
    premium: createEmptyCvPackageStats(),
    elite: createEmptyCvPackageStats(),
  });
  const [cvRealtimeOrders, setCvRealtimeOrders] = useState([]);
  const [cvRealtimeOrdersFetched, setCvRealtimeOrdersFetched] = useState(false);
  const [cvAdminAllOrders, setCvAdminAllOrders] = useState([]);

  const isNativePlatform = Capacitor.getPlatform() !== "web";
  const isGuestUser = !authUser && guestMode;

  useEffect(() => {
    try {
      localStorage.setItem("cvBuilderOrders", JSON.stringify(cvBuilderOrders));
    } catch {}
  }, [cvBuilderOrders]);

  const cvUpdate = useCallback((field, value) => setCvData(p => ({ ...p, [field]: value })), []);

  const hasValue = useCallback((value) => String(value || "").trim().length > 0, []);

  const isCvStepComplete = useCallback((stepIndex) => {
    if (stepIndex === 0) {
      const requiredStep0 = [
        cvData.fullName,
        cvData.jobTitle,
        cvData.country,
        cvData.location,
        cvData.phone,
        cvData.whatsapp,
        cvData.email,
        cvData.nationality,
        cvData.iqama,
        cvData.maritalStatus,
        cvData.iqamaStatus,
        cvData.summary,
      ];
      return requiredStep0.every(hasValue);
    }

    if (stepIndex === 1) {
      return (cvData.experiences || []).every((exp) => {
        const baseValid = hasValue(exp?.jobTitle) && hasValue(exp?.company) && hasValue(exp?.location) && hasValue(exp?.startDate);
        const endValid = exp?.current ? true : hasValue(exp?.endDate);
        const hasResponsibilities = (exp?.responsibilities || []).some((item) => hasValue(item));
        return baseValid && endValid && hasResponsibilities;
      });
    }

    if (stepIndex === 2) {
      const hasCore = (cvData.coreCompetencies || []).filter(x => String(x).trim().length > 0).length > 0;
      const hasTools = (cvData.toolsSoftware || []).filter(x => String(x).trim().length > 0).length > 0;
      const hasAchievements = (cvData.achievements || []).filter(x => String(x).trim().length > 0).length > 0;
      const hasKeywords = String(cvData.keywords || "").trim().length > 0;
      return hasCore && hasTools && hasAchievements && hasKeywords;
    }

    if (stepIndex === 3) {
      const eduValid = (cvData.education || []).every((item) => hasValue(item?.degree) && hasValue(item?.major) && hasValue(item?.university) && hasValue(item?.year));
      const certValid = (cvData.certifications || []).every((item) => hasValue(item?.name) && hasValue(item?.issuer) && hasValue(item?.year));
      const langValid = (cvData.languages || []).every((item) => hasValue(item?.lang) && hasValue(item?.level));
      const awardsValid = (cvData.awards || []).every((item) => hasValue(item?.name) && hasValue(item?.issuer) && hasValue(item?.year));
      return eduValid && certValid && langValid && awardsValid;
    }

    return true;
  }, [cvData, hasValue]);

  const getCvStepValidationMessage = useCallback((stepIndex) => {
    if (stepIndex === 0) {
      return lang === "ar"
        ? "من فضلك أكمل جميع حقول البيانات الشخصية والعضويات والملخص قبل المتابعة."
        : "Please complete all personal info, memberships, and summary fields before continuing.";
    }
    if (stepIndex === 1) {
      return lang === "ar"
        ? "من فضلك أكمل جميع حقول الخبرات وأضف مسؤولية واحدة على الأقل لكل خبرة قبل المتابعة."
        : "Please complete all experience fields and add at least one responsibility per experience before continuing.";
    }
    if (stepIndex === 2) {
      return lang === "ar"
        ? "من فضلك أكمل المهارات والأدوات والإنجازات والكلمات المفتاحية قبل المتابعة."
        : "Please complete skills, tools, achievements, and keywords before continuing.";
    }
    if (stepIndex === 3) {
      return lang === "ar"
        ? "من فضلك أكمل جميع حقول التعليم والشهادات والجوائز واللغات قبل المتابعة."
        : "Please complete all education, certification, award, and language fields before continuing.";
    }
    return "";
  }, [lang]);

  const applyCvPackageStatsUpdate = useCallback((packageKey, nextStats) => {
    if (!packageKey || !nextStats) return;
    setCvPackageStats((prev) => ({
      ...prev,
      [packageKey]: {
        requestsCount: Number(nextStats?.requestsCount) || 0,
        reviewsCount: Number(nextStats?.reviewsCount) || 0,
        ratingsTotal: Number(nextStats?.ratingsTotal) || 0,
        averageRating: Number(nextStats?.averageRating) || 0,
      },
    }));
  }, []);

  const updateCvBuilderOrderReview = useCallback((orderId, reviewMeta) => {
    let nextSelectedOrder = null;
    setCvBuilderOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedOrder = { ...order, review: reviewMeta };
        nextSelectedOrder = updatedOrder;
        return updatedOrder;
      })
    );
    if (nextSelectedOrder) {
      setSelectedCvBuilderOrder(nextSelectedOrder);
    }
  }, []);

  const mergeCvBuilderOrder = useCallback((orderId, updates) => {
    let nextSelectedOrder = null;
    setCvBuilderOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedOrder = { ...order, ...updates };
        nextSelectedOrder = updatedOrder;
        return updatedOrder;
      })
    );
    if (nextSelectedOrder) {
      setSelectedCvBuilderOrder(nextSelectedOrder);
    }
    return nextSelectedOrder;
  }, []);

  const refreshCvOrdersFromFirebase = useCallback(async (isAdmin = false) => {
    const orders = await fetchServiceOrdersFromFirebase();
    const cvOrders = (orders || []).filter(isCvOrderRecord);
    setCvRealtimeOrders(cvOrders);
    setCvRealtimeOrdersFetched(true);
    if (isAdmin) {
      setCvAdminAllOrders(cvOrders);
    } else {
      setCvAdminAllOrders([]);
    }
    return cvOrders;
  }, []);

  const generateCvBuilderSerial = () => {
    const prefix = "CV";
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
  };

  const createCvBuilderOrderSnapshot = useCallback(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const orderNumber = `CV-${Date.now()}`;
    return {
      id: `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber,
      serial: generateCvBuilderSerial(),
      packageName: lang === "ar" ? "مستخدم عادي" : "Regular User",
      createdAt: now.toISOString(),
      dateStr: now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
      monthKey,
      review: null,
      data: JSON.parse(JSON.stringify(cvData)),
    };
  }, [cvData, lang]);

  const ensureCvBuilderOrderForCurrentRequest = useCallback(() => {
    if (selectedCvBuilderOrder?.id) {
      return selectedCvBuilderOrder;
    }
    const nextOrder = createCvBuilderOrderSnapshot();
    setCvBuilderOrders((prev) => [nextOrder, ...prev]);
    setSelectedCvBuilderOrder(nextOrder);
    return nextOrder;
  }, [createCvBuilderOrderSnapshot, selectedCvBuilderOrder?.id]);

  const ensureCvBuilderOrderForCurrentRequestAsync = useCallback(async () => {
    const ensuredOrder = ensureCvBuilderOrderForCurrentRequest();
    const latestCvSnapshot = JSON.parse(JSON.stringify(cvData));
    let nextOrder = ensuredOrder;

    if (nextOrder?.id) {
      nextOrder = { ...nextOrder, data: latestCvSnapshot };
      mergeCvBuilderOrder(nextOrder.id, { data: latestCvSnapshot });
    }

    if (!nextOrder?.firebaseId) {
      const firebaseId = await createOrderViaFirebaseFunction({
        serial: nextOrder?.serial || "",
        orderNumber: nextOrder?.orderNumber || "",
        limitBucket: "cv-builder",
        serviceKey: "builder",
        service: nextOrder?.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
        providedService: nextOrder?.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
        packageName: nextOrder?.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
        serviceCategory: "cv",
        country: cvData.country || selectedCountry || "",
        city: cvData.location || "",
        name: cvData.fullName || "",
        phone: cvData.phone || "",
        email: cvData.email || "",
        whatsapp: cvData.whatsapp || "",
        date: nextOrder?.createdAt || new Date().toISOString(),
        dateStr: nextOrder?.dateStr || "",
        statusIndex: 0,
        reviewed: !!nextOrder?.review?.saved,
        rating: Number(nextOrder?.review?.rating) || 0,
        reviewText: nextOrder?.review?.text || "",
        statsCounted: !!nextOrder?.statsCounted,
        cvData: latestCvSnapshot,
      });
      nextOrder = { ...nextOrder, firebaseId, data: latestCvSnapshot };
      mergeCvBuilderOrder(nextOrder.id, { firebaseId, data: latestCvSnapshot });
    } else {
      await updateOrderInFirebase(nextOrder.firebaseId, {
        orderNumber: nextOrder?.orderNumber || "",
        serial: nextOrder?.serial || "",
        service: nextOrder?.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
        packageName: nextOrder?.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
        providedService: nextOrder?.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
        serviceCategory: "cv",
        country: cvData.country || selectedCountry || "",
        city: cvData.location || "",
        name: cvData.fullName || "",
        phone: cvData.phone || "",
        email: cvData.email || "",
        whatsapp: cvData.whatsapp || "",
        cvData: latestCvSnapshot,
      }).catch((error) => console.error("CV builder order update failed", error));
    }

    if (!nextOrder?.statsCounted) {
      const nextStats = await syncCvPackageStatsInFirebase("builder", { incrementRequest: true });
      nextOrder = { ...nextOrder, statsCounted: true };
      mergeCvBuilderOrder(nextOrder.id, { statsCounted: true });
      applyCvPackageStatsUpdate("builder", nextStats);
      window.dispatchEvent(new CustomEvent("cv-package-stats-updated", { detail: { packageKey: "builder", stats: nextStats } }));
      if (nextOrder?.firebaseId) {
        await updateOrderInFirebase(nextOrder.firebaseId, { statsCounted: true }).catch((error) => console.error("CV builder stats flag update failed", error));
      }
    }

    return nextOrder;
  }, [cvData, ensureCvBuilderOrderForCurrentRequest, lang, mergeCvBuilderOrder, selectedCountry, applyCvPackageStatsUpdate]);

  const dispatchCvBuilderOrderEmail = useCallback(async (orderLike, options = {}) => {
    const forceSend = !!options?.force;
    if (!orderLike?.id) return { ok: false, skipped: true };
    if (!forceSend && ["sending", "sent"].includes(String(orderLike?.emailDeliveryStatus || ""))) {
      return { ok: true, skipped: true, status: orderLike?.emailDeliveryStatus };
    }

    const emailUpdatedAt = new Date().toISOString();
    mergeCvBuilderOrder(orderLike.id, {
      data: JSON.parse(JSON.stringify(cvData)),
      emailDeliveryStatus: "sending",
      emailDeliveryUpdatedAt: emailUpdatedAt,
      emailDeliveryError: "",
    });

    if (orderLike?.firebaseId) {
      await updateOrderInFirebase(orderLike.firebaseId, {
        emailDeliveryStatus: "sending",
        emailDeliveryUpdatedAt: emailUpdatedAt,
        emailDeliveryError: "",
        cvData: JSON.parse(JSON.stringify(cvData)),
      }).catch((error) => console.error("CV builder email sending flag update failed", error));
    }

    const cvOrderEmailPayload = {
      firebaseId: orderLike?.firebaseId || "",
      orderNumber: orderLike?.orderNumber || "",
      serial: orderLike?.serial || orderLike?.orderNumber || "",
      service: lang === "ar" ? "طلب سيرة ذاتية - مستخدم عادي" : "CV Builder Request - Regular User",
      name: cvData.fullName || "",
      phone: cvData.phone || "",
      email: cvData.email || "",
      country: cvData.country || selectedCountry || "",
      city: cvData.location || "",
      paymentMethod: lang === "ar" ? "نموذج بيانات السيرة الذاتية" : "CV Data Form",
      billingLabel: lang === "ar" ? "إرسال بيانات السيرة الذاتية" : "CV data submission",
      dateStr: orderLike?.dateStr || new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
      receiptName: "cv-data-form",
    };

    const emailResult = await sendOrderEmails(cvOrderEmailPayload);
    const nextStatus = emailResult?.ok ? "sent" : "failed";
    const nextUpdatedAt = new Date().toISOString();

    mergeCvBuilderOrder(orderLike.id, {
      data: JSON.parse(JSON.stringify(cvData)),
      emailDeliveryStatus: nextStatus,
      emailDeliveryUpdatedAt: nextUpdatedAt,
      emailDeliveryError: nextStatus === "failed" ? (emailResult?.fallback || "background-send-failed") : "",
    });

    if (orderLike?.firebaseId) {
      await updateOrderInFirebase(orderLike.firebaseId, {
        emailDeliveryStatus: nextStatus,
        emailDeliveryUpdatedAt: nextUpdatedAt,
        emailDeliveryError: nextStatus === "failed" ? (emailResult?.fallback || "background-send-failed") : "",
        cvData: JSON.parse(JSON.stringify(cvData)),
      }).catch((error) => console.error("CV builder email delivery status update failed", error));
    }

    return { ok: nextStatus === "sent", status: nextStatus };
  }, [cvData, lang, mergeCvBuilderOrder, selectedCountry]);

  const promptCvBuilderGuestAuth = useCallback(() => {
    setCvBuilderOrderSyncError(
      lang === "ar"
        ? "سجّل الدخول أو أنشئ حسابًا أولًا لإكمال حفظ الطلب وتفعيل التصدير."
        : "Please sign in or create an account first to complete request saving and enable export."
    );
    setAuthPreviewMode("login");
    setAuthPreviewOpen(true);
  }, [lang, setAuthPreviewMode, setAuthPreviewOpen]);

  const handleCvStepChange = useCallback(async (targetStep) => {
    if (targetStep <= cvStep) {
      setCvStepValidationError("");
      setCvBuilderOrderSyncError("");
      setCvStep(targetStep);
      return;
    }

    for (let idx = cvStep; idx < targetStep; idx += 1) {
      if (!isCvStepComplete(idx)) {
        setCvStepValidationError(getCvStepValidationMessage(idx));
        return;
      }
    }

    setCvStepValidationError("");
    setCvBuilderOrderSyncError("");
    setCvStep(targetStep);

    if (targetStep === 4 && isGuestUser) {
      promptCvBuilderGuestAuth();
    }
  }, [cvStep, getCvStepValidationMessage, isCvStepComplete, isGuestUser, promptCvBuilderGuestAuth]);

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const saveNativeFileAndShare = async ({ blob, fileName, title }) => {
    const base64Data = await blobToBase64(blob);
    await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache, recursive: true });
    const fileUri = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
    await Share.share({ title, dialogTitle: title, url: fileUri.uri });
    return fileUri.uri;
  };

  const triggerFileDownload = async (blob, fileName, mimeType, previewWindow = null) => {
    const fileBlob = blob instanceof Blob ? blob : new Blob([blob], { type: mimeType });
    if (isNativePlatform) {
      return saveNativeFileAndShare({ blob: fileBlob, fileName, title: fileName });
    }
    const blobUrl = URL.createObjectURL(fileBlob);
    try {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
    try { if (previewWindow && !previewWindow.closed) previewWindow.location.href = blobUrl; } catch {}
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
  };

  const createCvPdfBlob = async (exportLang = "en") => {
    let mount = null;
    try {
      const [{ default: html2canvas }, jsPdfModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const JsPdfCtor = jsPdfModule.jsPDF || jsPdfModule.default?.jsPDF || jsPdfModule.default;
      if (!JsPdfCtor) throw new Error("jsPDF constructor is unavailable.");
      mount = document.createElement("div");
      mount.style.position = "fixed"; mount.style.left = "-10000px"; mount.style.top = "0"; mount.style.zIndex = "-1"; mount.style.pointerEvents = "none";
      mount.innerHTML = buildCvPdfDocument(cvData, exportLang);
      document.body.appendChild(mount);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const pages = Array.from(mount.querySelectorAll(".cv-pdf-page-node"));
      if (!pages.length) throw new Error("PDF pages were not rendered.");
      const pdf = new JsPdfCtor({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      for (let index = 0; index < pages.length; index += 1) {
        const canvas = await html2canvas(pages[index], { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
        const imageData = canvas.toDataURL("image/jpeg", 0.96);
        if (index > 0) pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }
      return pdf.output("blob");
    } finally { if (mount && mount.parentNode) mount.parentNode.removeChild(mount); }
  };

  const handleCvPdfDownload = async (exportLang = "en") => {
    if (cvPdfExporting) return;
    if (isGuestUser) { promptCvBuilderGuestAuth(); return; }
    if (!selectedCvBuilderOrder?.firebaseId || cvBuilderOrderSyncBusy) {
      setCvBuilderOrderSyncError(lang === "ar" ? "انتظر اكتمال حفظ الطلب وإرسال الإيميل أولًا ثم جرّب التصدير." : "Please wait until request save and email dispatch are completed, then try exporting.");
      return;
    }
    const hasCoreData = cvData.fullName.trim() && cvData.jobTitle.trim();
    if (!hasCoreData) {
      alert(lang === "ar" ? "أدخل الاسم والمسمى الوظيفي أولاً حتى يتم إنشاء ملف PDF بشكل صحيح." : "Please enter your name and job title first to generate the PDF correctly.");
      return;
    }
    setCvPdfExporting(true);
    const previewWindow = !isNativePlatform ? window.open("", "_blank") : null;
    if (previewWindow && !previewWindow.closed) {
      previewWindow.document.write(`<html><head><title>Preparing PDF</title></head><body style="font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f8fafc; color:#1e293b;"><div style="text-align:center;"><div style="font-size:18px; font-weight:700; margin-bottom:12px;">${lang === "ar" ? "جاري تجهيز ملف PDF..." : "Preparing PDF..."}</div><div style="font-size:13px; opacity:0.75;">${lang === "ar" ? "سيتم فتح الملف هنا فورًا" : "The file will open here shortly"}</div></div></body></html>`);
      previewWindow.document.close();
    }
    try {
      const pdfBlob = await createCvPdfBlob(exportLang);
      const fileNameBase = (cvData.fullName || "professional-cv").trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").toLowerCase() || "professional-cv";
      await triggerFileDownload(pdfBlob, `${fileNameBase}.pdf`, "application/pdf", previewWindow);
    } catch (error) {
      console.error("CV PDF export failed:", error);
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      alert(lang === "ar" ? "حدثت مشكلة أثناء إنشاء ملف PDF. جرّب مرة أخرى." : "There was a problem generating the PDF. Please try again.");
    } finally { setCvPdfExporting(false); }
  };

  const handleCvWordDownload = async (exportLang = "en") => {
    if (isGuestUser) { promptCvBuilderGuestAuth(); return; }
    if (!selectedCvBuilderOrder?.firebaseId || cvBuilderOrderSyncBusy) {
      setCvBuilderOrderSyncError(lang === "ar" ? "انتظر اكتمال حفظ الطلب وإرسال الإيميل أولًا ثم جرّب التصدير." : "Please wait until request save and email dispatch are completed, then try exporting.");
      return;
    }
    const hasCoreData = cvData.fullName.trim() && cvData.jobTitle.trim();
    if (!hasCoreData) {
      alert(lang === "ar" ? "أدخل الاسم والمسمى الوظيفي أولاً حتى يتم إنشاء ملف Word بشكل صحيح." : "Please enter your name and job title first to generate the Word file correctly.");
      return;
    }
    const fileNameBase = (cvData.fullName || "professional-cv").trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").toLowerCase() || "professional-cv";
    const wordDocument = buildCvWordDocument(cvData, exportLang);
    const wordBlob = new Blob(["\ufeff", wordDocument], { type: "application/msword" });
    try { await triggerFileDownload(wordBlob, `${fileNameBase}.doc`, "application/msword"); }
    catch (error) { console.error("CV Word export failed:", error); alert(lang === "ar" ? "حدثت مشكلة أثناء إنشاء ملف Word. جرّب مرة أخرى." : "There was a problem generating the Word file. Please try again."); }
  };

  const submitCvBuilderReview = async () => {
    if (!cvBuilderRating || cvBuilderReviewSubmitting || cvBuilderReviewLocked) {
      if (!cvBuilderRating) setCvBuilderReviewError(lang === "ar" ? "اختر عدد النجوم أولًا." : "Please choose a star rating first.");
      return;
    }
    setCvBuilderReviewSubmitting(true);
    setCvBuilderReviewError("");
    try {
      const currentReviewMeta = selectedCvBuilderOrder?.review || null;
      const previousRating = currentReviewMeta?.saved ? (Number(currentReviewMeta?.rating) || null) : null;
      const ensuredOrder = await ensureCvBuilderOrderForCurrentRequestAsync();
      const nextReviewPayload = {
        serviceKey: "cv-builder",
        serviceName: lang === "ar" ? "مستخدم عادي" : "Regular User",
        serviceCategory: "cv",
        country: cvData.country || selectedCountry || "",
        rating: cvBuilderRating,
        text: cvBuilderReviewText.trim(),
        customerName: cvData.fullName || "",
        relatedPackage: "builder",
        orderSerial: ensuredOrder?.serial || "",
        firebaseOrderId: ensuredOrder?.firebaseId || "",
      };
      await saveServiceReviewToFirebase(nextReviewPayload);
      const nextStats = await syncCvPackageStatsInFirebase("builder", { rating: cvBuilderRating, previousRating });
      const savedAt = new Date().toISOString();
      const nextReviewMeta = { saved: true, rating: cvBuilderRating, text: cvBuilderReviewText.trim(), savedAt };
      if (ensuredOrder?.id) updateCvBuilderOrderReview(ensuredOrder.id, nextReviewMeta);
      if (ensuredOrder?.firebaseId) {
        await updateOrderInFirebase(ensuredOrder.firebaseId, {
          reviewed: true,
          rating: cvBuilderRating,
          reviewText: cvBuilderReviewText.trim(),
          reviewSavedAt: savedAt,
          reviewMeta: nextReviewMeta,
        }).catch((error) => console.error("CV builder Firebase review update failed", error));
      }
      applyCvPackageStatsUpdate("builder", nextStats);
      window.dispatchEvent(new CustomEvent("cv-package-stats-updated", { detail: { packageKey: "builder", stats: nextStats } }));
      setCvBuilderReviewSavedAt(savedAt);
      setCvBuilderReviewSaved(true);
      setCvBuilderReviewEditMode(false);
      setSelectedCvBuilderOrder(null);
      setCvBuilderScreen("previousOrders");
    } catch (error) {
      console.error("CV builder review save failed", error);
      setCvBuilderReviewError(lang === "ar" ? "تعذر حفظ تقييم الخدمة الآن. حاول مرة أخرى." : "Unable to save the service review right now. Please try again.");
    } finally { setCvBuilderReviewSubmitting(false); }
  };

  const startCvBuilderDraftFlow = useCallback(() => {
    setSelectedCvBuilderOrder(null);
    setCvData(createInitialCvData());
    setCvStep(0);
    setCvUnlocked(false);
    setCvBuilderRating(0);
    setCvBuilderHoverRating(0);
    setCvBuilderReviewText("");
    setCvBuilderReviewSaved(false);
    setCvBuilderReviewSavedAt("");
    setCvBuilderReviewError("");
    setCvBuilderReviewEditMode(false);
    setCvStepValidationError("");
    setCvBuilderOrderSyncBusy(false);
    setCvBuilderOrderSyncError("");
    setCvBuilderScreen("form");
  }, []);

  const openCvBuilderNewRequest = useCallback(() => {
    if (getRecentOrderCountWithinDays(cvBuilderOrders, 30) >= 5) {
      setModal({ type: "requestLimit", title: lang === "ar" ? "تم الوصول إلى حد الطلبات" : "Request limit reached", msg: getRequestLimitMessage(30, lang === "ar") });
      return;
    }
    if (isGuestUser) {
      setModal({ type: "cvGuestBuilderNotice", title: lang === "ar" ? "تنبيه" : "Notice", msg: lang === "ar" ? "يمكنك إدخال البيانات كضيف، لكن قبل التصدير أو إرسال الطلب يجب تسجيل الدخول أو إنشاء حساب." : "You can enter data as a guest, but before export or request submission you must sign in or create an account." });
      return;
    }
    startCvBuilderDraftFlow();
  }, [cvBuilderOrders, isGuestUser, lang, setModal, startCvBuilderDraftFlow]);

  const cancelCurrentCvBuilderRequest = useCallback(() => {
    setSelectedCvBuilderOrder(null);
    setCvData(createInitialCvData());
    setCvStep(0);
    setCvUnlocked(false);
    setCvBuilderRating(0);
    setCvBuilderHoverRating(0);
    setCvBuilderReviewText("");
    setCvBuilderReviewSaved(false);
    setCvBuilderReviewSavedAt("");
    setCvBuilderReviewError("");
    setCvBuilderReviewEditMode(false);
    setCvStepValidationError("");
    setCvBuilderOrderSyncBusy(false);
    setCvBuilderOrderSyncError("");
    setCvBuilderScreen("menu");
  }, []);

  const openCvBuilderPreviousOrders = useCallback(() => {
    setSelectedCvBuilderOrder(null);
    setCvBuilderReviewError("");
    setCvBuilderReviewEditMode(false);
    setCvBuilderOrderSyncError("");
    setCvBuilderScreen("previousOrders");
  }, []);

  const openCvExportLangModal = useCallback((fileType) => {
    if (isGuestUser) {
      setCvBuilderOrderSyncError(lang === "ar" ? "قبل التصدير، يجب تسجيل الدخول أو إنشاء حساب." : "Before export, you must sign in or create an account.");
      promptCvBuilderGuestAuth();
      return;
    }
    if (!selectedCvBuilderOrder?.firebaseId || cvBuilderOrderSyncBusy) {
      setCvBuilderOrderSyncError(lang === "ar" ? "انتظر اكتمال حفظ الطلب وإرسال الإيميل أولًا ثم جرّب التصدير." : "Please wait until request save and email dispatch are completed, then try exporting.");
      return;
    }
    setModal({ type: "cvExportLang", title: lang === "ar" ? `اختر لغة تصدير ${fileType === "pdf" ? "PDF" : "Word"}` : `Choose ${fileType === "pdf" ? "PDF" : "Word"} export language`, fileType });
  }, [isGuestUser, lang, promptCvBuilderGuestAuth, selectedCvBuilderOrder?.firebaseId, cvBuilderOrderSyncBusy, setModal]);

  const openCvServiceEmailConfirm = useCallback(async () => {
    if (isGuestUser) {
      setCvBuilderOrderSyncError(lang === "ar" ? "قبل إرسال الطلب، يجب تسجيل الدخول أو إنشاء حساب." : "Before submitting the request, you must sign in or create an account.");
      promptCvBuilderGuestAuth();
      return;
    }
    for (let idx = 0; idx < 4; idx += 1) {
      if (!isCvStepComplete(idx)) {
        setCvStep(idx);
        setCvStepValidationError(getCvStepValidationMessage(idx));
        return;
      }
    }
    setCvStepValidationError("");
    setCvBuilderOrderSyncError("");
    let ensuredOrder = null;
    try { ensuredOrder = await ensureCvBuilderOrderForCurrentRequestAsync(); }
    catch (error) { console.error("CV builder request save failed", error); alert(lang === "ar" ? "تعذر حفظ طلب السيرة الذاتية الآن. حاول مرة أخرى." : "Unable to save your CV request right now. Please try again."); return; }

    const emailResult = await dispatchCvBuilderOrderEmail(ensuredOrder, { force: true });
    const nextStatus = emailResult?.ok ? "sent" : "failed";

    setModal({
      type: "success",
      title: lang === "ar" ? "تم إرسال الطلب" : "Request sent",
      msg: nextStatus === "sent" ? (lang === "ar" ? `تم إنشاء الطلب رقم ${ensuredOrder?.orderNumber || "-"} وإرسال الإشعار بالبريد.` : `Request ${ensuredOrder?.orderNumber || "-"} was created and email notification was sent.`) : (lang === "ar" ? `تم إنشاء الطلب رقم ${ensuredOrder?.orderNumber || "-"} لكن تعذر إرسال الإيميل حالياً.` : `Request ${ensuredOrder?.orderNumber || "-"} was created, but the email could not be sent right now.`),
    });
  }, [dispatchCvBuilderOrderEmail, ensureCvBuilderOrderForCurrentRequestAsync, getCvStepValidationMessage, isCvStepComplete, isGuestUser, lang, promptCvBuilderGuestAuth, setModal]);

  const sendCvDataByEmail = useCallback((customSubject, customBody, customOrderMeta = null) => {
    const { subject, body } = customSubject && customBody ? { subject: customSubject, body: customBody } : buildCvSubmissionEmail(cvData, customOrderMeta || { orderNumber: selectedCvBuilderOrder?.orderNumber || "", serial: selectedCvBuilderOrder?.serial || "" });
    setModal(null);
    window.open(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  }, [cvData, selectedCvBuilderOrder?.orderNumber, selectedCvBuilderOrder?.serial, setModal]);

  const cvBuilderReviewLocked = useMemo(() => {
    if (!cvBuilderReviewSaved || cvBuilderReviewEditMode) return false;
    const daysPassed = cvBuilderReviewSavedAt ? Math.floor((Date.now() - new Date(cvBuilderReviewSavedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    return daysPassed < 30;
  }, [cvBuilderReviewSaved, cvBuilderReviewEditMode, cvBuilderReviewSavedAt]);

  const cvAddExp = useCallback(() => setCvData(p => ({ ...p, experiences: [...p.experiences, { id: Date.now(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: [""], projects: [] }] })), []);
  const cvRemoveExp = useCallback((id) => setCvData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) })), []);
  const cvUpdateExp = useCallback((id, field, value) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [field]: value } : e) })), []);
  const cvAddRespLine = useCallback((id) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, responsibilities: [...e.responsibilities, ""] } : e) })), []);
  const cvUpdateResp = useCallback((id, idx, val) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r, i) => i === idx ? val : r) } : e) })), []);
  const cvRemoveResp = useCallback((id, idx) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.filter((_, i) => i !== idx) } : e) })), []);
  const cvAddProject = useCallback((id) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, projects: [...e.projects, { name: "", owner: "", cost: "", location: "" }] } : e) })), []);
  const cvUpdateProject = useCallback((id, pi, field, val) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, projects: e.projects.map((pr, i) => i === pi ? { ...pr, [field]: val } : pr) } : e) })), []);
  const cvRemoveProject = useCallback((id, pi) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, projects: e.projects.filter((_, i) => i !== pi) } : e) })), []);
  const cvAddTag = useCallback((field, val, setter) => { const v = val.trim(); if (v && !cvData[field].includes(v)) { cvUpdate(field, [...cvData[field], v]); setter(""); } }, [cvData, cvUpdate]);
  const cvRemoveTag = useCallback((field, val) => cvUpdate(field, cvData[field].filter(x => x !== val)), [cvData, cvUpdate]);
  const cvAddAchievement = useCallback(() => cvUpdate("achievements", [...cvData.achievements, ""]), [cvData.achievements, cvUpdate]);
  const cvUpdateAchievement = useCallback((i, v) => cvUpdate("achievements", cvData.achievements.map((a, idx) => idx === i ? v : a)), [cvData.achievements, cvUpdate]);
  const cvRemoveAchievement = useCallback((i) => cvUpdate("achievements", cvData.achievements.filter((_, idx) => idx !== i)), [cvData.achievements, cvUpdate]);
  const cvAddMembership = useCallback(() => setCvData(p => ({ ...p, memberships: [...p.memberships, { id: Date.now(), name: "", number: "", hasNo: false }] })), []);
  const cvUpdateMembership = useCallback((id, field, value) => setCvData(p => ({ ...p, memberships: p.memberships.map(m => m.id === id ? { ...m, [field]: value } : m) })), []);
  const cvRemoveMembership = useCallback((id) => setCvData(p => ({ ...p, memberships: p.memberships.filter(m => m.id !== id) })), []);
  const cvAddEdu = useCallback(() => cvUpdate("education", [...cvData.education, { degree: "", major: "", university: "", year: "" }]), [cvData.education, cvUpdate]);
  const cvUpdateEdu = useCallback((i, field, val) => cvUpdate("education", cvData.education.map((e, idx) => idx === i ? { ...e, [field]: val } : e)), [cvData.education, cvUpdate]);
  const cvRemoveEdu = useCallback((i) => cvUpdate("education", cvData.education.filter((_, idx) => idx !== i)), [cvData.education, cvUpdate]);
  const cvAddAward = useCallback(() => setCvData(p => ({ ...p, awards: [...(p.awards || []), { id: Date.now(), name: "", issuer: "", year: "" }] })), []);
  const cvUpdateAward = useCallback((id, field, value) => setCvData(p => ({ ...p, awards: p.awards.map(a => a.id === id ? { ...a, [field]: value } : a) })), []);
  const cvRemoveAward = useCallback((id) => setCvData(p => ({ ...p, awards: p.awards.filter(a => a.id !== id) })), []);
  const cvAddCert = useCallback(() => cvUpdate("certifications", [...cvData.certifications, { name: "", issuer: "", year: "" }]), [cvData.certifications, cvUpdate]);
  const cvUpdateCert = useCallback((i, field, val) => cvUpdate("certifications", cvData.certifications.map((c, idx) => idx === i ? { ...c, [field]: val } : c)), [cvData.certifications, cvUpdate]);
  const cvRemoveCert = useCallback((i) => cvUpdate("certifications", cvData.certifications.filter((_, idx) => idx !== i)), [cvData.certifications, cvUpdate]);
  const cvAddLang = useCallback(() => cvUpdate("languages", [...cvData.languages, { lang: "", level: "intermediate" }]), [cvData.languages, cvUpdate]);
  const cvUpdateLang = useCallback((i, field, val) => cvUpdate("languages", cvData.languages.map((l, idx) => idx === i ? { ...l, [field]: val } : l)), [cvData.languages, cvUpdate]);
  const cvRemoveLang = useCallback((i) => cvUpdate("languages", cvData.languages.filter((_, idx) => idx !== i)), [cvData.languages, cvUpdate]);

  const cvSaveSection = useCallback((sectionName) => {
    if (sectionName === "step2") {
      const hasCore = (cvData.coreCompetencies || []).filter(x => String(x).trim().length > 0).length > 0;
      const hasTools = (cvData.toolsSoftware || []).filter(x => String(x).trim().length > 0).length > 0;
      const hasAchievements = (cvData.achievements || []).filter(x => String(x).trim().length > 0).length > 0;
      const hasKeywords = String(cvData.keywords || "").trim().length > 0;
      if (hasCore && hasTools && hasAchievements && hasKeywords) {
        setCvSectionsSaved(p => ({ ...p, step2: true }));
        return true;
      }
      setCvStepValidationError(lang === "ar" ? "من فضلك أكمل جميع الحقول في هذا القسم" : "Please complete all fields in this section");
      return false;
    }
    return true;
  }, [cvData, lang]);

  return {
    cvData, setCvData, cvStep, setCvStep, cvUnlocked, setCvUnlocked, cvPdfExporting, setCvPdfExporting,
    cvMode, setCvMode, selectedCvPackage, setSelectedCvPackage, cvBuilderScreen, setCvBuilderScreen,
    selectedCvBuilderOrder, setSelectedCvBuilderOrder, cvBuilderOrders, setCvBuilderOrders,
    cvBuilderRating, setCvBuilderRating, cvBuilderHoverRating, setCvBuilderHoverRating,
    cvBuilderReviewText, setCvBuilderReviewText, cvBuilderReviewSubmitting, setCvBuilderReviewSubmitting,
    cvBuilderReviewError, setCvBuilderReviewError, cvBuilderReviewSaved, setCvBuilderReviewSaved,
    cvBuilderReviewSavedAt, setCvBuilderReviewSavedAt, cvBuilderReviewEditMode, setCvBuilderReviewEditMode,
    cvBuilderLimitNotice, setCvBuilderLimitNotice, cvStepValidationError, setCvStepValidationError,
    cvBuilderOrderSyncBusy, setCvBuilderOrderSyncBusy, cvBuilderOrderSyncError, setCvBuilderOrderSyncError,
    compTag, setCompTag, toolTag, setToolTag, cvSectionsSaved, setCvSectionsSaved,
    cvPackageStats, cvRealtimeOrders, cvRealtimeOrdersFetched, cvAdminAllOrders,
    cvBuilderReviewLocked,
    actions: {
      cvUpdate, cvAddExp, cvRemoveExp, cvUpdateExp, cvAddRespLine, cvUpdateResp, cvRemoveResp,
      cvAddProject, cvUpdateProject, cvRemoveProject, cvAddTag, cvRemoveTag, cvAddAchievement,
      cvUpdateAchievement, cvRemoveAchievement, cvAddMembership, cvUpdateMembership, cvRemoveMembership,
      cvAddEdu, cvUpdateEdu, cvRemoveEdu, cvAddAward, cvUpdateAward, cvRemoveAward, cvAddCert, cvUpdateCert, cvRemoveCert, cvAddLang, cvUpdateLang, cvRemoveLang,
      cvSaveSection, isCvStepComplete, getCvStepValidationMessage,
      handleCvStepChange, handleCvPdfDownload, handleCvWordDownload, submitCvBuilderReview,
      openCvBuilderNewRequest, cancelCurrentCvBuilderRequest, openCvBuilderPreviousOrders,
      openCvExportLangModal, openCvServiceEmailConfirm, sendCvDataByEmail,
      refreshCvOrdersFromFirebase, applyCvPackageStatsUpdate,
    }
  };
};
