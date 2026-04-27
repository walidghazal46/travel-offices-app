import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestoreDb } from "../firebase";
import { studyAbroadOfficesSeed } from "../data/studyAbroadOfficesSeed";

const STUDY_ABROAD_COLLECTION = "studyAbroadOffices";

function sortOffices(list = []) {
  return [...list].sort((a, b) => {
    const ratingDiff = Number(b?.rating || 0) - Number(a?.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return String(a?.name || "").localeCompare(String(b?.name || ""), "ar");
  });
}

export async function fetchStudyAbroadOffices() {
  try {
    const officesQuery = query(
      collection(firestoreDb, STUDY_ABROAD_COLLECTION),
      orderBy("rating", "desc")
    );
    const snapshot = await getDocs(officesQuery);
    const remoteOffices = snapshot.docs.map((entryDoc) => ({
      id: entryDoc.id,
      ...entryDoc.data(),
    }));

    if (remoteOffices.length > 0) {
      return sortOffices(remoteOffices);
    }
  } catch (error) {
    console.warn("Study abroad offices fetch failed; using bundled fallback data.", error);
  }

  return sortOffices(studyAbroadOfficesSeed);
}

