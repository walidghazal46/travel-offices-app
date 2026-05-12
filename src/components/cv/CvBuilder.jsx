import React from 'react';
import { getCvBuilderStyles } from './CvBuilderStyles';

const CvBuilder = ({
  cvData,
  cvStep,
  setCvStep,
  cvUpdate,
  actions,
  lang,
  t,
  compTag,
  setCompTag,
  toolTag,
  setToolTag,
  cvSectionsSaved,
  cvStepValidationError,
  cvBuilderOrderSyncError,
  isGuestUser,
  selectedCvBuilderOrder,
  cvBuilderOrderSyncBusy,
  cvPdfExporting,
  cvBuilderRating,
  setCvBuilderRating,
  cvBuilderHoverRating,
  setCvBuilderHoverRating,
  cvBuilderReviewText,
  setCvBuilderReviewText,
  cvBuilderReviewLocked,
  cvBuilderReviewDaysRemaining,
  cvBuilderReviewError,
  setCvBuilderReviewSubmitting,
  cvBuilderReviewSubmitting,
  submitCvBuilderReview,
  cancelCurrentCvBuilderRequest,
  handleCvStepChange,
  openCvExportLangModal,
  openCvServiceEmailConfirm,
  promptCvBuilderGuestAuth,
  getCvBuilderEmailStatusLabel,
  setCvBuilderScreen,
  setCvBuilderReviewEditMode,
  setCvBuilderReviewError
}) => {
  const {
    inputStyle,
    labelStyle,
    cardStyle,
    secHeadStyle,
    addBtnStyle,
    tagStyle,
    stepCircle
  } = getCvBuilderStyles(t);

  const cvSteps = lang === "ar"
    ? ["البيانات الشخصية", "الخبرات", "المهارات", "التعليم", "التصدير"]
    : ["Personal", "Experience", "Skills", "Education", "Export"];
  const cvIcons = ["👤", "💼", "🛠️", "🎓", "📄"];

  const {
    cvAddMembership,
    cvUpdateMembership,
    cvRemoveMembership,
    cvAddExp,
    cvRemoveExp,
    cvUpdateExp,
    cvUpdateResp,
    cvRemoveResp,
    cvAddRespLine,
    cvAddProject,
    cvUpdateProject,
    cvRemoveProject,
    cvAddTag,
    cvRemoveTag,
    cvUpdateAchievement,
    cvRemoveAchievement,
    cvAddAchievement,
    cvSaveSection,
    cvAddEdu,
    cvUpdateEdu,
    cvRemoveEdu,
    cvAddAward,
    cvUpdateAward,
    cvRemoveAward,
    cvAddCert,
    cvUpdateCert,
    cvRemoveCert,
    cvAddLang,
    cvUpdateLang,
    cvRemoveLang
  } = actions;

  return (
    <>
      {/* ── Progress Bar ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 0 }}>
        {cvSteps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, cursor: "pointer" }} onClick={() => { void handleCvStepChange(i); }}>
              <div style={stepCircle(i === cvStep, i < cvStep)}>
                {i < cvStep ? "✓" : cvIcons[i]}
              </div>
              <div style={{ fontSize: 9, color: i === cvStep ? t.gold : t.subText, fontWeight: i === cvStep ? 700 : 400, fontFamily: "'Cairo',sans-serif", textAlign: "center" }}>{s}</div>
            </div>
            {i < cvSteps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < cvStep ? t.gold : t.border, marginBottom: 18, transition: "background .2s" }} />
            )}
          </React.Fragment>
        ))}
      </div>
      {!!cvStepValidationError && (
        <div style={{ ...cardStyle, marginBottom: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.24)", color: "#b91c1c", fontSize: 12, fontWeight: 800, lineHeight: 1.8 }}>
          {cvStepValidationError}
        </div>
      )}
      {!!cvBuilderOrderSyncError && (
        <div style={{ ...cardStyle, marginBottom: 12, background: "rgba(251,191,36,0.10)", border: "1px solid rgba(217,119,6,0.28)", color: "#b45309", fontSize: 12, fontWeight: 800, lineHeight: 1.8 }}>
          {cvBuilderOrderSyncError}
        </div>
      )}

      {/* ═══ STEP 0: PERSONAL ════════════════════════ */}
      {cvStep === 0 && (
        <div>
          <div style={cardStyle}>
            <div style={secHeadStyle}>👤 {lang === "ar" ? "البيانات الشخصية" : "Personal Information"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { field: "fullName", ar: "الاسم الكامل", en: "Full Name", ph: lang === "ar" ? "أحمد سامي" : "Alex Morgan" },
                { field: "jobTitle", ar: "المسمى الوظيفي", en: "Job Title", ph: lang === "ar" ? "أخصائي عمليات" : "Operations Specialist" },
                { field: "country", ar: "الدولة", en: "Country", ph: lang === "ar" ? "مصر" : "Egypt" },
                { field: "location", ar: "المدينة / الموقع", en: "City / Location", ph: lang === "ar" ? "القاهرة" : "Cairo" },
                { field: "phone", ar: "رقم الموبايل", en: "Mobile Number", ph: "+966 00 00 000" },
                { field: "whatsapp", ar: "رقم الواتساب", en: "WhatsApp Number", ph: "+966 00 00 000" },
                { field: "email", ar: "البريد الإلكتروني", en: "Email", ph: "example@email.com" },
                { field: "nationality", ar: "الجنسية", en: "Nationality", ph: lang === "ar" ? "مصري" : "Egyptian" },
                { field: "iqama", ar: "رقم الإقامة / الهوية", en: "ID / Iqama No.", ph: lang === "ar" ? "0000000000" : "0000000000" },
              ].map(f => (
                <div key={f.field} style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: f.field === "fullName" || f.field === "jobTitle" ? "1/-1" : "auto" }}>
                  <label style={labelStyle}>{lang === "ar" ? f.ar : f.en}</label>
                  <input style={inputStyle} value={cvData[f.field]} placeholder={f.ph} onChange={e => cvUpdate(f.field, e.target.value)} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>{lang === "ar" ? "الحالة الاجتماعية" : "Marital Status"}</label>
                <select style={inputStyle} value={cvData.maritalStatus} onChange={e => cvUpdate("maritalStatus", e.target.value)}>
                  <option value="">{lang === "ar" ? "اختر..." : "Select..."}</option>
                  <option value={lang === "ar" ? "أعزب" : "Single"}>{lang === "ar" ? "أعزب" : "Single"}</option>
                  <option value={lang === "ar" ? "متزوج" : "Married"}>{lang === "ar" ? "متزوج" : "Married"}</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>{lang === "ar" ? "حالة الإقامة" : "Iqama Status"}</label>
                <select style={inputStyle} value={cvData.iqamaStatus} onChange={e => cvUpdate("iqamaStatus", e.target.value)}>
                  <option value="transferable">{lang === "ar" ? "قابلة للنقل" : "Transferable"}</option>
                  <option value="non-transferable">{lang === "ar" ? "غير قابلة للنقل" : "Non-Transferable"}</option>
                  <option value="none">{lang === "ar" ? "لا يوجد" : "None"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memberships */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={secHeadStyle}>🏛️ {lang === "ar" ? "العضويات المهنية" : "Professional Memberships"}</div>
              <button onClick={cvAddMembership} style={{ background: t.gold, border: "none", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>+</button>
            </div>
            {cvData.memberships.map((mem, i) => (
              <div key={mem.id} style={{ background: t.inputBg, borderRadius: 10, padding: "12px", marginBottom: 10, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif" }}>🏢 {lang === "ar" ? `عضوية ${i + 1}` : `Membership ${i + 1}`}</div>
                  {cvData.memberships.length > 1 && <button onClick={() => cvRemoveMembership(mem.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: t.subText }}>✕</button>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <input type="radio" id={`has-yes-${mem.id}`} name={`has-${mem.id}`} checked={!mem.hasNo} onChange={() => cvUpdateMembership(mem.id, "hasNo", false)} style={{ accentColor: t.gold, width: 16, height: 16, cursor: "pointer" }} />
                  <label htmlFor={`has-yes-${mem.id}`} style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>{lang === "ar" ? "يوجد عضوية" : "Has Membership"}</label>
                  <input type="radio" id={`has-no-${mem.id}`} name={`has-${mem.id}`} checked={mem.hasNo} onChange={() => cvUpdateMembership(mem.id, "hasNo", true)} style={{ accentColor: t.gold, width: 16, height: 16, cursor: "pointer", marginLeft: 20 }} />
                  <label htmlFor={`has-no-${mem.id}`} style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>{lang === "ar" ? "لا توجد عضوية" : "No Membership"}</label>
                </div>
                {!mem.hasNo && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={labelStyle}>{lang === "ar" ? "اسم النقابة / الهيئة" : "Membership Name"}</label>
                      <input style={inputStyle} value={mem.name} placeholder={lang === "ar" ? "مثلاً: هيئة المهندسين السعوديين" : "e.g., Saudi Council of Engineers"} onChange={e => cvUpdateMembership(mem.id, "name", e.target.value)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={labelStyle}>{lang === "ar" ? "رقم العضوية" : "Membership Number"}</label>
                      <input style={inputStyle} value={mem.number} placeholder={lang === "ar" ? "0000000" : "000000"} onChange={e => cvUpdateMembership(mem.id, "number", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>✨ {lang === "ar" ? "الملخص المهني" : "Professional Summary"}</div>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.7 }}
              placeholder={lang === "ar" ? "اكتب نبذة مهنية مختصرة تبرز خبراتك وأهم نقاط قوتك..." : "Write a short professional summary that highlights your strengths and experience..."}
              value={cvData.summary} onChange={e => cvUpdate("summary", e.target.value)} />
            <div style={{ fontSize: 10, color: t.subText, fontFamily: "'Cairo',sans-serif", marginTop: 6 }}>
              {lang === "ar" ? "💡 اكتب 2-4 جمل تلخص خبرتك وتخصصك" : "💡 Write 2-4 sentences summarizing your expertise"}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 1: EXPERIENCE ══════════════════════ */}
      {cvStep === 1 && (
        <div>
          {cvData.experiences.map((exp, ei) => (
            <div key={exp.id} style={{ ...cardStyle, border: `1px solid ${t.gold}44` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif" }}>
                  💼 {lang === "ar" ? `خبرة ${ei + 1}` : `Experience ${ei + 1}`}
                </div>
                {cvData.experiences.length > 1 && (
                  <button onClick={() => cvRemoveExp(exp.id)} style={{ background: "#e53e3e18", border: "1px solid #e53e3e30", borderRadius: 8, padding: "3px 10px", cursor: "pointer", fontSize: 11, color: "#e53e3e", fontFamily: "'Cairo',sans-serif" }}>
                    {lang === "ar" ? "حذف" : "Remove"}
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[
                  { field: "jobTitle", ar: "المسمى الوظيفي", en: "Job Title", ph: lang === "ar" ? "مسؤول مبيعات" : "Sales Executive", full: true },
                  { field: "company", ar: "اسم الشركة", en: "Company", ph: lang === "ar" ? "شركة التقنية الحديثة" : "Future Tech Co." },
                  { field: "location", ar: "الموقع", en: "Location", ph: lang === "ar" ? "دبي، الإمارات" : "Dubai, UAE" },
                  { field: "startDate", ar: "تاريخ البدء", en: "Start Date", ph: "Oct 2000" },
                  { field: "endDate", ar: "تاريخ الانتهاء", en: "End Date", ph: exp.current ? (lang === "ar" ? "حتى الآن" : "Present") : "Dec 2025" },
                ].map(f => (
                  <div key={f.field} style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: f.full ? "1/-1" : "auto" }}>
                    <label style={labelStyle}>{lang === "ar" ? f.ar : f.en}</label>
                    <input style={{ ...inputStyle, opacity: f.field === "endDate" && exp.current ? 0.4 : 1 }}
                      disabled={f.field === "endDate" && exp.current}
                      value={f.field === "endDate" && exp.current ? (lang === "ar" ? "حتى الآن" : "Present") : exp[f.field]}
                      placeholder={f.ph}
                      onChange={e => cvUpdateExp(exp.id, f.field, e.target.value)} />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8, gridColumn: "1/-1" }}>
                  <input type="checkbox" id={`curr-${exp.id}`} checked={exp.current} onChange={e => cvUpdateExp(exp.id, "current", e.target.checked)} style={{ accentColor: t.gold, width: 14, height: 14 }} />
                  <label htmlFor={`curr-${exp.id}`} style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>{lang === "ar" ? "أعمل هنا حالياً" : "Currently working here"}</label>
                </div>
              </div>

              {/* Responsibilities */}
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>📌 {lang === "ar" ? "المسؤوليات والمهام" : "Responsibilities"}</label>
                {exp.responsibilities.map((r, ri) => (
                  <div key={ri} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${t.gold}22`, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{ri + 1}</div>
                    <input style={{ ...inputStyle, flex: 1 }} value={r}
                      placeholder={lang === "ar" ? "أدخل مسؤولية أو مهمة..." : "Enter a responsibility or task..."}
                      onChange={e => cvUpdateResp(exp.id, ri, e.target.value)} />
                    {exp.responsibilities.length > 1 && (
                      <button onClick={() => cvRemoveResp(exp.id, ri)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.subText, padding: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    )}
                  </div>
                ))}
                <button style={addBtnStyle} onClick={() => cvAddRespLine(exp.id)}>+ {lang === "ar" ? "أضف مسؤولية" : "Add responsibility"}</button>
              </div>

              {/* Projects */}
              <div>
                <label style={labelStyle}>🏗️ {lang === "ar" ? "المشاريع (اختياري)" : "Projects (optional)"}</label>
                {exp.projects.map((pr, pi) => (
                  <div key={pi} style={{ background: t.inputBg, borderRadius: 10, padding: "10px", marginBottom: 8, border: `1px solid ${t.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif" }}>🔹 {lang === "ar" ? `مشروع ${pi + 1}` : `Project ${pi + 1}`}</div>
                      <button onClick={() => cvRemoveProject(exp.id, pi)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: t.subText }}>✕</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { field: "name", ar: "اسم المشروع", en: "Project Name", ph: lang === "ar" ? "منصة خدمة عملاء رقمية" : "Digital Customer Platform" },
                        { field: "owner", ar: "صاحب العمل", en: "Owner/Client", ph: lang === "ar" ? "جهة حكومية" : "Government Entity" },
                        { field: "cost", ar: "التكلفة التقريبية", en: "Approx. Cost", ph: "~150M SAR" },
                        { field: "location", ar: "الموقع", en: "Location", ph: lang === "ar" ? "القاهرة" : "Cairo" },
                      ].map(f => (
                        <div key={f.field} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <label style={{ ...labelStyle, fontSize: 10 }}>{lang === "ar" ? f.ar : f.en}</label>
                          <input style={{ ...inputStyle, fontSize: 12, padding: "7px 10px" }} value={pr[f.field]} placeholder={f.ph} onChange={e => cvUpdateProject(exp.id, pi, f.field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button style={{ ...addBtnStyle, border: `1px dashed ${t.border}`, color: t.subText }} onClick={() => cvAddProject(exp.id)}>+ {lang === "ar" ? "أضف مشروع" : "Add project"}</button>
              </div>
            </div>
          ))}
          <button style={{ ...addBtnStyle, padding: "12px", fontSize: 13 }} onClick={cvAddExp}>+ {lang === "ar" ? "إضافة خبرة وظيفية جديدة" : "Add new work experience"}</button>
        </div>
      )}

      {/* ═══ STEP 2: SKILLS ══════════════════════════ */}
      {cvStep === 2 && (
        <div>
          {/* Core Competencies */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>⭐ {lang === "ar" ? "المهارات الأساسية" : "Core Competencies"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 40, padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, marginBottom: 8 }}>
              {cvData.coreCompetencies.map(tag => (
                <span key={tag} style={tagStyle}>{tag} <button onClick={() => cvRemoveTag("coreCompetencies", tag)} style={{ background: "none", border: "none", cursor: "pointer", color: t.gold, fontSize: 13, lineHeight: 1, padding: 0 }}>×</button></span>
              ))}
              <input style={{ border: "none", outline: "none", background: "none", fontSize: 12, color: t.text, fontFamily: "'Cairo',sans-serif", minWidth: 120, flex: 1 }}
                value={compTag} placeholder={lang === "ar" ? "أضف مهارة واضغط Enter..." : "Add skill and press Enter..."}
                onChange={e => setCompTag(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); cvAddTag("coreCompetencies", compTag, setCompTag); } }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(lang === "ar" ? ["تقدير التكاليف", "جداول الكميات", "التخطيط والعطاءات", "هندسة القيمة", "إدارة العقود", "المطالبات والتغييرات", "إدارة المشتريات", "التفاوض التجاري"]
                : ["Cost Estimation", "Bill of Quantities", "Tendering & Bidding", "Value Engineering", "Contract Admin", "Claims & Variations", "Procurement", "Commercial Negotiation"]).map(s => (
                  <button key={s} onClick={() => { if (!cvData.coreCompetencies.includes(s)) cvUpdate("coreCompetencies", [...cvData.coreCompetencies, s]); }}
                    style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${t.border}`, background: cvData.coreCompetencies.includes(s) ? `${t.gold}22` : t.inputBg, color: cvData.coreCompetencies.includes(s) ? t.gold : t.subText, fontSize: 11, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontWeight: cvData.coreCompetencies.includes(s) ? 700 : 400 }}>
                    {cvData.coreCompetencies.includes(s) ? "✓ " : "+ "}{s}
                  </button>
                ))}
            </div>
          </div>

          {/* Tools & Software */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>🛠️ {lang === "ar" ? "الأدوات والبرامج" : "Tools & Software"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 40, padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, marginBottom: 8 }}>
              {cvData.toolsSoftware.map(tag => (
                <span key={tag} style={{ ...tagStyle, background: `#1d4ed822`, color: "#60a5fa" }}>{tag} <button onClick={() => cvRemoveTag("toolsSoftware", tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#60a5fa", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button></span>
              ))}
              <input style={{ border: "none", outline: "none", background: "none", fontSize: 12, color: t.text, fontFamily: "'Cairo',sans-serif", minWidth: 120, flex: 1 }}
                value={toolTag} placeholder={lang === "ar" ? "أضف برنامج واضغط Enter..." : "Add tool and press Enter..."}
                onChange={e => setToolTag(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); cvAddTag("toolsSoftware", toolTag, setToolTag); } }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["AutoCAD 2D", "Revit", "PlanSwift", "CostX", "MS Excel", "MS Office", "Google SketchUp", "AutoRebar"].map(s => (
                <button key={s} onClick={() => { if (!cvData.toolsSoftware.includes(s)) cvUpdate("toolsSoftware", [...cvData.toolsSoftware, s]); }}
                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${t.border}`, background: cvData.toolsSoftware.includes(s) ? "#1d4ed822" : t.inputBg, color: cvData.toolsSoftware.includes(s) ? "#60a5fa" : t.subText, fontSize: 11, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontWeight: cvData.toolsSoftware.includes(s) ? 700 : 400 }}>
                  {cvData.toolsSoftware.includes(s) ? "✓ " : "+ "}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>🏆 {lang === "ar" ? "الإنجازات المميزة" : "Selected Achievements"}</div>
            {cvData.achievements.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <input style={{ ...inputStyle, flex: 1 }} value={a}
                  placeholder={lang === "ar" ? "خفضت وقت إعداد العطاءات بنسبة 20%..." : "Reduced tender preparation time by ~20%..."}
                  onChange={e => cvUpdateAchievement(i, e.target.value)} />
                {cvData.achievements.length > 1 && (
                  <button onClick={() => cvRemoveAchievement(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.subText, padding: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                )}
              </div>
            ))}
            <button style={addBtnStyle} onClick={cvAddAchievement}>+ {lang === "ar" ? "أضف إنجاز" : "Add achievement"}</button>
          </div>

          {/* ATS Keywords */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>🔑 {lang === "ar" ? "الكلمات المفتاحية ATS" : "ATS Keywords"}</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical", lineHeight: 1.7 }}
              placeholder={lang === "ar" ? "أضف كلمات مفتاحية موضوعة بفواصل (يوصى به للبحث عن الوظائف)..." : "Add keywords separated by commas (recommended for job search)..."}
              value={cvData.keywords} onChange={e => cvUpdate("keywords", e.target.value)} />
          </div>

          {/* Save Button */}
          <button
            onClick={() => cvSaveSection("step2")}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: cvSectionsSaved.step2 ? "#10b98122" : t.gold,
              border: "none",
              borderRadius: 10,
              color: cvSectionsSaved.step2 ? "#059669" : "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Cairo',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16
            }}>
            {cvSectionsSaved.step2 ? (
              <>✓ {lang === "ar" ? "تم الحفظ بنجاح" : "Saved Successfully"}</>
            ) : (
              <>💾 {lang === "ar" ? "احفظ البيانات" : "Save Section"}</>
            )}
          </button>
        </div>
      )}

      {/* ═══ STEP 3: EDUCATION ═══════════════════════ */}
      {cvStep === 3 && (
        <div>
          {/* Education */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>🎓 {lang === "ar" ? "التعليم" : "Education"}</div>
            {cvData.education.map((edu, i) => (
              <div key={i} style={{ background: t.inputBg, borderRadius: 10, padding: "12px", marginBottom: 10, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif" }}>📚 {lang === "ar" ? `مؤهل ${i + 1}` : `Degree ${i + 1}`}</div>
                  {cvData.education.length > 1 && <button onClick={() => cvRemoveEdu(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: t.subText }}>✕</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { f: "degree", ar: "الدرجة العلمية", en: "Degree", ph: lang === "ar" ? "بكالوريوس" : "B.Sc." },
                    { f: "major", ar: "التخصص", en: "Major", ph: lang === "ar" ? "الهندسة المدنية" : "Civil Engineering" },
                    { f: "university", ar: "الجامعة", en: "University", ph: lang === "ar" ? "جامعة الإسكندرية" : "Alexandria University", full: true },
                    { f: "year", ar: "سنة التخرج", en: "Graduation Year", ph: "2013" },
                  ].map(f => (
                    <div key={f.f} style={{ display: "flex", flexDirection: "column", gap: 3, gridColumn: f.full ? "1/-1" : "auto" }}>
                      <label style={{ ...labelStyle, fontSize: 10 }}>{lang === "ar" ? f.ar : f.en}</label>
                      <input style={{ ...inputStyle, fontSize: 12 }} value={edu[f.f]} placeholder={f.ph} onChange={e => cvUpdateEdu(i, f.f, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button style={addBtnStyle} onClick={cvAddEdu}>+ {lang === "ar" ? "أضف مؤهل" : "Add degree"}</button>
          </div>

          {/* Certifications */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>📜 {lang === "ar" ? "الشهادات والدورات" : "Certifications"}</div>
            {cvData.certifications.map((c, i) => (
              <div key={i} style={{ background: t.inputBg, borderRadius: 10, padding: "10px", marginBottom: 8, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif" }}>🏅 {lang === "ar" ? `شهادة ${i + 1}` : `Certificate ${i + 1}`}</div>
                  {cvData.certifications.length > 1 && <button onClick={() => cvRemoveCert(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: t.subText }}>✕</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { f: "name", ar: "اسم الشهادة", en: "Certificate Name", ph: lang === "ar" ? "شهادة إدارة المشاريع" : "Project Management Certificate", full: true },
                    { f: "issuer", ar: "الجهة المانحة", en: "Issuing Body", ph: lang === "ar" ? "أكاديمية معتمدة" : "Accredited Academy" },
                    { f: "year", ar: "السنة", en: "Year", ph: "2026" },
                  ].map(f => (
                    <div key={f.f} style={{ display: "flex", flexDirection: "column", gap: 3, gridColumn: f.full ? "1/-1" : "auto" }}>
                      <label style={{ ...labelStyle, fontSize: 10 }}>{lang === "ar" ? f.ar : f.en}</label>
                      <input style={{ ...inputStyle, fontSize: 12 }} value={c[f.f]} placeholder={f.ph} onChange={e => cvUpdateCert(i, f.f, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button style={addBtnStyle} onClick={cvAddCert}>+ {lang === "ar" ? "أضف شهادة" : "Add certification"}</button>
          </div>

          {/* Awards */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>🏆 {lang === "ar" ? "الجوائز والتكريمات" : "Awards & Honors"}</div>
            {(cvData.awards || []).map((award, i) => (
              <div key={award.id} style={{ background: t.inputBg, borderRadius: 10, padding: "10px", marginBottom: 8, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif" }}>🎁 {lang === "ar" ? `جائزة ${i + 1}` : `Award ${i + 1}`}</div>
                  {cvData.awards.length > 1 && <button onClick={() => cvRemoveAward(award.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: t.subText }}>✕</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { f: "name", ar: "اسم الجائزة", en: "Award Name", ph: lang === "ar" ? "موظف المثالي" : "Employee of the Month", full: true },
                    { f: "issuer", ar: "الجهة المانحة", en: "Issuing Body", ph: lang === "ar" ? "شركة التقنية" : "Tech Corp" },
                    { f: "year", ar: "السنة", en: "Year", ph: "2024" },
                  ].map(f => (
                    <div key={f.f} style={{ display: "flex", flexDirection: "column", gap: 3, gridColumn: f.full ? "1/-1" : "auto" }}>
                      <label style={{ ...labelStyle, fontSize: 10 }}>{lang === "ar" ? f.ar : f.en}</label>
                      <input style={{ ...inputStyle, fontSize: 12 }} value={award[f.f]} placeholder={f.ph} onChange={e => cvUpdateAward(award.id, f.f, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button style={addBtnStyle} onClick={cvAddAward}>+ {lang === "ar" ? "أضف جائزة" : "Add award"}</button>
          </div>

          {/* Languages */}
          <div style={cardStyle}>
            <div style={secHeadStyle}>🌐 {lang === "ar" ? "اللغات" : "Languages"}</div>
            {cvData.languages.map((l, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <label style={{ ...labelStyle, fontSize: 10 }}>{lang === "ar" ? "اللغة" : "Language"}</label>
                  <input style={{ ...inputStyle, fontSize: 12 }} value={l.lang} placeholder={lang === "ar" ? "العربية" : "Arabic"} onChange={e => cvUpdateLang(i, "lang", e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <label style={{ ...labelStyle, fontSize: 10 }}>{lang === "ar" ? "المستوى" : "Level"}</label>
                  <select style={{ ...inputStyle, fontSize: 12 }} value={l.level} onChange={e => cvUpdateLang(i, "level", e.target.value)}>
                    {(lang === "ar" ? ["مبتدئ", "متوسط", "جيد", "جيد جداً", "ممتاز", "اللغة الأم"] : ["Beginner", "Intermediate", "Good", "Very Good", "Excellent", "Native"]).map(lv => (
                      <option key={lv} value={lv}>{lv}</option>
                    ))}
                  </select>
                </div>
                {cvData.languages.length > 1 && <button onClick={() => cvRemoveLang(i)} style={{ background: "#e53e3e18", border: "1px solid #e53e3e30", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 13, color: "#e53e3e" }}>✕</button>}
              </div>
            ))}
            <button style={addBtnStyle} onClick={cvAddLang}>+ {lang === "ar" ? "أضف لغة" : "Add language"}</button>
          </div>

        </div>
      )}

      {/* ═══ STEP 4: EXPORT ══════════════════════════ */}
      {cvStep === 4 && (
        <div>
          {isGuestUser && (
            <div style={{ ...cardStyle, border: "1px solid rgba(220,38,38,0.45)", background: "linear-gradient(135deg, rgba(254,226,226,0.9), rgba(254,242,242,0.95))", boxShadow: "0 0 18px rgba(220,38,38,0.28)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#b91c1c", fontFamily: "'Cairo',sans-serif", marginBottom: 8, textShadow: "0 0 8px rgba(220,38,38,0.25)" }}>
                {lang === "ar" ? "تنبيه قبل التصدير" : "Notice Before Export"}
              </div>
              <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.9, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
                {lang === "ar"
                  ? "بياناتك محفوظة في هذه الصفحة كما هي. لإكمال حفظ الطلب وإرسال الإيميل وتفعيل التصدير، سجّل الدخول أو أنشئ حسابًا الآن."
                  : "Your entered data stays on this page as-is. To complete request saving, email dispatch, and export enablement, sign in or create an account now."}
              </div>
              <button
                onClick={promptCvBuilderGuestAuth}
                style={{ width: "100%", border: "none", borderRadius: 12, padding: "11px 12px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: "0 0 14px rgba(220,38,38,0.42)" }}
              >
                {lang === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Create Account"}
              </button>
            </div>
          )}

          {/* Summary card */}
          <div style={{ ...cardStyle, border: `1px solid ${t.gold}44`, background: `${t.gold}08` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
              ✅ {lang === "ar" ? "ملخص البيانات المُدخلة" : "Data Summary"}
            </div>
            {[
              { label: lang === "ar" ? "الاسم" : "Name", val: cvData.fullName || "—" },
              { label: lang === "ar" ? "المسمى" : "Title", val: cvData.jobTitle || "—" },
              { label: lang === "ar" ? "الخبرات" : "Experiences", val: `${cvData.experiences.length} ${lang === "ar" ? "خبرة" : "entries"}` },
              { label: lang === "ar" ? "المهارات" : "Skills", val: `${cvData.coreCompetencies.length} ${lang === "ar" ? "مهارة" : "skills"}` },
              { label: lang === "ar" ? "الأدوات" : "Tools", val: `${cvData.toolsSoftware.length} ${lang === "ar" ? "أداة" : "tools"}` },
              { label: lang === "ar" ? "الشهادات" : "Certifications", val: `${cvData.certifications.filter(c => c.name).length} ${lang === "ar" ? "شهادة" : "certs"}` },
              { label: lang === "ar" ? "الجوائز" : "Awards", val: `${(cvData.awards || []).filter(a => a.name).length} ${lang === "ar" ? "جائزة" : "awards"}` },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.text, fontFamily: "'Cairo',sans-serif" }}>{r.val}</span>
              </div>
            ))}
          </div>
          <div style={{ ...cardStyle, border: `1px solid ${t.border}`, background: t.cardBg }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
              {lang === "ar" ? "بيان الطلب" : "Request Statement"}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{lang === "ar" ? "رقم الطلب" : "Order Number"}</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: t.text, fontFamily: "'Cairo',sans-serif" }}>{selectedCvBuilderOrder?.orderNumber || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{lang === "ar" ? "السيريال" : "Serial"}</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: t.text, fontFamily: "'Cairo',sans-serif" }}>{selectedCvBuilderOrder?.serial || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0" }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{lang === "ar" ? "حالة الحفظ" : "Save Status"}</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: cvBuilderOrderSyncBusy ? t.gold : (selectedCvBuilderOrder?.firebaseId ? "#16a34a" : "#dc2626"), fontFamily: "'Cairo',sans-serif" }}>
                  {cvBuilderOrderSyncBusy
                    ? (lang === "ar" ? "جاري الحفظ..." : "Saving...")
                    : selectedCvBuilderOrder?.firebaseId
                      ? (lang === "ar" ? "تم الحفظ على Firebase" : "Saved to Firebase")
                      : (lang === "ar" ? "غير محفوظ بعد" : "Not saved yet")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderTop: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{lang === "ar" ? "حالة الإيميل" : "Email Status"}</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: selectedCvBuilderOrder?.emailDeliveryStatus === "sent" ? "#16a34a" : selectedCvBuilderOrder?.emailDeliveryStatus === "failed" ? "#dc2626" : t.gold, fontFamily: "'Cairo',sans-serif" }}>
                  {getCvBuilderEmailStatusLabel(selectedCvBuilderOrder?.emailDeliveryStatus)}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              <button onClick={() => openCvExportLangModal("pdf")} disabled={cvPdfExporting} style={{ ...cardStyle, marginBottom: 0, textAlign: "center", background: "linear-gradient(135deg,#fff1f2,#f8fafc)", border: "1px solid #fda4af", cursor: cvPdfExporting ? "wait" : "pointer", opacity: cvPdfExporting ? 0.75 : 1, minHeight: 96, padding: "10px" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#e11d48", fontFamily: "'Cairo',sans-serif", marginBottom: 3 }}>
                  {cvPdfExporting ? (lang === "ar" ? "جاري تجهيز ملف PDF..." : "Preparing PDF file...") : (lang === "ar" ? "تصدير ملف PDF" : "Export PDF File")}
                </div>
                <div style={{ fontSize: 10, color: t.subText, lineHeight: 1.5, fontFamily: "'Cairo',sans-serif" }}>
                  {lang === "ar" ? "حمّل سيرة ذاتية جاهزة بصيغة PDF مباشرة من البيانات التي سجلتها." : "Export a ready PDF resume directly from your entered data."}
                </div>
              </button>

              <button onClick={() => openCvExportLangModal("word")} style={{ ...cardStyle, marginBottom: 0, textAlign: "center", background: "linear-gradient(135deg,#eff6ff,#f8fafc)", border: "1px solid #93c5fd", cursor: "pointer", minHeight: 96, padding: "10px" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>📝</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#2563eb", fontFamily: "'Cairo',sans-serif", marginBottom: 3 }}>
                  {lang === "ar" ? "تصدير ملف Word" : "Export Word File"}
                </div>
                <div style={{ fontSize: 10, color: t.subText, lineHeight: 1.5, fontFamily: "'Cairo',sans-serif" }}>
                  {lang === "ar" ? "حمّل نفس البيانات بصيغة Word لتعديلها أو إرسالها بسهولة." : "Export the same information as a Word file for easy editing."}
                </div>
              </button>
            </div>

            <button onClick={openCvServiceEmailConfirm} style={{ ...cardStyle, marginBottom: 0, textAlign: "center", background: "linear-gradient(135deg,#fff8e6,#fffdf7)", border: `1px solid ${t.gold}66`, cursor: "pointer", boxShadow: `0 10px 26px ${t.gold}18` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📨</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 6 }}>
                {lang === "ar" ? "أرسل بياناتك وسنقوم بإعداد سيرة ذاتية جاهزة لك" : "Send your data and we will prepare a ready CV for you"}
              </div>
              <div style={{ fontSize: 12, color: "#b45309", fontWeight: 800, marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "ملف واحد PDF أو Word بسعر 5 دولار فقط لفترة محدودة" : "One PDF or Word file for only $5 for a limited time"}
              </div>
              <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
                {lang === "ar" ? "بعد الضغط سنراجع بلدك ورقم الموبايل ورقم الواتساب، ثم نفتح الإيميل لإرسال جميع بيانات السيرة الذاتية إلى بريدنا." : "We will confirm your country, mobile, and WhatsApp, then open email with all CV data addressed to us."}
              </div>
            </button>

            <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center", background: "linear-gradient(135deg,#ffffff,#f8fafc)", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
                {lang === "ar" ? "قيّم خدمة السيرة الذاتية" : "Rate the CV service"}
              </div>
              <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif", marginBottom: 14 }}>
                {lang === "ar"
                  ? "شاركنا تقييمك لتجربة إعداد السيرة الذاتية. سيتم حفظه في التطبيق ليستفيد منه باقي المستخدمين."
                  : "Share your experience with the CV service. Your rating will be saved for other users to benefit from."}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }} onMouseLeave={() => setCvBuilderHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
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
                      style={{ background: "none", border: "none", cursor: cvBuilderReviewLocked ? "not-allowed" : "pointer", fontSize: 28, color: active ? "#f59e0b" : t.border, padding: 0, opacity: cvBuilderReviewLocked ? 0.75 : 1 }}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <textarea
                style={{ width: "100%", minHeight: 96, borderRadius: 14, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, padding: "12px 14px", resize: "vertical", fontFamily: "'Cairo',sans-serif", fontSize: 12, boxSizing: "border-box", marginBottom: 10 }}
                value={cvBuilderReviewText}
                placeholder={lang === "ar" ? "اكتب تعليقك أو تجربتك مع الخدمة..." : "Write your feedback or experience..."}
                readOnly={cvBuilderReviewLocked}
                onChange={(e) => setCvBuilderReviewText(e.target.value)}
              />
              {cvBuilderReviewLocked && (
                <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.8, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
                  {lang === "ar"
                    ? `يمكن تعديل التقييم بعد مرور 30 يوم من عمل السيرة الذاتية. المتبقي ${cvBuilderReviewDaysRemaining} يوم.`
                    : `You can edit this review 30 days after creating the CV. ${cvBuilderReviewDaysRemaining} day(s) remaining.`}
                </div>
              )}
              {!!cvBuilderReviewError && (
                <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 800, marginBottom: 10, fontFamily: "'Cairo',sans-serif" }}>
                  {cvBuilderReviewError}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    if (!cvBuilderReviewSaved) {
                      setSelectedCvBuilderOrder(null);
                      setCvBuilderScreen("previousOrders");
                      return;
                    }
                    if (cvBuilderReviewLocked) {
                      setCvBuilderReviewError(
                        lang === "ar"
                          ? `يمكن تعديل التقييم بعد مرور 30 يوم من عمل السيرة الذاتية. المتبقي ${cvBuilderReviewDaysRemaining} يوم.`
                          : `You can edit the review 30 days after creating the CV. ${cvBuilderReviewDaysRemaining} day(s) remaining.`
                      );
                      return;
                    }
                    setCvBuilderReviewEditMode(true);
                    setCvBuilderReviewError("");
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
                >
                  {!cvBuilderReviewSaved
                    ? (lang === "ar" ? "الطلبات السابقة" : "Previous Requests")
                    : (lang === "ar" ? "تعديل التقييم" : "Edit Review")}
                </button>
                <button
                  onClick={submitCvBuilderReview}
                  style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${t.gold},#b8860b)`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif", opacity: cvBuilderReviewSubmitting ? 0.75 : 1 }}
                >
                  {cvBuilderReviewSubmitting
                    ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...")
                    : (lang === "ar" ? "حفظ التقييم" : "Save Review")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav Buttons ───────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "space-between" }}>
        {cvStep > 0 ? (
          <button onClick={() => { setCvStepValidationError(""); setCvStep(s => s - 1); }} style={{ padding: "11px 22px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "→ السابق" : "← Back"}
          </button>
        ) : <div />}
        {cvStep < 4 && (
          <button onClick={() => { void handleCvStepChange(cvStep + 1); }} style={{ padding: "11px 28px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${t.gold},#b8860b)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: `0 4px 14px ${t.gold}44`, flex: 1 }}>
            {lang === "ar" ? `التالي: ${cvSteps[cvStep + 1]} ←` : `Next: ${cvSteps[cvStep + 1]} →`}
          </button>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <button
          onClick={cancelCurrentCvBuilderRequest}
          style={{ maxWidth: 260, width: "100%", padding: "11px 18px", borderRadius: 12, border: "1px solid #dc262655", background: "linear-gradient(135deg,#fff8e6,#fff1f2)", color: "#dc2626", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cairo',sans-serif", boxShadow: "0 8px 22px rgba(220,38,38,0.08)" }}
        >
          {lang === "ar" ? "إلغاء الطلب الحالي" : "Cancel Current Request"}
        </button>
      </div>
    </>
  );
};

export default CvBuilder;
