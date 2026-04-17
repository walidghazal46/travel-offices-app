import { EGYPT_BANKS_DATA, INTL_BANKS_DATA } from '../data/paymentData';
import { STATUS_STEPS_AR, STATUS_STEPS_EN, STATUS_STEP_KEYS } from '../data/orderStatus';

export function createInitialStageConfirmations() {
  return STATUS_STEP_KEYS.reduce((acc, key, index) => {
    acc[key] = index === 0;
    return acc;
  }, {});
}

export function hydratePaidOrder(order) {
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

export function getNextPendingStageIndex(order) {
  const safeOrder = hydratePaidOrder(order || {});
  return STATUS_STEP_KEYS.findIndex((key) => !safeOrder.stageConfirmations[key]);
}

export const MAX_RECEIPT_SIZE_BYTES = 2 * 1024 * 1024;
export const RECEIPT_UPLOAD_TIMEOUT_MS = 30000;
export const RECEIPT_UPLOAD_NOTICE_MS = 12000;
const EMAIL_REQUEST_TIMEOUT_MS = 12000;
const ADMIN_EMAIL = "walidghazal46@gmail.com";

export function withTimeout(promise, ms, label = "request") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export function normalizePaidService(service, isAr) {
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

export function isOtherSubServiceValue(value, isAr) {
  return value === (isAr ? "أخرى" : "Other");
}

export function generateOrderSerial() {
  const prefix = "WG";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function getLocalOrdersFromStorage(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

export function getRecentOrderCountWithinDays(orders, days) {
  const now = Date.now();
  const threshold = now - days * 24 * 60 * 60 * 1000;
  return (orders || []).filter((order) => {
    const createdAtValue = order?.createdAt || order?.date || "";
    const createdAtMs = new Date(createdAtValue).getTime();
    return Number.isFinite(createdAtMs) && createdAtMs >= threshold;
  }).length;
}

export function getRequestLimitMessage(windowDays, isAr = true) {
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

export function openOrderEmailDraft(orderData) {
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

async function postJsonWithTimeout(url, payload, timeoutMs = EMAIL_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(`email-request-timeout-${timeoutMs}ms`);
      timeoutError.code = "email-request-timeout";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendOrderEmailsViaFirebase(orderData) {
  const response = await postJsonWithTimeout(
    ORDER_EMAILS_FUNCTION_URL,
    {
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
    },
    EMAIL_REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `function-http-${response.status}`);
  }

  return response.json().catch(() => ({ ok: true }));
}

export async function sendOrderEmails(orderData) {
  try {
    return await sendOrderEmailsViaFirebase(orderData);
  } catch (error) {
    console.error("Order email delivery failed (background)", error);
    return {
      ok: false,
      fallback: "background-failed",
      errorCode: String(error?.code || error?.message || "email-send-failed"),
    };
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

