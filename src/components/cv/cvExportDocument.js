const CV_EXPORT_ACCENT = "#2f6fb3";
const CV_EXPORT_BORDER = "#d7dee7";
const CV_EXPORT_SHELL_BG = "linear-gradient(180deg, #edf4ff 0%, #f8fbff 100%)";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeCvList(items) {
  return (items || []).map((item) => String(item || "").trim()).filter(Boolean);
}

function getCvExportLabels(exportLang = "en") {
  return exportLang === "ar"
    ? {
        dir: "rtl",
        nameFallback: "الاسم الكامل",
        roleFallback: "المسمى الوظيفي",
        page: "صفحة",
        summary: "الملخص المهني",
        summaryPlaceholder: "سيظهر هنا الملخص المهني بعد تعبئة النموذج.",
        provenRecord: "أبرز النقاط",
        expertise: "المهارات الأساسية",
        expertisePlaceholder: "ستظهر المهارات الأساسية هنا بعد إضافة البيانات.",
        experience: "الخبرات العملية",
        experiencePlaceholder: "ستظهر الخبرات العملية هنا بعد تعبئة النموذج.",
        achievements: "الإنجازات",
        achievementsPlaceholder: "أضف الإنجازات لإظهارها هنا.",
        tools: "الأدوات والكلمات المفتاحية",
        toolsPlaceholder: "ستظهر الأدوات والبرامج والكلمات المفتاحية هنا.",
        education: "التعليم",
        educationPlaceholder: "ستظهر بيانات التعليم هنا.",
        certifications: "الشهادات",
        certificationsPlaceholder: "ستظهر الشهادات هنا.",
        awards: "الجوائز والتكريمات",
        awardsPlaceholder: "ستظهر الجوائز هنا عند إضافتها.",
        languages: "اللغات",
        languagesPlaceholder: "ستظهر اللغات هنا عند إضافتها.",
        projects: "المشاريع",
        nationality: "الجنسية",
        maritalStatus: "الحالة الاجتماعية",
        iqama: "الإقامة / الهوية",
        transferableIqama: "إقامة قابلة للنقل",
        present: "حتى الآن",
        companyFallback: "اسم الشركة",
        expFallback: "خبرة عملية",
        contact: "بيانات التواصل",
      }
    : {
        dir: "ltr",
        nameFallback: "FULL NAME",
        roleFallback: "Professional Candidate",
        page: "Page",
        summary: "Professional Summary",
        summaryPlaceholder: "Your professional profile will appear here once the form is completed.",
        provenRecord: "Key highlights",
        expertise: "Core Expertise",
        expertisePlaceholder: "Core expertise will appear here after adding your skills.",
        experience: "Professional Experience",
        experiencePlaceholder: "Experience entries will appear here after filling the form.",
        achievements: "Key Achievements",
        achievementsPlaceholder: "Add achievements to display them here.",
        tools: "Tools & Keywords",
        toolsPlaceholder: "Tools, software, and keywords will appear here.",
        education: "Education",
        educationPlaceholder: "Education details will appear here.",
        certifications: "Certifications",
        certificationsPlaceholder: "Certifications will appear here.",
        awards: "Awards & Honors",
        awardsPlaceholder: "Awards will appear here when added.",
        languages: "Languages",
        languagesPlaceholder: "Languages will appear here when added.",
        projects: "Projects",
        nationality: "Nationality",
        maritalStatus: "Marital Status",
        iqama: "Iqama / ID",
        transferableIqama: "Transferable Iqama",
        present: "Present",
        companyFallback: "Company Name",
        expFallback: "Professional Experience",
        contact: "Contact",
      };
}

function formatCvDateRange(exp, exportLang = "en") {
  const labels = getCvExportLabels(exportLang);
  const start = String(exp?.startDate || "").trim();
  const end = exp?.current ? labels.present : String(exp?.endDate || "").trim();
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  return end || "";
}

