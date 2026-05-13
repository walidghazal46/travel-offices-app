import React, { useState, useRef } from "react";

const CATS = [
  {
    id: "admin", icon: "🏢", color: "#dc2626", bg: "#fef2f2",
    title: "المهن الإدارية والقيادية",
    subtitle: "مهن مقصورة بالكامل على المواطنين السعوديين — تشمل الإدارة العامة وشؤون الموظفين",
    items: [
      "مدير موارد بشرية", "مدير شؤون موظفين", "مدير علاقات عامة",
      "مدير تدريب وتطوير", "كاتب شؤون موظفين", "كاتب توظيف",
      "كاتب دوام", "كاتب إدخال بيانات", "كاتب استقبال عام",
      "كاتب شكاوى", "سكرتير تنفيذي", "مساعد إداري",
    ],
    note: { icon: "🚫", color: "#991b1b", bg: "#fef2f2", border: "#ef4444", text: "هذه المهن مسعودة بنسبة 100% ولا يمكن إصدار تأشيرات استقدام عليها أو نقل كفالة للوافدين." },
  },
  {
    id: "retail", icon: "🛒", color: "#b91c1c", bg: "#fff1f2",
    title: "مهن البيع والتجزئة",
    subtitle: "تشمل معظم منافذ البيع المباشر والمحلات التجارية المتخصصة",
    items: [
      "بائع في محلات الجوالات", "بائع في محلات الذهب والمجوهرات",
      "بائع ملابس رجالية", "بائع سيارات", "بائع نظارات",
      "بائع أجهزة كهربائية", "بائع قطع غيار سيارات", "بائع دراجات نارية",
      "بائع سجاد", "بائع أدوات طبية", "العاملات في محلات المستلزمات النسائية",
      "مدير مبيعات داخلي", "أخصائي تسويق عبر الهاتف", "أمين صندوق (كاشير)",
    ],
    note: { icon: "⚠️", color: "#92400e", bg: "#fffbeb", border: "#d97706", text: "يتم تطبيق مخالفات فورية على المنشآت التي توظف غير سعوديين في هذه المهن." },
  },
  {
    id: "tourism", icon: "🏨", color: "#991b1b", bg: "#fff5f5",
    title: "السياحة والضيافة",
    subtitle: "قطاعات مستهدفة بالتوطين لدعم الكوادر الوطنية في استقبال الزوار",
    items: [
      "كاتب استقبال فندقي", "مرشد سياحي", "موظف حجز تذاكر",
      "مشرف سكن", "مأمور سنترال فندقي", "مدير الأمن والسلامة",
    ],
    note: null,
  },
  {
    id: "logistics", icon: "🚛", color: "#7f1d1d", bg: "#fff5f5",
    title: "الأمن والخدمات اللوجستية",
    subtitle: "وظائف الخدمات المساندة والجمارك",
    items: [
      "حارس أمن خاص", "مشرف أمن", "مخلص جمركي",
      "مفتش جمركي", "مندوب مشتريات", "أمين مخزن",
    ],
    note: null,
  },
  {
    id: "health", icon: "🏥", color: "#dc2626", bg: "#fef2f2",
    title: "القطاع الصحي (إداري)",
    subtitle: "وظائف الاستقبال والسنترال داخل المنشآت الطبية",
    items: [
      "كاتب استقبال مرضى", "موظف سنترال طبي", "أخصائي علاقات مرضى",
    ],
    note: { icon: "📌", color: "#991b1b", bg: "#fef2f2", border: "#ef4444", text: "المهن الطبية الفنية متاحة للاستقدام، لكن المهن الإدارية داخل المستشفيات مسعودة." },
  },
  {
    id: "specialized", icon: "🛠️", color: "#991b1b", bg: "#fff1f2",
    title: "المهن التقنية والتخصصية",
    subtitle: "مهن نوعية تم قصرها على المواطنين",
    items: [
      "صيانة الجوالات", "أخصائي لغات وترجمة", "عامل سنترال",
      "أخصائي علاقات حكومية (معقب)", "مدقق حسابات (شركات صغيرة)",
    ],
    note: null,
  },
];

