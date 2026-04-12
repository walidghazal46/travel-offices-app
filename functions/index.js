const {setGlobalOptions, logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {Resend} = require("resend");

initializeApp();
const firestoreDb = getFirestore();

setGlobalOptions({maxInstances: 10});

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const ADMIN_EMAIL = "walidghazal46@gmail.com";
const ADMIN_EMAILS = [
  "walidghazal46@gmail.com",
  "walidghazal51@yahoo.com",
];
const FROM_EMAIL = "noreply@mail.trustedoffices.org";
const COUNTRY_PAID_DEVICE_REQUEST_LIMIT = 3;
const COUNTRY_PAID_DEVICE_REQUEST_WINDOW_DAYS = 7;
const CV_PAID_DEVICE_REQUEST_LIMIT = 3;
const CV_PAID_DEVICE_REQUEST_WINDOW_DAYS = 7;
const CV_BUILDER_DEVICE_REQUEST_LIMIT = 3;
const CV_BUILDER_DEVICE_REQUEST_WINDOW_DAYS = 30;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatField(label, value) {
  return `<p style="margin:0 0 10px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || "-")}</p>`;
}

function removeUndefined(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map(removeUndefined).filter((item) => item !== undefined);
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefined(item)])
  );
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function setCorsHeaders(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getOrderLimitConfig(order = {}) {
  const limitBucket = String(order?.limitBucket || "").trim();
  const serviceKey = String(order?.serviceKey || "").trim();

  if (limitBucket === "cv-builder" || serviceKey === "builder") {
    return {
      bucket: "cv-builder",
      limit: CV_BUILDER_DEVICE_REQUEST_LIMIT,
      windowDays: CV_BUILDER_DEVICE_REQUEST_WINDOW_DAYS,
    };
  }

  if (limitBucket === "cv-paid" || ["premium", "elite"].includes(serviceKey)) {
    return {
      bucket: "cv-paid",
      limit: CV_PAID_DEVICE_REQUEST_LIMIT,
      windowDays: CV_PAID_DEVICE_REQUEST_WINDOW_DAYS,
    };
  }

  return {
    bucket: "country-paid",
    limit: COUNTRY_PAID_DEVICE_REQUEST_LIMIT,
    windowDays: COUNTRY_PAID_DEVICE_REQUEST_WINDOW_DAYS,
  };
}

async function getRecentDeviceOrderCountForWindow(deviceId, windowDays, bucket) {
  const now = Date.now();
  const windowStartMs = now - windowDays * 24 * 60 * 60 * 1000;

  const snapshot = await firestoreDb
    .collection("orders")
    .where("deviceId", "==", deviceId)
    .get();

  return snapshot.docs.filter((doc) => {
    const data = doc.data() || {};
    const createdAt = data.createdAt;
    const createdAtMs = createdAt?.toDate ? createdAt.toDate().getTime() : 0;
    const docLimitBucket = String(data.limitBucket || "").trim();
    const serviceKey = String(data.serviceKey || "").trim();
    const normalizedBucket = docLimitBucket ||
      (serviceKey === "builder" ? "cv-builder" :
        ["premium", "elite"].includes(serviceKey) ? "cv-paid" : "country-paid");
    const matchesBucket = normalizedBucket === bucket;
    return matchesBucket && createdAtMs >= windowStartMs;
  }).length;
}

function buildAdminHtml(order, orderId, customerEmail) {
  return `
    <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8;color:#111827;">
      <h2 style="margin:0 0 16px;color:#b8860b;">تم استلام طلب جديد</h2>
      ${formatField("رقم الطلب", orderId)}
      ${formatField("الخدمة", order.service)}
      ${formatField("اسم العميل", order.name)}
      ${formatField("رقم الموبايل", order.phone)}
      ${formatField("البريد الإلكتروني", customerEmail)}
      ${formatField("الدولة", order.country)}
      ${formatField("المدينة", order.city)}
      ${formatField("طريقة الدفع", order.paymentMethod)}
      ${formatField("نوع الدفع", order.billingLabel)}
      ${formatField("تاريخ الطلب", order.dateStr)}
      ${formatField("اسم الإيصال", order.receiptName)}
    </div>
  `;
}

function buildCustomerHtml(order, orderId) {
  return `
    <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8;color:#111827;">
      <h2 style="margin:0 0 16px;color:#16a34a;">تم استلام طلبك بنجاح</h2>
      <p style="margin:0 0 12px;">نشكر ثقتك بنا. تم تسجيل طلبك وسنتواصل معك في أقرب وقت ممكن.</p>
      ${formatField("رقم الطلب", orderId)}
      ${formatField("الخدمة", order.service)}
      ${formatField("الدولة", order.country)}
      ${formatField("المدينة", order.city)}
      ${formatField("طريقة الدفع", order.paymentMethod)}
      ${formatField("تاريخ الطلب", order.dateStr)}
      <p style="margin:18px 0 0;color:#92400e;">
        تنبيه: برجاء الاحتفاظ برقم الطلب للمتابعة، وفي حال الحاجة يمكن الرد على هذا الإيميل وإرفاق إيصال الدفع أو لقطة شاشة واضحة لعملية الدفع.
      </p>
    </div>
  `;
}

exports.createOrder = onRequest(
  {
    region: "us-central1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "method-not-allowed"});
      return;
    }

    const order = req.body?.order;
    if (!order || typeof order !== "object") {
      res.status(400).json({ok: false, error: "missing-order-payload"});
      return;
    }

    const customerEmail = String(order.email || "").trim();
    const deviceId = String(order.deviceId || "").trim();
    if (!customerEmail || !isValidEmail(customerEmail)) {
      res.status(400).json({ok: false, error: "invalid-email"});
      return;
    }

    if (!deviceId) {
      res.status(400).json({
        ok: false,
        error: "missing-device-id",
        message: "missing-device-id",
      });
      return;
    }

    try {
      const limitConfig = getOrderLimitConfig(order);
      const recentDeviceOrdersCount = await getRecentDeviceOrderCountForWindow(
        deviceId,
        limitConfig.windowDays,
        limitConfig.bucket
      );
      if (recentDeviceOrdersCount >= limitConfig.limit) {
        res.status(429).json({
          ok: false,
          error: "device-request-limit-exceeded",
          message: "device-request-limit-exceeded",
          limit: limitConfig.limit,
          windowDays: limitConfig.windowDays,
          remainingRequests: 0,
        });
        return;
      }

      const payload = {
        ...removeUndefined(order),
        deviceId,
        email: customerEmail,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await firestoreDb.collection("orders").add(payload);
      logger.info("Order created successfully", {orderId: docRef.id, serial: payload.serial || ""});
      res.status(200).json({ok: true, firebaseId: docRef.id});
    } catch (error) {
      logger.error("Failed to create order", {error: error?.message || error});
      res.status(500).json({ok: false, error: error?.message || "order-create-failed"});
    }
  }
);

exports.sendOrderEmails = onRequest(
  {
    region: "us-central1",
    secrets: [RESEND_API_KEY],
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "method-not-allowed"});
      return;
    }

    const order = req.body?.order;
    if (!order) {
      logger.warn("No order payload found in request body");
      res.status(400).json({error: "missing-order-payload"});
      return;
    }

    const resend = new Resend(RESEND_API_KEY.value());
    const orderId = order.serial || order.firebaseId || "UNKNOWN-ORDER";
    const customerEmail = String(order.email || "").trim();

    const adminPayload = {
      from: `Trusted Travel Offices <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `طلب جديد - ${orderId}`,
      html: buildAdminHtml(order, orderId, customerEmail),
    };

    try {
      await resend.emails.send(adminPayload);

      if (customerEmail) {
        const customerPayload = {
          from: `Trusted Travel Offices <${FROM_EMAIL}>`,
          to: [customerEmail],
          subject: `تم استلام طلبك - ${orderId}`,
          html: buildCustomerHtml(order, orderId),
        };
        await resend.emails.send(customerPayload);
      } else {
        logger.warn("Customer email is missing, skipped customer confirmation email", {orderId});
      }

      logger.info("Order emails sent successfully", {orderId, customerEmail});
      res.status(200).json({ok: true, orderId});
    } catch (error) {
      logger.error("Failed to send order emails", {orderId, error: error?.message || error});
      res.status(500).json({ok: false, error: error?.message || "email-send-failed"});
    }
  }
);

exports.exchangeIdTokenForCustomToken = onRequest(
  {
    region: "us-central1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ok: false, error: "method-not-allowed"});
      return;
    }

    const idToken = String(req.body?.idToken || "").trim();
    if (!idToken) {
      res.status(400).json({ok: false, error: "missing-id-token"});
      return;
    }

    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      const uid = String(decoded?.uid || "").trim();
      if (!uid) {
        res.status(400).json({ok: false, error: "invalid-id-token"});
        return;
      }

      const customToken = await getAuth().createCustomToken(uid);
      res.status(200).json({ok: true, customToken});
    } catch (error) {
      logger.error("Failed to exchange idToken for customToken", {error: error?.message || error});
      res.status(401).json({ok: false, error: "token-exchange-failed"});
    }
  }
);

exports.deleteAuthUserByAdmin = onRequest(
  {
    region: "us-central1",
  },
  async (req, res) => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ok: false, error: "method-not-allowed"});
      return;
    }

    const authHeader = String(req.headers.authorization || "").trim();
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ok: false, error: "missing-authorization"});
      return;
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    if (!idToken) {
      res.status(401).json({ok: false, error: "missing-id-token"});
      return;
    }

    const targetUid = String(req.body?.uid || "").trim();
    if (!targetUid) {
      res.status(400).json({ok: false, error: "missing-target-uid"});
      return;
    }

    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      const requesterUid = String(decoded?.uid || "").trim();
      const requesterEmail = String(decoded?.email || "").trim().toLowerCase();

      if (!requesterUid) {
        res.status(401).json({ok: false, error: "invalid-id-token"});
        return;
      }

      const isEmailAdmin = ADMIN_EMAILS.includes(requesterEmail);
      const requesterProfileSnapshot = await firestoreDb.collection("users").doc(requesterUid).get();
      const requesterRole = String(requesterProfileSnapshot.data()?.role || "").trim().toLowerCase();
      const isRoleAdmin = requesterRole === "admin";

      if (!isEmailAdmin && !isRoleAdmin) {
        res.status(403).json({ok: false, error: "admin-only"});
        return;
      }

      if (targetUid === requesterUid) {
        res.status(400).json({ok: false, error: "cannot-delete-self"});
        return;
      }

      await firestoreDb.collection("users").doc(targetUid).delete().catch(() => undefined);

      try {
        await getAuth().deleteUser(targetUid);
      } catch (error) {
        const authCode = String(error?.code || "").trim();
        if (authCode !== "auth/user-not-found") {
          throw error;
        }
      }

      logger.info("Admin deleted user", {
        requesterUid,
        requesterEmail,
        targetUid,
      });
      res.status(200).json({ok: true, deletedUid: targetUid});
    } catch (error) {
      logger.error("Failed to delete user by admin", {error: error?.message || error});
      res.status(500).json({ok: false, error: error?.message || "admin-delete-user-failed"});
    }
  }
);

exports.cleanupOldOrders = onSchedule(
  {
    region: "us-central1",
    schedule: "every 24 hours",
    timeZone: "Africa/Cairo",
  },
  async () => {
    const cutoffMs = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const snapshot = await firestoreDb.collection("orders").get();

    const staleRefs = snapshot.docs
      .filter((docSnapshot) => {
        const data = docSnapshot.data() || {};
        const createdAtMs = data?.createdAt?.toDate
          ? data.createdAt.toDate().getTime()
          : new Date(data?.createdAt || data?.date || 0).getTime();
        return Number.isFinite(createdAtMs) && createdAtMs < cutoffMs;
      })
      .map((docSnapshot) => docSnapshot.ref);

    let deletedCount = 0;
    const chunkSize = 450;
    for (let i = 0; i < staleRefs.length; i += chunkSize) {
      const batch = firestoreDb.batch();
      staleRefs.slice(i, i + chunkSize).forEach((docRef) => {
        batch.delete(docRef);
        deletedCount += 1;
      });
      await batch.commit();
    }

    logger.info("cleanupOldOrders completed", {
      scanned: snapshot.size,
      deleted: deletedCount,
      cutoffMs,
    });
  }
);