function getCompanyMark(company = "") {
  const cleaned = String(company || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (!parts.length) return "CV";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "CV";
}

function splitSummaryIntoLines(summary = "") {
  return String(summary)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitSummaryIntoBullets(summary = "") {
  return String(summary)
    .split(/[.\n]+/)
    .map((line) => line.replace(/^[•\-]\s*/, "").trim())
    .filter((line) => line.length > 18)
    .slice(0, 4);
}

function normalizeCvForExport(cvData) {
  const experiences = (cvData?.experiences || [])
    .map((exp) => ({
      ...exp,
      jobTitle: String(exp?.jobTitle || "").trim(),
      company: String(exp?.company || "").trim(),
      location: String(exp?.location || "").trim(),
      responsibilities: sanitizeCvList(exp?.responsibilities),
      projects: (exp?.projects || []).map((project) => ({
        name: String(project?.name || "").trim(),
        owner: String(project?.owner || "").trim(),
        cost: String(project?.cost || "").trim(),
        location: String(project?.location || "").trim(),
      })).filter((project) => project.name || project.owner || project.cost || project.location),
    }))
    .filter((exp) => exp.jobTitle || exp.company || exp.responsibilities.length || exp.projects.length);

  const firstPageCount = experiences.length > 3 ? 3 : experiences.length;
  const memberships = (cvData?.memberships || [])
    .filter((membership) => !membership?.hasNo && String(membership?.name || "").trim())
    .map((membership) => ({
      name: String(membership?.name || "").trim(),
      number: String(membership?.number || "").trim(),
    }));

  return {
    fullName: String(cvData?.fullName || "").trim(),
    jobTitle: String(cvData?.jobTitle || "").trim(),
    country: String(cvData?.country || "").trim(),
    location: String(cvData?.location || "").trim(),
    phone: String(cvData?.phone || "").trim(),
    whatsapp: String(cvData?.whatsapp || "").trim(),
    email: String(cvData?.email || "").trim(),
    nationality: String(cvData?.nationality || "").trim(),
    maritalStatus: String(cvData?.maritalStatus || "").trim(),
    iqama: String(cvData?.iqama || "").trim(),
    iqamaStatus: String(cvData?.iqamaStatus || "").trim(),
    memberships,
    membershipLines: memberships.map((membership) => `${membership.name}${membership.number ? `: ${membership.number}` : ""}`),
    summaryLines: splitSummaryIntoLines(cvData?.summary),
    summaryBullets: splitSummaryIntoBullets(cvData?.summary),
    firstPageExperiences: experiences.slice(0, firstPageCount),
    secondPageExperiences: experiences.slice(firstPageCount),
    achievements: sanitizeCvList(cvData?.achievements),
    coreCompetencies: sanitizeCvList(cvData?.coreCompetencies),
    toolsSoftware: sanitizeCvList(cvData?.toolsSoftware),
    education: (cvData?.education || []).filter((edu) => edu?.degree || edu?.major || edu?.university || edu?.year),
    certifications: (cvData?.certifications || []).filter((cert) => cert?.name || cert?.issuer || cert?.year),
    awards: (cvData?.awards || []).filter((award) => award?.name || award?.issuer || award?.year),
    languages: (cvData?.languages || []).filter((language) => language?.lang || language?.level),
    keywords: sanitizeCvList(String(cvData?.keywords || "").split(",")),
  };
}

function renderExperience(exp, exportLang = "en") {
  const labels = getCvExportLabels(exportLang);
  const bulletItems = exp.responsibilities.length
    ? `<ul class="cv-export-bullets">${exp.responsibilities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  const projectItems = exp.projects.length
    ? `
      <div class="cv-export-inline-title">${escapeHtml(labels.projects)}</div>
      <ul class="cv-export-bullets cv-export-projects">
        ${exp.projects.map((project) => {
          const details = [project.owner, project.location, project.cost].filter(Boolean).join(" | ");
          return `<li>${escapeHtml(project.name)}${details ? ` - ${escapeHtml(details)}` : ""}</li>`;
        }).join("")}
      </ul>
    `
    : "";

  return `
    <div class="cv-export-exp-card">
      <div class="cv-export-exp-mark">${escapeHtml(getCompanyMark(exp.company))}</div>
      <div class="cv-export-exp-copy">
        <div class="cv-export-exp-title">${escapeHtml(exp.jobTitle || labels.expFallback)}</div>
        <div class="cv-export-exp-company">${escapeHtml(exp.company || labels.companyFallback)}${exp.location ? ` - ${escapeHtml(exp.location)}` : ""}</div>
        ${formatCvDateRange(exp, exportLang) ? `<div class="cv-export-exp-dates">${escapeHtml(formatCvDateRange(exp, exportLang))}</div>` : ""}
        ${bulletItems}
        ${projectItems}
      </div>
    </div>
  `;
}

function buildPageLabel(exportLang, pageNumber) {
  return exportLang === "ar"
    ? `🇸🇦 عربي - ${pageNumber === 1 ? "الصفحة الأولى" : "الصفحة الثانية"}`
    : `🇬🇧 English - ${pageNumber === 1 ? "Page One" : "Page Two"}`;
}

function buildCvPreviewDocument(cvData, exportLang = "en") {
  const data = normalizeCvForExport(cvData);
  const labels = getCvExportLabels(exportLang);
  const contactItems = [data.phone, data.whatsapp ? `WhatsApp: ${data.whatsapp}` : "", data.email, [data.country, data.location].filter(Boolean).join(" - ")].filter(Boolean);
  const identityItems = [
    data.nationality ? `${labels.nationality}: ${data.nationality}` : "",
    data.maritalStatus ? `${labels.maritalStatus}: ${data.maritalStatus}` : "",
    data.iqama && data.iqamaStatus !== "none" ? `${data.iqamaStatus === "transferable" ? labels.transferableIqama : labels.iqama}: ${data.iqama}` : "",
    ...data.membershipLines,
  ].filter(Boolean);
  const summaryLines = data.summaryLines.length ? data.summaryLines : [labels.summaryPlaceholder];
  const summaryBullets = data.achievements.length ? data.achievements.slice(0, 4) : data.summaryBullets;
  const tools = [...data.toolsSoftware, ...data.keywords].filter(Boolean);

  return `
    <style>
      .cv-export-doc { width: 794px; margin: 0 auto; font-family: 'Cairo', Arial, Helvetica, sans-serif; }
      .cv-export-page-wrap { margin-bottom: 22px; }
      .cv-export-page-label { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 8px 14px; border-radius: 999px; background: rgba(15, 23, 42, 0.92); color: #f8fafc; font-size: 12px; font-weight: 800; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14); }
      .cv-export-page { width: 595px; min-height: 842px; margin: 0 auto; background: #ffffff; color: #0f172a; box-sizing: border-box; padding: 28px 28px 24px; position: relative; overflow: hidden; border-radius: 22px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14); direction: ${labels.dir}; text-align: ${labels.dir === "rtl" ? "right" : "left"}; }
      .cv-export-page.cv-pdf-page-node { border-radius: 0; box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.05); }
      .cv-export-page::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 126px; background: linear-gradient(135deg, #15345f 0%, ${CV_EXPORT_ACCENT} 58%, #6ea8db 100%); }
      .cv-export-page::after { content: ""; position: absolute; top: 18px; ${labels.dir === "rtl" ? "left" : "right"}: -28px; width: 146px; height: 146px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
      .cv-export-header { position: relative; z-index: 1; display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 16px; align-items: center; margin-bottom: 18px; }
      .cv-export-avatar { width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, #ffffff, #dbeafe); color: ${CV_EXPORT_ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; border: 4px solid rgba(255, 255, 255, 0.9); box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18); }
      .cv-export-head-copy { color: #ffffff; min-width: 0; }
      .cv-export-name { font-size: 24px; font-weight: 900; line-height: 1.2; margin-bottom: 4px; ${labels.dir === "ltr" ? "text-transform: uppercase;" : ""} }
      .cv-export-role { font-size: 14px; font-weight: 700; opacity: 0.96; margin-bottom: 8px; }
      .cv-export-contact-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .cv-export-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.22); font-size: 10px; font-weight: 700; line-height: 1.3; }
      .cv-export-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.28fr) minmax(190px, 0.92fr); gap: 16px; }
      .cv-export-panel { background: ${CV_EXPORT_SHELL_BG}; border: 1px solid ${CV_EXPORT_BORDER}; border-radius: 18px; padding: 14px; }
      .cv-export-section { margin-bottom: 14px; }
      .cv-export-section:last-child { margin-bottom: 0; }
      .cv-export-section-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 9px; font-size: 11px; font-weight: 900; color: ${CV_EXPORT_ACCENT}; letter-spacing: 0.2px; text-transform: uppercase; }
      .cv-export-section-title::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(47,111,179,0.38), rgba(47,111,179,0)); }
      .cv-export-paragraph { font-size: 10.5px; line-height: 1.75; color: #334155; margin-bottom: 6px; }
      .cv-export-identity-list { display: grid; gap: 8px; }
      .cv-export-identity-item { padding: 10px 12px; border-radius: 14px; background: #ffffff; border: 1px solid rgba(215, 222, 231, 0.9); font-size: 10px; font-weight: 700; color: #334155; }
      .cv-export-inline-list { display: flex; flex-wrap: wrap; gap: 8px; }
      .cv-export-skill-pill { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; background: #ffffff; border: 1px solid rgba(47, 111, 179, 0.18); font-size: 10px; font-weight: 800; color: #1e3a5f; }
      .cv-export-bullets { margin: 0; padding-${labels.dir === "rtl" ? "right" : "left"}: 18px; font-size: 10px; line-height: 1.65; color: #334155; }
      .cv-export-bullets li { margin-bottom: 4px; }
      .cv-export-inline-title { font-size: 10px; font-weight: 900; color: ${CV_EXPORT_ACCENT}; margin: 8px 0 6px; }
      .cv-export-exp-card { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 12px; padding: 12px; border-radius: 16px; background: #ffffff; border: 1px solid rgba(215, 222, 231, 0.95); margin-bottom: 10px; }
      .cv-export-exp-mark { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #eff6ff, #ffffff); border: 1px solid rgba(47, 111, 179, 0.18); color: ${CV_EXPORT_ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; }
      .cv-export-exp-copy { min-width: 0; }
      .cv-export-exp-title { font-size: 11px; font-weight: 900; color: #0f172a; margin-bottom: 3px; }
      .cv-export-exp-company { font-size: 10px; font-weight: 800; color: #334155; margin-bottom: 3px; }
      .cv-export-exp-dates { font-size: 10px; color: #64748b; margin-bottom: 6px; }
      .cv-export-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .cv-export-edu-item, .cv-export-cert-item, .cv-export-lang-item { padding: 10px 12px; border-radius: 14px; background: #ffffff; border: 1px solid rgba(215, 222, 231, 0.95); margin-bottom: 8px; }
      .cv-export-item-title { font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 3px; }
      .cv-export-item-sub { font-size: 10px; color: #475569; line-height: 1.6; }
      .cv-export-footer { position: absolute; bottom: 18px; ${labels.dir === "rtl" ? "left" : "right"}: 24px; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: rgba(15, 23, 42, 0.06); color: #334155; font-size: 10px; font-weight: 800; }
    </style>
    <div class="cv-export-doc">
      <div class="cv-export-page-wrap">
        <div class="cv-export-page-label">${escapeHtml(buildPageLabel(exportLang, 1))}</div>
        <div class="cv-export-page cv-pdf-page-node">
          <div class="cv-export-header">
            <div class="cv-export-avatar">${escapeHtml(getCompanyMark(data.fullName || data.jobTitle || "CV"))}</div>
            <div class="cv-export-head-copy">
              <div class="cv-export-name">${escapeHtml(data.fullName || labels.nameFallback)}</div>
              <div class="cv-export-role">${escapeHtml(data.jobTitle || labels.roleFallback)}</div>
              <div class="cv-export-contact-row">
                ${contactItems.length ? contactItems.map((item) => `<span class="cv-export-chip">${escapeHtml(item)}</span>`).join("") : `<span class="cv-export-chip">${escapeHtml(labels.contact)}</span>`}
              </div>
            </div>
          </div>
          <div class="cv-export-grid">
            <div>
              <div class="cv-export-panel cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.summary)}</div>
                ${summaryLines.map((line) => `<div class="cv-export-paragraph">${escapeHtml(line)}</div>`).join("")}
                ${summaryBullets.length ? `<div class="cv-export-inline-title">${escapeHtml(labels.provenRecord)}</div><ul class="cv-export-bullets">${summaryBullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
              </div>
              <div class="cv-export-panel cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.expertise)}</div>
                ${data.coreCompetencies.length ? `<div class="cv-export-inline-list">${data.coreCompetencies.map((item) => `<span class="cv-export-skill-pill">${escapeHtml(item)}</span>`).join("")}</div>` : `<div class="cv-export-paragraph">${escapeHtml(labels.expertisePlaceholder)}</div>`}
              </div>
              <div class="cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.experience)}</div>
                ${data.firstPageExperiences.length ? data.firstPageExperiences.map((exp) => renderExperience(exp, exportLang)).join("") : `<div class="cv-export-panel"><div class="cv-export-paragraph">${escapeHtml(labels.experiencePlaceholder)}</div></div>`}
              </div>
            </div>
            <div>
              <div class="cv-export-panel cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.contact)}</div>
                <div class="cv-export-identity-list">
                  ${identityItems.length ? identityItems.map((item) => `<div class="cv-export-identity-item">${escapeHtml(item)}</div>`).join("") : `<div class="cv-export-identity-item">${escapeHtml(labels.summaryPlaceholder)}</div>`}
                </div>
              </div>
              <div class="cv-export-panel cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.achievements)}</div>
                ${data.achievements.length ? `<ul class="cv-export-bullets">${data.achievements.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<div class="cv-export-paragraph">${escapeHtml(labels.achievementsPlaceholder)}</div>`}
              </div>
              <div class="cv-export-panel cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.tools)}</div>
                ${tools.length ? `<div class="cv-export-inline-list">${tools.map((item) => `<span class="cv-export-skill-pill">${escapeHtml(item)}</span>`).join("")}</div>` : `<div class="cv-export-paragraph">${escapeHtml(labels.toolsPlaceholder)}</div>`}
              </div>
            </div>
          </div>
          <div class="cv-export-footer">${escapeHtml(labels.page)} 1 / 2</div>
        </div>
      </div>
      <div class="cv-export-page-wrap">
        <div class="cv-export-page-label">${escapeHtml(buildPageLabel(exportLang, 2))}</div>
        <div class="cv-export-page cv-pdf-page-node">
          ${data.secondPageExperiences.length ? `<div class="cv-export-section"><div class="cv-export-section-title">${escapeHtml(labels.experience)}</div>${data.secondPageExperiences.map((exp) => renderExperience(exp, exportLang)).join("")}</div>` : ""}
          <div class="cv-export-two-col">
            <div>
              <div class="cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.education)}</div>
                ${data.education.length ? data.education.map((edu) => `<div class="cv-export-edu-item"><div class="cv-export-item-title">${escapeHtml([edu.degree, edu.major].filter(Boolean).join(" - ") || labels.education)}</div><div class="cv-export-item-sub">${escapeHtml([edu.university, edu.year].filter(Boolean).join(" - ") || labels.educationPlaceholder)}</div></div>`).join("") : `<div class="cv-export-panel"><div class="cv-export-paragraph">${escapeHtml(labels.educationPlaceholder)}</div></div>`}
              </div>
              <div class="cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.certifications)}</div>
                ${data.certifications.length ? data.certifications.map((cert) => `<div class="cv-export-cert-item"><div class="cv-export-item-title">${escapeHtml(cert.name || labels.certifications)}</div><div class="cv-export-item-sub">${escapeHtml([cert.issuer, cert.year].filter(Boolean).join(" - ") || labels.certificationsPlaceholder)}</div></div>`).join("") : `<div class="cv-export-panel"><div class="cv-export-paragraph">${escapeHtml(labels.certificationsPlaceholder)}</div></div>`}
              </div>
            </div>
            <div>
              <div class="cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.languages)}</div>
                ${data.languages.length ? data.languages.map((language) => `<div class="cv-export-lang-item"><div class="cv-export-item-title">${escapeHtml(language.lang || labels.languages)}</div><div class="cv-export-item-sub">${escapeHtml(language.level || labels.languagesPlaceholder)}</div></div>`).join("") : `<div class="cv-export-panel"><div class="cv-export-paragraph">${escapeHtml(labels.languagesPlaceholder)}</div></div>`}
              </div>
              <div class="cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.awards)}</div>
                ${data.awards.length ? data.awards.map((award) => `<div class="cv-export-cert-item"><div class="cv-export-item-title">${escapeHtml(award.name || labels.awards)}</div><div class="cv-export-item-sub">${escapeHtml([award.issuer, award.year].filter(Boolean).join(" - ") || labels.awardsPlaceholder)}</div></div>`).join("") : `<div class="cv-export-panel"><div class="cv-export-paragraph">${escapeHtml(labels.awardsPlaceholder)}</div></div>`}
              </div>
              <div class="cv-export-section">
                <div class="cv-export-section-title">${escapeHtml(labels.achievements)}</div>
                ${data.achievements.length ? `<ul class="cv-export-bullets">${data.achievements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<div class="cv-export-panel"><div class="cv-export-paragraph">${escapeHtml(labels.achievementsPlaceholder)}</div></div>`}
              </div>
            </div>
          </div>
          <div class="cv-export-footer">${escapeHtml(labels.page)} 2 / 2</div>
        </div>
      </div>
    </div>
  `;
}

function buildCvPdfDocument(cvData, exportLang = "en") {
  return buildCvPreviewDocument(cvData, exportLang);
}

function buildCvWordDocument(cvData, exportLang = "en") {
  const data = normalizeCvForExport(cvData);
  const labels = getCvExportLabels(exportLang);
  const contactLines = [data.phone, data.whatsapp ? `WhatsApp: ${data.whatsapp}` : "", data.email, [data.country, data.location].filter(Boolean).join(" - ")].filter(Boolean);
  const identityLines = [data.nationality ? `${labels.nationality}: ${data.nationality}` : "", data.maritalStatus ? `${labels.maritalStatus}: ${data.maritalStatus}` : "", data.iqama && data.iqamaStatus !== "none" ? `${data.iqamaStatus === "transferable" ? labels.transferableIqama : labels.iqama}: ${data.iqama}` : "", ...data.membershipLines].filter(Boolean);
  const experiences = [...data.firstPageExperiences, ...data.secondPageExperiences];
  const summaryLines = data.summaryLines.length ? data.summaryLines : [labels.summaryPlaceholder];
  const tools = [...data.toolsSoftware, ...data.keywords].filter(Boolean);
  const listHtml = (items, emptyLabel) => {
    const cleanItems = (items || []).filter(Boolean);
    if (!cleanItems.length) return `<p class="muted">${escapeHtml(emptyLabel)}</p>`;
    return `<ul>${cleanItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  };

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(data.fullName || labels.roleFallback)}</title>
        <style>
          body { font-family: 'Cairo', Arial, Helvetica, sans-serif; color: #1f2937; margin: 34px; direction:${labels.dir}; text-align:${labels.dir === "rtl" ? "right" : "left"}; }
          h1 { color: ${CV_EXPORT_ACCENT}; font-size: 24px; margin: 0 0 6px; ${labels.dir === "ltr" ? "text-transform: uppercase;" : ""} }
          h2 { color: ${CV_EXPORT_ACCENT}; font-size: 15px; margin: 22px 0 8px; border-top: 2px solid ${CV_EXPORT_BORDER}; padding-top: 8px; }
          h3 { font-size: 13px; margin: 0 0 4px; }
          p { margin: 0 0 6px; line-height: 1.6; font-size: 12px; }
          ul { margin: 6px 0 8px 20px; padding: 0; }
          li { margin-bottom: 4px; font-size: 12px; line-height: 1.45; }
          .role { color: ${CV_EXPORT_ACCENT}; font-size: 14px; font-weight: 700; margin-bottom: 10px; }
          .muted { color: #6b7280; }
          .exp { margin-bottom: 16px; }
          .company { font-weight: 700; }
          .dates { color: #475569; margin-bottom: 6px; }
        </style>
      </head>
      <body dir="${labels.dir}">
        <h1>${escapeHtml(data.fullName || labels.nameFallback)}</h1>
        <div class="role">${escapeHtml(data.jobTitle || labels.roleFallback)}</div>
        ${contactLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        ${identityLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        <h2>${escapeHtml(labels.summary)}</h2>
        ${summaryLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        <h2>${escapeHtml(labels.expertise)}</h2>
        <p>${escapeHtml(data.coreCompetencies.join(" | ") || labels.expertisePlaceholder)}</p>
        <h2>${escapeHtml(labels.experience)}</h2>
        ${experiences.length ? experiences.map((exp) => `<div class="exp"><h3>${escapeHtml(exp.jobTitle || labels.expFallback)}</h3><p class="company">${escapeHtml(exp.company || labels.companyFallback)}${exp.location ? ` - ${escapeHtml(exp.location)}` : ""}</p>${formatCvDateRange(exp, exportLang) ? `<p class="dates">${escapeHtml(formatCvDateRange(exp, exportLang))}</p>` : ""}${listHtml(exp.responsibilities, labels.experiencePlaceholder)}${exp.projects?.length ? `<p><strong>${escapeHtml(labels.projects)}:</strong></p>${listHtml(exp.projects.map((project) => { const details = [project.owner, project.location, project.cost].filter(Boolean).join(" | "); return `${project.name}${details ? ` - ${details}` : ""}`; }), labels.experiencePlaceholder)}` : ""}</div>`).join("") : `<p class="muted">${escapeHtml(labels.experiencePlaceholder)}</p>`}
        <h2>${escapeHtml(labels.achievements)}</h2>
        ${listHtml(data.achievements, labels.achievementsPlaceholder)}
        <h2>${escapeHtml(labels.tools)}</h2>
        <p>${escapeHtml(tools.join(" | ") || labels.toolsPlaceholder)}</p>
        <h2>${escapeHtml(labels.education)}</h2>
        ${data.education.length ? data.education.map((edu) => `<p><strong>${escapeHtml([edu.degree, edu.major].filter(Boolean).join(" - ") || labels.education)}</strong></p><p>${escapeHtml([edu.university, edu.year].filter(Boolean).join(" - ") || labels.educationPlaceholder)}</p>`).join("") : `<p class="muted">${escapeHtml(labels.educationPlaceholder)}</p>`}
        <h2>${escapeHtml(labels.certifications)}</h2>
        ${data.certifications.length ? data.certifications.map((cert) => `<p>${escapeHtml([cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ") || labels.certificationsPlaceholder)}</p>`).join("") : `<p class="muted">${escapeHtml(labels.certificationsPlaceholder)}</p>`}
        <h2>${escapeHtml(labels.awards)}</h2>
        ${data.awards.length ? data.awards.map((award) => `<p>${escapeHtml([award.name, award.issuer, award.year].filter(Boolean).join(" - ") || labels.awardsPlaceholder)}</p>`).join("") : `<p class="muted">${escapeHtml(labels.awardsPlaceholder)}</p>`}
        <h2>${escapeHtml(labels.languages)}</h2>
        ${data.languages.length ? data.languages.map((language) => `<p>${escapeHtml([language.lang, language.level].filter(Boolean).join(" - ") || labels.languagesPlaceholder)}</p>`).join("") : `<p class="muted">${escapeHtml(labels.languagesPlaceholder)}</p>`}
      </body>
    </html>
  `;
}

export { buildCvPdfDocument, buildCvPreviewDocument, buildCvWordDocument };