const PENALTIES = [
  { n: "١", title: "غرامة التوظيف المخالف", body: "غرامة مالية تبدأ من 20,000 ريال عن كل عامل وافد يعمل في مهنة مقصورة على السعوديين." },
  { n: "٢", title: "إيقاف الخدمات", body: "إيقاف خدمات الاستقدام ونقل الخدمات عن المنشأة المخالفة لمدة تصل إلى 5 سنوات." },
  { n: "٣", title: "ترحيل العامل", body: "يتم ترحيل العامل الوافد المخالف ومنعه من دخول المملكة مستقبلاً." },
];

const SOURCES = [
  { icon: "🏛", title: "وزارة الموارد البشرية والتنمية الاجتماعية", url: "https://www.hrsd.gov.sa", label: "hrsd.gov.sa" },
  { icon: "🌐", title: "منصة قوى — لوائح التوطين", url: "https://qiwa.sa", label: "qiwa.sa" },
  { icon: "⚖️", title: "نظام العمل السعودي والمخالفات", url: "https://laws.boe.gov.sa", label: "laws.boe.gov.sa" },
];

export default function MamnoPage({ onClose, dark }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const catRefs = useRef({});

  const q = search.trim();
  const filteredCats = q
    ? CATS.map(c => ({ ...c, items: c.items.filter(i => i.includes(q)) })).filter(c => c.items.length > 0)
    : CATS;

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const bg = dark ? "#0a0a0a" : "#fdfcfc";
  const cardBg = dark ? "#1a1a1a" : "#ffffff";
  const border = dark ? "rgba(239,68,68,0.15)" : "rgba(220,38,38,0.12)";
  const textMain = dark ? "#f9fafb" : "#111827";
  const textSub = dark ? "#9ca3af" : "#4b5563";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: bg,
      overflowY: "auto",
      direction: "rtl",
      fontFamily: "'Cairo',sans-serif",
    }}>
      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg,#450a0a 0%,#7f1d1d 40%,#991b1b 100%)",
        padding: "20px 16px 24px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.1),transparent 70%)", pointerEvents: "none" }} />

        <button onClick={onClose} style={{
          position: "absolute", top: 14, left: 14,
          background: "rgba(255,255,255,0.12)", border: "none",
          borderRadius: 10, padding: "6px 12px", color: "#fff",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif",
          zIndex: 2,
        }}>← رجوع</button>

        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
            fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 30, marginBottom: 10,
          }}>🚫 دليل المهن المحظورة 2026</span>

          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
            المهن <span style={{ color: "#fca5a5" }}>الممنوع استقدامها</span><br />(المسعودة) في السعودية
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginBottom: 14 }}>
            حصراً للمهن التي تم قصرها على المواطنين السعوديين فقط بنسبة 100%
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {[{ n: "69+", l: "مهنة محظورة" }, { n: "100%", l: "نسبة التوطين" }, { n: "2026", l: "تحديث" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 12px 30px" }}>

        {/* ── WARNING INTRO ── */}
        <div style={{ background: cardBg, borderRadius: 14, padding: "14px 16px", marginBottom: 14, borderRight: "5px solid #dc2626", boxShadow: `0 2px 12px rgba(0,0,0,0.07)`, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>⚠️ تنبيه قانوني هام</div>
          <div style={{ fontSize: 12, color: textSub, lineHeight: 1.8 }}>
            بناءً على قرارات <strong style={{ color: textMain }}>وزارة الموارد البشرية والتنمية الاجتماعية</strong>، تم قصر العمل في المهن الموضحة أدناه على <strong style={{ color: textMain }}>السعوديين فقط</strong>. يُحظر استقدام عمالة وافدة لهذه المهن أو توظيفهم فيها تحت أي مسمى آخر للالتفاف على القرار.
          </div>
        </div>

        {/* ── SEARCH ── */}
        <input
          type="text"
          placeholder="🔍 ابحث عن مهنة محظورة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 12,
            border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(220,38,38,0.2)"}`,
            background: dark ? "rgba(255,255,255,0.06)" : "rgba(254,242,242,0.8)",
            color: textMain, fontSize: 13, fontFamily: "'Cairo',sans-serif",
            marginBottom: 14, outline: "none", direction: "rtl", boxSizing: "border-box",
          }}
        />

        {/* ── CATEGORIES ── */}
        <div style={{ fontSize: 13, fontWeight: 800, color: textMain, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 4, height: 20, background: "#dc2626", borderRadius: 2 }} />
          قائمة المهن المسعودة 100%
        </div>

        {filteredCats.map(cat => {
          const open = expanded[cat.id] !== false;
          return (
            <div key={cat.id} style={{ background: cardBg, borderRadius: 14, marginBottom: 10, overflow: "hidden", border: `1px solid ${border}`, boxShadow: `0 2px 10px rgba(0,0,0,0.06)` }}>
              <button onClick={() => toggle(cat.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: "none", border: "none", cursor: "pointer",
                background: open ? (dark ? "rgba(220,38,38,0.1)" : cat.bg) : "transparent",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: cat.color, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 22,
                }}>{cat.icon}</div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: textMain, marginBottom: 2 }}>{cat.title}</div>
                  <div style={{ fontSize: 10, color: textSub, lineHeight: 1.4 }}>{cat.subtitle}</div>
                </div>
                <div style={{ fontSize: 16, color: textSub, flexShrink: 0 }}>{open ? "▲" : "▼"}</div>
              </button>

              {open && (
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: cat.note ? 10 : 0 }}>
                    {cat.items.map(item => (
                      <span key={item} style={{
                        background: dark ? "rgba(220,38,38,0.15)" : "#fee2e2",
                        border: `1px solid ${dark ? "rgba(220,38,38,0.3)" : "#fca5a5"}`,
                        color: dark ? "#fca5a5" : "#991b1b",
                        borderRadius: 7, padding: "4px 10px", fontSize: 12,
                        fontFamily: "'Cairo',sans-serif",
                      }}>• {item}</span>
                    ))}
                  </div>
                  {cat.note && (
                    <div style={{
                      background: dark ? "rgba(255,255,255,0.04)" : cat.note.bg,
                      borderRight: `4px solid ${cat.note.border}`,
                      borderRadius: 8, padding: "10px 12px", marginTop: 2,
                    }}>
                      <div style={{ fontSize: 11, color: dark ? textSub : cat.note.color, lineHeight: 1.7 }}>
                        <strong>{cat.note.icon} ملاحظة: </strong>{cat.note.text}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredCats.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 16px", color: textSub, fontSize: 13 }}>
            لا توجد نتائج للبحث عن "{search}"
          </div>
        )}

        {/* ── PENALTIES ── */}
        {!q && <>
          <div style={{ fontSize: 13, fontWeight: 800, color: textMain, margin: "20px 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 4, height: 20, background: "#991b1b", borderRadius: 2 }} />
            الجزاءات والعقوبات المرتبطة بالمخالفة
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PENALTIES.map((s) => (
              <div key={s.n} style={{
                background: cardBg, borderRadius: 14, padding: "14px",
                border: `1px solid ${border}`, position: "relative", paddingTop: 22,
                boxShadow: `0 2px 10px rgba(0,0,0,0.05)`,
              }}>
                <div style={{
                  position: "absolute", top: -14, right: 16,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#991b1b", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900, boxShadow: "0 4px 12px rgba(153,27,27,0.4)",
                }}>{s.n}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: textMain, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: textSub, lineHeight: 1.7 }}>{s.body}</div>
              </div>
            ))}
          </div>

          {/* ── SOURCES ── */}
          <div style={{ fontSize: 13, fontWeight: 800, color: textMain, margin: "20px 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 4, height: 20, background: "#dc2626", borderRadius: 2 }} />
            📎 المصادر الرسمية
          </div>
          <div style={{ background: cardBg, borderRadius: 14, padding: "4px 14px", border: `1px solid ${border}`, marginBottom: 16 }}>
            {SOURCES.map((s, i) => (
              <div key={s.url} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < SOURCES.length - 1 ? `1px solid ${border}` : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: textMain, marginBottom: 2 }}>{s.title}</div>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#dc2626", textDecoration: "none" }}>{s.label}</a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fef2f2", border: `1px solid ${border}`, borderRadius: 12, padding: "12px 14px", marginTop: 16 }}>
            <div style={{ fontSize: 11, color: textSub, lineHeight: 1.9, textAlign: "center" }}>
              ⚠️ <strong style={{ color: textMain }}>تنبيه:</strong> هذا التطبيق دليل مستقل يجمع البيانات من المصادر الرسمية المعلنة.<br />
              يُرجى دائماً مراجعة <strong style={{ color: textMain }}>وزارة الموارد البشرية</strong> للتأكد من أحدث المهن واللوائح.
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}
