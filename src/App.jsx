import { App as CapApp } from "@capacitor/app";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  confirmNativePhoneCodeAndSync,
  createAccountPhoneRecaptcha,
  createPhoneRecaptcha,
  deleteAddedOfficeInFirebase,
  deleteOrderInFirebase,
  deleteAuthUserByAdminInFirebase,
  createOrderViaFirebaseFunction,
  consumeGoogleRedirectResult,
  fetchOfficeCustomizationsFromFirebase,
  fetchCvPackageStatsFromFirebase,
  fetchOfficeReviewsFromFirebase,
  fetchServiceOrdersFromFirebase,
  fetchUserOrdersFromFirebase,
  fetchReviewedServiceOrdersFromFirebase,
  fetchServiceProviderRequestsByUserFromFirebase,
  fetchServiceProviderRequestsFromFirebase,
  subscribeServiceProviderRequestsFromFirebase,
  subscribeServiceProviderRequestsByUser,
  fetchUserProfileFromFirebase,
  fetchUserProfilesFromFirebase,
  grantOfficeReviewCoinsIfEligible,
  getCurrentAuthUser,
  deleteOfficeReviewFromFirebase,
  saveOfficeReviewToFirebase,
  saveAddedOfficeInFirebase,
  saveOfficeOverrideInFirebase,
  saveServiceReviewToFirebase,
  sendCurrentUserPasswordReset,
  sendCurrentUserPhoneUpdateCode,
  sendPhoneVerificationCode,
  sendResetEmail,
  signInWithEmailPassword,
  signInWithGooglePopup,
  signOutCurrentUser,
  signUpWithEmailPassword,
  startNativePhoneSignIn,
  subscribeToAuthState,
  syncCvPackageStatsInFirebase,
  syncNativeAuthToWebSdk,
  updateOfficeReviewInFirebase,
  updateUserProfileStatusInFirebase,
  updateCurrentUserEmail,
  updateAuthUserProfile,
  updateOrderInFirebase,
  updateServiceProviderRequestInFirebase,
  upsertAuthUserProfileInFirebase,
  saveOrderToFirebase,
  submitServiceProviderRequestToFirebase,
  uploadReceiptToFirebase,
  verifyCurrentUserPhoneUpdateCode,
  verifyPhoneVerificationCode,
  fetchAdConfig,
} from "./firebase";
import { officesData } from "./data/offices";
import { officeIdAliases, egyptGovernorates, cityIcons, cityNamesEn, countryNamesEn } from "./data/egyptData";
import { saudiOfficesData, saudiCityIcons } from "./data/saudiOfficesData";
import { NATIONALITY_DIAL_CODES } from "./constants/index";
import { countriesData, egyptEmergency } from "./data/countriesData";
import { embassyHostCity, nationalityEmbassyFallbacks, egyptHostedEmbassies, hostedEmbassyOverrides, buildFallbackEmbassyRecord, embassyDirectory } from "./data/embassyData";
import ServiceProviderPortalFlow from "./components/ServiceProviderPortalFlow";
const PaidServicesFlow = React.lazy(() => import("./components/order/PaidServicesFlow"));
import logo from './assets/splash.png';
const PRIMARY_ADMIN_EMAIL = "walidghazal46@gmail.com";
const ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL];
const DISABLED_ADMIN_EMAILS = ["walidghazal51@yahoo.com"];
const ADMIN_SECURITY_PASSCODE_KEY = "adminSecurityPasscodeV1";
const ADMIN_SECURITY_DEFAULT_PASSCODE = "793131";



const WHATSAPP = "201064463650";
const OTHER_NATIONALITY_VALUE = "__other_nationality__";
const LINKEDIN = "https://www.linkedin.com/in/walid-ghazal-pmi-pmp%C2%AE-85208678/";
const YOUTUBE = "http://www.youtube.com/@WalidGhazal";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.travel.offices";

const T = {
  ar: {
    appTitle: "مكاتب السفريات الموثوقة",
    appSub: "Trusted Travel Offices",
    countryLabel: "الدولة",
    chooseGov: "اختر محافظتك",
    heroSub: "ابحث عن مكتب سفريات موثوق ومرخص قريب منك",
    licensedTag: "🇪🇬 شركات إلحاق العمالة المرخصة",
    searchPlaceholder: "ابحث باسم المكتب أو العنوان...",
    officesAvail: "مكتب متاح",
    noResults: "لا توجد نتائج مطابقة",
    licenseNo: "ترخيص رقم",
    mapBtn: "🗺️ افتح خرائط جوجل",
    callBtn: "📞 اتصل",
    phoneComingSoon: "— (يضاف قريباً)",
    mapHint: "💡 للبحث على الخريطة ابحث باسم المكتب والمحافظة",
    tabMinistry: "🏛️ وزارة العمل", tabEmbassy: "🏢 السفارات",
    tabEmergency: "🚨 طوارئ", tabPaid: "💳 خدمات",
    callMinistry: "📞 اتصل بوزارة العمل", callEmbassy: "📞 اتصل بالسفارة",
    emergencyIn: "أرقام الطوارئ في",
    citiesComingSoon: "🏙️ المدن المتاحة — قريباً سيتم إضافة المكاتب الموثوقة",
    unifiedPhone: "الرقم الموحد", workHours: "أوقات العمل",
    website: "الموقع الرسمي", email: "البريد الإلكتروني",
    hotline: "الخط الساخن",
    address: "العنوان", phone: "الهاتف",
    jeddah: "قنصلية جدة", whatsappLabel: "واتساب", facebookLabel: "فيسبوك",
    comingSoon: "قريباً",
    cityComingSoonMsg: "جاري العمل على مكاتب هذه المدينة، وستكون متاحة في الإصدارات القادمة إن شاء الله 🕐",
    paidComingSoonMsg: "سيتم تفعيل هذه الخدمة في الإصدار القادم إن شاء الله 🚀",
    paidServicesTitle: "💳 طلب خدمة مدفوعة",
    paidServicesSub: "اختر الخدمة المطلوبة — سيتم التفعيل في الإصدار القادم",
    visitSite: "🌐 زيارة الموقع الرسمي",
    egMinistryTitle: "🏛️ وزارة العمل المصرية",
    egEmergencyTitle: "🚨 أرقام الطوارئ في مصر",
    egPaidTitle: "💳 خدمات مدفوعة",
    closeBtn: "✕ إغلاق",
    forbiddenBtn: "شركات محظورة",
    forbiddenTitle: "⚠️ تحقق قبل التعامل",
    forbiddenDesc: "تأكد أن المكتب ليس ضمن الشركات المحظورة من قِبل وزارة العمل المصرية قبل دفع أي مبالغ.",
    forbiddenLink: "🔍 اعرض قائمة الشركات المحظورة الرسمية",
    discTitle: "إشعار هام",
    discBody: "هذا التطبيق تطبيق مستقل غير تابع لأي جهة حكومية.",
    discSub: "البيانات مأخوذة من القائمة الرسمية لوزارة العمل المصرية ولا تمثل هذه الجهة بأي شكل.",
    discEn: "This app is independently developed and is not affiliated with, endorsed by, or representing any government entity.",
    discBtn: "فهمت — أكمل للتطبيق",
    footerEgypt: "تطبيق مستقل — البيانات من وزارة العمل المصرية — غير تابع لأي جهة حكومية",
    footerOther: (countryName) => `تطبيق مستقل — لا يتبع الجهة الحكومية لـ ${countryName}`,
    // Bottom Nav
    navHome: "مكاتب السفريات",
    navCV: "التوظيف",
    navSettings: "الإعدادات",
    // CV Page
    cvTitle: "إنشاء سيرة ذاتية",
    cvSub: "أنشئ سيرتك الذاتية باحترافية في دقائق",
    cvComingSoon: "قريباً — جاري التطوير 🚀",
    cvComingSoonMsg: "خاصية إنشاء السيرة الذاتية ستكون متاحة في الإصدار القادم إن شاء الله",
    // Settings Page
    settingsTitle: "الإعدادات",
    settingsLang: "اللغة",
    settingsTheme: "وضع التطبيق",
    settingsThemeLight: "فاتح",
    settingsThemeDark: "داكن",
    settingsUpdate: "تحديث التطبيق",
    settingsUpdateDesc: "تحقق من آخر إصدار",
    settingsRate: "تقييم التطبيق",
    settingsRateDesc: "ساعدنا بتقييمك على المتجر",
    settingsSupport: "الدعم الفني",
    settingsSupportDesc: "تواصل معنا عبر البريد الإلكتروني",
    settingsPrivacy: "سياسة الخصوصية",
    settingsPrivacyDesc: "اقرأ سياسة الخصوصية الخاصة بالتطبيق",
    settingsLangAr: "العربية",
    settingsLangEn: "English",
    egServices: [
      { icon: "🥇", key: "travel-work-eg", label: "السفر والعمل بالخارج", subtitle: "عقود عمل – توثيق – فرص عمل – مراجعة أوراق – أخرى", subServices: ["عقود عمل", "توثيق", "فرص عمل", "مراجعة أوراق", "أخرى"] },
      { icon: "🥈", key: "visas-eg", label: "التأشيرات", subtitle: "سياحة – عمل – زيارة – متابعة – أخرى", subServices: ["سياحة", "عمل", "زيارة", "متابعة", "أخرى"] },
      { icon: "🥉", key: "docs-translation-eg", label: "التوثيق والترجمة", subtitle: "توثيق – ترجمة – مراجعة مستندات – أخرى", subServices: ["توثيق", "ترجمة", "مراجعة مستندات", "أخرى"] },
      { icon: "🏅", key: "work-problems-eg", label: "مشاكل العمل", subtitle: "رواتب – فصل – نزاعات – عقود – أخرى", subServices: ["رواتب", "فصل", "نزاعات", "عقود", "أخرى"] },
      { icon: "🎖", key: "legal-eg", label: "الاستشارات القانونية", subtitle: "استشارة – توثيق مستندات – مراجعة مستندات – أخرى", subServices: ["استشارة", "توثيق مستندات", "مراجعة مستندات", "أخرى"] },
      { icon: "🪙", key: "migration-eg", label: "استشارة شخصية", subtitle: "استشارات عامة", subServices: ["استشارات عامة", "أخرى"] },
    ],
    countryServices: [
      { icon: "💼", key: "work-issues-sa", label: "مشاكل العمل", subtitle: "رواتب – فصل تعسفي – نقل كفالة – نزاعات", subServices: ["رواتب", "فصل تعسفي", "نقل كفالة", "نزاعات", "أخرى"] },
      { icon: "🛂", key: "visas-residency-sa", label: "التأشيرات والإقامة", subtitle: "إصدار تأشيرة – تجديد إقامة – خروج وعودة – نقل كفالة", subServices: ["إصدار تأشيرة", "تجديد إقامة", "خروج وعودة", "نقل كفالة", "أخرى"] },
      { icon: "👨‍👩‍👧‍👦", key: "recruitment-sa", label: "الاستقدام", subtitle: "طلب عمالة – إصدار تأشيرات عمل – متابعة الطلب – استقدام أسرة", subServices: ["طلب عمالة", "إصدار تأشيرات عمل", "متابعة الطلب", "استقدام أسرة", "أخرى"] },
      { icon: "🏠", key: "family-visit-sa", label: "الزيارة العائلية", subtitle: "طلب زيارة – تمديد زيارة – تحويل إلى إقامة", subServices: ["طلب زيارة", "تمديد زيارة", "تحويل إلى إقامة", "أخرى"] },
      { icon: "🧾", key: "insurance-sa", label: "التأمينات", subtitle: "تسجيل – مشاكل اشتراك – مستحقات", subServices: ["تسجيل", "مشاكل اشتراك", "مستحقات", "أخرى"] },
      { icon: "⚖️", key: "legal-consulting-sa", label: "الاستشارات القانونية", subtitle: "طلب محامي – استشارة قانونية – رفع قضية", subServices: ["طلب محامي", "استشارة قانونية", "رفع قضية", "أخرى"] },
    ],
    otherCountryServices: [
      { icon: "🏖️", label: "طلب تأشيرة سياحة" },
      { icon: "✈️", label: "طلب تأشيرة عمل" },
      { icon: "📋", label: "طلب تأشيرة نظامية" },
      { icon: "⚖️", label: "مطلوب محامي عمال" },
    ],
  },
  en: {
    appTitle: "Trusted Travel Offices",
    appSub: "مكاتب السفريات الموثوقة",
    countryLabel: "Country",
    chooseGov: "Choose Your Governorate",
    heroSub: "Find a trusted licensed travel office near you",
    licensedTag: "🇪🇬 Licensed Labor Recruitment Companies",
    searchPlaceholder: "Search by office name or address...",
    officesAvail: "offices available",
    noResults: "No matching results",
    licenseNo: "License No.",
    mapBtn: "🗺️ Open Google Maps",
    callBtn: "📞 Call",
    phoneComingSoon: "— (coming soon)",
    mapHint: "💡 Search on map by office name and governorate",
    tabMinistry: "🏛️ Ministry", tabEmbassy: "🏢 Embassies",
    tabEmergency: "🚨 Emergency", tabPaid: "💳 Services",
    callMinistry: "📞 Call Ministry", callEmbassy: "📞 Call Embassy",
    emergencyIn: "Emergency numbers in",
    citiesComingSoon: "🏙️ Available cities — offices will be added in upcoming releases",
    unifiedPhone: "Unified Number", workHours: "Working Hours",
    website: "Official Website", email: "Email",
    hotline: "Hotline",
    address: "Address", phone: "Phone",
    jeddah: "Jeddah Consulate", whatsappLabel: "WhatsApp", facebookLabel: "Facebook",
    comingSoon: "Coming Soon",
    cityComingSoonMsg: "We're working on offices for this city. They'll be available in upcoming releases, God willing 🕐",
    paidComingSoonMsg: "This service will be activated in the next release, God willing 🚀",
    paidServicesTitle: "💳 Request a Paid Service",
    paidServicesSub: "Choose a service — activation coming in next release",
    visitSite: "🌐 Visit Official Website",
    egMinistryTitle: "🏛️ Egyptian Ministry of Labor",
    egEmergencyTitle: "🚨 Emergency Numbers in Egypt",
    egPaidTitle: "💳 Paid Services",
    closeBtn: "✕ Close",
    forbiddenBtn: "Prohibited Companies",
    forbiddenTitle: "⚠️ Check Before You Deal",
    forbiddenDesc: "Verify the office is not on the Ministry of Labor's prohibited companies list before paying any fees.",
    forbiddenLink: "🔍 View Official Prohibited Companies List",
    discTitle: "Important Notice",
    discBody: "This is an independent app, not affiliated with any government entity.",
    discSub: "Data is sourced from the official list on the Egyptian Ministry of Labor website and does not represent this entity in any way.",
    discEn: "This app is independently developed and is not affiliated with, endorsed by, or representing any government entity.",
    discBtn: "I Understand — Continue",
    footerEgypt: "Independent app — Data from Egyptian Ministry of Labor — Not affiliated with any government entity",
    footerOther: (countryName) => `Independent app — Not affiliated with the government of ${countryName}`,
    // Bottom Nav
    navHome: "Travel Offices",
    navCV: "Employment",
    navSettings: "Settings",
    // CV Page
    cvTitle: "Create CV",
    cvSub: "Build your professional CV in minutes",
    cvComingSoon: "Coming Soon 🚀",
    cvComingSoonMsg: "The CV builder feature will be available in the next release, God willing",
    // Settings Page
    settingsTitle: "Settings",
    settingsLang: "Language",
    settingsTheme: "App Theme",
    settingsThemeLight: "Light",
    settingsThemeDark: "Dark",
    settingsUpdate: "Update App",
    settingsUpdateDesc: "Check for the latest version",
    settingsRate: "Rate the App",
    settingsRateDesc: "Help us with your rating on the store",
    settingsSupport: "Technical Support",
    settingsSupportDesc: "Contact us via email",
    settingsPrivacy: "Privacy Policy",
    settingsPrivacyDesc: "Read the app's privacy policy",
    settingsLangAr: "العربية",
    settingsLangEn: "English",
    egServices: [
      { icon: "🥇", key: "travel-work-eg", label: "Travel & Work Abroad", subtitle: "Work contracts – Documentation – Job opportunities – Paper review – Other", subServices: ["Work contracts", "Documentation", "Job opportunities", "Paper review", "Other"] },
      { icon: "🥈", key: "visas-eg", label: "Visas", subtitle: "Tourism – Work – Visit – Follow-up – Other", subServices: ["Tourism", "Work", "Visit", "Follow-up", "Other"] },
      { icon: "🥉", key: "docs-translation-eg", label: "Documentation & Translation", subtitle: "Documentation – Translation – Document review – Other", subServices: ["Documentation", "Translation", "Document review", "Other"] },
      { icon: "🏅", key: "work-problems-eg", label: "Work Problems", subtitle: "Salaries – Dismissal – Disputes – Contracts – Other", subServices: ["Salaries", "Dismissal", "Disputes", "Contracts", "Other"] },
      { icon: "🎖", key: "legal-eg", label: "Legal Consultations", subtitle: "Consultation – Document authentication – Document review – Other", subServices: ["Consultation", "Document authentication", "Document review", "Other"] },
      { icon: "🪙", key: "migration-eg", label: "Personal Consultation", subtitle: "General consultations", subServices: ["General consultations", "Other"] },
    ],
    countryServices: [
      { icon: "💼", key: "work-issues-sa", label: "Work Issues", subtitle: "Salaries – Unfair dismissal – Transfer sponsorship – Disputes", subServices: ["Salaries", "Unfair dismissal", "Transfer sponsorship", "Disputes", "Other"] },
      { icon: "🛂", key: "visas-residency-sa", label: "Visas & Residency", subtitle: "Issue visa – Renew residency – Exit & return – Transfer sponsorship", subServices: ["Issue visa", "Renew residency", "Exit & return", "Transfer sponsorship", "Other"] },
      { icon: "👨‍👩‍👧‍👦", key: "recruitment-sa", label: "Recruitment", subtitle: "Labor request – Work visas – Follow-up – Family recruitment", subServices: ["Labor request", "Work visas", "Follow-up", "Family recruitment", "Other"] },
      { icon: "🏠", key: "family-visit-sa", label: "Family Visit", subtitle: "Visit request – Extend visit – Convert to residency", subServices: ["Visit request", "Extend visit", "Convert to residency", "Other"] },
      { icon: "🧾", key: "insurance-sa", label: "Insurance", subtitle: "Registration – Subscription issues – Dues", subServices: ["Registration", "Subscription issues", "Dues", "Other"] },
      { icon: "⚖️", key: "legal-consulting-sa", label: "Legal Consultations", subtitle: "Lawyer request – Legal consultation – File a case", subServices: ["Lawyer request", "Legal consultation", "File a case", "Other"] },
    ],
    otherCountryServices: [
      { icon: "🏖️", label: "Tourist Visa Request" },
      { icon: "✈️", label: "Work Visa Request" },
      { icon: "🆓", label: "Free Visa Request" },
      { icon: "⚖️", label: "Labor Attorney Needed" },
    ],
  },
};


// ══════════════════════════════════════════════════════════════════════════════
//  PAID SERVICES FLOW — مدمج مباشرة في App02.jsx
// ══════════════════════════════════════════════════════════════════════════════

const ADMIN_EMAIL = PRIMARY_ADMIN_EMAIL;

const ACCOUNT_HOLDER_NAME = "وليد غزال قلموش";
const INSTAPAY_HANDLE = "walidghazal51";
const PAYMENT_MOBILE = "01064463650";

const EGYPT_BANKS_DATA = {
  instaPay: {
    label: "انستا باي",
    labelEn: "InstaPay",
    icon: "⚡",
    color: "#6c3bff",
    requiresReceipt: true,
    details: [
      { label: "الاسم", labelEn: "Name", value: ACCOUNT_HOLDER_NAME },
      { label: "يوزر / كود الدفع", labelEn: "Payment Handle", value: INSTAPAY_HANDLE },
      { label: "رقم الموبايل", labelEn: "Mobile Number", value: PAYMENT_MOBILE },
    ],
    hint: "حوّل قيمة الخدمة عبر انستا باي ثم أضف إيصال التحويل لتأكيد الطلب.",
    hintEn: "Transfer the service amount via InstaPay, then attach the receipt to confirm the request.",
  },
  cashWallet: {
    label: "محفظة كاش",
    labelEn: "Cash Wallet",
    icon: "💵",
    color: "#00a651",
    requiresReceipt: true,
    details: [
      { label: "الاسم", labelEn: "Name", value: ACCOUNT_HOLDER_NAME },
      { label: "رقم المحفظة", labelEn: "Wallet Number", value: PAYMENT_MOBILE },
    ],
    hint: "حوّل قيمة الخدمة إلى المحفظة ثم أضف إيصال التحويل لتأكيد الطلب.",
    hintEn: "Transfer the service amount to the wallet, then attach the receipt to confirm the request.",
  },
  bankTransfer: {
    label: "تحويل بنكي",
    labelEn: "Bank Transfer",
    icon: "🏦",
    color: "#1d4ed8",
    requiresReceipt: true,
    details: [
      { label: "الاسم", labelEn: "Account Name", value: ACCOUNT_HOLDER_NAME },
      { label: "البنك", labelEn: "Bank", value: "CIB" },
      { label: "IBAN", labelEn: "IBAN", value: "EG900010013400000100043762267" },
    ],
    hint: "بعد التحويل البنكي أضف إيصال التحويل ثم أكّد الدفع لإرسال الطلب.",
    hintEn: "After the bank transfer, attach the transfer receipt and confirm payment to submit the request.",
  },
  visa: {
    label: "فيزا / ماستر كارد",
    labelEn: "Visa / Mastercard",
    icon: "💳",
    color: "#64748b",
    disabled: true,
    soon: true,
  },
  tabbyTamara: {
    label: "جوجل باي",
    labelEn: "Google Pay",
    icon: "🟢",
    color: "#34a853",
    soon: true,
    hint: "خيار جوجل باي سيظهر قريبًا داخل التطبيق.",
    hintEn: "Google Pay will be available soon in the app.",
  },
  coins: {
    label: "كوينز",
    labelEn: "Coins",
    icon: "🪙",
    color: "#f59e0b",
    disabled: true,
    soon: true,
    coinsSoon: true,
    hint: "نظام الكوينز سيظهر قريبًا داخل التطبيق.",
    hintEn: "Coins system will be available soon in the app.",
  },
};

const INTL_BANKS_DATA = {
  instaPay: {
    label: "انستا باي",
    labelEn: "InstaPay",
    icon: "⚡",
    color: "#6c3bff",
    requiresReceipt: true,
    details: [
      { label: "الاسم", labelEn: "Name", value: ACCOUNT_HOLDER_NAME },
      { label: "يوزر / كود الدفع", labelEn: "Payment Handle", value: INSTAPAY_HANDLE },
      { label: "رقم الموبايل", labelEn: "Mobile Number", value: PAYMENT_MOBILE },
    ],
    hint: "حوّل قيمة الخدمة عبر انستا باي ثم أضف إيصال التحويل لتأكيد الطلب.",
    hintEn: "Transfer the service amount via InstaPay, then attach the receipt to confirm the request.",
  },
  cashWallet: {
    label: "محفظة كاش",
    labelEn: "Cash Wallet",
    icon: "💵",
    color: "#00a651",
    requiresReceipt: true,
    details: [
      { label: "الاسم", labelEn: "Name", value: ACCOUNT_HOLDER_NAME },
      { label: "رقم المحفظة", labelEn: "Wallet Number", value: PAYMENT_MOBILE },
    ],
    hint: "حوّل قيمة الخدمة إلى المحفظة ثم أضف إيصال التحويل لتأكيد الطلب.",
    hintEn: "Transfer the service amount to the wallet, then attach the receipt to confirm the request.",
  },
  bankTransfer: {
    label: "تحويل بنكي",
    labelEn: "Bank Transfer",
    icon: "🏦",
    color: "#1d4ed8",
    requiresReceipt: true,
    details: [
      { label: "الاسم", labelEn: "Account Name", value: ACCOUNT_HOLDER_NAME },
      { label: "البنك", labelEn: "Bank", value: "CIB" },
      { label: "IBAN", labelEn: "IBAN", value: "EG900010013400000100043762267" },
    ],
    hint: "بعد التحويل البنكي أضف إيصال التحويل ثم أكّد الدفع لإرسال الطلب.",
    hintEn: "After the bank transfer, attach the transfer receipt and confirm payment to submit the request.",
  },
  visa: {
    label: "فيزا / ماستر كارد",
    labelEn: "Visa / Mastercard",
    icon: "💳",
    color: "#64748b",
    disabled: true,
    soon: true,
  },
  tabbyTamara: {
    label: "جوجل باي",
    labelEn: "Google Pay",
    icon: "🟢",
    color: "#34a853",
    soon: true,
    hint: "خيار جوجل باي سيظهر قريبًا داخل التطبيق.",
    hintEn: "Google Pay will be available soon in the app.",
  },
  coins: {
    label: "كوينز",
    labelEn: "Coins",
    icon: "🪙",
    color: "#f59e0b",
    disabled: true,
    soon: true,
    coinsSoon: true,
    hint: "نظام الكوينز سيظهر قريبًا داخل التطبيق.",
    hintEn: "Coins system will be available soon in the app.",
  },
};

const STATUS_STEPS_AR = [
  { key: "paid",       icon: "✅", label: "تم الدفع",                    duration: null },
  { key: "contact48",  icon: "📞", label: "جاري التواصل مع العميل",       duration: "خلال 48 ساعة" },
  { key: "contacted",  icon: "🤝", label: "تم التواصل مع العميل",         duration: null },
  { key: "inProgress", icon: "⚙️", label: "جاري البدء في الخدمة",         duration: "3 – 7 أيام" },
  { key: "done",       icon: "🎉", label: "تم الانتهاء من تنفيذ الخدمة",  duration: null },
];
const STATUS_STEPS_EN = [
  { key: "paid",       icon: "✅", label: "Payment Confirmed",   duration: null },
  { key: "contact48",  icon: "📞", label: "Contacting Client",   duration: "Within 48 hrs" },
  { key: "contacted",  icon: "🤝", label: "Client Contacted",    duration: null },
  { key: "inProgress", icon: "⚙️", label: "Service In Progress", duration: "3 – 7 days" },
  { key: "done",       icon: "🎉", label: "Service Completed",   duration: null },
];

const STATUS_STEP_KEYS = STATUS_STEPS_AR.map((step) => step.key);

function createInitialStageConfirmations() {
  return STATUS_STEP_KEYS.reduce((acc, key, index) => {
    acc[key] = index === 0;
    return acc;
  }, {});
}

function hydratePaidOrder(order) {
  return {
    ...order,
    receiptName: order?.receiptName || "",
    receiptAttached: !!order?.receiptName || !!order?.receiptAttached,
    stageConfirmations: {
      ...createInitialStageConfirmations(),
      ...(order?.stageConfirmations || {}),
    },
  };
}

function getNextPendingStageIndex(order) {
  const safeOrder = hydratePaidOrder(order || {});
  return STATUS_STEP_KEYS.findIndex((key) => !safeOrder.stageConfirmations[key]);
}

const MAX_RECEIPT_SIZE_BYTES = 2 * 1024 * 1024;
const RECEIPT_UPLOAD_TIMEOUT_MS = 30000;
const RECEIPT_UPLOAD_NOTICE_MS = 12000;

function withTimeout(promise, ms, label = "request") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

function normalizePaidService(service, isAr) {
  const price = Number(service?.price ?? 10);
  const originalPrice = Number(service?.originalPrice ?? price * 2);
  return {
    ...service,
    price,
    originalPrice,
    subtitle:
      service?.subtitle ||
      (isAr
        ? "دفعة واحدة لكل طلب جديد مع رفع إيصال التحويل"
        : "One-time payment for each new request with transfer receipt upload"),
    billingLabel:
      service?.billingLabel ||
      (isAr ? "دفعة واحدة لكل طلب جديد" : "One-time payment for each new request"),
    features: service?.features || [],
  };
}

function isOtherSubServiceValue(value, isAr) {
  return value === (isAr ? "أخرى" : "Other");
}

function generateOrderSerial() {
  const prefix = "WG";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

function getLocalOrdersFromStorage(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function getRecentOrderCountWithinDays(orders, days) {
  const now = Date.now();
  const threshold = now - days * 24 * 60 * 60 * 1000;
  return (orders || []).filter((order) => {
    const createdAtValue = order?.createdAt || order?.date || "";
    const createdAtMs = new Date(createdAtValue).getTime();
    return Number.isFinite(createdAtMs) && createdAtMs >= threshold;
  }).length;
}

function getRequestLimitMessage(windowDays, isAr = true) {
  if (isAr) {
    if (windowDays >= 30) {
      return "استنفذت كل الطلبات المسموح بها خلال هذا الشهر ويجب الانتظار 30 يومًا لحين تفعيلها مرة أخرى أو التواصل مع خدمة العملاء بالتطبيق واتساب (متواجد بالإعدادات) لطلب أي خدمات إضافية.";
    }
    return "استنفذت كل الطلبات المسموح بها خلال الأسبوع ويجب الانتظار 7 أيام لحين تفعيلها مرة أخرى أو التواصل مع خدمة العملاء بالتطبيق واتساب (متواجد بالإعدادات) لطلب أي خدمات إضافية.";
  }

  if (windowDays >= 30) {
    return "You have used all allowed requests for this month. Please wait 30 days for reactivation or contact customer service on WhatsApp from Settings for any additional services.";
  }

  return "You have used all allowed requests for this week. Please wait 7 days for reactivation or contact customer service on WhatsApp from Settings for any additional services.";
}

function openOrderEmailDraft(orderData) {
  const orderNumber = orderData?.id || orderData?.firebaseId || "-";
  const paymentText = `${orderData?.paymentMethod || "-"} — ${orderData?.billingLabel || "دفعة واحدة"}`;
  const orderDate = orderData?.dateStr || new Date().toLocaleDateString("ar-EG");
  const subject = encodeURIComponent(`[طلب جديد] ${orderData?.service || "-"} — ${orderData?.serial || "-"}`);
  const body = encodeURIComponent(
    `طلب خدمة جديد\n\nرقم الطلب: ${orderNumber}\nالسيريال: ${orderData?.serial || "-"}\nالخدمة: ${orderData?.service || "-"}\nالاسم: ${orderData?.name || "-"}\nالهاتف: ${orderData?.phone || "-"}\nالبريد: ${orderData?.email || "-"}\nالدولة: ${orderData?.country || "-"}\nالمدينة: ${orderData?.city || "-"}\nطريقة الدفع: ${paymentText}\nتاريخ الطلب: ${orderDate}\n\nتنبيه: برجاء إرفاق إيصال الدفع أو فاتورة الدفع أو لقطة شاشة واضحة لعملية الدفع داخل هذا الإيميل قبل الإرسال.`
  );
  window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, "_blank");
}

const ORDER_EMAILS_FUNCTION_URL = "https://us-central1-travel-offices-90c53.cloudfunctions.net/sendOrderEmails";
const SERVICE_PROVIDER_EMAILS_FUNCTION_URL = "https://us-central1-travel-offices-90c53.cloudfunctions.net/sendServiceProviderEmails";

async function sendOrderEmailsViaFirebase(orderData) {
  const response = await fetch(ORDER_EMAILS_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order: {
        firebaseId: orderData?.firebaseId || "",
        orderNumber: orderData?.orderNumber || "",
        serial: orderData?.serial || "",
        service: orderData?.service || "",
        name: orderData?.name || "",
        phone: orderData?.phone || "",
        email: orderData?.email || "",
        country: orderData?.country || "",
        city: orderData?.city || "",
        paymentMethod: orderData?.paymentMethod || "",
        billingLabel: orderData?.billingLabel || "",
        dateStr: orderData?.dateStr || "",
        receiptName: orderData?.receiptName || "",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `function-http-${response.status}`);
  }

  return response.json().catch(() => ({ ok: true }));
}

async function sendOrderEmails(orderData) {
  try {
    return await sendOrderEmailsViaFirebase(orderData);
  } catch (error) {
    console.error("Order email delivery failed (background)", error);
    return { ok: false, fallback: "background-failed" };
  }
}

async function sendServiceProviderEmails(payload) {
  try {
    const response = await fetch(SERVICE_PROVIDER_EMAILS_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `provider-email-http-${response.status}`);
    }

    return await response.json().catch(() => ({ ok: true }));
  } catch (error) {
    console.error("Service provider email delivery failed", error);
    return { ok: false };
  }
}

function generateServiceProviderSerial() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const r = Math.floor(1000 + Math.random() * 9000);
  return `SVP-${y}${m}${d}-${r}`;
}

function getServiceReviewBucketKey(countryName, serviceKey) {
  return `${countryName || "global"}::${serviceKey || "unknown"}`;
}

function formatReviewDateValue(dateValue, locale = "ar") {
  if (!dateValue) return "";
  const reviewDate = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(reviewDate.getTime())) return "";
  return reviewDate.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US");
}

function buildReviewerInitials(nameOrEmail = "") {
  const normalized = String(nameOrEmail || "").trim();
  if (!normalized) return "--";

  const cleaned = normalized.replace(/@.*$/, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return `${parts[0].charAt(0)}${parts[0].charAt(1)}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

function buildServiceReviewMap(reviewOrders, locale = "ar") {
  return (reviewOrders || []).reduce((acc, order) => {
    if (!order?.reviewed || !order?.serviceKey || !order?.rating) return acc;
    const bucketKey = getServiceReviewBucketKey(order.country, order.serviceKey);
    const current = acc[bucketKey] || { count: 0, avg: 0, reviews: [] };
    const nextReviews = [
      ...current.reviews,
      {
        id: order.id || order.firebaseId || order.serial,
        rating: Number(order.rating) || 0,
        text: order.reviewText || "",
        date: formatReviewDateValue(order.updatedAt || order.createdAt || order.date, locale),
        serial: order.serial || "",
      },
    ].sort((a, b) => (b.id > a.id ? 1 : -1));
    const allRatings = nextReviews.map((review) => Number(review.rating) || 0).filter(Boolean);
    acc[bucketKey] = {
      count: allRatings.length,
      avg: allRatings.length ? (allRatings.reduce((sum, value) => sum + value, 0) / allRatings.length).toFixed(1) : 0,
      reviews: nextReviews,
    };
    return acc;
  }, {});
}

function buildOfficeReviewState(reviewItems, locale = "ar") {
  const nextReviews = {};
  const nextRatings = {};

  (reviewItems || []).forEach((review) => {
    const rawOfficeId = Number(review?.officeId) || 0;
    const officeId = officeIdAliases[rawOfficeId] || rawOfficeId;
    if (!officeId) return;
    const normalized = {
      id: review.id || `${officeId}-${Math.random().toString(36).slice(2, 8)}`,
      rating: Number(review.rating) || 0,
      text: review.text || "",
      date: formatReviewDateValue(review.createdAt || review.date, locale),
      reviewerUid: String(review.reviewerUid || "").trim(),
      reviewerName: String(review.reviewerName || review.userName || "").trim(),
      reviewerInitials: buildReviewerInitials(review.reviewerName || review.userName || review.userEmail || ""),
    };
    nextReviews[officeId] = [normalized, ...(nextReviews[officeId] || [])];
  });

  Object.entries(nextReviews).forEach(([officeId, officeReviewItems]) => {
    const ratingValues = officeReviewItems.map((review) => review.rating).filter(Boolean);
    nextRatings[officeId] = {
      avg: ratingValues.length ? (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1) : 0,
      count: ratingValues.length,
    };
  });

  return { ratings: nextRatings, reviews: nextReviews };
}

function createEmptyCvPackageStats() {
  return {
    requestsCount: 0,
    reviewsCount: 0,
    ratingsTotal: 0,
    averageRating: 0,
  };
}

function detectCvPackageKeyFromOrder(order) {
  const directKey = String(order?.serviceKey || "").trim().toLowerCase();
  if (["builder", "premium", "elite"].includes(directKey)) {
    return directKey;
  }

  const textBlob = [
    order?.packageName,
    order?.providedService,
    order?.service,
    order?.serviceNameNorm,
    order?.serviceName,
    order?.serviceLabel,
    order?.storageKey,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .join(" ");

  if (
    textBlob.includes("premium") ||
    textBlob.includes("بريميوم")
  ) {
    return "premium";
  }

  if (
    textBlob.includes("elite") ||
    textBlob.includes("advanced job search") ||
    textBlob.includes("البحث والتوظيف")
  ) {
    return "elite";
  }

  if (
    textBlob.includes("builder") ||
    textBlob.includes("regular user") ||
    textBlob.includes("مستخدم عادي")
  ) {
    return "builder";
  }

  return null;
}

function isCvOrderRecord(order) {
  return String(order?.serviceCategory || "").trim().toLowerCase() === "cv"
    || !!detectCvPackageKeyFromOrder(order);
}


class PaidFlowErrorBoundary extends React.Component {
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

export default function App() {
  const createInitialCvData = () => ({
    fullName: "", jobTitle: "", country: "", location: "", phone: "", whatsapp: "", email: "",
    nationality: "", maritalStatus: "", iqama: "", iqamaStatus: "transferable",
    memberships: [{ id: Date.now(), name: "", number: "", hasNo: false }],
    summary: "",
    experiences: [{ id: 1, jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: [""], projects: [] }],
    coreCompetencies: [],
    toolsSoftware: [],
    achievements: [""],
    education: [{ degree: "", major: "", university: "", year: "" }],
    certifications: [{ name: "", issuer: "", year: "" }],
    languages: [{ lang: "", level: "intermediate" }],
    keywords: "",
  });
  const shapeAuthPreviewUser = (user) => user
    ? {
        uid: user.uid,
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
      }
    : null;
  const isAdminEmail = (value) => ADMIN_EMAILS.includes(String(value || "").trim().toLowerCase());
  const initialAuthSnapshot = getCurrentAuthUser();

  // 1. تعريف الـ States
  const [view, setView] = useState("landing");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("ar");
  const [adRemote, setAdRemote] = useState({ enabled: false, imageUrl: "", linkUrl: "" });
  const [selectedCountry, setSelectedCountry] = useState("مصر");
  const [selectedNationality, setSelectedNationality] = useState(() => {
    try {
      return localStorage.getItem("preferredNationality") || "";
    } catch {
      return "";
    }
  });
  const [nationalityInputText, setNationalityInputText] = useState(() => {
    try {
      return localStorage.getItem("preferredNationality") || "";
    } catch {
      return "";
    }
  });
  const [nationalityConfirmToast, setNationalityConfirmToast] = useState("");
  const [nationalityEditMode, setNationalityEditMode] = useState(!localStorage.getItem("preferredNationality"));
  const [selectedGov, setSelectedGov] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState(null);
  const [showAllSaudiServices, setShowAllSaudiServices] = useState(false);
  const [activeTab, setActiveTab] = useState("ministry");
  const [selectedEmbassyCountry, setSelectedEmbassyCountry] = useState("مصر");
  const [showOtherEmbassies, setShowOtherEmbassies] = useState(false);
  const [egyptServicesScreen, setEgyptServicesScreen] = useState("list");
  const [egyptServicesBackRequest, setEgyptServicesBackRequest] = useState(0);
  const [countryPaidScreen, setCountryPaidScreen] = useState("list");
  const [countryPaidBackRequest, setCountryPaidBackRequest] = useState(0);
  const [cvPaidScreen, setCvPaidScreen] = useState("list");
  const [cvPaidBackRequest, setCvPaidBackRequest] = useState(0);
  const [modal, setModal] = useState(null);
  const [showOtherDropdown, setShowOtherDropdown] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officeRatings, setOfficeRatings] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState({});
  const [cvPackageStats, setCvPackageStats] = useState({
    builder: createEmptyCvPackageStats(),
    premium: createEmptyCvPackageStats(),
    elite: createEmptyCvPackageStats(),
  });
  const [cvRealtimeOrders, setCvRealtimeOrders] = useState([]);
  const [cvRealtimeOrdersFetched, setCvRealtimeOrdersFetched] = useState(false);
  const [cvAdminAllOrders, setCvAdminAllOrders] = useState([]);
  const [cvAdminOrdersQuery, setCvAdminOrdersQuery] = useState("");
  const [cvAdminOrdersStageFilter, setCvAdminOrdersStageFilter] = useState("all");
  const [cvAdminOrdersSortMode, setCvAdminOrdersSortMode] = useState("newest");
  const [officeReviewSubmitting, setOfficeReviewSubmitting] = useState(false);
  const [officeReviewError, setOfficeReviewError] = useState("");
  const [officeReviewEditingId, setOfficeReviewEditingId] = useState("");
  const [officeReviewEditingText, setOfficeReviewEditingText] = useState("");
  const [officeReviewActionBusyId, setOfficeReviewActionBusyId] = useState("");
  const [mainTab, setMainTab] = useState("home");
  const [officePage, setOfficePage] = useState(1);
  const [authPreviewOpen, setAuthPreviewOpen] = useState(false);
  const [authPreviewMode, setAuthPreviewMode] = useState("login");
  const [authPreviewName, setAuthPreviewName] = useState("");
  const [authPreviewIdentifier, setAuthPreviewIdentifier] = useState("");
  const [authPreviewPassword, setAuthPreviewPassword] = useState("");
  const [authPreviewConfirmPassword, setAuthPreviewConfirmPassword] = useState("");
  const [authPreviewOtp, setAuthPreviewOtp] = useState(["", "", "", "", "", ""]);
  const [authPreviewBusy, setAuthPreviewBusy] = useState(false);
  const [authPreviewError, setAuthPreviewError] = useState("");
  const [authPreviewSuccess, setAuthPreviewSuccess] = useState("");
  const [guestMode, setGuestMode] = useState(false);
  const [authPreviewUser, setAuthPreviewUser] = useState(() => shapeAuthPreviewUser(initialAuthSnapshot));
  const [authPreviewReady, setAuthPreviewReady] = useState(() => !!initialAuthSnapshot);
  const [adminSessionRole, setAdminSessionRole] = useState("user");
  const [authPreviewPhoneFlow, setAuthPreviewPhoneFlow] = useState(null);
  const [authPreviewOtpResendTimer, setAuthPreviewOtpResendTimer] = useState(0);
  const authPreviewOtpRefs = useRef([]);
  const authPreviewOtpResendIntervalRef = useRef(null);
  const authPreviewSplitPhoneInputRef = useRef(null);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [accountProfileName, setAccountProfileName] = useState("");
  const [accountProfileEmail, setAccountProfileEmail] = useState("");
  const [accountProfilePhone, setAccountProfilePhone] = useState("");
  const [accountCoins, setAccountCoins] = useState(0);
  const [accountProfileBusy, setAccountProfileBusy] = useState(false);
  const [accountProfileError, setAccountProfileError] = useState("");
  const [accountProfileSuccess, setAccountProfileSuccess] = useState("");
  const [accountPhoneBusy, setAccountPhoneBusy] = useState(false);
  const [accountPhoneVerificationId, setAccountPhoneVerificationId] = useState("");
  const [accountPhonePendingNumber, setAccountPhonePendingNumber] = useState("");
  const [accountPhoneOtp, setAccountPhoneOtp] = useState(["", "", "", "", "", ""]);
  const [accountDeleteConfirm, setAccountDeleteConfirm] = useState(false);
  const [usageGuideOpen, setUsageGuideOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [adminSecurityOpen, setAdminSecurityOpen] = useState(false);
  const [adminSecurityCode, setAdminSecurityCode] = useState("");
  const [adminSecurityError, setAdminSecurityError] = useState("");
  const [adminSecurityAttempts, setAdminSecurityAttempts] = useState(0);
  const [adminSecurityBusy, setAdminSecurityBusy] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminSelectedUserUid, setAdminSelectedUserUid] = useState("");
  const [adminPanelHistory, setAdminPanelHistory] = useState(["overview"]);
  const [adminExitConfirm, setAdminExitConfirm] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [adminUsersQuery, setAdminUsersQuery] = useState("");
  const [adminActionBusyUid, setAdminActionBusyUid] = useState("");
  const [adminActionConfirm, setAdminActionConfirm] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [adminOrdersError, setAdminOrdersError] = useState("");
  const [adminOrdersQuery, setAdminOrdersQuery] = useState("");
  const [adminOrderActionBusyId, setAdminOrderActionBusyId] = useState("");
  const [adminOrdersFilter, setAdminOrdersFilter] = useState("30d");
  const [adminOpsFilter, setAdminOpsFilter] = useState("all");
  const [adminDelayedStageKey, setAdminDelayedStageKey] = useState("contact48");
  const [adminExpandedOrderId, setAdminExpandedOrderId] = useState("");
  const [adminSelectedOrderId, setAdminSelectedOrderId] = useState("");
  const [adminProviderRequests, setAdminProviderRequests] = useState([]);
  const [adminProviderRequestsLoading, setAdminProviderRequestsLoading] = useState(false);
  const [adminProviderRequestsError, setAdminProviderRequestsError] = useState("");
  const [adminProviderRequestsQuery, setAdminProviderRequestsQuery] = useState("");
  const [adminProviderActionBusyId, setAdminProviderActionBusyId] = useState("");
  const [adminPanelSection, setAdminPanelSection] = useState("overview");
  const [adminSelectedProviderRequestId, setAdminSelectedProviderRequestId] = useState("");
  const [providerApprovalSnapshot, setProviderApprovalSnapshot] = useState(null);
  const [providerAllRequests, setProviderAllRequests] = useState([]);
  const [providerPortalMode, setProviderPortalMode] = useState("service");
  const [providerPortalAddNew, setProviderPortalAddNew] = useState(false);
  const [providerPortalGuestNotice, setProviderPortalGuestNotice] = useState("");
  const [officeOverrides, setOfficeOverrides] = useState(() => {
    try {
      const raw = localStorage.getItem("officeOverridesV1") || "{}";
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });
  const [adminOfficeEditOpen, setAdminOfficeEditOpen] = useState(false);
  const [adminOfficeDraft, setAdminOfficeDraft] = useState({
    name: "",
    license: "",
    address: "",
    gov: "",
    registrationType: "",
    registrationNumber: "",
    taxNumber: "",
    issuingAuthority: "",
    officialSourceUrl: "",
    officialVerificationStatus: "",
    mapPlaceId: "",
    mapLat: "",
    mapLng: "",
    mapVerificationStatus: "",
  });
  const [adminOfficeEditError, setAdminOfficeEditError] = useState("");
  const [adminAddedOffices, setAdminAddedOffices] = useState(() => {
    try {
      const raw = localStorage.getItem("adminAddedOfficesV1") || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [adminAddOfficeOpen, setAdminAddOfficeOpen] = useState(false);
  const [adminAddOfficeDraft, setAdminAddOfficeDraft] = useState({
    name: "",
    license: "",
    address: "",
    gov: "القاهرة",
  });
  const [adminAddOfficeError, setAdminAddOfficeError] = useState("");
  const [remoteOfficeOverrides, setRemoteOfficeOverrides] = useState({});
  const [remoteAddedOffices, setRemoteAddedOffices] = useState([]);
  const authPhoneVerifierRef = useRef(null);
  const authPhoneConfirmationRef = useRef(null);
  const accountPhoneVerifierRef = useRef(null);

  // ── CV Builder States ──────────────────────────────────────────────────────
  const [cvStep, setCvStep] = useState(0);
  const [cvUnlocked, setCvUnlocked] = useState(false);
  const [cvPdfExporting, setCvPdfExporting] = useState(false);
  const [cvMode, setCvMode] = useState(null);
  const [selectedCvPackage, setSelectedCvPackage] = useState(null);
  const [cvBuilderScreen, setCvBuilderScreen] = useState("menu");
  const [cvBuilderOrderDetailsBackScreen, setCvBuilderOrderDetailsBackScreen] = useState("previousOrders");
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

  const cvUpdate = (field, value) => setCvData(p => ({ ...p, [field]: value }));

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
      return eduValid && certValid && langValid;
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
        ? "من فضلك أكمل جميع حقول التعليم والشهادات واللغات قبل المتابعة."
        : "Please complete all education, certification, and language fields before continuing.";
    }
    return "";
  }, [lang]);

  const cvAddExp = () => setCvData(p => ({ ...p, experiences: [...p.experiences, { id: Date.now(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: [""], projects: [] }] }));
  const cvRemoveExp = (id) => setCvData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) }));
  const cvUpdateExp = (id, field, value) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  const cvAddRespLine = (id) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, responsibilities: [...e.responsibilities, ""] } : e) }));
  const cvUpdateResp = (id, idx, val) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r, i) => i === idx ? val : r) } : e) }));
  const cvAddProject = (id) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, projects: [...e.projects, { name: "", owner: "", cost: "", location: "" }] } : e) }));
  const cvUpdateProject = (id, pi, field, val) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, projects: e.projects.map((pr, i) => i === pi ? { ...pr, [field]: val } : pr) } : e) }));
  const cvRemoveProject = (id, pi) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, projects: e.projects.filter((_, i) => i !== pi) } : e) }));

  const cvAddTag = (field, val, setter) => { const v = val.trim(); if (v && !cvData[field].includes(v)) { cvUpdate(field, [...cvData[field], v]); setter(""); } };
  const cvRemoveTag = (field, val) => cvUpdate(field, cvData[field].filter(x => x !== val));

  const cvAddAchievement = () => cvUpdate("achievements", [...cvData.achievements, ""]);
  const cvUpdateAchievement = (i, v) => cvUpdate("achievements", cvData.achievements.map((a, idx) => idx === i ? v : a));
  const cvRemoveAchievement = (i) => cvUpdate("achievements", cvData.achievements.filter((_, idx) => idx !== i));

  const cvRemoveResp = (id, idx) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.filter((_, i) => i !== idx) } : e) }));

  // Membership functions
  const cvAddMembership = () => setCvData(p => ({ ...p, memberships: [...p.memberships, { id: Date.now(), name: "", number: "", hasNo: false }] }));
  const cvUpdateMembership = (id, field, value) => setCvData(p => ({ ...p, memberships: p.memberships.map(m => m.id === id ? { ...m, [field]: value } : m) }));
  const cvRemoveMembership = (id) => setCvData(p => ({ ...p, memberships: p.memberships.filter(m => m.id !== id) }));

  const cvSaveSection = (sectionName) => {
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
  };

  const cvAddEdu = () => cvUpdate("education", [...cvData.education, { degree: "", major: "", university: "", year: "" }]);
  const cvUpdateEdu = (i, field, val) => cvUpdate("education", cvData.education.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const cvRemoveEdu = (i) => cvUpdate("education", cvData.education.filter((_, idx) => idx !== i));

  const cvAddCert = () => cvUpdate("certifications", [...cvData.certifications, { name: "", issuer: "", year: "" }]);
  const cvUpdateCert = (i, field, val) => cvUpdate("certifications", cvData.certifications.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  const cvRemoveCert = (i) => cvUpdate("certifications", cvData.certifications.filter((_, idx) => idx !== i));

  const cvAddLang = () => cvUpdate("languages", [...cvData.languages, { lang: "", level: "intermediate" }]);
  const cvUpdateLang = (i, field, val) => cvUpdate("languages", cvData.languages.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  const cvRemoveLang = (i) => cvUpdate("languages", cvData.languages.filter((_, idx) => idx !== i));

  const isNativePlatform = Capacitor.getPlatform() !== "web";
  const currentCvBuilderReviewMeta = selectedCvBuilderOrder?.review || null;
  const cvBuilderDaysPassed = cvBuilderReviewSavedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(cvBuilderReviewSavedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const cvBuilderReviewDaysRemaining = cvBuilderReviewSavedAt
    ? Math.max(0, 30 - cvBuilderDaysPassed)
    : 0;
  const cvBuilderReviewLocked = cvBuilderReviewSaved && cvBuilderReviewDaysRemaining > 0 && !cvBuilderReviewEditMode;
  const cvBuilderReviewCanOpenEdit = cvBuilderReviewSaved && cvBuilderReviewDaysRemaining <= 0;
  const normalizedAuthEmail = useMemo(
    () => String(authPreviewUser?.email || "").trim().toLowerCase(),
    [authPreviewUser?.email]
  );
  const isPrimaryAdminUser = useMemo(
    () => normalizedAuthEmail === PRIMARY_ADMIN_EMAIL,
    [normalizedAuthEmail]
  );
  const isDelegatedAdminUser = useMemo(
    () => !DISABLED_ADMIN_EMAILS.includes(normalizedAuthEmail) && adminSessionRole === "admin_delegate",
    [adminSessionRole, normalizedAuthEmail]
  );
  const isAdminUser = isPrimaryAdminUser || isDelegatedAdminUser;
  const isGuestUser = !authPreviewUser && guestMode;
  const canManageAdminUsers = isPrimaryAdminUser;
  const canManageOrderReviews = isPrimaryAdminUser;
  const providerServiceOptions = useMemo(() => {
    const localePack = T[lang] || T.ar;
    if (selectedCountry === "مصر") return localePack.egServices || [];
    if (selectedCountry === "المملكة العربية السعودية") return localePack.countryServices || [];
    return localePack.otherCountryServices || [];
  }, [lang, selectedCountry]);

  const getProviderRequestTimestamp = useCallback((entry) => {
    const createdAtValue = entry?.createdAt;
    if (createdAtValue?.toDate) return createdAtValue.toDate().getTime();
    const raw = entry?.createdAt || entry?.updatedAt || entry?.date || 0;
    const ts = new Date(raw).getTime();
    return Number.isFinite(ts) ? ts : 0;
  }, []);

  const adminSecurityExpectedCode = useMemo(() => {
    try {
      const stored = String(localStorage.getItem(ADMIN_SECURITY_PASSCODE_KEY) || "")
        .replace(/\D/g, "")
        .slice(0, 6);
      return stored.length === 6 ? stored : ADMIN_SECURITY_DEFAULT_PASSCODE;
    } catch {
      return ADMIN_SECURITY_DEFAULT_PASSCODE;
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setCvBuilderRating(Number(currentCvBuilderReviewMeta?.rating) || 0);
    setCvBuilderReviewText(currentCvBuilderReviewMeta?.text || "");
    setCvBuilderReviewSaved(!!currentCvBuilderReviewMeta?.saved);
    setCvBuilderReviewSavedAt(currentCvBuilderReviewMeta?.savedAt || "");
    setCvBuilderReviewError("");
    setCvBuilderReviewEditMode(false);
  }, [currentCvBuilderReviewMeta?.rating, currentCvBuilderReviewMeta?.text, currentCvBuilderReviewMeta?.saved, currentCvBuilderReviewMeta?.savedAt]);

  useEffect(() => {
    try {
      localStorage.setItem("cvBuilderOrders", JSON.stringify(cvBuilderOrders));
    } catch {}
  }, [cvBuilderOrders]);

  useEffect(() => {
    if (!cvBuilderLimitNotice) return undefined;
    const timer = setTimeout(() => setCvBuilderLimitNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [cvBuilderLimitNotice]);

  useEffect(() => {
    if (modal?.type !== "requestLimit" && modal?.type !== "success") return undefined;
    const timer = setTimeout(() => setModal(null), modal?.type === "success" ? 3200 : 5000);
    return () => clearTimeout(timer);
  }, [modal]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setAuthPreviewUser(shapeAuthPreviewUser(user));
      setAuthPreviewReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authPreviewReady || !authPreviewUser?.uid) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const normalizedEmail = String(authPreviewUser.email || "").trim().toLowerCase();
        const baseProfilePayload = {
          uid: authPreviewUser.uid,
          email: authPreviewUser.email,
          phoneNumber: authPreviewUser.phoneNumber,
          displayName: authPreviewUser.displayName,
          country: selectedCountry,
          nationality: selectedNationality,
          providerId: authPreviewUser.phoneNumber ? "phone" : (authPreviewUser.email ? "email" : "unknown"),
        };

        await upsertAuthUserProfileInFirebase({
          ...baseProfilePayload,
          ...(isAdminEmail(normalizedEmail) ? { role: "admin" } : {}),
        });

        const profileSnapshot = await fetchUserProfileFromFirebase(authPreviewUser.uid);
        if (cancelled || !profileSnapshot) return;

        const profileStatus = String(profileSnapshot.status || "active").trim().toLowerCase();
        const profileRole = String(profileSnapshot.role || "user").trim().toLowerCase();
        const profileCoins = Number(profileSnapshot?.requestCredits?.coins) || 0;
        setAccountCoins(profileCoins);
        setAdminSessionRole(profileRole);
        if (profileSnapshot.nationality) {
          setSelectedNationality(profileSnapshot.nationality);
          setNationalityInputText(profileSnapshot.nationality);
        }

        if (DISABLED_ADMIN_EMAILS.includes(normalizedEmail) && profileRole !== "user") {
          await upsertAuthUserProfileInFirebase({
            ...baseProfilePayload,
            role: "user",
          });
          setAdminSessionRole("user");
        }

        if (profileStatus === "blocked") {
          await signOutCurrentUser();
          setAdminSessionRole("user");
          setAuthPreviewMode("login");
          setAuthPreviewOpen(true);
          setModal({
            type: "error",
            title: lang === "ar" ? "تم تقييد الحساب" : "Account Restricted",
            msg: lang === "ar"
              ? "هذا الحساب مقيّد حاليًا. تواصل مع إدارة التطبيق للمراجعة."
              : "This account is currently restricted. Please contact app support.",
          });
          return;
        }

        if (profileStatus === "pending_deletion") {
          if (normalizedEmail) {
            await upsertAuthUserProfileInFirebase({
              uid: authPreviewUser.uid,
              email: authPreviewUser.email,
              phoneNumber: authPreviewUser.phoneNumber,
              displayName: authPreviewUser.displayName,
              country: selectedCountry,
              nationality: selectedNationality,
              providerId: authPreviewUser.phoneNumber ? "phone" : (authPreviewUser.email ? "email" : "unknown"),
              role: profileRole === "admin_delegate"
                ? "admin_delegate"
                : (isAdminEmail(normalizedEmail) ? "admin" : "user"),
              status: "active",
              deletionRequestedAt: null,
              deletionGraceUntil: null,
            });
            setModal({
              type: "success",
              title: lang === "ar" ? "تم استعادة الحساب" : "Account Restored",
              msg: lang === "ar"
                ? "تم استعادة الحساب تلقائيًا بعد تسجيل الدخول بالإيميل."
                : "Your account has been restored automatically after email sign-in.",
            });
            return;
          }

          await signOutCurrentUser();
          setAdminSessionRole("user");
          setAuthPreviewMode("login");
          setAuthPreviewOpen(true);
          setModal({
            type: "error",
            title: lang === "ar" ? "الحساب بانتظار الحذف" : "Account Pending Deletion",
            msg: lang === "ar"
              ? "هذا الحساب في فترة استرجاع لمدة 30 يوم بعد طلب الحذف. تواصل مع الدعم إذا رغبت باسترجاعه."
              : "This account is in the 30-day recovery period after deletion request. Contact support if you want to restore it.",
          });
        }
      } catch (error) {
        console.warn("Auth profile sync/check failed", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authPreviewReady,
    authPreviewUser,
    lang,
    selectedCountry,
    selectedNationality,
  ]);

  useEffect(() => {
    if (authPreviewReady && !authPreviewUser && !guestMode) {
      setAdminSessionRole("user");
      setAuthPreviewMode("login");
      setAuthPreviewOpen(true);
      setShowExitConfirm(false);
    }
  }, [authPreviewReady, authPreviewUser, guestMode]);

  useEffect(() => {
    if (authPreviewUser && guestMode) {
      setGuestMode(false);
    }
  }, [authPreviewUser, guestMode]);

  useEffect(() => {
    if (authPreviewUser?.uid) {
      setShowExitConfirm(false);
    }
  }, [authPreviewUser?.uid]);

  // ── Sync user orders from Firestore on login ──────────────────────────────
  useEffect(() => {
    const uid = authPreviewUser?.uid;
    if (!uid) return;
    let cancelled = false;

    (async () => {
      try {
        const firestoreOrders = await fetchUserOrdersFromFirebase(uid);
        if (cancelled || !firestoreOrders?.length) return;

        // Split by service category
        const cvBuilderFirestoreOrders = firestoreOrders.filter(
          (o) => String(o?.serviceKey || "").trim().toLowerCase() === "builder" ||
                 String(o?.limitBucket || "").trim().toLowerCase() === "cv-builder"
        );
        const cvPaidFirestoreOrders = firestoreOrders.filter(
          (o) => ["premium", "elite"].includes(String(o?.serviceKey || "").trim().toLowerCase()) ||
                 String(o?.limitBucket || "").trim().toLowerCase() === "cv-paid"
        );
        const countryPaidFirestoreOrders = firestoreOrders.filter(
          (o) => String(o?.serviceCategory || "").trim().toLowerCase() === "country-service" ||
                 String(o?.limitBucket || "").trim().toLowerCase() === "country-paid"
        );

        // Merge CV builder orders into state (deduplicate by orderNumber)
        if (cvBuilderFirestoreOrders.length) {
          setCvBuilderOrders((prev) => {
            const existingOrderNumbers = new Set(prev.map((o) => o.orderNumber).filter(Boolean));
            const toAdd = cvBuilderFirestoreOrders
              .filter((fo) => fo.orderNumber && !existingOrderNumbers.has(fo.orderNumber))
              .map((fo) => ({
                id: fo.id || fo.firebaseId,
                firebaseId: fo.firebaseId,
                orderNumber: fo.orderNumber || "",
                serial: fo.serial || "",
                packageName: fo.packageName || fo.service || (lang === "ar" ? "مستخدم عادي" : "Regular User"),
                createdAt: fo.createdAt || new Date().toISOString(),
                dateStr: fo.dateStr || new Date(fo.createdAt || Date.now()).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
                monthKey: fo.monthKey || "",
                review: fo.reviewMeta || null,
                data: fo.cvData || {},
                statsCounted: !!fo.statsCounted,
                emailDeliveryStatus: fo.emailDeliveryStatus || "sent",
              }));
            if (!toAdd.length) return prev;
            return [...toAdd, ...prev].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          });
        }

        // Merge CV paid orders into localStorage per package key
        if (cvPaidFirestoreOrders.length) {
          ["premium", "elite"].forEach((pkgKey) => {
            const pkgOrders = cvPaidFirestoreOrders.filter(
              (o) => String(o?.serviceKey || "").trim().toLowerCase() === pkgKey
            );
            if (!pkgOrders.length) return;
            const storageKey = `cvPaidOrders-${pkgKey}`;
            const existing = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; } })();
            const existingSerials = new Set(existing.map((o) => o.serial).filter(Boolean));
            const toAdd = pkgOrders.filter((fo) => fo.serial && !existingSerials.has(fo.serial));
            if (!toAdd.length) return;
            try { localStorage.setItem(storageKey, JSON.stringify([...toAdd, ...existing])); } catch {}
          });
        }

        // Merge country paid orders into localStorage
        if (countryPaidFirestoreOrders.length) {
          const storageKey = "paidOrders";
          const existing = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; } })();
          const existingSerials = new Set(existing.map((o) => o.serial).filter(Boolean));
          const toAdd = countryPaidFirestoreOrders.filter((fo) => fo.serial && !existingSerials.has(fo.serial));
          if (toAdd.length) {
            try { localStorage.setItem(storageKey, JSON.stringify([...toAdd, ...existing])); } catch {}
          }
        }

        // Notify PaidServicesFlow components to re-read from localStorage
        window.dispatchEvent(new CustomEvent("user-orders-synced"));
      } catch (error) {
        console.error("User orders sync from Firestore failed", error);
      }
    })();

    return () => { cancelled = true; };
  }, [authPreviewUser?.uid, lang]);

  useEffect(() => {
    if (!providerPortalGuestNotice) return undefined;
    const timer = setTimeout(() => setProviderPortalGuestNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [providerPortalGuestNotice]);

  useEffect(() => {
    setAccountProfileName(authPreviewUser?.displayName || "");
    setAccountProfileEmail(authPreviewUser?.email || "");
    setAccountProfilePhone(authPreviewUser?.phoneNumber || "");
    if (!authPreviewUser?.uid) {
      setAccountCoins(0);
    }
    setAccountProfileError("");
    setAccountProfileSuccess("");
    setAccountPhoneBusy(false);
    setAccountPhoneVerificationId("");
    setAccountPhonePendingNumber("");
    setAccountPhoneOtp(["", "", "", "", "", ""]);
    setAccountDeleteConfirm(false);
  }, [authPreviewUser]);

  useEffect(() => {
    if (!accountPanelOpen || !authPreviewUser?.uid) return;
    let cancelled = false;

    (async () => {
      try {
        const profileSnapshot = await fetchUserProfileFromFirebase(authPreviewUser.uid);
        if (cancelled) return;
        setAccountCoins(Number(profileSnapshot?.requestCredits?.coins) || 0);
      } catch (error) {
        if (!cancelled) {
          console.warn("Account coins fetch failed", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountPanelOpen, authPreviewUser?.uid]);

  const clearAuthPreviewFeedback = useCallback(() => {
    setAuthPreviewError("");
    setAuthPreviewSuccess("");
  }, []);

  const resetAuthPreviewForm = useCallback(() => {
    setAuthPreviewName("");
    setAuthPreviewIdentifier("");
    setAuthPreviewPassword("");
    setAuthPreviewConfirmPassword("");
    setAuthPreviewOtp(["", "", "", "", "", ""]);
    setAuthPreviewPhoneFlow(null);
    authPhoneConfirmationRef.current = null;
    if (authPhoneVerifierRef.current?.clear) {
      try {
        authPhoneVerifierRef.current.clear();
      } catch {}
    }
    authPhoneVerifierRef.current = null;
    const recaptchaContainer = typeof document !== "undefined"
      ? document.getElementById("auth-phone-recaptcha")
      : null;
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = "";
    }
    clearAuthPreviewFeedback();
  }, [clearAuthPreviewFeedback]);

  useEffect(() => {
    if (!authPreviewOpen) return;
    if (authPreviewMode !== "login" && authPreviewMode !== "signup") return;
    if (String(authPreviewIdentifier || "").trim()) return;
    setAuthPreviewIdentifier("");
  }, [authPreviewOpen, authPreviewMode, authPreviewIdentifier]);

  const closeAuthPreview = useCallback(() => {
    setShowExitConfirm(false);
    setAuthPreviewOpen(false);
    setAuthPreviewMode("login");
    setAuthPreviewBusy(false);
    resetAuthPreviewForm();
  }, [resetAuthPreviewForm]);

  const handleAuthPreviewGuestMode = useCallback(() => {
    clearAuthPreviewFeedback();
    setShowExitConfirm(false);
    setGuestMode(true);
    setAuthPreviewOpen(false);
    setAuthPreviewMode("login");
    setAuthPreviewBusy(false);
    resetAuthPreviewForm();
  }, [clearAuthPreviewFeedback, resetAuthPreviewForm]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const redirectUser = await consumeGoogleRedirectResult();
        if (cancelled || !redirectUser) return;

        setModal({
          type: "info",
          title: lang === "ar" ? "تم تسجيل الدخول" : "Login successful",
          msg: lang === "ar"
            ? "تم تسجيل دخولك عبر Google بنجاح."
            : "You have signed in successfully with Google.",
        });
        closeAuthPreview();
      } catch (error) {
        if (cancelled) return;
        const detail = String(error?.message || error?.code || "unknown");
        setAuthPreviewError(
          lang === "ar"
            ? `تعذر إكمال تسجيل Google بعد الرجوع من المتصفح. (${detail})`
            : `Unable to complete Google sign-in after returning from the browser. (${detail})`
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [closeAuthPreview, lang]);

  const authPreviewIdentifierType = useMemo(() => {
    const value = String(authPreviewIdentifier || "").trim();
    if (!value) return "";
    return value.includes("@") ? "email" : "phone";
  }, [authPreviewIdentifier]);

  const shouldUseSplitPhoneInput = useMemo(() => {
    if (authPreviewIdentifierType !== "phone") return false;
    const value = String(authPreviewIdentifier || "").trim();
    if (!value) return false;
    if (value.startsWith("+") || value.startsWith("00")) return true;
    // Switch to split phone input only when the user is clearly typing a phone number.
    return /^[0-9\s()+-]+$/.test(value) && value.replace(/\D/g, "").length >= 3;
  }, [authPreviewIdentifier, authPreviewIdentifierType]);

  useEffect(() => {
    if (!shouldUseSplitPhoneInput || authPreviewMode === "otp") return;
    const timer = setTimeout(() => {
      const phoneInput = authPreviewSplitPhoneInputRef.current;
      if (!phoneInput) return;
      phoneInput.focus();
      const end = String(phoneInput.value || "").length;
      phoneInput.setSelectionRange?.(end, end);
    }, 0);
    return () => clearTimeout(timer);
  }, [shouldUseSplitPhoneInput, authPreviewMode]);

  const dialCodeOptions = useMemo(() => {
    const values = Object.values(NATIONALITY_DIAL_CODES || {})
      .map((value) => String(value || "").trim())
      .filter((value) => value.startsWith("+") && value.length > 1);
    return Array.from(new Set(values));
  }, []);

  const normalizePhoneNumber = useCallback((rawValue) => {
    const trimmedValue = String(rawValue || "").trim();
    if (!trimmedValue) return "";
    if (trimmedValue.startsWith("+")) {
      return `+${trimmedValue.slice(1).replace(/\D/g, "")}`;
    }
    if (trimmedValue.startsWith("00")) {
      return `+${trimmedValue.slice(2).replace(/\D/g, "")}`;
    }
    const digitsOnly = trimmedValue.replace(/\D/g, "");
    return digitsOnly ? `+${digitsOnly}` : "";
  }, []);

  const splitPhoneValue = useCallback((rawValue, fallbackDialCode) => {
    const trimmedValue = String(rawValue || "").trim();
    const fallback = String(fallbackDialCode || "").trim() || "+";
    if (!trimmedValue) {
      return { dialCode: fallback, nationalNumber: "" };
    }
    const normalized = normalizePhoneNumber(trimmedValue);
    if (!normalized.startsWith("+")) {
      return { dialCode: fallback, nationalNumber: trimmedValue.replace(/\D/g, "") };
    }

    const digits = normalized.slice(1);
    const sortedDialCodes = dialCodeOptions
      .map((code) => ({ code, digits: code.replace(/\D/g, "") }))
      .filter((item) => item.digits)
      .sort((a, b) => b.digits.length - a.digits.length);

    const matched = sortedDialCodes.find((item) => digits.startsWith(item.digits));
    if (!matched) {
      return { dialCode: fallback, nationalNumber: digits };
    }
    return {
      dialCode: matched.code,
      nationalNumber: digits.slice(matched.digits.length),
    };
  }, [dialCodeOptions, normalizePhoneNumber]);

  const composeE164 = useCallback((dialCode, rawNationalNumber) => {
    const cleanDial = String(dialCode || "").trim();
    const dialDigits = cleanDial.replace(/\D/g, "");
    let nationalDigits = String(rawNationalNumber || "").replace(/\D/g, "");
    if (nationalDigits.startsWith("0")) {
      nationalDigits = nationalDigits.slice(1);
    }
    if (!dialDigits || !nationalDigits) return "";
    return `+${dialDigits}${nationalDigits}`;
  }, []);

  const ensurePhoneInputWithPlus = useCallback((rawValue) => {
    const normalized = normalizePhoneNumber(rawValue);
    return normalized || "+";
  }, [normalizePhoneNumber]);

  const normalizePhoneNumberWithNationality = useCallback((rawValue, nationality) => {
    const trimmedValue = String(rawValue || "").trim();
    if (!trimmedValue) return "";
    if (trimmedValue.startsWith("+") || trimmedValue.startsWith("00")) {
      return normalizePhoneNumber(trimmedValue);
    }

    const digitsOnly = trimmedValue.replace(/\D/g, "");
    if (!digitsOnly) return "";

    const dialCode = NATIONALITY_DIAL_CODES[String(nationality || "").trim()] || "";
    if (!dialCode) {
      return `+${digitsOnly}`;
    }

    const dialDigits = dialCode.replace(/\D/g, "");
    if (dialDigits && digitsOnly.startsWith(dialDigits)) {
      return `+${digitsOnly}`;
    }

    if (digitsOnly.startsWith("0")) {
      return `${dialCode}${digitsOnly.slice(1)}`;
    }

    return `${dialCode}${digitsOnly}`;
  }, [normalizePhoneNumber]);

  const accountPhonePlaceholder = useMemo(() => {
    return lang === "ar" ? "+ كود الدولة ثم الرقم" : "+ country code then number";
  }, [lang]);

  const getAuthPreviewRecaptcha = useCallback(async () => {
    if (authPhoneVerifierRef.current?.clear) {
      try {
        authPhoneVerifierRef.current.clear();
      } catch {}
      authPhoneVerifierRef.current = null;
    }

    // Give the DOM a tiny moment to ensure the container exists (especially after view transitions).
    await new Promise((resolve) => setTimeout(resolve, 200));

    const containerId = "auth-phone-recaptcha";
    const recaptchaContainer = typeof document !== "undefined"
      ? document.getElementById(containerId)
      : null;
    if (!recaptchaContainer) {
      throw new Error("recaptcha-container-missing");
    }
    recaptchaContainer.innerHTML = "";

    const verifier = createPhoneRecaptcha("auth-phone-recaptcha", {
      size: "invisible",
      callback: () => {},
    });
    await verifier.render();
    authPhoneVerifierRef.current = verifier;
    return verifier;
  }, []);

  const authPreviewFallbackDialCode = useMemo(() => "+", []);

  const openAuthPreviewOtp = useCallback(({ nextMode = "otp", successMessage = "", phoneFlow = null } = {}) => {
    setAuthPreviewOtp(["", "", "", "", "", ""]);
    setAuthPreviewMode(nextMode);
    setAuthPreviewPhoneFlow(phoneFlow);
    setAuthPreviewSuccess(successMessage);
    setAuthPreviewError("");
    // start resend countdown
    clearInterval(authPreviewOtpResendIntervalRef.current);
    setAuthPreviewOtpResendTimer(30);
    authPreviewOtpResendIntervalRef.current = setInterval(() => {
      setAuthPreviewOtpResendTimer((v) => {
        if (v <= 1) { clearInterval(authPreviewOtpResendIntervalRef.current); return 0; }
        return v - 1;
      });
    }, 1000);
    setTimeout(() => { authPreviewOtpRefs.current[0]?.focus(); }, 100);
  }, []);

  const handleAuthPreviewGoogle = useCallback(async () => {
    setAuthPreviewBusy(true);
    clearAuthPreviewFeedback();
    let timeoutId = null;
    try {
      const timeoutMs = 25000;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutError = new Error("google-signin-timeout");
          timeoutError.code = "google-signin-timeout";
          reject(timeoutError);
        }, timeoutMs);
      });
      await Promise.race([signInWithGooglePopup(), timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      setModal({
        type: "info",
        title: lang === "ar" ? "تم تسجيل الدخول" : "Login successful",
        msg: lang === "ar"
          ? "تم تسجيل دخولك عبر Google بنجاح."
          : "You have signed in successfully with Google.",
      });
      closeAuthPreview();
    } catch (error) {
      if (String(error?.code || "") === "google-redirect-started") {
        setAuthPreviewError(
          lang === "ar"
            ? "تم التحويل لطريقة تسجيل Google البديلة. أكمل تسجيل الدخول في الصفحة المفتوحة."
            : "Switched to Google redirect sign-in. Complete sign-in on the opened page."
        );
        return;
      }
      if (String(error?.code || "") === "google-signin-timeout") {
        setAuthPreviewError(
          lang === "ar"
            ? "انتهت مهلة تسجيل Google. أغلق المتصفح الخارجي ثم أعد المحاولة."
            : "Google sign-in timed out. Close the external browser and try again."
        );
        return;
      }
      console.error("Google sign-in failed", error);
      const rawCode = String(error?.code || "").toLowerCase();
      const rawMessage = String(error?.message || "").toLowerCase();
      const details = String(
        error?.details?.nativeMessage ||
        error?.details?.popupMessage ||
        error?.message ||
        error?.code ||
        "unknown"
      );

      if (
        rawCode.includes("app-not-authorized") ||
        rawCode.includes("developer_error") ||
        rawCode.includes("unauthorized") ||
        rawMessage.includes("app not authorized") ||
        rawMessage.includes("sha")
      ) {
        setAuthPreviewError(
          lang === "ar"
            ? "تسجيل Google غير مصرح لهذا التطبيق. أضف SHA-1 و SHA-256 في Firebase ثم نزّل google-services.json الجديد."
            : "Google sign-in is not authorized for this app. Add SHA-1 and SHA-256 in Firebase, then download the latest google-services.json."
        );
      } else if (
        rawCode.includes("popup") ||
        rawMessage.includes("popup") ||
        rawCode.includes("cancel") ||
        rawMessage.includes("cancel")
      ) {
        setAuthPreviewError(
          lang === "ar"
            ? "تم إغلاق نافذة Google أو تم حظرها. حاول مرة أخرى."
            : "The Google window was blocked or closed. Please try again."
        );
      } else {
        setAuthPreviewError(
          lang === "ar"
            ? `تعذر تسجيل الدخول عبر Google. (${details})`
            : `Unable to continue with Google. (${details})`
        );
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setAuthPreviewBusy(false);
    }
  }, [clearAuthPreviewFeedback, closeAuthPreview, lang]);

  const handleAuthSignOut = useCallback(async () => {
    try {
      await signOutCurrentUser();
      setGuestMode(false);
      resetAuthPreviewForm();
      setAuthPreviewMode("login");
      setAuthPreviewOpen(true);
      setAdminPanelOpen(false);
      setAdminSecurityOpen(false);
      setAdminSecurityCode("");
      setAdminSecurityError("");
      setAdminSecurityAttempts(0);
      setAdminSecurityBusy(false);
      setModal({
        type: "info",
        title: lang === "ar" ? "تم تسجيل الخروج" : "Signed out",
        msg: lang === "ar"
          ? "تم تسجيل خروجك بنجاح. سجّل الدخول مرة أخرى للمتابعة."
          : "You have signed out successfully. Sign in again to continue.",
      });
    } catch (error) {
      console.error("Sign out failed", error);
      setModal({
        type: "info",
        title: lang === "ar" ? "تعذر تسجيل الخروج" : "Sign-out failed",
        msg: lang === "ar"
          ? "تعذر تسجيل الخروج الآن. حاول مرة أخرى."
          : "Unable to sign out right now. Please try again.",
      });
    }
  }, [lang, resetAuthPreviewForm]);

  const clearAccountPhoneVerifier = useCallback(() => {
    if (accountPhoneVerifierRef.current?.clear) {
      try {
        accountPhoneVerifierRef.current.clear();
      } catch {}
    }
    accountPhoneVerifierRef.current = null;
    const recaptchaContainer = typeof document !== "undefined"
      ? document.getElementById("account-phone-recaptcha-container")
      : null;
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = "";
    }
  }, []);

  const closeAccountPanel = useCallback(() => {
    setAccountPanelOpen(false);
    setAccountProfileError("");
    setAccountProfileSuccess("");
    setAccountPhoneBusy(false);
    setAccountPhoneVerificationId("");
    setAccountPhonePendingNumber("");
    setAccountPhoneOtp(["", "", "", "", "", ""]);
    clearAccountPhoneVerifier();
    setAccountDeleteConfirm(false);
  }, [clearAccountPhoneVerifier]);

  const navigateBackFromAccountPanel = useCallback(() => {
    closeAccountPanel();
    setMainTab("home");
    setSelectedCountry("مصر");
    setShowOtherDropdown(false);
    setSelectedGov(null);
    setActiveTab("ministry");
    setView("egyptMenu");
  }, [closeAccountPanel]);

  const handleAccountBackAction = useCallback(() => {
    if (accountDeleteConfirm) {
      setAccountDeleteConfirm(false);
      return;
    }
    if (accountPhoneVerificationId) {
      setAccountPhoneVerificationId("");
      setAccountPhonePendingNumber("");
      setAccountPhoneOtp(["", "", "", "", "", ""]);
      setAccountProfileError("");
      setAccountProfileSuccess("");
      return;
    }
    navigateBackFromAccountPanel();
  }, [accountDeleteConfirm, accountPhoneVerificationId, navigateBackFromAccountPanel]);

  const closeSignOutConfirm = useCallback(() => {
    setSignOutConfirmOpen(false);
  }, []);

  const closeAdminSecurityModal = useCallback(() => {
    setAdminSecurityOpen(false);
    setAdminSecurityCode("");
    setAdminSecurityError("");
    setAdminSecurityAttempts(0);
    setAdminSecurityBusy(false);
  }, []);

  const openAdminSecurityModal = useCallback(() => {
    setAdminSecurityOpen(true);
    setAdminSecurityCode("");
    setAdminSecurityError("");
    setAdminSecurityAttempts(0);
    setAdminSecurityBusy(false);
  }, []);

  const handleAdminSecuritySubmit = useCallback(async () => {
    if (adminSecurityBusy) return;

    const normalizedCode = String(adminSecurityCode || "").replace(/\D/g, "").slice(0, 6);
    if (normalizedCode.length !== 6) {
      setAdminSecurityError(lang === "ar" ? "اكتب كود الأدمن المكوّن من 6 أرقام." : "Enter the 6-digit admin code.");
      return;
    }

    setAdminSecurityBusy(true);
    if (normalizedCode === adminSecurityExpectedCode) {
      setAdminSecurityOpen(false);
      setAdminSecurityCode("");
      setAdminSecurityError("");
      setAdminSecurityAttempts(0);
      setAdminSecurityBusy(false);
      setAdminPanelOpen(true);
      return;
    }

    const nextAttempts = adminSecurityAttempts + 1;
    if (nextAttempts >= 2) {
      setAdminSecurityError(
        lang === "ar"
          ? "فشل التحقق مرتين. سيتم تسجيل الخروج تلقائيًا الآن."
          : "Verification failed twice. You will be signed out automatically now."
      );
      setAdminSecurityAttempts(nextAttempts);
      await handleAuthSignOut();
      return;
    }

    setAdminSecurityAttempts(nextAttempts);
    setAdminSecurityCode("");
    setAdminSecurityBusy(false);
    setAdminSecurityError(
      lang === "ar"
        ? "كود الأدمن غير صحيح. متبقي محاولة واحدة قبل تسجيل الخروج."
        : "Incorrect admin code. One attempt left before auto sign-out."
    );
  }, [
    adminSecurityAttempts,
    adminSecurityBusy,
    adminSecurityCode,
    adminSecurityExpectedCode,
    handleAuthSignOut,
    lang,
  ]);

  const closeAdminPanel = useCallback(() => {
    setAdminPanelOpen(false);
    setAdminPanelSection("overview");
    setAdminPanelHistory(["overview"]);
    setAdminSelectedProviderRequestId("");
    setAdminSelectedOrderId("");
    setAdminSelectedUserUid("");
    setAdminUsersError("");
    setAdminUsersQuery("");
    setAdminActionBusyUid("");
    setAdminActionConfirm(null);
    setAdminOrdersError("");
    setAdminOrdersQuery("");
    setAdminOrderActionBusyId("");
    setAdminExpandedOrderId("");
    setAdminProviderRequestsError("");
    setAdminProviderRequestsQuery("");
    setAdminProviderActionBusyId("");
    setAdminExitConfirm(false);
  }, []);

  const loadAdminUsers = useCallback(async () => {
    setAdminUsersLoading(true);
    setAdminUsersError("");
    try {
      const users = await fetchUserProfilesFromFirebase();
      setAdminUsers(users);
    } catch (error) {
      console.error("Failed to load admin users", error);
      const errDetail = String(error?.code || error?.message || "");
      setAdminUsersError(
        lang === "ar"
          ? `تعذر تحميل المستخدمين الآن. (${errDetail || "unknown"})`
          : `Unable to load registered users right now. (${errDetail || "unknown"})`
      );
    } finally {
      setAdminUsersLoading(false);
    }
  }, [lang]);

  const loadAdminOrders = useCallback(async () => {
    setAdminOrdersLoading(true);
    setAdminOrdersError("");
    try {
      const orders = await fetchServiceOrdersFromFirebase();

      const normalizedOrders = (orders || [])
        .map((orderItem) => {
          const createdAtMs = orderItem?.createdAt?.toDate
            ? orderItem.createdAt.toDate().getTime()
            : new Date(orderItem?.createdAt || orderItem?.date || 0).getTime();
          const rawPhone = String(orderItem?.phone || orderItem?.mobile || orderItem?.whatsapp || orderItem?.phoneNumber || "").trim();
          const digitsOnly = rawPhone.replace(/\D+/g, "");
          const whatsappNumber = digitsOnly.startsWith("00") ? digitsOnly.slice(2) : digitsOnly;
          return {
            ...orderItem,
            createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
            createdAtLabel: formatReviewDateValue(orderItem?.createdAt || orderItem?.date, lang),
            serialLabel: String(orderItem?.serial || orderItem?.firebaseId || orderItem?.id || "").trim(),
            customerName: String(orderItem?.name || orderItem?.fullName || "").trim(),
            serviceName: String(orderItem?.service || orderItem?.serviceLabel || orderItem?.serviceKey || "").trim(),
            countryName: String(orderItem?.country || "").trim(),
            nationalityName: String(orderItem?.nationality || orderItem?.clientNationality || "").trim(),
            customerPhone: rawPhone,
            whatsappNumber,
            reviewedFlag: !!orderItem?.reviewed,
            ratingValue: Number(orderItem?.rating) || 0,
            reviewTextValue: String(orderItem?.reviewText || "").trim(),
            stageConfirmations: {
              ...createInitialStageConfirmations(),
              ...(orderItem?.stageConfirmations || {}),
            },
            emailDeliveryStatus: String(orderItem?.emailDeliveryStatus || "unknown").trim().toLowerCase(),
            emailDeliveryUpdatedAt: orderItem?.emailDeliveryUpdatedAt || "",
          };
        })
        .filter((entry) => entry.createdAtMs > 0)
        .sort((a, b) => b.createdAtMs - a.createdAtMs);

      setAdminOrders(normalizedOrders);
    } catch (error) {
      console.error("Failed to load admin orders", error);
      const errDetail = String(error?.code || error?.message || "");
      setAdminOrdersError(
        lang === "ar"
          ? `تعذر تحميل الطلبات الآن. (${errDetail || "unknown"})`
          : `Unable to load orders right now. (${errDetail || "unknown"})`
      );
    } finally {
      setAdminOrdersLoading(false);
    }
  }, [lang]);

  const loadAdminProviderRequests = useCallback(async () => {
    setAdminProviderRequestsLoading(true);
    setAdminProviderRequestsError("");
    try {
      const requests = await fetchServiceProviderRequestsFromFirebase();
      setAdminProviderRequests(
        (requests || [])
          .map((entry) => {
            const createdAtMs = getProviderRequestTimestamp(entry);
            return {
              ...entry,
              createdAtMs,
              createdAtLabel: formatReviewDateValue(entry?.createdAt || entry?.updatedAt, lang),
              serialLabel: String(entry?.serial || entry?.id || "").trim(),
              statusValue: String(entry?.status || "pending").trim().toLowerCase(),
              providerNameValue: String(entry?.providerName || entry?.officeName || entry?.name || "").trim(),
              countryValue: String(entry?.country || "").trim(),
              nationalityValue: String(entry?.nationality || "").trim(),
              emailValue: String(entry?.email || entry?.userEmail || "").trim(),
              servicesValue: Array.isArray(entry?.services) ? entry.services : [],
            };
          })
          .sort((a, b) => b.createdAtMs - a.createdAtMs)
      );
    } catch (error) {
      console.error("Failed to load provider requests", error);
      setAdminProviderRequestsError(
        lang === "ar"
          ? "تعذر تحميل طلبات مقدمي الخدمات الآن."
          : "Unable to load service provider requests right now."
      );
    } finally {
      setAdminProviderRequestsLoading(false);
    }
  }, [getProviderRequestTimestamp, lang]);

  useEffect(() => {
    if (!isAdminUser) return undefined;

    const unsubscribe = subscribeServiceProviderRequestsFromFirebase((requests) => {
      setAdminProviderRequests(
        (requests || [])
          .map((entry) => {
            const createdAtMs = getProviderRequestTimestamp(entry);
            return {
              ...entry,
              createdAtMs,
              createdAtLabel: formatReviewDateValue(entry?.createdAt || entry?.updatedAt, lang),
              serialLabel: String(entry?.serial || entry?.id || "").trim(),
              statusValue: String(entry?.status || "pending").trim().toLowerCase(),
              providerNameValue: String(entry?.providerName || entry?.officeName || entry?.name || "").trim(),
              countryValue: String(entry?.country || "").trim(),
              nationalityValue: String(entry?.nationality || "").trim(),
              emailValue: String(entry?.email || entry?.userEmail || "").trim(),
              servicesValue: Array.isArray(entry?.services) ? entry.services : [],
            };
          })
          .sort((a, b) => b.createdAtMs - a.createdAtMs)
      );
      setAdminProviderRequestsLoading(false);
      setAdminProviderRequestsError("");
    });

    return () => unsubscribe();
  }, [getProviderRequestTimestamp, isAdminUser, lang]);

  const handleAdminProviderDecision = useCallback(async (requestItem, nextStatus) => {
    const requestId = String(requestItem?.id || "").trim();
    if (!requestId) return;
    const currentStatus = String(requestItem?.statusValue || requestItem?.status || "pending").trim().toLowerCase();
    if (currentStatus !== "pending") {
      setAdminProviderRequestsError(
        lang === "ar"
          ? "هذا الطلب تم التعامل معه بالفعل ولا يمكن اعتماد/رفضه مرة أخرى."
          : "This request is already decided and cannot be approved/rejected again."
      );
      return;
    }
    const cleanStatus = nextStatus === "approved" ? "approved" : "rejected";
    const note = window.prompt(
      lang === "ar"
        ? "اكتب ملاحظة القرار (اختياري)"
        : "Write a decision note (optional)",
      String(requestItem?.adminDecisionNote || "")
    );
    if (note === null) return;

    const portalLink = cleanStatus === "approved"
      ? window.prompt(
        lang === "ar"
          ? "أدخل رابط البوابة المعتمدة (اختياري)"
          : "Enter approved portal link (optional)",
        String(requestItem?.portalLink || "")
      )
      : String(requestItem?.portalLink || "");

    if (portalLink === null) return;

    setAdminProviderActionBusyId(requestId);
    setAdminProviderRequestsError("");
    try {
      const updates = {
        status: cleanStatus,
        decisionAt: new Date().toISOString(),
        adminDecisionNote: String(note || "").trim(),
        portalLink: String(portalLink || "").trim(),
      };

      await updateServiceProviderRequestInFirebase(requestId, updates);

      const targetUid = String(requestItem?.userUid || "").trim();
      if (targetUid) {
        await upsertAuthUserProfileInFirebase({
          uid: targetUid,
          email: requestItem?.userEmail || requestItem?.email || "",
          phoneNumber: requestItem?.phone || "",
          displayName: requestItem?.providerName || requestItem?.officeName || "",
          country: requestItem?.country || "",
          nationality: requestItem?.nationality || "",
          providerId: requestItem?.phone ? "phone" : (requestItem?.email ? "email" : "unknown"),
          providerApprovalStatus: cleanStatus,
          providerApprovalRequestId: requestId,
          providerApprovalUpdatedAt: new Date().toISOString(),
          providerPortalLink: String(portalLink || "").trim(),
        });
      }

      setAdminProviderRequests((prev) => prev.map((entry) => (
        String(entry?.id || "") === requestId
          ? { ...entry, ...updates, statusValue: cleanStatus }
          : entry
      )));

      if (providerApprovalSnapshot && String(providerApprovalSnapshot?.id || "") === requestId) {
        setProviderApprovalSnapshot((prev) => ({
          ...(prev || {}),
          ...updates,
        }));
      }

      void sendServiceProviderEmails({
        type: "decision",
        request: {
          ...requestItem,
          id: requestId,
          serial: requestItem?.serial || requestItem?.serialLabel || requestId,
          ...updates,
        },
      });
    } catch (error) {
      console.error("Failed to update provider request decision", error);
      setAdminProviderRequestsError(
        lang === "ar"
          ? "تعذر تنفيذ قرار الطلب الآن."
          : "Unable to apply the request decision now."
      );
    } finally {
      setAdminProviderActionBusyId("");
    }
  }, [lang, providerApprovalSnapshot]);

  const handleAdminProviderBlock = useCallback(async (requestItem) => {
    const requestId = String(requestItem?.id || "").trim();
    if (!requestId) return;
    const currentStatus = String(requestItem?.statusValue || requestItem?.status || "pending").trim().toLowerCase();
    if (currentStatus !== "approved") return;

    const note = window.prompt(
      lang === "ar" ? "ملاحظة الحظر (اختياري)" : "Block note (optional)",
      String(requestItem?.adminDecisionNote || "")
    );
    if (note === null) return;

    setAdminProviderActionBusyId(requestId);
    setAdminProviderRequestsError("");
    try {
      const updates = {
        status: "blocked",
        blockedAt: new Date().toISOString(),
        adminDecisionNote: String(note || "").trim(),
      };

      await updateServiceProviderRequestInFirebase(requestId, updates);

      const targetUid = String(requestItem?.userUid || "").trim();
      if (targetUid) {
        await upsertAuthUserProfileInFirebase({
          uid: targetUid,
          email: requestItem?.userEmail || requestItem?.email || "",
          phoneNumber: requestItem?.phone || "",
          displayName: requestItem?.providerName || requestItem?.officeName || "",
          country: requestItem?.country || "",
          nationality: requestItem?.nationality || "",
          providerId: requestItem?.phone ? "phone" : (requestItem?.email ? "email" : "unknown"),
          providerApprovalStatus: "blocked",
          providerApprovalRequestId: requestId,
          providerApprovalUpdatedAt: new Date().toISOString(),
          status: "blocked",
        });
      }

      setAdminProviderRequests((prev) => prev.map((entry) => (
        String(entry?.id || "") === requestId
          ? { ...entry, ...updates, statusValue: "blocked" }
          : entry
      )));
    } catch (error) {
      console.error("Failed to block provider request", error);
      setAdminProviderRequestsError(
        lang === "ar"
          ? "تعذر حظر مقدم الخدمة الآن."
          : "Unable to block this provider right now."
      );
    } finally {
      setAdminProviderActionBusyId("");
    }
  }, [lang]);

  const handleAdminProviderDelete = useCallback(async (requestItem) => {
    const requestId = String(requestItem?.id || "").trim();
    if (!requestId) return;
    const confirmed = typeof window === "undefined" || window.confirm(
      lang === "ar"
        ? "تأكيد حذف هذا الطلب من قائمة مقدمي الخدمات؟"
        : "Confirm deleting this provider request from the providers list?"
    );
    if (!confirmed) return;

    setAdminProviderActionBusyId(requestId);
    setAdminProviderRequestsError("");
    try {
      const updates = {
        status: "deleted",
        deletedAt: new Date().toISOString(),
      };
      await updateServiceProviderRequestInFirebase(requestId, updates);

      setAdminProviderRequests((prev) => prev.filter((entry) => String(entry?.id || "") !== requestId));
      if (adminSelectedProviderRequestId === requestId) {
        setAdminSelectedProviderRequestId("");
        setAdminPanelSection("providers");
      }
    } catch (error) {
      console.error("Failed to delete provider request", error);
      setAdminProviderRequestsError(
        lang === "ar"
          ? "تعذر حذف طلب مقدم الخدمة الآن."
          : "Unable to delete this provider request right now."
      );
    } finally {
      setAdminProviderActionBusyId("");
    }
  }, [adminSelectedProviderRequestId, lang]);

  useEffect(() => {
    const uid = String(authPreviewUser?.uid || "").trim();
    if (!uid) {
      setProviderApprovalSnapshot(null);
      return;
    }

    const unsubscribe = subscribeServiceProviderRequestsByUser(uid, (requests) => {
      const scoped = (requests || []).filter((entry) => {
        const reqCountry = String(entry?.country || "").trim();
        return !selectedCountry || !reqCountry || reqCountry === selectedCountry;
      });
      const sorted = scoped.sort((a, b) => getProviderRequestTimestamp(b) - getProviderRequestTimestamp(a));
      setProviderAllRequests(sorted);
      const approved = sorted.find((r) => String(r?.status || "").trim().toLowerCase() === "approved") || null;
      setProviderApprovalSnapshot(approved || sorted[0] || null);
    });

    return () => {
      unsubscribe();
    };
  }, [authPreviewUser?.uid, getProviderRequestTimestamp, selectedCountry]);

  const syncAdminOrderLocally = useCallback((orderId, updater) => {
    const cleanOrderId = String(orderId || "").trim();
    if (!cleanOrderId) return;
    const applyUpdate = (entry) => {
      const entryId = String(entry?.firebaseId || entry?.id || "").trim();
      if (entryId !== cleanOrderId) return entry;
      return typeof updater === "function"
        ? updater(entry)
        : { ...entry, ...(updater || {}) };
    };
    setAdminOrders((prev) => prev.map(applyUpdate));
    setCvAdminAllOrders((prev) => prev.map(applyUpdate));
  }, []);

  const handleAdminOrderSetStage = useCallback(async (orderItem, targetIndex) => {
    const orderId = String(orderItem?.firebaseId || orderItem?.id || "").trim();
    if (!orderId) {
      setAdminOrdersError(lang === "ar" ? "لا يمكن تعديل هذا الطلب الآن." : "Cannot update this order right now.");
      return;
    }

    const safeIndex = Math.max(0, Math.min(STATUS_STEP_KEYS.length - 1, Number(targetIndex) || 0));
    const nextStageMap = { ...createInitialStageConfirmations() };
    STATUS_STEP_KEYS.forEach((key, idx) => {
      nextStageMap[key] = idx <= safeIndex;
    });
    const nextStatusText = safeIndex >= STATUS_STEP_KEYS.length - 1 ? "done" : "in-progress";

    setAdminOrderActionBusyId(orderId);
    setAdminOrdersError("");
    try {
      await updateOrderInFirebase(orderId, {
        statusIndex: safeIndex,
        stageConfirmations: nextStageMap,
        status: nextStatusText,
        orderStatus: nextStatusText,
      });
      syncAdminOrderLocally(orderId, {
        statusIndex: safeIndex,
        stageConfirmations: nextStageMap,
        status: nextStatusText,
        orderStatus: nextStatusText,
      });
    } catch (error) {
      console.error("Failed to update admin order stage", error);
      setAdminOrdersError(lang === "ar" ? "تعذر تعديل مرحلة الطلب." : "Unable to update order stage.");
    } finally {
      setAdminOrderActionBusyId("");
    }
  }, [lang, syncAdminOrderLocally]);

  const handleAdminOrderClearReview = useCallback(async (orderItem) => {
    const orderId = String(orderItem?.firebaseId || orderItem?.id || "").trim();
    if (!orderId) {
      setAdminOrdersError(lang === "ar" ? "لا يمكن تعديل هذا الطلب الآن." : "Cannot update this order right now.");
      return;
    }

    setAdminOrderActionBusyId(orderId);
    setAdminOrdersError("");
    try {
      await updateOrderInFirebase(orderId, {
        reviewed: false,
        rating: 0,
        reviewText: "",
        reviewSavedAt: null,
      });
      syncAdminOrderLocally(orderId, {
        reviewed: false,
        rating: 0,
        reviewText: "",
        reviewedFlag: false,
        ratingValue: 0,
        reviewTextValue: "",
      });
    } catch (error) {
      console.error("Failed to clear order review", error);
      setAdminOrdersError(lang === "ar" ? "تعذر حذف التقييم والتعليق." : "Unable to remove rating and comment.");
    } finally {
      setAdminOrderActionBusyId("");
    }
  }, [lang, syncAdminOrderLocally]);

  const handleAdminOrderEditDetails = useCallback(async (orderItem) => {
    const orderId = String(orderItem?.firebaseId || orderItem?.id || "").trim();
    if (!orderId) {
      setAdminOrdersError(lang === "ar" ? "لا يمكن تعديل هذا الطلب الآن." : "Cannot update this order right now.");
      return;
    }

    const nextName = window.prompt(
      lang === "ar" ? "اسم العميل" : "Customer name",
      String(orderItem?.customerName || orderItem?.name || orderItem?.fullName || "")
    );
    if (nextName === null) return;

    const nextPhone = window.prompt(
      lang === "ar" ? "رقم الهاتف" : "Phone number",
      String(orderItem?.customerPhone || orderItem?.phone || "")
    );
    if (nextPhone === null) return;

    const nextWhatsapp = window.prompt(
      lang === "ar" ? "رقم واتساب" : "WhatsApp number",
      String(orderItem?.whatsapp || orderItem?.customerPhone || orderItem?.phone || "")
    );
    if (nextWhatsapp === null) return;

    const nextCountry = window.prompt(
      lang === "ar" ? "الدولة" : "Country",
      String(orderItem?.countryName || orderItem?.country || "")
    );
    if (nextCountry === null) return;

    const nextService = window.prompt(
      lang === "ar" ? "اسم الخدمة" : "Service name",
      String(orderItem?.serviceName || orderItem?.service || "")
    );
    if (nextService === null) return;

    const payload = {
      name: String(nextName || "").trim(),
      fullName: String(nextName || "").trim(),
      phone: String(nextPhone || "").trim(),
      whatsapp: String(nextWhatsapp || "").trim(),
      country: String(nextCountry || "").trim(),
      service: String(nextService || "").trim(),
    };

    setAdminOrderActionBusyId(orderId);
    setAdminOrdersError("");
    try {
      await updateOrderInFirebase(orderId, payload);
      syncAdminOrderLocally(orderId, (entry) => {
        const rawPhone = String(payload.phone || entry.customerPhone || "").trim();
        const digitsOnly = rawPhone.replace(/\D+/g, "");
        const whatsappDigits = String(payload.whatsapp || "").replace(/\D+/g, "");
        return {
          ...entry,
          ...payload,
          customerName: payload.name,
          customerPhone: payload.phone,
          countryName: payload.country,
          serviceName: payload.service,
          whatsappNumber: (whatsappDigits || digitsOnly || "").replace(/^00/, ""),
        };
      });
    } catch (error) {
      console.error("Failed to edit order details", error);
      setAdminOrdersError(lang === "ar" ? "تعذر تعديل بيانات الطلب." : "Unable to edit order details.");
    } finally {
      setAdminOrderActionBusyId("");
    }
  }, [lang, syncAdminOrderLocally]);

  const handleAdminDeleteOrder = useCallback(async (orderItem) => {
    const orderId = String(orderItem?.firebaseId || orderItem?.id || "").trim();
    if (!orderId) {
      setAdminOrdersError(lang === "ar" ? "لا يمكن حذف هذا الطلب الآن." : "Cannot delete this order right now.");
      return;
    }

    const confirmed = window.confirm(
      lang === "ar"
        ? "تأكيد حذف هذا الطلب نهائيًا؟"
        : "Confirm permanent deletion for this order?"
    );
    if (!confirmed) return;

    setAdminOrderActionBusyId(orderId);
    setAdminOrdersError("");
    try {
      await deleteOrderInFirebase(orderId);
      const filterOut = (prev) => prev.filter((entry) => String(entry?.firebaseId || entry?.id || "").trim() !== orderId);
      setAdminOrders(filterOut);
      setCvAdminAllOrders(filterOut);
      setAdminExpandedOrderId((prev) => (prev === orderId ? "" : prev));
      setAdminSelectedOrderId((prev) => (prev === orderId ? "" : prev));
    } catch (error) {
      console.error("Failed to delete order", error);
      setAdminOrdersError(lang === "ar" ? "تعذر حذف الطلب الآن." : "Unable to delete this order right now.");
    } finally {
      setAdminOrderActionBusyId("");
    }
  }, [lang]);

  const executeAdminStatusToggle = useCallback(async (targetUser) => {
    if (!canManageAdminUsers) return;
    if (!targetUser?.uid && !targetUser?.id) return;
    const targetUid = String(targetUser.uid || targetUser.id || "").trim();
    if (!targetUid) return;
    const nextStatus = String(targetUser.status || "active").trim() === "blocked" ? "active" : "blocked";
    setAdminActionBusyUid(targetUid);
    setAdminUsersError("");
    try {
      await updateUserProfileStatusInFirebase(targetUid, nextStatus);
      setAdminUsers((prev) => prev.map((entry) => {
        const entryUid = String(entry.uid || entry.id || "").trim();
        return entryUid === targetUid
          ? {
              ...entry,
              status: nextStatus,
            }
          : entry;
      }));
    } catch (error) {
      console.error("Failed to update admin user status", error);
      setAdminUsersError(
        lang === "ar"
          ? "تعذر تحديث حالة هذا المستخدم."
          : "Unable to update this user's status."
      );
    } finally {
      setAdminActionBusyUid("");
    }
  }, [canManageAdminUsers, lang]);

  const executeAdminDeleteUser = useCallback(async (targetUser) => {
    if (!canManageAdminUsers) return;
    if (!targetUser?.uid && !targetUser?.id) return;
    const targetUid = String(targetUser.uid || targetUser.id || "").trim();
    if (!targetUid) return;

    setAdminActionBusyUid(targetUid);
    setAdminUsersError("");
    try {
      await deleteAuthUserByAdminInFirebase(targetUid);
      setAdminUsers((prev) => prev.filter((entry) => String(entry.uid || entry.id || "").trim() !== targetUid));
    } catch (error) {
      console.error("Failed to delete admin user", error);
      const errorCode = String(error?.code || error?.message || "").trim();
      setAdminUsersError(
        errorCode.includes("admin-only")
          ? (lang === "ar" ? "هذا الإجراء متاح للأدمن فقط." : "This action is available to admins only.")
          : errorCode.includes("cannot-delete-self")
            ? (lang === "ar" ? "لا يمكن حذف حساب الأدمن الحالي." : "You cannot delete your current admin account.")
            : (lang === "ar" ? "تعذر حذف هذا الحساب الآن." : "Unable to delete this account right now.")
      );
    } finally {
      setAdminActionBusyUid("");
    }
  }, [canManageAdminUsers, lang]);

  const executeAdminToggleRole = useCallback(async (targetUser) => {
    if (!canManageAdminUsers) return;
    if (!targetUser?.uid && !targetUser?.id) return;
    const targetUid = String(targetUser.uid || targetUser.id || "").trim();
    if (!targetUid) return;

    const targetEmail = String(targetUser.email || "").trim().toLowerCase();
    if (targetEmail === PRIMARY_ADMIN_EMAIL) return;

    const currentRole = String(targetUser.role || "user").trim().toLowerCase();
    const nextRole = currentRole === "admin_delegate" ? "user" : "admin_delegate";

    setAdminActionBusyUid(targetUid);
    setAdminUsersError("");
    try {
      await upsertAuthUserProfileInFirebase({
        uid: targetUid,
        email: targetUser.email || "",
        phoneNumber: targetUser.phoneNumber || "",
        displayName: targetUser.displayName || "",
        country: targetUser.country || "",
        nationality: targetUser.nationality || "",
        providerId: targetUser.providerId || "",
        role: nextRole,
        status: String(targetUser.status || "active").trim() || "active",
      });

      setAdminUsers((prev) => prev.map((entry) => {
        const entryUid = String(entry.uid || entry.id || "").trim();
        return entryUid === targetUid
          ? { ...entry, role: nextRole }
          : entry;
      }));
    } catch (error) {
      console.error("Failed to update admin delegate role", error);
      setAdminUsersError(
        lang === "ar"
          ? "تعذر تحديث صلاحية الأدمن لهذا المستخدم الآن."
          : "Unable to update admin access for this user right now."
      );
    } finally {
      setAdminActionBusyUid("");
    }
  }, [canManageAdminUsers, lang]);

  const closeAdminActionConfirm = useCallback(() => {
    setAdminActionConfirm(null);
  }, []);

  const handleAdminStatusToggle = useCallback((targetUser) => {
    if (!canManageAdminUsers) return;
    if (!targetUser?.uid && !targetUser?.id) return;
    const currentStatus = String(targetUser.status || "active").trim();

    // Confirm before blocking only. Unblock remains one-click.
    if (currentStatus !== "blocked") {
      setAdminActionConfirm({
        type: "block",
        targetUser,
      });
      return;
    }

    executeAdminStatusToggle(targetUser);
  }, [canManageAdminUsers, executeAdminStatusToggle]);

  const handleAdminDeleteUser = useCallback((targetUser) => {
    if (!canManageAdminUsers) return;
    if (!targetUser?.uid && !targetUser?.id) return;
    setAdminActionConfirm({
      type: "delete",
      targetUser,
    });
  }, [canManageAdminUsers]);

  const handleAdminConfirmProceed = useCallback(async () => {
    const pendingAction = adminActionConfirm;
    if (!pendingAction) return;
    setAdminActionConfirm(null);

    if (pendingAction.type === "block") {
      await executeAdminStatusToggle(pendingAction.targetUser);
      return;
    }

    if (pendingAction.type === "delete") {
      await executeAdminDeleteUser(pendingAction.targetUser);
    }
  }, [adminActionConfirm, executeAdminDeleteUser, executeAdminStatusToggle]);

  useEffect(() => {
    if (!adminPanelOpen || !isAdminUser) return undefined;
    loadAdminUsers();
    loadAdminOrders();
    loadAdminProviderRequests();
    return undefined;
  }, [adminPanelOpen, isAdminUser, loadAdminOrders, loadAdminProviderRequests, loadAdminUsers]);

  useEffect(() => {
    if (isAdminUser) return undefined;
    setAdminPanelOpen(false);
    return undefined;
  }, [isAdminUser]);

  useEffect(() => {
    try {
      localStorage.setItem("officeOverridesV1", JSON.stringify(officeOverrides || {}));
    } catch {}
  }, [officeOverrides]);

  const getAccountPhoneRecaptcha = useCallback(async () => {
    if (accountPhoneVerifierRef.current?.clear) {
      try {
        accountPhoneVerifierRef.current.clear();
      } catch {}
      accountPhoneVerifierRef.current = null;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const recaptchaId = "account-phone-recaptcha-container";
    const recaptchaContainer = typeof document !== "undefined"
      ? document.getElementById(recaptchaId)
      : null;
    if (!recaptchaContainer) {
      throw new Error("reCAPTCHA container not found");
    }
    recaptchaContainer.innerHTML = "";
    const verifier = createAccountPhoneRecaptcha(recaptchaId, {
      size: "invisible",
      callback: () => {},
    });
    await verifier.render();
    accountPhoneVerifierRef.current = verifier;
    return verifier;
  }, []);

  const getReadableAuthError = useCallback((error) => {
    const directValue = String(
      error?.code
      || error?.message
      || error?.name
      || error?.error
      || error?.details?.message
      || error?.details?.error
      || ""
    ).trim();
    if (directValue) {
      return directValue;
    }
    try {
      const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      return "no-error-code";
    }
    return "no-error-code";
  }, []);

  const handleAccountPhoneSendCode = useCallback(async () => {
    const normalizedPhone = normalizePhoneNumberWithNationality(accountProfilePhone, selectedNationality);
    const currentPhone = String(authPreviewUser?.phoneNumber || "").trim();

    if (!normalizedPhone || normalizedPhone.length < 8) {
      setAccountProfileError(
        lang === "ar"
          ? "اكتب رقم الجوال بشكل صحيح. يمكنك كتابة الرقم المحلي وسنحوّله تلقائيًا حسب جنسيتك، أو إدخاله مباشرة بالمفتاح الدولي."
          : "Enter a valid phone number. You can type the local number and we will convert it based on your nationality, or enter it directly with the country code."
      );
      return;
    }

    if (normalizedPhone === currentPhone) {
      setAccountProfileError(
        lang === "ar"
          ? "رقم الجوال الحالي هو نفسه الرقم المسجل بالفعل."
          : "This phone number is already linked to your account."
      );
      return;
    }

    setAccountPhoneBusy(true);
    setAccountProfileError("");
    setAccountProfileSuccess("");

    try {
      clearAccountPhoneVerifier();
      await new Promise((resolve) => setTimeout(resolve, 200));
      const verifier = await getAccountPhoneRecaptcha();
      if (!verifier) {
        throw new Error("Failed to initialize reCAPTCHA");
      }
      const verificationId = await sendCurrentUserPhoneUpdateCode(normalizedPhone, verifier);
      setAccountPhoneVerificationId(verificationId);
      setAccountPhonePendingNumber(normalizedPhone);
      setAccountPhoneOtp(["", "", "", "", "", ""]);
      setAccountProfileSuccess(
        lang === "ar"
          ? `أرسلنا رمز تحقق إلى ${normalizedPhone}. أدخله لإتمام تحديث رقم الجوال.`
          : `A verification code was sent to ${normalizedPhone}. Enter it to finish updating your phone number.`
      );
    } catch (error) {
      console.error("Account phone verification send failed", error);
      const errorCode = getReadableAuthError(error);
      clearAccountPhoneVerifier();
      if (errorCode.includes("requires-recent-login")) {
        setAccountProfileError(
          lang === "ar"
            ? "تعديل رقم الجوال يحتاج تسجيل دخول حديث. سجّل خروجك ثم ادخل مرة أخرى."
            : "Updating the phone number requires a recent login. Please sign out and sign in again."
        );
      } else if (errorCode.includes("invalid-phone-number")) {
        setAccountProfileError(
          lang === "ar"
            ? "صيغة رقم الجوال غير صحيحة. تأكد من الرقم أو المفتاح الدولي ثم حاول مرة أخرى."
            : "The phone number format is invalid. Check the number or country code and try again."
        );
      } else if (errorCode.includes("too-many-requests") || errorCode.includes("quota-exceeded")) {
        setAccountProfileError(
          lang === "ar"
            ? "تم تجاوز عدد محاولات التحقق مؤقتًا. انتظر قليلًا ثم أعد المحاولة."
            : "Too many verification attempts were made. Please wait a little and try again."
        );
      } else if (errorCode.includes("captcha-check-failed") || errorCode.includes("invalid-app-credential")) {
        setAccountProfileError(
          lang === "ar"
            ? "فشل تحقق الأمان المؤقت. أعد المحاولة الآن، وقد أعدنا تهيئة التحقق تلقائيًا."
            : "The temporary security verification failed. Please try again now; the verifier has been reset automatically."
        );
      } else {
        setAccountProfileError(
          lang === "ar"
            ? `تعذر إرسال رمز تحقق الجوال الآن. حاول مرة أخرى. (${errorCode})`
            : `Unable to send the phone verification code right now. Please try again. (${errorCode})`
        );
      }
    } finally {
      setAccountPhoneBusy(false);
    }
  }, [accountProfilePhone, authPreviewUser?.phoneNumber, clearAccountPhoneVerifier, getAccountPhoneRecaptcha, getReadableAuthError, lang, normalizePhoneNumberWithNationality, selectedNationality]);

  const handleAccountPhoneVerify = useCallback(async () => {
    const otpCode = accountPhoneOtp.join("").trim();
    if (otpCode.length !== 6) {
      setAccountProfileError(
        lang === "ar"
          ? "أدخل رمز التحقق كاملًا المكوّن من 6 أرقام."
          : "Enter the full 6-digit verification code."
      );
      return;
    }

    setAccountPhoneBusy(true);
    setAccountProfileError("");
    setAccountProfileSuccess("");

    try {
      const currentUser = await verifyCurrentUserPhoneUpdateCode(accountPhoneVerificationId, otpCode);
      const nextPhone = accountPhonePendingNumber || currentUser.phoneNumber || "";

      setAuthPreviewUser((prev) => prev ? ({
        ...prev,
        phoneNumber: nextPhone,
      }) : prev);

      await upsertAuthUserProfileInFirebase({
        uid: currentUser.uid,
        email: currentUser.email,
        phoneNumber: nextPhone,
        displayName: currentUser.displayName,
        country: selectedCountry,
        nationality: selectedNationality,
        role: isAdminEmail(currentUser.email || "") ? "admin" : "user",
      });

      setAccountProfilePhone(nextPhone);
      setAccountPhoneVerificationId("");
      setAccountPhonePendingNumber("");
      setAccountPhoneOtp(["", "", "", "", "", ""]);
      setAccountProfileSuccess(
        lang === "ar"
          ? "تم تحديث رقم الجوال بنجاح."
          : "Your phone number has been updated successfully."
      );
    } catch (error) {
      console.error("Account phone verification confirm failed", error);
      const errorCode = getReadableAuthError(error);
      if (errorCode.includes("invalid-verification-code")) {
        setAccountProfileError(
          lang === "ar"
            ? "رمز التحقق غير صحيح. راجع الكود وحاول مرة أخرى."
            : "The verification code is invalid. Please check it and try again."
        );
      } else if (errorCode.includes("requires-recent-login")) {
        setAccountProfileError(
          lang === "ar"
            ? "تأكيد رقم الجوال يحتاج تسجيل دخول حديث. سجّل خروجك ثم ادخل مرة أخرى."
            : "Confirming the phone number requires a recent login. Please sign out and sign in again."
        );
      } else {
        setAccountProfileError(
          lang === "ar"
            ? `تعذر تحديث رقم الجوال الآن. حاول مرة أخرى. (${errorCode})`
            : `Unable to update the phone number right now. Please try again. (${errorCode})`
        );
      }
    } finally {
      setAccountPhoneBusy(false);
    }
  }, [accountPhoneOtp, accountPhonePendingNumber, accountPhoneVerificationId, getReadableAuthError, lang, selectedCountry, selectedNationality]);

  const handleAccountProfileSave = useCallback(async () => {
    if (!authPreviewUser) return;

    const nextName = String(accountProfileName || "").trim();
    const nextEmail = String(accountProfileEmail || "").trim();
    const currentName = String(authPreviewUser.displayName || "").trim();
    const currentEmail = String(authPreviewUser.email || "").trim();
    const nameChanged = !!nextName && nextName !== currentName;
    const emailChanged = !!nextEmail && nextEmail !== currentEmail;

    setAccountProfileBusy(true);
    setAccountProfileError("");
    setAccountProfileSuccess("");

    try {
      const currentUser = getCurrentAuthUser();
      if (!currentUser) {
        throw new Error("auth-user-required");
      }

      if (nameChanged) {
        await updateAuthUserProfile(currentUser, { displayName: nextName });
      }

      if (emailChanged) {
        await updateCurrentUserEmail(nextEmail);
      }

      if (nameChanged) {
        setAuthPreviewUser((prev) => prev ? ({
          ...prev,
          displayName: nextName || prev.displayName || "",
        }) : prev);

        await upsertAuthUserProfileInFirebase({
          uid: currentUser.uid,
          displayName: nextName || currentUser.displayName || "",
          email: currentUser.email || "",
          phoneNumber: currentUser.phoneNumber || "",
          country: selectedCountry,
          nationality: selectedNationality,
          role: isAdminEmail(currentUser.email || "") ? "admin" : "user",
        });
      }

      if (emailChanged) {
        setAccountProfileSuccess(
          lang === "ar"
            ? `تم إرسال رابط تأكيد إلى ${nextEmail}. سيتغير البريد بعد فتح الرابط من الرسالة.`
            : `A confirmation link was sent to ${nextEmail}. Your email will change after you open the link.`
        );
      } else if (nameChanged) {
        setAccountProfileSuccess(
          lang === "ar"
            ? "تم تحديث الاسم بنجاح."
            : "Your name has been updated successfully."
        );
      } else {
        setAccountProfileSuccess(
          lang === "ar"
            ? "لا توجد تغييرات جديدة لحفظها."
            : "There are no new changes to save."
        );
      }
    } catch (error) {
      console.error("Account profile save failed", error);
      const errorCode = String(error?.code || error?.message || "");
      if (errorCode.includes("requires-recent-login")) {
        setAccountProfileError(
          lang === "ar"
            ? "هذه العملية تحتاج تسجيل دخول حديث. سجّل خروجك ثم ادخل مرة أخرى وحاول من جديد."
            : "This action requires a recent login. Please sign out, sign in again, and try once more."
        );
      } else if (errorCode.includes("invalid-email")) {
        setAccountProfileError(
          lang === "ar"
            ? "صيغة البريد الإلكتروني غير صحيحة."
            : "The email address format is invalid."
        );
      } else if (errorCode.includes("email-already-in-use")) {
        setAccountProfileError(
          lang === "ar"
            ? "هذا البريد مستخدم بالفعل في حساب آخر."
            : "This email is already used by another account."
        );
      } else if (errorCode.includes("missing-continue-uri") || errorCode.includes("unauthorized-domain")) {
        setAccountProfileError(
          lang === "ar"
            ? "إعدادات تأكيد تغيير البريد غير مكتملة بعد. راجع Authorized Domains في Firebase."
            : "Email change verification is not fully configured yet. Please review Authorized Domains in Firebase."
        );
      } else {
        setAccountProfileError(
          lang === "ar"
            ? "تعذر تحديث بيانات الحساب الآن. حاول مرة أخرى."
            : "Unable to update the account details right now. Please try again."
        );
      }
    } finally {
      setAccountProfileBusy(false);
    }
  }, [accountProfileEmail, accountProfileName, authPreviewUser, lang, selectedCountry, selectedNationality]);

  const handleAccountPasswordReset = useCallback(async () => {
    setAccountProfileBusy(true);
    setAccountProfileError("");
    setAccountProfileSuccess("");
    try {
      const email = await sendCurrentUserPasswordReset();
      setAccountProfileSuccess(
        lang === "ar"
          ? `تم إرسال رابط تغيير كلمة المرور إلى ${email}.`
          : `A password reset link has been sent to ${email}.`
      );
    } catch (error) {
      console.error("Password reset send failed", error);
      setAccountProfileError(
        lang === "ar"
          ? "لا يوجد بريد إلكتروني مرتبط بهذا الحساب لإرسال رابط تغيير كلمة المرور."
          : "There is no email address linked to this account for password reset."
      );
    } finally {
      setAccountProfileBusy(false);
    }
  }, [lang]);

  const handleAccountDelete = useCallback(async () => {
    setAccountProfileBusy(true);
    setAccountProfileError("");
    setAccountProfileSuccess("");
    try {
      const currentUid = String(authPreviewUser?.uid || "").trim();
      if (!currentUid) {
        throw new Error("auth-user-missing");
      }

      const now = Date.now();
      const graceUntilMs = now + (30 * 24 * 60 * 60 * 1000);

      await upsertAuthUserProfileInFirebase({
        uid: currentUid,
        email: authPreviewUser?.email || "",
        phoneNumber: authPreviewUser?.phoneNumber || "",
        displayName: authPreviewUser?.displayName || "",
        country: selectedCountry,
        nationality: selectedNationality,
        providerId: authPreviewUser?.phoneNumber ? "phone" : (authPreviewUser?.email ? "email" : "unknown"),
        role: isAdminEmail(String(authPreviewUser?.email || "").trim().toLowerCase()) ? "admin" : "user",
        status: "pending_deletion",
        deletionRequestedAt: new Date(now).toISOString(),
        deletionGraceUntil: new Date(graceUntilMs).toISOString(),
      });

      await signOutCurrentUser();
      setAccountPanelOpen(false);
      resetAuthPreviewForm();
      setAuthPreviewMode("login");
      setAuthPreviewOpen(true);
      setModal({
        type: "info",
        title: lang === "ar" ? "تم طلب حذف الحساب" : "Account Deletion Requested",
        msg: lang === "ar"
          ? "تم تسجيل طلب حذف الحساب. يمكنك استرجاعه خلال 30 يوم عبر التواصل مع الدعم."
          : "Your account deletion request has been recorded. You can recover it within 30 days by contacting support.",
      });
    } catch (error) {
      console.error("Account delete failed", error);
      const errorCode = String(error?.code || error?.message || "");
      if (errorCode.includes("requires-recent-login")) {
        setAccountProfileError(
          lang === "ar"
            ? "حذف الحساب يحتاج تسجيل دخول حديث. سجّل خروجك ثم ادخل مرة أخرى وحاول من جديد."
            : "Deleting the account requires a recent login. Please sign out, sign in again, and try once more."
        );
      } else {
        setAccountProfileError(
          lang === "ar"
            ? "تعذر حذف الحساب الآن. حاول مرة أخرى."
            : "Unable to delete the account right now. Please try again."
        );
      }
    } finally {
      setAccountProfileBusy(false);
      setAccountDeleteConfirm(false);
    }
  }, [
    authPreviewUser,
    isAdminEmail,
    lang,
    resetAuthPreviewForm,
    selectedCountry,
    selectedNationality,
  ]);

  const handleAuthPreviewPrimaryAction = useCallback(async () => {
    const identifierValue = String(authPreviewIdentifier || "").trim();
    const passwordValue = String(authPreviewPassword || "");
    const confirmValue = String(authPreviewConfirmPassword || "");
    const fullNameValue = String(authPreviewName || "").trim();
    const identifierType = authPreviewIdentifierType;

    clearAuthPreviewFeedback();

    if (authPreviewMode === "otp") {
      const otpCode = authPreviewOtp.join("").trim();
      if (otpCode.length !== 6) {
        setAuthPreviewError(
          lang === "ar" ? "اكتب رمز التحقق كاملًا المكوّن من 6 أرقام." : "Please enter the full 6-digit verification code."
        );
        return;
      }

      if (authPreviewPhoneFlow?.native && !String(authPreviewPhoneFlow?.verificationId || "").trim()) {
        setAuthPreviewError(
          lang === "ar"
            ? "انتهت جلسة التحقق. اضغط إعادة إرسال الرمز ثم حاول مرة أخرى."
            : "The verification session has expired. Tap resend code and try again."
        );
        return;
      }

      setAuthPreviewBusy(true);
      try {
        const isNativePhoneFlow = !!authPreviewPhoneFlow?.native;
        const verifiedUser = isNativePhoneFlow
          ? await confirmNativePhoneCodeAndSync(authPreviewPhoneFlow?.verificationId, otpCode)
          : await verifyPhoneVerificationCode(authPhoneConfirmationRef.current, otpCode);
        if (authPreviewPhoneFlow?.mode === "signup" && authPreviewPhoneFlow?.fullName && !verifiedUser.displayName) {
          await updateAuthUserProfile(verifiedUser, {
            displayName: authPreviewPhoneFlow.fullName,
          }).catch((error) => {
            console.warn("Phone signup display name sync failed", error);
          });
        }
        setModal({
          type: "info",
          title: lang === "ar" ? "تم التحقق بنجاح" : "Verification successful",
          msg: lang === "ar"
            ? "تم تأكيد رقم الجوال وتسجيل دخولك بنجاح."
            : "Your phone number has been verified and you are now signed in.",
        });
        closeAuthPreview();
      } catch (error) {
        console.error("OTP verification failed", error);
        const errorCode = String(error?.code || error?.message || "").toLowerCase();
        const isNativePhoneFlow = !!authPreviewPhoneFlow?.native;

        if (
          isNativePhoneFlow &&
          (errorCode.includes("invalid-verification-code")
            || errorCode.includes("invalid code")
            || errorCode.includes("invalid credential")
            || errorCode.includes("session-expired")
            || errorCode.includes("code-expired")
            || errorCode.includes("verification-id"))
        ) {
          try {
            const fallbackPhone = String(authPreviewPhoneFlow?.phoneNumber || "").trim();
            if (fallbackPhone) {
              const verifier = await getAuthPreviewRecaptcha();
              const confirmationResult = await sendPhoneVerificationCode(fallbackPhone, verifier);
              authPhoneConfirmationRef.current = confirmationResult;
              setAuthPreviewPhoneFlow((prev) => ({
                ...(prev || {}),
                native: false,
                verificationId: "",
              }));
              setAuthPreviewOtp(["", "", "", "", "", ""]);
              setAuthPreviewSuccess(
                lang === "ar"
                  ? "تم التحويل لمسار تحقق بديل وإرسال رمز جديد. اكتب آخر كود تم استلامه."
                  : "Switched to an alternate verification path and sent a new code. Enter the latest SMS code."
              );
              setTimeout(() => { authPreviewOtpRefs.current[0]?.focus(); }, 100);
              return;
            }
          } catch (fallbackError) {
            console.error("OTP fallback to web flow failed", fallbackError);
          }
        }

        if (errorCode.includes("invalid-verification-code") || errorCode.includes("invalid code") || errorCode.includes("invalid credential")) {
          setAuthPreviewError(
            lang === "ar"
              ? "رمز التحقق غير صحيح. تأكد من الكود المرسل ثم حاول مرة أخرى."
              : "The verification code is incorrect. Check the SMS code and try again."
          );
        } else if (errorCode.includes("session-expired") || errorCode.includes("code-expired") || errorCode.includes("verification-id")) {
          setAuthPreviewError(
            lang === "ar"
              ? "انتهت صلاحية جلسة التحقق. اضغط إعادة إرسال الرمز للحصول على كود جديد."
              : "The verification session has expired. Tap resend code to get a new code."
          );
        } else if (errorCode.includes("too-many-requests") || errorCode.includes("quota-exceeded")) {
          setAuthPreviewError(
            lang === "ar"
              ? "تم تجاوز عدد المحاولات مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى."
              : "Too many attempts were made. Please wait a little and try again."
          );
        } else {
          setAuthPreviewError(
            lang === "ar"
              ? "تعذر التحقق من الرمز الآن. حاول مرة أخرى أو أعد إرسال الكود."
              : "Unable to verify the code right now. Try again or resend the code."
          );
        }
      } finally {
        setAuthPreviewBusy(false);
      }
      return;
    }

    if (!identifierValue) {
      setAuthPreviewError(
        lang === "ar"
          ? "اكتب البريد الإلكتروني أولًا."
          : "Please enter your email address first."
      );
      return;
    }

    if (!identifierValue.includes("@")) {
      setAuthPreviewError(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح."
          : "Please enter a valid email address."
      );
      return;
    }

    if (authPreviewMode === "signup" && !fullNameValue) {
      setAuthPreviewError(
        lang === "ar" ? "اكتب الاسم الكامل أولًا." : "Please enter your full name first."
      );
      return;
    }

    if (identifierType === "email" && authPreviewMode !== "forgot" && !passwordValue) {
      setAuthPreviewError(
        lang === "ar" ? "اكتب كلمة المرور أولًا." : "Please enter your password first."
      );
      return;
    }

    if (authPreviewMode === "signup" && identifierType === "email" && passwordValue !== confirmValue) {
      setAuthPreviewError(
        lang === "ar"
          ? "تأكيد كلمة المرور غير مطابق."
          : "Password confirmation does not match."
      );
      return;
    }

    setAuthPreviewBusy(true);
    try {
      if (identifierType === "email") {
        if (authPreviewMode === "login") {
          await signInWithEmailPassword(identifierValue, passwordValue);
          setModal({
            type: "info",
            title: lang === "ar" ? "تم تسجيل الدخول" : "Login successful",
            msg: lang === "ar"
              ? "تم تسجيل دخولك بنجاح."
              : "You have signed in successfully.",
          });
          closeAuthPreview();
          return;
        }

        if (authPreviewMode === "signup") {
          await signUpWithEmailPassword({
            email: identifierValue,
            password: passwordValue,
            fullName: fullNameValue,
          });
          setModal({
            type: "info",
            title: lang === "ar" ? "تم إنشاء الحساب" : "Account created",
            msg: lang === "ar"
              ? "تم إنشاء حسابك بنجاح، ويمكنك الآن استخدام التطبيق."
              : "Your account has been created successfully and is ready to use.",
          });
          closeAuthPreview();
          return;
        }

        await sendResetEmail(identifierValue);
        setAuthPreviewSuccess(
          lang === "ar"
            ? "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني."
            : "A password reset link has been sent to your email."
        );
        return;
      }

      const normalizedPhone = normalizePhoneNumber(identifierValue);
      if (!normalizedPhone || normalizedPhone.length < 8) {
        setAuthPreviewError(
          lang === "ar"
            ? "اكتب رقم الجوال بالمفتاح الدولي بشكل صحيح."
            : "Please enter a valid phone number with the country code."
        );
        return;
      }

      if (Capacitor.getPlatform() === "android") {
        const result = await startNativePhoneSignIn(normalizedPhone, { timeout: 60 });
        if (result?.autoVerified) {
          await syncNativeAuthToWebSdk();
          setModal({
            type: "info",
            title: lang === "ar" ? "تم تسجيل الدخول" : "Login successful",
            msg: lang === "ar"
              ? "تم تأكيد رقم الجوال وتسجيل دخولك بنجاح."
              : "Your phone number has been verified and you are now signed in.",
          });
          closeAuthPreview();
          return;
        }

        openAuthPreviewOtp({
          phoneFlow: {
            native: true,
            verificationId: result?.verificationId || "",
            mode: authPreviewMode,
            phoneNumber: normalizedPhone,
            fullName: fullNameValue,
          },
          successMessage:
            lang === "ar"
              ? "تم إرسال رمز التحقق. اكتب الكود المرسل لإكمال المتابعة."
              : "A verification code has been sent. Enter it to continue.",
        });
        return;
      }

      const verifier = await getAuthPreviewRecaptcha();
      const confirmationResult = await sendPhoneVerificationCode(normalizedPhone, verifier);
      authPhoneConfirmationRef.current = confirmationResult;

      openAuthPreviewOtp({
        phoneFlow: {
          mode: authPreviewMode,
          phoneNumber: normalizedPhone,
          fullName: fullNameValue,
        },
        successMessage:
          lang === "ar"
            ? "تم إرسال رمز التحقق. اكتب الكود المرسل لإكمال المتابعة."
            : "A verification code has been sent. Enter it to continue.",
      });
    } catch (error) {
      console.error("Auth preview action failed", error);
      const errorCode = String(error?.code || error?.message || "");
      const errorMsg = String(error?.message || "").toLowerCase();
      if (
        errorCode.toLowerCase().includes("blocked all requests")
        || errorMsg.includes("blocked all requests")
        || errorMsg.includes("blocked all requests for this device")
        || errorCode.toLowerCase().includes("device-request-limit-exceeded")
      ) {
        setAuthPreviewError(
          lang === "ar"
            ? "تم حظر التحقق برقم الهاتف مؤقتًا على هذا الجهاز. يمكنك المحاولة برقم الهاتف مرة أخرى بعد 24 ساعة، ويمكنك تسجيل الدخول الآن باستخدام البريد الإلكتروني."
            : "Phone verification is temporarily blocked on this device. You can try phone sign-in again after 24 hours, and you can sign in now using your email."
        );
      } else if (errorCode.includes("too-many-requests") || errorMsg.includes("too many")) {
        setAuthPreviewError(
          lang === "ar"
            ? "تم إرسال عدد كبير من المحاولات. انتظر قليلًا ثم حاول مرة أخرى."
            : "Too many attempts were made. Please wait a little and try again."
        );
      } else if (errorCode.includes("captcha-check-failed") || errorCode.includes("invalid-app-credential") || errorMsg.includes("captcha") || errorMsg.includes("recaptcha")) {
        setAuthPreviewError(
          lang === "ar"
            ? "فشل تحقق الأمان. حدّث الصفحة وحاول مرة أخرى من نافذة خاصة."
            : "Security verification failed. Refresh the page and retry from an incognito window."
        );
      } else if (errorCode.includes("operation-not-allowed") || errorMsg.includes("not allowed")) {
        setAuthPreviewError(
          lang === "ar"
            ? "تسجيل الدخول برقم الهاتف غير مفعّل في Firebase Authentication."
            : "Phone sign-in is not enabled in Firebase Authentication."
        );
      } else if (errorCode.includes("unauthorized-domain") || errorCode.includes("app-not-authorized") || errorMsg.includes("unauthorized") || errorMsg.includes("sha")) {
        setAuthPreviewError(
          lang === "ar"
            ? "التطبيق غير مصرح به. تأكد من إضافة بصمة SHA في إعدادات Firebase وتحديث google-services.json."
            : "App not authorized. Make sure your SHA fingerprint is registered in Firebase and google-services.json is updated."
        );
      } else if (errorCode.includes("quota-exceeded") || errorMsg.includes("quota")) {
        setAuthPreviewError(
          lang === "ar"
            ? "تم استهلاك حد الرسائل اليومي. جرّب لاحقًا أو استخدم رقم اختبار."
            : "SMS quota has been exceeded. Try again later or use a test number."
        );
      } else if (errorCode.includes("invalid-credential") || errorCode.includes("wrong-password") || errorCode.includes("user-not-found")) {
        setAuthPreviewError(
          lang === "ar"
            ? "بيانات الدخول غير صحيحة."
            : "The login credentials are not correct."
        );
      } else if (errorCode.includes("account-blocked")) {
        setAuthPreviewError(
          lang === "ar"
            ? "هذا الحساب محظور حاليًا بواسطة الإدارة."
            : "This account is currently blocked by the admin."
        );
      } else if (errorCode.includes("email-already-in-use")) {
        setAuthPreviewError(
          lang === "ar"
            ? "هذا البريد مستخدم بالفعل. جرّب تسجيل الدخول بدلًا من ذلك."
            : "This email is already in use. Try signing in instead."
        );
      } else {
        const displayDetail = String(error?.message || errorCode || "unknown");
        setAuthPreviewError(
          lang === "ar"
            ? `تعذر إكمال العملية الآن. (${displayDetail})`
            : `Unable to complete the request right now. (${displayDetail})`
        );
      }
    } finally {
      setAuthPreviewBusy(false);
    }
  }, [
    authPreviewConfirmPassword,
    authPreviewIdentifier,
    authPreviewIdentifierType,
    authPreviewMode,
    authPreviewName,
    authPreviewOtp,
    authPreviewPhoneFlow,
    authPreviewPassword,
    clearAuthPreviewFeedback,
    closeAuthPreview,
    getAuthPreviewRecaptcha,
    lang,
    normalizePhoneNumber,
    authPreviewFallbackDialCode,
    composeE164,
    openAuthPreviewOtp,
  ]);

  const isDeviceRequestLimitError = useCallback(
    (error) => String(error?.code || error?.details?.error || "") === "device-request-limit-exceeded",
    []
  );

  const showDeviceRequestLimitNotice = useCallback((details = null) => {
    const windowDays = Number(details?.windowDays) || 30;
    setModal({
      type: "requestLimit",
      title: lang === "ar" ? "تم الوصول إلى حد الطلبات" : "Request limit reached",
      msg: getRequestLimitMessage(windowDays, lang === "ar"),
    });
  }, [lang]);

  const generateCvBuilderSerial = () => {
    const prefix = "CV";
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
  };

  const createCvBuilderOrderSnapshot = () => {
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
  };

  const ensureCvBuilderOrderForCurrentRequest = () => {
    if (selectedCvBuilderOrder?.id) {
      return selectedCvBuilderOrder;
    }
    const nextOrder = createCvBuilderOrderSnapshot();
    setCvBuilderOrders((prev) => [nextOrder, ...prev]);
    setSelectedCvBuilderOrder(nextOrder);
    return nextOrder;
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

  const promptCvBuilderGuestAuth = useCallback(() => {
    setCvBuilderOrderSyncError(
      lang === "ar"
        ? "سجّل الدخول أو أنشئ حسابًا أولًا لإكمال حفظ الطلب وتفعيل التصدير."
        : "Please sign in or create an account first to complete request saving and enable export."
    );
    setShowExitConfirm(false);
    setAuthPreviewMode("login");
    setAuthPreviewOpen(true);
    setAuthPreviewError("");
    setAuthPreviewSuccess("");
  }, [lang]);

  const openCvBuilderNewRequest = () => {
    // Admin bypasses all order limits
    if (!isAdminUser) {
      const weeklyCount = getRecentOrderCountWithinDays(cvBuilderOrders, 7);
      const monthlyCount = getRecentOrderCountWithinDays(cvBuilderOrders, 30);
      if (weeklyCount >= 2) {
        setModal({
          type: "requestLimit",
          title: lang === "ar" ? "تم الوصول إلى حد الطلبات الأسبوعي" : "Weekly request limit reached",
          msg: getRequestLimitMessage(7, lang === "ar"),
        });
        return;
      }
      if (monthlyCount >= 8) {
        setModal({
          type: "requestLimit",
          title: lang === "ar" ? "تم الوصول إلى حد الطلبات الشهري" : "Monthly request limit reached",
          msg: getRequestLimitMessage(30, lang === "ar"),
        });
        return;
      }
    }
    if (isGuestUser) {
      setModal({
        type: "cvGuestBuilderNotice",
        title: lang === "ar" ? "تنبيه" : "Notice",
        msg: lang === "ar"
          ? "يمكنك إدخال البيانات كضيف، لكن قبل التصدير أو إرسال الطلب يجب تسجيل الدخول أو إنشاء حساب."
          : "You can enter data as a guest, but before export or request submission you must sign in or create an account.",
      });
      return;
    }
    startCvBuilderDraftFlow();
  };

  const cancelCurrentCvBuilderRequest = () => {
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
  };

  const openCvBuilderPreviousOrders = () => {
    setSelectedCvBuilderOrder(null);
    setCvBuilderOrderDetailsBackScreen("previousOrders");
    setCvBuilderReviewError("");
    setCvBuilderReviewEditMode(false);
    setCvBuilderOrderSyncError("");
    setCvBuilderScreen("previousOrders");
  };

  const updateCvBuilderOrderReview = (orderId, reviewMeta) => {
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
  };

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

  const refreshCvOrdersFromFirebase = useCallback(async () => {
    const orders = await fetchServiceOrdersFromFirebase();
    const cvOrders = (orders || []).filter(isCvOrderRecord);
    setCvRealtimeOrders(cvOrders);
    setCvRealtimeOrdersFetched(true);
    if (isAdminUser) {
      setCvAdminAllOrders(cvOrders);
    } else {
      setCvAdminAllOrders([]);
    }
    return cvOrders;
  }, [isAdminUser]);

  const ensureCvBuilderOrderForCurrentRequestAsync = useCallback(async () => {
    const ensuredOrder = ensureCvBuilderOrderForCurrentRequest();
    const latestCvSnapshot = JSON.parse(JSON.stringify(cvData));
    let nextOrder = ensuredOrder;

    if (nextOrder?.id) {
      nextOrder = {
        ...nextOrder,
        data: latestCvSnapshot,
      };
      mergeCvBuilderOrder(nextOrder.id, {
        data: latestCvSnapshot,
      });
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
      nextOrder = {
        ...nextOrder,
        firebaseId,
        data: latestCvSnapshot,
      };
      mergeCvBuilderOrder(nextOrder.id, {
        firebaseId,
        data: latestCvSnapshot,
      });
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
      }).catch((error) => {
        console.error("CV builder order update failed", error);
      });
    }

    if (!nextOrder?.statsCounted) {
      const nextStats = await syncCvPackageStatsInFirebase("builder", { incrementRequest: true });
      nextOrder = {
        ...nextOrder,
        statsCounted: true,
      };
      mergeCvBuilderOrder(nextOrder.id, { statsCounted: true });
      applyCvPackageStatsUpdate("builder", nextStats);
      window.dispatchEvent(
        new CustomEvent("cv-package-stats-updated", {
          detail: { packageKey: "builder", stats: nextStats },
        })
      );
      if (nextOrder?.firebaseId) {
        await updateOrderInFirebase(nextOrder.firebaseId, {
          statsCounted: true,
        }).catch((error) => {
          console.error("CV builder stats flag update failed", error);
        });
      }
    }

    return nextOrder;
  }, [
    applyCvPackageStatsUpdate,
    cvData,
    lang,
    mergeCvBuilderOrder,
    selectedCountry,
  ]);

  const getCvBuilderEmailStatusLabel = useCallback((status) => {
    if (status === "sending") {
      return lang === "ar" ? "جاري إرسال الإيميل..." : "Sending email...";
    }
    if (status === "sent") {
      return lang === "ar" ? "تم إرسال الإيميل" : "Email sent";
    }
    if (status === "failed") {
      return lang === "ar" ? "فشل إرسال الإيميل" : "Email failed";
    }
    return lang === "ar" ? "لم يُرسل بعد" : "Not sent yet";
  }, [lang]);

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
      }).catch((error) => {
        console.error("CV builder email sending flag update failed", error);
      });
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
      }).catch((error) => {
        console.error("CV builder email delivery status update failed", error);
      });
    }

    return { ok: nextStatus === "sent", status: nextStatus };
  }, [cvData, lang, mergeCvBuilderOrder, selectedCountry]);

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

    if (targetStep === 4) {
      if (isGuestUser) {
        setCvBuilderOrderSyncError(
          lang === "ar"
            ? "قبل التصدير أو إرسال الطلب، يجب تسجيل الدخول أو إنشاء حساب."
            : "Before export or request submission, you must sign in or create an account."
        );
        promptCvBuilderGuestAuth();
      } else if (!selectedCvBuilderOrder?.id) {
        // Pre-create order snapshot synchronously to lock in the order number
        // before the async useEffect fires, preventing race-condition duplicates
        const nextOrder = createCvBuilderOrderSnapshot();
        setCvBuilderOrders((prev) => [nextOrder, ...prev]);
        setSelectedCvBuilderOrder(nextOrder);
      }
    }
  }, [
    createCvBuilderOrderSnapshot,
    cvStep,
    getCvStepValidationMessage,
    isCvStepComplete,
    isGuestUser,
    lang,
    promptCvBuilderGuestAuth,
    selectedCvBuilderOrder?.id,
  ]);

  useEffect(() => {
    if (cvMode !== "builder" || cvBuilderScreen !== "form" || cvStep !== 4) return;
    if (isGuestUser || cvBuilderOrderSyncBusy) return;

    const emailStatus = String(selectedCvBuilderOrder?.emailDeliveryStatus || "").toLowerCase();
    if (selectedCvBuilderOrder?.firebaseId && (emailStatus === "sending" || emailStatus === "sent")) return;

    let cancelled = false;

    (async () => {
      setCvBuilderOrderSyncBusy(true);
      try {
        const ensuredOrder = await ensureCvBuilderOrderForCurrentRequestAsync();
        if (cancelled) return;
        await dispatchCvBuilderOrderEmail(ensuredOrder);
      } catch (error) {
        if (cancelled) return;
        console.error("CV builder auto provisioning failed", error);
        setCvBuilderOrderSyncError(
          lang === "ar"
            ? "تعذر حفظ الطلب أو إرسال الإيميل الآن. يمكنك إعادة المحاولة من نفس الشاشة."
            : "Unable to save the request or send the email right now. You can retry from the same screen."
        );
      } finally {
        if (!cancelled) setCvBuilderOrderSyncBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    cvBuilderOrderSyncBusy,
    cvBuilderScreen,
    cvMode,
    cvStep,
    dispatchCvBuilderOrderEmail,
    ensureCvBuilderOrderForCurrentRequestAsync,
    isGuestUser,
    lang,
    selectedCvBuilderOrder?.emailDeliveryStatus,
    selectedCvBuilderOrder?.firebaseId,
  ]);

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

  const saveNativeFileAndShare = async ({ blob, fileName, mimeType, title }) => {
    const base64Data = await blobToBase64(blob);
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
      recursive: true,
    });
    const fileUri = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Cache,
    });
    await Share.share({
      title,
      dialogTitle: title,
      url: fileUri.uri,
    });
    return fileUri.uri;
  };

  const triggerFileDownload = async (blob, fileName, mimeType, previewWindow = null) => {
    const fileBlob = blob instanceof Blob ? blob : new Blob([blob], { type: mimeType });

    if (isNativePlatform) {
      return saveNativeFileAndShare({
        blob: fileBlob,
        fileName,
        mimeType,
        title: fileName,
      });
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

    try {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.location.href = blobUrl;
      }
    } catch {}

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 15000);
  };

  const triggerPdfDownload = async (pdfInstance, fileName, previewWindow = null) => {
    const blob = pdfInstance.output("blob");
    return triggerFileDownload(blob, fileName, "application/pdf", previewWindow);
  };

  const openCvExportLangModal = (fileType) => {
    if (isGuestUser) {
      setCvBuilderOrderSyncError(
        lang === "ar"
          ? "قبل التصدير، يجب تسجيل الدخول أو إنشاء حساب."
          : "Before export, you must sign in or create an account."
      );
      promptCvBuilderGuestAuth();
      return;
    }

    if (!selectedCvBuilderOrder?.firebaseId || cvBuilderOrderSyncBusy) {
      setCvBuilderOrderSyncError(
        lang === "ar"
          ? "انتظر اكتمال حفظ الطلب وإرسال الإيميل أولًا ثم جرّب التصدير."
          : "Please wait until request save and email dispatch are completed, then try exporting."
      );
      return;
    }

    setModal({
      type: "cvExportLang",
      title: lang === "ar" ? `اختر لغة تصدير ${fileType === "pdf" ? "PDF" : "Word"}` : `Choose ${fileType === "pdf" ? "PDF" : "Word"} export language`,
      fileType,
    });
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
      mount.style.position = "fixed";
      mount.style.left = "-10000px";
      mount.style.top = "0";
      mount.style.zIndex = "-1";
      mount.style.pointerEvents = "none";
      mount.innerHTML = buildCvPdfDocument(cvData, exportLang);
      document.body.appendChild(mount);

      await new Promise((resolve) => setTimeout(resolve, 120));

      const pages = Array.from(mount.querySelectorAll(".cv-pdf-page-node"));
      if (!pages.length) throw new Error("PDF pages were not rendered.");

      const pdf = new JsPdfCtor({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let index = 0; index < pages.length; index += 1) {
        const canvas = await html2canvas(pages[index], {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
        });
        const imageData = canvas.toDataURL("image/jpeg", 0.96);
        if (index > 0) pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      return pdf.output("blob");
    } finally {
      if (mount && mount.parentNode) mount.parentNode.removeChild(mount);
    }
  };

  const handleCvWordDownload = async (exportLang = "en") => {
    if (isGuestUser) {
      promptCvBuilderGuestAuth();
      return;
    }

    if (!selectedCvBuilderOrder?.firebaseId || cvBuilderOrderSyncBusy) {
      setCvBuilderOrderSyncError(
        lang === "ar"
          ? "انتظر اكتمال حفظ الطلب وإرسال الإيميل أولًا ثم جرّب التصدير."
          : "Please wait until request save and email dispatch are completed, then try exporting."
      );
      return;
    }

    const hasCoreData = cvData.fullName.trim() && cvData.jobTitle.trim();
    if (!hasCoreData) {
      alert(lang === "ar"
        ? "أدخل الاسم والمسمى الوظيفي أولاً حتى يتم إنشاء ملف Word بشكل صحيح."
        : "Please enter your name and job title first to generate the Word file correctly.");
      return;
    }

    const fileNameBase = (cvData.fullName || "professional-cv")
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .toLowerCase() || "professional-cv";

    const wordDocument = buildCvWordDocument(cvData, exportLang);
    const wordBlob = new Blob(["\ufeff", wordDocument], { type: "application/msword" });
    try {
      await triggerFileDownload(wordBlob, `${fileNameBase}.doc`, "application/msword");
    } catch (error) {
      console.error("CV Word export failed:", error);
      alert(lang === "ar"
        ? "حدثت مشكلة أثناء إنشاء ملف Word. جرّب مرة أخرى."
        : "There was a problem generating the Word file. Please try again.");
    }
  };

  const openCvServiceEmailConfirm = async () => {
    if (isGuestUser) {
      setCvBuilderOrderSyncError(
        lang === "ar"
          ? "قبل إرسال الطلب، يجب تسجيل الدخول أو إنشاء حساب."
          : "Before submitting the request, you must sign in or create an account."
      );
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
    setCvBuilderOrderSyncBusy(true);

    let ensuredOrder = null;
    try {
      ensuredOrder = await withTimeout(
        ensureCvBuilderOrderForCurrentRequestAsync(),
        35000,
        "CV save"
      );
    } catch (error) {
      console.error("CV builder request save failed", error);
      setCvBuilderOrderSyncBusy(false);
      if (isDeviceRequestLimitError(error)) {
        showDeviceRequestLimitNotice(error?.details);
        return;
      }
      setCvBuilderOrderSyncError(
        lang === "ar"
          ? "تعذر حفظ الطلب الآن. تحقق من الاتصال وأعد المحاولة."
          : "Unable to save the request right now. Check your connection and try again."
      );
      return;
    } finally {
      setCvBuilderOrderSyncBusy(false);
    }

    // Open email client so user can send data directly
    const { subject, body } = buildCvSubmissionEmail(cvData, {
      orderNumber: ensuredOrder?.orderNumber || "",
      serial: ensuredOrder?.serial || "",
    });
    window.open(
      `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );

    // Background: send via Firebase function (non-blocking)
    dispatchCvBuilderOrderEmail(ensuredOrder, { force: true }).catch(() => {});

    setModal({
      type: "success",
      title: lang === "ar" ? "تم حفظ الطلب بنجاح" : "Request saved successfully",
      msg: lang === "ar"
        ? `تم إنشاء الطلب رقم ${ensuredOrder?.orderNumber || "-"} وحفظه. تأكد من إرسال الإيميل الذي فُتح لك.`
        : `Request ${ensuredOrder?.orderNumber || "-"} was created and saved. Please send the email that opened for you.`,
    });
  };

  const sendCvDataByEmail = (customSubject, customBody, customOrderMeta = null) => {
    const { subject, body } = customSubject && customBody
      ? { subject: customSubject, body: customBody }
      : buildCvSubmissionEmail(cvData, customOrderMeta || {
          orderNumber: selectedCvBuilderOrder?.orderNumber || "",
          serial: selectedCvBuilderOrder?.serial || "",
        });
    setModal(null);
    window.open(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const submitCvBuilderReview = async () => {
    if (!cvBuilderRating || cvBuilderReviewSubmitting || cvBuilderReviewLocked) {
      if (!cvBuilderRating) {
        setCvBuilderReviewError(
          lang === "ar" ? "اختر عدد النجوم أولًا." : "Please choose a star rating first."
        );
      } else if (cvBuilderReviewLocked) {
        setCvBuilderReviewError(
          lang === "ar"
            ? `يمكن تعديل التقييم بعد مرور 30 يوم من عمل السيرة الذاتية. المتبقي ${cvBuilderReviewDaysRemaining} يوم.`
            : `You can edit the review 30 days after creating the CV. ${cvBuilderReviewDaysRemaining} day(s) remaining.`
        );
      }
      return;
    }
    setCvBuilderReviewSubmitting(true);
    setCvBuilderReviewError("");
    try {
      const previousRating = currentCvBuilderReviewMeta?.saved
        ? (Number(currentCvBuilderReviewMeta?.rating) || null)
        : null;
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
      const nextStats = await syncCvPackageStatsInFirebase("builder", {
        rating: cvBuilderRating,
        previousRating,
      });
      const savedAt = new Date().toISOString();
      const nextReviewMeta = {
        saved: true,
        rating: cvBuilderRating,
        text: cvBuilderReviewText.trim(),
        savedAt,
      };
      if (ensuredOrder?.id) {
        updateCvBuilderOrderReview(ensuredOrder.id, nextReviewMeta);
      }
      if (ensuredOrder?.firebaseId) {
        await updateOrderInFirebase(ensuredOrder.firebaseId, {
          reviewed: true,
          rating: cvBuilderRating,
          reviewText: cvBuilderReviewText.trim(),
          reviewSavedAt: savedAt,
          reviewMeta: nextReviewMeta,
        }).catch((error) => {
          console.error("CV builder Firebase review update failed", error);
        });
      }
      applyCvPackageStatsUpdate("builder", nextStats);
      window.dispatchEvent(
        new CustomEvent("cv-package-stats-updated", {
          detail: { packageKey: "builder", stats: nextStats },
        })
      );
      setCvBuilderReviewSavedAt(savedAt);
      setCvBuilderReviewSaved(true);
      setCvBuilderReviewEditMode(false);
      setSelectedCvBuilderOrder(null);
      setCvBuilderScreen("previousOrders");
    } catch (error) {
      console.error("CV builder review save failed", error);
      if (isDeviceRequestLimitError(error)) {
        showDeviceRequestLimitNotice(error?.details);
        return;
      }
      setCvBuilderReviewError(
        lang === "ar"
          ? "تعذر حفظ تقييم الخدمة الآن. حاول مرة أخرى."
          : "Unable to save the service review right now. Please try again."
      );
    } finally {
      setCvBuilderReviewSubmitting(false);
    }
  };

  const handleCvPdfDownload = async (exportLang = "en") => {
    if (cvPdfExporting) return;

    if (isGuestUser) {
      promptCvBuilderGuestAuth();
      return;
    }

    if (!selectedCvBuilderOrder?.firebaseId || cvBuilderOrderSyncBusy) {
      setCvBuilderOrderSyncError(
        lang === "ar"
          ? "انتظر اكتمال حفظ الطلب وإرسال الإيميل أولًا ثم جرّب التصدير."
          : "Please wait until request save and email dispatch are completed, then try exporting."
      );
      return;
    }

    const hasCoreData = cvData.fullName.trim() && cvData.jobTitle.trim();
    if (!hasCoreData) {
      alert(lang === "ar"
        ? "أدخل الاسم والمسمى الوظيفي أولاً حتى يتم إنشاء ملف PDF بشكل صحيح."
        : "Please enter your name and job title first to generate the PDF correctly.");
      return;
    }

    setCvPdfExporting(true);
    const previewWindow = !isNativePlatform ? window.open("", "_blank") : null;
    if (previewWindow && !previewWindow.closed) {
      previewWindow.document.write(`
        <html>
          <head><title>Preparing PDF</title></head>
          <body style="font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f8fafc; color:#1e293b;">
            <div style="text-align:center;">
              <div style="font-size:18px; font-weight:700; margin-bottom:12px;">${lang === "ar" ? "جاري تجهيز ملف PDF..." : "Preparing PDF..."}</div>
              <div style="font-size:13px; opacity:0.75;">${lang === "ar" ? "سيتم فتح الملف هنا فورًا" : "The file will open here shortly"}</div>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }

    try {
      const [jsPdfModule] = await Promise.all([
        import("jspdf"),
      ]);
      if (!jsPdfModule) throw new Error("jsPDF module is unavailable.");
      const pdfBlob = await createCvPdfBlob(exportLang);

      const fileNameBase = (cvData.fullName || "professional-cv")
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .toLowerCase() || "professional-cv";

      await triggerFileDownload(pdfBlob, `${fileNameBase}.pdf`, "application/pdf", previewWindow);
    } catch (error) {
      console.error("CV PDF export failed:", error);
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      alert(lang === "ar"
        ? "حدثت مشكلة أثناء إنشاء ملف PDF. جرّب مرة أخرى."
        : "There was a problem generating the PDF. Please try again.");
    } finally {
      setCvPdfExporting(false);
    }
  };

  // Export PDF/Word for a specific previous order using its stored data
  const exportOrderDataToPdf = async (order, exportLang = "en") => {
    if (cvPdfExporting) return;
    const orderCvData = order?.data;
    if (!orderCvData?.fullName || !orderCvData?.jobTitle) {
      alert(lang === "ar" ? "بيانات هذا الطلب غير مكتملة للتصدير." : "This order's data is incomplete for export.");
      return;
    }
    setCvPdfExporting(true);
    const previewWindow = !isNativePlatform ? window.open("", "_blank") : null;
    if (previewWindow && !previewWindow.closed) {
      previewWindow.document.write(`<html><head><title>Preparing PDF</title></head><body style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;color:#1e293b;"><div style="text-align:center;"><div style="font-size:18px;font-weight:700;margin-bottom:12px;">${lang === "ar" ? "جاري تجهيز ملف PDF..." : "Preparing PDF..."}</div></div></body></html>`);
      previewWindow.document.close();
    }
    let mount = null;
    try {
      const [{ default: html2canvas }, jsPdfModule] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const JsPdfCtor = jsPdfModule.jsPDF || jsPdfModule.default?.jsPDF || jsPdfModule.default;
      if (!JsPdfCtor) throw new Error("jsPDF constructor is unavailable.");
      mount = document.createElement("div");
      mount.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;";
      mount.innerHTML = buildCvPdfDocument(orderCvData, exportLang);
      document.body.appendChild(mount);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const pages = Array.from(mount.querySelectorAll(".cv-pdf-page-node"));
      if (!pages.length) throw new Error("PDF pages were not rendered.");
      const pdf = new JsPdfCtor({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, pdfWidth, pdfHeight);
      }
      const pdfBlob = pdf.output("blob");
      const fileNameBase = (orderCvData.fullName || "professional-cv").trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").toLowerCase() || "professional-cv";
      await triggerFileDownload(pdfBlob, `${fileNameBase}.pdf`, "application/pdf", previewWindow);
    } catch (error) {
      console.error("CV PDF export (order) failed:", error);
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      alert(lang === "ar" ? "حدثت مشكلة أثناء إنشاء ملف PDF. جرّب مرة أخرى." : "There was a problem generating the PDF. Please try again.");
    } finally {
      if (mount && mount.parentNode) mount.parentNode.removeChild(mount);
      setCvPdfExporting(false);
    }
  };

  const exportOrderDataToWord = async (order, exportLang = "en") => {
    const orderCvData = order?.data;
    if (!orderCvData?.fullName || !orderCvData?.jobTitle) {
      alert(lang === "ar" ? "بيانات هذا الطلب غير مكتملة للتصدير." : "This order's data is incomplete for export.");
      return;
    }
    const fileNameBase = (orderCvData.fullName || "professional-cv").trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").toLowerCase() || "professional-cv";
    const wordDocument = buildCvWordDocument(orderCvData, exportLang);
    const wordBlob = new Blob(["\ufeff", wordDocument], { type: "application/msword" });
    try {
      await triggerFileDownload(wordBlob, `${fileNameBase}.doc`, "application/msword");
    } catch (error) {
      console.error("CV Word export (order) failed:", error);
      alert(lang === "ar" ? "حدثت مشكلة أثناء إنشاء ملف Word. جرّب مرة أخرى." : "There was a problem generating the Word file. Please try again.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchOfficeReviewsFromFirebase()
      .then((items) => {
        if (!isMounted) return;
        const nextState = buildOfficeReviewState(items, lang);
        setOfficeRatings(nextState.ratings);
        setReviews(nextState.reviews);
      })
      .catch((error) => {
        console.error("Office reviews fetch failed", error);
      });

    return () => {
      isMounted = false;
    };
  }, [lang]);

  useEffect(() => {
    let isMounted = true;
    fetchCvPackageStatsFromFirebase()
      .then((items) => {
        if (!isMounted) return;
        setCvPackageStats({
          builder: items?.builder || createEmptyCvPackageStats(),
          premium: items?.premium || createEmptyCvPackageStats(),
          elite: items?.elite || createEmptyCvPackageStats(),
        });
      })
      .catch((error) => {
        console.error("CV package stats fetch failed", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleCvPackageStatsUpdated = (event) => {
      const payload = event?.detail;
      if (!payload?.packageKey || !payload?.stats) return;
      applyCvPackageStatsUpdate(payload.packageKey, payload.stats);
      refreshCvOrdersFromFirebase().catch((error) => {
        console.error("CV orders refresh after stats event failed", error);
      });
    };

    window.addEventListener("cv-package-stats-updated", handleCvPackageStatsUpdated);
    return () => {
      window.removeEventListener("cv-package-stats-updated", handleCvPackageStatsUpdated);
    };
  }, [applyCvPackageStatsUpdate, refreshCvOrdersFromFirebase]);

  useEffect(() => {
    let isMounted = true;

    const loadCvOrders = async () => {
      try {
        const orders = await fetchServiceOrdersFromFirebase();
        if (!isMounted) return;
        const cvOrders = (orders || []).filter(isCvOrderRecord);
        setCvRealtimeOrders(cvOrders);
        setCvRealtimeOrdersFetched(true);
        if (isAdminUser) {
          setCvAdminAllOrders(cvOrders);
        } else {
          setCvAdminAllOrders([]);
        }
      } catch (error) {
        if (!isMounted) return;
        setCvRealtimeOrdersFetched(false);
        if (!isAdminUser) {
          setCvAdminAllOrders([]);
        }
        console.error("CV orders fetch failed", error);
      }
    };

    const handleVisibilityRefresh = () => {
      if (document.visibilityState !== "visible") return;
      loadCvOrders();
    };

    loadCvOrders();
    window.addEventListener("focus", loadCvOrders);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", loadCvOrders);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [isAdminUser]);

  // 3. تعريف المتغيرات المشتقة (لإصلاح خطأ dir is not defined)
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = dark ? themes.dark : themes.light;
  const tx = lang === "ar" ? T.ar : T.en;
  const isCompactPhone = typeof window !== "undefined" && window.innerWidth <= 430;
  const landingAdConfig = {
    enabled: false,
    web: { client: "ca-pub-xxxxxxxxxxxxxxxx", slot: "1234567890" },
    mobile: { androidUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/1234567890" },
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (isNativePlatform || !landingAdConfig.enabled || view !== "landing") return;

    const adClient = String(landingAdConfig.web.client || "").trim();
    if (!adClient || adClient.includes("xxxx")) return;

    const scriptId = "adsbygoogle-script";
    const initPendingAdSlots = () => {
      const pendingSlots = document.querySelectorAll("ins.adsbygoogle:not([data-ad-ready='1'])");
      pendingSlots.forEach((slot) => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          slot.setAttribute("data-ad-ready", "1");
        } catch {
          // Keep silent to avoid interrupting UI if the ad provider rejects a request.
        }
      });
    };

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      initPendingAdSlots();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
    script.crossOrigin = "anonymous";
    script.onload = () => initPendingAdSlots();
    document.head.appendChild(script);
  }, [isNativePlatform, landingAdConfig.enabled, landingAdConfig.web.client, view]);

  useEffect(() => {
    fetchAdConfig().then((cfg) => {
      if (cfg.enabled && cfg.imageUrl) setAdRemote(cfg);
    }).catch(() => {});
  }, []);

  const cvOfferDeadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d;
  }, []);

  const topCountries = useMemo(() => countriesData.slice(0, 10), []);
  const country = useMemo(() => countriesData.find((c) => c.name === selectedCountry) || null, [selectedCountry]);
  const nationalityCountry = useMemo(() => countriesData.find((c) => c.name === selectedNationality) || null, [selectedNationality]);
  const isOtherNationalitySelected = selectedNationality === OTHER_NATIONALITY_VALUE;
  const availableEmbassyCountries = useMemo(
    () => embassyDirectory[selectedCountry] || [],
    [selectedCountry]
  );
  const nationalityEmbassyCountry = useMemo(
    () => availableEmbassyCountries.find((embassyCountry) => embassyCountry.nationality === selectedNationality) || null,
    [availableEmbassyCountries, selectedNationality]
  );
  const remainingEmbassyCountries = useMemo(
    () => availableEmbassyCountries.filter((embassyCountry) => embassyCountry.nationality !== selectedNationality),
    [availableEmbassyCountries, selectedNationality]
  );
  const selectedEmbassy = useMemo(
    () => availableEmbassyCountries.find((embassyCountry) => embassyCountry.nationality === selectedEmbassyCountry)
      || nationalityEmbassyCountry
      || null,
    [availableEmbassyCountries, selectedEmbassyCountry, nationalityEmbassyCountry]
  );
  const mergedOfficeOverrides = useMemo(() => ({
    ...(officeOverrides || {}),
    ...(remoteOfficeOverrides || {}),
  }), [officeOverrides, remoteOfficeOverrides]);

  const effectiveOffices = useMemo(() => {

    const mergedAddedMap = new Map();
    [...(adminAddedOffices || []), ...(remoteAddedOffices || [])].forEach((entry) => {
      const cleanId = Number(entry?.id) || 0;
      if (!cleanId) return;
      mergedAddedMap.set(cleanId, {
        ...entry,
        id: cleanId,
        license: Number(entry?.license) || 0,
      });
    });

    const mergedBase = [
      ...officesData,
      ...Array.from(mergedAddedMap.values()),
    ];

    return mergedBase
      .map((office) => {
        const override = mergedOfficeOverrides?.[office.id] || null;
        if (override?.__deleted) return null;
        return override ? { ...office, ...override } : office;
      })
      .filter(Boolean)
      .slice()
      .sort((a, b) => {
        const govCompare = String(a?.gov || "").localeCompare(String(b?.gov || ""), "ar");
        if (govCompare !== 0) return govCompare;
        const licenseDiff = (Number(a?.license) || 0) - (Number(b?.license) || 0);
        if (licenseDiff !== 0) return licenseDiff;
        return String(a?.id || "").localeCompare(String(b?.id || ""), "ar");
      });
  }, [adminAddedOffices, mergedOfficeOverrides, remoteAddedOffices]);

  const saudiOffices = useMemo(() => {
    const normalized = Object.entries(saudiOfficesData || {}).flatMap(([cityName, offices]) => (
      (offices || []).map((office, index) => ({
        ...office,
        id: String(office?.id || `sa-office-${cityName}-${index + 1}`),
        country: "المملكة العربية السعودية",
        gov: cityName,
        district: String(office?.district || "").trim(),
        type: String(office?.type || "").trim(),
        phone: String(office?.phone || "").trim(),
        website: String(office?.website || "").trim(),
        working_hours: String(office?.working_hours || "").trim(),
        services: Array.isArray(office?.services) ? office.services : [],
      }))
    ));

    return normalized
      .map((office) => {
        const override = mergedOfficeOverrides?.[office.id] || null;
        if (override?.__deleted) return null;
        return override ? { ...office, ...override } : office;
      })
      .filter(Boolean)
      .slice()
      .sort((a, b) => {
        const cityCompare = String(a?.gov || "").localeCompare(String(b?.gov || ""), "ar");
        if (cityCompare !== 0) return cityCompare;
        const nameCompare = String(a?.name || "").localeCompare(String(b?.name || ""), "ar");
        if (nameCompare !== 0) return nameCompare;
        return String(a?.id || "").localeCompare(String(b?.id || ""));
      });
  }, [mergedOfficeOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem("adminAddedOfficesV1", JSON.stringify(adminAddedOffices || []));
    } catch {}
  }, [adminAddedOffices]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const payload = await fetchOfficeCustomizationsFromFirebase();
        if (!isMounted) return;
        setRemoteOfficeOverrides(payload?.overrides || {});
        setRemoteAddedOffices(Array.isArray(payload?.added) ? payload.added : []);
      } catch (error) {
        console.warn("Office customizations fetch failed", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizeGovernorateName = (govName) => String(govName || "")
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
  const isSameGovernorate = (leftGov, rightGov) => normalizeGovernorateName(leftGov) === normalizeGovernorateName(rightGov);
  const countryOffices = useMemo(() => {
    if (!selectedGov) return [];
    if (selectedCountry === "المملكة العربية السعودية") {
      return saudiOffices.filter((office) => isSameGovernorate(office.gov, selectedGov));
    }
    return effectiveOffices.filter((office) => isSameGovernorate(office.gov, selectedGov));
  }, [effectiveOffices, isSameGovernorate, saudiOffices, selectedCountry, selectedGov]);
  const hasSelectedNationality = Boolean(String(selectedNationality || "").trim());
  const availableSaudiServices = useMemo(() => {
    if (selectedCountry !== "المملكة العربية السعودية" || !selectedGov) return [];
    const servicesSet = new Set();
    saudiOffices
      .filter((o) => isSameGovernorate(o.gov, selectedGov))
      .forEach((o) => {
        if (Array.isArray(o.services)) {
          o.services.forEach((s) => { if (s) servicesSet.add(String(s).trim()); });
        }
      });
    return Array.from(servicesSet).sort((a, b) => a.localeCompare(b, "ar"));
  }, [isSameGovernorate, saudiOffices, selectedCountry, selectedGov]);
  const saudiServiceColumns = isCompactPhone ? 4 : 7;
  const saudiServicePreviewCount = Math.max(6, (saudiServiceColumns * 3) - 2);
  const hasMoreSaudiServices = availableSaudiServices.length > saudiServicePreviewCount;
  const visibleSaudiServices = useMemo(() => {
    if (showAllSaudiServices || !hasMoreSaudiServices) return availableSaudiServices;
    return availableSaudiServices.slice(0, saudiServicePreviewCount);
  }, [availableSaudiServices, hasMoreSaudiServices, saudiServicePreviewCount, showAllSaudiServices]);

  const filteredOffices = useMemo(() => {
    let list = [];
    if (selectedCountry === "المملكة العربية السعودية") {
      list = saudiOffices;
    } else {
      list = effectiveOffices;
    }

    if (selectedGov) list = list.filter((o) => isSameGovernorate(o.gov, selectedGov));
    if (selectedServiceFilter) {
      list = list.filter((o) =>
        Array.isArray(o.services) && o.services.some((s) => String(s || "").trim() === selectedServiceFilter)
      );
    }
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((o) =>
        o.name.toLowerCase().includes(query)
        || String(o.address || "").toLowerCase().includes(query)
        || String(o.district || "").toLowerCase().includes(query)
        || String(o.type || "").toLowerCase().includes(query)
        || (Array.isArray(o.services) && o.services.some((service) => String(service || "").toLowerCase().includes(query)))
        || String(o.license || "").includes(query)
      );
    }
    return list;
  }, [effectiveOffices, isSameGovernorate, saudiOffices, search, selectedCountry, selectedGov, selectedServiceFilter]);
  const guestOfficeLimit = useMemo(() => {
    if (!isGuestUser || !selectedGov) return 0;
    const totalInSelectedRegion = countryOffices.length;
    if (totalInSelectedRegion <= 0) return 0;
    if (selectedCountry === "مصر") {
      return totalInSelectedRegion < 20 ? 1 : 3;
    }
    if (selectedCountry === "المملكة العربية السعودية") {
      return Math.min(3, totalInSelectedRegion);
    }
    return 0;
  }, [countryOffices.length, isGuestUser, selectedCountry, selectedGov]);
  const visibleFilteredOffices = useMemo(() => {
    if (!guestOfficeLimit) return filteredOffices;
    return filteredOffices.slice(0, guestOfficeLimit);
  }, [filteredOffices, guestOfficeLimit]);
  const guestLockedOfficesCount = useMemo(() => {
    if (!guestOfficeLimit) return 0;
    return Math.max(0, countryOffices.length - guestOfficeLimit);
  }, [countryOffices.length, guestOfficeLimit]);
  const officesPerPage = 30;
  const totalOfficePages = Math.max(1, Math.ceil(visibleFilteredOffices.length / officesPerPage));
  const paginatedOffices = useMemo(() => {
    const safePage = Math.min(officePage, totalOfficePages);
    const startIndex = (safePage - 1) * officesPerPage;
    return visibleFilteredOffices.slice(startIndex, startIndex + officesPerPage);
  }, [visibleFilteredOffices, officePage, totalOfficePages]);

  useEffect(() => {
    setOfficePage(1);
  }, [selectedGov, search, selectedCountry, selectedServiceFilter]);

  useEffect(() => {
    setSelectedServiceFilter(null);
    setShowAllSaudiServices(false);
  }, [selectedGov, selectedCountry]);

  useEffect(() => {
    try {
      if (selectedNationality) {
        localStorage.setItem("preferredNationality", selectedNationality);
      } else {
        localStorage.removeItem("preferredNationality");
      }
    } catch {}
    if (selectedNationality && authPreviewUser?.uid) {
      upsertAuthUserProfileInFirebase({ uid: authPreviewUser.uid, nationality: selectedNationality }).catch(() => {});
    }
  }, [selectedNationality, authPreviewUser?.uid]);

  useEffect(() => {
    setShowOtherEmbassies(false);
    if (nationalityEmbassyCountry) {
      setSelectedEmbassyCountry(nationalityEmbassyCountry.nationality);
      return;
    }
    setSelectedEmbassyCountry("");
  }, [selectedCountry, selectedNationality, nationalityEmbassyCountry, availableEmbassyCountries]);

  useEffect(() => {
    if (!isOtherNationalitySelected) return;
    if (view === "countryEmbassies") {
      setView("countryMenu");
      return;
    }
    if (view === "egyptEmbassies") {
      setView("egyptMenu");
    }
  }, [isOtherNationalitySelected, view]);

  useEffect(() => {
    if (officePage > totalOfficePages) setOfficePage(totalOfficePages);
  }, [officePage, totalOfficePages]);

  const govCount = (govName) => effectiveOffices.filter((office) => isSameGovernorate(office.gov, govName)).length;

  const adminOrdersTimeCounts = useMemo(() => {
    const nowMs = Date.now();
    const startOfTodayMs = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    const weekCutoffMs = nowMs - (7 * 24 * 60 * 60 * 1000);
    const monthCutoffMs = nowMs - (30 * 24 * 60 * 60 * 1000);
    return {
      today: adminOrders.filter((e) => e.createdAtMs >= startOfTodayMs).length,
      "7d": adminOrders.filter((e) => e.createdAtMs >= weekCutoffMs).length,
      "30d": adminOrders.filter((e) => e.createdAtMs >= monthCutoffMs).length,
      all: adminOrders.length,
    };
  }, [adminOrders]);

  const filteredAdminOrders = useMemo(() => {
    const nowMs = Date.now();
    const startOfTodayMs = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    const weekCutoffMs = nowMs - (7 * 24 * 60 * 60 * 1000);
    const monthCutoffMs = nowMs - (30 * 24 * 60 * 60 * 1000);

    if (adminOrdersFilter === "today") {
      return adminOrders.filter((entry) => entry.createdAtMs >= startOfTodayMs);
    }
    if (adminOrdersFilter === "7d") {
      return adminOrders.filter((entry) => entry.createdAtMs >= weekCutoffMs);
    }
    if (adminOrdersFilter === "30d") {
      return adminOrders.filter((entry) => entry.createdAtMs >= monthCutoffMs);
    }
    return adminOrders;
  }, [adminOrders, adminOrdersFilter]);

  const adminOrdersFilterLabel = useMemo(() => {
    if (adminOrdersFilter === "today") return lang === "ar" ? "اليوم" : "Today";
    if (adminOrdersFilter === "7d") return lang === "ar" ? "آخر 7 أيام" : "Last 7 days";
    if (adminOrdersFilter === "30d") return lang === "ar" ? "آخر 30 يوم" : "Last 30 days";
    return lang === "ar" ? "الكل" : "All";
  }, [adminOrdersFilter, lang]);

  const adminStageSlaHours = useMemo(() => ({
    contact48: 48,
    contacted: 96,
    inProgress: 168,
    done: 240,
  }), []);

  const adminOpsFilterLabel = useMemo(() => {
    if (adminOpsFilter === "delayed") return lang === "ar" ? "طلبات متأخرة" : "Delayed orders";
    if (adminOpsFilter === "no-review") return lang === "ar" ? "بدون تقييم" : "No review";
    if (adminOpsFilter === "email-failed") return lang === "ar" ? "فشل الإيميل" : "Email failed";
    return lang === "ar" ? "كل الحالات" : "All statuses";
  }, [adminOpsFilter, lang]);

  const filteredAdminUsers = useMemo(() => {
    const q = String(adminUsersQuery || "").trim().toLowerCase();
    if (!q) return adminUsers;
    return adminUsers.filter((entry) => {
      const haystack = [
        entry?.displayName,
        entry?.email,
        entry?.phoneNumber,
        entry?.uid,
        entry?.country,
        entry?.nationality,
      ].map((value) => String(value || "").toLowerCase()).join(" ");
      return haystack.includes(q);
    });
  }, [adminUsers, adminUsersQuery]);

  const filteredAdminOrdersByOps = useMemo(() => {
    if (adminOpsFilter === "no-review") {
      return filteredAdminOrders.filter((entry) => !(entry.reviewedFlag && Number(entry.ratingValue) > 0));
    }

    if (adminOpsFilter === "email-failed") {
      return filteredAdminOrders.filter((entry) => String(entry.emailDeliveryStatus || "").toLowerCase() === "failed");
    }

    if (adminOpsFilter === "delayed") {
      const nowMs = Date.now();
      return filteredAdminOrders.filter((entry) => {
        const safeStages = {
          ...createInitialStageConfirmations(),
          ...(entry.stageConfirmations || {}),
        };
        const firstPendingStage = STATUS_STEP_KEYS.find((key) => !safeStages[key]);
        if (firstPendingStage !== adminDelayedStageKey) return false;
        const createdAtMs = Number(entry.createdAtMs) || 0;
        if (!createdAtMs) return false;
        const ageHours = (nowMs - createdAtMs) / (1000 * 60 * 60);
        const stageLimit = Number(adminStageSlaHours[adminDelayedStageKey]) || 48;
        return ageHours >= stageLimit;
      });
    }

    return filteredAdminOrders;
  }, [adminDelayedStageKey, adminOpsFilter, adminStageSlaHours, filteredAdminOrders]);

  const adminOpsCounts = useMemo(() => {
    const delayedCount = (() => {
      const nowMs = Date.now();
      return filteredAdminOrders.filter((entry) => {
        const safeStages = {
          ...createInitialStageConfirmations(),
          ...(entry.stageConfirmations || {}),
        };
        const firstPendingStage = STATUS_STEP_KEYS.find((key) => !safeStages[key]);
        if (firstPendingStage !== adminDelayedStageKey) return false;
        const createdAtMs = Number(entry.createdAtMs) || 0;
        if (!createdAtMs) return false;
        const ageHours = (nowMs - createdAtMs) / (1000 * 60 * 60);
        const stageLimit = Number(adminStageSlaHours[adminDelayedStageKey]) || 48;
        return ageHours >= stageLimit;
      }).length;
    })();

    const noReviewCount = filteredAdminOrders.filter(
      (entry) => !(entry.reviewedFlag && Number(entry.ratingValue) > 0)
    ).length;

    const emailFailedCount = filteredAdminOrders.filter(
      (entry) => String(entry.emailDeliveryStatus || "").toLowerCase() === "failed"
    ).length;

    return {
      all: filteredAdminOrders.length,
      delayed: delayedCount,
      "no-review": noReviewCount,
      "email-failed": emailFailedCount,
    };
  }, [adminDelayedStageKey, adminStageSlaHours, filteredAdminOrders]);

  const filteredAdminOrdersForView = useMemo(() => {
    const q = String(adminOrdersQuery || "").trim().toLowerCase();
    if (!q) return filteredAdminOrdersByOps;

    return filteredAdminOrdersByOps.filter((entry) => {
      const haystack = [
        entry?.serialLabel,
        entry?.customerName,
        entry?.customerPhone,
        entry?.serviceName,
        entry?.countryName,
        entry?.nationalityName,
      ].map((value) => String(value || "").toLowerCase()).join(" ");
      return haystack.includes(q);
    });
  }, [adminOrdersQuery, filteredAdminOrdersByOps]);

  const providerRequestsVisible = useMemo(
    () => adminProviderRequests.filter((entry) => String(entry?.statusValue || entry?.status || "").trim().toLowerCase() !== "deleted"),
    [adminProviderRequests]
  );

  const filteredAdminProviderRequestsForView = useMemo(() => {
    const q = String(adminProviderRequestsQuery || "").trim().toLowerCase();
    if (!q) return providerRequestsVisible;
    return providerRequestsVisible.filter((entry) => {
      const haystack = [
        entry?.serialLabel,
        entry?.providerNameValue,
        entry?.officeName,
        entry?.emailValue,
        entry?.countryValue,
        entry?.nationalityValue,
        ...(Array.isArray(entry?.servicesValue) ? entry.servicesValue : []),
      ].map((value) => String(value || "").toLowerCase()).join(" ");
      return haystack.includes(q);
    });
  }, [providerRequestsVisible, adminProviderRequestsQuery]);

  const adminPendingProvidersCount = useMemo(
    () => providerRequestsVisible.filter((entry) => String(entry?.statusValue || entry?.status || "pending").trim().toLowerCase() === "pending").length,
    [providerRequestsVisible]
  );

  const selectedAdminProviderRequest = useMemo(
    () => providerRequestsVisible.find((entry) => String(entry?.id || "") === adminSelectedProviderRequestId) || null,
    [adminSelectedProviderRequestId, providerRequestsVisible]
  );

  const adminCriticalCount = useMemo(() => {
    const nowMs = Date.now();
    const criticalIds = new Set();

    filteredAdminOrders.forEach((entry) => {
      const entryId = String(entry.id || entry.firebaseId || entry.serialLabel || "").trim();
      if (!entryId) return;

      const emailFailed = String(entry.emailDeliveryStatus || "").toLowerCase() === "failed";

      const safeStages = {
        ...createInitialStageConfirmations(),
        ...(entry.stageConfirmations || {}),
      };
      const firstPendingStage = STATUS_STEP_KEYS.find((key) => !safeStages[key]);
      const createdAtMs = Number(entry.createdAtMs) || 0;
      const stageLimit = Number(adminStageSlaHours[adminDelayedStageKey]) || 48;
      const delayed = firstPendingStage === adminDelayedStageKey && createdAtMs > 0
        ? ((nowMs - createdAtMs) / (1000 * 60 * 60)) >= stageLimit
        : false;

      if (emailFailed || delayed) {
        criticalIds.add(entryId);
      }
    });

    return criticalIds.size;
  }, [adminDelayedStageKey, adminStageSlaHours, filteredAdminOrders]);

  const getGovernorateLabel = (govName) => {
    if (lang === "ar") return govName;
    return (
      cityNamesEn[govName]
      || egyptGovernorates.find((gov) => isSameGovernorate(gov.name, govName))?.nameEn
      || getOfficeEnglishText(govName)
    );
  };
  const getOfficeLabel = (officeName) => (lang === "ar" ? officeName : getOfficeEnglishText(officeName));
  const getOfficeAddressLabel = (officeAddress) => (lang === "ar" ? officeAddress : getOfficeEnglishText(officeAddress));
  const handleCountrySelect = (nextCountry) => {
    if (!hasSelectedNationality) return;
    setSelectedCountry(nextCountry);
    setSelectedGov(null);
    setSearch("");
    setView(nextCountry === "مصر" ? "egyptMenu" : "countryMenu");
  };
  const handleGovSelect = (govName) => {
    setSelectedGov(govName);
    setSearch("");
    setOfficePage(1);
    setView("list");
  };
  const openAdminAddOfficeModal = () => {
      if (!isAdminUser || selectedCountry !== "مصر") return;
    setAdminAddOfficeDraft({
      name: "",
      license: "",
      address: "",
      gov: selectedGov || "القاهرة",
    });
    setAdminAddOfficeError("");
    setAdminAddOfficeOpen(true);
  };
  const saveAdminAddedOffice = async () => {
      if (!isAdminUser || selectedCountry !== "مصر") return;
    const nextName = String(adminAddOfficeDraft.name || "").trim();
    const nextAddress = String(adminAddOfficeDraft.address || "").trim();
    const nextGov = String(adminAddOfficeDraft.gov || "").trim();
    const nextLicenseRaw = String(adminAddOfficeDraft.license || "").trim();
    const nextLicense = Number(nextLicenseRaw);
    if (!nextName || !nextAddress || !nextGov || !nextLicenseRaw) {
      setAdminAddOfficeError(lang === "ar" ? "من فضلك أكمل كل البيانات." : "Please fill all fields.");
      return;
    }
    if (!Number.isFinite(nextLicense) || nextLicense <= 0) {
      setAdminAddOfficeError(lang === "ar" ? "رقم الترخيص غير صحيح." : "Invalid license number.");
      return;
    }
    const licenseExists = effectiveOffices.some((entry) => Number(entry?.license) === nextLicense);
    if (licenseExists) {
      setAdminAddOfficeError(lang === "ar" ? "رقم الترخيص موجود بالفعل." : "This license number already exists.");
      return;
    }
    const nextId = Math.max(
      100000,
      ...effectiveOffices.map((entry) => Number(entry?.id) || 0),
      ...adminAddedOffices.map((entry) => Number(entry?.id) || 0)
    ) + 1;
    const nextOffice = {
      id: nextId,
      name: nextName,
      license: nextLicense,
      address: nextAddress,
      gov: nextGov,
      phone: "",
    };
    setAdminAddedOffices((prev) => [...prev, nextOffice]);
    setRemoteAddedOffices((prev) => {
      const next = [...(prev || []).filter((entry) => Number(entry?.id) !== nextOffice.id), nextOffice];
      return next;
    });
    try {
      await saveAddedOfficeInFirebase(nextOffice);
    } catch (error) {
      console.warn("Saving added office to Firebase failed", error);
    }
    setAdminAddOfficeOpen(false);
    setAdminAddOfficeError("");
    setModal({
      type: "success",
      title: lang === "ar" ? "تمت إضافة المكتب" : "Office added",
      msg: lang === "ar" ? "تم حفظ المكتب الجديد بنجاح." : "The new office has been saved successfully.",
    });
  };
  const openServiceModal = (label) => setModal({ type: "service", title: tx.paidServicesTitle, msg: `${label} - ${tx.paidComingSoonMsg}` });
  const openCityModal = (cityName) => setModal({ type: "city", title: cityName, msg: tx.cityComingSoonMsg });
  const openGuestLockedOfficeNotice = useCallback(() => {
    setModal({
      type: "info",
      title: lang === "ar" ? "المكتب مقفول للضيف" : "Office Locked For Guests",
      msg: lang === "ar"
        ? "لازم تسجل الدخول أو تنشئ حساب جديد عشان تفتح باقي المكاتب."
        : "You need to sign in or create an account to unlock more offices.",
    });
  }, [lang]);

  const openProviderPortalOrPromptLogin = useCallback(() => {
    if (isGuestUser) {
      setProviderPortalGuestNotice(
        lang === "ar"
          ? "يجب تسجيل الدخول أو إنشاء حساب للاستفادة من هذه الخدمة."
          : "You need to sign in or create an account to use this service."
      );
      return;
    }
    setProviderPortalMode("service");
    setProviderPortalAddNew(false);
    setView("providerPortal");
  }, [isGuestUser, lang]);

  const openOfficePortalOrPromptLogin = useCallback(() => {
    if (isGuestUser) {
      setProviderPortalGuestNotice(
        lang === "ar"
          ? "يجب تسجيل الدخول أو إنشاء حساب لإضافة مكتبك."
          : "You need to sign in or create an account to add your office."
      );
      return;
    }
    setProviderPortalMode("office");
    setProviderPortalAddNew(false);
    setView("providerPortal");
  }, [isGuestUser, lang]);

  const closeOfficeEditorState = useCallback(() => {
    setAdminOfficeEditOpen(false);
    setAdminOfficeEditError("");
    setAdminOfficeDraft({
      name: "",
      license: "",
      address: "",
      gov: "",
      registrationType: "",
      registrationNumber: "",
      taxNumber: "",
      issuingAuthority: "",
      officialSourceUrl: "",
      officialVerificationStatus: "",
      mapPlaceId: "",
      mapLat: "",
      mapLng: "",
      mapVerificationStatus: "",
    });
  }, []);

  const hasUnsavedOfficeEditorChanges = useCallback((office = selectedOffice) => {
    if (!adminOfficeEditOpen || !office) return false;
    const draftName = String(adminOfficeDraft.name || "").trim();
    const draftLicense = String(adminOfficeDraft.license || "").replace(/[^0-9]/g, "");
    const draftAddress = String(adminOfficeDraft.address || "").trim();
    const draftGov = String(adminOfficeDraft.gov || "").trim();
    const draftRegistrationType = String(adminOfficeDraft.registrationType || "").trim();
    const draftRegistrationNumber = String(adminOfficeDraft.registrationNumber || "").trim();
    const draftTaxNumber = String(adminOfficeDraft.taxNumber || "").trim();
    const draftIssuingAuthority = String(adminOfficeDraft.issuingAuthority || "").trim();
    const draftOfficialSourceUrl = String(adminOfficeDraft.officialSourceUrl || "").trim();
    const draftOfficialVerificationStatus = String(adminOfficeDraft.officialVerificationStatus || "").trim();
    const draftMapPlaceId = String(adminOfficeDraft.mapPlaceId || "").trim();
    const draftMapLat = String(adminOfficeDraft.mapLat || "").trim();
    const draftMapLng = String(adminOfficeDraft.mapLng || "").trim();
    const draftMapVerificationStatus = String(adminOfficeDraft.mapVerificationStatus || "").trim();

    const officeName = String(office.name || "").trim();
    const officeLicense = String(office.license || "").replace(/[^0-9]/g, "");
    const officeAddress = String(office.address || "").trim();
    const officeGov = String(office.gov || "").trim();
    const officeRegistrationType = String(office.registrationType || "").trim();
    const officeRegistrationNumber = String(office.registrationNumber || "").trim();
    const officeTaxNumber = String(office.taxNumber || "").trim();
    const officeIssuingAuthority = String(office.issuingAuthority || "").trim();
    const officeOfficialSourceUrl = String(office.officialSourceUrl || "").trim();
    const officeOfficialVerificationStatus = String(office.officialVerificationStatus || "").trim();
    const officeMapPlaceId = String(office.mapPlaceId || "").trim();
    const officeMapLat = String(office.mapLat || "").trim();
    const officeMapLng = String(office.mapLng || "").trim();
    const officeMapVerificationStatus = String(office.mapVerificationStatus || "").trim();

    return (
      draftName !== officeName ||
      draftLicense !== officeLicense ||
      draftAddress !== officeAddress ||
      draftGov !== officeGov ||
      draftRegistrationType !== officeRegistrationType ||
      draftRegistrationNumber !== officeRegistrationNumber ||
      draftTaxNumber !== officeTaxNumber ||
      draftIssuingAuthority !== officeIssuingAuthority ||
      draftOfficialSourceUrl !== officeOfficialSourceUrl ||
      draftOfficialVerificationStatus !== officeOfficialVerificationStatus ||
      draftMapPlaceId !== officeMapPlaceId ||
      draftMapLat !== officeMapLat ||
      draftMapLng !== officeMapLng ||
      draftMapVerificationStatus !== officeMapVerificationStatus
    );
  }, [adminOfficeDraft.address, adminOfficeDraft.gov, adminOfficeDraft.issuingAuthority, adminOfficeDraft.license, adminOfficeDraft.mapLat, adminOfficeDraft.mapLng, adminOfficeDraft.mapPlaceId, adminOfficeDraft.mapVerificationStatus, adminOfficeDraft.name, adminOfficeDraft.officialSourceUrl, adminOfficeDraft.officialVerificationStatus, adminOfficeDraft.registrationNumber, adminOfficeDraft.registrationType, adminOfficeDraft.taxNumber, adminOfficeEditOpen, selectedOffice]);

  const confirmDiscardOfficeEditorChanges = useCallback((office = selectedOffice) => {
    if (!hasUnsavedOfficeEditorChanges(office)) {
      closeOfficeEditorState();
      return true;
    }
    const confirmed = typeof window === "undefined" || window.confirm(
      lang === "ar"
        ? "لديك تعديلات غير محفوظة على بيانات المكتب. احفظ التعديلات أو اضغط إلغاء للرجوع بدون فقدانها.\n\nهل تريد تجاهل التعديلات والمتابعة؟"
        : "You have unsaved office edits. Save your changes first, or cancel to continue editing.\n\nDo you want to discard the changes and continue?"
    );
    if (!confirmed) return false;
    closeOfficeEditorState();
    return true;
  }, [closeOfficeEditorState, hasUnsavedOfficeEditorChanges, lang, selectedOffice]);

  const closeSelectedOfficeView = useCallback(() => {
    if (!confirmDiscardOfficeEditorChanges(selectedOffice)) return false;
    setSelectedOffice(null);
    return true;
  }, [confirmDiscardOfficeEditorChanges, selectedOffice]);

  const openOfficeDetails = useCallback((office) => {
    if (!office) return;
    if (!confirmDiscardOfficeEditorChanges(selectedOffice)) return;
    setSelectedOffice(office);
    setUserRating(0);
    setReviewText("");
  }, [confirmDiscardOfficeEditorChanges, selectedOffice]);

  // 4. الدوال المساعدة (Helper Functions)
  const goHome = () => { 
    setView("home"); 
    setSelectedGov(null); 
    setSearch("");
    setOfficePage(1);
  };
  const goToEgyptMenu = () => {
    if (!closeSelectedOfficeView()) return;
    setMainTab("home");
    setSelectedCountry("مصر");
    setShowOtherDropdown(false);
    setSelectedGov(null);
    setSearch("");
    setActiveTab("ministry");
    setView("egyptMenu");
  };

  const goToCountryLanding = () => {
    if (!closeSelectedOfficeView()) return;
    setMainTab("home");
    setShowOtherDropdown(false);
    setSelectedGov(null);
    setActiveTab("ministry");
    setView("landing");
  };
  const goToEgyptHome = () => {
    if (!closeSelectedOfficeView()) return;
    setMainTab("home");
    setSelectedCountry("مصر");
    setShowOtherDropdown(false);
    setSelectedGov(null);
    setActiveTab("ministry");
    setView("egyptMenu");
  };

  const handleAppBackNavigation = useCallback(() => {
    if (showExitConfirm) {
      setShowExitConfirm(false);
      return;
    }

    if (modal) {
      setModal(null);
      return;
    }

    if (providerPortalGuestNotice) {
      setProviderPortalGuestNotice("");
      return;
    }

    if (signOutConfirmOpen) {
      closeSignOutConfirm();
      return;
    }

    if (adminSecurityOpen) {
      closeAdminSecurityModal();
      return;
    }

    if (adminAddOfficeOpen) {
      setAdminAddOfficeOpen(false);
      setAdminAddOfficeError("");
      return;
    }

    if (adminActionConfirm) {
      closeAdminActionConfirm();
      return;
    }

    if (authPreviewMode === "otp") {
      clearInterval(authPreviewOtpResendIntervalRef.current);
      setAuthPreviewOtpResendTimer(0);
      setAuthPreviewOtp(["", "", "", "", "", ""]);
      setAuthPreviewPhoneFlow(null);
      setAuthPreviewMode("login");
      setAuthPreviewError("");
      setAuthPreviewSuccess("");
      return;
    }

    if (authPreviewOpen || (!authPreviewUser && !guestMode)) {
      setShowExitConfirm(true);
      return;
    }

    if (authPreviewMode === "signup" || authPreviewMode === "forgot") {
      setAuthPreviewMode("login");
      setAuthPreviewError("");
      setAuthPreviewSuccess("");
      return;
    }

    if (accountPanelOpen) {
      if (accountDeleteConfirm) {
        setAccountDeleteConfirm(false);
        return;
      }
      if (accountPhoneVerificationId) {
        setAccountPhoneVerificationId("");
        setAccountPhonePendingNumber("");
        setAccountPhoneOtp(["", "", "", "", "", ""]);
        setAccountProfileError("");
        setAccountProfileSuccess("");
        return;
      }
      navigateBackFromAccountPanel();
      return;
    }

    if (adminPanelOpen) {
      closeAdminPanel();
      return;
    }

    if (selectedOffice) {
      closeSelectedOfficeView();
      return;
    }

    if (mainTab === "cv") {
      if (cvMode === "services" && cvPaidScreen !== "list") {
        setCvPaidBackRequest((value) => value + 1);
        return;
      }
      if (cvMode === "builder") {
        if (cvBuilderScreen === "submittedData") {
          setCvBuilderScreen("orderDetails");
          return;
        }
        if (cvBuilderScreen === "orderDetails") {
          setSelectedCvBuilderOrder(null);
          setCvBuilderScreen(cvBuilderOrderDetailsBackScreen === "adminOrders" ? "adminOrders" : "previousOrders");
          return;
        }
        if (cvBuilderScreen === "adminOrders") {
          setCvBuilderScreen("menu");
          return;
        }
        if (cvBuilderScreen === "previousOrders") {
          setCvBuilderScreen("menu");
          return;
        }
        if (cvBuilderScreen === "form") {
          if (cvStep > 0) {
            setCvStep((value) => value - 1);
            return;
          }
          setCvBuilderScreen("menu");
          return;
        }
      }
      if (cvMode || cvStep > 0 || cvUnlocked) {
        setCvMode(null);
        setSelectedCvPackage(null);
        setCvBuilderScreen("menu");
        setSelectedCvBuilderOrder(null);
        setCvStep(0);
        setCvUnlocked(false);
        return;
      }
      goToCountryLanding();
      return;
    }

    if (mainTab === "settings") {
      goToCountryLanding();
      return;
    }

    if (view === "list") {
      if (selectedCountry && selectedCountry !== "مصر") {
        setSelectedGov(null);
        setSearch("");
        setView("countryTrusted");
      } else {
        goHome();
      }
      return;
    }

    if (view === "egyptServices") {
      if (egyptServicesScreen !== "list") {
        setEgyptServicesBackRequest((value) => value + 1);
        return;
      }
      goToEgyptMenu();
      return;
    }

    if (view === "country") {
      if (activeTab === "paid" && countryPaidScreen !== "list") {
        setCountryPaidBackRequest((value) => value + 1);
        return;
      }
      setView("countryMenu");
      return;
    }

    if (view === "countryTrusted" || view === "countryEmbassies") {
      setView("countryMenu");
      return;
    }

    if (view === "countryPaid") {
      if (countryPaidScreen !== "list") {
        setCountryPaidBackRequest((value) => value + 1);
        return;
      }
      setView("countryMenu");
      return;
    }

    if (view === "providerPortal") {
      if (providerPortalMode === "office" && selectedCountry !== "مصر") {
        setView("countryTrusted");
      } else if (selectedCountry === "مصر") {
        goToEgyptMenu();
      } else {
        setView("countryMenu");
      }
      return;
    }

    if (view === "countryMenu") {
      goToCountryLanding();
      return;
    }

    if (view === "home" || view === "egyptForbidden" || view === "egyptEmbassies") {
      goToEgyptMenu();
      return;
    }

    if (view === "egyptMenu") {
      goToCountryLanding();
      return;
    }

    setShowExitConfirm(true);
  }, [
    showExitConfirm,
    modal,
    providerPortalGuestNotice,
    signOutConfirmOpen,
    adminSecurityOpen,
    adminAddOfficeOpen,
    adminActionConfirm,
    authPreviewMode,
    authPreviewOpen,
    authPreviewUser,
    guestMode,
    selectedOffice,
    mainTab,
    cvMode,
    cvPaidScreen,
    cvStep,
    cvUnlocked,
    view,
    egyptServicesScreen,
    activeTab,
    countryPaidScreen,
    accountPanelOpen,
    accountDeleteConfirm,
    accountPhoneVerificationId,
    navigateBackFromAccountPanel,
    closeSignOutConfirm,
    closeAdminSecurityModal,
    adminPanelOpen,
    closeAdminActionConfirm,
    closeAdminPanel,
    closeSelectedOfficeView,
    cvBuilderOrderDetailsBackScreen,
  ]);

  // back button handler
  useEffect(() => {
    const handler = CapApp.addListener("backButton", () => {
      handleAppBackNavigation();
    });
    return () => { handler.then(h => h.remove()); };
  }, [handleAppBackNavigation]);


  // 6. واجهة التطبيق الأساسية
  // (المكونات المساعدة والعودة النهائية قادمة أدناه)

  const Modal = () => modal ? (
    <div style={styles.overlay}>
      <div style={{
        ...styles.modalBox,
        maxWidth: modal.type === "success" ? 286 : styles.modalBox.maxWidth,
        padding: modal.type === "success" ? "20px 16px" : styles.modalBox.padding,
        background: modal.type === "success"
          ? (dark
            ? "linear-gradient(180deg, rgba(6,78,59,0.96) 0%, rgba(6,95,70,0.96) 100%)"
            : "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)")
          : (dark ? "#0f1e38" : "#ffffff"),
        border: modal.type === "success"
          ? "1px solid rgba(52,211,153,0.72)"
          : `1px solid ${t.border}`,
        boxShadow: modal.type === "success"
          ? "0 0 0 1px rgba(16,185,129,0.28), 0 0 26px rgba(16,185,129,0.52), 0 18px 46px rgba(0,0,0,0.32)"
          : styles.modalBox.boxShadow,
      }}>
        {modal.type === "cvEmailConfirm" ? (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>📨</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.gold, textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 12, color: t.text, lineHeight: 1.8, marginBottom: 18, fontFamily: "'Cairo',sans-serif" }}>
              {[
                [lang === "ar" ? "الدولة" : "Country", modal.meta?.country],
                [lang === "ar" ? "رقم الموبايل" : "Mobile", modal.meta?.phone],
                [lang === "ar" ? "رقم الواتساب" : "WhatsApp", modal.meta?.whatsapp],
              ].map(([label, value]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
                  <span style={{ color:t.subText }}>{label}</span>
                  <span style={{ color:t.text, fontWeight:700, direction:"ltr", textAlign:"left" }}>{value || "—"}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setModal(null)}
                style={{ flex:1, padding:"11px", borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={sendCvDataByEmail}
                style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${t.gold},#b8860b)`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                {lang === "ar" ? "موافق وإرسال" : "OK & Send"}
              </button>
            </div>
          </>
        ) : modal.type === "cvBuilderReview" ? (
          <>
            <div style={{ fontSize: 34, textAlign: "center", marginBottom: 10 }}>⭐</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.gold, textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 12, color: t.subText, lineHeight: 1.8, textAlign: "center", marginBottom: 16, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? "شاركنا تقييمك لتجربة إعداد السيرة الذاتية. سيتم حفظه في التطبيق ليستفيد منه باقي المستخدمين."
                : "Share your experience with the CV service. Your rating will be saved for other users to benefit from."}
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:14 }} onMouseLeave={() => setCvBuilderHoverRating(0)}>
              {[1,2,3,4,5].map((star) => {
                const active = (cvBuilderHoverRating || cvBuilderRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setCvBuilderHoverRating(star)}
                    onClick={() => setCvBuilderRating(star)}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:26, color: active ? "#f59e0b" : t.border, padding:0 }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <textarea
              style={{ width:"100%", minHeight:90, borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, padding:"11px 12px", resize:"vertical", fontFamily:"'Cairo',sans-serif", fontSize:12, boxSizing:"border-box", marginBottom:10 }}
              value={cvBuilderReviewText}
              placeholder={lang === "ar" ? "اكتب تعليقك أو تجربتك مع الخدمة..." : "Write your feedback or experience..."}
              onChange={(e) => setCvBuilderReviewText(e.target.value)}
            />
            {!!cvBuilderReviewError && (
              <div style={{ fontSize:11, color:"#dc2626", fontWeight:800, textAlign:"center", marginBottom:10 }}>
                {cvBuilderReviewError}
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={() => {
                  const nextSubject = modal.meta?.subject;
                  const nextBody = modal.meta?.body;
                  const shouldOpenMailto = !!modal.meta?.openMailtoAfter;
                  setModal(null);
                  if (shouldOpenMailto) {
                    sendCvDataByEmail(nextSubject, nextBody);
                  }
                }}
                style={{ flex:1, padding:"11px", borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}
              >
                {lang === "ar" ? "تخطي" : "Skip"}
              </button>
              <button
                onClick={async () => {
                  if (!cvBuilderRating || cvBuilderReviewSubmitting) {
                    setCvBuilderReviewError(
                      lang === "ar" ? "اختر عدد النجوم أولًا." : "Please choose a star rating first."
                    );
                    return;
                  }
                  setCvBuilderReviewSubmitting(true);
                  setCvBuilderReviewError("");
                  try {
                    const previousRating = currentCvBuilderReviewMeta?.saved
                      ? (Number(currentCvBuilderReviewMeta?.rating) || null)
                      : null;
                    const ensuredOrder = await ensureCvBuilderOrderForCurrentRequestAsync();
                    await saveServiceReviewToFirebase({
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
                    });
                    const nextStats = await syncCvPackageStatsInFirebase("builder", {
                      rating: cvBuilderRating,
                      previousRating,
                    });
                    applyCvPackageStatsUpdate("builder", nextStats);
                    window.dispatchEvent(
                      new CustomEvent("cv-package-stats-updated", {
                        detail: { packageKey: "builder", stats: nextStats },
                      })
                    );
                    const nextSubject = modal.meta?.subject;
                    const nextBody = modal.meta?.body;
                    const shouldOpenMailto = !!modal.meta?.openMailtoAfter;
                    setModal({
                      type: "info",
                      title: lang === "ar" ? "شكرًا لتقييمك" : "Thanks for your review",
                      msg: lang === "ar"
                        ? "تم حفظ تقييم الخدمة بنجاح في التطبيق."
                        : "Your service review has been saved successfully.",
                    });
                    if (shouldOpenMailto) {
                      sendCvDataByEmail(nextSubject, nextBody);
                    }
                  } catch (error) {
                    console.error("CV builder review save failed", error);
                    if (isDeviceRequestLimitError(error)) {
                      setModal({
                        type: "requestLimit",
                        title: lang === "ar" ? "تم الوصول إلى حد الطلبات" : "Request limit reached",
                        msg: lang === "ar"
                          ? `المتاح لهذا الجهاز ${Number(error?.details?.limit) || 2} طلب فقط خلال ${Number(error?.details?.windowDays) || 7} أيام. برجاء المحاولة لاحقًا.`
                          : `This device can submit only ${Number(error?.details?.limit) || 2} requests every ${Number(error?.details?.windowDays) || 7} days. Please try again later.`,
                      });
                      return;
                    }
                    setCvBuilderReviewError(
                      lang === "ar"
                        ? "تعذر حفظ تقييم الخدمة الآن. حاول مرة أخرى."
                        : "Unable to save the service review right now. Please try again."
                    );
                  } finally {
                    setCvBuilderReviewSubmitting(false);
                  }
                }}
                style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${t.gold},#b8860b)`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", opacity:cvBuilderReviewSubmitting ? 0.75 : 1 }}
              >
                {cvBuilderReviewSubmitting
                  ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...")
                  : (lang === "ar" ? "حفظ التقييم" : "Save Review")}
              </button>
            </div>
          </>
        ) : modal.type === "cvExportLang" ? (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.gold, textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.8, textAlign: "center", marginBottom: 18, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "اختر لغة الملف الذي تريد استخراجه الآن." : "Choose the language for the file you want to export now."}
            </div>
            <div style={{ display:"grid", gap:10, marginBottom:12 }}>
              <button
                onClick={() => { setModal(null); modal.fileType === "pdf" ? handleCvPdfDownload("ar") : handleCvWordDownload("ar"); }}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:`1px solid ${t.gold}55`, background:`${t.gold}12`, color:t.gold, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                العربية
              </button>
              <button
                onClick={() => { setModal(null); modal.fileType === "pdf" ? handleCvPdfDownload("en") : handleCvWordDownload("en"); }}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                English
              </button>
            </div>
            <button onClick={() => setModal(null)}
              style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "#e5e7eb", color: "#334155", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </>
        ) : modal.type === "cvExportLangPrevOrder" ? (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.gold, textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? `اختر لغة تصدير ${modal.fileType === "pdf" ? "PDF" : "Word"}` : `Choose ${modal.fileType === "pdf" ? "PDF" : "Word"} export language`}
            </div>
            <div style={{ display:"grid", gap:10, marginBottom:12 }}>
              <button
                onClick={() => { const o = modal.order; setModal(null); modal.fileType === "pdf" ? exportOrderDataToPdf(o, "ar") : exportOrderDataToWord(o, "ar"); }}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:`1px solid ${t.gold}55`, background:`${t.gold}12`, color:t.gold, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                العربية
              </button>
              <button
                onClick={() => { const o = modal.order; setModal(null); modal.fileType === "pdf" ? exportOrderDataToPdf(o, "en") : exportOrderDataToWord(o, "en"); }}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                English
              </button>
            </div>
            <button onClick={() => setModal(null)}
              style={{ width:"100%", padding:"11px", borderRadius:12, border:"none", background:"#e5e7eb", color:"#334155", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </>
        ) : modal.type === "cvGuestBuilderNotice" ? (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#dc2626", textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif", textShadow: "0 0 12px rgba(220,38,38,0.35)" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.9, textAlign: "center", marginBottom: 16, fontFamily: "'Cairo',sans-serif" }}>
              {modal.msg}
            </div>
            <div style={{ display:"grid", gap:10 }}>
              <button
                onClick={() => {
                  setModal(null);
                  startCvBuilderDraftFlow();
                }}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: "0 0 16px rgba(220,38,38,0.45)" }}
              >
                {lang === "ar" ? "موافق" : "OK"}
              </button>
              <button
                onClick={() => setModal(null)}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </>
        ) : modal.type === "requestLimit" ? (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: t.gold, textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.9, textAlign: "center", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
              {modal.msg}
            </div>
          </>
        ) : modal.type === "guestLinksAlert" ? (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#2563eb", textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.9, textAlign: "center", marginBottom: 18, fontFamily: "'Cairo',sans-serif" }}>
              {modal.msg}
            </div>
            <div style={{ display:"grid", gap:10 }}>
              <button
                onClick={() => {
                  setModal(null);
                  setAuthPreviewMode("login");
                  setAuthPreviewOpen(true);
                }}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "تسجيل دخول" : "Sign In"}
              </button>
              <button
                onClick={() => {
                  setModal(null);
                  setAuthPreviewMode("register");
                  setAuthPreviewOpen(true);
                }}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1px solid #2563eb`, background: "transparent", color: "#2563eb", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "إنشاء حساب جديد" : "Create Account"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>
              {modal.type === "city" ? "🏙️" : modal.type === "info" ? "✅" : modal.type === "success" ? "✅" : "🔜"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: modal.type === "success" ? (dark ? "#a7f3d0" : "#047857") : t.gold, textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {modal.title}
            </div>
            <div style={{ fontSize: 13, color: modal.type === "success" ? (dark ? "#ecfdf5" : "#065f46") : t.text, lineHeight: 1.8, textAlign: "center", marginBottom: 18, fontFamily: "'Cairo',sans-serif" }}>
              {modal.msg}
            </div>
            <button onClick={() => setModal(null)}
              style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: modal.type === "success" ? "linear-gradient(135deg, #10b981, #047857)" : `linear-gradient(135deg,${t.gold},#b8860b)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: modal.type === "success" ? "0 0 14px rgba(16,185,129,0.42)" : "none" }}>
              {tx.closeBtn}
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

  const AccountPanel = () => accountPanelOpen && authPreviewUser ? (
    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.78)", backdropFilter: "blur(10px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 356,
          borderRadius: 24,
          padding: isCompactPhone ? "16px 14px 14px" : "20px 18px 18px",
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          border: "1px solid rgba(212,175,55,0.34)",
          boxShadow: "0 24px 80px rgba(7, 15, 35, 0.6), 0 0 0 1px rgba(212,175,55,0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          onClick={handleAccountBackAction}
          style={{
            position: "absolute",
            top: 12,
            right: dir === "rtl" ? "auto" : 12,
            left: dir === "rtl" ? 12 : "auto",
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5d77b",
            borderRadius: 10,
            padding: "6px 10px",
            fontFamily: "'Cairo',sans-serif",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "رجوع" : "Back"}
        </button>
        <button
          onClick={closeAccountPanel}
          style={{
            position: "absolute",
            top: 12,
            right: dir === "rtl" ? 12 : "auto",
            left: dir === "rtl" ? "auto" : 12,
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5d77b",
            borderRadius: 10,
            padding: "6px 10px",
            fontFamily: "'Cairo',sans-serif",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "إغلاق" : "Close"}
        </button>

        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <img
            src={logo}
            alt="Trusted Offices"
            style={{
              width: isCompactPhone ? 58 : 68,
              height: isCompactPhone ? 58 : 68,
              objectFit: "contain",
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.38))",
              marginBottom: 6,
            }}
          />
          <div style={{ color: "#e7c55b", fontSize: isCompactPhone ? 20 : 23, fontWeight: 900, lineHeight: 1.1, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "الحساب" : "Account"}
          </div>
          <div style={{ color: "rgba(245,215,123,0.92)", fontSize: 11, fontWeight: 700, marginTop: 3, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "إدارة بياناتك وتسجيل الخروج بأمان" : "Manage your profile and sign out safely"}
          </div>
        </div>

        <div style={{ marginTop: 10, borderRadius: 16, border: "1px solid rgba(212,175,55,0.45)", background: "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(245,215,123,0.08))", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🪙</span>
            <div>
              <div style={{ color: "#f5d77b", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "رصيد الكوينز" : "Coins Balance"}
              </div>
              <div style={{ color: "rgba(245,215,123,0.88)", fontSize: 10, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "يمكنك استخدامه في طرق الدفع المتاحة" : "Can be used in available payment options"}
              </div>
            </div>
          </div>
          <div style={{ color: "#fde68a", fontSize: 18, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
            {Number(accountCoins) || 0}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {[
            {
              icon: "✨",
              value: accountProfileName,
              setter: setAccountProfileName,
              placeholder: lang === "ar" ? "الاسم الكامل" : "Full name",
            },
            {
              icon: "📧",
              value: accountProfileEmail,
              setter: setAccountProfileEmail,
              placeholder: lang === "ar" ? "البريد الإلكتروني" : "Email address",
            },
            {
              icon: "📱",
              value: accountProfilePhone,
              setter: setAccountProfilePhone,
              placeholder: lang === "ar" ? "رقم الجوال" : "Phone number",
            },
          ].map((field) => (
            <div
              key={field.placeholder}
              style={{
                borderRadius: 18,
                border: "1.5px solid rgba(212,175,55,0.65)",
                background: "rgba(255,255,255,0.03)",
                minHeight: 48,
                width: "100%",
                position: "relative",
                padding: dir === "rtl" ? "0 46px 0 15px" : "0 15px 0 46px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>{field.icon}</span>
              <input
                value={field.icon === "📱"
                  ? ensurePhoneInputWithPlus(field.value)
                  : field.value}
                onChange={(e) => field.setter(
                  field.icon === "📱"
                    ? ensurePhoneInputWithPlus(e.target.value)
                    : e.target.value
                )}
                placeholder={field.icon === "📱" ? accountPhonePlaceholder : field.placeholder}
                style={{
                  width: "100%",
                  height: 46,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f8fafc",
                  fontFamily: "'Cairo',sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: field.icon === "📱" ? "left" : (dir === "rtl" ? "right" : "left"),
                  direction: field.icon === "📱" ? "ltr" : dir,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", fontSize: 10, lineHeight: 1.75, fontWeight: 700, fontFamily: "'Cairo',sans-serif", textAlign: dir === "rtl" ? "right" : "left" }}>
          {lang === "ar"
            ? "تغيير البريد يرسل رابط تأكيد إلى البريد الجديد، وتغيير رقم الجوال يحتاج رمز تحقق مستقل لحماية الحساب."
            : "Changing the email sends a confirmation link to the new address, and changing the phone number requires a separate verification code to protect the account."}
        </div>

        {accountPhoneVerificationId && (
          <div style={{ marginTop: 12, borderRadius: 16, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "12px 10px" }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.78)", fontSize: 11, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
              {lang === "ar"
                ? `أدخل رمز التحقق المرسل إلى ${accountPhonePendingNumber || accountProfilePhone}.`
                : `Enter the verification code sent to ${accountPhonePendingNumber || accountProfilePhone}.`}
            </div>
            <div style={{ display: "flex", gap: 8, direction: "ltr", justifyContent: "center" }}>
              {accountPhoneOtp.map((digit, index) => (
                <input
                  key={index}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => {
                    const rawValue = String(e.target.value || "");
                    const nextDigit = rawValue.slice(-1);
                    setAccountPhoneOtp((prev) => {
                      const next = [...prev];
                      next[index] = nextDigit;
                      return next;
                    });
                    if (nextDigit && e.target.nextElementSibling instanceof HTMLInputElement) {
                      e.target.nextElementSibling.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !accountPhoneOtp[index] && e.target.previousElementSibling instanceof HTMLInputElement) {
                      e.target.previousElementSibling.focus();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: 38,
                    height: 44,
                    borderRadius: 12,
                    border: "1.5px solid rgba(212,175,55,0.62)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#f8fafc",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontSize: 17,
                    fontWeight: 900,
                    outline: "none",
                    fontFamily: "'Cairo',sans-serif",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <button
                onClick={handleAccountPhoneVerify}
                disabled={accountPhoneBusy}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #e7c55b, #c99a23)",
                  color: "#11244f",
                  fontSize: 12,
                  fontWeight: 900,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                  opacity: accountPhoneBusy ? 0.72 : 1,
                }}
              >
                {accountPhoneBusy
                  ? (lang === "ar" ? "جارٍ التحقق..." : "Verifying...")
                  : (lang === "ar" ? "تأكيد رقم الجوال الجديد" : "Confirm new phone number")}
              </button>
            </div>
          </div>
        )}

        {!!accountProfileError && (
          <div style={{ marginTop: 12, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 12, padding: "9px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {accountProfileError}
          </div>
        )}

        {!!accountProfileSuccess && (
          <div style={{ marginTop: 12, color: "#dcfce7", background: "rgba(20,83,45,0.24)", border: "1px solid rgba(74,222,128,0.28)", borderRadius: 12, padding: "9px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {accountProfileSuccess}
          </div>
        )}

        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          <button
            onClick={handleAccountPhoneSendCode}
            disabled={accountPhoneBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.28)",
              background: "rgba(255,255,255,0.05)",
              color: "#f5d77b",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountPhoneBusy ? 0.72 : 1,
            }}
          >
            {accountPhoneBusy
              ? (lang === "ar" ? "جارٍ إرسال الرمز..." : "Sending code...")
              : accountPhoneVerificationId
                ? (lang === "ar" ? "إعادة إرسال رمز الجوال" : "Resend phone code")
                : (authPreviewUser?.phoneNumber
                    ? (lang === "ar" ? "تغيير رقم الجوال" : "Change phone number")
                    : (lang === "ar" ? "إضافة رقم جوال" : "Add phone number"))}
          </button>

          <button
            onClick={handleAccountProfileSave}
            disabled={accountProfileBusy}
            style={{
              width: "100%",
              padding: "11px 13px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #e7c55b, #c99a23)",
              color: "#11244f",
              fontSize: 13,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountProfileBusy ? 0.72 : 1,
              boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
            }}
          >
            {accountProfileBusy
              ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...")
              : (lang === "ar" ? "حفظ الاسم والبريد" : "Save name and email")}
          </button>

          <button
            onClick={handleAccountPasswordReset}
            disabled={accountProfileBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.28)",
              background: "rgba(255,255,255,0.05)",
              color: "#f5d77b",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountProfileBusy ? 0.72 : 1,
            }}
          >
            {lang === "ar" ? "إرسال رابط تغيير كلمة المرور" : "Send password reset link"}
          </button>

          <button
            onClick={() => setUsageGuideOpen(true)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.38)",
              background: "rgba(212,175,55,0.08)",
              color: "#f5d77b",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>📖</span>
            {lang === "ar" ? "شرح الاستخدام" : "How to use"}
          </button>

          <button
            onClick={() => setAccountDeleteConfirm((prev) => !prev)}
            disabled={accountProfileBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(248,113,113,0.28)",
              background: "rgba(127,29,29,0.18)",
              color: "#fecaca",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: accountProfileBusy ? 0.72 : 1,
            }}
          >
            {lang === "ar" ? "حذف الحساب" : "Delete account"}
          </button>
        </div>

        {accountDeleteConfirm && (
          <div
            onClick={() => !accountProfileBusy && setAccountDeleteConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 1500,
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 360,
                borderRadius: 22,
                border: "1px solid rgba(248,113,113,0.58)",
                background: dark
                  ? "linear-gradient(180deg, rgba(127,29,29,0.94) 0%, rgba(69,10,10,0.96) 100%)"
                  : "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)",
                boxShadow: "0 0 0 1px rgba(239,68,68,0.24), 0 0 28px rgba(239,68,68,0.52), 0 22px 56px rgba(0,0,0,0.30)",
                padding: "18px 16px 14px",
              }}
            >
              <div style={{ fontSize: 34, textAlign: "center", marginBottom: 8 }}>⚠️</div>
              <div style={{ color: dark ? "#fee2e2" : "#991b1b", fontSize: 16, fontWeight: 900, textAlign: "center", fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
                {lang === "ar" ? "تحذير حذف الحساب" : "Account Deletion Warning"}
              </div>
              <div style={{ color: dark ? "rgba(254,226,226,0.94)" : "#7f1d1d", fontSize: 12, lineHeight: 1.9, textAlign: "center", fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 14 }}>
                {lang === "ar"
                  ? "سيتم تسجيل طلب حذف الحساب فورًا وإخراجك إلى شاشة تسجيل الدخول. يمكنك استرجاع الحساب خلال 30 يوم عبر الدعم."
                  : "Your deletion request will be applied immediately and you will be returned to sign in. Account recovery is available for 30 days via support."}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  onClick={() => setAccountDeleteConfirm(false)}
                  disabled={accountProfileBusy}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(148,163,184,0.3)",
                    background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.86)",
                    color: dark ? "#fff" : "#334155",
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    opacity: accountProfileBusy ? 0.72 : 1,
                  }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAccountDelete}
                  disabled={accountProfileBusy}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444, #991b1b)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    boxShadow: "0 0 18px rgba(239,68,68,0.52)",
                    opacity: accountProfileBusy ? 0.72 : 1,
                  }}
                >
                  {accountProfileBusy
                    ? (lang === "ar" ? "جارٍ التنفيذ..." : "Processing...")
                    : (lang === "ar" ? "تأكيد الحذف" : "Confirm delete")}
                </button>
              </div>
            </div>
          </div>
        )}
        <div
          id="account-phone-recaptcha-container"
          style={{ width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none", position: "absolute" }}
        />
      </div>
    </div>
  ) : null;

  const USAGE_STEPS = [
    { emoji: "🌍", titleAr: "اختر دولتك", titleEn: "Choose your country", descAr: "من الشاشة الرئيسية اختر السعودية أو مصر للبدء في تصفح المكاتب.", descEn: "From the home screen, choose Saudi Arabia or Egypt to start browsing offices." },
    { emoji: "🏢", titleAr: "تصفح المكاتب", titleEn: "Browse offices", descAr: "اختر المحافظة أو المنطقة ثم تصفح قائمة المكاتب الموثوقة ومعلوماتها.", descEn: "Select a governorate or region, then browse the verified offices and their details." },
    { emoji: "📞", titleAr: "تواصل مع المكتب", titleEn: "Contact the office", descAr: "تستطيع معرفة رقم الترخيص الموثوق وموقع المكتب بدقة، وعمل تقييم للمكتب إذا كان لك تجربة سابقة.", descEn: "You can view the verified license number and the exact office location, and rate the office if you've had a previous experience." },
    { emoji: "🛎️", titleAr: "اطلب خدمة", titleEn: "Request a service", descAr: "اضغط 'اطلب خدمة' لتقديم طلب رقمي مثل الكفالة أو الوثائق أو السيرة الذاتية.", descEn: "Tap 'Request service' to submit a digital request such as sponsorship transfer, documents, or CV." },
    { emoji: "📋", titleAr: "تابع طلبك", titleEn: "Track your request", descAr: "ادخل على الحساب لمتابعة حالة طلبك مرحلة بمرحلة حتى اكتماله.", descEn: "Sign in to your account to track your request step by step until completion." },
    { emoji: "📄", titleAr: "ابنِ سيرتك الذاتية", titleEn: "Build your CV", descAr: "استخدم أداة بناء السيرة الذاتية المدمجة وصدّر ملف PDF باحترافية.", descEn: "Use the built-in CV builder and export a professional PDF file." },
    { emoji: "💬", titleAr: "تواصل مع الدعم", titleEn: "Contact support", descAr: "في الإعدادات ستجد رابط واتساب للتواصل مع فريق الدعم مباشرة.", descEn: "In Settings you will find a WhatsApp link to contact the support team directly." },
    { emoji: "🌙", titleAr: "اضبط المظهر واللغة", titleEn: "Adjust theme & language", descAr: "يمكنك التبديل بين الوضع الليلي والنهاري والعربية والإنجليزية من الشريط العلوي.", descEn: "You can switch between dark/light mode and Arabic/English from the top bar." },
  ];

  const UsageGuideModal = () => usageGuideOpen ? (
    <div
      onClick={() => setUsageGuideOpen(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 2000, padding: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: "22px 22px 0 0",
          background: dark ? "linear-gradient(180deg, rgba(15,23,42,0.99) 0%, rgba(10,15,30,0.99) 100%)" : "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)",
          border: "1px solid rgba(212,175,55,0.38)",
          borderBottom: "none",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.55)",
          padding: "18px 16px 32px",
          fontFamily: "'Cairo',sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.12))", border: "1px solid rgba(212,175,55,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
            <div>
              <div style={{ color: "#e7c55b", fontSize: 15, fontWeight: 900 }}>{lang === "ar" ? "شرح الاستخدام" : "How to use"}</div>
              <div style={{ color: "rgba(245,215,123,0.65)", fontSize: 10, fontWeight: 700 }}>{lang === "ar" ? "دليلك الكامل للتطبيق" : "Your complete app guide"}</div>
            </div>
          </div>
          <button
            onClick={() => setUsageGuideOpen(false)}
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#94a3b8", fontSize: 18, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>

        {/* Guest vs Logged-in comparison */}
        <div style={{ borderRadius: 16, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.03)", padding: "12px 14px", marginBottom: 12, direction: dir }}>
          <div style={{ color: "#e7c55b", fontSize: 12, fontWeight: 900, marginBottom: 10, textAlign: "center" }}>
            {lang === "ar" ? "🔑 الفرق بين الحساب والضيف" : "🔑 Account vs Guest"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ borderRadius: 12, border: "1px solid rgba(212,175,55,0.35)", background: "rgba(212,175,55,0.07)", padding: "10px 10px" }}>
              <div style={{ color: "#f5d77b", fontSize: 11, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>👤 {lang === "ar" ? "مستخدم مسجّل" : "Logged-in User"}</div>
              {[lang === "ar" ? "✅ متابعة الطلبات" : "✅ Track requests", lang === "ar" ? "✅ حفظ السيرة الذاتية" : "✅ Save CV", lang === "ar" ? "✅ تصدير PDF" : "✅ Export PDF", lang === "ar" ? "✅ كوينز ومكافآت" : "✅ Coins & rewards", lang === "ar" ? "✅ سجل الطلبات" : "✅ Order history"].map((f, i) => (
                <div key={i} style={{ color: "rgba(226,232,240,0.85)", fontSize: 10, fontWeight: 600, lineHeight: 1.7 }}>{f}</div>
              ))}
            </div>
            <div style={{ borderRadius: 12, border: "1px solid rgba(148,163,184,0.25)", background: "rgba(255,255,255,0.03)", padding: "10px 10px" }}>
              <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>🕶️ {lang === "ar" ? "ضيف" : "Guest"}</div>
              {[lang === "ar" ? "✅ تصفح المكاتب" : "✅ Browse offices", lang === "ar" ? "✅ التواصل المباشر" : "✅ Direct contact", lang === "ar" ? "⚠️ طلبات محدودة" : "⚠️ Limited requests", lang === "ar" ? "❌ لا حفظ للطلبات" : "❌ No saved orders", lang === "ar" ? "❌ لا تصدير PDF" : "❌ No PDF export"].map((f, i) => (
                <div key={i} style={{ color: "rgba(226,232,240,0.75)", fontSize: 10, fontWeight: 600, lineHeight: 1.7 }}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gap: 10 }}>
          {USAGE_STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                border: "1px solid rgba(212,175,55,0.22)",
                background: "rgba(255,255,255,0.04)",
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                direction: dir,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #e7c55b, #c99a23)", color: "#11244f", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <span style={{ fontSize: 20 }}>{step.emoji}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f5d77b", fontSize: 13, fontWeight: 900, marginBottom: 4 }}>{lang === "ar" ? step.titleAr : step.titleEn}</div>
                <div style={{ color: "rgba(226,232,240,0.82)", fontSize: 11, fontWeight: 600, lineHeight: 1.75 }}>{lang === "ar" ? step.descAr : step.descEn}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, textAlign: "center", color: "rgba(148,163,184,0.7)", fontSize: 11, fontWeight: 700 }}>
          {lang === "ar" ? "مكاتب السفريات الموثوقة · جميع الحقوق محفوظة" : "Trusted Travel Offices · All rights reserved"}
        </div>
      </div>
    </div>
  ) : null;

  const SignOutConfirmPanel = () => signOutConfirmOpen ? (
    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.60)", backdropFilter: "blur(8px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          borderRadius: 24,
          padding: "22px 18px 18px",
          background: dark ? "linear-gradient(180deg, rgba(91, 20, 20, 0.96) 0%, rgba(57, 18, 18, 0.98) 100%)" : "linear-gradient(180deg, #fff5f5 0%, #fee2e2 100%)",
          border: "1px solid rgba(248,113,113,0.28)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ fontSize: 34, textAlign: "center", marginBottom: 10 }}>🚪</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: dark ? "#fecaca" : "#b91c1c", textAlign: "center", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? "هل تريد تسجيل الخروج؟" : "Do you want to sign out?"}
        </div>
        <div style={{ fontSize: 12, color: dark ? "rgba(254,202,202,0.92)" : "#7f1d1d", lineHeight: 1.8, textAlign: "center", marginBottom: 16, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar"
            ? "سيتم إرجاعك إلى شاشة تسجيل الدخول، وستحتاج إلى تسجيل الدخول مرة أخرى للمتابعة."
            : "You will be returned to the sign-in screen and will need to log in again to continue."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={closeSignOutConfirm}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(148,163,184,0.24)",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.86)",
              color: dark ? "#fff" : "#334155",
              fontSize: 13,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "لا" : "No"}
          </button>
          <button
            onClick={async () => {
              setSignOutConfirmOpen(false);
              await handleAuthSignOut();
            }}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "نعم" : "Yes"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const AdminSecurityModal = () => adminSecurityOpen && isAdminUser ? (
    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.72)", backdropFilter: "blur(10px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          borderRadius: 22,
          padding: "20px 16px 16px",
          background: dark
            ? "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,0.98) 100%)"
            : "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          border: dark ? "1px solid rgba(148,163,184,0.35)" : "1px solid rgba(51,65,85,0.18)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.30)",
        }}
      >
        <div style={{ fontSize: 30, textAlign: "center", marginBottom: 8 }}>🛡️</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a", textAlign: "center", marginBottom: 6, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? "أمان لوحة الأدمن" : "Admin Security Check"}
        </div>
        <div style={{ fontSize: 12, color: dark ? "rgba(226,232,240,0.92)" : "#334155", lineHeight: 1.7, textAlign: "center", marginBottom: 12, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar"
            ? "أدخل كود الأدمن (6 أرقام) للمتابعة إلى لوحة التحكم."
            : "Enter the 6-digit admin code to continue to the admin panel."}
        </div>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={adminSecurityCode}
          onChange={(e) => {
            setAdminSecurityCode(String(e.target.value || "").replace(/\D/g, "").slice(0, 6));
            if (adminSecurityError) setAdminSecurityError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdminSecuritySubmit();
          }}
          placeholder={lang === "ar" ? "••••••" : "••••••"}
          style={{
            width: "100%",
            borderRadius: 14,
            border: dark ? "1px solid rgba(148,163,184,0.42)" : "1px solid rgba(51,65,85,0.22)",
            background: dark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.95)",
            color: dark ? "#f8fafc" : "#0f172a",
            fontSize: 18,
            letterSpacing: 5,
            textAlign: "center",
            padding: "12px 10px",
            outline: "none",
            fontWeight: 900,
            fontFamily: "'Cairo',sans-serif",
            marginBottom: 8,
          }}
        />

        {!!adminSecurityError && (
          <div style={{ fontSize: 11, color: "#ef4444", textAlign: "center", marginBottom: 8, fontWeight: 800, lineHeight: 1.6, fontFamily: "'Cairo',sans-serif" }}>
            {adminSecurityError}
          </div>
        )}

        <div style={{ fontSize: 10, color: dark ? "rgba(148,163,184,0.9)" : "#475569", textAlign: "center", marginBottom: 12, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? `عدد الأخطاء: ${adminSecurityAttempts}/2` : `Failed attempts: ${adminSecurityAttempts}/2`}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={closeAdminSecurityModal}
            disabled={adminSecurityBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: dark ? "1px solid rgba(148,163,184,0.4)" : "1px solid rgba(51,65,85,0.22)",
              background: dark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.85)",
              color: dark ? "#f8fafc" : "#334155",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: adminSecurityBusy ? 0.7 : 1,
            }}
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleAdminSecuritySubmit}
            disabled={adminSecurityBusy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#22c55e,#15803d)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              opacity: adminSecurityBusy ? 0.75 : 1,
            }}
          >
            {adminSecurityBusy
              ? (lang === "ar" ? "جارٍ التحقق..." : "Checking...")
              : (lang === "ar" ? "دخول" : "Enter")}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const AdminAddOfficeModal = () => adminAddOfficeOpen && isAdminUser ? (
    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.72)", backdropFilter: "blur(8px)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 22,
          padding: "18px 14px 14px",
          background: dark
            ? "linear-gradient(180deg, rgba(16,84,53,0.95) 0%, rgba(6,78,59,0.95) 100%)"
            : "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)",
          border: "1px solid rgba(34,197,94,0.48)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.34), 0 0 22px rgba(34,197,94,0.22)",
        }}
      >
        <div style={{ fontSize: 30, textAlign: "center", marginBottom: 8 }}>➕</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: dark ? "#d1fae5" : "#065f46", textAlign: "center", marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
          {lang === "ar" ? "إضافة مكتب جديد" : "Add New Office"}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={adminAddOfficeDraft.name}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={lang === "ar" ? "اسم المكتب" : "Office name"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" }}
          />
          <input
            value={adminAddOfficeDraft.license}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, license: String(e.target.value || "").replace(/[^0-9]/g, "") }))}
            placeholder={lang === "ar" ? "رقم الترخيص" : "License number"}
            inputMode="numeric"
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" }}
          />
          <textarea
            rows={2}
            value={adminAddOfficeDraft.address}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, address: e.target.value }))}
            placeholder={lang === "ar" ? "العنوان" : "Address"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", resize: "vertical", fontFamily: "'Cairo',sans-serif" }}
          />
          <select
            value={adminAddOfficeDraft.gov}
            onChange={(e) => setAdminAddOfficeDraft((prev) => ({ ...prev, gov: e.target.value }))}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(16,185,129,0.45)", background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", color: dark ? "#ecfdf5" : "#064e3b", fontSize: 12, padding: "9px 10px", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" }}
          >
            {egyptGovernorates.map((govItem) => (
              <option key={govItem.name} value={govItem.name}>{govItem.name}</option>
            ))}
          </select>
        </div>

        {!!adminAddOfficeError && (
          <div style={{ marginTop: 8, color: "#fecaca", background: "rgba(127,29,29,0.20)", border: "1px solid rgba(248,113,113,0.34)", borderRadius: 10, padding: "6px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {adminAddOfficeError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <button
            onClick={() => {
              setAdminAddOfficeOpen(false);
              setAdminAddOfficeError("");
            }}
            style={{ width: "100%", padding: "10px", borderRadius: 12, border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(71,85,105,0.28)", background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.90)", color: dark ? "#fff" : "#334155", fontSize: 12, fontWeight: 800, fontFamily: "'Cairo',sans-serif", cursor: "pointer" }}
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={saveAdminAddedOffice}
            style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: "pointer" }}
          >
            {lang === "ar" ? "حفظ المكتب" : "Save Office"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const authFieldShellStyle = {
    borderRadius: 18,
    border: "1.5px solid rgba(212,175,55,0.65)",
    background: "rgba(255,255,255,0.03)",
    minHeight: 58,
    width: "100%",
    position: "relative",
    padding: dir === "rtl" ? "0 50px 0 16px" : "0 16px 0 50px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  };

  const authFieldInputStyle = {
    width: "100%",
    height: 56,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontFamily: "'Cairo',sans-serif",
    fontSize: 14,
    fontWeight: 700,
    textAlign: dir === "rtl" ? "right" : "left",
    display: "block",
    padding: 0,
    margin: 0,
    lineHeight: "56px",
    boxSizing: "border-box",
  };

  const AdminPanel = () => adminPanelOpen && isAdminUser ? (
    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.84)", backdropFilter: "blur(10px)" }}>
      {!!adminActionConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10002,
            background: "rgba(2, 6, 23, 0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: "min(100%, 360px)",
              borderRadius: 20,
              padding: "16px 14px 14px",
              background: adminActionConfirm.type === "delete"
                ? "linear-gradient(180deg, rgba(30,58,138,0.98) 0%, rgba(15,23,42,0.98) 100%)"
                : "linear-gradient(180deg, rgba(127,29,29,0.98) 0%, rgba(30,12,12,0.98) 100%)",
              border: adminActionConfirm.type === "delete"
                ? "1px solid rgba(96,165,250,0.55)"
                : "1px solid rgba(248,113,113,0.55)",
              boxShadow: adminActionConfirm.type === "delete"
                ? "0 18px 48px rgba(30,64,175,0.42), 0 0 28px rgba(96,165,250,0.30)"
                : "0 18px 48px rgba(127,29,29,0.42), 0 0 28px rgba(248,113,113,0.28)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            <div style={{ color: "#f8fafc", fontSize: 15, fontWeight: 900, fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
              {adminActionConfirm.type === "delete"
                ? (lang === "ar" ? "تأكيد حذف الحساب" : "Confirm Account Deletion")
                : (lang === "ar" ? "تأكيد حظر المستخدم" : "Confirm User Block")}
            </div>
            <div style={{ color: "rgba(241,245,249,0.92)", fontSize: 12, lineHeight: 1.75, fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 12 }}>
              {adminActionConfirm.type === "delete"
                ? (lang === "ar"
                  ? "سيتم حذف الحساب نهائيًا من النظام، وسيحتاج المستخدم للتسجيل من جديد."
                  : "This account will be permanently deleted and the user must register again.")
                : (lang === "ar"
                  ? "سيتم حظر هذا الحساب ومنع تسجيل الدخول به حتى يقوم الأدمن بإلغاء الحظر."
                  : "This account will be blocked and sign-in will be denied until an admin unblocks it.")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={closeAdminActionConfirm}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.24)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#f8fafc",
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                }}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleAdminConfirmProceed}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 12,
                  border: "none",
                  background: adminActionConfirm.type === "delete"
                    ? "linear-gradient(135deg, #38bdf8, #2563eb)"
                    : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 900,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                }}
              >
                {adminActionConfirm.type === "delete"
                  ? (lang === "ar" ? "تأكيد الحذف" : "Confirm Delete")
                  : (lang === "ar" ? "تأكيد الحظر" : "Confirm Block")}
              </button>
            </div>
          </div>
        </div>
      )}
      {!!adminExitConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10002,
            background: "rgba(2, 6, 23, 0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: "min(100%, 360px)",
              borderRadius: 20,
              padding: "16px 14px 14px",
              background: "linear-gradient(180deg, rgba(127,29,29,0.98) 0%, rgba(30,12,12,0.98) 100%)",
              border: "1px solid rgba(248,113,113,0.55)",
              boxShadow: "0 18px 48px rgba(127,29,29,0.42), 0 0 28px rgba(248,113,113,0.28)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            <div style={{ color: "#f8fafc", fontSize: 15, fontWeight: 900, fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
              {lang === "ar" ? "هل تريد الخروج من لوحة تحكم الأدمن؟" : "Exit Admin Control Panel?"}
            </div>
            <div style={{ color: "rgba(241,245,249,0.92)", fontSize: 12, lineHeight: 1.75, fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 12 }}>
              {lang === "ar"
                ? "سيتم إغلاق لوحة تحكم الأدمن والعودة إلى الواجهة الرئيسية."
                : "The admin panel will be closed and you will return to the main interface."}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={() => setAdminExitConfirm(false)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.24)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#f8fafc",
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                }}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => closeAdminPanel()}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 900,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                }}
              >
                {lang === "ar" ? "تأكيد الخروج" : "Exit"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          maxHeight: "84vh",
          overflowY: "auto",
          borderRadius: 28,
          padding: isCompactPhone ? "20px 16px 18px" : "24px 20px 20px",
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          border: "1px solid rgba(212,175,55,0.34)",
          boxShadow: "0 24px 80px rgba(7, 15, 35, 0.6), 0 0 0 1px rgba(212,175,55,0.12)",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <button
          onClick={closeAdminPanel}
          style={{
            position: "absolute",
            top: 14,
            right: dir === "rtl" ? "auto" : 14,
            left: dir === "rtl" ? 14 : "auto",
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5d77b",
            borderRadius: 12,
            padding: "7px 12px",
            fontFamily: "'Cairo',sans-serif",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "إغلاق" : "Close"}
        </button>

        <div style={{ textAlign: dir === "rtl" ? "right" : "left", paddingTop: 6 }}>
          <div style={{ color: "#e7c55b", fontSize: isCompactPhone ? 18 : 20, fontWeight: 900, lineHeight: 1.1, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "لوحة تحكم الأدمن" : "Admin Control Panel"}
          </div>
          <div style={{ color: "rgba(245,215,123,0.92)", fontSize: 11, fontWeight: 700, marginTop: 3, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "المستخدمون والطلبات (آخر 30 يوم)" : "Users and orders (last 30 days)"}
          </div>
          <button
            onClick={() => {
              const currentSection = adminPanelSection;
              if (currentSection === "overview") {
                setAdminExitConfirm(true);
              } else if (adminSelectedOrderId) {
                setAdminSelectedOrderId("");
                setAdminPanelHistory(prev => prev.slice(0, -1));
              } else if (adminSelectedUserUid) {
                setAdminSelectedUserUid("");
                setAdminPanelHistory(prev => prev.slice(0, -1));
              } else if (adminSelectedProviderRequestId) {
                setAdminSelectedProviderRequestId("");
                setAdminPanelHistory(prev => prev.slice(0, -1));
              } else {
                setAdminPanelSection("overview");
                setAdminPanelHistory(["overview"]);
              }
            }}
            style={{ marginTop: 8, border: "1px solid rgba(212,175,55,0.35)", background: "rgba(255,255,255,0.06)", color: "#f5d77b", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
          >
            {lang === "ar" ? "← رجوع" : "← Back"}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 18 }}>
          <div style={{ color: "rgba(255,255,255,0.76)", fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar"
              ? `المستخدمون: ${adminUsers.length} | الطلبات: ${adminOrders.length} | مقدمو الخدمات: ${providerRequestsVisible.length}`
              : `Users: ${adminUsers.length} | Orders: ${adminOrders.length} | Providers: ${providerRequestsVisible.length}`}
          </div>
          <button
            onClick={() => {
              loadAdminUsers();
              loadAdminOrders();
              loadAdminProviderRequests();
            }}
            disabled={adminUsersLoading || adminOrdersLoading || adminProviderRequestsLoading}
            style={{
              border: "1px solid rgba(212,175,55,0.32)",
              background: "rgba(255,255,255,0.06)",
              color: "#f5d77b",
              borderRadius: 12,
              padding: "8px 12px",
              fontFamily: "'Cairo',sans-serif",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              opacity: adminUsersLoading || adminOrdersLoading || adminProviderRequestsLoading ? 0.7 : 1,
            }}
          >
            {adminUsersLoading || adminOrdersLoading || adminProviderRequestsLoading
              ? (lang === "ar" ? "جارٍ التحديث..." : "Refreshing...")
              : (lang === "ar" ? "تحديث" : "Refresh")}
          </button>
        </div>

        {adminPanelSection === "overview" && (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {[{
              key: "users",
              titleAr: "المستخدمون",
              titleEn: "Users",
              count: adminUsers.length,
              tone: "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(37,99,235,0.16))",
              border: "1px solid rgba(96,165,250,0.45)",
              icon: "👥",
            }, {
              key: "orders",
              titleAr: "الطلبات",
              titleEn: "Orders",
              count: adminOrders.length,
              tone: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(180,83,9,0.16))",
              border: "1px solid rgba(251,191,36,0.42)",
              icon: "📦",
            }, {
              key: "providers",
              titleAr: "مقدمو الخدمات",
              titleEn: "Service Providers",
              count: providerRequestsVisible.length,
              pending: adminPendingProvidersCount,
              tone: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(21,128,61,0.16))",
              border: "1px solid rgba(74,222,128,0.42)",
              icon: "🧰",
            }].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  const newHistory = [...adminPanelHistory, item.key];
                  setAdminPanelHistory(newHistory);
                  setAdminPanelSection(item.key);
                }}
                style={{
                  width: "100%",
                  textAlign: dir === "rtl" ? "right" : "left",
                  borderRadius: 16,
                  border: item.border,
                  background: item.tone,
                  padding: "12px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 900 }}>
                    {lang === "ar" ? item.titleAr : item.titleEn}
                  </div>
                  <div style={{ color: "#dbeafe", fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                    {lang === "ar" ? `الإجمالي: ${item.count}` : `Total: ${item.count}`}
                    {item.key === "providers" ? (lang === "ar" ? ` | الجديد: ${item.pending || 0}` : ` | New: ${item.pending || 0}`) : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!!adminUsersError && (
          <div style={{ marginTop: 14, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 14, padding: "10px 12px", textAlign: "center", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {adminUsersError}
          </div>
        )}

        <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "10px 10px 12px", display: adminPanelSection === "users" ? "block" : "none" }}>
          <div style={{ marginBottom: 8, color: "#f8fafc", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>{lang === "ar" ? "المستخدمون" : "Users"}</span>
            <span style={{ color: "#cbd5e1", fontSize: 10, fontWeight: 800 }}>
              {lang === "ar"
                ? `${filteredAdminUsers.length} / ${adminUsers.length}`
                : `${filteredAdminUsers.length} / ${adminUsers.length}`}
            </span>
          </div>

          <input
            value={adminUsersQuery}
            onChange={(event) => setAdminUsersQuery(event.target.value)}
            placeholder={lang === "ar" ? "بحث بالاسم أو الإيميل أو الهاتف" : "Search by name, email, or phone"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(212,175,55,0.30)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 11, fontWeight: 700, padding: "8px 10px", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}
          />

          {!canManageAdminUsers && (
            <div style={{ marginTop: 2, marginBottom: 8, borderRadius: 14, border: "1px solid rgba(34,197,94,0.38)", background: "rgba(22,163,74,0.14)", padding: "10px 12px", color: "#bbf7d0", textAlign: "center", fontSize: 11, lineHeight: 1.8, fontWeight: 800, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? "أنت أدمن متابعة فقط: يمكنك متابعة الطلبات والتواصل مع العملاء، ولا تملك صلاحيات إدارة المستخدمين."
                : "You are a tracking admin only: you can follow orders and contact clients, but cannot manage users."}
            </div>
          )}

          {canManageAdminUsers && (
          <div style={{ marginTop: 2 }}>
            {adminSelectedUserUid ? (() => {
              const selEntry = filteredAdminUsers.find(e => String(e.uid || e.id || "").trim() === adminSelectedUserUid)
                || adminUsers.find(e => String(e.uid || e.id || "").trim() === adminSelectedUserUid);
              if (!selEntry) return null;
              const selUid = String(selEntry.uid || selEntry.id || "").trim();
              const selEmail = String(selEntry.email || "").trim().toLowerCase();
              const selBlocked = String(selEntry.status || "active").trim() === "blocked";
              const selRole = String(selEntry.role || "user").trim().toLowerCase();
              const isSelOwnerAdmin = selEmail === PRIMARY_ADMIN_EMAIL;
              const isSelDelegateAdmin = selRole === "admin_delegate";
              const canManageSel = !!selUid && selUid !== authPreviewUser?.uid && !isSelOwnerAdmin;
              const rawSelName = String(selEntry.displayName || "").trim();
              const cleanSelName = rawSelName && !rawSelName.includes("@") ? rawSelName : (lang === "ar" ? "مستخدم بدون اسم" : "Unnamed user");
              const selIdx = adminUsers.findIndex(e => String(e.uid || e.id || "").trim() === adminSelectedUserUid);
              return (
                <div>
                  <button
                    onClick={() => setAdminSelectedUserUid("")}
                    style={{ marginBottom: 10, border: "1px solid rgba(212,175,55,0.35)", background: "rgba(255,255,255,0.06)", color: "#f5d77b", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
                  >
                    {lang === "ar" ? "← رجوع للقائمة" : "← Back to list"}
                  </button>
                  <div style={{ borderRadius: 18, border: `1px solid ${selBlocked ? "rgba(248,113,113,0.5)" : "rgba(212,175,55,0.35)"}`, background: selBlocked ? "rgba(127,29,29,0.18)" : "rgba(255,255,255,0.05)", padding: "12px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: selBlocked ? "rgba(239,68,68,0.22)" : "rgba(56,189,248,0.18)", border: `1px solid ${selBlocked ? "rgba(248,113,113,0.4)" : "rgba(96,165,250,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: selBlocked ? "#fca5a5" : "#93c5fd", fontWeight: 900, fontSize: 15, fontFamily: "'Cairo',sans-serif" }}>{selIdx + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 900, fontFamily: "'Cairo',sans-serif", lineHeight: 1.3 }}>{cleanSelName}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3, padding: "2px 8px", borderRadius: 999, background: selBlocked ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.16)", color: selBlocked ? "#fecaca" : "#bbf7d0", fontSize: 10, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
                          {selBlocked ? (lang === "ar" ? "محظور" : "Blocked") : (lang === "ar" ? "نشط" : "Active")}
                          {!selBlocked && isSelOwnerAdmin && <span style={{ marginInlineStart: 4 }}>{lang === "ar" ? "| أدمن أساسي" : "| Primary Admin"}</span>}
                          {!selBlocked && !isSelOwnerAdmin && isSelDelegateAdmin && <span style={{ marginInlineStart: 4 }}>{lang === "ar" ? "| أدمن متابعة" : "| Tracking Admin"}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                      {[
                        [lang === "ar" ? "البريد الإلكتروني" : "Email", selEntry.email || "—"],
                        [lang === "ar" ? "رقم الهاتف" : "Phone", selEntry.phoneNumber || "—"],
                        [lang === "ar" ? "الدولة" : "Country", selEntry.country || "—"],
                        [lang === "ar" ? "الجنسية" : "Nationality", selEntry.nationality || "—"],
                        ["UID", selUid],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 8, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "6px 9px" }}>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, fontFamily: "'Cairo',sans-serif", whiteSpace: "nowrap", minWidth: 90 }}>{label}</div>
                          <div style={{ color: "#e0f2fe", fontSize: 10, fontWeight: 800, fontFamily: label === "UID" ? "monospace" : "'Cairo',sans-serif", wordBreak: "break-all", lineHeight: 1.4 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                      <button
                        onClick={() => executeAdminToggleRole(selEntry)}
                        disabled={!canManageSel || adminActionBusyUid === selUid}
                        style={{ padding: "8px 4px", borderRadius: 12, border: "none", background: isSelDelegateAdmin ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #22c55e, #15803d)", color: "#fff", fontSize: 10, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: canManageSel ? "pointer" : "not-allowed", opacity: !canManageSel || adminActionBusyUid === selUid ? 0.55 : 1 }}
                      >
                        {!canManageSel ? (lang === "ar" ? "غير متاح" : "Locked") : adminActionBusyUid === selUid ? (lang === "ar" ? "جارٍ..." : "Wait...") : isSelDelegateAdmin ? (lang === "ar" ? "إلغاء الأدمن" : "Remove Admin") : (lang === "ar" ? "🟢 جعل أدمن" : "🟢 Make Admin")}
                      </button>
                      <button
                        onClick={() => handleAdminStatusToggle(selEntry)}
                        disabled={!canManageSel || adminActionBusyUid === selUid}
                        style={{ padding: "8px 4px", borderRadius: 12, border: "none", background: selBlocked ? "linear-gradient(135deg, #22c55e, #15803d)" : "linear-gradient(135deg, #ef4444, #b91c1c)", color: "#fff", fontSize: 10, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: canManageSel ? "pointer" : "not-allowed", opacity: !canManageSel || adminActionBusyUid === selUid ? 0.55 : 1 }}
                      >
                        {!canManageSel ? (lang === "ar" ? "حسابك" : "Yours") : adminActionBusyUid === selUid ? (lang === "ar" ? "جارٍ..." : "Wait...") : selBlocked ? (lang === "ar" ? "فك الحظر" : "Unblock") : (lang === "ar" ? "حظر" : "Block")}
                      </button>
                      <button
                        onClick={() => handleAdminDeleteUser(selEntry)}
                        disabled={!canManageSel || adminActionBusyUid === selUid}
                        style={{ padding: "8px 4px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #ef4444, #991b1b)", color: "#fff", fontSize: 10, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: canManageSel ? "pointer" : "not-allowed", opacity: !canManageSel || adminActionBusyUid === selUid ? 0.55 : 1 }}
                      >
                        {!canManageSel ? (lang === "ar" ? "حسابك" : "Yours") : adminActionBusyUid === selUid ? (lang === "ar" ? "جارٍ..." : "Wait...") : (lang === "ar" ? "حذف" : "Delete")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ display: "grid", gap: 5 }}>
                {filteredAdminUsers.map((entry, idx) => {
                  const entryUid = String(entry.uid || entry.id || "").trim();
                  const entryEmail = String(entry.email || "").trim().toLowerCase();
                  const isBlocked = String(entry.status || "active").trim() === "blocked";
                  const entryRole = String(entry.role || "user").trim().toLowerCase();
                  const isEntryOwnerAdmin = entryEmail === PRIMARY_ADMIN_EMAIL;
                  const isEntryDelegatedAdmin = entryRole === "admin_delegate";
                  const rawName = String(entry.displayName || "").trim();
                  const cleanName = rawName && !rawName.includes("@") ? rawName : (lang === "ar" ? "مستخدم بدون اسم" : "Unnamed");
                  const subtitle = entry.email || entry.phoneNumber || "";
                  return (
                    <button
                      key={entryUid || entry.id}
                      onClick={() => setAdminSelectedUserUid(entryUid)}
                      style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 13, border: `1px solid ${isBlocked ? "rgba(248,113,113,0.32)" : "rgba(212,175,55,0.2)"}`, background: isBlocked ? "rgba(127,29,29,0.12)" : "rgba(255,255,255,0.04)", cursor: "pointer", textAlign: dir === "rtl" ? "right" : "left", width: "100%" }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(56,189,248,0.14)", border: "1px solid rgba(96,165,250,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#93c5fd", fontWeight: 900, fontSize: 11, fontFamily: "'Cairo',sans-serif" }}>{idx + 1}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cleanName}</div>
                        {subtitle && <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 700, fontFamily: "sans-serif", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {(isEntryOwnerAdmin || isEntryDelegatedAdmin) && !isBlocked && (
                          <span style={{ padding: "2px 6px", borderRadius: 999, background: "rgba(245,158,11,0.18)", color: "#fbbf24", fontSize: 9, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
                            {lang === "ar" ? "أدمن" : "Admin"}
                          </span>
                        )}
                        <span style={{ padding: "2px 7px", borderRadius: 999, background: isBlocked ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.14)", color: isBlocked ? "#fca5a5" : "#86efac", fontSize: 9, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>
                          {isBlocked ? (lang === "ar" ? "محظور" : "Blocked") : (lang === "ar" ? "نشط" : "Active")}
                        </span>
                        <span style={{ color: "#64748b", fontSize: 14, lineHeight: 1 }}>{dir === "rtl" ? "‹" : "›"}</span>
                      </div>
                    </button>
                  );
                })}
                {!adminUsersLoading && filteredAdminUsers.length === 0 && (
                  <div style={{ borderRadius: 18, border: "1px dashed rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "18px 14px", textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                    {lang === "ar" ? "لا توجد نتائج مطابقة للمستخدمين." : "No matching users were found."}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>

        <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "10px 10px 12px", display: adminPanelSection === "orders" && !adminSelectedOrderId ? "block" : "none" }}>
        <div style={{ marginBottom: 6, color: "#f8fafc", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span>{lang === "ar" ? "الطلبات" : "Orders"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: adminCriticalCount > 0 ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.16)", border: adminCriticalCount > 0 ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(34,197,94,0.35)", color: adminCriticalCount > 0 ? "#fecaca" : "#bbf7d0", fontSize: 10, fontWeight: 900 }}>
            <span>{lang === "ar" ? "حالات حرجة" : "Critical"}</span>
            <span style={{ minWidth: 16, textAlign: "center" }}>{adminCriticalCount}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6, marginBottom: 8 }}>
          {[
            { key: "today", ar: "اليوم", en: "Today" },
            { key: "7d", ar: "آخر 7 أيام", en: "7 Days" },
            { key: "30d", ar: "آخر 30 يوم", en: "30 Days" },
            { key: "all", ar: "الكل", en: "All" },
          ].map((item) => {
            const active = adminOrdersFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setAdminOrdersFilter(item.key)}
                style={{
                  border: `1px solid ${active ? "rgba(212,175,55,0.65)" : "rgba(212,175,55,0.30)"}`,
                  background: active ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.06)",
                  color: active ? "#f5d77b" : "#e2e8f0",
                  borderRadius: 10,
                  padding: "6px 4px",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                <span>{lang === "ar" ? item.ar : item.en}</span>
                <span style={{ marginInlineStart: 4, padding: "1px 5px", borderRadius: 999, background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)", color: active ? "#fff" : "#ffe4e6", fontSize: 9, fontWeight: 900, lineHeight: 1.2, display: "inline-block", minWidth: 16 }}>
                  {adminOrdersTimeCounts[item.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6, marginBottom: 8 }}>
          {[
            { key: "all", ar: "كل الحالات", en: "All" },
            { key: "delayed", ar: "متأخرة", en: "Delayed" },
            { key: "no-review", ar: "بدون تقييم", en: "No Review" },
            { key: "email-failed", ar: "فشل الإيميل", en: "Email Fail" },
          ].map((item) => {
            const active = adminOpsFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setAdminOpsFilter(item.key)}
                style={{
                  border: `1px solid ${active ? "rgba(248,113,113,0.62)" : "rgba(248,113,113,0.28)"}`,
                  background: active ? "rgba(248,113,113,0.16)" : "rgba(255,255,255,0.05)",
                  color: active ? "#fecaca" : "#fca5a5",
                  borderRadius: 10,
                  padding: "6px 4px",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                {lang === "ar" ? item.ar : item.en}
              </button>
            );
          })}
        </div>

        {adminOpsFilter === "delayed" && (
          <div style={{ marginBottom: 8 }}>
            <select
              value={adminDelayedStageKey}
              onChange={(event) => setAdminDelayedStageKey(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid rgba(248,113,113,0.35)",
                background: "rgba(255,255,255,0.06)",
                color: "#fecaca",
                borderRadius: 10,
                padding: "7px 8px",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              <option value="contact48">{lang === "ar" ? "متأخر في: جاري التواصل" : "Delayed in: Contacting"}</option>
              <option value="contacted">{lang === "ar" ? "متأخر في: تم التواصل" : "Delayed in: Contacted"}</option>
              <option value="inProgress">{lang === "ar" ? "متأخر في: جاري البدء" : "Delayed in: In Progress"}</option>
              <option value="done">{lang === "ar" ? "متأخر في: إنهاء الخدمة" : "Delayed in: Done"}</option>
            </select>
          </div>
        )}

        <input
          value={adminOrdersQuery}
          onChange={(event) => setAdminOrdersQuery(event.target.value)}
          placeholder={lang === "ar" ? "بحث برقم الطلب أو اسم العميل أو الهاتف" : "Search by order ID, customer, or phone"}
          style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(212,175,55,0.30)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 11, fontWeight: 700, padding: "8px 10px", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}
        />

        {!!adminOrdersError && (
          <div style={{ marginTop: 8, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 14, padding: "8px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.6, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {adminOrdersError}
          </div>
        )}

        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {filteredAdminOrdersForView.map((orderItem, index) => {
            const orderId = String(orderItem.id || orderItem.firebaseId || orderItem.serialLabel || `order-${index + 1}`);
            const isExpanded = adminExpandedOrderId === orderId;
            const busy = adminOrderActionBusyId === orderId;
            const currentStageIndex = Number.isInteger(orderItem?.statusIndex)
              ? orderItem.statusIndex
              : Math.max(0, STATUS_STEP_KEYS.findIndex((key) => !(orderItem?.stageConfirmations || {})[key]) - 1);
            const orderTitle = lang === "ar"
              ? `طلب رقم ${index + 1}`
              : `Order #${index + 1}`;
            const hasWhatsapp = String(orderItem.whatsappNumber || "").length >= 8;
            const whatsappMessage = encodeURIComponent(
              lang === "ar"
                ? `مرحبًا ${orderItem.customerName || "عميلنا الكريم"}\n\nمتابعة طلبك:\nرقم الطلب: ${orderItem.serialLabel || "-"}\nالخدمة: ${orderItem.serviceName || "-"}\nالدولة: ${orderItem.countryName || "-"}\nالجنسية: ${orderItem.nationalityName || "-"}\nالتاريخ: ${orderItem.createdAtLabel || "-"}\n\nنحن معك لأي استفسار.`
                : `Hello ${orderItem.customerName || "dear customer"},\n\nOrder follow-up:\nOrder ID: ${orderItem.serialLabel || "-"}\nService: ${orderItem.serviceName || "-"}\nCountry: ${orderItem.countryName || "-"}\nNationality: ${orderItem.nationalityName || "-"}\nDate: ${orderItem.createdAtLabel || "-"}\n\nWe are here for any questions.`
            );
            const whatsappHref = hasWhatsapp
              ? `https://wa.me/${orderItem.whatsappNumber}?text=${whatsappMessage}`
              : "#";

            return (
              <div
                key={orderId}
                style={{ borderRadius: 14, border: "1px solid rgba(212,175,55,0.22)", background: "rgba(255,255,255,0.05)", padding: "8px 9px", cursor: "pointer" }}
                onClick={() => setAdminSelectedOrderId(orderId)}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 900, lineHeight: 1.25 }}>{orderTitle}</div>
                    <div style={{ color: "#cbd5e1", fontSize: 10, marginTop: 2 }}>
                      {lang === "ar" ? "رقم الطلب" : "Order ID"}: {orderItem.serialLabel || "—"}
                    </div>
                    <div style={{ color: "#93c5fd", fontSize: 10, marginTop: 1 }}>
                      {(lang === "ar" ? "العميل" : "Customer")}: {orderItem.customerName || "—"}
                    </div>
                    <div style={{ color: "#bbf7d0", fontSize: 10, marginTop: 1 }}>
                      {(lang === "ar" ? "الخدمة" : "Service")}: {orderItem.serviceName || "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleAdminDeleteOrder(orderItem)}
                      disabled={busy}
                      title={lang === "ar" ? "حذف الطلب نهائيًا" : "Delete order permanently"}
                      style={{
                        width: 27, height: 27, borderRadius: 9,
                        border: "1px solid rgba(239,68,68,0.45)",
                        background: "rgba(239,68,68,0.16)",
                        color: "#fca5a5",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, cursor: busy ? "not-allowed" : "pointer",
                        opacity: busy ? 0.5 : 1,
                      }}
                    >🗑️</button>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => {
                        if (!hasWhatsapp) {
                          event.preventDefault();
                          setAdminOrdersError(lang === "ar" ? "لا يوجد رقم واتساب صالح لهذا الطلب." : "No valid WhatsApp number for this order.");
                        }
                      }}
                      title={lang === "ar" ? "متابعة الطلب عبر واتساب" : "Follow up via WhatsApp"}
                      style={{
                        width: 27,
                        height: 27,
                        borderRadius: 9,
                        border: "1px solid rgba(37,211,102,0.45)",
                        background: "rgba(37,211,102,0.16)",
                        color: "#4ade80",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        fontSize: 14,
                        fontWeight: 900,
                        opacity: hasWhatsapp ? 1 : 0.45,
                        cursor: hasWhatsapp ? "pointer" : "not-allowed",
                      }}
                    >
                      ☏
                    </a>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 5, color: "rgba(245,215,123,0.7)", fontSize: 9, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                    {lang === "ar" ? "اضغط على البطاقة لعرض التفاصيل الكاملة" : "Tap card to view full details"}
                  </div>
                )}
              </div>
            );
          })}

          {!adminOrdersLoading && filteredAdminOrdersForView.length === 0 && (
            <div style={{ borderRadius: 14, border: "1px dashed rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "12px 10px", textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 11, lineHeight: 1.7, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? `لا توجد طلبات ضمن الفلتر: ${adminOrdersFilterLabel} | ${adminOpsFilterLabel}.`
                : `No orders found for filter: ${adminOrdersFilterLabel} | ${adminOpsFilterLabel}.`}
            </div>
          )}
        </div>
        </div>

        {/* ===== ORDER DETAIL PAGE ===== */}
        {(() => {
          if (!adminSelectedOrderId || adminPanelSection !== "orders") return null;
          const detailOrder = filteredAdminOrdersForView.find(
            (o) => String(o.id || o.firebaseId || o.serialLabel || "").trim() === adminSelectedOrderId
          ) || adminOrders.find(
            (o) => String(o.id || o.firebaseId || o.serialLabel || "").trim() === adminSelectedOrderId
          );
          if (!detailOrder) return null;
          const dBusy = adminOrderActionBusyId === adminSelectedOrderId;
          const dStageIndex = Number.isInteger(detailOrder?.statusIndex)
            ? detailOrder.statusIndex
            : Math.max(0, STATUS_STEP_KEYS.findIndex((key) => !(detailOrder?.stageConfirmations || {})[key]) - 1);
          const hasWa = String(detailOrder.whatsappNumber || "").length >= 8;
          const waMsg = encodeURIComponent(
            lang === "ar"
              ? `مرحبًا ${detailOrder.customerName || "عميلنا الكريم"}\n\nمتابعة طلبك:\nرقم الطلب: ${detailOrder.serialLabel || "-"}\nالخدمة: ${detailOrder.serviceName || "-"}\nالدولة: ${detailOrder.countryName || "-"}\nالجنسية: ${detailOrder.nationalityName || "-"}\nالتاريخ: ${detailOrder.createdAtLabel || "-"}\n\nنحن معك لأي استفسار.`
              : `Hello ${detailOrder.customerName || "dear customer"},\n\nOrder follow-up:\nOrder ID: ${detailOrder.serialLabel || "-"}\nService: ${detailOrder.serviceName || "-"}\nCountry: ${detailOrder.countryName || "-"}\nNationality: ${detailOrder.nationalityName || "-"}\nDate: ${detailOrder.createdAtLabel || "-"}\n\nWe are here for any questions.`
          );
          const waHref = hasWa ? `https://wa.me/${detailOrder.whatsappNumber}?text=${waMsg}` : "#";

          const detailFields = [
            [lang === "ar" ? "رقم الطلب" : "Order ID", detailOrder.serialLabel || "—"],
            [lang === "ar" ? "اسم العميل" : "Customer", detailOrder.customerName || "—"],
            [lang === "ar" ? "رقم الهاتف" : "Phone", detailOrder.customerPhone || "—"],
            [lang === "ar" ? "الخدمة" : "Service", detailOrder.serviceName || "—"],
            [lang === "ar" ? "الدولة" : "Country", detailOrder.countryName || "—"],
            [lang === "ar" ? "الجنسية" : "Nationality", detailOrder.nationalityName || "—"],
            [lang === "ar" ? "التاريخ" : "Date", detailOrder.createdAtLabel || "—"],
            [lang === "ar" ? "الحالة" : "Status", String(detailOrder.status || detailOrder.orderStatus || "new")],
            [lang === "ar" ? "التقييم" : "Rating", `${Number(detailOrder.ratingValue || detailOrder.rating || 0)}/5`],
            [lang === "ar" ? "التعليق" : "Comment", String(detailOrder.reviewTextValue || detailOrder.reviewText || "—")],
            [lang === "ar" ? "حالة الإيميل" : "Email Status", String(detailOrder.emailDeliveryStatus || "—")],
          ];

          return (
            <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(212,175,55,0.38)", background: "rgba(255,255,255,0.04)", padding: "12px 12px 14px" }}>
              <div style={{ color: "#e7c55b", fontSize: 13, fontWeight: 900, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
                {lang === "ar" ? "تفاصيل الطلب" : "Order Details"}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {detailFields.map(([label, value]) => (
                  <div key={label} style={{ borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 8px" }}>
                    <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                    <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 800, wordBreak: "break-word", lineHeight: 1.3 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
                <button
                  onClick={() => handleAdminOrderSetStage(detailOrder, Math.min(STATUS_STEP_KEYS.length - 1, (Number(dStageIndex) || 0) + 1))}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#166534)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {dBusy ? (lang === "ar" ? "جارٍ..." : "...") : (lang === "ar" ? "المرحلة التالية" : "Next Stage")}
                </button>
                <button
                  onClick={() => handleAdminOrderSetStage(detailOrder, 0)}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f59e0b,#b45309)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {lang === "ar" ? "إرجاع للبداية" : "Reset Stage"}
                </button>
                <button
                  onClick={() => handleAdminOrderEditDetails(detailOrder)}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {lang === "ar" ? "تعديل البيانات" : "Edit Data"}
                </button>
                <button
                  onClick={() => handleAdminOrderClearReview(detailOrder)}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#4c1d95)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {lang === "ar" ? "حذف التقييم" : "Delete Review"}
                </button>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => { if (!hasWa) { e.preventDefault(); setAdminOrdersError(lang === "ar" ? "لا يوجد رقم واتساب." : "No WhatsApp number."); } }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", padding: "9px 8px", borderRadius: 10, marginBottom: 7,
                  border: "1px solid rgba(37,211,102,0.45)", background: "rgba(37,211,102,0.14)",
                  color: "#4ade80", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif",
                  textDecoration: "none", opacity: hasWa ? 1 : 0.45, cursor: hasWa ? "pointer" : "not-allowed",
                }}
              >
                ☏ {lang === "ar" ? "متابعة عبر واتساب" : "Follow up via WhatsApp"}
              </a>

              <button
                onClick={() => handleAdminDeleteOrder(detailOrder)}
                disabled={dBusy}
                style={{ width: "100%", padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
              >
                {lang === "ar" ? "🗑️ حذف الطلب نهائيًا" : "🗑️ Delete Order Permanently"}
              </button>
            </div>
          );
        })()}

        <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(34,197,94,0.32)", background: "rgba(255,255,255,0.04)", padding: "10px 10px 12px", display: (adminPanelSection === "providers" || adminPanelSection === "providerDetails") ? "block" : "none" }}>
          <div style={{ marginBottom: 8, color: "#bbf7d0", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>{lang === "ar" ? "طلبات مقدمي الخدمات" : "Service Provider Requests"}</span>
            <span style={{ color: "#bbf7d0", fontSize: 10, fontWeight: 800 }}>
              {filteredAdminProviderRequestsForView.length} / {providerRequestsVisible.length}
            </span>
          </div>

          <input
            value={adminProviderRequestsQuery}
            onChange={(event) => setAdminProviderRequestsQuery(event.target.value)}
            placeholder={lang === "ar" ? "بحث بالاسم أو السيريال أو الإيميل" : "Search by name, serial, or email"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 11, fontWeight: 700, padding: "8px 10px", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}
          />

          {!!adminProviderRequestsError && (
            <div style={{ marginBottom: 8, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 12, padding: "8px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.6, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {adminProviderRequestsError}
            </div>
          )}

          {adminPanelSection === "providerDetails" && selectedAdminProviderRequest ? (
            <div style={{ display: "grid", gap: 7 }}>
              <div style={{ borderRadius: 14, border: "1px solid rgba(74,222,128,0.45)", background: "rgba(255,255,255,0.05)", padding: "10px" }}>
                <div style={{ color: "#f8fafc", fontSize: 12, fontWeight: 900, marginBottom: 8 }}>
                  {lang === "ar" ? "تفاصيل مقدم الخدمة" : "Service Provider Details"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    [lang === "ar" ? "الاسم" : "Name", selectedAdminProviderRequest?.providerNameValue || selectedAdminProviderRequest?.providerName || selectedAdminProviderRequest?.officeName || "—"],
                    [lang === "ar" ? "السيريال" : "Serial", selectedAdminProviderRequest?.serialLabel || selectedAdminProviderRequest?.id || "—"],
                    [lang === "ar" ? "الإيميل" : "Email", selectedAdminProviderRequest?.emailValue || selectedAdminProviderRequest?.email || "—"],
                    [lang === "ar" ? "الهاتف" : "Phone", selectedAdminProviderRequest?.phone || "—"],
                    [lang === "ar" ? "واتساب" : "WhatsApp", selectedAdminProviderRequest?.whatsapp || "—"],
                    [lang === "ar" ? "الدولة" : "Country", selectedAdminProviderRequest?.countryValue || selectedAdminProviderRequest?.country || "—"],
                    [lang === "ar" ? "المدينة" : "City", selectedAdminProviderRequest?.city || "—"],
                    [lang === "ar" ? "الجنسية" : "Nationality", selectedAdminProviderRequest?.nationalityValue || selectedAdminProviderRequest?.nationality || "—"],
                    [lang === "ar" ? "السجل التجاري" : "Commercial Register", selectedAdminProviderRequest?.commercialRegister || "—"],
                    [lang === "ar" ? "البطاقة الضريبية" : "Tax Card", selectedAdminProviderRequest?.taxCard || "—"],
                    [lang === "ar" ? "رابط البورتفوليو" : "Portfolio", selectedAdminProviderRequest?.portfolioLink || "—"],
                    [lang === "ar" ? "التاريخ" : "Created At", selectedAdminProviderRequest?.createdAtLabel || "—"],
                  ].map(([label, value]) => (
                    <div key={`${label}-${value}`} style={{ borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 7px" }}>
                      <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                      <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, wordBreak: "break-word", lineHeight: 1.35 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 7, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "7px" }}>
                  <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{lang === "ar" ? "الخدمات" : "Services"}</div>
                  <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, lineHeight: 1.45 }}>
                    {((selectedAdminProviderRequest?.servicesValue || selectedAdminProviderRequest?.services || []).join(" • ")) || (lang === "ar" ? "لا توجد خدمات" : "No services")}
                  </div>
                </div>

                <div style={{ marginTop: 7, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "7px" }}>
                  <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{lang === "ar" ? "الوصف" : "Description"}</div>
                  <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, lineHeight: 1.45, wordBreak: "break-word" }}>
                    {selectedAdminProviderRequest?.notes || "—"}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                  {(() => {
                    const statusValue = String(selectedAdminProviderRequest?.statusValue || selectedAdminProviderRequest?.status || "pending").toLowerCase();
                    const detailId = String(selectedAdminProviderRequest?.id || "").trim();
                    const busy = adminProviderActionBusyId === detailId;

                    if (statusValue === "pending") {
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <button onClick={() => handleAdminProviderDecision(selectedAdminProviderRequest, "approved")} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#166534)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "اعتماد" : "Approve")}
                          </button>
                          <button onClick={() => handleAdminProviderDecision(selectedAdminProviderRequest, "rejected")} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "رفض" : "Reject")}
                          </button>
                        </div>
                      );
                    }

                    if (statusValue === "approved") {
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <button onClick={() => handleAdminProviderBlock(selectedAdminProviderRequest)} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f97316,#b45309)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "🚫 حظر" : "🚫 Block")}
                          </button>
                          <button onClick={() => handleAdminProviderDelete(selectedAdminProviderRequest)} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "🗑️ حذف" : "🗑️ Delete")}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button onClick={() => handleAdminProviderDelete(selectedAdminProviderRequest)} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                        {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "🗑️ حذف الطلب" : "🗑️ Delete Request")}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 7 }}>
              {filteredAdminProviderRequestsForView.map((entry, index) => {
                const requestId = String(entry?.id || "").trim();
                const statusValue = String(entry?.statusValue || entry?.status || "pending").toLowerCase();
                const statusLabel = statusValue === "approved"
                  ? (lang === "ar" ? "معتمد" : "Approved")
                  : statusValue === "rejected"
                    ? (lang === "ar" ? "مرفوض" : "Rejected")
                    : statusValue === "blocked"
                      ? (lang === "ar" ? "محظور" : "Blocked")
                      : (lang === "ar" ? "قيد المراجعة" : "Pending");
                const statusColor = statusValue === "approved" ? "#22c55e" : statusValue === "rejected" ? "#ef4444" : statusValue === "blocked" ? "#f97316" : "#f59e0b";

                return (
                  <button
                    key={requestId || `provider-${index + 1}`}
                    onClick={() => {
                      setAdminSelectedProviderRequestId(requestId);
                      setAdminPanelSection("providerDetails");
                    }}
                    style={{ width: "100%", textAlign: dir === "rtl" ? "right" : "left", borderRadius: 14, border: `1px solid ${statusColor}44`, background: "rgba(255,255,255,0.05)", padding: "9px", cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 900, lineHeight: 1.35 }}>
                          {lang === "ar" ? `مقدم خدمة رقم ${index + 1}` : `Provider #${index + 1}`}
                        </div>
                        <div style={{ color: "#93c5fd", fontSize: 10, marginTop: 2 }}>{entry?.providerNameValue || entry?.officeName || "—"}</div>
                        <div style={{ color: "#cbd5e1", fontSize: 10, marginTop: 2 }}>
                          {lang === "ar" ? "السيريال" : "Serial"}: {entry?.serialLabel || requestId || "—"}
                        </div>
                      </div>
                      <div style={{ padding: "3px 8px", borderRadius: 999, background: `${statusColor}22`, border: `1px solid ${statusColor}66`, color: statusColor, fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>
                        {statusLabel}
                      </div>
                    </div>
                  </button>
                );
              })}

              {!adminProviderRequestsLoading && filteredAdminProviderRequestsForView.length === 0 && (
                <div style={{ borderRadius: 14, border: "1px dashed rgba(34,197,94,0.40)", background: "rgba(255,255,255,0.03)", padding: "12px 10px", textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 11, lineHeight: 1.7, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                  {lang === "ar" ? "لا توجد طلبات مزودي خدمات مطابقة للبحث." : "No matching service provider requests."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  const AuthPreview = () => (authPreviewOpen || (!authPreviewUser && !guestMode)) ? (
    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.84)", backdropFilter: "blur(8px)", alignItems: "center", overflow: "hidden", padding: 12 }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          position: "relative",
          margin: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
      <div
        style={{
          width: "min(100%, 408px)",
          maxWidth: "calc(100vw - 22px)",
          margin: "0 auto",
          borderRadius: 34,
          padding: authPreviewMode === "signup"
            ? (isCompactPhone ? "6px 14px 4px" : "9px 20px 6px")
            : (isCompactPhone ? "10px 14px 8px" : "14px 20px 10px"),
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          border: "1px solid rgba(212,175,55,0.34)",
          boxShadow: "0 24px 80px rgba(7, 15, 35, 0.6), 0 0 0 1px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {!!authPreviewUser && (
          <button
            onClick={closeAuthPreview}
            style={{
              position: "absolute",
              top: 14,
              right: dir === "rtl" ? "auto" : 14,
              left: dir === "rtl" ? 14 : "auto",
              border: "1px solid rgba(212,175,55,0.32)",
              background: "rgba(255,255,255,0.06)",
              color: "#f5d77b",
              borderRadius: 12,
              padding: "7px 12px",
              fontFamily: "'Cairo',sans-serif",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "إغلاق" : "Close"}
          </button>
        )}

        {authPreviewMode === "signup" && (
          <button
            type="button"
            onClick={() => {
              clearAuthPreviewFeedback();
              setAuthPreviewMode("login");
            }}
            style={{
              position: "absolute",
              top: 14,
              left: dir === "rtl" ? "auto" : 14,
              right: dir === "rtl" ? 14 : "auto",
              border: "1px solid rgba(212,175,55,0.32)",
              background: "rgba(255,255,255,0.06)",
              color: "#f5d77b",
              borderRadius: 12,
              padding: "7px 12px",
              fontFamily: "'Cairo',sans-serif",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {lang === "ar" ? "رجوع" : "Back"}
          </button>
        )}

        <div style={{ textAlign: "center", paddingTop: 0, paddingBottom: authPreviewMode === "signup" ? 1 : 2 }}>
          <img
            src={logo}
            alt="Trusted Offices"
            style={{
              width: authPreviewMode === "login"
                ? (isCompactPhone ? 124 : 152)
                : (isCompactPhone ? 86 : 106),
              height: authPreviewMode === "login"
                ? (isCompactPhone ? 124 : 152)
                : (isCompactPhone ? 86 : 106),
              objectFit: "contain",
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.38))",
              marginBottom: 2,
            }}
          />
          <div style={{ color: "#e7c55b", fontSize: isCompactPhone ? 22 : 26, fontWeight: 900, lineHeight: 1.05, fontFamily: "'Cairo',sans-serif" }}>
            {authPreviewMode === "login"
              ? (lang === "ar" ? "تسجيل الدخول" : "Login")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "إنشاء حساب" : "Create Account")
                : authPreviewMode === "otp"
                  ? (lang === "ar" ? "رمز التحقق" : "Verification Code")
                  : (lang === "ar" ? "استعادة الحساب" : "Recover Account")}
          </div>
          <div style={{ color: "rgba(245,215,123,0.92)", fontSize: 13, fontWeight: 700, marginTop: 1, letterSpacing: 0.2 }}>
            {authPreviewMode === "login"
              ? (lang === "ar" ? "مرحبًا" : "Welcome")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "انضم إلينا" : "Join Us")
                : authPreviewMode === "otp"
                  ? (lang === "ar" ? "أدخل الكود المرسل" : "Enter the sent code")
                  : (lang === "ar" ? "سنرسل لك رابط أو رمز الاستعادة" : "We will send a recovery link or code")}
          </div>
          {!!authPreviewUser && (
            <div style={{ marginTop: 10, color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? `متصل حاليًا: ${authPreviewUser.displayName || authPreviewUser.phoneNumber || authPreviewUser.email || authPreviewUser.uid}`
                : `Signed in as: ${authPreviewUser.displayName || authPreviewUser.phoneNumber || authPreviewUser.email || authPreviewUser.uid}`}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {authPreviewMode === "signup" && (
            <div style={authFieldShellStyle}>
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>✨</span>
              <input
                value={authPreviewName}
                onChange={(e) => setAuthPreviewName(e.target.value)}
                placeholder={lang === "ar" ? "الاسم الكامل" : "Full name"}
                style={authFieldInputStyle}
              />
            </div>
          )}
          {authPreviewMode !== "otp" && (
            <>
              <div style={authFieldShellStyle}>
                <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>👤</span>
                <input
                  value={authPreviewIdentifier}
                  onChange={(e) => setAuthPreviewIdentifier(e.target.value)}
placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email address"}
                  type="email"
                  inputMode="email"
                  style={{ ...authFieldInputStyle, direction: "rtl", textAlign: "right" }}
                />
              </div>

              {authPreviewMode !== "forgot" && (
              <div style={authFieldShellStyle}>
                <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>🔒</span>
                <input
                  type="password"
                  value={authPreviewPassword}
                  onChange={(e) => setAuthPreviewPassword(e.target.value)}
                  placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
                  style={authFieldInputStyle}
                />
              </div>
              )}
            </>
          )}

          {authPreviewMode === "signup" && (
            <div style={authFieldShellStyle}>
              <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: dir === "rtl" ? 15 : "auto", left: dir === "rtl" ? "auto" : 15, fontSize: 18, color: "#e7c55b", opacity: 0.95 }}>🛡️</span>
              <input
                type="password"
                value={authPreviewConfirmPassword}
                onChange={(e) => setAuthPreviewConfirmPassword(e.target.value)}
                placeholder={lang === "ar" ? "تأكيد كلمة المرور" : "Confirm password"}
                style={authFieldInputStyle}
              />
            </div>
          )}

          {authPreviewMode === "otp" && (
            <>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.78)", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar"
                  ? "أرسلنا رمز تحقق مكوّن من 6 أرقام إلى رقم الهاتف أو البريد المسجل."
                  : "We sent a 6-digit verification code to your registered phone or email."}
              </div>
              <div style={{ display: "flex", gap: 8, direction: "ltr", justifyContent: "center" }}>
                {authPreviewOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { authPreviewOtpRefs.current[index] = el; }}
                    value={digit}
                    maxLength={1}
                    inputMode="numeric"
                    type="tel"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...authPreviewOtp];
                      next[index] = val;
                      setAuthPreviewOtp(next);
                      if (val && index < 5) {
                        authPreviewOtpRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        authPreviewOtpRefs.current[index - 1]?.focus();
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      maxWidth: 44,
                      height: 52,
                      borderRadius: 16,
                      border: "1.5px solid rgba(212,175,55,0.65)",
                      background: "rgba(255,255,255,0.03)",
                      color: "#f8fafc",
                      boxSizing: "border-box",
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 900,
                      outline: "none",
                      fontFamily: "'Cairo',sans-serif",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <div
                onClick={() => {
                  if (authPreviewOtpResendTimer > 0) return;
                  const phone = authPreviewPhoneFlow?.phoneNumber;
                  if (!phone) return;
                  setAuthPreviewError("");
                  setAuthPreviewSuccess("");
                  setAuthPreviewOtpResendTimer(30);
                  clearInterval(authPreviewOtpResendIntervalRef.current);
                  authPreviewOtpResendIntervalRef.current = setInterval(() => {
                    setAuthPreviewOtpResendTimer((v) => {
                      if (v <= 1) { clearInterval(authPreviewOtpResendIntervalRef.current); return 0; }
                      return v - 1;
                    });
                  }, 1000);

                  const isNativePhoneFlow = !!authPreviewPhoneFlow?.native;
                  const resendPromise = isNativePhoneFlow
                    ? startNativePhoneSignIn(phone, { timeout: 60, resendCode: true })
                    : getAuthPreviewRecaptcha()
                      .then((verifier) => sendPhoneVerificationCode(phone, verifier));

                  resendPromise
                    .then((result) => {
                      if (isNativePhoneFlow) {
                        if (result?.verificationId) {
                          setAuthPreviewPhoneFlow((prev) => ({ ...prev, verificationId: result.verificationId }));
                        }
                      } else if (result) {
                        authPhoneConfirmationRef.current = result;
                      }
                      setAuthPreviewOtp(["", "", "", "", "", ""]);
                      authPreviewOtpRefs.current[0]?.focus();
                      setAuthPreviewSuccess(
                        lang === "ar"
                          ? "تم إرسال رمز تحقق جديد."
                          : "A new verification code has been sent."
                      );
                    })
                    .catch((error) => {
                      const errorCode = String(error?.code || error?.message || "").toLowerCase();
                      if (
                        errorCode.includes("blocked all requests")
                        || errorCode.includes("blocked all requests for this device")
                        || errorCode.includes("device-request-limit-exceeded")
                      ) {
                        setAuthPreviewError(
                          lang === "ar"
                            ? "تم حظر التحقق برقم الهاتف مؤقتًا على هذا الجهاز. يمكنك المحاولة برقم الهاتف مرة أخرى بعد 24 ساعة، ويمكنك تسجيل الدخول الآن باستخدام البريد الإلكتروني."
                            : "Phone verification is temporarily blocked on this device. You can try phone sign-in again after 24 hours, and you can sign in now using your email."
                        );
                      } else if (errorCode.includes("too-many-requests") || errorCode.includes("quota-exceeded")) {
                        setAuthPreviewError(
                          lang === "ar"
                            ? "تم تجاوز عدد محاولات الإرسال مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى."
                            : "Too many resend attempts were made. Please wait and try again."
                        );
                      } else {
                        setAuthPreviewError(
                          lang === "ar"
                            ? "تعذر إعادة إرسال الرمز الآن. حاول مرة أخرى بعد قليل."
                            : "Unable to resend the code right now. Please try again shortly."
                        );
                      }
                    });
                }}
                style={{ textAlign: "center", color: authPreviewOtpResendTimer > 0 ? "rgba(245,215,123,0.45)" : "rgba(245,215,123,0.88)", fontSize: 12, fontWeight: 700, cursor: authPreviewOtpResendTimer > 0 ? "default" : "pointer" }}
              >
                {authPreviewOtpResendTimer > 0
                  ? (lang === "ar" ? `إعادة الإرسال خلال ${authPreviewOtpResendTimer}ث` : `Resend in ${authPreviewOtpResendTimer}s`)
                  : (lang === "ar" ? "إعادة إرسال الرمز" : "Resend code")}
              </div>
            </>
          )}
        </div>

        {!!authPreviewError && (
          <div style={{ marginTop: 14, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 14, padding: "10px 12px", textAlign: "center", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {authPreviewError}
          </div>
        )}

        {!!authPreviewSuccess && (
          <div style={{ marginTop: 14, color: "#dcfce7", background: "rgba(20,83,45,0.24)", border: "1px solid rgba(74,222,128,0.28)", borderRadius: 14, padding: "10px 12px", textAlign: "center", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {authPreviewSuccess}
          </div>
        )}

        {authPreviewMode === "login" && (
          <div
            onClick={() => {
              clearAuthPreviewFeedback();
              setAuthPreviewMode("forgot");
            }}
            style={{ marginTop: 10, color: "rgba(245,215,123,0.88)", fontSize: 13, fontWeight: 700, textAlign: dir === "rtl" ? "right" : "left", cursor: "pointer" }}
          >
            {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </div>
        )}

        {authPreviewMode === "login" ? (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={handleAuthPreviewPrimaryAction}
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #e7c55b, #c99a23)",
                color: "#11244f",
                fontSize: 16,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
                cursor: "pointer",
                boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
                opacity: authPreviewBusy ? 0.72 : 1,
              }}
              disabled={authPreviewBusy}
            >
              {authPreviewBusy ? (lang === "ar" ? "جارٍ المتابعة..." : "Please wait...") : (lang === "ar" ? "دخول" : "Login")}
            </button>

            <button
              type="button"
              onClick={handleAuthPreviewGuestMode}
              style={{
                width: "100%",
                padding: "14px 10px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #e7c55b, #c99a23)",
                color: "#11244f",
                fontSize: 14,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
                cursor: "pointer",
                boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
                opacity: authPreviewBusy ? 0.72 : 1,
              }}
              disabled={authPreviewBusy}
            >
              {lang === "ar" ? "دخول كضيف" : "Guest Login"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAuthPreviewPrimaryAction}
            style={{
              width: "100%",
              marginTop: 18,
              padding: "14px 20px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #e7c55b, #c99a23)",
              color: "#11244f",
              fontSize: 18,
              fontWeight: 900,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              boxShadow: "0 14px 28px rgba(201,154,35,0.24)",
              opacity: authPreviewBusy ? 0.72 : 1,
            }}
            disabled={authPreviewBusy}
          >
            {authPreviewBusy
              ? (lang === "ar" ? "جارٍ المتابعة..." : "Please wait...")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "إنشاء الحساب" : "Create Account")
                : authPreviewMode === "otp"
                  ? (lang === "ar" ? "تأكيد الرمز" : "Verify Code")
                  : (lang === "ar" ? "إرسال رمز الاستعادة" : "Send Recovery Code")}
          </button>
        )}

        {authPreviewMode !== "otp" && authPreviewMode !== "forgot" && (
          <>
            <div style={{ marginTop: 18, textAlign: "center", color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 700 }}>
              {authPreviewMode === "login"
                ? (lang === "ar" ? "أو الدخول عبر" : "Or continue with")
                : (lang === "ar" ? "أو التسجيل عبر" : "Or sign up with")}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              <button
                type="button"
                onClick={handleAuthPreviewGoogle}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(212,175,55,0.62)",
                  background: "rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
                  opacity: authPreviewBusy ? 0.72 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                disabled={authPreviewBusy}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3.4 14.8 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.8S6.8 21.2 12 21.2c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12Z"/>
                  <path fill="#34A853" d="M3.7 7.2l3.2 2.4C7.7 8 9.7 6.6 12 6.6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3.4 14.8 2.4 12 2.4c-3.7 0-6.9 2.1-8.3 4.8Z"/>
                  <path fill="#FBBC05" d="M12 21.2c2.7 0 5-.9 6.6-2.5l-3.1-2.5c-.8.6-1.9 1-3.5 1-4 0-5.2-2.6-5.5-3.9l-3.2 2.5c1.4 2.8 4.4 5.4 8.7 5.4Z"/>
                  <path fill="#4285F4" d="M21.1 13.9c0-.5 0-.9-.1-1.3H12v3.9h5.5c-.3 1.2-1.1 2.1-2 2.7l3.1 2.5c1.8-1.7 2.5-4.2 2.5-7.8Z"/>
                </svg>
              </button>
            </div>

          </>
        )}

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              clearAuthPreviewFeedback();
              setAuthPreviewOtp(["", "", "", "", "", ""]);
              setAuthPreviewMode((prev) => (prev === "login" ? "signup" : prev === "signup" ? "login" : "login"));
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "rgba(245,215,123,0.92)",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Cairo',sans-serif",
              cursor: "pointer",
              textAlign: dir === "rtl" ? "right" : "left",
              padding: 0,
            }}
          >
            {authPreviewMode === "login"
              ? (lang === "ar" ? "ليس لديك حساب؟ إنشاء حساب" : "No account? Create one")
              : authPreviewMode === "signup"
                ? (lang === "ar" ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Already have an account? Login")
                : (lang === "ar" ? "العودة إلى شاشة الدخول" : "Back to login")}
          </button>
          <div
            style={{
              display: "inline-grid",
              gap: 6,
              flexShrink: 0,
              transform: "translateY(-24px)",
            }}
          >
            {[
              { key: "ar", label: "ع" },
              { key: "en", label: "E" },
            ].map((option) => {
              const active = lang === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setLang(option.key)}
                  style={{
                    width: 42,
                    height: 34,
                    borderRadius: 12,
                    border: active ? "1px solid rgba(231,197,91,0.58)" : "1px solid rgba(212,175,55,0.24)",
                    background: active
                      ? "linear-gradient(180deg, rgba(25,55,117,0.98), rgba(11,31,74,0.98))"
                      : "linear-gradient(180deg, rgba(18,43,99,0.92), rgba(11,31,74,0.92))",
                    color: active ? "#f5d77b" : "rgba(245,215,123,0.78)",
                    fontSize: 14,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 0 18px rgba(231,197,91,0.18), inset 0 1px 0 rgba(255,255,255,0.08)"
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        {authPreviewMode !== "otp" && (
          <div style={{ marginTop: -2, width: "min(100%, 270px)", marginInline: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                lang === "ar"
                  ? "مرحبًا، أواجه مشكلة في تسجيل الدخول داخل تطبيق مكاتب السفريات الموثوقة."
                  : "Hello, I am facing a login issue in the Trusted Travel Offices app."
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "100%",
                height: isCompactPhone ? 36 : 37,
                borderRadius: 12,
                border: "1px solid rgba(37,211,102,0.45)",
                background: "linear-gradient(135deg, rgba(16,99,53,0.44), rgba(20,150,71,0.34))",
                color: "#eafff1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none",
                padding: "0 10px",
                boxSizing: "border-box",
                boxShadow: "0 0 12px rgba(37,211,102,0.22)",
                fontSize: 12,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              <span>{lang === "ar" ? "مشاكل التسجيل" : "Login issues"}</span>
              <span style={{ fontSize: 15, lineHeight: 1 }}>☏</span>
            </a>

            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              style={{
                width: "100%",
                height: isCompactPhone ? 36 : 37,
                borderRadius: 12,
                border: "1px solid rgba(248,113,113,0.55)",
                background: "linear-gradient(135deg, rgba(239,68,68,0.32), rgba(127,29,29,0.34))",
                color: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(239,68,68,0.28)",
                fontSize: 13,
                fontWeight: 900,
                fontFamily: "'Cairo',sans-serif",
                whiteSpace: "nowrap",
              }}
              aria-label={lang === "ar" ? "خروج من التطبيق" : "Exit app"}
            >
              <span style={{ display: "inline-block", lineHeight: 1, color: "#fee2e2" }}>{lang === "ar" ? "خروج" : "Exit"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <line x1="12" y1="3" x2="12" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div id="auth-phone-recaptcha" style={{ width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }} />
      </div>
      </div>
    </div>
  ) : null;

  if (!authPreviewUser && !guestMode) {
    return (
      <div
        dir={dir}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Cairo',sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 18%, rgba(212,175,55,0.14), transparent 32%), radial-gradient(circle at 80% 16%, rgba(255,255,255,0.10), transparent 24%)",
            pointerEvents: "none",
          }}
        />
        {showExitConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,10,0.68)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}>
            <div style={{ background: dark ? "linear-gradient(180deg, rgba(68,18,18,0.96) 0%, rgba(34,12,12,0.98) 100%)" : "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 24, padding: "28px 24px", maxWidth: 332, width: "100%", textAlign: "center", boxShadow: "0 18px 56px rgba(0,0,0,0.34), 0 0 18px rgba(239,68,68,0.20)" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: dark ? "#fecaca" : "#b91c1c", fontFamily: "'Cairo',sans-serif", marginBottom: 18 }}>
                {lang === "ar" ? "هل تريد الخروج من التطبيق؟" : "Do you want to exit the app?"}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowExitConfirm(false)}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, border: dark ? "1px solid rgba(254,226,226,0.30)" : "1px solid rgba(185,28,28,0.36)", background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)", color: dark ? "#fee2e2" : "#7f1d1d", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
                  {lang === "ar" ? "لا" : "No"}
                </button>
                <button onClick={() => CapApp.exitApp()}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, border: "1px solid rgba(248,113,113,0.48)", background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "#ffffff", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: "0 0 14px rgba(239,68,68,0.35)" }}>
                  {lang === "ar" ? "نعم" : "Yes"}
                </button>
              </div>
            </div>
          </div>
        )}
        {AuthPreview()}
      </div>
    );
  }

  // ── PAID SERVICES GRID ─────────────────────────────────────────────────────
  const PaidServicesSection = ({ services, title, sub }) => (
    <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, margin: "12px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.gold, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 11, color: t.subText, marginBottom: 12 }}>{sub}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {services.map((svc, i) => (
          <button key={i} onClick={() => openServiceModal(svc.label)}
            style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s", fontFamily: "'Cairo',sans-serif" }}>
            <span style={{ fontSize: 26 }}>{svc.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.text, textAlign: "center", lineHeight: 1.4 }}>{svc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ══ DESKTOP SIDEBAR ══ */
  const DesktopSidebar = () => (
    <aside style={{
      position: "fixed", top: 0, right: 0, width: 240, height: "100vh", zIndex: 150,
      display: "flex", flexDirection: "column", direction: "rtl",
      background: dark ? "linear-gradient(180deg,rgba(4,10,22,0.97),rgba(2,6,18,0.98))" : "linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,255,0.98))",
      borderLeft: `1px solid ${dark ? "rgba(212,175,55,0.18)" : "rgba(26,86,219,0.12)"}`,
      boxShadow: dark ? "-6px 0 32px rgba(0,0,0,0.4)" : "-6px 0 32px rgba(15,27,58,0.08)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 18px", borderBottom: `1px solid ${dark ? "rgba(212,175,55,0.12)" : "rgba(26,86,219,0.08)"}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(145deg,#0a2060,#0f3080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: "0 4px 18px rgba(212,175,55,0.4)" }}>🏢</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: dark ? "#f5d77b" : "#0a2060", fontFamily: "'Cairo',sans-serif", lineHeight: 1.3 }}>{lang === "ar" ? "مكاتب السفريات" : "Travel Offices"}</div>
          <div style={{ fontSize: 10, color: dark ? "rgba(212,175,55,0.6)" : "rgba(10,32,96,0.5)", fontFamily: "'Cairo',sans-serif" }}>{lang === "ar" ? "الموثوقة" : "Trusted"}</div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ padding: "16px 10px", flex: 1 }}>
        {[
          { key: "home",     icon: "🏠", label: tx.navHome,     action: () => goToCountryLanding() },
          { key: "cv",       icon: "📄", label: tx.navCV,       action: () => { setMainTab("cv"); setCvMode(null); setSelectedCvPackage(null); setCvBuilderScreen("menu"); setSelectedCvBuilderOrder(null); setCvStep(0); setCvUnlocked(false); } },
          { key: "settings", icon: "⚙️", label: tx.navSettings, action: () => setMainTab("settings") },
        ].map(tab => {
          const active = mainTab === tab.key;
          return (
            <button key={tab.key} onClick={tab.action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 13, marginBottom: 5, border: active ? `1px solid ${dark ? "rgba(212,175,55,0.38)" : "rgba(26,86,219,0.22)"}` : "1px solid transparent", background: active ? (dark ? "rgba(212,175,55,0.10)" : "rgba(26,86,219,0.07)") : "transparent", color: active ? (dark ? "#f5d77b" : "#1a56db") : (dark ? "rgba(226,232,240,0.6)" : "rgba(15,27,58,0.5)"), cursor: "pointer", textAlign: "right", fontFamily: "'Cairo',sans-serif", transition: "all 0.18s" }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{ fontSize: 13, fontWeight: active ? 900 : 700 }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      {/* Controls */}
      <div style={{ padding: "14px 10px", borderTop: `1px solid ${dark ? "rgba(212,175,55,0.12)" : "rgba(26,86,219,0.08)"}` }}>
        <button onClick={() => setDark(d => !d)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 11, border: `1px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(15,27,58,0.09)"}`, background: "transparent", color: dark ? "rgba(226,232,240,0.75)" : "rgba(15,27,58,0.65)", cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>
          <span style={{ fontSize: 15 }}>{dark ? "☀️" : "🌙"}</span>
          <span>{dark ? (lang === "ar" ? "الوضع النهاري" : "Light Mode") : (lang === "ar" ? "الوضع الليلي" : "Dark Mode")}</span>
        </button>
        <button onClick={() => setLang(l => l === "ar" ? "en" : "ar")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 11, border: `1px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(15,27,58,0.09)"}`, background: "transparent", color: dark ? "rgba(226,232,240,0.75)" : "rgba(15,27,58,0.65)", cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          <span style={{ fontSize: 15 }}>🌐</span>
          <span>{lang === "ar" ? "English" : "عربي"}</span>
        </button>
        {authPreviewUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 11, background: dark ? "rgba(212,175,55,0.07)" : "rgba(26,86,219,0.05)", border: `1px solid ${dark ? "rgba(212,175,55,0.18)" : "rgba(26,86,219,0.11)"}` }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#1a56db,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
              {(authPreviewUser.displayName || authPreviewUser.email || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: dark ? "#e2e8f0" : "#0f1b3a", fontFamily: "'Cairo',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{authPreviewUser.displayName || (lang === "ar" ? "مستخدم" : "User")}</div>
              <div style={{ fontSize: 10, color: dark ? "rgba(212,175,55,0.65)" : "rgba(26,86,219,0.55)", fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{authPreviewUser.email || authPreviewUser.phoneNumber || ""}</div>
            </div>
          </div>
        ) : (
          <button onClick={() => { setAuthPreviewMode("login"); setAuthPreviewOpen(true); setAuthPreviewError(""); setAuthPreviewSuccess(""); }} style={{ width: "100%", padding: "10px 14px", borderRadius: 11, border: "1px solid rgba(212,175,55,0.38)", background: dark ? "rgba(212,175,55,0.09)" : "rgba(212,175,55,0.07)", color: dark ? "#f5d77b" : "#7c5100", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: "pointer" }}>
            {lang === "ar" ? "🔐 تسجيل الدخول" : "🔐 Sign In"}
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div dir={dir} className="app-root" style={{ ...styles.root, background: t.bgGradient || t.bg, color: t.text }}>
      {isDesktop && <DesktopSidebar />}
      {/* ── Cinematic Background — Floating Light Orbs ─────────────────── */}
      <div className="cinematic-bg">
        {/* Primary orbs */}
        <div className="cinematic-orb cinematic-orb-1" style={{ opacity: dark ? 0.28 : 0.14 }} />
        <div className="cinematic-orb cinematic-orb-2" style={{ opacity: dark ? 0.22 : 0.1  }} />
        <div className="cinematic-orb cinematic-orb-3" style={{ opacity: dark ? 0.18 : 0.08 }} />
        <div className="cinematic-orb cinematic-orb-4" style={{ opacity: dark ? 0.2  : 0.09 }} />
        {/* Subtle particle glow dots */}
        {dark && <>
          <div className="particle-dot" style={{ top: "18%",  left: "12%",  animationDelay: "0s",    animationDuration: "5s"  }} />
          <div className="particle-dot" style={{ top: "42%",  left: "78%",  animationDelay: "1.2s",  animationDuration: "6s"  }} />
          <div className="particle-dot" style={{ top: "72%",  left: "30%",  animationDelay: "2.4s",  animationDuration: "4.5s"}} />
          <div className="particle-dot" style={{ top: "85%",  left: "65%",  animationDelay: "0.8s",  animationDuration: "5.5s"}} />
          <div className="particle-dot" style={{ top: "25%",  left: "50%",  animationDelay: "1.8s",  animationDuration: "7s",   background: "rgba(59,130,246,0.5)", boxShadow: "0 0 6px rgba(59,130,246,0.4)"  }} />
          <div className="particle-dot" style={{ top: "60%",  left: "88%",  animationDelay: "3s",    animationDuration: "5.2s", background: "rgba(139,92,246,0.5)", boxShadow: "0 0 6px rgba(139,92,246,0.4)" }} />
        </>}
      </div>
      <div style={{ ...styles.bgPattern, opacity: dark ? 0.6 : 0.2 }} />

      {/* ── EXIT CONFIRM MODAL ───────────────────────────────────────────── */}
      {showExitConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,10,0.68)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}>
          <div style={{ background: dark ? "linear-gradient(180deg, rgba(68,18,18,0.96) 0%, rgba(34,12,12,0.98) 100%)" : "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 24, padding: "28px 24px", maxWidth: 332, width: "100%", textAlign: "center", boxShadow: "0 18px 56px rgba(0,0,0,0.34), 0 0 18px rgba(239,68,68,0.20)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: dark ? "#fecaca" : "#b91c1c", fontFamily: "'Cairo',sans-serif", marginBottom: 18 }}>
              {lang === "ar" ? "هل تريد الخروج من التطبيق؟" : "Do you want to exit the app?"}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowExitConfirm(false)}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: dark ? "1px solid rgba(254,226,226,0.30)" : "1px solid rgba(185,28,28,0.36)", background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)", color: dark ? "#fee2e2" : "#7f1d1d", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "لا" : "No"}
              </button>
              <button onClick={() => CapApp.exitApp()}
                style={{ flex: 1, padding: "13px", borderRadius: 14, border: "1px solid rgba(248,113,113,0.48)", background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "#ffffff", fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: "0 0 14px rgba(239,68,68,0.35)" }}>
                {lang === "ar" ? "نعم" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {AuthPreview()}
      {AccountPanel()}
      {AdminSecurityModal()}
      {AdminPanel()}
      {AdminAddOfficeModal()}
      {SignOutConfirmPanel()}
      {UsageGuideModal()}

      {/* ── OFFICE DETAIL VIEW ───────────────────────────────────────────── */}
      {selectedOffice && (() => {
        const off = selectedOffice;
        const officeNameLabel = getOfficeLabel(off.name);
        const officeAddressLabel = getOfficeAddressLabel(off.address);
        const officeGovLabel = getGovernorateLabel(off.gov);
        const officeCountryLabel = String(off?.country || selectedCountry || "");
        const mapPlaceId = String(off?.mapPlaceId || "").trim();
        const mapLatValue = String(off?.mapLat ?? "").trim();
        const mapLngValue = String(off?.mapLng ?? "").trim();
        const mapLat = mapLatValue ? Number(mapLatValue) : NaN;
        const mapLng = mapLngValue ? Number(mapLngValue) : NaN;
        const hasMapCoordinates = Number.isFinite(mapLat) && Number.isFinite(mapLng);
        const mapQueryText = `${officeCountryLabel} ${officeNameLabel} ${officeAddressLabel}`.trim();
        const mapQuery = encodeURIComponent(mapQueryText);
        const mapUrl = mapPlaceId
          ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}&query_place_id=${encodeURIComponent(mapPlaceId)}`
          : hasMapCoordinates
            ? `https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`
            : (String(off?.mapUrl || "").trim() || `https://www.google.com/maps/search/${mapQuery}`);
        const rating = officeRatings[off.id] || { avg: 0, count: 0 };
        const offReviews = reviews[off.id] || [];
        const currentReviewerUid = String(authPreviewUser?.uid || "").trim();
        const userAlreadyReviewedOffice = !!currentReviewerUid
          && offReviews.some((entry) => String(entry?.reviewerUid || "").trim() === currentReviewerUid);
        const isManuallyAddedOffice = adminAddedOffices.some((entry) => Number(entry?.id) === Number(off.id));
        const officeRegistrationType = String(off?.registrationType || "").trim();
        const officeRegistrationNumber = String(off?.registrationNumber || "").trim();
        const officeTaxNumber = String(off?.taxNumber || "").trim();
        const officeIssuingAuthority = String(off?.issuingAuthority || "").trim();
        const officeOfficialSourceUrl = String(off?.officialSourceUrl || "").trim();
        const officeOfficialVerificationStatus = String(off?.officialVerificationStatus || "").trim();
        const officeMapVerificationStatus = String(off?.mapVerificationStatus || "").trim();
        const hasAdminVerificationData = !!(
          officeRegistrationType
          || officeRegistrationNumber
          || officeTaxNumber
          || officeIssuingAuthority
          || officeOfficialSourceUrl
          || officeOfficialVerificationStatus
          || officeMapVerificationStatus
          || mapPlaceId
          || mapLatValue
          || mapLngValue
        );

        const promptOfficeReviewAuth = () => {
          setOfficeReviewError(
            lang === "ar"
              ? "يجب تسجيل الدخول أو إنشاء حساب جديد لإضافة تقييم وتجربتك."
              : "You need to sign in or create a new account to submit your review and experience."
          );
          setShowExitConfirm(false);
          setAuthPreviewMode("login");
          setAuthPreviewOpen(true);
          setAuthPreviewError("");
          setAuthPreviewSuccess("");
        };

        const openAdminOfficeEditor = () => {
          if (!isAdminUser) return;
          setAdminOfficeDraft({
            name: String(off.name || ""),
            license: String(off.license || ""),
            address: String(off.address || ""),
            gov: String(off.gov || ""),
            registrationType: String(off.registrationType || ""),
            registrationNumber: String(off.registrationNumber || ""),
            taxNumber: String(off.taxNumber || ""),
            issuingAuthority: String(off.issuingAuthority || ""),
            officialSourceUrl: String(off.officialSourceUrl || ""),
            officialVerificationStatus: String(off.officialVerificationStatus || ""),
            mapPlaceId: String(off.mapPlaceId || ""),
            mapLat: String(off.mapLat ?? ""),
            mapLng: String(off.mapLng ?? ""),
            mapVerificationStatus: String(off.mapVerificationStatus || ""),
          });
          setAdminOfficeEditError("");
          setAdminOfficeEditOpen(true);
        };

        const saveAdminOfficeEditor = async () => {
          if (!isAdminUser) return;
          const isEgyptOffice = String(off?.country || selectedCountry || "") === "مصر";
          const nextName = String(adminOfficeDraft.name || "").trim();
          const nextLicenseRaw = String(adminOfficeDraft.license || "").trim();
          const nextLicense = Number(nextLicenseRaw.replace(/[^0-9]/g, ""));
          const nextAddress = String(adminOfficeDraft.address || "").trim();
          const nextGov = String(adminOfficeDraft.gov || "").trim();
          const nextRegistrationType = String(adminOfficeDraft.registrationType || "").trim();
          const nextRegistrationNumber = String(adminOfficeDraft.registrationNumber || "").trim();
          const nextTaxNumber = String(adminOfficeDraft.taxNumber || "").trim();
          const nextIssuingAuthority = String(adminOfficeDraft.issuingAuthority || "").trim();
          const nextOfficialSourceUrlRaw = String(adminOfficeDraft.officialSourceUrl || "").trim();
          const nextOfficialVerificationStatus = String(adminOfficeDraft.officialVerificationStatus || "").trim();
          const nextMapPlaceId = String(adminOfficeDraft.mapPlaceId || "").trim();
          const nextMapLatRaw = String(adminOfficeDraft.mapLat || "").trim();
          const nextMapLngRaw = String(adminOfficeDraft.mapLng || "").trim();
          const nextMapVerificationStatus = String(adminOfficeDraft.mapVerificationStatus || "").trim();
          const nextOfficialSourceUrl = nextOfficialSourceUrlRaw
            ? (/^https?:\/\//i.test(nextOfficialSourceUrlRaw) ? nextOfficialSourceUrlRaw : `https://${nextOfficialSourceUrlRaw}`)
            : "";

          if (!nextName || !nextAddress || !nextGov || (isEgyptOffice && !nextLicenseRaw)) {
            setAdminOfficeEditError(
              lang === "ar"
                ? "أدخل اسم المكتب ورقم الترخيص والعنوان والمحافظة بشكل صحيح."
                : "Please provide office name, license number, address, and governorate."
            );
            return;
          }

          if (isEgyptOffice && (!Number.isFinite(nextLicense) || nextLicense <= 0)) {
            setAdminOfficeEditError(
              lang === "ar"
                ? "رقم الترخيص غير صحيح."
                : "Invalid license number."
            );
            return;
          }

          const hasOnlyOneCoordinate = (nextMapLatRaw && !nextMapLngRaw) || (!nextMapLatRaw && nextMapLngRaw);
          if (hasOnlyOneCoordinate) {
            setAdminOfficeEditError(
              lang === "ar"
                ? "أدخل خط العرض وخط الطول معًا أو اتركهما فارغين."
                : "Enter both latitude and longitude together, or leave both empty."
            );
            return;
          }

          const parsedMapLat = nextMapLatRaw ? Number(nextMapLatRaw) : null;
          const parsedMapLng = nextMapLngRaw ? Number(nextMapLngRaw) : null;
          if (nextMapLatRaw && (!Number.isFinite(parsedMapLat) || parsedMapLat < -90 || parsedMapLat > 90)) {
            setAdminOfficeEditError(lang === "ar" ? "خط العرض غير صحيح." : "Invalid latitude value.");
            return;
          }
          if (nextMapLngRaw && (!Number.isFinite(parsedMapLng) || parsedMapLng < -180 || parsedMapLng > 180)) {
            setAdminOfficeEditError(lang === "ar" ? "خط الطول غير صحيح." : "Invalid longitude value.");
            return;
          }

          const updatedOffice = {
            ...off,
            name: nextName,
            license: isEgyptOffice ? nextLicense : off.license,
            address: nextAddress,
            gov: nextGov,
            registrationType: nextRegistrationType,
            registrationNumber: nextRegistrationNumber,
            taxNumber: nextTaxNumber,
            issuingAuthority: nextIssuingAuthority,
            officialSourceUrl: nextOfficialSourceUrl,
            officialVerificationStatus: nextOfficialVerificationStatus,
            mapPlaceId: nextMapPlaceId,
            mapLat: parsedMapLat,
            mapLng: parsedMapLng,
            mapVerificationStatus: nextMapVerificationStatus,
          };

          const overridePayload = {
            name: nextName,
            license: isEgyptOffice ? nextLicense : off.license,
            address: nextAddress,
            gov: nextGov,
            registrationType: nextRegistrationType,
            registrationNumber: nextRegistrationNumber,
            taxNumber: nextTaxNumber,
            issuingAuthority: nextIssuingAuthority,
            officialSourceUrl: nextOfficialSourceUrl,
            officialVerificationStatus: nextOfficialVerificationStatus,
            mapPlaceId: nextMapPlaceId,
            mapLat: parsedMapLat,
            mapLng: parsedMapLng,
            mapVerificationStatus: nextMapVerificationStatus,
          };

          if (isManuallyAddedOffice) {
            setAdminAddedOffices((prev) => prev.map((entry) => (
              Number(entry?.id) === Number(off.id)
                ? { ...entry, ...overridePayload }
                : entry
            )));
            setRemoteAddedOffices((prev) => prev.map((entry) => (
              Number(entry?.id) === Number(off.id)
                ? { ...entry, ...overridePayload }
                : entry
            )));
            try {
              await saveAddedOfficeInFirebase(updatedOffice);
            } catch (error) {
              console.warn("Saving edited added office to Firebase failed", error);
            }
          } else {
            setOfficeOverrides((prev) => ({
              ...(prev || {}),
              [off.id]: overridePayload,
            }));
            setRemoteOfficeOverrides((prev) => ({
              ...(prev || {}),
              [off.id]: overridePayload,
            }));
            try {
              await saveOfficeOverrideInFirebase(updatedOffice);
            } catch (error) {
              console.warn("Saving office override to Firebase failed", error);
            }
          }

          setSelectedOffice(updatedOffice);
          if (String(off.gov || "") !== nextGov) {
            setSelectedGov(nextGov);
            setOfficePage(1);
          }

          setAdminOfficeEditOpen(false);
          setAdminOfficeEditError("");
        };

        const handleAdminDeleteOffice = async () => {
          if (!isAdminUser) return;
          const isManualOffice = isManuallyAddedOffice;
          const confirmed = typeof window === "undefined" || window.confirm(
            lang === "ar"
              ? (isManualOffice ? "تأكيد حذف هذا المكتب المُضاف يدويًا؟" : "تأكيد حذف هذا المكتب من التطبيق؟")
              : (isManualOffice ? "Confirm deleting this manually added office?" : "Confirm hiding this office from the app?")
          );
          if (!confirmed) return;

          if (isManualOffice) {
            setAdminAddedOffices((prev) => prev.filter((entry) => Number(entry?.id) !== Number(off.id)));
            setRemoteAddedOffices((prev) => prev.filter((entry) => Number(entry?.id) !== Number(off.id)));
            try {
              await deleteAddedOfficeInFirebase(off.id);
            } catch (error) {
              console.warn("Deleting added office from Firebase failed", error);
            }
          } else {
            const deletedOverride = {
              ...(mergedOfficeOverrides?.[off.id] || {}),
              __deleted: true,
            };
            setOfficeOverrides((prev) => ({
              ...(prev || {}),
              [off.id]: deletedOverride,
            }));
            setRemoteOfficeOverrides((prev) => ({
              ...(prev || {}),
              [off.id]: deletedOverride,
            }));
            try {
              await saveOfficeOverrideInFirebase({
                ...off,
                ...deletedOverride,
              });
            } catch (error) {
              console.warn("Saving office delete override to Firebase failed", error);
            }
          }

          closeOfficeEditorState();
          setSelectedOffice(null);
        };

        const reloadOfficeReviews = async () => {
          const items = await fetchOfficeReviewsFromFirebase();
          const nextState = buildOfficeReviewState(items, lang);
          setOfficeRatings(nextState.ratings);
          setReviews(nextState.reviews);
        };

        const submitReview = async () => {
          if (isGuestUser) {
            promptOfficeReviewAuth();
            return;
          }

          if (userAlreadyReviewedOffice) {
            setOfficeReviewError(
              lang === "ar"
                ? "تم إرسال تقييمك لهذا المكتب من قبل. يمكنك تقييم مكتب آخر."
                : "You already submitted a review for this office. You can review another office."
            );
            return;
          }

          if (!userRating || officeReviewSubmitting) return;
          setOfficeReviewSubmitting(true);
          setOfficeReviewError("");
          try {
            await saveOfficeReviewToFirebase({
              officeId: off.id,
              officeName: off.name,
              officeNameEn: getOfficeEnglishText(off.name),
              governorate: off.gov,
              governorateEn: getOfficeEnglishText(off.gov),
              country: officeCountryLabel,
              reviewerUid: authPreviewUser?.uid || "",
              reviewerName: authPreviewUser?.displayName || authPreviewUser?.email || "",
              rating: userRating,
              text: reviewText.trim(),
            });

            const rewardResult = await grantOfficeReviewCoinsIfEligible(authPreviewUser?.uid || "", off.id, 10)
              .catch((rewardError) => {
                console.error("Office review coins reward failed", rewardError);
                return { awarded: false, coins: null };
              });

            await reloadOfficeReviews();
            setUserRating(0);
            setReviewText("");

            if (rewardResult?.awarded) {
              setAccountCoins(Number(rewardResult?.coins) || 0);
              setModal({
                type: "success",
                title: lang === "ar" ? "تم إرسال التقييم" : "Review submitted",
                msg: lang === "ar"
                  ? `شكراً لك. تمت إضافة 10 كوينز إلى حسابك. رصيدك الحالي: ${Number(rewardResult?.coins) || 10} كوينز.`
                  : `Thanks. 10 coins were added to your account. Your current balance is ${Number(rewardResult?.coins) || 10} coins.`,
              });
            }
          } catch (error) {
            console.error("Office review save failed", error);
            setOfficeReviewError(
              lang === "ar"
                ? "تعذر حفظ تقييم المكتب الآن. حاول مرة أخرى."
                : "Unable to save the office review right now. Please try again."
            );
          } finally {
            setOfficeReviewSubmitting(false);
          }
        };

        const handleOfficeReviewEditStart = (reviewItem) => {
          if (!isAdminUser) return;
          setOfficeReviewEditingId(String(reviewItem?.id || "").trim());
          setOfficeReviewEditingText(String(reviewItem?.text || ""));
          setOfficeReviewError("");
        };

        const handleOfficeReviewEditCancel = () => {
          setOfficeReviewEditingId("");
          setOfficeReviewEditingText("");
          setOfficeReviewError("");
        };

        const handleOfficeReviewEditSave = async (reviewId) => {
          const cleanReviewId = String(reviewId || "").trim();
          if (!cleanReviewId || !isAdminUser) return;
          setOfficeReviewActionBusyId(cleanReviewId);
          setOfficeReviewError("");
          try {
            await updateOfficeReviewInFirebase(cleanReviewId, {
              text: officeReviewEditingText.trim(),
            });
            await reloadOfficeReviews();
            setOfficeReviewEditingId("");
            setOfficeReviewEditingText("");
          } catch (error) {
            console.error("Office review edit failed", error);
            setOfficeReviewError(
              lang === "ar"
                ? "تعذر تعديل التقييم الآن. حاول مرة أخرى."
                : "Unable to edit this review right now. Please try again."
            );
          } finally {
            setOfficeReviewActionBusyId("");
          }
        };

        const handleOfficeReviewDelete = async (reviewId) => {
          const cleanReviewId = String(reviewId || "").trim();
          if (!cleanReviewId || !isAdminUser) return;

          const confirmed = typeof window === "undefined" || window.confirm(
            lang === "ar"
              ? "تأكيد حذف هذا التقييم؟"
              : "Confirm deleting this review?"
          );
          if (!confirmed) return;

          setOfficeReviewActionBusyId(cleanReviewId);
          setOfficeReviewError("");
          try {
            await deleteOfficeReviewFromFirebase(cleanReviewId);
            await reloadOfficeReviews();
            if (officeReviewEditingId === cleanReviewId) {
              setOfficeReviewEditingId("");
              setOfficeReviewEditingText("");
            }
          } catch (error) {
            console.error("Office review delete failed", error);
            setOfficeReviewError(
              lang === "ar"
                ? "تعذر حذف التقييم الآن. حاول مرة أخرى."
                : "Unable to delete this review right now. Please try again."
            );
          } finally {
            setOfficeReviewActionBusyId("");
          }
        };

        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 800, background: dark ? "#0a1628" : "#f0f4ff", overflowY: "auto", fontFamily: "'Cairo',sans-serif" }}>

            {/* Header */}
            <div style={{ position: "sticky", top: 0, zIndex: 10, background: dark ? "rgba(10,22,40,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>{officeNameLabel}</div>
                      <div style={{ fontSize: 10, color: t.gold }}>
                        {officeGovLabel}
                        {selectedCountry === "مصر"
                          ? ` — ${lang === "ar" ? "ترخيص" : "License"} ${off.license}`
                          : (off.type ? ` — ${lang === "ar" ? "نوع الجهة" : "Office type"} ${off.type}` : "")}
                      </div>
              </div>
            </div>

            <div style={{ padding: "16px 16px 100px" }}>

              {/* بطاقة المعلومات */}
              <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 10, boxShadow: dark ? "none" : "0 2px 14px rgba(0,0,0,0.05)" }}>
                <div style={{ background: `linear-gradient(135deg, ${dark?"#1a2e50":"#082555"}, #0a1628)`, padding: "10px 12px 8px", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🏢</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#ffffff", lineHeight: 1.2 }}>{officeNameLabel}</div>
                    </div>
                    <div style={{ fontSize: 14, color: "#f8d57a", fontWeight: 900, whiteSpace: "nowrap", textAlign: "left" }}>
                      {selectedCountry === "مصر"
                        ? `${lang === "ar" ? "رخصة رقم" : "License No."} ${off.license}`
                        : `${lang === "ar" ? "نوع الجهة" : "Office type"} ${off.type || "—"}`}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: `${t.gold}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>📍</div>
                    <div>
                      <div style={{ fontSize: 9, color: t.subText, marginBottom: 2 }}>{lang === "ar" ? "العنوان" : "Address"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.4, fontWeight: 600 }}>{officeAddressLabel}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: "#22c55e18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🏛️</div>
                    <div>
                      <div style={{ fontSize: 9, color: t.subText, marginBottom: 2 }}>{selectedCountry === "مصر" ? (lang === "ar" ? "المحافظة" : "Governorate") : (lang === "ar" ? "المدينة" : "City")}</div>
                      <div style={{ fontSize: 11, color: t.text, fontWeight: 600 }}>{officeGovLabel}</div>
                    </div>
                  </div>
                  {selectedCountry === "المملكة العربية السعودية" && (
                    <>
                      {!!off.district && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${t.border}` }}>
                          <div style={{ width: 22, height: 22, borderRadius: 8, background: "#0ea5e918", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>📌</div>
                          <div>
                            <div style={{ fontSize: 9, color: t.subText, marginBottom: 2 }}>{lang === "ar" ? "الحي" : "District"}</div>
                            <div style={{ fontSize: 11, color: t.text, fontWeight: 600 }}>{off.district}</div>
                          </div>
                        </div>
                      )}
                      {!!off.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${t.border}` }}>
                          <div style={{ width: 22, height: 22, borderRadius: 8, background: "#22c55e18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>📞</div>
                          <div>
                            <div style={{ fontSize: 9, color: t.subText, marginBottom: 2 }}>{lang === "ar" ? "الهاتف" : "Phone"}</div>
                            <div style={{ fontSize: 11, color: t.text, fontWeight: 600 }}>{off.phone}</div>
                          </div>
                        </div>
                      )}
                      {!!off.website && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${t.border}` }}>
                          <div style={{ width: 22, height: 22, borderRadius: 8, background: "#60a5fa18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🌐</div>
                          <div>
                            <div style={{ fontSize: 9, color: t.subText, marginBottom: 2 }}>{lang === "ar" ? "الموقع" : "Website"}</div>
                            <div style={{ fontSize: 11, color: t.text, fontWeight: 600 }}>{off.website}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {isAdminUser && (
                <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 14, border: `1px solid ${t.border}`, padding: "10px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: t.text }}>
                      {lang === "ar" ? "تعديل بيانات المكتب (أدمن)" : "Edit office data (Admin)"}
                    </div>
                    {!adminOfficeEditOpen ? (
                      <button
                        onClick={openAdminOfficeEditor}
                        style={{ border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, borderRadius: 10, padding: "5px 9px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                      >
                        {lang === "ar" ? "تعديل" : "Edit"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAdminOfficeEditOpen(false);
                          setAdminOfficeEditError("");
                        }}
                        style={{ border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, borderRadius: 10, padding: "5px 9px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                      >
                        {lang === "ar" ? "إلغاء" : "Cancel"}
                      </button>
                    )}
                  </div>

                  {adminOfficeEditOpen && (
                    <div style={{ display: "grid", gap: 7 }}>
                      <input
                        value={adminOfficeDraft.name}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder={lang === "ar" ? "اسم المكتب" : "Office name"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      {selectedCountry === "مصر" && (
                        <input
                          value={adminOfficeDraft.license}
                          onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, license: String(e.target.value || "").replace(/[^0-9]/g, "") }))}
                          placeholder={lang === "ar" ? "رقم الترخيص" : "License number"}
                          inputMode="numeric"
                          style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                        />
                      )}
                      <textarea
                        rows={2}
                        value={adminOfficeDraft.address}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder={lang === "ar" ? "العنوان" : "Address"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box", resize: "vertical" }}
                      />
                      {selectedCountry === "مصر" ? (
                        <select
                          value={adminOfficeDraft.gov}
                          onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, gov: e.target.value }))}
                          style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                        >
                          {egyptGovernorates.map((govItem) => (
                            <option key={govItem.name} value={govItem.name}>{govItem.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={adminOfficeDraft.gov}
                          onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, gov: e.target.value }))}
                          placeholder={lang === "ar" ? "المدينة" : "City"}
                          style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                        />
                      )}
                      <input
                        value={adminOfficeDraft.registrationType}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, registrationType: e.target.value }))}
                        placeholder={lang === "ar" ? "نوع التوثيق (سجل/ترخيص/ضريبي...)" : "Verification type (commercial/license/tax...)"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <input
                        value={adminOfficeDraft.registrationNumber}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                        placeholder={lang === "ar" ? "رقم السجل/الترخيص" : "Registration/license number"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <input
                        value={adminOfficeDraft.taxNumber}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, taxNumber: e.target.value }))}
                        placeholder={lang === "ar" ? "الرقم الضريبي" : "Tax number"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <input
                        value={adminOfficeDraft.issuingAuthority}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, issuingAuthority: e.target.value }))}
                        placeholder={lang === "ar" ? "الجهة الرسمية المصدرة" : "Issuing authority"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <input
                        value={adminOfficeDraft.officialSourceUrl}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, officialSourceUrl: e.target.value }))}
                        placeholder={lang === "ar" ? "رابط المصدر الرسمي" : "Official source URL"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <select
                        value={adminOfficeDraft.officialVerificationStatus}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, officialVerificationStatus: e.target.value }))}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      >
                        <option value="">{lang === "ar" ? "حالة التوثيق الرسمي" : "Official verification status"}</option>
                        <option value="verified">{lang === "ar" ? "موثق" : "Verified"}</option>
                        <option value="pending">{lang === "ar" ? "قيد المراجعة" : "Pending"}</option>
                        <option value="rejected">{lang === "ar" ? "مرفوض" : "Rejected"}</option>
                      </select>
                      <input
                        value={adminOfficeDraft.mapPlaceId}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, mapPlaceId: e.target.value }))}
                        placeholder={lang === "ar" ? "Google Place ID" : "Google Place ID"}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <input
                        value={adminOfficeDraft.mapLat}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, mapLat: e.target.value }))}
                        placeholder={lang === "ar" ? "Latitude (خط العرض)" : "Latitude"}
                        inputMode="decimal"
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <input
                        value={adminOfficeDraft.mapLng}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, mapLng: e.target.value }))}
                        placeholder={lang === "ar" ? "Longitude (خط الطول)" : "Longitude"}
                        inputMode="decimal"
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      />
                      <select
                        value={adminOfficeDraft.mapVerificationStatus}
                        onChange={(e) => setAdminOfficeDraft((prev) => ({ ...prev, mapVerificationStatus: e.target.value }))}
                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, padding: "8px 10px", boxSizing: "border-box" }}
                      >
                        <option value="">{lang === "ar" ? "حالة دقة الموقع" : "Map accuracy status"}</option>
                        <option value="verified">{lang === "ar" ? "الموقع دقيق" : "Verified"}</option>
                        <option value="pending">{lang === "ar" ? "قيد التدقيق" : "Pending"}</option>
                        <option value="rejected">{lang === "ar" ? "غير دقيق" : "Rejected"}</option>
                      </select>
                      {!!adminOfficeEditError && (
                        <div style={{ color: "#fca5a5", fontSize: 10, fontWeight: 700 }}>{adminOfficeEditError}</div>
                      )}
                      <button
                        onClick={saveAdminOfficeEditor}
                        style={{ border: "none", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "#fff", borderRadius: 10, padding: "7px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                      >
                        {lang === "ar" ? "حفظ بيانات المكتب" : "Save office data"}
                      </button>
                      <button
                        onClick={handleAdminDeleteOffice}
                        style={{ border: "none", background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "#fff", borderRadius: 10, padding: "7px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}
                      >
                        {isManuallyAddedOffice
                          ? (lang === "ar" ? "حذف المكتب المُضاف يدويًا" : "Delete manually added office")
                          : (lang === "ar" ? "حذف المكتب من العرض" : "Hide office from app")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isAdminUser && hasAdminVerificationData && (
                <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 14, border: `1px solid ${t.border}`, padding: "10px", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: t.text, marginBottom: 8 }}>
                    {lang === "ar" ? "بيانات التحقق الرسمية (للأدمن فقط)" : "Official verification data (Admin only)"}
                  </div>
                  {!!officeRegistrationType && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "نوع التوثيق:" : "Verification type:"}</strong> {officeRegistrationType}
                    </div>
                  )}
                  {!!officeRegistrationNumber && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "رقم السجل/الترخيص:" : "Registration/license no:"}</strong> {officeRegistrationNumber}
                    </div>
                  )}
                  {!!officeTaxNumber && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "الرقم الضريبي:" : "Tax number:"}</strong> {officeTaxNumber}
                    </div>
                  )}
                  {!!officeIssuingAuthority && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "الجهة المصدرة:" : "Issuing authority:"}</strong> {officeIssuingAuthority}
                    </div>
                  )}
                  {!!officeOfficialVerificationStatus && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "حالة التوثيق:" : "Verification status:"}</strong> {officeOfficialVerificationStatus}
                    </div>
                  )}
                  {!!officeOfficialSourceUrl && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "المصدر الرسمي:" : "Official source:"}</strong>{" "}
                      <a href={officeOfficialSourceUrl} target="_blank" rel="noreferrer" style={{ color: t.gold, textDecoration: "underline" }}>
                        {lang === "ar" ? "فتح الرابط" : "Open source"}
                      </a>
                    </div>
                  )}
                  {!!mapPlaceId && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>Place ID:</strong> {mapPlaceId}
                    </div>
                  )}
                  {(mapLatValue || mapLngValue) && (
                    <div style={{ fontSize: 10, color: t.text, marginBottom: 4 }}>
                      <strong>{lang === "ar" ? "الإحداثيات:" : "Coordinates:"}</strong> {mapLatValue || "—"}, {mapLngValue || "—"}
                    </div>
                  )}
                  {!!officeMapVerificationStatus && (
                    <div style={{ fontSize: 10, color: t.text }}>
                      <strong>{lang === "ar" ? "حالة دقة الموقع:" : "Map accuracy status:"}</strong> {officeMapVerificationStatus}
                    </div>
                  )}
                </div>
              )}

              {/* زرار الخريطة */}
              <a href={mapUrl} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#d4af37,#b8860b)", borderRadius: 14, padding: "7px", textDecoration: "none", marginBottom: 10, boxShadow: "0 3px 14px rgba(212,175,55,0.30)" }}>
                <span style={{ fontSize: 14 }}>🗺️</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ffffff" }}>{lang === "ar" ? "فتح الموقع على خريطة جوجل" : "Open Location in Google Maps"}</span>
              </a>

              {/* التقييم */}
              <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 16, border: `1px solid ${t.border}`, padding: "10px", marginBottom: 10, boxShadow: dark ? "none" : "0 2px 14px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 8 }}>⭐ {lang === "ar" ? "التقييم العام" : "Overall Rating"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{rating.avg || "—"}</div>
                    <div style={{ fontSize: 9, color: t.subText, marginTop: 2 }}>{rating.count} {lang === "ar" ? "تقييم" : "ratings"}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(s => {
                      const cnt = offReviews.filter(r=>r.rating===s).length;
                      const pct = offReviews.length ? (cnt/offReviews.length)*100 : 0;
                      return (
                        <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                          <span style={{ fontSize: 9, color: t.subText, width: 8 }}>{s}</span>
                          <span style={{ fontSize: 9, color: "#f59e0b" }}>★</span>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.border, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#d4af37)", borderRadius: 2, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: 9, color: t.subText, width: 16 }}>{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* إضافة تقييم */}
                <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>{lang === "ar" ? "قيّم هذا المكتب" : "Rate This Office"}</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, justifyContent: "center" }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => {
                          if (isGuestUser) {
                            promptOfficeReviewAuth();
                            return;
                          }
                          if (userAlreadyReviewedOffice) {
                            setOfficeReviewError(
                              lang === "ar"
                                ? "تم إرسال تقييمك لهذا المكتب من قبل."
                                : "You already submitted a review for this office."
                            );
                            return;
                          }
                          setOfficeReviewError("");
                          setUserRating(s);
                        }}
                        style={{ fontSize: 30, background: "none", border: "none", cursor: isGuestUser || userAlreadyReviewedOffice ? "not-allowed" : "pointer", color: (hoverRating||userRating) >= s ? "#f59e0b" : t.border, transition: "color 0.15s, transform 0.15s", transform: (hoverRating||userRating) >= s ? "scale(1.2)" : "scale(1)", opacity: isGuestUser || userAlreadyReviewedOffice ? 0.7 : 1 }}>★</button>
                    ))}
                  </div>
                  {isGuestUser && (
                    <div style={{ marginBottom: 10, fontSize: 11, color: "#b45309", textAlign: "center", fontWeight: 800 }}>
                      {lang === "ar"
                        ? "لتقييم المكتب وإضافة تجربتك، سجّل الدخول أو أنشئ حسابًا جديدًا."
                        : "Sign in or create a new account to rate this office and add your experience."}
                    </div>
                  )}
                  {!isGuestUser && userAlreadyReviewedOffice && (
                    <div style={{ marginBottom: 10, fontSize: 11, color: "#0f766e", textAlign: "center", fontWeight: 800 }}>
                      {lang === "ar"
                        ? "تم تسجيل تقييمك لهذا المكتب بالفعل."
                        : "Your review for this office has already been recorded."}
                    </div>
                  )}
                  <div style={{ marginBottom: 10, fontSize: 10, color: t.subText, textAlign: "center", fontWeight: 500, opacity: 0.82, fontStyle: "italic" }}>
                    {lang === "ar"
                      ? "هذه التقييمات امانة امام الله. أول تقييم لكل مكتب يمنحك 10 كوينز فقط."
                      : "These reviews are a trust before God. Your first review for each office gives you 10 coins only."}
                  </div>
                  <textarea
                    placeholder={lang === "ar" ? "اكتب تجربتك مع هذا المكتب... (اختياري)" : "Write your experience with this office... (optional)"}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={3}
                    disabled={isGuestUser || userAlreadyReviewedOffice}
                    style={{ width: "100%", borderRadius: 12, border: `1px solid ${t.border}`, background: isGuestUser || userAlreadyReviewedOffice ? (dark ? "rgba(255,255,255,0.04)" : "#f8fafc") : t.inputBg, color: t.text, fontSize: 13, fontFamily: "'Cairo',sans-serif", padding: "10px 12px", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10, opacity: isGuestUser || userAlreadyReviewedOffice ? 0.85 : 1 }}
                  />
                  <button onClick={submitReview}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: !isGuestUser && !userAlreadyReviewedOffice && userRating && !officeReviewSubmitting ? "linear-gradient(135deg,#d4af37,#b8860b)" : t.border, color: !isGuestUser && !userAlreadyReviewedOffice && userRating && !officeReviewSubmitting ? "#fff" : t.subText, fontSize: 14, fontWeight: 700, cursor: !isGuestUser && !userAlreadyReviewedOffice && userRating && !officeReviewSubmitting ? "pointer" : "default", fontFamily: "'Cairo',sans-serif", transition: "all 0.2s" }}>
                    {officeReviewSubmitting
                      ? (lang === "ar" ? "جارٍ إرسال التقييم..." : "Submitting review...")
                      : isGuestUser
                        ? (lang === "ar" ? "سجّل الدخول لإرسال تقييمك" : "Sign in to submit your review")
                        : userAlreadyReviewedOffice
                          ? (lang === "ar" ? "تم إرسال تقييمك مسبقًا" : "Review already submitted")
                        : userRating
                        ? `${lang === "ar" ? "إرسال التقييم" : "Submit review"} (${userRating} ★)`
                        : (lang === "ar" ? "اختر عدد النجوم أولاً" : "Choose stars first")}
                  </button>
                  {officeReviewError && (
                    <div style={{ marginTop:10, fontSize:12, color:"#dc2626", textAlign:"center" }}>
                      {officeReviewError}
                    </div>
                  )}
                </div>
              </div>

              {/* التعليقات */}
              {offReviews.length > 0 && (
                <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 16, border: `1px solid ${t.border}`, padding: "10px", boxShadow: dark ? "none" : "0 2px 14px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 8 }}>💬 {lang === "ar" ? "آراء المستخدمين" : "User Reviews"}</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {offReviews.map((rv, i) => {
                      const isEditing = officeReviewEditingId === rv.id;
                      const actionBusy = officeReviewActionBusyId === rv.id;
                      return (
                        <div key={rv.id || i} style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: dark ? "rgba(255,255,255,0.03)" : "#f8fbff", padding: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(212,175,55,0.18)", border: "1px solid rgba(212,175,55,0.35)", color: t.gold, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {rv.reviewerInitials || "--"}
                              </div>
                              <div style={{ fontSize: 10, color: t.text, fontWeight: 700 }}>
                                {rv.reviewerName || (lang === "ar" ? "مستخدم" : "User")}
                              </div>
                            </div>
                            <span style={{ fontSize: 9, color: t.subText }}>{rv.date}</span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <div style={{ display: "flex", gap: 2 }}>
                              {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, color: rv.rating >= s ? "#f59e0b" : t.border }}>★</span>)}
                            </div>
                            {isAdminUser && (
                              <div style={{ display: "flex", gap: 5 }}>
                                <button
                                  onClick={() => handleOfficeReviewEditStart(rv)}
                                  disabled={actionBusy}
                                  style={{ border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                >
                                  {lang === "ar" ? "تعديل" : "Edit"}
                                </button>
                                <button
                                  onClick={() => handleOfficeReviewDelete(rv.id)}
                                  disabled={actionBusy}
                                  style={{ border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.14)", color: dark ? "#fecaca" : "#b91c1c", borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                >
                                  {lang === "ar" ? "حذف" : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <>
                              <textarea
                                rows={2}
                                value={officeReviewEditingText}
                                onChange={(e) => setOfficeReviewEditingText(e.target.value)}
                                style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 11, fontFamily: "'Cairo',sans-serif", padding: "7px 9px", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 6 }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  onClick={() => handleOfficeReviewEditCancel()}
                                  disabled={actionBusy}
                                  style={{ flex: 1, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, borderRadius: 10, padding: "6px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                >
                                  {lang === "ar" ? "إلغاء" : "Cancel"}
                                </button>
                                <button
                                  onClick={() => handleOfficeReviewEditSave(rv.id)}
                                  disabled={actionBusy}
                                  style={{ flex: 1, border: "none", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "#fff", borderRadius: 10, padding: "6px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                >
                                  {actionBusy ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ" : "Save")}
                                </button>
                              </div>
                            </>
                          ) : (
                            rv.text && <div style={{ fontSize: 11, color: t.text, lineHeight: 1.5 }}>{rv.text}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ── CITY / SERVICE MODAL ─────────────────────────────────────────── */}
      {Modal()}

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
<header
  className="premium-header"
  style={{
    ...styles.header,
    background: t.headerGradient,
    borderBottom: `1px solid ${dark ? "rgba(130,160,220,0.12)" : "rgba(30,64,175,0.08)"}`,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: dark
      ? "0 2px 24px rgba(0,0,0,0.35), 0 0 40px rgba(26,86,219,0.06)"
      : "0 2px 20px rgba(15,27,58,0.07), 0 1px 0 rgba(255,255,255,0.8)",
  }}
>
  {/* Animated gradient border at bottom */}
  <div style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 25%, rgba(59,130,246,0.5) 75%, transparent 100%)",
    backgroundSize: "200% 100%",
    animation: "headerLineGlow 5s ease infinite",
    pointerEvents: "none",
  }} />

  <div style={styles.headerInner}>
    {/* Logo badge with cinematic glow */}
    <div
      className="logo-badge-glow"
      style={{
        ...styles.logoIcon,
        background: dark
          ? "linear-gradient(145deg, #0a1e50, #0f2870)"
          : "linear-gradient(145deg, #0e2d6e, #1a3c8a)",
        boxShadow: dark
          ? "0 4px 20px rgba(212,175,55,0.45), 0 0 0 1px rgba(212,175,55,0.22), 0 0 32px rgba(26,86,219,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
          : "0 4px 18px rgba(212,175,55,0.38), 0 0 0 1px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Inner light reflection */}
      <div style={{
        position: "absolute",
        top: -4,
        left: -4,
        right: "50%",
        bottom: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <img src={logo} alt="logo" style={{ width: 30, height: 30, position: "relative", zIndex: 1 }} />
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        ...styles.logoTitle,
        color: t.text,
        fontWeight: 900,
        letterSpacing: 0.2,
      }}>
        {tx.appTitle}
      </div>
      <div style={{
        ...styles.logoSub,
        color: t.gold,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        fontSize: 8.5,
      }}>
        {tx.appSub}
      </div>
    </div>
  </div>
</header>

      {/* ── COUNTRY BAR — home tab only ──────────────────────────────────── */}
      {mainTab === "home" && view !== "landing" && (() => {
        // الدول الرئيسية تظهر كـ tabs
        const mainCountries = ["مصر", "المملكة العربية السعودية", "الإمارات العربية المتحدة"];
        // باقي الدول تظهر في القائمة المنسدلة "دول أخر"
        const otherCountries = countriesData.filter(c => !mainCountries.includes(c.name));
        const isOther = !mainCountries.includes(selectedCountry);


        return (
          <div style={{
            background: dark
              ? "rgba(4,10,22,0.85)"
              : "rgba(255,255,255,0.92)",
            borderBottom: `1px solid ${dark ? "rgba(130,160,220,0.1)" : "rgba(30,64,175,0.07)"}`,
            backdropFilter: "blur(16px) saturate(1.4)",
            WebkitBackdropFilter: "blur(16px) saturate(1.4)",
            position: "relative",
            boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,27,58,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "6px 10px", gap: 4, scrollbarWidth: "none" }}>

              {/* مصر */}
              {mainCountries.map(cName => {
                const c = countriesData.find(x => x.name === cName);
                if (!c) return null;
                const active = selectedCountry === cName;
                return (
                  <button key={cName} onClick={() => { handleCountrySelect(cName); setShowOtherDropdown(false); }}
                    className="country-bar-tab"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      padding: "6px 12px",
                      borderRadius: 12,
                      border: `1px solid ${active ? t.borderGold : "transparent"}`,
                      background: active
                        ? (dark ? `rgba(212,175,55,0.14)` : `rgba(184,134,11,0.08)`)
                        : "transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                      position: "relative",
                    }}>
                    {active && (
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: "20%",
                        right: "20%",
                        height: 2,
                        borderRadius: "2px 2px 0 0",
                        background: `linear-gradient(90deg, transparent, ${t.gold}, transparent)`,
                      }} />
                    )}
                    <img src={c.flagImg} alt={cName} style={{
                      width: 34,
                      height: 23,
                      borderRadius: 5,
                      objectFit: "cover",
                      border: `1px solid ${active ? t.borderGold : t.border}`,
                      boxShadow: active ? `0 0 8px ${t.gold}30` : "none",
                    }} />
                    <span style={{ fontSize: 10, fontWeight: active ? 800 : 500, color: active ? t.gold : t.subText, fontFamily: "'Cairo',sans-serif", whiteSpace: "nowrap" }}>
                      {cName === "المملكة العربية السعودية" ? "السعودية" : cName === "الإمارات العربية المتحدة" ? "الإمارات" : cName}
                    </span>
                  </button>
                );
              })}

              {/* زر دول أخر */}
              <button onClick={() => setShowOtherDropdown(v => !v)}
                className="country-bar-tab"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "6px 12px",
                  borderRadius: 12,
                  border: `1px solid ${isOther ? t.borderGold : "transparent"}`,
                  background: isOther
                    ? (dark ? `rgba(212,175,55,0.14)` : `rgba(184,134,11,0.08)`)
                    : "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  position: "relative",
                }}>
                {isOther
                  ? <img src={countriesData.find(c => c.name === selectedCountry)?.flagImg} alt={selectedCountry} style={{ width: 34, height: 23, borderRadius: 5, objectFit: "cover", border: `1px solid ${t.borderGold}` }} />
                  : <span style={{ fontSize: 22, lineHeight: 1 }}>🌐</span>
                }
                <span style={{ fontSize: 10, fontWeight: isOther ? 800 : 500, color: isOther ? t.gold : t.subText, fontFamily: "'Cairo',sans-serif", whiteSpace: "nowrap" }}>
                  {isOther ? selectedCountry : "دول أخر"}
                </span>
              </button>

            </div>

            {/* القائمة المنسدلة لباقي الدول */}
            {showOtherDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 500,
                background: dark
                  ? "rgba(7,14,36,0.97)"
                  : "rgba(255,255,255,0.98)",
                backdropFilter: "blur(20px) saturate(1.5)",
                WebkitBackdropFilter: "blur(20px) saturate(1.5)",
                border: `1px solid ${dark ? "rgba(130,160,220,0.14)" : "rgba(30,64,175,0.09)"}`,
                borderTop: "none",
                borderRadius: "0 0 20px 20px",
                boxShadow: dark
                  ? "0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)"
                  : "0 12px 32px rgba(15,27,58,0.15)",
                padding: "16px",
                animation: "fadeSlideUp 0.2s ease",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {otherCountries.map(c => (
                    <button key={c.name} onClick={() => { handleCountrySelect(c.name); setShowOtherDropdown(false); }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "12px 8px",
                        borderRadius: 14,
                        border: `1px solid ${selectedCountry === c.name ? t.borderGold : t.border}`,
                        background: selectedCountry === c.name
                          ? (dark ? `rgba(212,175,55,0.14)` : `rgba(184,134,11,0.08)`)
                          : t.inputBg,
                        cursor: "pointer",
                        fontFamily: "'Cairo',sans-serif",
                        boxShadow: selectedCountry === c.name ? `0 0 14px ${t.gold}25` : "none",
                        transition: "all 0.2s ease",
                      }}>
                      <img src={c.flagImg} alt={c.name} style={{ width: 48, height: 32, borderRadius: 8, objectFit: "cover", border: `1px solid ${t.border}` }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: selectedCountry === c.name ? t.gold : t.text, textAlign: "center" }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <main style={styles.main}>

        {/* ══ HOME TAB ══════════════════════════════════════════════════════ */}
        {mainTab === "home" && (
          <>
            {view === "egyptMenu" && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: `${t.gold}18`, border: `1px solid ${t.gold}40`, color: t.gold, display: "block", textAlign: "center" }}>
                    {lang === "ar" ? "بوابات مصر الرئيسية" : "Egypt Main Sections"}
                  </div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: "center", margin: "6px 0 10px" }}>
                    {lang === "ar" ? "اختر القسم" : "Choose a Section"}
                  </h1>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    onClick={() => { setView("home"); setSelectedGov(null); setSearch(""); }}
                    className="section-card"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textAlign: lang === "ar" ? "right" : "left",
                      background: dark ? "linear-gradient(135deg, rgba(22,163,74,0.24), rgba(34,197,94,0.10))" : "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                      border: "1px solid #16a34a33",
                      borderRadius: 22,
                      padding: "12px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minHeight: 82,
                      overflow: "hidden",
                      boxShadow: dark ? "0 0 18px #16a34a18" : "0 10px 22px #16a34a12",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid #16a34a28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a", marginBottom: 3 }}>{lang === "ar" ? "مكاتب السفريات الموثوقة" : "Trusted Travel Offices"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? "ادخل إلى المحافظات والمكاتب المرخصة كما هي بدون أي تغيير في محتواها." : "Open the governorates and licensed offices exactly as they are."}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#16a34a18", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                  </button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                    <div
                      className="section-card"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        textAlign: lang === "ar" ? "right" : "left",
                        background: dark ? "linear-gradient(135deg, rgba(229,62,62,0.12), rgba(229,62,62,0.06))" : "linear-gradient(135deg, #fff5f5, #fffafa)",
                        border: "1px solid #e53e3e28",
                        borderRadius: 22,
                        padding: "12px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        boxShadow: dark ? "0 0 18px #e53e3e14" : "0 10px 22px #e53e3e0d",
                        fontFamily: "'Cairo',sans-serif",
                        minHeight: 82,
                        overflow: "hidden",
                        opacity: 0.86
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid #e53e3e20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚫</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: "#e53e3e" }}>{lang === "ar" ? "مكاتب محظورة" : "Blocked Offices"}</div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#e53e3e", background: "#e53e3e14", border: "1px solid #e53e3e28", borderRadius: 999, padding: "2px 7px" }}>{lang === "ar" ? "قريبًا" : "Soon"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? "هذا القسم سيُضاف لاحقًا في هذه الدولة." : "This section will be added later for this country."}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEgyptServicesScreen("list");
                      setView("egyptServices");
                    }}
                    className="section-card"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textAlign: lang === "ar" ? "right" : "left",
                      background: dark ? "linear-gradient(135deg, rgba(14,116,144,0.24), rgba(6,182,212,0.12))" : "linear-gradient(135deg, #ecfeff, #f0fdfa)",
                      border: "1px solid #0f766e33",
                      borderRadius: 22,
                      padding: "12px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minHeight: 82,
                      overflow: "hidden",
                      boxShadow: dark ? "0 0 18px #0f766e18" : "0 10px 22px #0f766e12",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid #0f766e28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🛂</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#0f766e", marginBottom: 3 }}>{lang === "ar" ? "خدمات مدفوعة" : "Paid Services"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? "هنا تجد طلب خدمات مدفوعة ووزارة العمل والطوارئ في دولة مصر فقط." : "Here you will find paid service requests, the Ministry of Labor, and emergency contacts in Egypt only."}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0f766e18", color: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                  </button>

                  <button
                    onClick={openProviderPortalOrPromptLogin}
                    className="section-card"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textAlign: lang === "ar" ? "right" : "left",
                      background: dark ? "linear-gradient(135deg, rgba(202,138,4,0.24), rgba(245,158,11,0.10))" : "linear-gradient(135deg, #fffbeb, #fef3c7)",
                      border: "1px solid rgba(202,138,4,0.30)",
                      borderRadius: 22,
                      padding: "12px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minHeight: 82,
                      overflow: "hidden",
                      boxShadow: dark ? "0 0 18px rgba(202,138,4,0.18)" : "0 10px 22px rgba(202,138,4,0.12)",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid rgba(202,138,4,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🧰</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: dark ? "#fde68a" : "#a16207", marginBottom: 3 }}>{lang === "ar" ? "ضيف خدمتك" : "Add Your Service"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? "سجل خدمتك ليتم مراجعتها واعتمادها من الأدمن." : "Submit your service so it can be reviewed and approved by admin."}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(202,138,4,0.16)", color: dark ? "#fde68a" : "#a16207", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                  </button>

                  {!isOtherNationalitySelected && (
                    <button
                      onClick={() => setView("egyptEmbassies")}
                      className="section-card"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        textAlign: lang === "ar" ? "right" : "left",
                        background: dark ? "linear-gradient(135deg, rgba(8,145,178,0.24), rgba(14,165,233,0.10))" : "linear-gradient(135deg, #ecfeff, #e0f2fe)",
                        border: "1px solid rgba(14,165,233,0.28)",
                        borderRadius: 22,
                        padding: "12px 13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        minHeight: 82,
                        overflow: "hidden",
                        boxShadow: dark ? "0 0 18px rgba(14,165,233,0.18)" : "0 10px 22px rgba(14,165,233,0.12)",
                        fontFamily: "'Cairo',sans-serif",
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid rgba(14,165,233,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏛️</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: dark ? "#67e8f9" : "#0f766e", marginBottom: 3 }}>{lang === "ar" ? "تواصل مع سفارتك" : "Contact Your Embassy"}</div>
                        <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? `الوصول السريع إلى سفارتك داخل مصر${selectedNationality ? ` - الجنسية الحالية: ${selectedNationality}` : ""}` : `Quick access to your embassy inside Egypt${selectedNationality ? ` - current nationality: ${countryNamesEn[selectedNationality] || selectedNationality}` : ""}`}</div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(14,165,233,0.16)", color: dark ? "#67e8f9" : "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                    </button>
                  )}

                </div>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    lang === "ar"
                      ? "مرحبًا، أحتاج مساعدة في اختيار القسم أو الخدمات داخل التطبيق."
                      : "Hello, I need help choosing sections or services in the app."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="support-whatsapp-tile"
                  style={{
                    marginTop: 14,
                    width: 125,
                    minHeight: 41,
                    maxWidth: "calc(100% - 6px)",
                    marginInlineStart: "auto",
                    borderRadius: 18,
                    border: "none",
                    background: "transparent",
                    color: t.text,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    textDecoration: "none",
                    padding: "5px 10px",
                    boxSizing: "border-box",
                    boxShadow: "none",
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    textAlign: "center",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>{lang === "ar" ? "الدعم الفني" : "Support"}</span>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    style={{ width: 31, height: 31, borderRadius: "50%", background: "#ffffff", padding: 2, flexShrink: 0 }}
                  />
                </a>
              </div>
            )}

            {view === "landing" && (
              <div>
                <div style={styles.hero}>
                </div>

                <div style={{
                  ...styles.sectionCard,
                  background: dark
                    ? "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.03) 100%)"
                    : "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.95) 100%)",
                  border: `1px solid ${dark ? "rgba(130,160,220,0.15)" : "rgba(30,64,175,0.09)"}`,
                  padding: "16px 14px",
                  boxShadow: dark
                    ? "0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "0 10px 40px rgba(15,27,58,0.08), 0 0 0 1px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,1)",
                  backdropFilter: dark ? "blur(16px) saturate(1.3)" : "none",
                  WebkitBackdropFilter: dark ? "blur(16px) saturate(1.3)" : "none",
                  zoom: isCompactPhone ? 0.88 : 1,
                  margin: "18px auto 0",
                }}>
                  <div style={{ marginBottom: 14, borderRadius: 18, padding: "5.2px 13px", background: dark ? "linear-gradient(135deg, rgba(14,116,144,0.26), rgba(6,182,212,0.12))" : "linear-gradient(135deg, #ecfeff, #dbeafe)", border: "1px solid rgba(14,165,233,0.26)", boxShadow: dark ? "0 0 20px rgba(34,211,238,0.14), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 0 18px rgba(14,165,233,0.12), 0 10px 20px rgba(14,165,233,0.08)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -26, left: lang === "ar" ? "auto" : -24, right: lang === "ar" ? -24 : "auto", width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.26), rgba(56,189,248,0))" }} />
                    <div style={{ display: "flex", flexDirection: isCompactPhone ? "column" : "row", alignItems: isCompactPhone ? "stretch" : "center", gap: 7, position: "relative" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: dark ? "#67e8f9" : "#0f766e", marginBottom: 2, fontFamily: "'Cairo',sans-serif" }}>
                          {lang === "ar" ? "اختر جنسيتك" : "Choose Your Nationality"}
                        </div>
                        <div style={{ fontSize: 10, lineHeight: 1.45, color: dark ? "#d5f5ff" : "#155e75", fontFamily: "'Cairo',sans-serif" }}>
                          {lang === "ar" ? "اختيار الجنسية يجعل قسم تواصل مع سفارتك يعرض سفارتك المناسبة مباشرة داخل كل دولة." : "Choosing your nationality makes the Contact Your Embassy section show the right embassy directly inside each country."}
                        </div>
                      </div>
                      <div style={{ minWidth: isCompactPhone ? "100%" : 220, display: "flex", gap: 6 }}>
                        {nationalityEditMode || !selectedNationality ? (
                          <>
                            <input
                              type="text"
                              value={nationalityInputText}
                              onChange={(e) => setNationalityInputText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && nationalityInputText.trim()) {
                                  const val = nationalityInputText.trim();
                                  setSelectedNationality(val);
                                  setNationalityEditMode(false);
                                  setNationalityConfirmToast(val);
                                  setTimeout(() => setNationalityConfirmToast(""), 2500);
                                }
                              }}
                              placeholder={lang === "ar" ? "اكتب جنسيتك..." : "Type your nationality..."}
                              style={{
                                flex: 1, padding: "7px 12px", borderRadius: 12,
                                border: `1px solid ${dark ? "rgba(125,211,252,0.28)" : "rgba(14,165,233,0.26)"}`,
                                background: dark ? "rgba(8,47,73,0.72)" : "rgba(255,255,255,0.95)",
                                color: t.text, fontWeight: 800, fontSize: 12,
                                fontFamily: "'Cairo',sans-serif", outline: "none",
                                boxShadow: dark ? "0 0 0 1px rgba(103,232,249,0.08)" : "0 6px 12px rgba(14,165,233,0.08)"
                              }}
                            />
                            <button
                              onClick={() => {
                                const val = nationalityInputText.trim();
                                if (!val) return;
                                setSelectedNationality(val);
                                setNationalityEditMode(false);
                                setNationalityConfirmToast(val);
                                setTimeout(() => setNationalityConfirmToast(""), 2500);
                              }}
                              style={{
                                padding: "7px 13px", borderRadius: 12, border: "none",
                                background: nationalityInputText.trim() ? (dark ? "rgba(34,211,238,0.22)" : "#0e7490") : (dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"),
                                color: nationalityInputText.trim() ? (dark ? "#67e8f9" : "#fff") : t.subText,
                                fontWeight: 800, fontSize: 12, fontFamily: "'Cairo',sans-serif",
                                cursor: nationalityInputText.trim() ? "pointer" : "not-allowed",
                                transition: "all 0.2s", whiteSpace: "nowrap",
                              }}
                            >
                              {lang === "ar" ? "تأكيد" : "Confirm"}
                            </button>
                          </>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                            <div style={{
                              flex: 1, padding: "7px 12px", borderRadius: 12,
                              border: `1px solid ${dark ? "rgba(34,197,94,0.35)" : "rgba(22,163,74,0.3)"}`,
                              background: dark ? "rgba(22,163,74,0.15)" : "rgba(220,252,231,0.8)",
                              color: dark ? "#86efac" : "#15803d", fontWeight: 800, fontSize: 12,
                              fontFamily: "'Cairo',sans-serif", display: "flex", alignItems: "center", gap: 6,
                            }}>
                              <span>✅</span>
                              <span>{selectedNationality}</span>
                            </div>
                            <button
                              onClick={() => { setNationalityEditMode(true); setNationalityInputText(selectedNationality); }}
                              style={{
                                padding: "7px 13px", borderRadius: 12, border: "none",
                                background: dark ? "rgba(255,255,255,0.09)" : "#e2e8f0",
                                color: t.text, fontWeight: 800, fontSize: 12,
                                fontFamily: "'Cairo',sans-serif", cursor: "pointer",
                                whiteSpace: "nowrap", transition: "all 0.2s",
                              }}
                            >
                              {lang === "ar" ? "تغيير" : "Change"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
                    {topCountries.map((country) => (
                      <button
                        key={country.name}
                        onClick={() => handleCountrySelect(country.name)}
                        disabled={!hasSelectedNationality}
                        className="landing-country-card"
                        style={{
                          background: "transparent",
                          border: "none",
                          borderRadius: 0,
                          padding: 0,
                          cursor: !hasSelectedNationality ? "not-allowed" : "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          boxShadow: "none",
                          minHeight: 0,
                          transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                          outline: "none",
                          opacity: !hasSelectedNationality ? 0.58 : 1,
                          filter: !hasSelectedNationality ? "grayscale(0.25)" : "none",
                        }}
                      >
                        <div
                          className="inner-country-square"
                          style={{
                          width: "auto",
                          height: "auto",
                          borderRadius: 0,
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "none",
                        }}>
                          <img
                            src={country.flagImg}
                            alt={country.name}
                            className="country-flag-img"
                            style={{
                              width: 44.1,
                              height: 44.1,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11.6, fontWeight: 700, color: t.text, textAlign: "center", lineHeight: 1.45, fontFamily: "'Cairo',sans-serif" }}>
                          {lang === "ar"
                            ? (country.name === "المملكة العربية السعودية"
                              ? "السعودية"
                              : country.name === "الإمارات العربية المتحدة"
                                ? "الإمارات"
                                : country.name)
                            : (countryNamesEn[country.name] || country.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                  {!hasSelectedNationality && (
                    <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: dark ? "#cbd5e1" : "#64748b", textAlign: "center", fontFamily: "'Cairo',sans-serif" }}>
                      {lang === "ar" ? "اختر الجنسية أولًا لتفعيل الدول." : "Choose your nationality first to enable countries."}
                    </div>
                  )}
                  <div style={{ marginTop: 11, borderRadius: 18, padding: "6px 14px", background: dark ? "linear-gradient(135deg, rgba(22,163,74,0.18), rgba(34,197,94,0.10))" : "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid rgba(34,197,94,0.28)", textAlign: "center", boxShadow: dark ? "0 0 24px rgba(34,197,94,0.16), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 0 18px rgba(34,197,94,0.16), 0 10px 24px rgba(34,197,94,0.10)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -18, left: lang === "ar" ? "auto" : -18, right: lang === "ar" ? -18 : "auto", width: 74, height: 74, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.22), rgba(74,222,128,0))" }} />
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#15803d", lineHeight: 1.35, fontFamily: "'Cairo',sans-serif", position: "relative", textShadow: dark ? "0 0 10px rgba(74,222,128,0.18)" : "0 1px 0 rgba(255,255,255,0.45)" }}>
                      {lang === "ar" ? "ملحوظة: جميع المستخدمين يمكنهم الدخول إلى أي دولة وطلب الخدمة بكل سهولة." : "Note: All users can enter any country page and request the service easily."}
                    </div>
                  </div>

                  {(() => {
                    const isLockedLinks = !authPreviewUser;
                    const handleLinkClick = (e, href) => {
                      if (isLockedLinks) {
                        e.preventDefault();
                        setModal({
                          type: "guestLinksAlert",
                          title: lang === "ar" ? "تسجيل الدخول مطلوب" : "Login Required",
                          msg: lang === "ar" ? "يجب تسجيل الدخول أو إنشاء حساب جديد للوصول إلى هذا الرابط" : "You must sign in or create an account to access this link"
                        });
                      }
                    };
                    return (
                    <div style={{ marginTop: 10.4, borderRadius: 20, padding: "7.6px 10px 8.4px", background: dark ? "rgba(255,255,255,0.04)" : "#ffffff", border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)"}`, boxShadow: dark ? "none" : "0 4px 20px rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", fontSize: 9.6, color: dark ? "#94a3b8" : "#475569", fontWeight: 800, marginBottom: 6, fontFamily: "'Cairo',sans-serif" }}>
                        {lang === "ar" ? "روابط مهمة" : "Important Links"}
                      </div>
                      <div className="landing-links-row">
                        {[
                          { key: "passport-book", icon: "📖", labelAr: "كتاب المرور", labelEn: "Passport Book", href: "https://drive.google.com/file/d/1IRen7Ud-lVEoMM1n97Tul6hYhVJrLPNg/view?usp=sharing", accent: "#2563eb", bg: "linear-gradient(145deg, #93c5fd, #3b82f6)", shadow: "rgba(59,130,246,0.45)" },
                          { key: "qiwa", icon: "🧭", labelAr: "منصة قوي", labelEn: "Qiwa", href: "https://www.qiwa.sa/", accent: "#16a34a", bg: "linear-gradient(145deg, #86efac, #22c55e)", shadow: "rgba(34,197,94,0.45)" },
                          { key: "gosi", icon: "🛡️", labelAr: "التأمينات", labelEn: "GOSI", href: "https://www.gosi.gov.sa/", accent: "#0891b2", bg: "linear-gradient(145deg, #67e8f9, #06b6d4)", shadow: "rgba(6,182,212,0.45)" },
                          { key: "labor-law", icon: "⚖️", labelAr: "قانون العمل", labelEn: "Labor Law", href: "https://www.hrsd.gov.sa/knowledge-centre/decisions-and-regulations/regulation-and-procedures/%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84", accent: "#d97706", bg: "linear-gradient(145deg, #fde68a, #f59e0b)", shadow: "rgba(245,158,11,0.45)" },
                          { key: "end-service", icon: "🧮", labelAr: "نهاية الخدمة", labelEn: "End Service", href: "https://www.hrsd.gov.sa/ministry-services/services/end-service-benefit-calculator", accent: "#e11d48", bg: "linear-gradient(145deg, #fca5a5, #f43f5e)", shadow: "rgba(244,63,94,0.45)" },
                        ].map((item, idx) => (
                          <a
                            key={item.key}
                            href={item.href}
                            target={isLockedLinks ? undefined : "_blank"}
                            rel={isLockedLinks ? undefined : "noreferrer"}
                            onClick={(e) => handleLinkClick(e, item.href)}
                            className="landing-link-tile"
                            style={{ animationDelay: `${idx * 0.08}s`, cursor: "pointer" }}
                          >
                            <div className="landing-link-orb" style={{ background: item.bg, boxShadow: `0 6px 18px ${item.shadow}` }}>
                              {item.icon}
                            </div>
                            <span className="landing-link-label" style={{ color: dark ? "#e2e8f0" : "#0f172a" }}>
                              {lang === "ar" ? item.labelAr : item.labelEn}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                    );
                  })()}

                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 16,
                      minHeight: adRemote.enabled && adRemote.imageUrl ? 0 : 190,
                      padding: adRemote.enabled && adRemote.imageUrl ? 0 : "12px 12px",
                      border: `1px dashed ${dark ? "rgba(148,163,184,0.42)" : "rgba(100,116,139,0.34)"}`,
                      background: adRemote.enabled && adRemote.imageUrl ? "transparent" : (dark
                        ? "linear-gradient(135deg, rgba(30,41,59,0.42), rgba(15,23,42,0.30))"
                        : "linear-gradient(135deg, #f8fafc, #f1f5f9)"),
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      overflow: "hidden",
                    }}
                  >
                    {!(adRemote.enabled && adRemote.imageUrl) && (
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: `1px solid ${dark ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.28)"}`,
                        background: dark ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.82)",
                        color: dark ? "#cbd5e1" : "#64748b",
                        fontFamily: "'Cairo',sans-serif",
                        pointerEvents: "none",
                      }}
                    >
                      {lang === "ar" ? "مساحة إعلانية" : "Ad Space"}
                    </div>
                    )}
                    {adRemote.enabled && adRemote.imageUrl ? (
                      adRemote.linkUrl ? (
                        <a
                          href={adRemote.linkUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ display: "block", width: "100%", lineHeight: 0 }}
                        >
                          <img
                            src={adRemote.imageUrl}
                            alt="ad"
                            style={{ width: "100%", height: "auto", display: "block", borderRadius: 14 }}
                          />
                        </a>
                      ) : (
                        <img
                          src={adRemote.imageUrl}
                          alt="ad"
                          style={{ width: "100%", height: "auto", display: "block", borderRadius: 14 }}
                        />
                      )
                    ) : landingAdConfig.enabled ? (
                      !isNativePlatform ? (
                        <div style={{ width: "100%" }}>
                          <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 8, color: dark ? "#cbd5e1" : "#64748b", fontFamily: "'Cairo',sans-serif" }}>
                            {lang === "ar" ? "إعلان ممول" : "Sponsored"}
                          </div>
                          <ins
                            className="adsbygoogle"
                            style={{ display: "block", width: "100%", minHeight: 50 }}
                            data-ad-client={landingAdConfig.web.client}
                            data-ad-slot={landingAdConfig.web.slot}
                            data-ad-format="auto"
                            data-full-width-responsive="true"
                          />
                        </div>
                      ) : (
                        <div style={{ fontFamily: "'Cairo',sans-serif" }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a" }}>
                            {lang === "ar" ? "موضع إعلان التطبيق (AdMob)" : "App Ad Slot (AdMob)"}
                          </div>
                          <div style={{ fontSize: 9, marginTop: 4, color: dark ? "#94a3b8" : "#64748b" }}>
                            {landingAdConfig.mobile.androidUnitId}
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ fontFamily: "'Cairo',sans-serif", maxWidth: 320, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a", marginTop: 8 }}>
                          {lang === "ar" ? "هل تريد الإعلان في التطبيق؟" : "Want to advertise in the app?"}
                        </div>
                        <a
                          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                            lang === "ar"
                              ? "مرحبًا، أرغب في حجز إعلان داخل المساحة الإعلانية في التطبيق."
                              : "Hello, I want to book an ad inside the app ad space."
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ads-contact-link"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            minHeight: 38,
                            padding: "8px 14px",
                            borderRadius: 12,
                            textDecoration: "none",
                            fontSize: 11,
                            fontWeight: 900,
                            fontFamily: "'Cairo',sans-serif",
                            color: "#0f172a",
                            border: "none",
                            background: "transparent",
                            boxShadow: "none",
                          }}
                        >
                          <span style={{ fontSize: 16, lineHeight: 1 }}>📱</span>
                          <span>{lang === "ar" ? "تواصل للإعلان عبر واتساب" : "Contact via WhatsApp for Ads"}</span>
                        </a>
                      </div>
                    )}
                    {!adRemote.enabled && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "100%",
                        fontSize: 9,
                        fontWeight: 700,
                        color: dark ? "#94a3b8" : "#64748b",
                        fontFamily: "'Cairo',sans-serif",
                        lineHeight: 1.35,
                        textAlign: "center",
                        pointerEvents: "none",
                        padding: "0 12px",
                      }}
                    >
                      {lang === "ar" ? "مقاس صورة الإعلان المناسب: 1280×330 بكسل (نسبة 4:1)" : "Recommended ad image size: 1280x330 px (4:1 ratio)"}
                    </div>
                    )}
                  </div>

                  {/* ── Site info box below ad ── */}
                  <div
                    dir="rtl"
                    style={{
                      marginTop: 10,
                      borderRadius: 16,
                      border: `1px dashed ${dark ? "rgba(148,163,184,0.42)" : "rgba(100,116,139,0.34)"}`,
                      background: dark ? "rgba(30,41,59,0.42)" : "#f8fafc",
                      padding: "8px 14px",
                      textAlign: "center",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 11, color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.7 }}>
                      منصة لمكاتب السفريات الموثوقة وخدمات السفر والعمل.
                      {" "}
                      <a href="/privacy-policy.html" style={{ color: dark ? "#7dd3fc" : "#0369a1", fontSize: 11 }}>سياسة الخصوصية</a>
                      {" · "}
                      <a href="/terms.html" style={{ color: dark ? "#7dd3fc" : "#0369a1", fontSize: 11 }}>الشروط</a>
                      {" · "}
                      <a href="/contact.html" style={{ color: dark ? "#7dd3fc" : "#0369a1", fontSize: 11 }}>اتصل بنا</a>
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* ── HOME VIEW (Egypt) ──────────────────────────────────────── */}
            {view === "home" && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: `${t.gold}18`, border: `1px solid ${t.gold}40`, color: t.gold, display: "block", textAlign: "center" }}>{tx.licensedTag}</div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: lang === "ar" ? "right" : "left", margin: "6px 0" }}>{tx.chooseGov}</h1>
                  <p style={{ ...styles.heroSub, color: t.subText, textAlign: "center" }}>{tx.heroSub}</p>
                </div>

                {isAdminUser && (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                    <button
                      onClick={openAdminAddOfficeModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        border: "1px solid #15803d",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#ffffff",
                        borderRadius: 14,
                        padding: "8px 14px",
                        fontSize: 12,
                        fontWeight: 900,
                        fontFamily: "'Cairo',sans-serif",
                        cursor: "pointer",
                        boxShadow: "0 10px 18px rgba(22,163,74,0.24)",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>➕</span>
                      <span>{lang === "ar" ? "إضافة مكتب جديد" : "Add New Office"}</span>
                    </button>
                  </div>
                )}

                {/* Gov grid */}
                <div style={styles.govGrid}>
                  {egyptGovernorates.map((gov) => {
                    const count = govCount(gov.name);
                    const guestVisibleCount = isGuestUser ? Math.min(count, count < 20 ? 1 : 3) : count;
                    const guestLockedCount = isGuestUser ? Math.max(0, count - guestVisibleCount) : 0;
                    return (
                      <button key={gov.name} onClick={() => count > 0 ? handleGovSelect(gov.name) : null}
                        className="gov-card-premium"
                        style={{
                          ...styles.govCard,
                          background: dark
                            ? "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))"
                            : "linear-gradient(145deg, #ffffff, #f8faff)",
                          border: `1px solid ${count > 0 ? (dark ? "rgba(130,160,220,0.18)" : "rgba(30,64,175,0.1)") : t.border}`,
                          boxShadow: dark
                            ? "0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
                            : "0 2px 12px rgba(15,27,58,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
                          backdropFilter: dark ? "blur(10px)" : "none",
                          opacity: count === 0 ? 0.45 : 1,
                          cursor: count === 0 ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          textAlign: "left",
                          minHeight: 80,
                          padding: "10px 8px",
                          direction: "ltr",
                        }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          background: dark
                            ? `linear-gradient(145deg, ${t.gold}28, ${t.gold}12)`
                            : `linear-gradient(145deg, ${t.gold}20, ${t.gold}08)`,
                          color: t.gold,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                          boxShadow: `0 0 10px ${t.gold}25`,
                        }}>{gov.icon}</div>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: lang === "ar" ? "flex-end" : "flex-start", textAlign: lang === "ar" ? "right" : "left", justifyContent: "center", lineHeight: 1.25 }}>
                          <div style={{ fontSize: lang === "en" ? 9.1 : 10.5, fontWeight: 800, color: t.text, marginBottom: 3, lineHeight: 1.3 }}>{lang === "en" ? gov.nameEn : gov.name}</div>
                          <div style={{ fontSize: 9.8, fontWeight: 700, color: count > 0 ? t.gold : t.subText, lineHeight: 1.2 }}>{count > 0 ? `${guestVisibleCount} ${lang === "en" ? "offices" : "مكتب"}` : tx.comingSoon}</div>
                          {guestLockedCount > 0 && (
                            <div style={{ fontSize: 9, fontWeight: 800, color: dark ? "#f87171" : "#dc2626", lineHeight: 1.2 }}>
                              {lang === "ar" ? `${guestLockedCount} مكتب مقفول للضيف` : `${guestLockedCount} offices locked for guest`}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

            {view === "egyptForbidden" && (
              <div>
                <a href="https://www.manpower.gov.eg/Prohibitedcompanies.html" target="_blank" rel="noreferrer"
                  style={{ display: "block", textDecoration: "none", borderRadius: 18, border: "2px solid #e53e3e60", background: dark ? "rgba(229,62,62,0.09)" : "rgba(229,62,62,0.06)", padding: "16px 18px", margin: "6px 0 12px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, [lang === "ar" ? "right" : "left"]: 0, width: 5, height: "100%", background: "linear-gradient(180deg,#e53e3e,#c53030)", borderRadius: lang === "ar" ? "0 16px 16px 0" : "16px 0 0 16px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>🚫</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#e53e3e", fontFamily: "'Cairo',sans-serif", flex: 1 }}>{tx.forbiddenTitle}</span>
                  </div>
                  <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.72)" : "#666", fontFamily: "'Cairo',sans-serif", lineHeight: 1.9, marginBottom: 12 }}>
                    {lang === "ar" ? "يجب التأكد من مصداقية المكتب ورقم الترخيص قبل التعامل أو دفع أي مبالغ. راجع القائمة الرسمية للشركات المحظورة أولًا." : "You should verify office credibility and license number before any deal or payment. Review the official blocked offices list first."}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e53e3e1a", border: "1px solid #e53e3e50", borderRadius: 20, padding: "6px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#e53e3e", fontFamily: "'Cairo',sans-serif" }}>{tx.forbiddenLink}</span>
                  </div>
                </a>
              </div>
            )}

            {view === "egyptEmbassies" && !isOtherNationalitySelected && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: dark ? "rgba(14,165,233,0.16)" : "rgba(14,165,233,0.10)", border: "1px solid rgba(14,165,233,0.28)", color: dark ? "#67e8f9" : "#0f766e", display: "block", textAlign: "center" }}>
                    {lang === "ar" ? "تواصل مع سفارتك داخل مصر" : "Contact Your Embassy Inside Egypt"}
                  </div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: "center", margin: "6px 0 10px" }}>
                    {lang === "ar" ? "السفارات" : "Embassies"}
                  </h1>
                  <p style={{ ...styles.heroSub, color: t.subText, textAlign: "center" }}>
                    {lang === "ar" ? `نعرض لك سفارتك داخل مصر حسب الجنسية المختارة${selectedNationality ? `: ${selectedNationality}` : ""}` : `Your embassy inside Egypt appears here based on your selected nationality${selectedNationality ? `: ${countryNamesEn[selectedNationality] || selectedNationality}` : ""}`}
                  </p>
                </div>

                <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}` }}>
                  {nationalityEmbassyCountry && (
                    <div style={{ marginBottom: 14, borderRadius: 16, padding: "14px 14px 12px", background: dark ? "linear-gradient(135deg, rgba(8,145,178,0.24), rgba(14,165,233,0.10))" : "linear-gradient(135deg, #ecfeff, #e0f2fe)", border: "1px solid rgba(14,165,233,0.28)", boxShadow: dark ? "0 0 22px rgba(14,165,233,0.18)" : "0 12px 24px rgba(14,165,233,0.12)" }}>
                      <div style={{ color: dark ? "#67e8f9" : "#0f766e", fontSize: 12, fontWeight: 900, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
                        {lang === "ar" ? "سفارتك داخل مصر" : "Your Embassy In Egypt"}
                      </div>
                      <button
                        onClick={() => setSelectedEmbassyCountry(nationalityEmbassyCountry.nationality)}
                        style={{
                          width: "100%",
                          background: selectedEmbassy?.nationality === nationalityEmbassyCountry.nationality ? "rgba(14,165,233,0.10)" : "#ffffff",
                          border: `1px solid ${selectedEmbassy?.nationality === nationalityEmbassyCountry.nationality ? "#0ea5e9" : t.border}`,
                          borderRadius: 14,
                          padding: "12px 10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          fontFamily: "'Cairo',sans-serif"
                        }}
                      >
                        <img src={nationalityEmbassyCountry.flagImg} alt={nationalityEmbassyCountry.name} style={{ width: 44, height: 30, borderRadius: 8, objectFit: "cover", border: `1px solid ${t.border}` }} />
                        <div style={{ flex: 1, textAlign: lang === "ar" ? "right" : "left" }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: t.text }}>
                            {lang === "ar" ? nationalityEmbassyCountry.officialContacts.embassy.name : (nationalityEmbassyCountry.officialContacts.embassy.nameEn || nationalityEmbassyCountry.officialContacts.embassy.name)}
                          </div>
                          <div style={{ fontSize: 11, color: t.subText, marginTop: 2 }}>
                            {lang === "ar" ? nationalityEmbassyCountry.name : (nationalityEmbassyCountry.nameEn || nationalityEmbassyCountry.name)}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {!selectedEmbassy && (
                    <div style={{ marginBottom: 14, borderRadius: 14, padding: "10px 12px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", border: `1px solid ${t.border}`, color: t.subText, fontSize: 11, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
                      {lang === "ar" ? "لا توجد بيانات سفارة متاحة لهذه الجنسية داخل مصر حاليًا." : "No embassy data is currently available for this nationality inside Egypt."}
                    </div>
                  )}

                  {selectedEmbassy && (
                    <>
                      <div style={{ color: dark ? "#67e8f9" : "#0f766e", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                        {selectedEmbassy.flag} {lang === "ar"
                          ? selectedEmbassy.officialContacts.embassy.name
                          : (selectedEmbassy.officialContacts.embassy.nameEn || selectedEmbassy.officialContacts.embassy.name)}
                      </div>
                      {selectedEmbassy.officialContacts.embassy.address && (
                        <InfoRow label={tx.address} value={selectedEmbassy.officialContacts.embassy.address} />
                      )}
                      {selectedEmbassy.officialContacts.embassy.phone && selectedEmbassy.officialContacts.embassy.phone !== "-" && (
                        <InfoRow label={tx.phone} value={selectedEmbassy.officialContacts.embassy.phone} color={dark ? "#67e8f9" : "#0f766e"} />
                      )}
                      {selectedEmbassy.officialContacts.embassy.website && selectedEmbassy.officialContacts.embassy.website !== "-" && (
                        <InfoRow label={tx.website} value={selectedEmbassy.officialContacts.embassy.website} color="#60a5fa" />
                      )}
                      {selectedEmbassy.officialContacts.embassy.email && selectedEmbassy.officialContacts.embassy.email !== "-" && (
                        <InfoRow label={tx.email} value={selectedEmbassy.officialContacts.embassy.email} color="#60a5fa" />
                      )}
                      {selectedEmbassy.officialContacts.embassy.whatsapp && (
                        <InfoRow label={tx.whatsappLabel} value={selectedEmbassy.officialContacts.embassy.whatsapp} />
                      )}
                      {selectedEmbassy.officialContacts.embassy.facebook && (
                        <InfoRow label={tx.facebookLabel} value={selectedEmbassy.officialContacts.embassy.facebook} color="#60a5fa" />
                      )}
                      {selectedEmbassy.officialContacts.embassy.note && (
                        <div style={{ color: t.subText, fontSize: 10, marginTop: 8, fontStyle: "italic" }}>
                          ℹ️ {lang === "ar"
                            ? selectedEmbassy.officialContacts.embassy.note
                            : (selectedEmbassy.officialContacts.embassy.noteEn || selectedEmbassy.officialContacts.embassy.note)}
                        </div>
                      )}
                      {selectedEmbassy.officialContacts.embassy.phone && selectedEmbassy.officialContacts.embassy.phone !== "-" && (
                        <div style={{ marginTop: 12 }}>
                          <a
                            href={`tel:${selectedEmbassy.officialContacts.embassy.phone}`}
                            style={{
                              display: "block",
                              background: "rgba(14,165,233,0.10)",
                              border: "1px solid rgba(14,165,233,0.24)",
                              borderRadius: 10,
                              padding: "10px",
                              textAlign: "center",
                              color: dark ? "#67e8f9" : "#0f766e",
                              fontWeight: 700,
                              fontSize: 13,
                              textDecoration: "none",
                              fontFamily: "'Cairo',sans-serif"
                            }}
                          >
                            {tx.callEmbassy}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {view === "egyptServices" && (
              <div>
                <React.Suspense fallback={null}>
                <PaidFlowErrorBoundary lang={lang} resetKey={`eg-${selectedCountry}-${egyptServicesBackRequest}`}>
                  <PaidServicesFlow services={tx.egServices} lang={lang} dark={dark} selectedCountry={selectedCountry} selectedCity={""} selectedNationality={selectedNationality} isAdminUser={isAdminUser} canManageServiceReviews={canManageOrderReviews} onScreenChange={setEgyptServicesScreen} backRequestToken={egyptServicesBackRequest} isGuestUser={isGuestUser} />
                </PaidFlowErrorBoundary>
                </React.Suspense>

                {egyptServicesScreen === "list" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12, marginBottom: 12, alignItems: "stretch" }}>
                    <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.gold, marginBottom: 10 }}>🏛️ {lang === "ar" ? "وزارة العمل" : "Ministry"}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                        <span style={{ color: t.subText, fontSize: 10 }}>{tx.unifiedPhone}</span>
                        <span style={{ color: t.gold, fontSize: 11, fontWeight: 700, direction: "ltr" }}>08008880</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                        <span style={{ color: t.subText, fontSize: 10 }}>{tx.hotline}</span>
                        <span style={{ color: t.gold, fontSize: 11, fontWeight: 700, direction: "ltr" }}>19468</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                        <span style={{ color: t.subText, fontSize: 10 }}>{tx.workHours}</span>
                        <span style={{ color: t.text, fontSize: 10, fontWeight: 600 }}>{lang === "ar" ? "أحد - خميس  9ص - 3م" : "Sun–Thu  9AM–3PM"}</span>
                      </div>
                      <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                        <a href="tel:08008880" style={{ display: "block", background: `${t.gold}18`, border: `1px solid ${t.gold}40`, borderRadius: 8, padding: "7px 4px", textAlign: "center", color: t.gold, fontWeight: 700, fontSize: 11, textDecoration: "none", fontFamily: "'Cairo',sans-serif" }}>{tx.callMinistry}</a>
                        <a href="https://manpower.gov.eg" target="_blank" rel="noreferrer" style={{ display: "block", background: "#1d4ed818", border: "1px solid #1d4ed840", borderRadius: 8, padding: "7px 4px", textAlign: "center", color: "#60a5fa", fontWeight: 700, fontSize: 11, textDecoration: "none", fontFamily: "'Cairo',sans-serif" }}>{tx.visitSite}</a>
                      </div>
                    </div>

                    <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fc8181", marginBottom: 10 }}>🚨 {lang === "ar" ? "الطوارئ" : "Emergency"}</div>
                      {egyptEmergency.map((em, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                          <span style={{ color: t.subText, fontSize: 10 }}>{lang === "ar" ? em.ar : em.en}</span>
                          <a href={`tel:${em.number}`} style={{ background: "#e53e3e18", color: "#fc8181", borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 700, textDecoration: "none", border: "1px solid #e53e3e30", direction: "ltr" }}>{em.number}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === "countryMenu" && country && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: `${t.gold}18`, border: `1px solid ${t.gold}40`, color: t.gold, display: "block", textAlign: "center" }}>
                    {lang === "ar" ? `${country.flag} بوابات ${country.name}` : `${country.flag} ${countryNamesEn[country.name] || country.name} Sections`}
                  </div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: "center", margin: "6px 0 10px" }}>
                    {lang === "ar" ? "اختر القسم" : "Choose a Section"}
                  </h1>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    onClick={() => { setView("countryTrusted"); }}
                    className="section-card"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textAlign: lang === "ar" ? "right" : "left",
                      background: dark ? "linear-gradient(135deg, rgba(22,163,74,0.24), rgba(34,197,94,0.10))" : "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                      border: "1px solid #16a34a33",
                      borderRadius: 22,
                      padding: "12px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minHeight: 82,
                      overflow: "hidden",
                      boxShadow: dark ? "0 0 16px #16a34a16" : "0 10px 22px #16a34a10",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid #16a34a28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏙️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a", marginBottom: 3 }}>{lang === "ar" ? "المكاتب الموثوقة" : "Trusted Offices"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? "ادخل إلى المحتوى الموثوق الحالي كما هو داخل هذه الدولة." : "Open the trusted verified content inside this country."}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#16a34a18", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                  </button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                    <div
                      className="section-card"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        textAlign: lang === "ar" ? "right" : "left",
                        background: dark ? "linear-gradient(135deg, rgba(229,62,62,0.12), rgba(229,62,62,0.06))" : "linear-gradient(135deg, #fff5f5, #fffafa)",
                        border: "1px solid #e53e3e28",
                        borderRadius: 22,
                        padding: "12px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        boxShadow: dark ? "0 0 18px #e53e3e14" : "0 10px 22px #e53e3e0d",
                        fontFamily: "'Cairo',sans-serif",
                        minHeight: 82,
                        overflow: "hidden",
                        opacity: 0.86
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid #e53e3e20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚫</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: "#e53e3e" }}>{lang === "ar" ? "مكاتب محظورة" : "Blocked Offices"}</div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#e53e3e", background: "#e53e3e14", border: "1px solid #e53e3e28", borderRadius: 999, padding: "2px 7px" }}>{lang === "ar" ? "قريبًا" : "Soon"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? "هذا القسم سيُضاف لاحقًا في هذه الدولة." : "This section will be added later for this country."}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setCountryPaidScreen("list"); setView("countryPaid"); }}
                    className="section-card"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textAlign: lang === "ar" ? "right" : "left",
                      background: dark ? "linear-gradient(135deg, rgba(14,116,144,0.24), rgba(6,182,212,0.12))" : "linear-gradient(135deg, #ecfeff, #f0fdfa)",
                      border: "1px solid #0f766e33",
                      borderRadius: 22,
                      padding: "12px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minHeight: 82,
                      overflow: "hidden",
                      boxShadow: dark ? "0 0 16px #0f766e16" : "0 10px 22px #0f766e10",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid #0f766e28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🛂</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#0f766e", marginBottom: 3 }}>{lang === "ar" ? "خدمات مدفوعة" : "Paid Services"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? `هنا تجد الخدمات المدفوعة والوزارة والطوارئ في ${country.name}.` : `Here you will find paid services, ministry, and emergency contacts in ${countryNamesEn[country.name] || country.name}.`}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0f766e18", color: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                  </button>

                  <button
                    onClick={openProviderPortalOrPromptLogin}
                      className="section-card"
                      style={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textAlign: lang === "ar" ? "right" : "left",
                      background: dark ? "linear-gradient(135deg, rgba(202,138,4,0.24), rgba(245,158,11,0.10))" : "linear-gradient(135deg, #fffbeb, #fef3c7)",
                      border: "1px solid rgba(202,138,4,0.30)",
                      borderRadius: 22,
                      padding: "12px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      minHeight: 82,
                      overflow: "hidden",
                      boxShadow: dark ? "0 0 16px rgba(202,138,4,0.16)" : "0 10px 22px rgba(202,138,4,0.10)",
                      fontFamily: "'Cairo',sans-serif",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid rgba(202,138,4,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🧰</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: dark ? "#fde68a" : "#a16207", marginBottom: 3 }}>{lang === "ar" ? "ضيف خدمتك" : "Add Your Service"}</div>
                      <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? `سجل خدمتك داخل ${country.name} ليتم مراجعتها واعتمادها.` : `Submit your service in ${countryNamesEn[country.name] || country.name} for admin review and approval.`}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(202,138,4,0.16)", color: dark ? "#fde68a" : "#a16207", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                  </button>

                  {!isOtherNationalitySelected && (
                    <button
                      onClick={() => { setView("countryEmbassies"); }}
                      className="section-card"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        textAlign: lang === "ar" ? "right" : "left",
                        background: dark ? "linear-gradient(135deg, rgba(8,145,178,0.24), rgba(14,165,233,0.10))" : "linear-gradient(135deg, #ecfeff, #e0f2fe)",
                        border: "1px solid rgba(14,165,233,0.28)",
                        borderRadius: 22,
                        padding: "12px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        overflow: "hidden",
                        boxShadow: dark ? "0 0 16px rgba(14,165,233,0.16)" : "0 10px 22px rgba(14,165,233,0.10)",
                        fontFamily: "'Cairo',sans-serif",
                        minHeight: 82
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid rgba(14,165,233,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏛️</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: dark ? "#67e8f9" : "#0f766e", marginBottom: 3 }}>{lang === "ar" ? "تواصل مع سفارتك" : "Contact Your Embassy"}</div>
                        <div style={{ fontSize: 11, color: t.text, lineHeight: 1.65 }}>{lang === "ar" ? `الوصول السريع إلى سفارتك داخل ${country.name}${selectedNationality ? ` - الجنسية الحالية: ${selectedNationality}` : ""}` : `Quick access to your embassy inside ${countryNamesEn[country.name] || country.name}${selectedNationality ? ` - current nationality: ${countryNamesEn[selectedNationality] || selectedNationality}` : ""}`}</div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(14,165,233,0.16)", color: dark ? "#67e8f9" : "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                    </button>
                  )}

                </div>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    lang === "ar"
                      ? `مرحبًا، أحتاج مساعدة داخل أقسام ${country.name}.`
                      : `Hello, I need help inside ${countryNamesEn[country.name] || country.name} sections.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="support-whatsapp-tile"
                  style={{
                    marginTop: 14,
                    width: 125,
                    minHeight: 41,
                    maxWidth: "calc(100% - 6px)",
                    marginInlineStart: "auto",
                    borderRadius: 18,
                    border: "none",
                    background: "transparent",
                    color: t.text,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    textDecoration: "none",
                    padding: "5px 10px",
                    boxSizing: "border-box",
                    boxShadow: "none",
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    textAlign: "center",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>{lang === "ar" ? "الدعم الفني" : "Support"}</span>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    style={{ width: 31, height: 31, borderRadius: "50%", background: "#ffffff", padding: 2, flexShrink: 0 }}
                  />
                </a>
              </div>
            )}

            {view === "countryTrusted" && country && (
              <div>
                <div style={{ ...styles.listHeader, background: t.cardBg, borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{country.flag} <span style={{ color: t.gold }}>{lang === "ar" ? (country.name === "المملكة العربية السعودية" ? "السعودية" : country.name === "الإمارات العربية المتحدة" ? "الإمارات" : country.name) : (countryNamesEn[country.name] || country.name)}</span></div>
                </div>
                <div style={{ padding: "14px 0 4px" }}>
                  {selectedCountry !== "مصر" && (
                    <button
                      onClick={openOfficePortalOrPromptLogin}
                      style={{
                        width: "100%",
                        textAlign: lang === "ar" ? "right" : "left",
                        background: dark ? "linear-gradient(135deg, rgba(22,163,74,0.24), rgba(34,197,94,0.10))" : "linear-gradient(135deg, #ecfdf5, #dcfce7)",
                        border: "1px solid rgba(34,197,94,0.32)",
                        borderRadius: 20,
                        padding: "10px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        boxShadow: dark ? "0 0 18px rgba(34,197,94,0.18)" : "0 10px 22px rgba(34,197,94,0.12)",
                        fontFamily: "'Cairo',sans-serif",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: dark ? "rgba(255,255,255,0.05)" : "#ffffff", border: "1px solid rgba(34,197,94,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0 }}>🏢</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: "#16a34a" }}>{lang === "ar" ? "ضيف مكتبك" : "Add Your Office"}</div>
                          {String(providerApprovalSnapshot?.status || "").trim().toLowerCase() === "approved" && (
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e", flexShrink: 0 }} />
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: t.text, lineHeight: 1.6 }}>
                          {lang === "ar" ? "قدّم بيانات مكتبك كاملة للمراجعة والاعتماد." : "Submit full office data for review and approval."}
                        </div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#16a34a18", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                    </button>
                  )}
                  <div style={{ color: t.subText, fontSize: 11, marginBottom: 10 }}>
                    {selectedCountry === "المملكة العربية السعودية"
                      ? (lang === "ar" ? "اختر المدينة لعرض المكاتب الموثوقة المتاحة" : "Choose a city to browse available trusted offices")
                      : (lang === "ar" ? "اختر المدينة لعرض المكاتب المتاحة" : "Choose a city to browse available offices")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {country.cities.map(city => {
                      const cityTotalOffices = selectedCountry === "المملكة العربية السعودية"
                        ? ((saudiOfficesData?.[city] || []).length)
                        : effectiveOffices.filter((office) => isSameGovernorate(office.gov, city)).length;
                      const cityVisibleOffices = isGuestUser && (selectedCountry === "المملكة العربية السعودية")
                        ? Math.min(3, cityTotalOffices)
                        : cityTotalOffices;

                      return (
                      <button key={city} onClick={() => cityTotalOffices > 0 ? handleGovSelect(city) : openCityModal(lang === "en" ? (cityNamesEn[city] || city) : city)}
                        style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.2s", fontFamily: "'Cairo',sans-serif" }}>
                        <span style={{ fontSize: 28 }}>{selectedCountry === "المملكة العربية السعودية" ? (saudiCityIcons[city] || "🏙️") : (cityIcons[city] || "🏙️")}</span>
                        <span style={{ fontSize: 10, color: t.text, fontWeight: 600, textAlign: "center" }}>{lang === "en" ? (cityNamesEn[city] || city) : city}</span>
                        <span style={{ fontSize: 9, color: t.subText, textAlign: "center", lineHeight: 1.3 }}>
                          {selectedCountry === "المملكة العربية السعودية" && isGuestUser
                            ? (lang === "ar" ? `${cityVisibleOffices}/${cityTotalOffices} متاح للضيف` : `${cityVisibleOffices}/${cityTotalOffices} guest visible`)
                            : (lang === "ar" ? `${cityTotalOffices} مكتب` : `${cityTotalOffices} offices`)}
                        </span>
                      </button>
                    );
                    })}
                  </div>
                </div>
              </div>
            )}

            {view === "countryEmbassies" && country && !isOtherNationalitySelected && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: dark ? "rgba(14,165,233,0.16)" : "rgba(14,165,233,0.10)", border: "1px solid rgba(14,165,233,0.28)", color: dark ? "#67e8f9" : "#0f766e", display: "block", textAlign: "center" }}>
                    {lang === "ar" ? `تواصل مع سفارتك داخل ${country.name}` : `Contact Your Embassy In ${countryNamesEn[country.name] || country.name}`}
                  </div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: "center", margin: "6px 0 10px" }}>
                    {lang === "ar" ? "السفارات" : "Embassies"}
                  </h1>
                  <p style={{ ...styles.heroSub, color: t.subText, textAlign: "center" }}>
                    {lang === "ar" ? `سنعرض لك سفارتك داخل ${country.name} حسب الجنسية المختارة${selectedNationality ? `: ${selectedNationality}` : ""}` : `Your embassy inside ${countryNamesEn[country.name] || country.name} appears here based on your selected nationality${selectedNationality ? `: ${countryNamesEn[selectedNationality] || selectedNationality}` : ""}`}
                  </p>
                </div>

                <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}` }}>
                  {nationalityEmbassyCountry && (
                    <div style={{ marginBottom: 14, borderRadius: 16, padding: "14px 14px 12px", background: dark ? "linear-gradient(135deg, rgba(217,119,6,0.18), rgba(251,191,36,0.10))" : "linear-gradient(135deg, #fff7ed, #fef3c7)", border: `1px solid ${t.gold}40`, boxShadow: dark ? `0 0 22px ${t.gold}18` : `0 12px 24px ${t.gold}16` }}>
                      <div style={{ color: t.gold, fontSize: 12, fontWeight: 900, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
                        {lang === "ar" ? "سفارتك في هذه الدولة" : "Your Embassy In This Country"}
                      </div>
                      <button
                        onClick={() => setSelectedEmbassyCountry(nationalityEmbassyCountry.nationality)}
                        style={{
                          width: "100%",
                          background: selectedEmbassy?.nationality === nationalityEmbassyCountry.nationality ? `${t.gold}18` : "#ffffff",
                          border: `1px solid ${selectedEmbassy?.nationality === nationalityEmbassyCountry.nationality ? t.gold : t.border}`,
                          borderRadius: 14,
                          padding: "12px 10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          fontFamily: "'Cairo',sans-serif"
                        }}
                      >
                        <img src={nationalityEmbassyCountry.flagImg} alt={nationalityEmbassyCountry.name} style={{ width: 44, height: 30, borderRadius: 8, objectFit: "cover", border: `1px solid ${t.border}` }} />
                        <div style={{ flex: 1, textAlign: lang === "ar" ? "right" : "left" }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: t.text }}>
                            {lang === "ar" ? nationalityEmbassyCountry.officialContacts.embassy.name : (nationalityEmbassyCountry.officialContacts.embassy.nameEn || nationalityEmbassyCountry.officialContacts.embassy.name)}
                          </div>
                          <div style={{ fontSize: 11, color: t.subText, marginTop: 2 }}>
                            {lang === "ar" ? nationalityEmbassyCountry.name : (countryNamesEn[nationalityEmbassyCountry.name] || nationalityEmbassyCountry.name)}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {!selectedEmbassy && (
                    <div style={{ marginBottom: 14, borderRadius: 14, padding: "10px 12px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", border: `1px solid ${t.border}`, color: t.subText, fontSize: 11, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
                      {lang === "ar" ? `لا توجد بيانات سفارة متاحة لهذه الجنسية داخل ${country.name} حاليًا.` : `No embassy data is currently available for this nationality inside ${countryNamesEn[country.name] || country.name}.`}
                    </div>
                  )}

                  {selectedEmbassy && (
                    <>
                      <div style={{ color: t.gold, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                        {selectedEmbassy.flag} {lang === "ar"
                          ? selectedEmbassy.officialContacts.embassy.name
                          : (selectedEmbassy.officialContacts.embassy.nameEn || selectedEmbassy.officialContacts.embassy.name)}
                      </div>
                      {selectedEmbassy.officialContacts.embassy.address && (
                        <InfoRow label={tx.address} value={selectedEmbassy.officialContacts.embassy.address} />
                      )}
                      {selectedEmbassy.officialContacts.embassy.phone && selectedEmbassy.officialContacts.embassy.phone !== "-" && (
                        <InfoRow label={tx.phone} value={selectedEmbassy.officialContacts.embassy.phone} color={t.gold} />
                      )}
                      {selectedEmbassy.officialContacts.embassy.website && selectedEmbassy.officialContacts.embassy.website !== "-" && (
                        <InfoRow label={tx.website} value={selectedEmbassy.officialContacts.embassy.website} color="#60a5fa" />
                      )}
                      {selectedEmbassy.officialContacts.embassy.email && selectedEmbassy.officialContacts.embassy.email !== "-" && (
                        <InfoRow label={tx.email} value={selectedEmbassy.officialContacts.embassy.email} color="#60a5fa" />
                      )}
                      {selectedEmbassy.officialContacts.embassy.whatsapp && (
                        <InfoRow label={tx.whatsappLabel} value={selectedEmbassy.officialContacts.embassy.whatsapp} />
                      )}
                      {selectedEmbassy.officialContacts.embassy.facebook && (
                        <InfoRow label={tx.facebookLabel} value={selectedEmbassy.officialContacts.embassy.facebook} color="#60a5fa" />
                      )}
                      {selectedEmbassy.officialContacts.embassy.note && (
                        <div style={{ color: t.subText, fontSize: 10, marginTop: 8, fontStyle: "italic" }}>
                          ℹ️ {lang === "ar"
                            ? selectedEmbassy.officialContacts.embassy.note
                            : (selectedEmbassy.officialContacts.embassy.noteEn || selectedEmbassy.officialContacts.embassy.note)}
                        </div>
                      )}
                      {selectedEmbassy.officialContacts.embassy.phone && selectedEmbassy.officialContacts.embassy.phone !== "-" && (
                        <div style={{ marginTop: 12 }}>
                          <a
                            href={`tel:${selectedEmbassy.officialContacts.embassy.phone}`}
                            style={{
                              display: "block",
                              background: `${t.gold}18`,
                              border: `1px solid ${t.gold}40`,
                              borderRadius: 10,
                              padding: "10px",
                              textAlign: "center",
                              color: t.gold,
                              fontWeight: 700,
                              fontSize: 13,
                              textDecoration: "none",
                              fontFamily: "'Cairo',sans-serif"
                            }}>
                            {tx.callEmbassy}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {view === "countryPaid" && country && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: `${t.gold}18`, border: `1px solid ${t.gold}40`, color: t.gold, display: "block", textAlign: "center" }}>
                    {lang === "ar" ? `الخدمات المدفوعة - ${country.name}` : `Paid Services - ${countryNamesEn[country.name] || country.name}`}
                  </div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: "center", margin: "6px 0 10px" }}>
                    {lang === "ar" ? "الخدمات المدفوعة" : "Paid Services"}
                  </h1>
                  <p style={{ ...styles.heroSub, color: t.subText, textAlign: "center" }}>
                    {lang === "ar" ? `هنا تظهر خدمات ${country.name} المدفوعة فقط.` : `Only the paid services of ${countryNamesEn[country.name] || country.name} appear here.`}
                  </p>
                </div>
                <React.Suspense fallback={null}>
                <PaidFlowErrorBoundary lang={lang} resetKey={`country-${selectedCountry}-${countryPaidBackRequest}`}>
                  <PaidServicesFlow
                    services={selectedCountry === "المملكة العربية السعودية" ? tx.countryServices : tx.otherCountryServices}
                    lang={lang}
                    dark={dark}
                    selectedCountry={selectedCountry}
                    selectedCity=""
                    selectedNationality={selectedNationality}
                    isAdminUser={isAdminUser}
                    canManageServiceReviews={canManageOrderReviews}
                    onScreenChange={setCountryPaidScreen}
                    backRequestToken={countryPaidBackRequest}
                    isGuestUser={isGuestUser}
                  />
                </PaidFlowErrorBoundary>
                </React.Suspense>
              </div>
            )}

            {view === "providerPortal" && (
              <div>
                <div style={styles.hero}>
                  <div style={{ ...styles.heroTag, background: `${t.gold}18`, border: `1px solid ${t.gold}40`, color: t.gold, display: "block", textAlign: "center" }}>
                    {providerPortalMode === "office"
                      ? (lang === "ar"
                        ? `بوابة إضافة المكاتب - ${selectedCountry}`
                        : `Office Submission Portal - ${countryNamesEn[selectedCountry] || selectedCountry}`)
                      : (lang === "ar"
                        ? `بوابة إضافة الخدمات - ${selectedCountry}`
                        : `Service Submission Portal - ${countryNamesEn[selectedCountry] || selectedCountry}`)}
                  </div>
                  <h1 style={{ ...styles.heroTitle, color: t.text, textAlign: "center", margin: "6px 0 10px" }}>
                    {providerPortalMode === "office"
                      ? (lang === "ar" ? "ضيف مكتبك" : "Add Your Office")
                      : (lang === "ar" ? "ضيف خدمتك" : "Add Your Service")}
                  </h1>
                  <p style={{ ...styles.heroSub, color: t.subText, textAlign: "center" }}>
                    {providerPortalMode === "office"
                      ? (lang === "ar"
                        ? "قدّم بيانات مكتبك وسيتم مراجعة الطلب ثم اعتماد/رفض الحالة من الأدمن."
                        : "Submit your office details, then admin will approve/reject your request status.")
                      : (lang === "ar"
                        ? "قدّم بيانات خدمتك وسيتم مراجعة الطلب ثم اعتماد/رفض الحالة من الأدمن."
                        : "Submit your service details, then admin will approve/reject your request status.")}
                  </p>
                </div>

                {providerPortalMode === "office" && selectedCountry === "مصر" ? (
                  <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, color: t.text, textAlign: "center", fontSize: 12, fontWeight: 800, lineHeight: 1.8 }}>
                    {lang === "ar"
                      ? "خدمة إضافة مكتب متاحة لكل الدول ماعدا مصر."
                      : "Add Office is available for all countries except Egypt."}
                  </div>
                ) : providerAllRequests.some((r) => String(r?.status || "").trim().toLowerCase() === "approved") && !providerPortalAddNew ? (
                  (() => {
                    const approvedReq = providerAllRequests.find((r) => String(r?.status || "").trim().toLowerCase() === "approved");
                    const otherReqs = providerAllRequests.filter((r) => r.id !== approvedReq?.id);
                    const statusLabel = (s) => {
                      const st = String(s || "").trim().toLowerCase();
                      if (st === "approved") return { label: lang === "ar" ? "✅ معتمد" : "✅ Approved", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.18)" : "#dcfce7" };
                      if (st === "rejected") return { label: lang === "ar" ? "❌ مرفوض" : "❌ Rejected", color: "#dc2626", bg: dark ? "rgba(220,38,38,0.18)" : "#fee2e2" };
                      return { label: lang === "ar" ? "⏳ قيد المراجعة" : "⏳ Pending", color: t.gold, bg: dark ? `${t.gold}20` : "#fef9c3" };
                    };
                    return (
                      <div style={{ padding: "0 0 16px", fontFamily: "'Cairo',sans-serif" }}>

                        {/* ─ بطاقة الحساب المعتمد ─ */}
                        <div style={{ borderRadius: 20, border: "1px solid rgba(34,197,94,0.38)", background: dark ? "linear-gradient(135deg,rgba(22,163,74,0.22),rgba(34,197,94,0.10))" : "linear-gradient(135deg,#ecfdf5,#dcfce7)", padding: "16px", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 46, height: 46, borderRadius: 16, background: dark ? "rgba(255,255,255,0.07)" : "#ffffff", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🧰</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                                <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a" }}>{lang === "ar" ? "بورتال مزود الخدمة" : "Service Provider Portal"}</div>
                                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e88", flexShrink: 0 }} />
                              </div>
                              <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>✅ {lang === "ar" ? "حسابك نشط ومعتمد" : "Your account is active & approved"}</div>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 11.5, lineHeight: 1.85 }}>
                            {approvedReq?.providerName && <div><span style={{ fontWeight: 800, color: t.text }}>{lang === "ar" ? "الاسم: " : "Name: "}</span><span style={{ color: t.subText }}>{approvedReq.providerName}</span></div>}
                            {approvedReq?.officeName && <div><span style={{ fontWeight: 800, color: t.text }}>{lang === "ar" ? "الخدمة: " : "Service: "}</span><span style={{ color: t.subText }}>{approvedReq.officeName}</span></div>}
                            {approvedReq?.email && <div><span style={{ fontWeight: 800, color: t.text }}>{lang === "ar" ? "الإيميل: " : "Email: "}</span><span style={{ color: t.subText }}>{approvedReq.email}</span></div>}
                            {approvedReq?.phone && <div><span style={{ fontWeight: 800, color: t.text }}>{lang === "ar" ? "الهاتف: " : "Phone: "}</span><span style={{ color: t.subText }}>{approvedReq.phone}</span></div>}
                            {approvedReq?.country && <div><span style={{ fontWeight: 800, color: t.text }}>{lang === "ar" ? "الدولة: " : "Country: "}</span><span style={{ color: t.subText }}>{approvedReq.country}</span></div>}
                            {approvedReq?.city && <div><span style={{ fontWeight: 800, color: t.text }}>{lang === "ar" ? "المدينة: " : "City: "}</span><span style={{ color: t.subText }}>{approvedReq.city}</span></div>}
                          </div>
                          {approvedReq?.services?.length > 0 && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(34,197,94,0.2)" }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: t.text, marginBottom: 6 }}>{lang === "ar" ? "الخدمات المعتمدة:" : "Approved Services:"}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {approvedReq.services.map((s, i) => (
                                  <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: dark ? "rgba(34,197,94,0.18)" : "#bbf7d0", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)" }}>{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {approvedReq?.portfolioLink && (
                            <a href={approvedReq.portfolioLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 11, fontWeight: 800, color: "#16a34a", textDecoration: "none" }}>
                              🔗 {lang === "ar" ? "عرض البورتفوليو" : "View Portfolio"}
                            </a>
                          )}
                          {(approvedReq?.adminDecisionNote || approvedReq?.decisionNote) && (
                            <div style={{ marginTop: 10, fontSize: 11, color: t.subText, lineHeight: 1.75, borderTop: "1px solid rgba(34,197,94,0.2)", paddingTop: 8 }}>
                              💬 {String(approvedReq.adminDecisionNote || approvedReq.decisionNote)}
                            </div>
                          )}
                        </div>

                        {/* ─ طلباتي الأخرى ─ */}
                        {otherReqs.length > 0 && (
                          <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.cardBg, padding: "12px 14px", marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 900, color: t.text, marginBottom: 10 }}>📋 {lang === "ar" ? "طلباتي الأخرى" : "My Other Requests"}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {otherReqs.map((req) => {
                                const st = statusLabel(req.status);
                                return (
                                  <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: st.bg, border: `1px solid ${st.color}30` }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 800, color: t.text, marginBottom: 2 }}>{req.officeName || req.providerName}</div>
                                      {req.services?.length > 0 && <div style={{ fontSize: 10, color: t.subText }}>{req.services.slice(0, 3).join(" · ")}{req.services.length > 3 ? "..." : ""}</div>}
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: st.color, whiteSpace: "nowrap", flexShrink: 0 }}>{st.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ─ زر خدمة جديدة ─ */}
                        <button
                          type="button"
                          onClick={() => setProviderPortalAddNew(true)}
                          style={{
                            width: "100%", textAlign: lang === "ar" ? "right" : "left",
                            background: dark ? "linear-gradient(135deg,rgba(202,138,4,0.22),rgba(245,158,11,0.10))" : "linear-gradient(135deg,#fffbeb,#fef3c7)",
                            border: "1px solid rgba(202,138,4,0.32)", borderRadius: 20, padding: "14px 16px",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                            fontFamily: "'Cairo',sans-serif", boxShadow: dark ? "0 0 18px rgba(202,138,4,0.16)" : "0 8px 20px rgba(202,138,4,0.12)",
                            maxWidth: "100%", boxSizing: "border-box",
                          }}
                        >
                          <div style={{ width: 42, height: 42, borderRadius: 14, background: dark ? "rgba(255,255,255,0.06)" : "#ffffff", border: "1px solid rgba(202,138,4,0.26)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>➕</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: dark ? "#fde68a" : "#a16207", marginBottom: 2 }}>{lang === "ar" ? "قدّم خدمة جديدة" : "Submit a New Service"}</div>
                            <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.6 }}>{lang === "ar" ? "أضف خدمة جديدة لمراجعتها واعتمادها من الأدمن." : "Submit a new service for admin review and approval."}</div>
                          </div>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(202,138,4,0.16)", color: dark ? "#fde68a" : "#a16207", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{lang === "ar" ? "‹" : "›"}</div>
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <div>
                    {providerPortalAddNew && (
                      <button
                        onClick={() => setProviderPortalAddNew(false)}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, background: "none", border: "none", cursor: "pointer", color: t.subText, fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif", padding: 0 }}
                      >
                        <span style={{ fontSize: 16 }}>{lang === "ar" ? "›" : "‹"}</span>
                        {lang === "ar" ? "رجوع للبورتال" : "Back to Portal"}
                      </button>
                    )}
                    <ServiceProviderPortalFlow
                      lang={lang}
                      dark={dark}
                      selectedCountry={selectedCountry}
                      selectedNationality={selectedNationality}
                      countryCities={country?.cities || []}
                      serviceOptions={providerServiceOptions}
                      currentUser={authPreviewUser}
                      approvalSnapshot={providerPortalAddNew ? null : providerApprovalSnapshot}
                      portalMode={providerPortalMode}
                      onSubmitted={() => {
                        setProviderPortalAddNew(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── LIST VIEW ──────────────────────────────────────────────── */}
            {view === "list" && (
              <div>
                <div style={{ ...styles.listHeader, background: t.cardBg, borderBottom: `1px solid ${t.border}` }}>
                  <button
                    onClick={handleAppBackNavigation}
                    style={{
                      borderRadius: 10,
                      padding: "5px 9px",
                      border: `1px solid ${t.border}`,
                      background: t.inputBg,
                      color: t.text,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "'Cairo',sans-serif",
                      flexShrink: 0,
                    }}
                  >
                    {lang === "ar" ? "‹ رجوع" : "Back ›"}
                  </button>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{lang === "ar" ? "مكاتب" : "Offices:"} <span style={{ color: t.gold }}>{getGovernorateLabel(selectedGov)}</span></div>
                  <div style={{ color: t.subText, fontSize: 12 }}>{visibleFilteredOffices.length} {tx.officesAvail}</div>
                </div>
                {isAdminUser && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 10, marginBottom: 10 }}>
                    <button
                      onClick={openAdminAddOfficeModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        border: "1px solid #15803d",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#ffffff",
                        borderRadius: 14,
                        padding: "8px 14px",
                        fontSize: 12,
                        fontWeight: 900,
                        fontFamily: "'Cairo',sans-serif",
                        cursor: "pointer",
                        boxShadow: "0 10px 18px rgba(22,163,74,0.24)",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>➕</span>
                      <span>{lang === "ar" ? "إضافة مكتب جديد" : "Add New Office"}</span>
                    </button>
                  </div>
                )}
                {isGuestUser && guestLockedOfficesCount > 0 && (
                  <div style={{ marginTop: 10, marginBottom: 10, borderRadius: 12, border: "1px solid rgba(239,68,68,0.35)", background: dark ? "rgba(127,29,29,0.24)" : "rgba(254,226,226,0.85)", color: dark ? "#fecaca" : "#991b1b", fontSize: 11, fontWeight: 800, lineHeight: 1.8, padding: "9px 11px", textAlign: "center", fontFamily: "'Cairo',sans-serif" }}>
                    {lang === "ar"
                      ? `أنت داخل كضيف. متاح لك ${guestOfficeLimit} مكاتب فقط هنا، وباقي المكاتب (${guestLockedOfficesCount}) تتطلب تسجيل الدخول.`
                      : `You are in guest mode. Only ${guestOfficeLimit} offices are available here, and the remaining (${guestLockedOfficesCount}) require sign-in.`}
                  </div>
                )}
                {selectedCountry === "المملكة العربية السعودية" && availableSaudiServices.length > 0 && (
                  <div style={{ padding: "8px 10px 4px", display: "grid", gridTemplateColumns: `repeat(${saudiServiceColumns}, minmax(0, 1fr))`, gap: 6 }}>
                    <button
                      onClick={() => setSelectedServiceFilter(null)}
                      style={{
                        borderRadius: 10,
                        minHeight: 30,
                        padding: "4px 8px",
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "'Cairo',sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        border: !selectedServiceFilter ? "none" : `1px solid ${t.border}`,
                        background: !selectedServiceFilter ? t.gold : t.inputBg,
                        color: !selectedServiceFilter ? "#000" : t.subText,
                      }}
                    >
                      {lang === "ar" ? "الكل" : "All"}
                    </button>
                    {visibleSaudiServices.map((service) => (
                      <button
                        key={service}
                        onClick={() => setSelectedServiceFilter(selectedServiceFilter === service ? null : service)}
                        style={{
                          borderRadius: 10,
                          minHeight: 30,
                          padding: "4px 8px",
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: "pointer",
                          fontFamily: "'Cairo',sans-serif",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          border: selectedServiceFilter === service ? "none" : `1px solid ${t.border}`,
                          background: selectedServiceFilter === service ? t.gold : t.inputBg,
                          color: selectedServiceFilter === service ? "#000" : t.subText,
                        }}
                        title={service}
                      >
                        {service}
                      </button>
                    ))}
                    {hasMoreSaudiServices && (
                      <button
                        onClick={() => setShowAllSaudiServices((prev) => !prev)}
                        style={{
                          borderRadius: 10,
                          minHeight: 30,
                          padding: "4px 8px",
                          fontSize: 10,
                          fontWeight: 900,
                          cursor: "pointer",
                          fontFamily: "'Cairo',sans-serif",
                          border: `1px dashed ${t.gold}`,
                          background: showAllSaudiServices ? `${t.gold}18` : t.inputBg,
                          color: showAllSaudiServices ? t.gold : t.subText,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {showAllSaudiServices ? (lang === "ar" ? "عرض أقل" : "Show less") : (lang === "ar" ? "رؤية الكل" : "View all")}
                      </button>
                    )}
                  </div>
                )}
                <div style={{ ...styles.searchWrap, background: t.inputBg, border: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 14 }}>🔍</span>
                  <input type="text" placeholder={tx.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...styles.searchInput, background: "transparent", color: t.text }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {visibleFilteredOffices.length === 0 ? (
                    <div style={{ textAlign: "center", color: t.subText, padding: "40px 0", fontSize: 15, gridColumn: "1 / -1" }}>{tx.noResults}</div>
                  ) : paginatedOffices.map((office, i) => (
                    <button key={office.id} onClick={() => openOfficeDetails(office)}
                      style={{ ...styles.officeCard, background: t.cardBg, border: `1px solid ${t.border}`, animationDelay: `${i * 30}ms`, padding: "13px 8px", display: "flex", flexDirection: "column", gap: 9, borderRadius: 14, cursor: "pointer", textAlign: "center", width: "100%", minHeight: 174 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${t.gold}22`, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0, margin: "0 auto" }}>{((officePage - 1) * officesPerPage) + i + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, textAlign: "center", lineHeight: 1.3 }}>{getOfficeLabel(office.name)}</div>
                      <div style={{ display: "inline-block", alignSelf:"center", borderRadius: 999, padding: "5px 13px", fontSize: 12, fontWeight: 700, background: `${t.gold}15`, color: t.gold, textAlign: "center" }}>
                        {selectedCountry === "مصر" ? `${tx.licenseNo} ${office.license}` : `${lang === "ar" ? "نوع الجهة" : "Office type"} ${office.type || "—"}`}
                      </div>
                      {selectedCountry === "المملكة العربية السعودية" && (
                        <>
                          <div style={{ fontSize: 10, color: t.subText, lineHeight: 1.5 }}>
                            {office.phone ? `${lang === "ar" ? "هاتف" : "Phone"}: ${office.phone}` : (lang === "ar" ? "لا يوجد هاتف" : "No phone")}
                          </div>
                          <div style={{ fontSize: 10, color: t.subText, lineHeight: 1.5, wordBreak: "break-all" }}>
                            {office.website ? `${lang === "ar" ? "الموقع" : "Website"}: ${office.website}` : (lang === "ar" ? "لا يوجد موقع" : "No website")}
                          </div>
                        </>
                      )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, marginTop: "auto" }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 16, color: (officeRatings[office.id]?.avg || 0) >= s ? "#f59e0b" : t.border }}>★</span>
                          ))}
                        {officeRatings[office.id] && <span style={{ fontSize: 13, color: t.subText }}>({officeRatings[office.id].count})</span>}
                        </div>
                    </button>
                  ))}
                  {isGuestUser && guestLockedOfficesCount > 0 && Array.from({ length: Math.min(guestLockedOfficesCount, 6) }).map((_, idx) => (
                    <button
                      key={`guest-lock-${idx}`}
                      type="button"
                      onClick={openGuestLockedOfficeNotice}
                      style={{ ...styles.officeCard, background: dark ? "rgba(127,29,29,0.22)" : "rgba(254,226,226,0.82)", border: "1px dashed rgba(239,68,68,0.45)", padding: "13px 8px", display: "flex", flexDirection: "column", gap: 9, borderRadius: 14, textAlign: "center", width: "100%", minHeight: 174, opacity: 0.92, cursor: "pointer" }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.22)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0, margin: "0 auto" }}>🔒</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: dark ? "#fecaca" : "#991b1b", textAlign: "center", lineHeight: 1.45 }}>
                        {lang === "ar" ? "مكتب مقفول" : "Locked Office"}
                      </div>
                      <div style={{ fontSize: 11, color: dark ? "#fecaca" : "#7f1d1d", lineHeight: 1.7, marginTop: "auto", fontWeight: 700 }}>
                        {lang === "ar" ? "سجل الدخول لفتح باقي المكاتب" : "Sign in to unlock more offices"}
                      </div>
                    </button>
                  ))}
                </div>
                {visibleFilteredOffices.length > officesPerPage && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, flexWrap:"wrap", marginTop:14 }}>
                    <button
                      onClick={() => setOfficePage((page) => Math.max(1, page - 1))}
                      disabled={officePage === 1}
                      style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:officePage === 1 ? t.border : t.cardBg, color:officePage === 1 ? t.subText : t.text, cursor:officePage === 1 ? "default" : "pointer", fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif" }}>
                      {lang === "ar" ? "السابق" : "Previous"}
                    </button>
                    {Array.from({ length: totalOfficePages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setOfficePage(pageNumber)}
                        style={{ minWidth:36, padding:"8px 10px", borderRadius:10, border:`1px solid ${officePage === pageNumber ? t.gold : t.border}`, background:officePage === pageNumber ? `${t.gold}18` : t.cardBg, color:officePage === pageNumber ? t.gold : t.text, cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"'Cairo',sans-serif" }}>
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => setOfficePage((page) => Math.min(totalOfficePages, page + 1))}
                      disabled={officePage === totalOfficePages}
                      style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:officePage === totalOfficePages ? t.border : t.cardBg, color:officePage === totalOfficePages ? t.subText : t.text, cursor:officePage === totalOfficePages ? "default" : "pointer", fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif" }}>
                      {lang === "ar" ? "التالي" : "Next"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── COUNTRY VIEW ───────────────────────────────────────────── */}
            {view === "country" && country && (
              <div>
                <div style={{ ...styles.listHeader, background: t.cardBg, borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{country.flag} <span style={{ color: t.gold }}>{country.name}</span></div>
                </div>
                <div style={{ padding: "14px 0 4px" }}>
                  <div style={{ color: t.subText, fontSize: 11, marginBottom: 10 }}>{tx.citiesComingSoon}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {country.cities.map(city => (
                      <button key={city} onClick={() => openCityModal(lang === "en" ? (cityNamesEn[city] || city) : city)}
                        style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.2s", fontFamily: "'Cairo',sans-serif" }}>
                        <span style={{ fontSize: 28 }}>{cityIcons[city] || "🏙️"}</span>
                        <span style={{ fontSize: 10, color: t.text, fontWeight: 600, textAlign: "center" }}>{lang === "en" ? (cityNamesEn[city] || city) : city}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", borderBottom: `1px solid ${t.border}`, marginTop: 16 }}>
                  {[{ key: "ministry", label: tx.tabMinistry }, { key: "embassy", label: tx.tabEmbassy }, { key: "emergency", label: tx.tabEmergency }, { key: "paid", label: tx.tabPaid }].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      style={{ flex: 1, padding: "10px 2px", fontSize: 9, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", color: activeTab === tab.key ? t.gold : t.subText, borderBottom: activeTab === tab.key ? `2px solid ${t.gold}` : "2px solid transparent", fontFamily: "'Cairo',sans-serif" }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                {activeTab === "ministry" && (
                  <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}` }}>
                    <div style={{ color: t.gold, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🏛️ {lang === "ar" ? country.officialContacts.ministry.name : (country.officialContacts.ministry.nameEn || country.officialContacts.ministry.name)}</div>
                    <InfoRow label={tx.unifiedPhone} value={country.officialContacts.ministry.phone} color={t.gold} />
                    <InfoRow label={tx.workHours} value={lang === "ar" ? country.officialContacts.ministry.hours : (country.officialContacts.ministry.hoursEn || country.officialContacts.ministry.hours)} />
                    <InfoRow label={tx.website} value={country.officialContacts.ministry.website} color="#60a5fa" />
                    {country.officialContacts.ministry.email !== "-" && <InfoRow label={tx.email} value={country.officialContacts.ministry.email} color="#60a5fa" />}
                    <div style={{ marginTop: 12 }}>
                      <a href={`tel:${country.officialContacts.ministry.phone}`} style={{ display: "block", background: `${t.gold}18`, border: `1px solid ${t.gold}40`, borderRadius: 10, padding: "10px", textAlign: "center", color: t.gold, fontWeight: 700, fontSize: 13, textDecoration: "none", fontFamily: "'Cairo',sans-serif" }}>{tx.callMinistry}</a>
                    </div>
                  </div>
                )}
                {activeTab === "embassy" && (
                  <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}` }}>
                    <div style={{ color: t.gold, fontSize: 13, fontWeight: 700, marginBottom: 12, fontFamily: "'Cairo',sans-serif" }}>
                      {lang === "ar" ? "تواصل مع سفارتك" : "Contact Your Embassy"}
                    </div>

                    {nationalityEmbassyCountry && (
                      <div style={{ marginBottom: 14, borderRadius: 16, padding: "14px 14px 12px", background: dark ? "linear-gradient(135deg, rgba(217,119,6,0.18), rgba(251,191,36,0.10))" : "linear-gradient(135deg, #fff7ed, #fef3c7)", border: `1px solid ${t.gold}40`, boxShadow: dark ? `0 0 22px ${t.gold}18` : `0 12px 24px ${t.gold}16` }}>
                        <div style={{ color: t.gold, fontSize: 12, fontWeight: 900, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
                          {lang === "ar" ? "سفارتك في هذه الدولة" : "Your Embassy In This Country"}
                        </div>
                        <button
                          onClick={() => setSelectedEmbassyCountry(nationalityEmbassyCountry.nationality)}
                          style={{
                            width: "100%",
                            background: selectedEmbassy?.nationality === nationalityEmbassyCountry.nationality ? `${t.gold}18` : "#ffffff",
                            border: `1px solid ${selectedEmbassy?.nationality === nationalityEmbassyCountry.nationality ? t.gold : t.border}`,
                            borderRadius: 14,
                            padding: "12px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            fontFamily: "'Cairo',sans-serif"
                          }}
                        >
                          <img
                            src={nationalityEmbassyCountry.flagImg}
                            alt={nationalityEmbassyCountry.name}
                            style={{ width: 44, height: 30, borderRadius: 8, objectFit: "cover", border: `1px solid ${t.border}` }}
                          />
                          <div style={{ flex: 1, textAlign: lang === "ar" ? "right" : "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: t.text }}>
                              {lang === "ar"
                                ? nationalityEmbassyCountry.officialContacts.embassy.name
                                : (nationalityEmbassyCountry.officialContacts.embassy.nameEn || nationalityEmbassyCountry.officialContacts.embassy.name)}
                            </div>
                            <div style={{ fontSize: 11, color: t.subText, marginTop: 2 }}>
                              {lang === "ar" ? nationalityEmbassyCountry.name : (nationalityEmbassyCountry.nameEn || nationalityEmbassyCountry.name)}
                            </div>
                          </div>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${t.gold}18`, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                            {lang === "ar" ? "‹" : "›"}
                          </div>
                        </button>
                      </div>
                    )}

                    {!selectedEmbassy && (
                      <div style={{ marginBottom: 14, borderRadius: 14, padding: "10px 12px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", border: `1px solid ${t.border}`, color: t.subText, fontSize: 11, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
                        {lang === "ar" ? `لا توجد بيانات سفارة متاحة لهذه الجنسية داخل ${country.name} حاليًا.` : `No embassy data is currently available for this nationality inside ${countryNamesEn[country.name] || country.name}.`}
                      </div>
                    )}

                    {selectedEmbassy && (
                      <>
                        <div style={{ color: t.gold, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                          {selectedEmbassy.flag} {lang === "ar"
                            ? selectedEmbassy.officialContacts.embassy.name
                            : (selectedEmbassy.officialContacts.embassy.nameEn || selectedEmbassy.officialContacts.embassy.name)}
                        </div>
                        {selectedEmbassy.officialContacts.embassy.address && (
                          <InfoRow label={tx.address} value={selectedEmbassy.officialContacts.embassy.address} />
                        )}
                        {selectedEmbassy.officialContacts.embassy.phone && selectedEmbassy.officialContacts.embassy.phone !== "-" && (
                          <InfoRow label={tx.phone} value={selectedEmbassy.officialContacts.embassy.phone} color={t.gold} />
                        )}
                        {selectedEmbassy.officialContacts.embassy.website && selectedEmbassy.officialContacts.embassy.website !== "-" && (
                          <InfoRow label={tx.website} value={selectedEmbassy.officialContacts.embassy.website} color="#60a5fa" />
                        )}
                        {selectedEmbassy.officialContacts.embassy.email && selectedEmbassy.officialContacts.embassy.email !== "-" && (
                          <InfoRow label={tx.email} value={selectedEmbassy.officialContacts.embassy.email} color="#60a5fa" />
                        )}
                        {selectedEmbassy.officialContacts.embassy.jeddah && (
                          <InfoRow label={tx.jeddah} value={selectedEmbassy.officialContacts.embassy.jeddah} color="#60a5fa" />
                        )}
                        {selectedEmbassy.officialContacts.embassy.whatsapp && (
                          <InfoRow label={tx.whatsappLabel} value={selectedEmbassy.officialContacts.embassy.whatsapp} />
                        )}
                        {selectedEmbassy.officialContacts.embassy.facebook && (
                          <InfoRow label={tx.facebookLabel} value={selectedEmbassy.officialContacts.embassy.facebook} color="#60a5fa" />
                        )}
                        {selectedEmbassy.officialContacts.embassy.note && (
                          <div style={{ color: t.subText, fontSize: 10, marginTop: 8, fontStyle: "italic" }}>
                            ℹ️ {lang === "ar"
                              ? selectedEmbassy.officialContacts.embassy.note
                              : (selectedEmbassy.officialContacts.embassy.noteEn || selectedEmbassy.officialContacts.embassy.note)}
                          </div>
                        )}
                        {selectedEmbassy.officialContacts.embassy.phone && selectedEmbassy.officialContacts.embassy.phone !== "-" && (
                          <div style={{ marginTop: 12 }}>
                            <a
                              href={`tel:${selectedEmbassy.officialContacts.embassy.phone}`}
                              style={{
                                display: "block",
                                background: "#1d4ed818",
                                border: "1px solid #1d4ed840",
                                borderRadius: 10,
                                padding: "10px",
                                textAlign: "center",
                                color: "#60a5fa",
                                fontWeight: 700,
                                fontSize: 13,
                                textDecoration: "none",
                                fontFamily: "'Cairo',sans-serif"
                              }}>
                              {tx.callEmbassy}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {activeTab === "emergency" && (
                  <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}` }}>
                    <div style={{ color: "#fc8181", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🚨 {tx.emergencyIn} {country.name}</div>
                    {country.officialContacts.emergency.map((em, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                        <span style={{ color: t.subText, fontSize: 12 }}>{em.name}</span>
                        <a href={`tel:${em.number}`} style={{ background: "#e53e3e18", color: "#fc8181", borderRadius: 8, padding: "4px 12px", fontSize: 16, fontWeight: 700, textDecoration: "none", border: "1px solid #e53e3e30", direction: "ltr" }}>{em.number}</a>
                      </div>
                    ))}

                  </div>
                )}
                {activeTab === "paid" && (
                  <React.Suspense fallback={null}>
                  <PaidFlowErrorBoundary lang={lang} resetKey={`country-tab-${selectedCountry}-${countryPaidBackRequest}`}>
                    <PaidServicesFlow
                      services={selectedCountry === "المملكة العربية السعودية" ? tx.countryServices : tx.otherCountryServices}
                      lang={lang}
                      dark={dark}
                      selectedCountry={selectedCountry}
                      selectedCity={""}
                      selectedNationality={selectedNationality}
                      isAdminUser={isAdminUser}
                      canManageServiceReviews={canManageOrderReviews}
                      onScreenChange={setCountryPaidScreen}
                      backRequestToken={countryPaidBackRequest}
                      isGuestUser={isGuestUser}
                    />
                  </PaidFlowErrorBoundary>
                  </React.Suspense>
                )}
              </div>
            )}
          </>
        )}

        {/* ══ CREATE CV TAB ═════════════════════════════════════════════════ */}
        {mainTab === "cv" && (() => {
          const isAr = lang === "ar";
          const cvSteps = lang === "ar"
            ? ["البيانات الشخصية","الخبرات","المهارات","التعليم","التصدير"]
            : ["Personal","Experience","Skills","Education","Export"];
          const cvIcons = ["👤","💼","🛠️","🎓","📄"];
          const inputStyle = { width:"100%", padding:"9px 12px", fontSize:13, borderRadius:10, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontFamily:"'Cairo',sans-serif", outline:"none" };
          const labelStyle = { fontSize:11, fontWeight:700, color:t.subText, fontFamily:"'Cairo',sans-serif", marginBottom:4, display:"block" };
          const cardStyle = { borderRadius:14, padding:"14px", background:t.cardBg, border:`1px solid ${t.border}`, marginBottom:12 };
          const cvGoldGrad = `linear-gradient(135deg,${t.gold},#b8860b)`;
          const cvActionBtnStyle = (bg, color="#fff") => ({ width:"100%", padding:"13px", borderRadius:12, border:"none", background:bg, color, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", boxShadow:"0 4px 14px rgba(0,0,0,0.12)", transition:"opacity .2s" });
          const secHeadStyle = { fontSize:13, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:10, display:"flex", alignItems:"center", gap:6 };
          const addBtnStyle = { display:"flex", alignItems:"center", justifyContent:"center", gap:6, width:"100%", padding:"9px", borderRadius:10, border:`1px dashed ${t.gold}`, background:"transparent", color:t.gold, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", marginTop:8 };
          const tagStyle = { display:"inline-flex", alignItems:"center", gap:4, background:`${t.gold}22`, color:t.gold, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, fontFamily:"'Cairo',sans-serif" };
          const cvOfferEndsText = cvOfferDeadline.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { year:"numeric", month:"long", day:"numeric" });
          const cvBuilderStats = cvPackageStats.builder || createEmptyCvPackageStats();
          const cvPremiumStats = cvPackageStats.premium || createEmptyCvPackageStats();
          const cvEliteStats = cvPackageStats.elite || createEmptyCvPackageStats();
          const cvRealtimeOrdersByPackage = cvRealtimeOrders.reduce((acc, order) => {
            const packageKey = detectCvPackageKeyFromOrder(order);
            if (!packageKey) return acc;
            if (!acc[packageKey]) acc[packageKey] = [];
            acc[packageKey].push(order);
            return acc;
          }, { builder: [], premium: [], elite: [] });

          const cvAdminOrdersByPackage = isAdminUser
            ? cvAdminAllOrders.reduce((acc, order) => {
                const packageKey = detectCvPackageKeyFromOrder(order);
                if (!packageKey) return acc;
                if (!acc[packageKey]) acc[packageKey] = [];
                acc[packageKey].push(order);
                return acc;
              }, { builder: [], premium: [], elite: [] })
            : { builder: [], premium: [], elite: [] };

          const getRealAvgRating = (orders, fallbackAvg) => {
            if (!cvRealtimeOrdersFetched) return Number(fallbackAvg || 0).toFixed(1);
            const ratingValues = (orders || [])
              .map((order) => Number(order?.rating) || 0)
              .filter((value) => value > 0);
            if (!ratingValues.length) return Number(fallbackAvg || 0).toFixed(1);
            const avg = ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length;
            return Number(avg || 0).toFixed(1);
          };

          const cvRealtimeBuilderOrders = cvRealtimeOrdersByPackage.builder || [];
          const cvRealtimePremiumOrders = cvRealtimeOrdersByPackage.premium || [];
          const cvRealtimeEliteOrders = cvRealtimeOrdersByPackage.elite || [];

          const cvAdminBuilderOrders = cvAdminOrdersByPackage.builder || [];
          const cvAdminPremiumOrders = cvAdminOrdersByPackage.premium || [];
          const cvAdminEliteOrders = cvAdminOrdersByPackage.elite || [];

          const getCvOrderTimestamp = (order) => {
            const createdAtValue = order?.createdAt;
            if (createdAtValue?.toDate) {
              return createdAtValue.toDate().getTime();
            }
            const raw = order?.date || order?.createdAt || "";
            const ts = new Date(raw).getTime();
            return Number.isFinite(ts) ? ts : 0;
          };

          const normalizedCvAdminQuery = String(cvAdminOrdersQuery || "").trim().toLowerCase();
          const cvAdminBuilderOrdersFiltered = cvAdminBuilderOrders
            .filter((order) => {
              const orderStage = Number(order?.statusIndex);
              if (cvAdminOrdersStageFilter === "active" && orderStage >= 4) return false;
              if (cvAdminOrdersStageFilter === "done" && orderStage < 4) return false;
              if (!normalizedCvAdminQuery) return true;

              const searchBlob = [
                order?.name,
                order?.fullName,
                order?.phone,
                order?.whatsapp,
                order?.email,
                order?.orderNumber,
                order?.serial,
                order?.country,
                order?.city,
                order?.dateStr,
              ]
                .map((v) => String(v || "").toLowerCase())
                .join(" ");

              return searchBlob.includes(normalizedCvAdminQuery);
            })
            .sort((a, b) => {
              if (cvAdminOrdersSortMode === "oldest") {
                return getCvOrderTimestamp(a) - getCvOrderTimestamp(b);
              }
              if (cvAdminOrdersSortMode === "name") {
                return String(a?.name || a?.fullName || "")
                  .localeCompare(String(b?.name || b?.fullName || ""), lang === "ar" ? "ar" : "en");
              }
              return getCvOrderTimestamp(b) - getCvOrderTimestamp(a);
            });

          const cvRealBuilderCount = cvRealtimeOrdersFetched ? cvRealtimeBuilderOrders.length : cvBuilderStats.requestsCount;
          const cvRealPremiumCount = cvRealtimeOrdersFetched ? cvRealtimePremiumOrders.length : cvPremiumStats.requestsCount;
          const cvRealEliteCount = cvRealtimeOrdersFetched ? cvRealtimeEliteOrders.length : cvEliteStats.requestsCount;

          const cvPackageStatsCards = [
            {
              key: "builder",
              accent: "#0f766e",
              icon: "📄",
              metric: lang === "ar" ? "عدد التنزيلات" : "Downloads",
              users: cvRealBuilderCount,
              avg: getRealAvgRating(cvRealtimeBuilderOrders, cvBuilderStats.averageRating),
            },
            {
              key: "premium",
              accent: "#c8960c",
              icon: "👑",
              metric: lang === "ar" ? "عدد المشتركين" : "Subscribers",
              users: cvRealPremiumCount,
              avg: getRealAvgRating(cvRealtimePremiumOrders, cvPremiumStats.averageRating),
            },
            {
              key: "elite",
              accent: "#7c3aed",
              icon: "🚀",
              metric: lang === "ar" ? "عدد قصص النجاح" : "Success Stories",
              users: cvRealEliteCount,
              avg: getRealAvgRating(cvRealtimeEliteOrders, cvEliteStats.averageRating),
            },
          ];
          const cvFontScale = 0.84;
          const cvScaleFont = (size) => Number((size * cvFontScale).toFixed(2));
          const cvPackageLayout = {
            elite: { desktopMinHeight: 440, desktopStatsOffset: 0 },
            premium: { desktopMinHeight: 400, desktopStatsOffset: 0 },
            builder: { desktopMinHeight: 360, desktopStatsOffset: 0 },
          };
          const cvPackages = [
            {
              key: "elite",
              icon: "🚀",
              title: lang==="ar" ? "باقة البحث والتوظيف" : "Job Search Package",
              price: "$35",
              oldPrice: "$70",
              summary: lang==="ar" ? "عدد 32 فرصة + سيرة ذاتية ممتازة" : "32 Opportunities + Premium CV",
              desc: lang==="ar" ? "بحث فعلي عن وظائف مناسبة مع سيرة ذاتية ممتازة وإرسال 32 فرصة مرتبطة بمجالك." : "Real job search support with a premium CV and 32 relevant opportunities.",
              cta: lang==="ar" ? "اطلب الباقة الكاملة" : "Get Full Package",
              accent: "#7c3aed",
              cardBg: dark ? "linear-gradient(155deg,#2b174f,#3f216f)" : "linear-gradient(155deg,#32215e,#1f1440)",
              titleColor: "#efe7ff",
              textColor: "#dfd4ff",
              chipBg: "rgba(255,255,255,0.12)",
              ctaBg: "linear-gradient(135deg,#6d4ec7,#8a67eb)",
              ctaColor: "#f8f4ff",
            },
            {
              key: "premium",
              icon: "👑",
              title: lang==="ar" ? "مستخدم بريميوم" : "Premium User",
              price: "$20",
              oldPrice: "$40",
              summary: lang==="ar" ? "عدد 16 فرصة + سيرة ذاتية ممتازة" : "16 Opportunities + Premium CV",
              desc: lang==="ar" ? "سيرة ذاتية ممتازة مع عدد 16 فرصة مناسبة لتخصصك تُرسل إلى واتسابك الشخصي." : "Premium CV with 16 relevant opportunities sent to your WhatsApp.",
              cta: lang==="ar" ? "اطلب بريميوم" : "Choose Premium",
              accent: "#c8960c",
              cardBg: dark ? "linear-gradient(155deg,#113965,#1d5f9e)" : "linear-gradient(155deg,#b8d9f6,#6ea9dd)",
              titleColor: dark ? "#f9e7b7" : "#3a2a07",
              textColor: dark ? "#eff6ff" : "#16324f",
              chipBg: dark ? "rgba(200,150,12,0.30)" : "rgba(255,255,255,0.74)",
              ctaBg: "linear-gradient(135deg,#c8960c,#a97706)",
              ctaColor: "#fff9eb",
            },
            {
              key: "builder",
              icon: "📄",
              title: lang==="ar" ? "مستخدم عادي" : "Regular User",
              price: lang==="ar" ? "مجاناً" : "Free",
              oldPrice: null,
              summary: lang==="ar" ? "تصدير مجاني" : "Free Export",
              desc: lang==="ar" ? "أنشئ سيرتك الذاتية بنفسك بخطوات واضحة واحصل على نسخة جاهزة للتصدير." : "Build your CV yourself with a clean guided flow and get an export-ready version.",
              cta: lang==="ar" ? "ابدأ الآن" : "Start Now",
              accent: "#0f766e",
              cardBg: dark ? "linear-gradient(155deg,#123e45,#0f766e)" : "linear-gradient(155deg,#dff5f1,#b8e7df)",
              titleColor: dark ? "#e6fffb" : "#083b36",
              textColor: dark ? "#dcfdf7" : "#0f4d45",
              chipBg: dark ? "rgba(15,118,110,0.35)" : "rgba(255,255,255,0.72)",
              ctaBg: "linear-gradient(135deg,#0f766e,#0d9488)",
              ctaColor: "#ffffff",
            }
          ];
          const cvPaidServices = [
            {
              key: "premium",
              icon: "👑",
              label: lang==="ar" ? "باقة بريميوم" : "Premium Package",
              subtitle: lang==="ar" ? "عدد 16 فرصة + سيرة ذاتية ممتازة" : "16 Opportunities + Premium CV",
              price: 20,
              originalPrice: 40,
                billingLabel: lang==="ar" ? "دفعة واحدة حسب الخدمة" : "One-time payment per service",
                features: lang==="ar"
                  ? ["سيرة ذاتية احترافية بتنسيق حديث", "16 فرصة مناسبة لتخصصك", "إرسال الفرص إلى واتسابك الشخصي", "Cover Letter احترافي بالعربي والإنجليزي مع صورة رسمية للتقديم على الشركات"]
                  : ["Professional modern CV", "16 relevant role matches", "Direct WhatsApp delivery", "Professional Arabic and English cover letter with a formal profile photo for company applications"],
                customerSupport: false,
            },
            {
              key: "elite",
              icon: "🚀",
              label: lang==="ar" ? "باقة البحث والتوظيف المتقدمة" : "Advanced Job Search Package",
              subtitle: lang==="ar" ? "عدد 32 فرصة + سيرة ذاتية ممتازة" : "32 Opportunities + Premium CV",
              price: 35,
              originalPrice: 70,
              billingLabel: lang==="ar" ? "دفعة واحدة حسب الخدمة" : "One-time payment per service",
              features: lang==="ar"
                ? ["البحث عن وظائف مرتبطة فعلياً بمجالك", "32 فرصة توظيف مستهدفة وليست إعلانات عشوائية", "سيرة ذاتية احترافية بالعربي والإنجليزي", "إمكانية التواصل مع خدمة العملاء بعد الدفع"]
                : ["Real field-specific job search", "32 targeted opportunities", "Arabic and English CV templates", "Customer support access after payment"],
              customerSupport: true,
            }
          ];
          const selectedCvService = cvPaidServices.find(service => service.key === selectedCvPackage) || null;
          const selectedCvPackageIntro = selectedCvPackage === "premium"
            ? {
                title: lang==="ar" ? "ملاحظة مهمة — باقة بريميوم 👑" : "Important Note — Premium Package 👑",
                body: lang==="ar"
                  ? "تشمل الباقة: سيرة ذاتية احترافية + 16 فرصة توظيف مناسبة لتخصصك تُرسل إلى واتسابك مباشرة + Cover Letter بالعربي والإنجليزي.\n\nمدة الخدمة شهر كامل أو لحين اكتمال إرسال 16 فرصة.\n\n⚠️ لا تتضمن هذه الباقة دعم عملاء بعد الدفع. للتواصل المباشر يُنصح بالترقية إلى باقة البحث والتوظيف."
                  : "Package includes: Professional CV + 16 role-matched opportunities sent to your WhatsApp + Cover Letter in Arabic & English.\n\nService duration: 1 month or until all 16 opportunities are delivered.\n\n⚠️ This package does not include post-payment customer support. For direct support, consider upgrading to the Job Search Package."
              }
            : selectedCvPackage === "elite"
              ? {
                  title: lang==="ar" ? "ملاحظة مهمة — باقة البحث والتوظيف 🚀" : "Important Note — Job Search Package 🚀",
                  body: lang==="ar"
                    ? "تشمل الباقة: سيرة ذاتية احترافية بالعربي والإنجليزي + 32 فرصة توظيف مستهدفة فعلياً من مجالك + بحث حقيقي عن وظائف مناسبة.\n\nمدة الخدمة شهر كامل أو لحين اكتمال إرسال 32 فرصة.\n\n✅ تتضمن هذه الباقة دعم عملاء مباشر بعد الدفع عبر واتساب."
                    : "Package includes: Professional Arabic & English CV + 32 real targeted job opportunities from your field + active job search on your behalf.\n\nService duration: 1 month or until all 32 opportunities are delivered.\n\n✅ This package includes direct post-payment customer support via WhatsApp."
                }
              : null;
          const cvJobSites = [
            { key:"linkedin", name:"LinkedIn", short:"in", color:"#0A66C2", url:"https://www.linkedin.com/jobs/" },
            { key:"indeed", name:"Indeed", short:"id", color:"#2557A7", url:"https://www.indeed.com/" },
            { key:"bayt", name:"Bayt", short:"B", color:"#0E4C92", url:"https://www.bayt.com/" },
            { key:"wuzzuf", name:"Wuzzuf", short:"W", color:"#F9A825", url:"https://wuzzuf.net/" },
            { key:"gulftalent", name:"GulfTalent", short:"GT", color:"#009688", url:"https://www.gulftalent.com/" },
            { key:"naukrigulf", name:"NaukriGulf", short:"NG", color:"#1976D2", url:"https://www.naukrigulf.com/" },
            { key:"glassdoor", name:"Glassdoor", short:"G", color:"#0CAA41", url:"https://www.glassdoor.com/" },
            { key:"monster", name:"Monster", short:"M", color:"#6C3CF0", url:"https://www.monstergulf.com/" },
            { key:"tanqeeb", name:"Tanqeeb", short:"T", color:"#E65100", url:"https://tanqeeb.com/" },
            { key:"forsana", name:"Forsana", short:"FR", color:"#16A34A", url:"https://forasna.com/" },
            { key:"olxjobs", name:"OLX Jobs", short:"OL", color:"#FF6600", url:"https://jobs.olx.com/" },
            { key:"dubizzle", name:"Dubizzle", short:"DZ", color:"#E20C20", url:"https://www.dubizzle.sa/jobs-services/" },
          ];
          const cvJobSitesCard = (
            <div style={{ ...cardStyle, padding:"10px 12px", border:`1px solid ${t.border}`, background:dark ? "rgba(255,255,255,0.03)" : "#fbfcff" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                <div style={{ fontSize:13, fontWeight:800, color:t.gold, fontFamily:"'Cairo',sans-serif" }}>
                  {lang==="ar" ? "مواقع توظيف تهمك" : "Useful Job Sites"}
                </div>
                <div style={{ fontSize:10, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>
                  {lang==="ar" ? "روابط سريعة تساعدك تبدأ التقديم" : "Quick links to start applying"}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, minmax(0, 1fr))", gap:7 }}>
                {cvJobSites.map(site => (
                  <a
                    key={site.key}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="job-site-link"
                    style={{ textDecoration:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"4px 4px", minHeight:28, borderRadius:12, border:"none", background:"transparent" }}
                  >
                    <div className="job-site-icon" style={{ width:31, height:31, borderRadius:8, background:site.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11.7, fontWeight:900, fontFamily:"sans-serif" }}>
                      {site.short}
                    </div>
                    <div style={{ fontSize:11, color:t.text, textAlign:"center", lineHeight:1.2, fontFamily:"'Cairo',sans-serif" }}>
                      {site.name}
                    </div>
                  </a>
                ))}
              </div>
              {!cvMode && (
                <div style={{ fontSize:10, color:t.subText, textAlign:"center", lineHeight:1.6, marginTop:8, fontFamily:"'Cairo',sans-serif" }}>
                  {lang==="ar" ? "اختر نوع الخدمة من البطاقات بالأعلى، أو تصفح هذه المواقع لحين تحديد المسار المناسب." : "Choose a package above, or browse these job sites while deciding your path."}
                </div>
              )}
            </div>
          );
          const cvBuilderFormInProgress = cvMode === "builder" && cvBuilderScreen === "form";
          const cvServicesFormInProgress =
            cvMode === "services" && !["list", "previousOrders"].includes(String(cvPaidScreen || ""));
          const cvPackageSelectionLocked = cvBuilderFormInProgress || cvServicesFormInProgress;

          return (
            <div style={{ padding:isCompactPhone ? "56px 0 8px" : "66px 0 20px" }}>
              {!!cvBuilderLimitNotice && (
                <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,0.12)", zIndex:1200, pointerEvents:"none" }}>
                  <div style={{ width:"min(88vw, 420px)", borderRadius:22, padding:"18px 20px", background:"linear-gradient(135deg,#fff8e6,#fffdf7)", border:`1px solid ${t.gold}55`, boxShadow:"0 20px 50px rgba(15,23,42,0.16)", textAlign:"center" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                    <div style={{ fontSize:15, fontWeight:900, color:t.gold, marginBottom:8, fontFamily:"'Cairo',sans-serif" }}>
                      {lang==="ar" ? "تنبيه الطلبات الشهرية" : "Monthly Requests Notice"}
                    </div>
                    <div style={{ fontSize:12, color:t.text, lineHeight:1.9, fontFamily:"'Cairo',sans-serif" }}>
                      {cvBuilderLimitNotice}
                    </div>
                  </div>
                </div>
              )}
              {!cvMode && (
              <div style={{ ...cardStyle, padding:isCompactPhone ? "11px" : "16px", marginTop:6, background: dark ? "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.92), rgba(14,116,144,0.22))" : "linear-gradient(135deg, #f8f4ea, #edf5ff, #d8f3ef)", border:`1px solid ${t.gold}3f`, boxShadow: dark ? "0 18px 38px rgba(0,0,0,0.24)" : "0 18px 38px rgba(15,23,42,0.09)", borderRadius:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:isCompactPhone ? 5 : 6, flexWrap:"wrap" }}>
                  <span style={{ ...tagStyle, background:"#e53e3e18", color:"#e53e3e" }}>🔥 {lang==="ar" ? "خصم 50٪ لفترة محدودة" : "50% OFF for a limited time"}</span>
                  <span style={{ fontSize:cvScaleFont(11), color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{lang==="ar" ? `ينتهي العرض في ${cvOfferEndsText}` : `Offer ends on ${cvOfferEndsText}`}</span>
                </div>
                <div style={{ fontSize:cvScaleFont(isCompactPhone ? 17.5 : 22), fontWeight:900, color:t.text, lineHeight:isCompactPhone ? 1.16 : 1.24, marginBottom:isCompactPhone ? 3 : 4, fontFamily:"'Cairo',sans-serif" }}>
                  {lang==="ar" ? "امتلك السيرة الذاتية التي تضمن لك المقابلات وتحقق لك الوظيفة التي تستحقها" : "Own the CV that gets interviews and lands your ideal role"}
                </div>
                <div style={{ fontSize:cvScaleFont(isCompactPhone ? 10.5 : 12), color:t.subText, lineHeight:isCompactPhone ? 1.52 : 1.62, marginBottom:isCompactPhone ? 6 : 8, fontFamily:"'Cairo',sans-serif" }}>
                  {lang==="ar" ? "اختر مسارك المهني من بين خياراتنا المتكاملة للنجاح." : "Choose your career path from our complete success options."}
                </div>
                <div
                  style={isCompactPhone
                    ? {
                        display:"grid",
                        gridTemplateColumns:"repeat(3, minmax(0, 1fr))",
                        gap:6,
                        alignItems:"stretch",
                      }
                    : {
                        display:"grid",
                        gridTemplateColumns:"repeat(3, minmax(0, 1fr))",
                        gap:12,
                        alignItems:"stretch",
                      }}
                >
                  {cvPackages.map(pkg => {
                    const statsItem = cvPackageStatsCards.find(s => s.key === pkg.key);
                    const isActive = (pkg.key === "builder" && cvMode === "builder") || (pkg.key !== "builder" && cvMode === "services" && selectedCvPackage === pkg.key);
                    const packageLayout = cvPackageLayout[pkg.key] || { desktopMinHeight: 360, desktopStatsOffset: 0 };
                    return (
                      <div
                        key={pkg.key}
                        style={{
                          display:"flex",
                          flexDirection:"column",
                          gap:isCompactPhone ? 4 : 8,
                          justifyContent:"flex-end",
                          minWidth:0,
                          flex:isCompactPhone ? "1 1 0%" : "1 1 0%",
                        }}
                      >
                        <button
                          onClick={() => {
                            if (cvPackageSelectionLocked) return;
                            if (pkg.key === "builder") {
                              if (cvMode === "builder") {
                                setCvMode(null); setSelectedCvPackage(null); setCvBuilderScreen("menu"); setSelectedCvBuilderOrder(null); setCvStep(0); setCvUnlocked(false);
                                return;
                              }
                              setCvMode("builder"); setSelectedCvPackage(null); setCvBuilderScreen("menu"); setSelectedCvBuilderOrder(null); setCvStep(0); setCvUnlocked(false);
                                try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
                                return;
                            }
                            if (cvMode === "services" && selectedCvPackage === pkg.key) {
                              setCvMode(null); setSelectedCvPackage(null);
                              return;
                            }
                            setCvMode("services"); setSelectedCvPackage(pkg.key);
                              try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
                          }}
                          className="cv-pricing-card"
                          style={{
                            borderRadius:isCompactPhone ? 16 : 24,
                            padding:isCompactPhone ? "6px 5px" : "14px 12px",
                            border:`1px solid ${isActive ? `${pkg.accent}aa` : `${pkg.accent}55`}`,
                            background:pkg.cardBg,
                            textAlign:"center",
                            cursor:cvPackageSelectionLocked ? "not-allowed" : "pointer",
                            fontFamily:"'Cairo',sans-serif",
                            minHeight:isCompactPhone ? 190 : packageLayout.desktopMinHeight,
                            position:"relative",
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"space-between",
                            width:"100%",
                            boxShadow:isActive ? `0 0 0 3px ${pkg.accent}33, 0 20px 32px ${pkg.accent}28` : "0 14px 26px rgba(15,23,42,0.14)",
                            opacity:cvPackageSelectionLocked && !isActive ? 0.45 : 1,
                            filter:cvPackageSelectionLocked && !isActive ? "grayscale(0.1)" : "none"
                          }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:isCompactPhone ? 3 : 10 }}>
                            {pkg.oldPrice ? <span style={{ fontSize:cvScaleFont(isCompactPhone ? 6.5 : 9), color:dark ? "#fff0f0" : "#7f1d1d", background:dark ? "rgba(127,29,29,0.45)" : "#fee2e2", borderRadius:999, padding:isCompactPhone ? "1px 5px" : "3px 8px", fontWeight:800 }}>50%</span> : <span />}
                            <span style={{ fontSize:cvScaleFont(isCompactPhone ? 12 : 31), lineHeight:1 }}>{pkg.icon}</span>
                          </div>
                          <div style={{ fontSize:cvScaleFont(isCompactPhone ? 9 : 18), fontWeight:900, color:pkg.titleColor, marginBottom:2, lineHeight:1.3 }}>{pkg.title}</div>
                          <div style={{ fontSize:cvScaleFont(isCompactPhone ? 7.5 : 12), color:pkg.textColor, marginBottom:isCompactPhone ? 4 : 9, lineHeight:1.35, fontWeight:700 }}>{pkg.summary}</div>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:isCompactPhone ? 3 : 6, marginBottom:isCompactPhone ? 5 : 10, flexWrap:"wrap" }}>
                            {pkg.oldPrice && <span style={{ fontSize:cvScaleFont(isCompactPhone ? 9 : 20), color:pkg.textColor, textDecoration:"line-through", opacity:0.8, fontWeight:900 }}>{pkg.oldPrice}</span>}
                            <span style={{ fontSize:cvScaleFont(isCompactPhone ? 16 : 40), fontWeight:900, color:pkg.titleColor, lineHeight:1 }}>{pkg.price}</span>
                          </div>
                          <div style={{ width:"100%", borderRadius:999, padding:isCompactPhone ? "5px 6px" : "11px 12px", background:pkg.ctaBg, color:pkg.ctaColor, fontSize:cvScaleFont(isCompactPhone ? 7.8 : 13), fontWeight:900, marginTop:isCompactPhone ? 4 : 8, boxShadow:"0 10px 20px rgba(0,0,0,0.16)", border:`1px solid ${pkg.chipBg}` }}>{pkg.cta}</div>
                        </button>
                        {statsItem && (
                          <div
                            className="cv-pricing-stats-card"
                            style={{
                            borderRadius:isCompactPhone ? 12 : 18,
                            padding:isCompactPhone ? "6px 5px" : "12px 10px",
                            border:`1px solid ${statsItem.accent}33`,
                            background:dark ? "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" : "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.55))",
                            textAlign:"center",
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"center",
                            gap:isCompactPhone ? 1 : 3,
                            marginTop:isCompactPhone ? 0 : packageLayout.desktopStatsOffset,
                            minHeight:isCompactPhone ? 58 : 108,
                          }}>
                            <div style={{ fontSize:cvScaleFont(isCompactPhone ? 10 : 18), lineHeight:1 }}>{statsItem.icon}</div>
                            <div style={{ fontSize:cvScaleFont((isCompactPhone ? 7.5 : 13) * 1.1), color:t.text, fontWeight:900, fontFamily:"'Cairo',sans-serif", lineHeight:1.3 }}>
                              {statsItem.metric}: <span style={{ color:statsItem.accent, fontWeight:900 }}>{statsItem.users}</span>
                            </div>
                            <div style={{ fontSize:cvScaleFont((isCompactPhone ? 7.5 : 13) * 1.1), color:t.text, fontWeight:900, fontFamily:"'Cairo',sans-serif", lineHeight:1.3 }}>
                              {lang==="ar" ? "متوسط التقييم:" : "Avg Rating:"}{" "}
                              <span style={{ color:t.subText, fontWeight:900 }}>{statsItem.avg}/5</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {cvMode && (
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6, marginBottom:6, fontFamily:"'Cairo',sans-serif" }}>
                  <button
                    onClick={() => { setCvMode(null); setSelectedCvPackage(null); setCvBuilderScreen("menu"); setSelectedCvBuilderOrder(null); setCvStep(0); setCvUnlocked(false); }}
                    disabled={cvPackageSelectionLocked}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:999, border:`1px solid ${t.border}`, background:t.cardBg, color:t.gold, fontSize:12, fontWeight:800, cursor:cvPackageSelectionLocked?"not-allowed":"pointer", opacity:cvPackageSelectionLocked?0.4:1, flexShrink:0 }}
                  >
                    <span style={{ fontSize:15 }}>{lang==="ar"?"›":"‹"}</span>
                    <span>{lang==="ar" ? "الباقات" : "Packages"}</span>
                  </button>
                  <span style={{ fontSize:13, fontWeight:900, color:t.text, lineHeight:1.3 }}>
                    {cvMode==="builder" ? (lang==="ar"?"مستخدم عادي":"Regular User") : selectedCvPackage==="premium" ? (lang==="ar"?"باقة بريميم":"Premium Package") : (lang==="ar"?"باقة البحث والتوظيف":"Job Search Package")}
                  </span>
                </div>
              )}

              {!cvMode ? (
                <div style={{ marginTop: -11 }}>{cvJobSitesCard}</div>
              ) : cvMode === "builder" ? (
                cvBuilderScreen === "menu" ? (
                  <div style={{ display:"grid", gap:14, marginTop:16 }}>
                    <div style={{ ...cardStyle, textAlign:"center", background:"linear-gradient(135deg,#fff8e6,#fffdf7)", border:`1px solid ${t.gold}44` }}>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:8 }}>
                        {lang==="ar" ? "مستخدم عادي" : "Regular User"}
                      </div>
                      <div style={{ fontSize:12, color:t.subText, lineHeight:1.8, fontFamily:"'Cairo',sans-serif", marginBottom:12 }}>
                        {lang==="ar"
                          ? "المتاح لمستخدم عادي 3 طلبات فقط لهذا الجهاز."
                          : "Regular users can submit up to 3 requests on this device."}
                      </div>
                      <div style={{ display:"grid", gap:10 }}>
                        <button
                          onClick={openCvBuilderNewRequest}
                          style={{ ...cvActionBtnStyle(cvGoldGrad), marginBottom:0 }}
                        >
                          ➕ {lang==="ar" ? "طلب جديد" : "New Request"}
                        </button>
                        <button
                          onClick={openCvBuilderPreviousOrders}
                          style={{ ...cvActionBtnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", marginBottom:0 }}
                        >
                          📋 {lang==="ar" ? `طلبات سابقة (${cvBuilderOrders.length})` : `Previous Requests (${cvBuilderOrders.length})`}
                        </button>
                        {isAdminUser && (
                          <button
                            onClick={() => setCvBuilderScreen("adminOrders")}
                            style={{ ...cvActionBtnStyle("#1e1b4b18", "#7c3aed"), border:`1px solid #7c3aed55`, boxShadow:"none", marginBottom:0 }}
                          >
                            🔑 {lang==="ar" ? `طلبات الأدمن — مستخدم عادي (${cvRealBuilderCount})` : `Admin Orders — Regular (${cvRealBuilderCount})`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : cvBuilderScreen === "adminOrders" ? (
                  <div style={{ display:"grid", gap:14, marginTop:16 }}>
                    <div style={{ ...cardStyle, padding:"14px" }}>
                      <div style={{ fontSize:15, fontWeight:900, color:"#7c3aed", fontFamily:"'Cairo',sans-serif", marginBottom:10 }}>
                        🔑 {lang==="ar" ? "طلبات المستخدمين العاديين" : "Regular Users Orders"}
                      </div>
                      <div style={{ fontSize:10, color:t.subText, fontFamily:"'Cairo',sans-serif", marginBottom:10 }}>
                        {lang==="ar"
                          ? `إجمالي الطلبات: ${cvAdminBuilderOrders.length} • بعد الفلتر: ${cvAdminBuilderOrdersFiltered.length}`
                          : `Total orders: ${cvAdminBuilderOrders.length} • Filtered: ${cvAdminBuilderOrdersFiltered.length}`}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:isCompactPhone ? "1fr" : "1.6fr .8fr .8fr", gap:8, marginBottom:10 }}>
                        <input
                          value={cvAdminOrdersQuery}
                          onChange={(e) => setCvAdminOrdersQuery(e.target.value)}
                          placeholder={lang==="ar" ? "فلتر بالاسم أو الرقم أو الهاتف" : "Filter by name, number, or phone"}
                          style={{ width:"100%", height:36, borderRadius:10, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, padding:"0 10px", fontSize:11, fontFamily:"'Cairo',sans-serif", outline:"none" }}
                        />
                        <select
                          value={cvAdminOrdersStageFilter}
                          onChange={(e) => setCvAdminOrdersStageFilter(e.target.value)}
                          style={{ width:"100%", height:36, borderRadius:10, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, padding:"0 8px", fontSize:11, fontFamily:"'Cairo',sans-serif", outline:"none" }}
                        >
                          <option value="all">{lang==="ar" ? "كل الحالات" : "All statuses"}</option>
                          <option value="active">{lang==="ar" ? "قيد التنفيذ" : "Active"}</option>
                          <option value="done">{lang==="ar" ? "مكتمل" : "Done"}</option>
                        </select>
                        <select
                          value={cvAdminOrdersSortMode}
                          onChange={(e) => setCvAdminOrdersSortMode(e.target.value)}
                          style={{ width:"100%", height:36, borderRadius:10, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, padding:"0 8px", fontSize:11, fontFamily:"'Cairo',sans-serif", outline:"none" }}
                        >
                          <option value="newest">{lang==="ar" ? "الأحدث" : "Newest"}</option>
                          <option value="oldest">{lang==="ar" ? "الأقدم" : "Oldest"}</option>
                          <option value="name">{lang==="ar" ? "الاسم" : "Name"}</option>
                        </select>
                      </div>

                      {cvAdminBuilderOrdersFiltered.length ? (
                        <div style={{ display:"grid", gap:8, maxHeight:470, overflowY:"auto", paddingRight:4 }}>
                          {cvAdminBuilderOrdersFiltered.map((order, idx) => {
                            const orderStage = Number(order?.statusIndex ?? 0);
                            const stageText = orderStage >= 4
                              ? (lang==="ar" ? "مكتمل" : "Done")
                              : (lang==="ar" ? "قيد التنفيذ" : "Active");
                            const stageColor = orderStage >= 4 ? "#16a34a" : "#f59e0b";
                            const orderId = String(order.firebaseId||order.id||"");
                            const isBusy = adminOrderActionBusyId === orderId;
                            const adminBtnBase = { border:"none", borderRadius:8, fontSize:10, fontWeight:900, fontFamily:"'Cairo',sans-serif", cursor:isBusy?"not-allowed":"pointer", padding:"5px 8px", opacity:isBusy?0.5:1 };
                            return (
                            <div key={order.id||order.firebaseId||idx} style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:12, padding:"10px 12px", display:"grid", gap:4 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                <div style={{ fontSize:12, fontWeight:900, color:t.text, fontFamily:"'Cairo',sans-serif" }}>
                                  {String(order.name||order.fullName||"—")}
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                  <span style={{ fontSize:10, color:"#7c3aed", fontWeight:800, fontFamily:"'Cairo',sans-serif" }}>
                                    {String(order.orderNumber||order.serial||"")}
                                  </span>
                                  <span style={{ fontSize:9, fontWeight:800, color:stageColor, border:`1px solid ${stageColor}44`, borderRadius:999, padding:"2px 7px", background:`${stageColor}18` }}>
                                    {stageText}
                                  </span>
                                </div>
                              </div>
                              <div style={{ fontSize:10, color:t.subText, fontFamily:"'Cairo',sans-serif", lineHeight:1.65 }}>
                                {lang==="ar" ? "الهاتف" : "Phone"}: {String(order.phone||"—")} | {lang==="ar" ? "واتساب" : "WhatsApp"}: {String(order.whatsapp||"—")}
                              </div>
                              <div style={{ fontSize:10, color:t.subText, fontFamily:"'Cairo',sans-serif", lineHeight:1.65 }}>
                                {lang==="ar" ? "الدولة" : "Country"}: {String(order.country||"—")} | {lang==="ar" ? "التاريخ" : "Date"}: {String(order.dateStr||order.date?.slice?.(0,10)||"—")}
                              </div>
                              {!!order.email && (
                                <div style={{ fontSize:10, color:t.subText, fontFamily:"'Cairo',sans-serif", lineHeight:1.65 }}>
                                  {lang==="ar" ? "الإيميل" : "Email"}: {order.email}
                                </div>
                              )}
                              {/* ── Admin Mini-Bar ── */}
                              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:4, borderTop:`1px solid ${t.border}`, paddingTop:6 }}>
                                <button disabled={isBusy} onClick={()=>handleAdminOrderSetStage(order, Math.min(STATUS_STEP_KEYS.length-1, orderStage+1))} style={{ ...adminBtnBase, background:"linear-gradient(135deg,#22c55e,#166534)", color:"#fff" }}>
                                  ▶ {lang==="ar"?"مرحلة":"Stage+"}
                                </button>
                                <button disabled={isBusy} onClick={()=>handleAdminOrderSetStage(order, 0)} style={{ ...adminBtnBase, background:"linear-gradient(135deg,#f59e0b,#b45309)", color:"#fff" }}>
                                  ↺ {lang==="ar"?"إعادة":"Reset"}
                                </button>
                                <button disabled={isBusy} onClick={()=>handleAdminOrderEditDetails(order)} style={{ ...adminBtnBase, background:"linear-gradient(135deg,#0ea5e9,#0369a1)", color:"#fff" }}>
                                  ✏️ {lang==="ar"?"تعديل":"Edit"}
                                </button>
                                <button disabled={isBusy} onClick={()=>handleAdminOrderClearReview(order)} style={{ ...adminBtnBase, background:"linear-gradient(135deg,#7c3aed,#4c1d95)", color:"#fff" }}>
                                  ⭐ {lang==="ar"?"حذف تقييم":"Del Review"}
                                </button>
                                <button disabled={isBusy} onClick={()=>handleAdminDeleteOrder(order)} style={{ ...adminBtnBase, background:"linear-gradient(135deg,#ef4444,#7f1d1d)", color:"#fff" }}>
                                  🗑️ {lang==="ar"?"حذف":"Delete"}
                                </button>
                              </div>
                            </div>
                          );})}
                        </div>
                      ) : (
                        <div style={{ fontSize:12, color:t.subText, textAlign:"center", padding:"14px 0", fontFamily:"'Cairo',sans-serif" }}>
                          {lang==="ar" ? "لا توجد نتائج مطابقة للفلتر." : "No orders match the current filter."}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", justifyContent:"center" }}>
                      <button
                        onClick={() => setCvBuilderScreen("menu")}
                        style={{ ...cvActionBtnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", maxWidth:220 }}
                      >
                        {lang==="ar" ? "رجوع" : "Back"}
                      </button>
                    </div>
                  </div>
                ) : cvBuilderScreen === "previousOrders" ? (
                  <div style={{ display:"grid", gap:14, marginTop:16 }}>
                    <div style={{ ...cardStyle, padding:"14px" }}>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:10 }}>
                        {lang==="ar" ? "طلباتك السابقة" : "Your Previous Requests"}
                      </div>
                      {cvBuilderOrders.length ? (
                        <div style={{ display:"grid", gap:10 }}>
                          {cvBuilderOrders.map((order) => (
                            <button
                              key={order.id}
                              onClick={() => {
                                setSelectedCvBuilderOrder(order);
                                setCvBuilderScreen("orderDetails");
                              }}
                              style={{
                                width:"100%",
                                textAlign:isAr ? "right" : "left",
                                padding:"12px 14px",
                                borderRadius:16,
                                border:`1px solid ${t.border}`,
                                background:t.cardBg,
                                cursor:"pointer",
                                fontFamily:"'Cairo',sans-serif",
                              }}
                            >
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6 }}>
                                <div style={{ fontSize:13, fontWeight:900, color:t.text }}>
                                  {order.packageName || (lang==="ar" ? "مستخدم عادي" : "Regular User")}
                                </div>
                                <div style={{ fontSize:10, color:t.gold, fontWeight:800 }}>
                                  {order.orderNumber}
                                </div>
                              </div>
                              <div style={{ fontSize:11, color:t.subText, lineHeight:1.8 }}>
                                {order.serial} · {order.dateStr}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize:12, color:t.subText, textAlign:"center", padding:"10px 0", fontFamily:"'Cairo',sans-serif" }}>
                          {lang==="ar" ? "لا توجد طلبات سابقة حتى الآن." : "There are no previous requests yet."}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", justifyContent:"center" }}>
                      <button
                        onClick={() => setCvBuilderScreen("menu")}
                        style={{ ...cvActionBtnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", maxWidth:220 }}
                      >
                        {lang==="ar" ? "رجوع" : "Back"}
                      </button>
                    </div>
                  </div>
                ) : cvBuilderScreen === "orderDetails" && selectedCvBuilderOrder ? (
                  <div style={{ display:"grid", gap:14, marginTop:16 }}>
                    <div style={{ ...cardStyle, padding:"14px" }}>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:12 }}>
                        {lang==="ar" ? "تفاصيل الطلب السابق" : "Previous Request Details"}
                      </div>
                      {[
                        [lang==="ar" ? "رقم الطلب" : "Order Number", selectedCvBuilderOrder.orderNumber],
                        [lang==="ar" ? "السيريال" : "Serial", selectedCvBuilderOrder.serial],
                        [lang==="ar" ? "الخدمة" : "Service", selectedCvBuilderOrder.packageName],
                        [lang==="ar" ? "الاسم الكامل" : "Full Name", selectedCvBuilderOrder.data?.fullName],
                        [lang==="ar" ? "المسمى الوظيفي" : "Job Title", selectedCvBuilderOrder.data?.jobTitle],
                        [lang==="ar" ? "الدولة" : "Country", selectedCvBuilderOrder.data?.country],
                        [lang==="ar" ? "المدينة / الموقع" : "City / Location", selectedCvBuilderOrder.data?.location],
                        [lang==="ar" ? "رقم الموبايل" : "Mobile", selectedCvBuilderOrder.data?.phone],
                        [lang==="ar" ? "رقم الواتساب" : "WhatsApp", selectedCvBuilderOrder.data?.whatsapp],
                        [lang==="ar" ? "الإيميل" : "Email", selectedCvBuilderOrder.data?.email || "—"],
                        [lang==="ar" ? "تاريخ الطلب" : "Request Date", selectedCvBuilderOrder.dateStr],
                      ].map(([label, value], idx) => (
                        <div key={idx} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
                          <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{label}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:t.text, fontFamily:"'Cairo',sans-serif", textAlign:isAr ? "left" : "right" }}>{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setCvBuilderScreen("submittedData")}
                      style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#fff8e6,#fffdf7)", border:`1px solid ${t.gold}55`, cursor:"pointer", boxShadow:`0 10px 26px ${t.gold}18` }}
                    >
                      <div style={{ fontSize:26, marginBottom:8 }}>🗂️</div>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:6 }}>
                        {lang==="ar" ? "إظهار بيانات هذا الطلب" : "Show This Request Data"}
                      </div>
                      <div style={{ fontSize:11, color:t.subText, lineHeight:1.8, fontFamily:"'Cairo',sans-serif" }}>
                        {lang==="ar"
                          ? "افتح جميع البيانات التي أدخلتها في هذا الطلب بشكل مرتب ومبسط."
                          : "Open all the data you submitted in this request in a simple organized view."}
                      </div>
                    </button>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10 }}>
                      <button
                        onClick={() => setModal({ type:"cvExportLangPrevOrder", fileType:"pdf", order: selectedCvBuilderOrder })}
                        disabled={cvPdfExporting}
                        style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#fff1f2,#f8fafc)", border:"1px solid #fda4af", cursor: cvPdfExporting ? "wait" : "pointer", opacity: cvPdfExporting ? 0.75 : 1, minHeight:90, padding:"10px" }}
                      >
                        <div style={{ fontSize:20, marginBottom:4 }}>📄</div>
                        <div style={{ fontSize:13, fontWeight:900, color:"#e11d48", fontFamily:"'Cairo',sans-serif", marginBottom:3 }}>
                          {cvPdfExporting ? (lang==="ar" ? "جاري التجهيز..." : "Preparing...") : (lang==="ar" ? "تصدير PDF" : "Export PDF")}
                        </div>
                      </button>
                      <button
                        onClick={() => setModal({ type:"cvExportLangPrevOrder", fileType:"word", order: selectedCvBuilderOrder })}
                        style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#eff6ff,#f8fafc)", border:"1px solid #93c5fd", cursor:"pointer", minHeight:90, padding:"10px" }}
                      >
                        <div style={{ fontSize:20, marginBottom:4 }}>📝</div>
                        <div style={{ fontSize:13, fontWeight:900, color:"#2563eb", fontFamily:"'Cairo',sans-serif", marginBottom:3 }}>
                          {lang==="ar" ? "تصدير Word" : "Export Word"}
                        </div>
                      </button>
                    </div>
                    <div style={{ display:"flex", justifyContent:"center" }}>
                      <button
                        onClick={() => {
                          setSelectedCvBuilderOrder(null);
                          setCvBuilderScreen("previousOrders");
                        }}
                        style={{ ...cvActionBtnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", maxWidth:220 }}
                      >
                        {lang==="ar" ? "رجوع" : "Back"}
                      </button>
                    </div>
                  </div>
                ) : cvBuilderScreen === "submittedData" && selectedCvBuilderOrder ? (
                  <div style={{ display:"grid", gap:14, marginTop:16 }}>
                    <div style={{ ...cardStyle, padding:"14px" }}>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:12 }}>
                        {lang==="ar" ? "البيانات المقدمة في هذا الطلب" : "Submitted Data For This Request"}
                      </div>

                      <div style={{ display:"grid", gap:12 }}>
                        <div style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px" }}>
                          <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:10, fontFamily:"'Cairo',sans-serif" }}>
                            {lang==="ar" ? "البيانات الشخصية" : "Personal Information"}
                          </div>
                          {[
                            [lang==="ar" ? "الاسم الكامل" : "Full Name", selectedCvBuilderOrder.data?.fullName],
                            [lang==="ar" ? "المسمى الوظيفي" : "Job Title", selectedCvBuilderOrder.data?.jobTitle],
                            [lang==="ar" ? "الدولة" : "Country", selectedCvBuilderOrder.data?.country],
                            [lang==="ar" ? "المدينة / الموقع" : "City / Location", selectedCvBuilderOrder.data?.location],
                            [lang==="ar" ? "رقم الموبايل" : "Mobile", selectedCvBuilderOrder.data?.phone],
                            [lang==="ar" ? "رقم الواتساب" : "WhatsApp", selectedCvBuilderOrder.data?.whatsapp],
                            [lang==="ar" ? "البريد الإلكتروني" : "Email", selectedCvBuilderOrder.data?.email],
                            [lang==="ar" ? "الجنسية" : "Nationality", selectedCvBuilderOrder.data?.nationality],
                            [lang==="ar" ? "رقم الإقامة / الهوية" : "ID / Iqama", selectedCvBuilderOrder.data?.iqama],
                            [lang==="ar" ? "الحالة الاجتماعية" : "Marital Status", selectedCvBuilderOrder.data?.maritalStatus],
                            [lang==="ar" ? "حالة الإقامة" : "Iqama Status", selectedCvBuilderOrder.data?.iqamaStatus],
                          ].map(([label, value], idx) => (
                            <div key={idx} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
                              <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{label}</span>
                              <span style={{ fontSize:12, fontWeight:800, color:t.text, fontFamily:"'Cairo',sans-serif", textAlign:isAr ? "left" : "right" }}>{value || "—"}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px" }}>
                          <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:8, fontFamily:"'Cairo',sans-serif" }}>
                            {lang==="ar" ? "الملخص والعضويات" : "Summary & Memberships"}
                          </div>
                          <div style={{ fontSize:12, color:t.text, lineHeight:1.9, marginBottom:10, fontFamily:"'Cairo',sans-serif" }}>
                            {selectedCvBuilderOrder.data?.summary || "—"}
                          </div>
                          <div style={{ display:"grid", gap:8 }}>
                            {(selectedCvBuilderOrder.data?.memberships || []).length > 0 ? (
                              (selectedCvBuilderOrder.data?.memberships || []).map((membership, idx) => (
                                <div key={idx} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
                                  <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{membership?.name || "—"}</span>
                                  <span style={{ fontSize:12, fontWeight:800, color:t.text, fontFamily:"'Cairo',sans-serif" }}>{membership?.number || "—"}</span>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }} >{lang==="ar" ? "لا توجد عضويات مضافة" : "No memberships added"}</div>
                            )}
                          </div>
                        </div>

                        <div style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px" }}>
                          <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:8, fontFamily:"'Cairo',sans-serif" }}>
                            {lang==="ar" ? "الخبرات العملية" : "Work Experience"}
                          </div>
                          {(selectedCvBuilderOrder.data?.experiences || []).length ? (
                            <div style={{ display:"grid", gap:10 }}>
                              {(selectedCvBuilderOrder.data?.experiences || []).map((exp, idx) => (
                                <div key={exp.id || idx} style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:12, padding:"10px" }}>
                                  <div style={{ fontSize:12, fontWeight:900, color:t.text, marginBottom:6, fontFamily:"'Cairo',sans-serif" }}>
                                    {exp.jobTitle || (lang==="ar" ? `خبرة ${idx+1}` : `Experience ${idx+1}`)}
                                  </div>
                                  <div style={{ fontSize:11, color:t.subText, lineHeight:1.8, fontFamily:"'Cairo',sans-serif" }}>
                                    {[exp.company, exp.location, exp.startDate, exp.current ? (lang==="ar" ? "حتى الآن" : "Present") : exp.endDate].filter(Boolean).join(" • ") || "—"}
                                  </div>
                                  {!!(exp.responsibilities || []).filter(Boolean).length && (
                                    <div style={{ marginTop:8, fontSize:11, color:t.text, lineHeight:1.8, fontFamily:"'Cairo',sans-serif" }}>
                                      {(exp.responsibilities || []).filter(Boolean).map((item, itemIdx) => (
                                        <div key={itemIdx}>• {item}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>
                              {lang==="ar" ? "لا توجد خبرات مضافة." : "No experience entries added."}
                            </div>
                          )}
                        </div>

                        <div style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px" }}>
                          <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:8, fontFamily:"'Cairo',sans-serif" }}>
                            {lang==="ar" ? "المهارات والبرامج والإنجازات" : "Skills, Tools & Achievements"}
                          </div>
                          {[
                            [lang==="ar" ? "المهارات الأساسية" : "Core Competencies", (selectedCvBuilderOrder.data?.coreCompetencies || []).join(" | ")],
                            [lang==="ar" ? "الأدوات والبرامج" : "Tools & Software", (selectedCvBuilderOrder.data?.toolsSoftware || []).join(" | ")],
                            [lang==="ar" ? "الإنجازات" : "Achievements", (selectedCvBuilderOrder.data?.achievements || []).filter(Boolean).join(" | ")],
                          ].map(([label, value], idx) => (
                            <div key={idx} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
                              <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{label}</span>
                              <span style={{ fontSize:12, fontWeight:800, color:t.text, fontFamily:"'Cairo',sans-serif", textAlign:isAr ? "left" : "right" }}>{value || "—"}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px" }}>
                          <div style={{ fontSize:13, fontWeight:900, color:t.gold, marginBottom:8, fontFamily:"'Cairo',sans-serif" }}>
                            {lang==="ar" ? "التعليم والشهادات واللغات" : "Education, Certifications & Languages"}
                          </div>
                          {[
                            [lang==="ar" ? "التعليم" : "Education", (selectedCvBuilderOrder.data?.education || []).map((item) => [item.degree, item.major, item.university, item.year].filter(Boolean).join(" — ")).filter(Boolean).join(" | ")],
                            [lang==="ar" ? "الشهادات" : "Certifications", (selectedCvBuilderOrder.data?.certifications || []).map((item) => [item.name, item.issuer, item.year].filter(Boolean).join(" — ")).filter(Boolean).join(" | ")],
                            [lang==="ar" ? "اللغات" : "Languages", (selectedCvBuilderOrder.data?.languages || []).map((item) => [item.lang, item.level].filter(Boolean).join(" — ")).filter(Boolean).join(" | ")],
                          ].map(([label, value], idx) => (
                            <div key={idx} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
                              <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{label}</span>
                              <span style={{ fontSize:12, fontWeight:800, color:t.text, fontFamily:"'Cairo',sans-serif", textAlign:isAr ? "left" : "right" }}>{value || "—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"center" }}>
                      <button
                        onClick={() => setCvBuilderScreen("orderDetails")}
                        style={{ ...cvActionBtnStyle(t.inputBg, t.gold), border:`1px solid ${t.gold}`, boxShadow:"none", maxWidth:220 }}
                      >
                        {lang==="ar" ? "رجوع" : "Back"}
                      </button>
                    </div>
                  </div>
                ) : (
                <>

              {/* ── Progress Bar ─────────────────────────────── */}
              <div style={{ display:"flex", alignItems:"center", marginBottom:20, gap:0 }}>
                {cvSteps.map((s, i) => (
                  <React.Fragment key={i}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flex:1, cursor:"pointer" }} onClick={() => { void handleCvStepChange(i); }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, border:`2px solid ${i <= cvStep ? t.gold : t.border}`, background: i < cvStep ? t.gold : i === cvStep ? `${t.gold}22` : t.inputBg, color: i <= cvStep ? (i < cvStep ? "#fff" : t.gold) : t.subText, transition:"all .2s", fontFamily:"'Cairo',sans-serif" }}>
                        {i < cvStep ? "✓" : cvIcons[i]}
                      </div>
                      <div style={{ fontSize:9, color: i === cvStep ? t.gold : t.subText, fontWeight: i === cvStep ? 700 : 400, fontFamily:"'Cairo',sans-serif", textAlign:"center" }}>{s}</div>
                    </div>
                    {i < cvSteps.length - 1 && (
                      <div style={{ flex:1, height:2, background: i < cvStep ? t.gold : t.border, marginBottom:18, transition:"background .2s" }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {!!cvStepValidationError && (
                <div style={{ ...cardStyle, marginBottom:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.24)", color:"#b91c1c", fontSize:12, fontWeight:800, lineHeight:1.8 }}>
                  {cvStepValidationError}
                </div>
              )}
              {!!cvBuilderOrderSyncError && (
                <div style={{ ...cardStyle, marginBottom:12, background:"rgba(251,191,36,0.10)", border:"1px solid rgba(217,119,6,0.28)", color:"#b45309", fontSize:12, fontWeight:800, lineHeight:1.8 }}>
                  {cvBuilderOrderSyncError}
                </div>
              )}

              {/* ═══ STEP 0: PERSONAL ════════════════════════ */}
              {cvStep === 0 && (
                <div>
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>👤 {lang==="ar" ? "البيانات الشخصية" : "Personal Information"}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[
                        { field:"fullName", ar:"الاسم الكامل", en:"Full Name", ph: lang==="ar" ? "أحمد سامي" : "Alex Morgan" },
                        { field:"jobTitle", ar:"المسمى الوظيفي", en:"Job Title", ph: lang==="ar" ? "أخصائي عمليات" : "Operations Specialist" },
                        { field:"country", ar:"الدولة", en:"Country", ph: lang==="ar" ? "مصر" : "Egypt" },
                        { field:"location", ar:"المدينة / الموقع", en:"City / Location", ph: lang==="ar" ? "القاهرة" : "Cairo" },
                        { field:"phone", ar:"رقم الموبايل", en:"Mobile Number", ph:"+966 00 00 000" },
                        { field:"whatsapp", ar:"رقم الواتساب", en:"WhatsApp Number", ph:"+966 00 00 000" },
                        { field:"email", ar:"البريد الإلكتروني", en:"Email", ph:"example@email.com" },
                        { field:"nationality", ar:"الجنسية", en:"Nationality", ph: lang==="ar" ? "مصري" : "Egyptian" },
                        { field:"iqama", ar:"رقم الإقامة / الهوية", en:"ID / Iqama No.", ph: lang==="ar" ? "0000000000" : "0000000000" },
                      ].map(f => (
                        <div key={f.field} style={{ display:"flex", flexDirection:"column", gap:4, gridColumn: f.field==="fullName" || f.field==="jobTitle" ? "1/-1" : "auto" }}>
                          <label style={labelStyle}>{lang==="ar" ? f.ar : f.en}</label>
                          <input style={inputStyle} value={cvData[f.field]} placeholder={f.ph} onChange={e => cvUpdate(f.field, e.target.value)} />
                        </div>
                      ))}
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <label style={labelStyle}>{lang==="ar" ? "الحالة الاجتماعية" : "Marital Status"}</label>
                        <select style={inputStyle} value={cvData.maritalStatus} onChange={e => cvUpdate("maritalStatus", e.target.value)}>
                          <option value="">{lang==="ar" ? "اختر..." : "Select..."}</option>
                          <option value={lang==="ar" ? "أعزب" : "Single"}>{lang==="ar" ? "أعزب" : "Single"}</option>
                          <option value={lang==="ar" ? "متزوج" : "Married"}>{lang==="ar" ? "متزوج" : "Married"}</option>
                        </select>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <label style={labelStyle}>{lang==="ar" ? "حالة الإقامة" : "Iqama Status"}</label>
                        <select style={inputStyle} value={cvData.iqamaStatus} onChange={e => cvUpdate("iqamaStatus", e.target.value)}>
                          <option value="transferable">{lang==="ar" ? "قابلة للنقل" : "Transferable"}</option>
                          <option value="non-transferable">{lang==="ar" ? "غير قابلة للنقل" : "Non-Transferable"}</option>
                          <option value="none">{lang==="ar" ? "لا يوجد" : "None"}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Memberships */}
                  <div style={cardStyle}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={secHeadStyle}>🏛️ {lang==="ar" ? "العضويات المهنية" : "Professional Memberships"}</div>
                      <button onClick={cvAddMembership} style={{ background:t.gold, border:"none", borderRadius:8, padding:"6px 12px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>+</button>
                    </div>
                    {cvData.memberships.map((mem, i) => (
                      <div key={mem.id} style={{ background:t.inputBg, borderRadius:10, padding:"12px", marginBottom:10, border:`1px solid ${t.border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif" }}>🏢 {lang==="ar" ? `عضوية ${i+1}` : `Membership ${i+1}`}</div>
                          {cvData.memberships.length > 1 && <button onClick={() => cvRemoveMembership(mem.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:t.subText }}>✕</button>}
                        </div>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                          <input type="radio" id={`has-yes-${mem.id}`} name={`has-${mem.id}`} checked={!mem.hasNo} onChange={() => cvUpdateMembership(mem.id, "hasNo", false)} style={{ accentColor:t.gold, width:16, height:16, cursor:"pointer" }} />
                          <label htmlFor={`has-yes-${mem.id}`} style={{ ...labelStyle, marginBottom:0, cursor:"pointer" }}>{lang==="ar" ? "يوجد عضوية" : "Has Membership"}</label>
                          <input type="radio" id={`has-no-${mem.id}`} name={`has-${mem.id}`} checked={mem.hasNo} onChange={() => cvUpdateMembership(mem.id, "hasNo", true)} style={{ accentColor:t.gold, width:16, height:16, cursor:"pointer", marginLeft:20 }} />
                          <label htmlFor={`has-no-${mem.id}`} style={{ ...labelStyle, marginBottom:0, cursor:"pointer" }}>{lang==="ar" ? "لا توجد عضوية" : "No Membership"}</label>
                        </div>
                        {!mem.hasNo && (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              <label style={labelStyle}>{lang==="ar" ? "اسم النقابة / الهيئة" : "Membership Name"}</label>
                              <input style={inputStyle} value={mem.name} placeholder={lang==="ar" ? "مثلاً: هيئة المهندسين السعوديين" : "e.g., Saudi Council of Engineers"} onChange={e => cvUpdateMembership(mem.id, "name", e.target.value)} />
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              <label style={labelStyle}>{lang==="ar" ? "رقم العضوية" : "Membership Number"}</label>
                              <input style={inputStyle} value={mem.number} placeholder={lang==="ar" ? "0000000" : "000000"} onChange={e => cvUpdateMembership(mem.id, "number", e.target.value)} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>✨ {lang==="ar" ? "الملخص المهني" : "Professional Summary"}</div>
                    <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical", lineHeight:1.7 }}
                      placeholder={lang==="ar" ? "اكتب نبذة مهنية مختصرة تبرز خبراتك وأهم نقاط قوتك..." : "Write a short professional summary that highlights your strengths and experience..."}
                      value={cvData.summary} onChange={e => cvUpdate("summary", e.target.value)} />
                    <div style={{ fontSize:10, color:t.subText, fontFamily:"'Cairo',sans-serif", marginTop:6 }}>
                      {lang==="ar" ? "💡 اكتب 2-4 جمل تلخص خبرتك وتخصصك" : "💡 Write 2-4 sentences summarizing your expertise"}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ STEP 1: EXPERIENCE ══════════════════════ */}
              {cvStep === 1 && (
                <div>
                  {cvData.experiences.map((exp, ei) => (
                    <div key={exp.id} style={{ ...cardStyle, border:`1px solid ${t.gold}44` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif" }}>
                          💼 {lang==="ar" ? `خبرة ${ei+1}` : `Experience ${ei+1}`}
                        </div>
                        {cvData.experiences.length > 1 && (
                          <button onClick={() => cvRemoveExp(exp.id)} style={{ background:"#e53e3e18", border:"1px solid #e53e3e30", borderRadius:8, padding:"3px 10px", cursor:"pointer", fontSize:11, color:"#e53e3e", fontFamily:"'Cairo',sans-serif" }}>
                            {lang==="ar" ? "حذف" : "Remove"}
                          </button>
                        )}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                        {[
                          { field:"jobTitle", ar:"المسمى الوظيفي", en:"Job Title", ph: lang==="ar" ? "مسؤول مبيعات" : "Sales Executive", full:true },
                          { field:"company", ar:"اسم الشركة", en:"Company", ph: lang==="ar" ? "شركة التقنية الحديثة" : "Future Tech Co." },
                          { field:"location", ar:"الموقع", en:"Location", ph: lang==="ar" ? "دبي، الإمارات" : "Dubai, UAE" },
                          { field:"startDate", ar:"تاريخ البدء", en:"Start Date", ph:"Oct 2000" },
                          { field:"endDate", ar:"تاريخ الانتهاء", en:"End Date", ph: exp.current ? (lang==="ar" ? "حتى الآن" : "Present") : "Dec 2025" },
                        ].map(f => (
                          <div key={f.field} style={{ display:"flex", flexDirection:"column", gap:4, gridColumn: f.full ? "1/-1" : "auto" }}>
                            <label style={labelStyle}>{lang==="ar" ? f.ar : f.en}</label>
                            <input style={{ ...inputStyle, opacity: f.field==="endDate" && exp.current ? 0.4 : 1 }}
                              disabled={f.field==="endDate" && exp.current}
                              value={f.field==="endDate" && exp.current ? (lang==="ar" ? "حتى الآن" : "Present") : exp[f.field]}
                              placeholder={f.ph}
                              onChange={e => cvUpdateExp(exp.id, f.field, e.target.value)} />
                          </div>
                        ))}
                        <div style={{ display:"flex", alignItems:"center", gap:8, gridColumn:"1/-1" }}>
                          <input type="checkbox" id={`curr-${exp.id}`} checked={exp.current} onChange={e => cvUpdateExp(exp.id, "current", e.target.checked)} style={{ accentColor:t.gold, width:14, height:14 }} />
                          <label htmlFor={`curr-${exp.id}`} style={{ ...labelStyle, marginBottom:0, cursor:"pointer" }}>{lang==="ar" ? "أعمل هنا حالياً" : "Currently working here"}</label>
                        </div>
                      </div>

                      {/* Responsibilities */}
                      <div style={{ marginBottom:10 }}>
                        <label style={labelStyle}>📌 {lang==="ar" ? "المسؤوليات والمهام" : "Responsibilities"}</label>
                        {exp.responsibilities.map((r, ri) => (
                          <div key={ri} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                            <div style={{ width:20, height:20, borderRadius:"50%", background:`${t.gold}22`, color:t.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{ri+1}</div>
                            <input style={{ ...inputStyle, flex:1 }} value={r}
                              placeholder={lang==="ar" ? "أدخل مسؤولية أو مهمة..." : "Enter a responsibility or task..."}
                              onChange={e => cvUpdateResp(exp.id, ri, e.target.value)} />
                            {exp.responsibilities.length > 1 && (
                              <button onClick={() => cvRemoveResp(exp.id, ri)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:t.subText, padding:0, width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button style={addBtnStyle} onClick={() => cvAddRespLine(exp.id)}>+ {lang==="ar" ? "أضف مسؤولية" : "Add responsibility"}</button>
                      </div>

                      {/* Projects */}
                      <div>
                        <label style={labelStyle}>🏗️ {lang==="ar" ? "المشاريع (اختياري)" : "Projects (optional)"}</label>
                        {exp.projects.map((pr, pi) => (
                          <div key={pi} style={{ background:t.inputBg, borderRadius:10, padding:"10px", marginBottom:8, border:`1px solid ${t.border}` }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif" }}>🔹 {lang==="ar" ? `مشروع ${pi+1}` : `Project ${pi+1}`}</div>
                              <button onClick={() => cvRemoveProject(exp.id, pi)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:t.subText }}>✕</button>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                              {[
                                { field:"name", ar:"اسم المشروع", en:"Project Name", ph: lang==="ar" ? "منصة خدمة عملاء رقمية" : "Digital Customer Platform" },
                                { field:"owner", ar:"صاحب العمل", en:"Owner/Client", ph: lang==="ar" ? "جهة حكومية" : "Government Entity" },
                                { field:"cost", ar:"التكلفة التقريبية", en:"Approx. Cost", ph:"~150M SAR" },
                                { field:"location", ar:"الموقع", en:"Location", ph: lang==="ar" ? "القاهرة" : "Cairo" },
                              ].map(f => (
                                <div key={f.field} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                  <label style={{ ...labelStyle, fontSize:10 }}>{lang==="ar" ? f.ar : f.en}</label>
                                  <input style={{ ...inputStyle, fontSize:12, padding:"7px 10px" }} value={pr[f.field]} placeholder={f.ph} onChange={e => cvUpdateProject(exp.id, pi, f.field, e.target.value)} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button style={{ ...addBtnStyle, border:`1px dashed ${t.border}`, color:t.subText }} onClick={() => cvAddProject(exp.id)}>+ {lang==="ar" ? "أضف مشروع" : "Add project"}</button>
                      </div>
                    </div>
                  ))}
                  <button style={{ ...addBtnStyle, padding:"12px", fontSize:13 }} onClick={cvAddExp}>+ {lang==="ar" ? "إضافة خبرة وظيفية جديدة" : "Add new work experience"}</button>
                </div>
              )}

              {/* ═══ STEP 2: SKILLS ══════════════════════════ */}
              {cvStep === 2 && (
                <div>
                  {/* Core Competencies */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>⭐ {lang==="ar" ? "المهارات الأساسية" : "Core Competencies"}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:40, padding:"8px 10px", borderRadius:10, border:`1px solid ${t.border}`, background:t.inputBg, marginBottom:8 }}>
                      {cvData.coreCompetencies.map(tag => (
                        <span key={tag} style={tagStyle}>{tag} <button onClick={() => cvRemoveTag("coreCompetencies", tag)} style={{ background:"none", border:"none", cursor:"pointer", color:t.gold, fontSize:13, lineHeight:1, padding:0 }}>×</button></span>
                      ))}
                      <input style={{ border:"none", outline:"none", background:"none", fontSize:12, color:t.text, fontFamily:"'Cairo',sans-serif", minWidth:120, flex:1 }}
                        value={compTag} placeholder={lang==="ar" ? "أضف مهارة واضغط Enter..." : "Add skill and press Enter..."}
                        onChange={e => setCompTag(e.target.value)}
                        onKeyDown={e => { if(e.key==="Enter"){ e.preventDefault(); cvAddTag("coreCompetencies", compTag, setCompTag); }}} />
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {(lang==="ar" ? ["تقدير التكاليف","جداول الكميات","التخطيط والعطاءات","هندسة القيمة","إدارة العقود","المطالبات والتغييرات","إدارة المشتريات","التفاوض التجاري"]
                        : ["Cost Estimation","Bill of Quantities","Tendering & Bidding","Value Engineering","Contract Admin","Claims & Variations","Procurement","Commercial Negotiation"]).map(s => (
                        <button key={s} onClick={() => { if(!cvData.coreCompetencies.includes(s)) cvUpdate("coreCompetencies", [...cvData.coreCompetencies, s]); }}
                          style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${t.border}`, background: cvData.coreCompetencies.includes(s) ? `${t.gold}22` : t.inputBg, color: cvData.coreCompetencies.includes(s) ? t.gold : t.subText, fontSize:11, cursor:"pointer", fontFamily:"'Cairo',sans-serif", fontWeight: cvData.coreCompetencies.includes(s) ? 700 : 400 }}>
                          {cvData.coreCompetencies.includes(s) ? "✓ " : "+ "}{s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tools & Software */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>🛠️ {lang==="ar" ? "الأدوات والبرامج" : "Tools & Software"}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:40, padding:"8px 10px", borderRadius:10, border:`1px solid ${t.border}`, background:t.inputBg, marginBottom:8 }}>
                      {cvData.toolsSoftware.map(tag => (
                        <span key={tag} style={{ ...tagStyle, background:`#1d4ed822`, color:"#60a5fa" }}>{tag} <button onClick={() => cvRemoveTag("toolsSoftware", tag)} style={{ background:"none", border:"none", cursor:"pointer", color:"#60a5fa", fontSize:13, lineHeight:1, padding:0 }}>×</button></span>
                      ))}
                      <input style={{ border:"none", outline:"none", background:"none", fontSize:12, color:t.text, fontFamily:"'Cairo',sans-serif", minWidth:120, flex:1 }}
                        value={toolTag} placeholder={lang==="ar" ? "أضف برنامج واضغط Enter..." : "Add tool and press Enter..."}
                        onChange={e => setToolTag(e.target.value)}
                        onKeyDown={e => { if(e.key==="Enter"){ e.preventDefault(); cvAddTag("toolsSoftware", toolTag, setToolTag); }}} />
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {["AutoCAD 2D","Revit","PlanSwift","CostX","MS Excel","MS Office","Google SketchUp","AutoRebar"].map(s => (
                        <button key={s} onClick={() => { if(!cvData.toolsSoftware.includes(s)) cvUpdate("toolsSoftware", [...cvData.toolsSoftware, s]); }}
                          style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${t.border}`, background: cvData.toolsSoftware.includes(s) ? "#1d4ed822" : t.inputBg, color: cvData.toolsSoftware.includes(s) ? "#60a5fa" : t.subText, fontSize:11, cursor:"pointer", fontFamily:"'Cairo',sans-serif", fontWeight: cvData.toolsSoftware.includes(s) ? 700 : 400 }}>
                          {cvData.toolsSoftware.includes(s) ? "✓ " : "+ "}{s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>🏆 {lang==="ar" ? "الإنجازات المميزة" : "Selected Achievements"}</div>
                    {cvData.achievements.map((a, i) => (
                      <div key={i} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:8 }}>
                        <span style={{ fontSize:14 }}>⚡</span>
                        <input style={{ ...inputStyle, flex:1 }} value={a}
                          placeholder={lang==="ar" ? "خفضت وقت إعداد العطاءات بنسبة 20%..." : "Reduced tender preparation time by ~20%..."}
                          onChange={e => cvUpdateAchievement(i, e.target.value)} />
                        {cvData.achievements.length > 1 && (
                          <button onClick={() => cvRemoveAchievement(i)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:t.subText, padding:0, width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button style={addBtnStyle} onClick={cvAddAchievement}>+ {lang==="ar" ? "أضف إنجاز" : "Add achievement"}</button>
                  </div>

                  {/* ATS Keywords */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>🔑 {lang==="ar" ? "الكلمات المفتاحية ATS" : "ATS Keywords"}</div>
                    <textarea style={{ ...inputStyle, minHeight:60, resize:"vertical", lineHeight:1.7 }}
                      placeholder={lang==="ar" ? "أضف كلمات مفتاحية موضوعة بفواصل (يوصى به للبحث عن الوظائف)..." : "Add keywords separated by commas (recommended for job search)..."}
                      value={cvData.keywords} onChange={e => cvUpdate("keywords", e.target.value)} />
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={() => cvSaveSection("step2")}
                    style={{ 
                      width:"100%", 
                      padding:"12px 16px", 
                      background: cvSectionsSaved.step2 ? "#10b98122" : t.gold, 
                      border:"none", 
                      borderRadius:10, 
                      color: cvSectionsSaved.step2 ? "#059669" : "white",
                      fontSize:14, 
                      fontWeight:700, 
                      cursor:"pointer", 
                      fontFamily:"'Cairo',sans-serif",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      gap:8,
                      marginTop:16
                    }}>
                    {cvSectionsSaved.step2 ? (
                      <>✓ {lang==="ar" ? "تم الحفظ بنجاح" : "Saved Successfully"}</>
                    ) : (
                      <>💾 {lang==="ar" ? "احفظ البيانات" : "Save Section"}</>
                    )}
                  </button>
                </div>
              )}

              {/* ═══ STEP 3: EDUCATION ═══════════════════════ */}
              {cvStep === 3 && (
                <div>
                  {/* Education */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>🎓 {lang==="ar" ? "التعليم" : "Education"}</div>
                    {cvData.education.map((edu, i) => (
                      <div key={i} style={{ background:t.inputBg, borderRadius:10, padding:"12px", marginBottom:10, border:`1px solid ${t.border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif" }}>📚 {lang==="ar" ? `مؤهل ${i+1}` : `Degree ${i+1}`}</div>
                          {cvData.education.length > 1 && <button onClick={() => cvRemoveEdu(i)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:t.subText }}>✕</button>}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                          {[
                            { f:"degree", ar:"الدرجة العلمية", en:"Degree", ph: lang==="ar" ? "بكالوريوس" : "B.Sc." },
                            { f:"major", ar:"التخصص", en:"Major", ph: lang==="ar" ? "الهندسة المدنية" : "Civil Engineering" },
                            { f:"university", ar:"الجامعة", en:"University", ph: lang==="ar" ? "جامعة الإسكندرية" : "Alexandria University", full:true },
                            { f:"year", ar:"سنة التخرج", en:"Graduation Year", ph:"2013" },
                          ].map(f => (
                            <div key={f.f} style={{ display:"flex", flexDirection:"column", gap:3, gridColumn: f.full ? "1/-1" : "auto" }}>
                              <label style={{ ...labelStyle, fontSize:10 }}>{lang==="ar" ? f.ar : f.en}</label>
                              <input style={{ ...inputStyle, fontSize:12 }} value={edu[f.f]} placeholder={f.ph} onChange={e => cvUpdateEdu(i, f.f, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button style={addBtnStyle} onClick={cvAddEdu}>+ {lang==="ar" ? "أضف مؤهل" : "Add degree"}</button>
                  </div>

                  {/* Certifications */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>📜 {lang==="ar" ? "الشهادات والدورات" : "Certifications"}</div>
                    {cvData.certifications.map((c, i) => (
                      <div key={i} style={{ background:t.inputBg, borderRadius:10, padding:"10px", marginBottom:8, border:`1px solid ${t.border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif" }}>🏅 {lang==="ar" ? `شهادة ${i+1}` : `Certificate ${i+1}`}</div>
                          {cvData.certifications.length > 1 && <button onClick={() => cvRemoveCert(i)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:t.subText }}>✕</button>}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                          {[
                            { f:"name", ar:"اسم الشهادة", en:"Certificate Name", ph: lang==="ar" ? "شهادة إدارة المشاريع" : "Project Management Certificate", full:true },
                            { f:"issuer", ar:"الجهة المانحة", en:"Issuing Body", ph: lang==="ar" ? "أكاديمية معتمدة" : "Accredited Academy" },
                            { f:"year", ar:"السنة", en:"Year", ph:"2026" },
                          ].map(f => (
                            <div key={f.f} style={{ display:"flex", flexDirection:"column", gap:3, gridColumn: f.full ? "1/-1" : "auto" }}>
                              <label style={{ ...labelStyle, fontSize:10 }}>{lang==="ar" ? f.ar : f.en}</label>
                              <input style={{ ...inputStyle, fontSize:12 }} value={c[f.f]} placeholder={f.ph} onChange={e => cvUpdateCert(i, f.f, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button style={addBtnStyle} onClick={cvAddCert}>+ {lang==="ar" ? "أضف شهادة" : "Add certification"}</button>
                  </div>

                  {/* Languages */}
                  <div style={cardStyle}>
                    <div style={secHeadStyle}>🌐 {lang==="ar" ? "اللغات" : "Languages"}</div>
                    {cvData.languages.map((l, i) => (
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, marginBottom:8, alignItems:"end" }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                          <label style={{ ...labelStyle, fontSize:10 }}>{lang==="ar" ? "اللغة" : "Language"}</label>
                          <input style={{ ...inputStyle, fontSize:12 }} value={l.lang} placeholder={lang==="ar" ? "العربية" : "Arabic"} onChange={e => cvUpdateLang(i, "lang", e.target.value)} />
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                          <label style={{ ...labelStyle, fontSize:10 }}>{lang==="ar" ? "المستوى" : "Level"}</label>
                          <select style={{ ...inputStyle, fontSize:12 }} value={l.level} onChange={e => cvUpdateLang(i, "level", e.target.value)}>
                            {(lang==="ar" ? ["مبتدئ","متوسط","جيد","جيد جداً","ممتاز","اللغة الأم"] : ["Beginner","Intermediate","Good","Very Good","Excellent","Native"]).map(lv => (
                              <option key={lv} value={lv}>{lv}</option>
                            ))}
                          </select>
                        </div>
                        {cvData.languages.length > 1 && <button onClick={() => cvRemoveLang(i)} style={{ background:"#e53e3e18", border:"1px solid #e53e3e30", borderRadius:8, padding:"8px 10px", cursor:"pointer", fontSize:13, color:"#e53e3e" }}>✕</button>}
                      </div>
                    ))}
                    <button style={addBtnStyle} onClick={cvAddLang}>+ {lang==="ar" ? "أضف لغة" : "Add language"}</button>
                  </div>

                </div>
              )}

              {/* ═══ STEP 4: EXPORT ══════════════════════════ */}
              {cvStep === 4 && (
                <div>
                  {isGuestUser && (
                    <div style={{ ...cardStyle, border:"1px solid rgba(220,38,38,0.45)", background:"linear-gradient(135deg, rgba(254,226,226,0.9), rgba(254,242,242,0.95))", boxShadow:"0 0 18px rgba(220,38,38,0.28)" }}>
                      <div style={{ fontSize:14, fontWeight:900, color:"#b91c1c", fontFamily:"'Cairo',sans-serif", marginBottom:8, textShadow:"0 0 8px rgba(220,38,38,0.25)" }}>
                        {lang === "ar" ? "تنبيه قبل التصدير" : "Notice Before Export"}
                      </div>
                      <div style={{ fontSize:12, color:"#7f1d1d", lineHeight:1.9, fontFamily:"'Cairo',sans-serif", marginBottom:10 }}>
                        {lang === "ar"
                          ? "بياناتك محفوظة في هذه الصفحة كما هي. لإكمال حفظ الطلب وإرسال الإيميل وتفعيل التصدير، سجّل الدخول أو أنشئ حسابًا الآن."
                          : "Your entered data stays on this page as-is. To complete request saving, email dispatch, and export enablement, sign in or create an account now."}
                      </div>
                      <button
                        onClick={promptCvBuilderGuestAuth}
                        style={{ width:"100%", border:"none", borderRadius:12, padding:"11px 12px", background:"linear-gradient(135deg,#dc2626,#b91c1c)", color:"#fff", fontSize:13, fontWeight:900, cursor:"pointer", fontFamily:"'Cairo',sans-serif", boxShadow:"0 0 14px rgba(220,38,38,0.42)" }}
                      >
                        {lang === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Create Account"}
                      </button>
                    </div>
                  )}

                  {/* Summary card */}
                  <div style={{ ...cardStyle, border:`1px solid ${t.gold}44`, background:`${t.gold}08` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:10 }}>
                      ✅ {lang==="ar" ? "ملخص البيانات المُدخلة" : "Data Summary"}
                    </div>
                    {[
                      { label: lang==="ar" ? "الاسم" : "Name", val: cvData.fullName || "—" },
                      { label: lang==="ar" ? "المسمى" : "Title", val: cvData.jobTitle || "—" },
                      { label: lang==="ar" ? "الخبرات" : "Experiences", val: `${cvData.experiences.length} ${lang==="ar" ? "خبرة" : "entries"}` },
                      { label: lang==="ar" ? "المهارات" : "Skills", val: `${cvData.coreCompetencies.length} ${lang==="ar" ? "مهارة" : "skills"}` },
                      { label: lang==="ar" ? "الأدوات" : "Tools", val: `${cvData.toolsSoftware.length} ${lang==="ar" ? "أداة" : "tools"}` },
                      { label: lang==="ar" ? "الشهادات" : "Certifications", val: `${cvData.certifications.filter(c=>c.name).length} ${lang==="ar" ? "شهادة" : "certs"}` },
                    ].map((r, i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${t.border}` }}>
                        <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:t.text, fontFamily:"'Cairo',sans-serif" }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ ...cardStyle, border:`1px solid ${t.border}`, background:t.cardBg }}>
                    <div style={{ fontSize:13, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:8 }}>
                      {lang==="ar" ? "بيان الطلب" : "Request Statement"}
                    </div>
                    <div style={{ display:"grid", gap:6 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"5px 0", borderBottom:`1px solid ${t.border}` }}>
                        <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{lang==="ar" ? "رقم الطلب" : "Order Number"}</span>
                        <span style={{ fontSize:12, fontWeight:900, color:t.text, fontFamily:"'Cairo',sans-serif" }}>{selectedCvBuilderOrder?.orderNumber || "—"}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"5px 0", borderBottom:`1px solid ${t.border}` }}>
                        <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{lang==="ar" ? "السيريال" : "Serial"}</span>
                        <span style={{ fontSize:12, fontWeight:900, color:t.text, fontFamily:"'Cairo',sans-serif" }}>{selectedCvBuilderOrder?.serial || "—"}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"5px 0" }}>
                        <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{lang==="ar" ? "حالة الحفظ" : "Save Status"}</span>
                        <span style={{ fontSize:12, fontWeight:900, color:cvBuilderOrderSyncBusy ? t.gold : (selectedCvBuilderOrder?.firebaseId ? "#16a34a" : "#dc2626"), fontFamily:"'Cairo',sans-serif" }}>
                          {cvBuilderOrderSyncBusy
                            ? (lang==="ar" ? "جاري الحفظ..." : "Saving...")
                            : selectedCvBuilderOrder?.firebaseId
                              ? (lang==="ar" ? "تم الحفظ على Firebase" : "Saved to Firebase")
                              : (lang==="ar" ? "غير محفوظ بعد" : "Not saved yet")}
                        </span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"5px 0", borderTop:`1px solid ${t.border}` }}>
                        <span style={{ fontSize:12, color:t.subText, fontFamily:"'Cairo',sans-serif" }}>{lang==="ar" ? "حالة الإيميل" : "Email Status"}</span>
                        <span style={{ fontSize:12, fontWeight:900, color:selectedCvBuilderOrder?.emailDeliveryStatus === "sent" ? "#16a34a" : selectedCvBuilderOrder?.emailDeliveryStatus === "failed" ? "#dc2626" : t.gold, fontFamily:"'Cairo',sans-serif" }}>
                          {getCvBuilderEmailStatusLabel(selectedCvBuilderOrder?.emailDeliveryStatus)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gap:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:10 }}>
                    <button onClick={() => openCvExportLangModal("pdf")} disabled={cvPdfExporting} style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#fff1f2,#f8fafc)", border:"1px solid #fda4af", cursor:cvPdfExporting ? "wait" : "pointer", opacity:cvPdfExporting ? 0.75 : 1, minHeight:96, padding:"10px" }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>📄</div>
                      <div style={{ fontSize:13, fontWeight:900, color:"#e11d48", fontFamily:"'Cairo',sans-serif", marginBottom:3 }}>
                        {cvPdfExporting ? (lang==="ar" ? "جاري تجهيز ملف PDF..." : "Preparing PDF file...") : (lang==="ar" ? "تصدير ملف PDF" : "Export PDF File")}
                      </div>
                      <div style={{ fontSize:10, color:t.subText, lineHeight:1.5, fontFamily:"'Cairo',sans-serif" }}>
                        {lang==="ar" ? "حمّل سيرة ذاتية جاهزة بصيغة PDF مباشرة من البيانات التي سجلتها." : "Export a ready PDF resume directly from your entered data."}
                      </div>
                    </button>

                    <button onClick={() => openCvExportLangModal("word")} style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#eff6ff,#f8fafc)", border:"1px solid #93c5fd", cursor:"pointer", minHeight:96, padding:"10px" }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>📝</div>
                      <div style={{ fontSize:13, fontWeight:900, color:"#2563eb", fontFamily:"'Cairo',sans-serif", marginBottom:3 }}>
                        {lang==="ar" ? "تصدير ملف Word" : "Export Word File"}
                      </div>
                      <div style={{ fontSize:10, color:t.subText, lineHeight:1.5, fontFamily:"'Cairo',sans-serif" }}>
                        {lang==="ar" ? "حمّل نفس البيانات بصيغة Word لتعديلها أو إرسالها بسهولة." : "Export the same information as a Word file for easy editing."}
                      </div>
                    </button>
                    </div>

                    <button onClick={openCvServiceEmailConfirm} style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#fff8e6,#fffdf7)", border:`1px solid ${t.gold}66`, cursor:"pointer", boxShadow:`0 10px 26px ${t.gold}18` }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>📨</div>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:6 }}>
                        {lang==="ar" ? "أرسل بياناتك وسنقوم بإعداد سيرة ذاتية جاهزة لك" : "Send your data and we will prepare a ready CV for you"}
                      </div>
                      <div style={{ fontSize:12, color:"#b45309", fontWeight:800, marginBottom:8, fontFamily:"'Cairo',sans-serif" }}>
                        {lang==="ar" ? "ملف واحد PDF أو Word بسعر 5 دولار فقط لفترة محدودة" : "One PDF or Word file for only $5 for a limited time"}
                      </div>
                      <div style={{ fontSize:11, color:t.subText, lineHeight:1.8, fontFamily:"'Cairo',sans-serif" }}>
                        {lang==="ar" ? "بعد الضغط سنراجع بلدك ورقم الموبايل ورقم الواتساب، ثم نفتح الإيميل لإرسال جميع بيانات السيرة الذاتية إلى بريدنا." : "We will confirm your country, mobile, and WhatsApp, then open email with all CV data addressed to us."}
                      </div>
                    </button>

                    <div style={{ ...cardStyle, marginBottom:0, textAlign:"center", background:"linear-gradient(135deg,#ffffff,#f8fafc)", border:`1px solid ${t.border}` }}>
                      <div style={{ fontSize:34, marginBottom:8 }}>⭐</div>
                      <div style={{ fontSize:15, fontWeight:900, color:t.gold, fontFamily:"'Cairo',sans-serif", marginBottom:8 }}>
                        {lang==="ar" ? "قيّم خدمة السيرة الذاتية" : "Rate the CV service"}
                      </div>
                      <div style={{ fontSize:11, color:t.subText, lineHeight:1.8, fontFamily:"'Cairo',sans-serif", marginBottom:14 }}>
                        {lang==="ar"
                          ? "شاركنا تقييمك لتجربة إعداد السيرة الذاتية. سيتم حفظه في التطبيق ليستفيد منه باقي المستخدمين."
                          : "Share your experience with the CV service. Your rating will be saved for other users to benefit from."}
                      </div>
                      <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:14 }} onMouseLeave={() => setCvBuilderHoverRating(0)}>
                        {[1,2,3,4,5].map((star) => {
                          const active = (cvBuilderHoverRating || cvBuilderRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setCvBuilderHoverRating(star)}
                              onClick={() => {
                                if (cvBuilderReviewLocked) return;
                                setCvBuilderRating(star);
                                if (cvBuilderReviewError) setCvBuilderReviewError("");
                              }}
                              style={{ background:"none", border:"none", cursor:cvBuilderReviewLocked ? "not-allowed" : "pointer", fontSize:28, color: active ? "#f59e0b" : t.border, padding:0, opacity:cvBuilderReviewLocked ? 0.75 : 1 }}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        style={{ width:"100%", minHeight:96, borderRadius:14, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, padding:"12px 14px", resize:"vertical", fontFamily:"'Cairo',sans-serif", fontSize:12, boxSizing:"border-box", marginBottom:10 }}
                        value={cvBuilderReviewText}
                        placeholder={lang==="ar" ? "اكتب تعليقك أو تجربتك مع الخدمة..." : "Write your feedback or experience..."}
                        readOnly={cvBuilderReviewLocked}
                        onChange={(e) => setCvBuilderReviewText(e.target.value)}
                      />
                      {cvBuilderReviewLocked && (
                        <div style={{ fontSize:11, color:t.subText, lineHeight:1.8, marginBottom:10, fontFamily:"'Cairo',sans-serif" }}>
                          {lang==="ar"
                            ? `يمكن تعديل التقييم بعد مرور 30 يوم من عمل السيرة الذاتية. المتبقي ${cvBuilderReviewDaysRemaining} يوم.`
                            : `You can edit this review 30 days after creating the CV. ${cvBuilderReviewDaysRemaining} day(s) remaining.`}
                        </div>
                      )}
                      {!!cvBuilderReviewError && (
                        <div style={{ fontSize:11, color:"#dc2626", fontWeight:800, marginBottom:10, fontFamily:"'Cairo',sans-serif" }}>
                          {cvBuilderReviewError}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:10 }}>
                        <button
                          onClick={() => {
                            if (!cvBuilderReviewSaved) {
                              setSelectedCvBuilderOrder(null);
                              setCvBuilderScreen("previousOrders");
                              return;
                            }
                            if (cvBuilderReviewLocked) {
                              setCvBuilderReviewError(
                                lang==="ar"
                                  ? `يمكن تعديل التقييم بعد مرور 30 يوم من عمل السيرة الذاتية. المتبقي ${cvBuilderReviewDaysRemaining} يوم.`
                                  : `You can edit the review 30 days after creating the CV. ${cvBuilderReviewDaysRemaining} day(s) remaining.`
                              );
                              return;
                            }
                            setCvBuilderReviewEditMode(true);
                            setCvBuilderReviewError("");
                          }}
                          style={{ flex:1, padding:"12px", borderRadius:14, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}
                        >
                          {!cvBuilderReviewSaved
                            ? (lang==="ar" ? "الطلبات السابقة" : "Previous Requests")
                            : (lang==="ar" ? "تعديل التقييم" : "Edit Review")}
                        </button>
                        <button
                          onClick={submitCvBuilderReview}
                          style={{ flex:1, padding:"12px", borderRadius:14, border:"none", background:`linear-gradient(135deg,${t.gold},#b8860b)`, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif", opacity:cvBuilderReviewSubmitting ? 0.75 : 1 }}
                        >
                          {cvBuilderReviewSubmitting
                            ? (lang==="ar" ? "جارٍ الحفظ..." : "Saving...")
                            : (lang==="ar" ? "حفظ التقييم" : "Save Review")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Nav Buttons ───────────────────────────────── */}
              <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"space-between" }}>
                {cvStep > 0 ? (
                  <button onClick={() => { setCvStepValidationError(""); setCvStep(s => s - 1); }} style={{ padding:"11px 22px", borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>
                    {lang==="ar" ? "→ السابق" : "← Back"}
                  </button>
                ) : <div />}
                {cvStep < 4 && (
                  <button onClick={() => { void handleCvStepChange(cvStep + 1); }} style={{ padding:"11px 28px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${t.gold},#b8860b)`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", boxShadow:`0 4px 14px ${t.gold}44`, flex:1 }}>
                    {lang==="ar" ? `التالي: ${cvSteps[cvStep+1]} ←` : `Next: ${cvSteps[cvStep+1]} →`}
                  </button>
                )}
              </div>
              <div style={{ display:"flex", justifyContent:"center", marginTop:12 }}>
                <button
                  onClick={cancelCurrentCvBuilderRequest}
                  style={{ maxWidth:260, width:"100%", padding:"11px 18px", borderRadius:12, border:"1px solid #dc262655", background:"linear-gradient(135deg,#fff8e6,#fff1f2)", color:"#dc2626", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif", boxShadow:"0 8px 22px rgba(220,38,38,0.08)" }}
                >
                  {lang==="ar" ? "إلغاء الطلب الحالي" : "Cancel Current Request"}
                </button>
              </div>
                </>
                )
              ) : (
                <div style={{ marginTop:16 }}>
                  {selectedCvService && (
                    <>
                      {cvPaidScreen === "list" && (
                        <div style={{ ...cardStyle, border:`1px solid ${selectedCvService.price === 20 ? "#c8960c44" : "#7c3aed44"}`, background:selectedCvService.price === 20 ? "rgba(200,150,12,0.08)" : "rgba(124,58,237,0.08)" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                            <div style={{ fontSize:14, fontWeight:800, color:selectedCvService.price === 20 ? "#c8960c" : "#7c3aed", fontFamily:"'Cairo',sans-serif" }}>
                              {selectedCvPackageIntro?.title}
                            </div>
                            <div style={{ fontSize:11, fontWeight:800, color:"#e53e3e", background:"#fee2e2", borderRadius:999, padding:"3px 9px" }}>
                              {lang==="ar" ? "خصم 50٪" : "50% OFF"}
                            </div>
                          </div>
                          <div style={{ fontSize:12, color:t.text, lineHeight:1.9, fontFamily:"'Cairo',sans-serif", marginBottom:12 }}>
                            {selectedCvPackageIntro?.body}
                          </div>
                          <div style={{ display:"grid", gap:8 }}>
                            {selectedCvService.features.map((feature, idx) => (
                              <div key={idx} style={{ fontSize:11, color:t.text, fontFamily:"'Cairo',sans-serif" }}>
                                ✓ {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <React.Suspense fallback={null}>
                      <PaidFlowErrorBoundary lang={lang} resetKey={`cv-${selectedCvService.key}-${cvPaidBackRequest}`}>
                        <PaidServicesFlow
                          key={selectedCvService.key}
                          services={[selectedCvService]}
                          lang={lang}
                          dark={dark}
                          selectedCountry={"المملكة العربية السعودية"}
                          selectedCity={cvData.location || (lang==="ar" ? "الرياض" : "Riyadh")}
                          selectedNationality={selectedNationality}
                          isAdminUser={isAdminUser}
                          canManageServiceReviews={canManageOrderReviews}
                          storageKey={`cvPaidOrders-${selectedCvService.key}`}
                          countryOverride="المملكة العربية السعودية"
                          onScreenChange={setCvPaidScreen}
                          backRequestToken={cvPaidBackRequest}
                          isGuestUser={isGuestUser}
                        />
                      </PaidFlowErrorBoundary>
                      </React.Suspense>
                      <div style={{ display:"flex", justifyContent:"center", marginTop:14 }}>
                        <button
                          onClick={() => { setCvMode(null); setSelectedCvPackage(null); setCvBuilderScreen("menu"); setSelectedCvBuilderOrder(null); setCvStep(0); setCvUnlocked(false); }}
                          style={{
                            display:"inline-flex",
                            alignItems:"center",
                            justifyContent:"center",
                            gap:7,
                            padding:"9px 16px",
                            borderRadius:999,
                            border:`1px solid ${t.border}`,
                            background:t.cardBg,
                            color:t.gold,
                            fontSize:12,
                            fontWeight:800,
                            cursor:"pointer",
                            fontFamily:"'Cairo',sans-serif",
                            boxShadow: dark ? "none" : "0 8px 18px rgba(15,23,42,0.06)",
                            whiteSpace:"nowrap",
                          }}
                        >
                          <span style={{ fontSize:15 }}>{lang==="ar" ? "›" : "‹"}</span>
                          <span>{lang==="ar" ? "العودة إلى السيرة الذاتية" : "Back to CV"}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          );
        })()}

        {/* ══ SETTINGS TAB ══════════════════════════════════════════════════ */}
        {mainTab === "settings" && (
          <div style={{ padding: "20px 0" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: t.text, fontFamily: "'Cairo',sans-serif", marginBottom: 20 }}>⚙️ {tx.settingsTitle}</h2>

            {/* Language */}
            <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, marginBottom: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.subText, fontFamily: "'Cairo',sans-serif", marginBottom: 10, textAlign: dir === "rtl" ? "right" : "left" }}>🌐 {tx.settingsLang}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["ar", "en"].map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 14, border: `2px solid ${lang === l ? "#16a34a" : t.border}`, background: lang === l ? "rgba(22,163,74,0.12)" : t.inputBg, color: lang === l ? "#15803d" : t.text, boxShadow: lang === l ? "0 0 14px rgba(22,163,74,0.16)" : "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Cairo',sans-serif", transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>
                    {l === "ar" ? tx.settingsLangAr : tx.settingsLangEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, marginBottom: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.subText, fontFamily: "'Cairo',sans-serif", marginBottom: 10, textAlign: dir === "rtl" ? "right" : "left" }}>🎨 {tx.settingsTheme}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[false, true].map(isDark => (
                  <button key={String(isDark)} onClick={() => setDark(isDark)}
                    style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 14, border: `2px solid ${dark === isDark ? "#16a34a" : t.border}`, background: dark === isDark ? "rgba(22,163,74,0.12)" : t.inputBg, color: dark === isDark ? "#15803d" : t.text, boxShadow: dark === isDark ? "0 0 14px rgba(22,163,74,0.16)" : "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Cairo',sans-serif", transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>
                    {isDark ? `🌙 ${tx.settingsThemeDark}` : `☀️ ${tx.settingsThemeLight}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings items */}
            <div style={{ display: "grid", gridTemplateColumns: isCompactPhone ? "1fr 1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[
                { icon: "🔄", label: tx.settingsUpdate, desc: tx.settingsUpdateDesc, href: PLAY_STORE_URL },
                { icon: "⭐", label: tx.settingsRate, desc: tx.settingsRateDesc, href: PLAY_STORE_URL },
                { icon: "📧", label: tx.settingsSupport, desc: tx.settingsSupportDesc, href: "mailto:walidghazal46@gmail.com?subject=دعم فني - تطبيق مكاتب السفريات الموثوقة" },
                { icon: "🔒", label: tx.settingsPrivacy, desc: tx.settingsPrivacyDesc, href: "/privacy-policy.html" },
              ].map((item, i) => {
                const inner = (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 3 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, flexShrink: 0, background: t.inputBg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{item.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: t.text, fontFamily: "'Cairo',sans-serif", lineHeight: 1.25 }}>{item.label}</div>
                    <div style={{ fontSize: 9, color: t.subText, fontFamily: "'Cairo',sans-serif", lineHeight: 1.25 }}>{item.desc}</div>
                  </div>
                );
                const cs = { display: "block", textDecoration: "none", padding: "5px 4px", borderRadius: 12, background: t.cardBg, border: `1px solid ${t.border}`, cursor: "pointer", width: "100%", textAlign: "center", minHeight: 38 };
                if (item.href) return <a key={i} href={item.href} target="_blank" rel="noreferrer" style={cs}>{inner}</a>;
                return <button key={i} onClick={item.action} style={cs}>{inner}</button>;
              })}
            </div>

            {/* ── سوشيال ميديا ── */}
            <div style={{ ...styles.sectionCard, background: t.cardBg, border: `1px solid ${t.border}`, marginBottom: 10, padding: "13px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Cairo',sans-serif", marginBottom: 2 }}>
                📱 {lang === "ar" ? "تابعنا على" : "Follow Us"}
              </div>
              <div style={{ fontSize: 11, color: t.subText, fontFamily: "'Cairo',sans-serif", marginBottom: 12 }}>
                {lang === "ar" ? "تواصل معنا عبر منصات التواصل الاجتماعي" : "Connect with us on social media"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <a href={YOUTUBE} target="_blank" rel="noreferrer"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 5px", borderRadius: 14, background: "#fff0f0", border: "1px solid #ffcccc", textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#ff0000", fontFamily: "sans-serif" }}>YouTube</span>
                </a>
                <a href={LINKEDIN} target="_blank" rel="noreferrer"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 5px", borderRadius: 14, background: "#e8f4fd", border: "1px solid #b3d9f5", textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#0077b6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0077b6", fontFamily: "sans-serif" }}>LinkedIn</span>
                </a>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 5px", borderRadius: 14, background: "#e8faf0", border: "1px solid #b3e6c8", textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#25d366", fontFamily: "sans-serif" }}>WhatsApp</span>
                </a>
              </div>
            </div>

            {!!authPreviewUser ? (
              /* ── مسجّل: الثلاثة في صف واحد ── */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => setUsageGuideOpen(true)}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 16,
                    border: "1px solid rgba(212,175,55,0.38)",
                    background: dark ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.10)",
                    color: dark ? "#f5d77b" : "#7c5100",
                    fontSize: 12,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 16 }}>📖</span>
                  {lang === "ar" ? "شرح الاستخدام" : "How to use"}
                </button>
                <button
                  onClick={() => {
                    setAccountProfileError("");
                    setAccountProfileSuccess("");
                    setAccountDeleteConfirm(false);
                    setAccountPanelOpen(true);
                  }}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 16,
                    border: `1px solid ${t.border}`,
                    background: t.cardBg,
                    color: t.text,
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 16 }}>👤</span>
                  {lang === "ar" ? "الحساب" : "Account"}
                </button>
                <button
                  onClick={() => setSignOutConfirmOpen(true)}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 16,
                    border: "1px solid rgba(248,113,113,0.52)",
                    background: dark ? "linear-gradient(135deg, rgba(127,29,29,0.30), rgba(185,28,28,0.24))" : "linear-gradient(135deg, rgba(254,226,226,0.96), rgba(254,202,202,0.96))",
                    color: dark ? "#fecaca" : "#991b1b",
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    boxShadow: "0 0 12px rgba(239,68,68,0.20)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🚪</span>
                  {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
                </button>
              </div>
            ) : (
              /* ── غير مسجّل: زر شرح فقط ── */
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => setUsageGuideOpen(true)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(212,175,55,0.38)",
                    background: dark ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.10)",
                    color: dark ? "#f5d77b" : "#7c5100",
                    fontSize: 13,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>📖</span>
                  {lang === "ar" ? "شرح الاستخدام" : "How to use"}
                </button>
              </div>
            )}

            {!authPreviewUser && isGuestUser && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 12 }}>
                <button
                  onClick={() => {
                    setGuestMode(false);
                    setAuthPreviewMode("login");
                    setAuthPreviewOpen(true);
                    setAuthPreviewError("");
                    setAuthPreviewSuccess("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(212,175,55,0.46)",
                    background: "linear-gradient(135deg, rgba(231,197,91,0.24), rgba(201,154,35,0.20))",
                    color: dark ? "#fde68a" : "#7c5100",
                    fontSize: 13,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {lang === "ar" ? "تسجيل الدخول بحساب" : "Sign In With Account"}
                </button>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 16, color: t.subText, fontSize: 11, fontFamily: "'Cairo',sans-serif" }}>v1.0.0.26 — مكاتب السفريات الموثوقة</div>

            {/* ── إشعار هام ── */}
            <div style={{ marginTop: 16, borderRadius: 14, border: `1px solid ${t.gold}30`, background: dark ? `${t.gold}08` : `${t.gold}0a`, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.gold, marginBottom: 6, fontFamily: "'Cairo',sans-serif" }}>⚠️ {tx.discTitle}</div>
              <div style={{ fontSize: 12, color: t.text, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif", marginBottom: 4 }}>{tx.discBody}</div>
              <div style={{ fontSize: 10, color: t.subText, fontFamily: "sans-serif", lineHeight: 1.6 }}>{tx.discEn}</div>
            </div>

            {isAdminUser && (
              <button
                onClick={openAdminSecurityModal}
                style={{
                  width: "100%",
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "12px 18px",
                  borderRadius: 18,
                  border: "1.5px solid rgba(74,222,128,0.7)",
                  background: dark ? "rgba(6,78,59,0.22)" : "rgba(240,253,244,0.96)",
                  color: dark ? "#bbf7d0" : "#166534",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                  boxShadow: dark
                    ? "0 0 0 4px rgba(74,222,128,0.12), 0 0 18px rgba(74,222,128,0.18)"
                    : "0 0 0 4px rgba(34,197,94,0.12), 0 10px 22px rgba(34,197,94,0.14)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(74,222,128,0.18)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}>
                  👑
                </span>
                <span>{lang === "ar" ? "حساب الأدمن" : "Admin Account"}</span>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 8px #4ade80",
                  animation: "goldPulse 1.8s ease-in-out infinite",
                }} />
              </button>
            )}
          </div>
        )}

      </main>

      {/* ── WHATSAPP FLOAT BTN — home tab + home view only ───────────── */}
      {mainTab === "home" && view === "home" && (
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
          className="wa-float-btn"
          style={{
            ...styles.waBtn,
            background: "linear-gradient(145deg, #25d366, #128c7e)",
            boxShadow: "0 8px 28px rgba(37,211,102,0.5), 0 0 0 1px rgba(37,211,102,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}

      {/* ── FLOATING BACK BTN — web only, all pages ───────────────────── */}
      {!isNativePlatform && (
        <button
          onClick={handleAppBackNavigation}
          title={lang === "ar" ? "رجوع" : "Back"}
          className="floating-back-btn"
          style={{
            position: "fixed",
            bottom: 88,
            left: 20,
            right: "auto",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: dark ? "rgba(30,42,60,0.92)" : "rgba(255,255,255,0.92)",
            border: `1.5px solid ${t.border}`,
            color: t.gold,
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            zIndex: 199,
            cursor: "pointer",
            fontFamily: "'Cairo',sans-serif",
            lineHeight: 1,
          }}
        >
          {lang === "ar" ? "›" : "‹"}
        </button>
      )}

      {nationalityConfirmToast && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9997, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
          <div style={{
            width: "100%", maxWidth: 340, borderRadius: 24, padding: "20px 22px",
            background: dark ? "linear-gradient(135deg,rgba(20,83,45,0.97),rgba(21,128,61,0.97))" : "linear-gradient(135deg,#ecfdf5,#dcfce7)",
            border: dark ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(22,163,74,0.3)",
            boxShadow: dark ? "0 0 28px rgba(34,197,94,0.28), 0 18px 42px rgba(0,0,0,0.3)" : "0 0 22px rgba(34,197,94,0.2), 0 18px 42px rgba(0,0,0,0.14)",
            textAlign: "center", fontFamily: "'Cairo',sans-serif",
            animation: "fadeSlideUp 0.22s ease-out both",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: dark ? "#86efac" : "#15803d", marginBottom: 4 }}>
              {lang === "ar" ? "تم تأكيد الجنسية" : "Nationality Confirmed"}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: dark ? "#bbf7d0" : "#166534" }}>
              {nationalityConfirmToast}
            </div>
          </div>
        </div>
      )}

      {providerPortalGuestNotice && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9996,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          pointerEvents: "none",
        }}>
          <div style={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 22,
            padding: "16px 18px",
            background: dark ? "linear-gradient(180deg, rgba(127,29,29,0.96) 0%, rgba(69,10,10,0.96) 100%)" : "linear-gradient(180deg, rgba(254,226,226,0.98) 0%, rgba(254,202,202,0.98) 100%)",
            border: dark ? "1px solid rgba(248,113,113,0.45)" : "1px solid rgba(220,38,38,0.26)",
            boxShadow: dark ? "0 0 0 1px rgba(248,113,113,0.12), 0 0 24px rgba(239,68,68,0.22), 0 18px 42px rgba(0,0,0,0.26)" : "0 0 0 1px rgba(220,38,38,0.06), 0 0 22px rgba(239,68,68,0.14), 0 18px 42px rgba(0,0,0,0.16)",
            textAlign: "center",
            fontFamily: "'Cairo',sans-serif",
            animation: "fadeSlideUp 0.2s ease-out both",
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: dark ? "#fca5a5" : "#b91c1c", marginBottom: 6 }}>
              {lang === "ar" ? "تنبيه" : "Notice"}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.9, color: dark ? "#fee2e2" : "#7f1d1d", fontWeight: 800 }}>
              {providerPortalGuestNotice}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAVIGATION BAR ────────────────────────────────────────── */}
      <nav
        className="premium-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: dark
            ? "rgba(4,10,22,0.92)"
            : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          borderTop: `1px solid ${dark ? "rgba(130,160,220,0.1)" : "rgba(30,64,175,0.07)"}`,
          display: "flex",
          alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          boxShadow: dark
            ? "0 -4px 24px rgba(0,0,0,0.35)"
            : "0 -4px 24px rgba(15,27,58,0.08)",
        }}
      >
        {[
          { key: "home",     icon: "🏠", label: tx.navHome     },
          { key: "cv",       icon: "📄", label: tx.navCV       },
          { key: "settings", icon: "⚙️", label: tx.navSettings },
        ].map(tab => {
          const active = mainTab === tab.key;
          return (
            <button
              key={tab.key}
              className="nav-tab-item"
              onClick={() => {
                if (tab.key === "home") {
                  goToCountryLanding();
                } else if (tab.key === "cv") {
                  setMainTab("cv");
                  setCvMode(null);
                  setSelectedCvPackage(null);
                  setCvBuilderScreen("menu");
                  setSelectedCvBuilderOrder(null);
                  setCvStep(0);
                  setCvUnlocked(false);
                } else {
                  setMainTab(tab.key);
                }
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "10px 4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Cairo',sans-serif",
                position: "relative",
              }}
            >
              {/* Active top indicator pill */}
              {active && (
                <div
                  className="nav-active-indicator"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "56%",
                    height: 3,
                    borderRadius: "0 0 6px 6px",
                    background: `linear-gradient(90deg, ${t.gold}, ${dark ? "#f0c040" : "#c8960a"})`,
                    boxShadow: `0 0 10px ${t.gold}80`,
                  }}
                />
              )}
              {/* Active background pill */}
              {active && (
                <div style={{
                  position: "absolute",
                  inset: "4px 8px",
                  borderRadius: 12,
                  background: dark
                    ? "rgba(212,175,55,0.08)"
                    : "rgba(184,134,11,0.06)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Icon with glow when active */}
              <span style={{
                fontSize: 22,
                lineHeight: 1,
                opacity: active ? 1 : 0.45,
                filter: active
                  ? `drop-shadow(0 0 8px ${t.gold}80)`
                  : "none",
                transition: "filter 0.25s ease, opacity 0.25s ease",
                position: "relative",
                zIndex: 1,
              }}>
                {tab.icon}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 800 : 500,
                color: active ? t.gold : t.subText,
                transition: "color 0.25s ease, font-weight 0.25s ease",
                letterSpacing: active ? 0.2 : 0,
                position: "relative",
                zIndex: 1,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Cairo', sans-serif !important; -webkit-tap-highlight-color: transparent; }

        /* ── Desktop Layout ── */
        @media (min-width: 1024px) {
          .app-root { padding-right: 240px !important; }
          .premium-nav { display: none !important; }
          .wa-btn-desktop { bottom: 24px !important; }
        }

        /* ── Core Animations ── 
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes goldPulse {
          0%,100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55,0.5); }
          50%      { opacity: 0.5; transform: scale(0.7); box-shadow: 0 0 0 0 transparent; }
        }
        @keyframes waPulseRing {
          0%  { transform: scale(1);    opacity: 0.65; }
          70% { transform: scale(1.6);  opacity: 0;   }
          100%{ transform: scale(1.6);  opacity: 0;   }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 10px rgba(212,175,55,0.35), 0 0 20px rgba(212,175,55,0.12); }
          50%      { box-shadow: 0 0 24px rgba(212,175,55,0.65), 0 0 48px rgba(212,175,55,0.25); }
        }
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(16px,-10px) scale(1.05); }
          66%      { transform: translate(-10px,12px) scale(0.97); }
        }
        @keyframes shimmerSweep {
          0%  { background-position: -400px 0; }
          100%{ background-position:  400px 0; }
        }
        @keyframes navIndicatorGlow {
          0%,100% { opacity: 0.9; width: 56%; }
          50%      { opacity: 1;   width: 68%; }
        }
        @keyframes headerLineGlow {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes particleFloat {
          0%,100%{ transform: translateY(0);    opacity: 0.4; }
          50%    { transform: translateY(-16px); opacity: 0.75; }
        }

        /* ── Smooth scrolling ── */
        html { scroll-behavior: smooth; }

        /* ── Tap states ── */
        button, a { -webkit-tap-highlight-color: transparent; }

        /* ── Select dropdown premium style ── */
        select { -webkit-appearance: none; appearance: none; }

        /* ── Focus ring override ── */
        button:focus-visible, a:focus-visible {
          outline: 2px solid rgba(212,175,55,0.7);
          outline-offset: 2px;
        }

        /* ── Premium tooltip glow ── */
        .tooltip-glow {
          position: relative;
        }
        .tooltip-glow::after {
          content: attr(data-tip);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(5,13,26,0.95);
          color: #e8edf5;
          font-size: 11px;
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          border: 1px solid rgba(212,175,55,0.25);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .tooltip-glow:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

const InfoRow = ({ label, value, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
    <span style={{ color: color || "#64748b", fontSize: 12 }}>{label}</span>
    <span style={{ color: "#1f2937", fontSize: 12, fontWeight: 600 }}>{value}</span>
  </div>
);

const themes = {
  dark: {
    bg: "#050d1a",
    headerBg: "rgba(5,13,26,0.82)",
    cardBg: "rgba(255,255,255,0.045)",
    cardGlass: "rgba(255,255,255,0.055)",
    inputBg: "rgba(255,255,255,0.07)",
    btnBg: "rgba(212,175,55,0.14)",
    navBg: "rgba(4,10,22,0.88)",
    text: "#e8edf5",
    subText: "rgba(232,237,245,0.5)",
    border: "rgba(130,160,220,0.14)",
    borderGold: "rgba(212,175,55,0.22)",
    gold: "#f0c040",
    goldDim: "#c8960a",
    primary: "#3b82f6",
    primaryDark: "#1d4ed8",
    emerald: "#10b981",
    purple: "#8b5cf6",
    danger: "#f87171",
    success: "#4ade80",
    warning: "#fb923c",
    shadowCard: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
    shadowGold: "0 0 24px rgba(212,175,55,0.25), 0 0 48px rgba(212,175,55,0.1)",
    glowBlue: "0 0 20px rgba(59,130,246,0.3)",
    headerGradient: "linear-gradient(180deg, rgba(5,13,26,0.95) 0%, rgba(7,20,40,0.9) 100%)",
    bgGradient: "linear-gradient(160deg, #050d1a 0%, #071428 50%, #050d1a 100%)",
    sectionGlow: "0 0 40px rgba(26,86,219,0.08), 0 0 80px rgba(124,58,237,0.06)",
  },
  light: {
    bg: "#f0f4ff",
    headerBg: "rgba(255,255,255,0.88)",
    cardBg: "#ffffff",
    cardGlass: "rgba(255,255,255,0.85)",
    inputBg: "#f4f7ff",
    btnBg: "rgba(212,175,55,0.1)",
    navBg: "rgba(255,255,255,0.92)",
    text: "#0f1b3a",
    subText: "#4a6080",
    border: "rgba(30,64,175,0.1)",
    borderGold: "rgba(184,134,11,0.25)",
    gold: "#c8960a",
    goldDim: "#a07808",
    primary: "#1a56db",
    primaryDark: "#1e40af",
    emerald: "#059669",
    purple: "#7c3aed",
    danger: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    shadowCard: "0 4px 24px rgba(15,27,58,0.08), 0 1px 4px rgba(15,27,58,0.05)",
    shadowGold: "0 0 20px rgba(184,134,11,0.2), 0 0 40px rgba(184,134,11,0.08)",
    glowBlue: "0 0 20px rgba(26,86,219,0.18)",
    headerGradient: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,255,0.92) 100%)",
    bgGradient: "linear-gradient(160deg, #eef2ff 0%, #f0f4ff 50%, #e8eeff 100%)",
    sectionGlow: "0 0 40px rgba(26,86,219,0.05), 0 0 80px rgba(124,58,237,0.03)",
  },
};

const styles = {
  root: {
    minHeight: "100vh",
    fontFamily: "'Cairo', sans-serif",
    position: "relative",
    overflowX: "hidden",
    transition: "background 0.35s ease",
  },
  bgPattern: {
    position: "fixed",
    inset: 0,
    backgroundImage: [
      "radial-gradient(ellipse at 15% 8%,  rgba(26,86,219,0.18)  0%, transparent 45%)",
      "radial-gradient(ellipse at 85% 85%, rgba(124,58,237,0.15) 0%, transparent 45%)",
      "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 55%)",
    ].join(", "),
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(20px) saturate(1.6)",
    WebkitBackdropFilter: "blur(20px) saturate(1.6)",
    transition: "background 0.3s ease",
  },
  headerInner: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "11px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    borderRadius: 12,
    padding: "6px 14px",
    fontSize: 20,
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    flexShrink: 0,
    transition: "transform 0.2s ease, opacity 0.2s ease",
  },
  langBtn: {
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    flexShrink: 0,
    letterSpacing: 0.5,
    transition: "all 0.2s ease",
  },
  themeBtn: {
    borderRadius: 20,
    padding: "5px 10px",
    fontSize: 16,
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    flexShrink: 0,
    transition: "transform 0.2s ease",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: "linear-gradient(145deg, #0a2060, #0f3080)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
    boxShadow: "0 4px 18px rgba(212,175,55,0.4), 0 0 0 1px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
    flexShrink: 0,
  },
  logoTitle: { fontSize: 14, fontWeight: 800, lineHeight: 1.2 },
  logoSub: { fontSize: 9, letterSpacing: 1.2, fontWeight: 500, opacity: 0.8 },
  countryBar: { display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", maxWidth: 700, margin: "0 auto" },
  countrySelect: { borderRadius: 12, padding: "6px 12px", fontSize: 13, fontFamily: "'Cairo', sans-serif", fontWeight: 600, cursor: "pointer", outline: "none", flex: 1 },
  main: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "0 14px 120px",
    position: "relative",
    zIndex: 1,
  },
  hero: { padding: "22px 16px 14px" },
  heroTag: {
    display: "inline-block",
    borderRadius: 999,
    padding: "5px 16px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  heroTitle: { fontSize: 28, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 },
  heroSub: { fontSize: 13, fontWeight: 500, lineHeight: 1.6 },
  govGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    padding: "10px 0 16px",
  },
  govCard: {
    borderRadius: 14,
    padding: "10px 6px",
    textAlign: "center",
    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
    outline: "none",
  },
  listHeader: {
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 60,
    zIndex: 50,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: "10px 16px",
    margin: "10px 0",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 14,
    fontFamily: "'Cairo', sans-serif",
    width: "100%",
    background: "transparent",
  },
  officeCard: {
    borderRadius: 20,
    padding: "18px",
    animation: "fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
  },
  sectionCard: {
    borderRadius: 18,
    padding: "16px",
  },
  waBtn: {
    position: "fixed",
    bottom: 82,
    left: 18,
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "linear-gradient(145deg, #25d366, #128c7e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 28px rgba(37,211,102,0.5), 0 0 0 1px rgba(37,211,102,0.2)",
    zIndex: 200,
    textDecoration: "none",
  },
  footer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "10px 20px",
    textAlign: "center",
    zIndex: 150,
    transition: "background 0.3s",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,11,24,0.78)",
    backdropFilter: "blur(8px) saturate(1.2)",
    WebkitBackdropFilter: "blur(8px) saturate(1.2)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    animation: "fadeIn 0.2s ease",
  },
  disclaimerBox: {
    borderRadius: 24,
    padding: "28px 24px",
    maxWidth: 360,
    width: "100%",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  modalBox: {
    borderRadius: 24,
    padding: "28px 24px",
    maxWidth: 320,
    width: "100%",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
};

