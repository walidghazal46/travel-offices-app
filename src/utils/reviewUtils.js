import { officeIdAliases } from "../data/egyptData";

export function generateServiceProviderSerial() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const r = Math.floor(1000 + Math.random() * 9000);
  return `SVP-${y}${m}${d}-${r}`;
}

export function getServiceReviewBucketKey(countryName, serviceKey) {
  return `${countryName || "global"}::${serviceKey || "unknown"}`;
}

export function formatReviewDateValue(dateValue, locale = "ar") {
  if (!dateValue) return "";
  const reviewDate = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(reviewDate.getTime())) return "";
  return reviewDate.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US");
}

export function buildReviewerInitials(nameOrEmail = "") {
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

export function buildServiceReviewMap(reviewOrders, locale = "ar") {
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

export function buildOfficeReviewState(reviewItems, locale = "ar") {
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

