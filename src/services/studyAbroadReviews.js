import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestoreDb } from "../firebase";

const STUDY_ABROAD_REVIEWS_COLLECTION = "study_abroad_reviews";

function normalizeCreatedAt(value) {
  if (value?.toDate) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return "";
}

function sortByNewest(items = []) {
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.createdAt || "") || 0;
    const bTime = Date.parse(b.createdAt || "") || 0;
    return bTime - aTime;
  });
}

export async function fetchStudyAbroadReviews(officeId) {
  const cleanOfficeId = String(officeId || "").trim();
  if (!cleanOfficeId) return [];

  const reviewsQuery = query(
    collection(firestoreDb, STUDY_ABROAD_REVIEWS_COLLECTION),
    where("officeId", "==", cleanOfficeId)
  );

  const snapshot = await getDocs(reviewsQuery);
  const reviews = snapshot.docs.map((reviewDoc) => {
    const data = reviewDoc.data() || {};
    return {
      id: reviewDoc.id,
      officeId: String(data.officeId || ""),
      officeName: String(data.officeName || ""),
      rating: Number(data.rating || 0),
      reviewText: String(data.reviewText || ""),
      authorName: String(data.authorName || ""),
      userUid: String(data.userUid || ""),
      userEmail: String(data.userEmail || ""),
      createdAt: normalizeCreatedAt(data.createdAt),
    };
  });

  return sortByNewest(reviews);
}

export async function saveStudyAbroadReview(reviewData = {}) {
  const payload = {
    officeId: String(reviewData.officeId || "").trim(),
    officeName: String(reviewData.officeName || "").trim(),
    rating: Number(reviewData.rating || 0),
    reviewText: String(reviewData.reviewText || "").trim(),
    authorName: String(reviewData.authorName || "").trim(),
    userUid: String(reviewData.userUid || "").trim(),
    userEmail: String(reviewData.userEmail || "").trim(),
    lang: String(reviewData.lang || "ar").trim() || "ar",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const reviewDoc = await addDoc(collection(firestoreDb, STUDY_ABROAD_REVIEWS_COLLECTION), payload);
  return reviewDoc.id;
}

export async function updateStudyAbroadReview(reviewId, updates = {}) {
  const cleanReviewId = String(reviewId || "").trim();
  if (!cleanReviewId) {
    throw new Error("study-review-id-required");
  }

  const payload = {
    ...(updates.rating !== undefined ? { rating: Number(updates.rating || 0) } : {}),
    ...(updates.reviewText !== undefined ? { reviewText: String(updates.reviewText || "").trim() } : {}),
    ...(updates.authorName !== undefined ? { authorName: String(updates.authorName || "").trim() } : {}),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(firestoreDb, STUDY_ABROAD_REVIEWS_COLLECTION, cleanReviewId), payload);
}

export async function deleteStudyAbroadReview(reviewId) {
  const cleanReviewId = String(reviewId || "").trim();
  if (!cleanReviewId) {
    throw new Error("study-review-id-required");
  }

  await deleteDoc(doc(firestoreDb, STUDY_ABROAD_REVIEWS_COLLECTION, cleanReviewId));
}