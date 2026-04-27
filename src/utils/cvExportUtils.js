export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeCvList(items) {
  return (items || []).map((item) => String(item || "").trim()).filter(Boolean);
}

export function getCvExportLabels(exportLang = "en") {
  return exportLang === "ar"
    ? {
        dir: "rtl",
        nameFallback: "الاسم الكامل",
        roleFallback: "المسمى الوظيفي",
        page: "صفحة",
        summary: "الملخص المهني",
        summaryPlaceholder: "سيظهر هنا ملخص مهني من البيانات التي أدخلها المستخدم.",
        provenRecord: "أبرز النقاط:",
        expertise: "المهارات الأساسية",
        expertisePlaceholder: "ستظهر هنا المهارات الأساسية بعد تعبئة النموذج.",
        experience: "الخبرات العملية",
        experiencePlaceholder: "ستظهر الخبرات العملية هنا بعد تعبئة النموذج.",
        achievements: "الإنجازات",
        achievementsPlaceholder: "أضف الإنجازات لتظهر هنا.",
        tools: "الأدوات والبرامج",
        toolsPlaceholder: "ستظهر الأدوات والبرامج هنا.",
        education: "التعليم",
        educationPlaceholder: "ستظهر بيانات التعليم هنا.",
        certifications: "الشهادات",
        certificationsPlaceholder: "ستظهر الشهادات هنا.",
        awards: "الجوائز والتكريمات",
        awardsPlaceholder: "ستظهر الجوائز هنا.",
        languages: "اللغات",
        projects: "المشاريع",
        nationality: "الجنسية",
        iqama: "الإقامة",
        transferableIqama: "إقامة قابلة للنقل",
        sce: "رقم هيئة المهندسين السعوديين",
        syndicate: "رقم نقابة المهندسين المصريين",
        present: "حتى الآن",
        companyFallback: "اسم الشركة",
        expFallback: "خبرة عملية",
      }
    : {
        dir: "ltr",
        nameFallback: "FULL NAME",
        roleFallback: "Professional Candidate",
        page: "Page",
        summary: "Professional Summary",
        summaryPlaceholder: "Professional candidate profile will appear here based on the entered details.",
        provenRecord: "Proven record of:",
        expertise: "Core Expertise",
        expertisePlaceholder: "Core expertise will be generated from the entered skills.",
        experience: "Professional Experience",
        experiencePlaceholder: "Your experience entries will appear here after filling them in the form.",
        achievements: "Key Achievements",
        achievementsPlaceholder: "Add achievements in the form to show them here.",
        tools: "Technical Tools",
        toolsPlaceholder: "Technical tools will appear here.",
        education: "Education",
        educationPlaceholder: "Education details will appear here.",
        certifications: "Certifications",
        certificationsPlaceholder: "Certifications will appear here.",
        awards: "Awards & Honors",
        awardsPlaceholder: "Awards and honors will appear here.",
        languages: "Languages",
        projects: "Projects",
        nationality: "Nationality",
        iqama: "Iqama",
        transferableIqama: "Transferable Iqama",
        sce: "Saudi Council of Engineers No",
        syndicate: "Egyptian Syndicate No",
        present: "Present",
        companyFallback: "Company Name",
        expFallback: "Professional Experience",
      };
}

export function formatCvDateRange(exp, exportLang = "en") {
  const labels = getCvExportLabels(exportLang);
  const start = String(exp?.startDate || "").trim();
  const end = exp?.current ? labels.present : String(exp?.endDate || "").trim();
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  return end || "";
}

const ARABIC_TO_LATIN_MAP = {
  "ا": "a", "أ": "a", "إ": "e", "آ": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
  "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z",
  "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w",
  "ي": "y", "ى": "a", "ة": "a", "ئ": "e", "ؤ": "o", "ء": "", "ﻻ": "la",
};

const OFFICE_TERM_REPLACEMENTS = [
  [/شقة رقم/gi, "Apt No."],
  [/شقة/gi, "Apt"],
  [/الدور/gi, "Floor"],
  [/دور/gi, "Floor"],
  [/عمارة/gi, "Building"],
  [/برج/gi, "Tower"],
  [/شارع/gi, "Street"],
  [/ش /gi, "St. "],
  [/ش-/gi, "St. "],
  [/ميدان/gi, "Square"],
  [/امام/gi, "Opposite"],
  [/خلف/gi, "Behind"],
  [/بجوار/gi, "Next to"],
  [/قسم/gi, "District"],
  [/حي/gi, "Area"],
  [/مدينة نصر/gi, "Nasr City"],
  [/مصر الجديدة/gi, "Heliopolis"],
  [/السيدة زينب/gi, "Sayeda Zeinab"],
  [/مصر القديمة/gi, "Old Cairo"],
  [/جاردن سيتي/gi, "Garden City"],
  [/قصر النيل/gi, "Qasr El Nil"],
  [/الازبكية/gi, "Azbakeya"],
  [/العباسية/gi, "Abbassia"],
  [/المنيل/gi, "Manial"],
  [/الروضة/gi, "Rawda"],
  [/المعادي/gi, "Maadi"],
  [/الزمالك/gi, "Zamalek"],
  [/حلوان/gi, "Helwan"],
  [/شبرا/gi, "Shobra"],
  [/القاهرة/gi, "Cairo"],
  [/الجيزة/gi, "Giza"],
  [/الإسكندرية/gi, "Alexandria"],
];

