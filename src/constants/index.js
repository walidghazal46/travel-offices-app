// ─── App Constants ─────────────────────────────────────────────────────────

export const APP_NAME = 'مكاتب السفريات الموثوقة';
export const APP_VERSION = '1.0.0.7.26';

// Navigation views
export const VIEWS = {
  LANDING: 'landing',
  HOME: 'home',
  COUNTRY_LIST: 'country-list',
  OFFICE_DETAILS: 'office-details',
  CV_BUILDER: 'cv',
  SETTINGS: 'settings',
  ADMIN: 'admin',
};

// Main tabs
export const TABS = {
  HOME: 'home',
  CV: 'cv',
  SETTINGS: 'settings',
};

// Languages
export const LANG = {
  AR: 'ar',
  EN: 'en',
};

// Themes
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

// CV Package tiers
export const CV_PACKAGES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ELITE: 'elite',
};

// Rate limiting buckets (must match Cloud Function config)
export const RATE_LIMIT_BUCKETS = {
  COUNTRY_SERVICE: { maxRequests: 3, windowDays: 7 },
  CV_PAID: { maxRequests: 3, windowDays: 7 },
  CV_FREE: { maxRequests: 3, windowDays: 30 },
};

export const countryNamesEn = {
  "مصر": "Egypt",
  "المملكة العربية السعودية": "Saudi Arabia",
  "الإمارات العربية المتحدة": "UAE",
  "الأردن": "Jordan",
  "قطر": "Qatar",
  "الكويت": "Kuwait",
  "البحرين": "Bahrain",
  "العراق": "Iraq",
  "ليبيا": "Libya",
  "المغرب": "Morocco",
};

export const ACCOUNT_HOLDER_NAME = 'عبدالرحمن محمد';
export const INSTAPAY_HANDLE = 'abdurrahman@instapay';
export const PAYMENT_MOBILE = '0123456789';
