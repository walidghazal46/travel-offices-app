import React from 'react';
import { getCvBuilderStyles } from './CvBuilderStyles';

const CvOrderDataView = ({
  lang,
  t,
  isAr,
  selectedCvBuilderOrder,
  setCvBuilderScreen
}) => {
  const styles = getCvBuilderStyles(t);

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
      <div style={{ ...styles.cardStyle, padding: "14px" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 12 }}>
          {lang === "ar" ? "البيانات المقدمة في هذا الطلب" : "Submitted Data For This Request"}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "12px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.gold, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "البيانات الشخصية" : "Personal Information"}
            </div>
            {[
              [lang === "ar" ? "الاسم الكامل" : "Full Name", selectedCvBuilderOrder.data?.fullName],
              [lang === "ar" ? "المسمى الوظيفي" : "Job Title", selectedCvBuilderOrder.data?.jobTitle],
              [lang === "ar" ? "الدولة" : "Country", selectedCvBuilderOrder.data?.country],
              [lang === "ar" ? "المدينة / الموقع" : "City / Location", selectedCvBuilderOrder.data?.location],
              [lang === "ar" ? "رقم الموبايل" : "Mobile", selectedCvBuilderOrder.data?.phone],
              [lang === "ar" ? "رقم الواتساب" : "WhatsApp", selectedCvBuilderOrder.data?.whatsapp],
              [lang === "ar" ? "البريد الإلكتروني" : "Email", selectedCvBuilderOrder.data?.email],
              [lang === "ar" ? "الجنسية" : "Nationality", selectedCvBuilderOrder.data?.nationality],
              [lang === "ar" ? "رقم الإقامة / الهوية" : "ID / Iqama", selectedCvBuilderOrder.data?.iqama],
              [lang === "ar" ? "الحالة الاجتماعية" : "Marital Status", selectedCvBuilderOrder.data?.maritalStatus],
              [lang === "ar" ? "حالة الإقامة" : "Iqama Status", selectedCvBuilderOrder.data?.iqamaStatus],
            ].map(([label, value], idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: t.text, fontFamily: "'Cairo',sans-serif", textAlign: isAr ? "left" : "right" }}>{value || "—"}</span>
              </div>
            ))}
          </div>

          <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "12px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.gold, marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "الملخص والعضويات" : "Summary & Memberships"}
            </div>
            <div style={{ fontSize: 12, color: t.text, lineHeight: 1.9, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
              {selectedCvBuilderOrder.data?.summary || "—"}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {(selectedCvBuilderOrder.data?.memberships || []).length > 0 ? (
                (selectedCvBuilderOrder.data?.memberships || []).map((membership, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{membership?.name || "—"}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: t.text, fontFamily: "'Cairo',sans-serif" }}>{membership?.number || "—"}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }} >{lang === "ar" ? "لا توجد عضويات مضافة" : "No memberships added"}</div>
              )}
            </div>
          </div>

          <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "12px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.gold, marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "الخبرات العملية" : "Work Experience"}
            </div>
            {(selectedCvBuilderOrder.data?.experiences || []).length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {(selectedCvBuilderOrder.data?.experiences || []).map((exp, idx) => (
                  <div key={exp.id || idx} style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: t.text, marginBottom: 6, fontFamily: "'Cairo',sans-serif" }}>
                      {exp.jobTitle || (lang === "ar" ? `خبرة ${idx + 1}` : `Experience ${idx + 1}`)}
                    </div>
                    <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
                      {[exp.company, exp.location, exp.startDate, exp.current ? (lang === "ar" ? "حتى الآن" : "Present") : exp.endDate].filter(Boolean).join(" • ") || "—"}
                    </div>
                    {!!(exp.responsibilities || []).filter(Boolean).length && (
                      <div style={{ marginTop: 8, fontSize: 11, color: t.text, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
                        {(exp.responsibilities || []).filter(Boolean).map((item, itemIdx) => (
                          <div key={itemIdx}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "لا توجد خبرات مضافة." : "No experience entries added."}
              </div>
            )}
          </div>

          <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "12px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.gold, marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "المهارات والبرامج والإنجازات" : "Skills, Tools & Achievements"}
            </div>
            {[
              [lang === "ar" ? "المهارات الأساسية" : "Core Competencies", (selectedCvBuilderOrder.data?.coreCompetencies || []).join(" | ")],
              [lang === "ar" ? "الأدوات والبرامج" : "Tools & Software", (selectedCvBuilderOrder.data?.toolsSoftware || []).join(" | ")],
              [lang === "ar" ? "الإنجازات" : "Achievements", (selectedCvBuilderOrder.data?.achievements || []).filter(Boolean).join(" | ")],
            ].map(([label, value], idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: t.text, fontFamily: "'Cairo',sans-serif", textAlign: isAr ? "left" : "right" }}>{value || "—"}</span>
              </div>
            ))}
          </div>

          <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "12px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.gold, marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "التعليم والشهادات واللغات" : "Education, Certifications & Languages"}
            </div>
            {[
              [lang === "ar" ? "التعليم" : "Education", (selectedCvBuilderOrder.data?.education || []).map((item) => [item.degree, item.major, item.university, item.year].filter(Boolean).join(" — ")).filter(Boolean).join(" | ")],
              [lang === "ar" ? "الشهادات" : "Certifications", (selectedCvBuilderOrder.data?.certifications || []).map((item) => [item.name, item.issuer, item.year].filter(Boolean).join(" — ")).filter(Boolean).join(" | ")],
              [lang === "ar" ? "اللغات" : "Languages", (selectedCvBuilderOrder.data?.languages || []).map((item) => [item.lang, item.level].filter(Boolean).join(" — ")).filter(Boolean).join(" | ")],
            ].map(([label, value], idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: t.text, fontFamily: "'Cairo',sans-serif", textAlign: isAr ? "left" : "right" }}>{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setCvBuilderScreen("orderDetails")}
          style={{ ...styles.cvActionBtnStyle(t.inputBg, t.gold), border: `1px solid ${t.gold}`, boxShadow: "none", maxWidth: 220 }}
        >
          {lang === "ar" ? "رجوع" : "Back"}
        </button>
      </div>
    </div>
  );
};

export default CvOrderDataView;