export function transliterateArabicText(value = "") {
  return String(value)
    .split("")
    .map((char) => {
      if (ARABIC_TO_LATIN_MAP[char] !== undefined) return ARABIC_TO_LATIN_MAP[char];
      return char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCaseEnglish(value = "") {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getOfficeEnglishText(value = "") {
  let output = transliterateArabicText(value);
  OFFICE_TERM_REPLACEMENTS.forEach(([pattern, replacement]) => {
    output = output.replace(pattern, replacement);
  });
  output = output
    .replace(/\bapt no\./gi, "Apt No.")
    .replace(/\bapt\b/gi, "Apt")
    .replace(/\bfloor\b/gi, "Floor")
    .replace(/\bst\.\s*\./gi, "St.")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return titleCaseEnglish(output);
}

export function getCompanyMark(company = "") {
  const cleaned = company.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (!parts.length) return "CV";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "CV";
}

export function splitSummaryIntoLines(summary = "") {
  return String(summary)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function splitSummaryIntoBullets(summary = "") {
  return String(summary)
    .split(/[.\n]+/)
    .map((line) => line.replace(/^[•\-]\s*/, "").trim())
    .filter((line) => line.length > 18)
    .slice(0, 4);
}

export function normalizeCvForPdf(cvData) {
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
    memberships: (cvData?.memberships || []).filter(m => !m.hasNo && String(m?.name || "").trim().length > 0).map(m => ({
      name: String(m?.name || "").trim(),
      number: String(m?.number || "").trim(),
    })),
    extraMemberships: (cvData?.memberships || []).filter(m => !m.hasNo && String(m?.name || "").trim().length > 0).map(m => {
      const num = String(m?.number || "").trim();
      return `${String(m?.name || "").trim()}${num ? `: ${num}` : ""}`;
    }),
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
    languages: (cvData?.languages || []).filter((lang) => lang?.lang || lang?.level),
    keywords: sanitizeCvList(String(cvData?.keywords || "").split(",")),
  };
}

export function renderCvPdfExperience(exp, exportLang = "en") {
  const labels = getCvExportLabels(exportLang);
  const bulletItems = exp.responsibilities
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const projectItems = exp.projects.length
    ? `
      <div class="cv-projects-title">${escapeHtml(labels.projects)}:</div>
      <ul class="cv-project-list">
        ${exp.projects.map((project) => {
          const details = [project.owner, project.location, project.cost].filter(Boolean).join(" | ");
          return `<li>${escapeHtml(project.name)}${details ? ` — ${escapeHtml(details)}` : ""}</li>`;
        }).join("")}
      </ul>
    `
    : "";

  return `
    <div class="cv-exp-item">
      <div class="cv-exp-copy">
        <div class="cv-exp-title">${escapeHtml(exp.jobTitle || labels.expFallback)}</div>
        <div class="cv-exp-company">${escapeHtml(exp.company || labels.companyFallback)}${exp.location ? `, ${escapeHtml(exp.location)}` : ""}</div>
        ${formatCvDateRange(exp, exportLang) ? `<div class="cv-exp-dates">${escapeHtml(formatCvDateRange(exp, exportLang))}</div>` : ""}
        ${bulletItems ? `<ul class="cv-bullets">${bulletItems}</ul>` : ""}
        ${projectItems}
      </div>
      <div class="cv-exp-mark">${escapeHtml(getCompanyMark(exp.company))}</div>
    </div>
  `;
}

export function buildCvPdfDocument(cvData, exportLang = "en") {
  const data = normalizeCvForPdf(cvData);
  const labels = getCvExportLabels(exportLang);
  const contactLines = [
    data.country,
    data.location,
    data.phone,
    data.whatsapp ? `WhatsApp: ${data.whatsapp}` : "",
    data.email,
  ].filter(Boolean);

  const identityLines = [
    data.nationality ? `${labels.nationality}: ${data.nationality}` : "",
    data.iqama && data.iqamaStatus !== "none" ? `${data.iqamaStatus === "transferable" ? labels.transferableIqama : labels.iqama}: ${data.iqama}` : "",
    ...data.extraMemberships,
  ].filter(Boolean);

  const summaryParagraph = data.summaryLines.length
    ? data.summaryLines.map((line) => `<div class="cv-summary-line">${escapeHtml(line)}</div>`).join("")
    : `<div class="cv-muted-line">${escapeHtml(labels.summaryPlaceholder)}</div>`;

  const summaryBullets = data.achievements.length
    ? `<ul class="cv-bullets">${data.achievements.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : (data.summaryBullets.length
      ? `<ul class="cv-bullets">${data.summaryBullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "");

  const expertiseChips = data.coreCompetencies.length
    ? data.coreCompetencies.map((item) => `<span class="cv-chip">${escapeHtml(item)}</span>`).join("")
    : `<div class="cv-muted-line">${escapeHtml(labels.expertisePlaceholder)}</div>`;

  const toolsSection = [...data.toolsSoftware, ...data.keywords].filter(Boolean);
  const toolChips = toolsSection.length
    ? toolsSection.map((item) => `<span class="cv-chip cv-chip-soft">${escapeHtml(item)}</span>`).join("")
    : `<div class="cv-muted-line">${escapeHtml(labels.toolsPlaceholder)}</div>`;

  const contactPills = contactLines.length
    ? contactLines.map((line) => `<span class="cv-contact-pill">${escapeHtml(line)}</span>`).join("")
    : `<span class="cv-contact-pill">${escapeHtml(labels.roleFallback)}</span>`;

  const renderListOrPlaceholder = (items, placeholder, className = "cv-simple-line") => (
    items.length
      ? items.map((item) => `<div class="${className}">${escapeHtml(item)}</div>`).join("")
      : `<div class="cv-muted-line">${escapeHtml(placeholder)}</div>`
  );

  return `
    <style>
      .cv-pdf-shell {
        width: 794px;
        background: linear-gradient(160deg, #e9f1fb 0%, #e3ecf8 100%);
        padding: 20px 0;
        font-family: 'Cairo', Arial, Helvetica, sans-serif;
        direction:${labels.dir};
      }
      .cv-pdf-page {
        width: 595px;
        min-height: 842px;
        background: #ffffff;
        margin: 0 auto 16px;
        box-sizing: border-box;
        padding: 26px 26px 24px;
        color: #172033;
        position: relative;
        box-shadow: 0 20px 44px rgba(15, 23, 42, 0.10), 0 0 0 1px rgba(15, 23, 42, 0.07);
        overflow: hidden;
        direction:${labels.dir};
        text-align:${labels.dir === "rtl" ? "right" : "left"};
      }
      .cv-page-accent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: linear-gradient(90deg, #1f4e8f, #2c74c9, #5fa8ff);
      }
      .cv-hero {
        border: 1px solid #dbe5f2;
        border-radius: 16px;
        padding: 14px 14px 12px;
        background: linear-gradient(145deg, #f7fafe 0%, #edf3fb 100%);
        margin-bottom: 12px;
      }
      .cv-name {
        font-size: 20px;
        font-weight: 900;
        color: ${CV_PDF_SECTION_COLOR};
        letter-spacing: 0.2px;
        margin-bottom: 4px;
        ${labels.dir === "ltr" ? "text-transform: uppercase;" : ""}
      }
      .cv-role {
        font-size: 11px;
        font-weight: 800;
        color: #2f4768;
        margin-bottom: 10px;
      }
      .cv-contact-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cv-contact-pill {
        font-size: 9px;
        font-weight: 700;
        color: #244368;
        border: 1px solid #c5d8ee;
        background: #ffffff;
        border-radius: 999px;
        padding: 4px 9px;
        line-height: 1.2;
      }
      .cv-layout {
        display: grid;
        grid-template-columns: ${labels.dir === "rtl" ? "1fr 208px" : "208px 1fr"};
        gap: 10px;
        align-items: start;
      }
      .cv-sidebar {
        border: 1px solid #d8e3f1;
        border-radius: 14px;
        background: #f8fbff;
        padding: 10px 9px;
      }
      .cv-main {
        border: 1px solid #e3ebf6;
        border-radius: 14px;
        background: #ffffff;
        padding: 10px 11px;
      }
      .cv-summary-line, .cv-simple-line, .cv-edu-line, .cv-cert-line, .cv-lang-line {
        font-size: 9px;
        line-height: 1.55;
        margin-bottom: 3px;
        color: #1f2f46;
      }
      .cv-muted-line {
        font-size: 9px;
        line-height: 1.5;
        color: #5f6f84;
      }
      .cv-section { margin-top: 10px; }
      .cv-section:first-child { margin-top: 0; }
      .cv-section-title {
        font-size: 10px;
        font-weight: 800;
        color: ${CV_PDF_SECTION_COLOR};
        text-transform: uppercase;
        border-bottom: 1px solid #d6e2f2;
        padding-bottom: 4px;
        margin-bottom: 6px;
        letter-spacing: 0.2px;
      }
      .cv-chip-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .cv-chip {
        display: inline-flex;
        align-items: center;
        font-size: 8.5px;
        font-weight: 700;
        color: #1f4c82;
        border: 1px solid #c7daf0;
        background: #eef5ff;
        border-radius: 999px;
        padding: 3px 7px;
        line-height: 1.2;
      }
      .cv-chip-soft {
        color: #2b4b6d;
        border-color: #d7e4f3;
        background: #f4f8fd;
      }
      .cv-bullets, .cv-project-list {
        margin: 4px ${labels.dir === "rtl" ? "16px 0 0" : "0 0 0 16px"};
        padding: 0;
        font-size: 9px;
        line-height: 1.5;
        color: #22344e;
      }
      .cv-bullets li, .cv-project-list li { margin-bottom: 3px; }
      .cv-exp-item {
        border: 1px solid #d8e3f1;
        border-radius: 11px;
        background: linear-gradient(145deg, #ffffff 0%, #f9fbff 100%);
        padding: 9px 9px;
        margin-top: 8px;
        display: flex;
        flex-direction:${labels.dir === "rtl" ? "row-reverse" : "row"};
        gap: 10px;
        align-items: flex-start;
      }
      .cv-exp-copy { flex: 1; min-width: 0; }
      .cv-exp-title { font-size: 9.5px; font-weight: 800; color: #13243b; margin-bottom: 2px; }
      .cv-exp-company { font-size: 9px; font-weight: 700; color: #294767; margin-bottom: 1px; }
      .cv-exp-dates { font-size: 8.5px; color: #576a83; margin-bottom: 4px; }
      .cv-projects-title { font-size: 8.8px; font-weight: 800; margin-top: 5px; color: #2f4768; }
      .cv-exp-mark {
        flex-shrink: 0;
        width: 52px;
        height: 24px;
        border: 1px solid #c4d6ec;
        color: #1f4c82;
        background: #eef5ff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 800;
        border-radius: 999px;
        margin-top: 3px;
      }
      .cv-split-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .cv-card {
        border: 1px solid #dbe6f4;
        border-radius: 11px;
        background: #f9fbff;
        padding: 8px 9px;
      }
      .cv-footer {
        position: absolute;
        left: 26px;
        right: 26px;
        bottom: 11px;
        font-size: 8.5px;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cv-footer-brand {
        font-weight: 700;
        color: #2f4768;
      }
    </style>
    <div class="cv-pdf-shell">
      <div class="cv-pdf-page cv-pdf-page-node">
        <div class="cv-page-accent"></div>
        <div class="cv-hero">
          <div class="cv-name">${escapeHtml(data.fullName || labels.nameFallback)}</div>
          <div class="cv-role">${escapeHtml(data.jobTitle || labels.roleFallback)}</div>
          <div class="cv-contact-grid">${contactPills}</div>
        </div>

        <div class="cv-layout">
          <div class="cv-sidebar">
            <div class="cv-section">
              <div class="cv-section-title">${escapeHtml(labels.nationality)}</div>
              ${identityLines.length
                ? identityLines.map((line) => `<div class="cv-simple-line">${escapeHtml(line)}</div>`).join("")
                : `<div class="cv-muted-line">${escapeHtml(labels.nationality)}: -</div>`}
            </div>

            <div class="cv-section">
              <div class="cv-section-title">${escapeHtml(labels.expertise)}</div>
              <div class="cv-chip-wrap">${expertiseChips}</div>
            </div>

            <div class="cv-section">
              <div class="cv-section-title">${escapeHtml(labels.tools)}</div>
              <div class="cv-chip-wrap">${toolChips}</div>
            </div>
          </div>

          <div class="cv-main">
            <div class="cv-section">
              <div class="cv-section-title">${escapeHtml(labels.summary)}</div>
              ${summaryParagraph}
              ${summaryBullets}
            </div>

            <div class="cv-section">
              <div class="cv-section-title">${escapeHtml(labels.experience)}</div>
              ${data.firstPageExperiences.length
                ? data.firstPageExperiences.map((exp) => renderCvPdfExperience(exp, exportLang)).join("")
                : `<div class="cv-muted-line">${escapeHtml(labels.experiencePlaceholder)}</div>`}
            </div>
          </div>
        </div>

        <div class="cv-footer">
          <span class="cv-footer-brand">Trusted Offices CV</span>
          <span>${escapeHtml(labels.page)} 1 / 2</span>
        </div>
      </div>

      <div class="cv-pdf-page cv-pdf-page-node">
        <div class="cv-page-accent"></div>

        ${data.secondPageExperiences.length ? `
          <div class="cv-section">
            <div class="cv-section-title">${escapeHtml(labels.experience)}</div>
            ${data.secondPageExperiences.map((exp) => renderCvPdfExperience(exp, exportLang)).join("")}
          </div>
        ` : ""}

        <div class="cv-split-grid">
          <div class="cv-card">
            <div class="cv-section-title">${escapeHtml(labels.achievements)}</div>
            ${data.achievements.length
              ? `<ul class="cv-bullets">${data.achievements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : `<div class="cv-muted-line">${escapeHtml(labels.achievementsPlaceholder)}</div>`}
          </div>

          <div class="cv-card">
            <div class="cv-section-title">${escapeHtml(labels.languages)}</div>
            ${data.languages.length
              ? data.languages.map((langItem) => `<div class="cv-lang-line">${escapeHtml(langItem.lang)}${langItem.level ? ` - ${escapeHtml(langItem.level)}` : ""}</div>`).join("")
              : `<div class="cv-muted-line">${escapeHtml(labels.languages)}: -</div>`}
          </div>

          <div class="cv-card">
            <div class="cv-section-title">${escapeHtml(labels.education)}</div>
            ${data.education.length
              ? data.education.map((edu) => `<div class="cv-edu-line">${escapeHtml([edu.degree, edu.major].filter(Boolean).join(" - "))}</div><div class="cv-edu-line">${escapeHtml([edu.university, edu.year].filter(Boolean).join(" - "))}</div>`).join("")
              : `<div class="cv-muted-line">${escapeHtml(labels.educationPlaceholder)}</div>`}
          </div>

          <div class="cv-card">
            <div class="cv-section-title">${escapeHtml(labels.certifications)}</div>
            ${data.certifications.length
              ? data.certifications.map((cert) => `<div class="cv-cert-line">${escapeHtml([cert.name, cert.issuer, cert.year].filter(Boolean).join(" - "))}</div>`).join("")
              : `<div class="cv-muted-line">${escapeHtml(labels.certificationsPlaceholder)}</div>`}
          </div>
        </div>

        <div class="cv-section">
          <div class="cv-section-title">${escapeHtml(labels.awards)}</div>
          ${renderListOrPlaceholder(
            data.awards.map((award) => [award.name, award.issuer, award.year].filter(Boolean).join(" - ")),
            labels.awardsPlaceholder,
            "cv-cert-line"
          )}
        </div>

        <div class="cv-footer">
          <span class="cv-footer-brand">Trusted Offices CV</span>
          <span>${escapeHtml(labels.page)} 2 / 2</span>
        </div>
      </div>
    </div>
  `;
}

export function createCvPdfDocument(JsPdfCtor, cvData) {
  const data = normalizeCvForPdf(cvData);
  const pdf = new JsPdfCtor({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 44;
  const topMargin = 42;
  const bottomMargin = 34;
  const contentWidth = pageWidth - (marginX * 2);
  const rightColWidth = 58;
  const leftColWidth = contentWidth - rightColWidth - 12;
  let cursorY = topMargin;

  const addPage = () => {
    pdf.addPage();
    cursorY = topMargin;
  };

  const ensureSpace = (requiredHeight = 24) => {
    if (cursorY + requiredHeight > pageHeight - bottomMargin) addPage();
  };

  const drawPageFooter = () => {
    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Page ${page} of ${pages}`, pageWidth - marginX, pageHeight - 14, { align: "right" });
    }
  };

  const writeWrapped = (text, options = {}) => {
    const {
      x = marginX,
      width = contentWidth,
      fontSize = 10,
      lineHeight = 14,
      color = [31, 41, 55],
      fontStyle = "normal",
      gapAfter = 0,
    } = options;
    const safeText = String(text || "").trim();
    if (!safeText) return 0;
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(safeText, width);
    ensureSpace(lines.length * lineHeight + gapAfter);
    pdf.text(lines, x, cursorY);
    const used = lines.length * lineHeight;
    cursorY += used + gapAfter;
    return used;
  };

  const drawDividerTitle = (title) => {
    ensureSpace(28);
    pdf.setDrawColor(185, 194, 205);
    pdf.setLineWidth(1.2);
    pdf.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 12;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(47, 111, 179);
    pdf.text(String(title || "").toUpperCase(), marginX, cursorY);
    cursorY += 10;
  };

  const drawBulletList = (items, options = {}) => {
    const {
      x = marginX + 10,
      width = contentWidth - 10,
      fontSize = 10,
      lineHeight = 13,
      color = [31, 41, 55],
    } = options;
    (items || []).forEach((item) => {
      const safeItem = String(item || "").trim();
      if (!safeItem) return;
      const lines = pdf.splitTextToSize(safeItem, width - 12);
      ensureSpace(lines.length * lineHeight + 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);
      pdf.setTextColor(...color);
      pdf.text("•", x, cursorY);
      pdf.text(lines, x + 10, cursorY);
      cursorY += (lines.length * lineHeight) + 2;
    });
  };

  const drawExperience = (exp) => {
    const responsibilities = sanitizeCvList(exp?.responsibilities);
    const projects = (exp?.projects || []).map((project) => {
      const details = [project.owner, project.location, project.cost].filter(Boolean).join(" | ");
      return `${project.name}${details ? ` - ${details}` : ""}`;
    }).filter(Boolean);
    const title = String(exp?.jobTitle || "Professional Experience").trim();
    const company = `${String(exp?.company || "Company Name").trim()}${exp?.location ? `, ${String(exp.location).trim()}` : ""}`;
    const dates = formatCvDateRange(exp);
    const totalLinesEstimate =
      4 +
      responsibilities.length +
      projects.length +
      Math.ceil(title.length / 60) +
      Math.ceil(company.length / 65);

    ensureSpace(Math.max(64, totalLinesEstimate * 12));
    pdf.setDrawColor(185, 194, 205);
    pdf.setLineWidth(1.1);
    pdf.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 10;

    const blockStartY = cursorY;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(17, 24, 39);
    const titleLines = pdf.splitTextToSize(title, leftColWidth);
    pdf.text(titleLines, marginX, cursorY);
    cursorY += titleLines.length * 12;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(31, 41, 55);
    const companyLines = pdf.splitTextToSize(company, leftColWidth);
    pdf.text(companyLines, marginX, cursorY);
    cursorY += companyLines.length * 12;

    if (dates) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text(dates, marginX, cursorY);
      cursorY += 13;
    }

    drawBulletList(responsibilities, { x: marginX + 10, width: leftColWidth - 10 });

    if (projects.length) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(31, 41, 55);
      ensureSpace(16);
      pdf.text("Projects:", marginX, cursorY);
      cursorY += 12;
      drawBulletList(projects, { x: marginX + 10, width: leftColWidth - 10 });
    }

    const badgeX = pageWidth - marginX - rightColWidth;
    const badgeY = blockStartY + 2;
    pdf.setDrawColor(215, 222, 231);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(badgeX, badgeY, rightColWidth, 22, 2, 2, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(75, 85, 99);
    pdf.text(getCompanyMark(exp?.company), badgeX + (rightColWidth / 2), badgeY + 14, { align: "center" });

    cursorY += 2;
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(47, 111, 179);
  pdf.text(data.fullName || "FULL NAME", marginX, cursorY);
  cursorY += 18;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(47, 111, 179);
  pdf.text(data.jobTitle || "Professional Candidate", marginX, cursorY);
  cursorY += 14;

  [data.location, data.phone, data.email].filter(Boolean).forEach((line) => {
    writeWrapped(line, { fontSize: 10, lineHeight: 13, gapAfter: 1 });
  });

  [
    data.nationality ? `Nationality: ${data.nationality}` : "",
    data.iqama && data.iqamaStatus !== "none" ? `${data.iqamaStatus === "transferable" ? "Transferable Iqama" : "Iqama"}: ${data.iqama}` : "",
    ...data.extraMemberships,
  ].filter(Boolean).forEach((line) => {
    writeWrapped(line, { fontSize: 10, lineHeight: 13, gapAfter: 1 });
  });

  drawDividerTitle("Professional Summary");
  const summaryLines = data.summaryLines.length
    ? data.summaryLines
    : ["Professional candidate profile will appear here based on the entered details."];
  summaryLines.forEach((line) => writeWrapped(line, { fontSize: 10, lineHeight: 13, gapAfter: 2 }));

  if (data.achievements.length) {
    writeWrapped("Proven record of:", { fontSize: 10, fontStyle: "bold", lineHeight: 13, gapAfter: 2 });
    drawBulletList(data.achievements.slice(0, 4));
  } else if (data.summaryBullets.length) {
    drawBulletList(data.summaryBullets);
  }

  drawDividerTitle("Core Expertise");
  writeWrapped(
    data.coreCompetencies.length
      ? data.coreCompetencies.join(" | ")
      : "Core expertise will be generated from the entered skills.",
    { fontSize: 10, lineHeight: 13, gapAfter: 2 }
  );

  drawDividerTitle("Professional Experience");
  if (data.firstPageExperiences.length || data.secondPageExperiences.length) {
    [...data.firstPageExperiences, ...data.secondPageExperiences].forEach(drawExperience);
  } else {
    writeWrapped("Your experience entries will appear here after filling them in the form.", { fontSize: 10, lineHeight: 13 });
  }

  drawDividerTitle("Key Achievements");
  if (data.achievements.length) {
    drawBulletList(data.achievements);
  } else {
    writeWrapped("Add achievements in the form to show them here.", { fontSize: 10, lineHeight: 13 });
  }

  drawDividerTitle("Technical Tools");
  writeWrapped(
    [...data.toolsSoftware, ...data.keywords].filter(Boolean).join(" | ") || "Technical tools will appear here.",
    { fontSize: 10, lineHeight: 13 }
  );

  drawDividerTitle("Education");
  if (data.education.length) {
    data.education.forEach((edu) => {
      const line = [edu.degree, edu.major].filter(Boolean).join(" - ");
      const subLine = [edu.university, edu.year].filter(Boolean).join(" - ");
      if (line) writeWrapped(line, { fontSize: 10, fontStyle: "bold", lineHeight: 13, gapAfter: 1 });
      if (subLine) writeWrapped(subLine, { fontSize: 10, lineHeight: 13, gapAfter: 4 });
    });
  } else {
    writeWrapped("Education details will appear here.", { fontSize: 10, lineHeight: 13 });
  }

  drawDividerTitle("Certifications");
  if (data.certifications.length) {
    data.certifications.forEach((cert) => {
      const line = [cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ");
      writeWrapped(line, { fontSize: 10, lineHeight: 13, gapAfter: 3 });
    });
  } else {
    writeWrapped("Certifications will appear here.", { fontSize: 10, lineHeight: 13 });
  }

  drawDividerTitle("Awards & Honors");
  if (data.awards.length) {
    data.awards.forEach((award) => {
      const line = [award.name, award.issuer, award.year].filter(Boolean).join(" - ");
      writeWrapped(line, { fontSize: 10, lineHeight: 13, gapAfter: 3 });
    });
  } else {
    writeWrapped("Awards and honors will appear here.", { fontSize: 10, lineHeight: 13 });
  }

  if (data.languages.length) {
    drawDividerTitle("Languages");
    data.languages.forEach((language) => {
      const line = [language.lang, language.level].filter(Boolean).join(" - ");
      writeWrapped(line, { fontSize: 10, lineHeight: 13, gapAfter: 3 });
    });
  }

  drawPageFooter();
  return pdf;
}

export function buildCvSubmissionEmail(cvData, orderMeta = {}) {
  const data = normalizeCvForPdf(cvData);
  const experiences = [...data.firstPageExperiences, ...data.secondPageExperiences];
  const sections = [];

  const orderNumber = String(orderMeta?.orderNumber || "").trim();
  const orderSerial = String(orderMeta?.serial || "").trim();
  if (orderNumber || orderSerial) {
    sections.push(`رقم الطلب: ${orderNumber || "-"}`);
    sections.push(`السيريال: ${orderSerial || "-"}`);
    sections.push("");
  }

  sections.push(`الاسم الكامل: ${data.fullName || "-"}`);
  sections.push(`المسمى الوظيفي: ${data.jobTitle || "-"}`);
  sections.push(`الدولة: ${data.country || "-"}`);
  sections.push(`المدينة / الموقع: ${data.location || "-"}`);
  sections.push(`رقم الموبايل: ${data.phone || "-"}`);
  sections.push(`رقم الواتساب: ${data.whatsapp || "-"}`);
  sections.push(`البريد الإلكتروني: ${data.email || "-"}`);
  sections.push(`الجنسية: ${data.nationality || "-"}`);
  sections.push(`الحالة الاجتماعية: ${data.maritalStatus || "-"}`);
  if (data.iqamaStatus !== "none") {
    sections.push(`رقم الإقامة / الهوية: ${data.iqama || "-"}`);
    sections.push(`حالة الإقامة: ${data.iqamaStatus === "transferable" ? "قابلة للنقل" : "غير قابلة للنقل"}`);
  }
  if (data.memberships && data.memberships.length > 0) {
    sections.push("العضويات المهنية:");
    sections.push(data.memberships.map(m => `${m.name}${m.number ? ` (${m.number})` : ""}`).join("\n"));
  }
  sections.push("");
  sections.push("الملخص المهني:");
  sections.push(data.summaryLines.length ? data.summaryLines.join("\n") : "-");
  sections.push("");
  sections.push("المهارات الأساسية:");
  sections.push(data.coreCompetencies.length ? data.coreCompetencies.join(" | ") : "-");
  sections.push("");
  sections.push("الأدوات والبرامج:");
  sections.push(data.toolsSoftware.length ? data.toolsSoftware.join(" | ") : "-");
  sections.push("");
  sections.push("الكلمات المفتاحية ATS:");
  sections.push(data.keywords.length ? data.keywords.join(" | ") : "-");
  sections.push("");
  sections.push("الإنجازات:");
  sections.push(data.achievements.length ? data.achievements.map((item, index) => `${index + 1}. ${item}`).join("\n") : "-");
  sections.push("");
  sections.push("الخبرات العملية:");
  sections.push(experiences.length ? experiences.map((exp, index) => {
    const projects = (exp.projects || []).length
      ? `\nالمشاريع:\n${exp.projects.map((project, projectIndex) => {
          const details = [project.owner, project.location, project.cost].filter(Boolean).join(" | ");
          return `  - ${projectIndex + 1}) ${project.name || "-"}${details ? ` - ${details}` : ""}`;
        }).join("\n")}`
      : "";
    return [
      `${index + 1}) ${exp.jobTitle || "-"}`,
      `الشركة: ${exp.company || "-"}`,
      `الموقع: ${exp.location || "-"}`,
      `الفترة: ${formatCvDateRange(exp) || "-"}`,
      `المهام: ${(exp.responsibilities || []).filter(Boolean).length ? exp.responsibilities.filter(Boolean).map((item) => `- ${item}`).join("\n") : "-"}`,
      projects,
    ].filter(Boolean).join("\n");
  }).join("\n\n") : "-");
  sections.push("");
  sections.push("التعليم:");
  sections.push(data.education.length ? data.education.map((edu, index) => `${index + 1}) ${[edu.degree, edu.major, edu.university, edu.year].filter(Boolean).join(" - ")}`).join("\n") : "-");
  sections.push("");
  sections.push("الشهادات:");
  sections.push(data.certifications.length ? data.certifications.map((cert, index) => `${index + 1}) ${[cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ")}`).join("\n") : "-");
  sections.push("");
  sections.push("الجوائز والتكريمات:");
  sections.push(data.awards.length ? data.awards.map((award, index) => `${index + 1}) ${[award.name, award.issuer, award.year].filter(Boolean).join(" - ")}`).join("\n") : "-");
  sections.push("");
  sections.push("اللغات:");
  sections.push(data.languages.length ? data.languages.map((language, index) => `${index + 1}) ${[language.lang, language.level].filter(Boolean).join(" - ")}`).join("\n") : "-");

  return {
    subject: `طلب تجهيز سيرة ذاتية - ${data.fullName || "مستخدم جديد"}`,
    body: sections.join("\n"),
  };
}

export function buildCvWordDocument(cvData, exportLang = "en") {
  const data = normalizeCvForPdf(cvData);
  const labels = getCvExportLabels(exportLang);
  const contactLines = [data.country, data.location, data.phone, data.whatsapp ? `WhatsApp: ${data.whatsapp}` : "", data.email].filter(Boolean);
  const identityLines = [
    data.nationality ? `${labels.nationality}: ${data.nationality}` : "",
    data.iqama && data.iqamaStatus !== "none" ? `${data.iqamaStatus === "transferable" ? labels.transferableIqama : labels.iqama}: ${data.iqama}` : "",
    ...data.extraMemberships,
  ].filter(Boolean);
  const experiences = [...data.firstPageExperiences, ...data.secondPageExperiences];
  const summaryLines = data.summaryLines.length ? data.summaryLines : [labels.summaryPlaceholder];
  const tools = [...data.toolsSoftware, ...data.keywords].filter(Boolean);

  const listHtml = (items) => {
    const clean = (items || []).filter(Boolean);
    if (!clean.length) return `<p class="muted">No data added yet.</p>`;
    return `<ul>${clean.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  };

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(data.fullName || labels.roleFallback)}</title>
        <style>
          body { font-family: 'Cairo', Arial, Helvetica, sans-serif; color: #1f2937; margin: 36px; direction:${labels.dir}; text-align:${labels.dir === "rtl" ? "right" : "left"}; }
          h1 { color: #2f6fb3; font-size: 24px; margin: 0 0 8px; ${labels.dir === "ltr" ? "text-transform: uppercase;" : ""} }
          h2 { color: #2f6fb3; font-size: 15px; margin: 24px 0 10px; ${labels.dir === "ltr" ? "text-transform: uppercase;" : ""} border-top: 2px solid #b9c2cd; padding-top: 8px; }
          h3 { font-size: 14px; margin: 0 0 4px; }
          p { margin: 0 0 6px; line-height: 1.5; font-size: 12px; }
          ul { margin: 6px 0 8px 20px; padding: 0; }
          li { margin-bottom: 4px; font-size: 12px; line-height: 1.45; }
          .role { color: #2f6fb3; font-size: 14px; font-weight: 700; margin-bottom: 10px; }
          .muted { color: #6b7280; }
          .exp { margin-bottom: 18px; }
          .company { font-weight: 700; }
          .dates { color: #374151; margin-bottom: 6px; }
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
        ${experiences.length ? experiences.map((exp) => `
          <div class="exp">
            <h3>${escapeHtml(exp.jobTitle || labels.expFallback)}</h3>
            <p class="company">${escapeHtml(exp.company || labels.companyFallback)}${exp.location ? `, ${escapeHtml(exp.location)}` : ""}</p>
            ${formatCvDateRange(exp, exportLang) ? `<p class="dates">${escapeHtml(formatCvDateRange(exp, exportLang))}</p>` : ""}
            ${listHtml(exp.responsibilities)}
            ${exp.projects?.length ? `<p><strong>${escapeHtml(labels.projects)}:</strong></p>${listHtml(exp.projects.map((project) => {
              const details = [project.owner, project.location, project.cost].filter(Boolean).join(" | ");
              return `${project.name}${details ? ` - ${details}` : ""}`;
            }))}` : ""}
          </div>
        `).join("") : `<p class="muted">${escapeHtml(labels.experiencePlaceholder)}</p>`}

        <h2>${escapeHtml(labels.achievements)}</h2>
        ${listHtml(data.achievements)}

        <h2>${escapeHtml(labels.tools)}</h2>
        <p>${escapeHtml(tools.join(" | ") || labels.toolsPlaceholder)}</p>

        <h2>${escapeHtml(labels.education)}</h2>
        ${data.education.length ? data.education.map((edu) => `
          <p><strong>${escapeHtml([edu.degree, edu.major].filter(Boolean).join(" - "))}</strong></p>
          <p>${escapeHtml([edu.university, edu.year].filter(Boolean).join(" - "))}</p>
        `).join("") : `<p class="muted">${escapeHtml(labels.educationPlaceholder)}</p>`}

        <h2>${escapeHtml(labels.certifications)}</h2>
        ${data.certifications.length ? data.certifications.map((cert) => `
          <p>${escapeHtml([cert.name, cert.issuer, cert.year].filter(Boolean).join(" - "))}</p>
        `).join("") : `<p class="muted">${escapeHtml(labels.certificationsPlaceholder)}</p>`}

        <h2>${escapeHtml(labels.awards)}</h2>
        ${data.awards.length ? data.awards.map((award) => `
          <p>${escapeHtml([award.name, award.issuer, award.year].filter(Boolean).join(" - "))}</p>
        `).join("") : `<p class="muted">${escapeHtml(labels.awardsPlaceholder)}</p>`}

        ${data.languages.length ? `
          <h2>${escapeHtml(labels.languages)}</h2>
          ${data.languages.map((language) => `<p>${escapeHtml([language.lang, language.level].filter(Boolean).join(" - "))}</p>`).join("")}
        ` : ""}
      </body>
    </html>
  `;
}

