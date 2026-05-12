import { useEffect, useMemo, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { getCurrentAuthUser } from "../../firebase";
import {
  deleteStudyAbroadReview,
  fetchStudyAbroadReviews,
  saveStudyAbroadReview,
  updateStudyAbroadReview,
} from "../../services/studyAbroadReviews";
import styles from "../../styles/studyAbroadDetail.module.css";

function normalizePhoneForWhatsApp(phone = "") {
  const digitsOnly = String(phone).replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return digitsOnly.startsWith("00") ? digitsOnly.slice(2) : digitsOnly;
}

function openExternalUrl(url) {
  if (!url || typeof window === "undefined") return;
  try { window.location.assign(url); } catch { window.open(url, "_self"); }
}

const STARS = [1, 2, 3, 4, 5];
const REVIEW_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

function formatReviewDate(value, lang) {
  const parsed = Date.parse(String(value || ""));
  if (!Number.isFinite(parsed)) return "";
  return new Date(parsed).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US");
}

function getReviewCreatedAtMs(review = {}) {
  const parsed = Date.parse(String(review?.createdAt || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRemainingHoursToEdit(review = {}) {
  const createdAtMs = getReviewCreatedAtMs(review);
  if (!createdAtMs) return 0;
  const elapsed = Date.now() - createdAtMs;
  if (elapsed >= REVIEW_EDIT_WINDOW_MS) return 0;
  return Math.max(1, Math.ceil((REVIEW_EDIT_WINDOW_MS - elapsed) / (60 * 60 * 1000)));
}

export default function StudyAbroadOfficeDetail({
  office,
  onBack,
  lang = "ar",
  isAdminUser = false,
  onRequestAuth,
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isNativeApp = Capacitor.getPlatform() !== "web";
  const currentAuthUser = getCurrentAuthUser();
  const currentUserUid = String(currentAuthUser?.uid || "").trim();
  const isGuestReviewer = !currentUserUid;

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewActionBusyId, setReviewActionBusyId] = useState("");
  const [reviewEditingId, setReviewEditingId] = useState("");
  const [reviewEditingText, setReviewEditingText] = useState("");
  const [reviewEditingRating, setReviewEditingRating] = useState(0);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);

  const mapsQuery = encodeURIComponent(`${office.name || ""} ${office.address || ""}`.trim());
  const mapsUrl = office.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const ratingClassName = {
    "ممتاز": styles.ratingExcellent,
    "جيد جداً": styles.ratingGood,
    "جيد": styles.ratingFair,
  }[office.ratingLabel] || styles.ratingFair;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setReviewsLoading(true);
        const loadedReviews = await fetchStudyAbroadReviews(office?.id);
        if (!cancelled) {
          setReviews(loadedReviews);
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [office?.id]);

  useEffect(() => {
    if (!isNativeApp) return undefined;

    const listener = CapApp.addListener("backButton", () => {
      onBack?.();
    });

    return () => {
      listener.then((handler) => handler.remove()).catch(() => {});
    };
  }, [isNativeApp, onBack]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [office?.id]);

  const avgReview = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const reviewsWithDates = useMemo(
    () => reviews.map((review) => ({
      ...review,
      dateLabel: formatReviewDate(review.createdAt, lang),
    })),
    [reviews, lang]
  );

  const openGuestPrompt = () => {
    setGuestPromptOpen(true);
    setReviewError("");
  };

  const canCurrentUserManageReview = (review) => {
    if (isAdminUser) return true;
    if (!currentUserUid) return false;
    if (String(review?.userUid || "").trim() !== currentUserUid) return false;
    const createdAtMs = getReviewCreatedAtMs(review);
    if (!createdAtMs) return false;
    return Date.now() - createdAtMs >= REVIEW_EDIT_WINDOW_MS;
  };

  const startEditingReview = (review) => {
    if (!canCurrentUserManageReview(review)) return;
    setReviewEditingId(review.id);
    setReviewEditingText(String(review.reviewText || ""));
    setReviewEditingRating(Number(review.rating || 0));
    setReviewError("");
    setReviewSuccess("");
  };

  const cancelEditingReview = () => {
    setReviewEditingId("");
    setReviewEditingText("");
    setReviewEditingRating(0);
  };

  const saveEditedReview = async (review) => {
    if (!canCurrentUserManageReview(review)) return;
    if (!reviewEditingRating) {
      setReviewError(lang === "ar" ? "اختر عدد النجوم أولاً." : "Please select a star rating.");
      return;
    }
    if (!reviewEditingText.trim()) {
      setReviewError(lang === "ar" ? "اكتب تجربتك قبل الحفظ." : "Please write your experience before saving.");
      return;
    }

    try {
      setReviewActionBusyId(review.id);
      setReviewError("");
      await updateStudyAbroadReview(review.id, {
        rating: reviewEditingRating,
        reviewText: reviewEditingText.trim(),
      });

      setReviews((prev) => prev.map((item) => (
        item.id === review.id
          ? { ...item, rating: reviewEditingRating, reviewText: reviewEditingText.trim() }
          : item
      )));

      cancelEditingReview();
      setReviewSuccess(lang === "ar" ? "تم تعديل التقييم بنجاح ✓" : "Review updated successfully ✓");
      setTimeout(() => setReviewSuccess(""), 2500);
    } catch {
      setReviewError(
        lang === "ar"
          ? "تعذر تعديل التقييم الآن. حاول مرة أخرى."
          : "Unable to update the review right now. Please try again."
      );
    } finally {
      setReviewActionBusyId("");
    }
  };

  const deleteReview = async (review) => {
    if (!canCurrentUserManageReview(review)) return;

    const confirmed = typeof window !== "undefined"
      ? window.confirm(lang === "ar" ? "هل تريد حذف هذا التقييم؟" : "Do you want to delete this review?")
      : true;

    if (!confirmed) return;

    try {
      setReviewActionBusyId(review.id);
      setReviewError("");
      await deleteStudyAbroadReview(review.id);
      setReviews((prev) => prev.filter((item) => item.id !== review.id));
      if (reviewEditingId === review.id) {
        cancelEditingReview();
      }
      setReviewSuccess(lang === "ar" ? "تم حذف التقييم ✓" : "Review deleted ✓");
      setTimeout(() => setReviewSuccess(""), 2500);
    } catch {
      setReviewError(
        lang === "ar"
          ? "تعذر حذف التقييم الآن. حاول مرة أخرى."
          : "Unable to delete the review right now. Please try again."
      );
    } finally {
      setReviewActionBusyId("");
    }
  };

  const handleGuestAuthClick = (mode) => {
    setGuestPromptOpen(false);
    onRequestAuth?.(mode);
  };

  const submitReview = async () => {
    if (isGuestReviewer) {
      openGuestPrompt();
      return;
    }

    if (!reviewRating) {
      setReviewError(lang === "ar" ? "اختر عدد النجوم أولاً." : "Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      setReviewError(lang === "ar" ? "اكتب تجربتك قبل الإرسال." : "Please write your experience.");
      return;
    }

    const authUser = getCurrentAuthUser();
    if (!authUser?.uid) {
      openGuestPrompt();
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const normalizedAuthor = reviewAuthor.trim()
        || authUser.displayName
        || authUser.email
        || (lang === "ar" ? "مستخدم" : "User");

      const reviewId = await saveStudyAbroadReview({
        officeId: String(office?.id || "").trim(),
        officeName: String(office?.name || "").trim(),
        rating: reviewRating,
        reviewText: reviewText.trim(),
        authorName: normalizedAuthor,
        userUid: authUser.uid,
        userEmail: String(authUser.email || "").trim(),
        lang,
      });

      setReviews((prev) => [
        {
          id: reviewId,
          officeId: String(office?.id || "").trim(),
          officeName: String(office?.name || "").trim(),
          rating: reviewRating,
          reviewText: reviewText.trim(),
          authorName: normalizedAuthor,
          userUid: authUser.uid,
          userEmail: String(authUser.email || "").trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setReviewRating(0);
      setReviewText("");
      setReviewAuthor("");
      setReviewSuccess(lang === "ar" ? "تم إضافة تقييمك بنجاح ✓" : "Review added successfully ✓");
      setTimeout(() => setReviewSuccess(""), 3000);
    } catch {
      setReviewError(
        lang === "ar"
          ? "حصل خطأ أثناء حفظ التقييم. حاول مرة تانية."
          : "An error occurred while saving your review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className={styles.page} dir={dir}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.titleRow}>
          <h2 className={styles.officeName}>{office.name}</h2>
          <div className={styles.badges}>
            {office.isOfficial && (
              <span className={styles.officialBadge}>{lang === "ar" ? "رسمي" : "Official"}</span>
            )}
            {office.verified && (
              <span className={styles.verifiedBadge}>{lang === "ar" ? "موثق" : "Verified"}</span>
            )}
          </div>
        </div>

        <div className={styles.ratingRow}>
          {office.rating ? (
            <div className={`${styles.ratingBadge} ${ratingClassName}`}>
              <span className={styles.star}>★</span>
              <span>{Number(office.rating).toFixed(1)}</span>
              {office.ratingLabel && <span className={styles.ratingLabel}>{office.ratingLabel}</span>}
            </div>
          ) : null}
          {avgReview && (
            <div className={styles.userRatingBadge}>
              <span>⭐</span>
              <span>{avgReview}</span>
              <span className={styles.reviewCount}>({reviews.length} {lang === "ar" ? "تقييم" : "reviews"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className={styles.section}>
        <div className={styles.infoRow}>
          <span className={styles.govPill}>{office.governorate}</span>
          <span className={styles.areaName}>{office.area}</span>
        </div>

        <div className={styles.addressRow}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{office.address}</span>
        </div>

        {office.email && (
          <div className={styles.addressRow}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span dir="ltr">{office.email}</span>
          </div>
        )}
      </div>

      {/* Countries */}
      {office.countries?.length ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{lang === "ar" ? "الدول المتاحة" : "Available Countries"}</h3>
          <div className={styles.chips}>
            {office.countries.map((country) => (
              <span key={country} className={styles.countryChip}>{country}</span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Tags */}
      {office.tags?.length ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{lang === "ar" ? "الخدمات والتخصصات" : "Services & Specializations"}</h3>
          <div className={styles.chips}>
            {office.tags.map((tag) => (
              <span key={tag} className={styles.tagChip}>{tag}</span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Phones */}
      {office.phones?.length ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{lang === "ar" ? "أرقام التواصل" : "Contact Numbers"}</h3>
          <div className={styles.phonesList}>
            {office.phones.map((phone) => {
              const wpPhone = normalizePhoneForWhatsApp(phone);
              return (
                <div key={phone} className={styles.phoneItem}>
                  <span className={styles.phoneNumber} dir="ltr">{phone}</span>
                  <div className={styles.phoneActions}>
                    <a
                      className={`${styles.iconBtn} ${styles.callBtn}`}
                      href={`tel:${String(phone).replace(/\s/g, "")}`}
                      aria-label={lang === "ar" ? "اتصال" : "Call"}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </a>
                    {wpPhone ? (
                      <a
                        className={`${styles.iconBtn} ${styles.whatsappBtn}`}
                        href={`https://wa.me/${wpPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={lang === "ar" ? "واتساب" : "WhatsApp"}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.057 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654c1.732.945 3.677 1.444 5.652 1.445h.005c6.555 0 11.89-5.335 11.892-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className={styles.section}>
        <div className={styles.actionBtns}>
          <button
            type="button"
            className={styles.mapsBtn}
            onClick={() => openExternalUrl(mapsUrl)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {lang === "ar" ? "فتح على الخرائط" : "Open Maps"}
          </button>
          {office.website ? (
            <button
              type="button"
              className={styles.websiteBtn}
              onClick={() => openExternalUrl(
                office.website.startsWith("http") ? office.website : `https://${office.website}`
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {lang === "ar" ? "الموقع الإلكتروني" : "Website"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {lang === "ar" ? "التقييمات والتجارب" : "Ratings & Experiences"}
        </h3>

        {/* Add Review Form */}
        <div className={styles.reviewForm}>
          <div className={styles.starsInput}>
            {STARS.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.starBtn} ${s <= reviewRating ? styles.starActive : ""}`}
                onClick={() => {
                  if (isGuestReviewer) {
                    openGuestPrompt();
                    return;
                  }
                  setReviewRating(s);
                }}
                aria-label={`${s} stars`}
              >
                ★
              </button>
            ))}
          </div>

          <input
            className={styles.reviewInput}
            type="text"
            placeholder={
              isGuestReviewer
                ? (lang === "ar" ? "سجّل الدخول أولًا لإضافة تقييمك" : "Sign in first to add your review")
                : (lang === "ar" ? "اسمك (اختياري)" : "Your name (optional)")
            }
            value={reviewAuthor}
            onChange={(e) => setReviewAuthor(e.target.value)}
            onFocus={() => {
              if (isGuestReviewer) {
                openGuestPrompt();
              }
            }}
            readOnly={isGuestReviewer}
            maxLength={40}
          />

          <textarea
            className={styles.reviewTextarea}
            placeholder={
              isGuestReviewer
                ? (lang === "ar" ? "سجّل الدخول أو أنشئ حسابًا أولًا" : "Sign in or create an account first")
                : (lang === "ar" ? "اكتب تجربتك مع هذا المكتب..." : "Write your experience with this office...")
            }
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            onFocus={() => {
              if (isGuestReviewer) {
                openGuestPrompt();
              }
            }}
            readOnly={isGuestReviewer}
            rows={3}
            maxLength={500}
          />

          {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
          {reviewSuccess && <p className={styles.reviewSuccessMsg}>{reviewSuccess}</p>}

          <button type="button" className={styles.submitReviewBtn} onClick={submitReview} disabled={reviewSubmitting}>
            {reviewSubmitting
              ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...")
              : (lang === "ar" ? "إرسال التقييم" : "Submit Review")}
          </button>
        </div>

        {/* Reviews List */}
        {reviewsLoading ? (
          <p className={styles.noReviews}>
            {lang === "ar" ? "جاري تحميل التقييمات..." : "Loading reviews..."}
          </p>
        ) : reviewsWithDates.length > 0 ? (
          <div className={styles.reviewsList}>
            {reviewsWithDates.map((review) => {
              const isEditingThisReview = reviewEditingId === review.id;
              const canManageThisReview = canCurrentUserManageReview(review);
              const isReviewOwner = !!currentUserUid && String(review.userUid || "").trim() === currentUserUid;
              const remainingHours = getRemainingHoursToEdit(review);

              return (
              <div
                key={review.id}
                className={`${styles.reviewItem} ${isGuestReviewer ? styles.reviewItemClickable : ""}`}
                onClick={() => {
                  if (isGuestReviewer) {
                    openGuestPrompt();
                  }
                }}
              >
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewAuthor}>{review.authorName || (lang === "ar" ? "مستخدم" : "User")}</span>
                  <span className={styles.reviewStars}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                  <span className={styles.reviewDate}>{review.dateLabel}</span>
                </div>

                {isEditingThisReview ? (
                  <div className={styles.reviewEditBox} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.reviewEditStars}>
                      {STARS.map((s) => (
                        <button
                          key={`edit-${review.id}-${s}`}
                          type="button"
                          className={`${styles.starBtn} ${s <= reviewEditingRating ? styles.starActive : ""}`}
                          onClick={() => setReviewEditingRating(s)}
                          aria-label={`${s} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className={styles.reviewTextarea}
                      value={reviewEditingText}
                      onChange={(e) => setReviewEditingText(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div className={styles.reviewActions}>
                      <button
                        type="button"
                        className={styles.reviewGhostBtn}
                        onClick={cancelEditingReview}
                        disabled={reviewActionBusyId === review.id}
                      >
                        {lang === "ar" ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        className={styles.reviewSaveBtn}
                        onClick={() => saveEditedReview(review)}
                        disabled={reviewActionBusyId === review.id}
                      >
                        {reviewActionBusyId === review.id
                          ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...")
                          : (lang === "ar" ? "حفظ التعديل" : "Save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.reviewText}>{review.reviewText}</p>

                    {canManageThisReview ? (
                      <div className={styles.reviewActions} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={styles.reviewActionBtn}
                          onClick={() => startEditingReview(review)}
                          disabled={reviewActionBusyId === review.id}
                        >
                          {lang === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.reviewActionBtn} ${styles.reviewActionDanger}`}
                          onClick={() => deleteReview(review)}
                          disabled={reviewActionBusyId === review.id}
                        >
                          {reviewActionBusyId === review.id
                            ? (lang === "ar" ? "جارٍ الحذف..." : "Deleting...")
                            : (lang === "ar" ? "حذف" : "Delete")}
                        </button>
                      </div>
                    ) : isReviewOwner && !isAdminUser && remainingHours > 0 ? (
                      <p className={styles.reviewHint}>
                        {lang === "ar"
                          ? `يمكنك تعديل أو حذف تقييمك بعد ${remainingHours} ساعة.`
                          : `You can edit or delete your review after ${remainingHours} hour(s).`}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.noReviews}>
            {lang === "ar" ? "لا توجد تقييمات بعد. كن أول من يضيف تجربته!" : "No reviews yet. Be the first to share your experience!"}
          </p>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.adSlotCard}>
          <div className={styles.adSlotLabel}>
            {lang === "ar" ? "مساحة إعلانية" : "Ad Space"}
          </div>
          <h4 className={styles.adSlotTitle}>
            {lang === "ar" ? "أعلن عن خدمتك هنا" : "Promote your service here"}
          </h4>
          <p className={styles.adSlotText}>
            {lang === "ar"
              ? "هذه المنطقة مخصصة للإعلانات داخل صفحة مكاتب الدراسة، وتظهر للزوار المهتمين بالدراسة والسفر."
              : "This area is reserved for ads in the study offices page and is shown to users interested in study and travel services."}
          </p>
          <a
            className={styles.adSlotAction}
            href="https://wa.me/201064463650?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AD%D8%AC%D8%B2%20%D8%A7%D8%B9%D9%84%D8%A7%D9%86%20%D8%A8%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%B5%D9%81%D8%AD%D8%A9%20%D9%85%D9%83%D8%A7%D8%AA%D8%A8%20%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9"
            target="_blank"
            rel="noreferrer"
          >
            {lang === "ar" ? "احجز إعلانك الآن" : "Book your ad now"}
          </a>
        </div>
      </div>

      {guestPromptOpen ? (
        <div className={styles.authGlowOverlay} onClick={() => setGuestPromptOpen(false)}>
          <div className={styles.authGlowCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.authGlowTitle}>
              {lang === "ar" ? "التقييمات للمستخدمين المسجّلين فقط" : "Reviews are for signed-in users only"}
            </div>
            <p className={styles.authGlowText}>
              {lang === "ar"
                ? "سجّل الدخول أو أنشئ حسابًا حتى تقدر تكتب تجربتك وتضيف تقييمك."
                : "Sign in or create an account to share your experience and rating."}
            </p>
            <div className={styles.authGlowActions}>
              <button
                type="button"
                className={styles.authGlowLoginBtn}
                onClick={() => handleGuestAuthClick("login")}
              >
                {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
              </button>
              <button
                type="button"
                className={styles.authGlowSignupBtn}
                onClick={() => handleGuestAuthClick("signup")}
              >
                {lang === "ar" ? "إنشاء حساب" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!isNativeApp ? (
        <div className={styles.webBackDock}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {dir === "rtl"
                ? <path d="M9 18l6-6-6-6" />
                : <path d="M15 18l-6-6 6-6" />}
            </svg>
            {lang === "ar" ? "العودة للقائمة" : "Back to list"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
