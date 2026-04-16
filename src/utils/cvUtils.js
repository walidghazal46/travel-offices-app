export function createEmptyCvPackageStats() {
  return {
    requestsCount: 0,
    reviewsCount: 0,
    ratingsTotal: 0,
    averageRating: 0,
  };
}

export function detectCvPackageKeyFromOrder(order) {
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

export function isCvOrderRecord(order) {
  return String(order?.serviceCategory || "").trim().toLowerCase() === "cv"
    || !!detectCvPackageKeyFromOrder(order);
}


// ── Sub-components ──────────────────────────────────────────────────────────
