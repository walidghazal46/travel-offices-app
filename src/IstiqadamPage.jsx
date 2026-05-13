import React, { useState, useRef } from "react";

const CATS = [
  {
    id: "domestic", icon: "🏠", color: "#1d4ed8", bg: "#eff6ff",
    title: "العمالة المنزلية",
    subtitle: "مُنظَّمة بموجب نظام العمالة المنزلية الصادر عام 1433هـ — الاستقدام عبر منصة مساند",
    items: [
      "عامل/عاملة منزلية (خادمة)","سائق خاص","مربية أطفال (نانني)",
      "طباخ / طباخة","حارس منزل","راعية مسنين / مسنّات",
      "منظّفة منزل","بستاني / مزارع منزلي",
      "راعية أطفال ذوي احتياجات خاصة","ممرضة منزلية",
      "عامل مزرعة خاصة","سائق خاص لأفراد الأسرة",
    ],
    note: { icon:"📌", color:"#92400e", bg:"#fffbeb", border:"#d97706", text:"منصة مساند (musaned.com.sa) — منصة حكومية متخصصة في استقدام العمالة المنزلية، يمكن من خلالها الاطلاع على الجنسيات والمهن المتاحة لكل دولة." },
  },
  {
    id: "health", icon: "🏥", color: "#0369a1", bg: "#f0f9ff",
    title: "المهن الصحية والتمريضية",
    subtitle: "تنظمه وزارة الصحة والهيئة السعودية للتخصصات الصحية — يشترط توثيق الشهادات",
    items: [
      "طبيب عام","طبيب متخصص (جراحة، باطنة، أطفال...)","طبيب أسنان",
      "ممرضة / ممرض مُعتمَد","أخصائي مختبر طبي","أخصائي أشعة",
      "أخصائي علاج طبيعي","صيدلاني سريري","فني تخدير",
      "أخصائي تغذية","أخصائي بصريات","مساعد طبيب أسنان",
      "فني طوارئ طبية (EMT)","أخصائي صحة بيئية",
      "مشغّل جهاز الغسيل الكلوي","فني وحدة العناية المركزة",
    ],
    note: { icon:"⚠️", color:"#92400e", bg:"#fffbeb", border:"#d97706", text:"يجب تسجيل جميع الكوادر الصحية في الهيئة السعودية للتخصصات الصحية (SCFHS) — scfhs.org.sa" },
  },
  {
    id: "engineering", icon: "🏗️", color: "#065f46", bg: "#f0fdf4",
    title: "مهن الهندسة والتقنية والبناء",
    subtitle: "قطاع البناء والبنية التحتية — ذو تصنيف عالٍ في احتياجات رؤية 2030",
    items: [
      "مهندس مدني","مهندس معماري","مهندس ميكانيكا","مهندس كهرباء",
      "مهندس كيميائي","مهندس بترول","مهندس صناعي","مهندس تقنية معلومات",
      "مساح أراضي","فني كهرباء مُعتمَد","فني تكييف وتبريد","فني سباكة",
      "فني لحام","مشغّل رافعة","سائق معدات ثقيلة","عامل بناء / بنّاء",
      "نجار / حداد","رسّام معماري (AutoCAD)","مراقب موقع بناء","فني صيانة مباني",
    ],
    note: null,
  },
  {
    id: "hospitality", icon: "🍽️", color: "#7c3aed", bg: "#faf5ff",
    title: "مهن قطاع الضيافة والسياحة والمطاعم",
    subtitle: "قطاع مدعوم برؤية 2030 لتطوير السياحة — الطلب مرتفع ومتنوع",
    items: [
      "شيف / طاهٍ محترف","مساعد طاهٍ (Sous Chef)","نادل / نادلة (Waiter/Waitress)",
      "موظف استقبال فندقي","خبير حلويات (Pastry Chef)","مدير مطعم",
      "عامل نظافة فندق (Housekeeping)","بوّاب / كونسيرج",
      "مشغّل آلات القهوة (باريستا)","مدير خدمات غذائية",
      "مسؤول تجهيز بوفيه","عامل مطبخ (Kitchen Helper)",
    ],
    note: null,
  },
  {
    id: "education", icon: "📚", color: "#0f766e", bg: "#f0fdfa",
    title: "مهن التعليم والتدريب",
    subtitle: "يشمل التعليم الحكومي والخاص ومراكز التدريب — راجع الجهات المختصة للاشتراطات",
    items: [
      "معلم لغة عربية","معلم لغة إنجليزية","معلم رياضيات وعلوم",
      "معلم تربية إسلامية","معلم تربية رياضية","معلم فنون وتصميم",
      "مدرّب مهني معتمد","مشرف تربوي","أستاذ جامعي",
      "مديرة روضة أطفال","أخصائي تعليم خاص","محاضر تدريب وتطوير",
    ],
    note: { icon:"📌", color:"#065f46", bg:"#f0fdf4", border:"#059669", text:"يشترط الحصول على موافقة وزارة التعليم لتوظيف المعلمين الأجانب في المدارس الحكومية." },
  },
  {
    id: "transport", icon: "🚛", color: "#b45309", bg: "#fffbeb",
    title: "مهن النقل والخدمات اللوجستية",
    subtitle: "قطاع يشهد نمواً سريعاً مع مشاريع رؤية 2030 ومتطلبات الخدمات",
    items: [
      "سائق شاحنة (رخصة ثقيلة)","سائق حافلة مدرسية","سائق توصيل (Delivery)",
      "سائق نقل بري تجاري","ميكانيكي سيارات","كهربائي سيارات",
      "فني صيانة محركات","عامل مستودع (Warehouse)","مشغّل رافعة شوكية (Forklift)",
      "مشغّل طائرة مسيّرة (مُعتمَد)","مراقب حركة (Traffic Inspector)","فني تشخيص سيارات",
    ],
    note: null,
  },
  {
    id: "business", icon: "💼", color: "#1e3a8a", bg: "#eff6ff",
    title: "المهن التجارية والمالية وخدمة العملاء",
    subtitle: "مهن تجارية مدروسة — بعضها مقيّد بنسب سعودة مرتفعة في قطاعات بعينها",
    items: [
      "محاسب قانوني","مدقق حسابات","أخصائي موارد بشرية",
      "مدير مبيعات إقليمي","مسوّق رقمي","مصمم جرافيك",
      "مبرمج / مطوّر تطبيقات","أخصائي أمن معلومات","محلل بيانات",
      "مستشار قانوني","أخصائي علاقات عامة","مترجم فوري / تحريري",
      "موظف خدمة عملاء","مندوب مبيعات دوائي",
    ],
    note: { icon:"⚠️", color:"#92400e", bg:"#fffbeb", border:"#d97706", text:"بعض المهن التجارية كالتجزئة والسياحة تخضع لنسب سعودة مرتفعة؛ يُنصح بالتحقق من منصة مدد أو نطاقات قبل تقديم طلب الاستقدام." },
  },
  {
    id: "agriculture", icon: "🌾", color: "#166534", bg: "#f0fdf4",
    title: "مهن الزراعة والأمن والخدمات",
    subtitle: "قطاعات تشهد طلباً مستمراً وتندر فيها العمالة الوطنية",
    items: [
      "عامل مزرعة / فلاح","مشرف مزرعة","مربّي ماشية / دواجن",
      "خبير ري وأنظمة زراعية","حارس أمن (Security Guard)",
      "مشغّل كاميرات مراقبة","فني صيانة لفتات إعلانية",
      "عامل نظافة (Cleaner)","فني تركيب زجاج",
      "عامل مغسلة / كي ملابس","صبّاغ مبانٍ","فني تركيب طواقي طاقة شمسية",
    ],
    note: null,
  },
];

const STEPS = [
  { n:"١", title:"التحقق من الأهلية", body:"التأكد من أن صاحب العمل مؤهل للاستقدام وليس عليه مخالفات في منصة قوى أو مساند" },
  { n:"٢", title:"تقديم الطلب إلكترونياً", body:"عبر منصة مساند (للعمالة المنزلية) أو قوى (للعمالة المهنية) مع تحديد المهنة والجنسية المطلوبة" },
  { n:"٣", title:"دفع الرسوم والتأمين", body:"سداد رسوم التأشيرة وعلاوة التأمين الصحي ورسوم الاستقدام المقررة" },
  { n:"٤", title:"التعاقد مع المكتب", body:"اختيار مكتب استقدام مُرخَّص من وزارة الموارد البشرية وإبرام عقد الاستقدام الرسمي" },
  { n:"٥", title:"الفحص الطبي والتأشيرة", body:"إجراء الفحص الطبي المعتمد في بلد العامل والحصول على التأشيرة من السفارة السعودية" },
  { n:"٦", title:"استلام العامل وتسجيله", body:"استلام العامل من المطار وتسجيل بياناته في الجوازات وإصدار الإقامة خلال 90 يوماً" },
];

const SOURCES = [
  { icon:"🏛", title:"وزارة الموارد البشرية والتنمية الاجتماعية", url:"https://www.hrsd.gov.sa", label:"www.hrsd.gov.sa" },
  { icon:"💻", title:"منصة مساند — الاستقدام المنزلي الرسمي", url:"https://musaned.com.sa", label:"musaned.com.sa" },
  { icon:"🌐", title:"منصة قوى — بيئة العمل المهنية", url:"https://qiwa.sa", label:"qiwa.sa" },
  { icon:"📜", title:"نظام العمل السعودي (المرسوم الملكي م/51)", url:"https://laws.boe.gov.sa", label:"laws.boe.gov.sa" },
  { icon:"🔗", title:"بوابة الخدمات الحكومية — أبشر", url:"https://www.absher.sa", label:"www.absher.sa" },
  { icon:"🏥", title:"الهيئة السعودية للتخصصات الصحية", url:"https://www.scfhs.org.sa", label:"www.scfhs.org.sa" },
  { icon:"📊", title:"منصة مدد — حماية الأجور ونظام نطاقات", url:"https://www.mdd.com.sa", label:"www.mdd.com.sa" },
];

export default function IstiqadamPage({ onClose, dark }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const catRefs = useRef({});

  const q = search.trim();
  const filteredCats = q
    ? CATS.map(c => ({ ...c, items: c.items.filter(i => i.includes(q)) })).filter(c => c.items.length > 0)
    : CATS;

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const bg = dark ? "#0f172a" : "#f8fafc";
  const cardBg = dark ? "#1e293b" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(30,64,175,0.10)";
  const textMain = dark ? "#f1f5f9" : "#0f172a";
  const textSub = dark ? "#94a3b8" : "#475569";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background: bg,
      overflowY:"auto",
      direction:"rtl",
      fontFamily:"'Cairo',sans-serif",
    }}>
      {/* ── HERO ── */}
      <div style={{
        background:"linear-gradient(135deg,#0d1f13 0%,#162a1d 40%,#1a4028 100%)",
        padding:"20px 16px 24px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute",top:-60,left:-60,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,151,10,0.18),transparent 70%)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(45,158,88,0.2),transparent 70%)",pointerEvents:"none" }} />

        {/* back button */}
        <button onClick={onClose} style={{
          position:"absolute", top:14, left:14,
          background:"rgba(255,255,255,0.12)", border:"none",
          borderRadius:10, padding:"6px 12px", color:"#fff",
          fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif",
          zIndex:2,
        }}>← رجوع</button>

        <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
          <span style={{
            display:"inline-block", background:"rgba(200,151,10,0.15)",
            border:"1px solid rgba(200,151,10,0.4)", color:"#f0c040",
            fontSize:11, fontWeight:700, padding:"4px 16px", borderRadius:30, marginBottom:10,
          }}>📋 دليل مهن الاستقدام 2026</span>

          <div style={{ fontSize:20, fontWeight:900, color:"#fff", lineHeight:1.3, marginBottom:8 }}>
            المهن المتاحة <span style={{ color:"#f0c040" }}>للاستقدام</span><br/>في المملكة العربية السعودية
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginBottom:14 }}>
            دليل إرشادي بمعلومات متاحة للعامة — ليس تطبيقاً حكومياً ولا يمثل أي جهة رسمية
          </div>

          {/* stats */}
          <div style={{ display:"flex", justifyContent:"center", gap:24 }}>
            {[{n:"+80",l:"مهنة متاحة"},{n:"8",l:"قطاعات رئيسية"},{n:"20+",l:"دولة مُصدِّرة"}].map(s=>(
              <div key={s.n} style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:900, color:"#f0c040" }}>{s.n}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* sources tags */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:14, position:"relative", zIndex:1 }}>
          {["🏛 وزارة الموارد البشرية","💻 منصة مساند","📜 نظام العمل السعودي","🌐 منصة قوى"].map(t=>(
            <span key={t} style={{ background:"rgba(255,255,255,0.12)", borderRadius:20, padding:"3px 12px", fontSize:10, color:"rgba(255,255,255,0.85)", border:"1px solid rgba(255,255,255,0.18)" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ padding:"14px 12px 30px" }}>

        {/* ── LEGAL INTRO ── */}
        <div style={{ background:cardBg, borderRadius:14, padding:"14px 16px", marginBottom:14, borderRight:"5px solid #1d4ed8", boxShadow:`0 2px 12px rgba(0,0,0,0.07)`, border:`1px solid ${border}`, borderRightColor:"#1d4ed8" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#1d4ed8", marginBottom:8 }}>⚖️ الإطار القانوني للاستقدام في السعودية</div>
          <div style={{ fontSize:12, color:textSub, lineHeight:1.8 }}>
            يُنظَّم الاستقدام في المملكة العربية السعودية بموجب <strong style={{color:textMain}}>نظام العمل الصادر بالمرسوم الملكي رقم م/51</strong> ولوائحه التنفيذية، وتشرف عليه <strong style={{color:textMain}}>وزارة الموارد البشرية والتنمية الاجتماعية</strong>، وتتم إجراءاته الرقمية عبر <strong style={{color:textMain}}>منصة مساند</strong> للعمالة المنزلية، و<strong style={{color:textMain}}>منصة قوى</strong> للعمالة المهنية.
          </div>
          <div style={{ fontSize:12, color:textSub, lineHeight:1.8, marginTop:6 }}>
            تُحدَّد المهن المسموح باستقدامها وفق احتياجات سوق العمل، مع مراعاة سياسة <strong style={{color:textMain}}>السعودة (نطاقات)</strong> التي تحدد نسباً للعمالة المحلية في كل قطاع، فضلاً عن الاتفاقيات الثنائية مع الدول المُصدِّرة للعمالة.
          </div>
        </div>

        {/* ── SEARCH ── */}
        <input
          type="text"
          placeholder="🔍 ابحث عن مهنة في جميع القطاعات..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width:"100%", padding:"10px 14px", borderRadius:12,
            border:`1px solid ${dark?"rgba(255,255,255,0.15)":"rgba(37,99,235,0.25)"}`,
            background:dark?"rgba(255,255,255,0.06)":"rgba(239,246,255,0.8)",
            color:textMain, fontSize:13, fontFamily:"'Cairo',sans-serif",
            marginBottom:14, outline:"none", direction:"rtl", boxSizing:"border-box",
          }}
        />

        {/* ── CATEGORIES ── */}
        <div style={{ fontSize:13, fontWeight:800, color:textMain, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ display:"inline-block", width:4, height:20, background:"#1d4ed8", borderRadius:2 }}/>
          المهن المتاحة حسب القطاع
        </div>

        {filteredCats.map(cat => {
          const open = expanded[cat.id] !== false; // default open
          return (
            <div key={cat.id} ref={el => catRefs.current[cat.id] = el}
              style={{ background:cardBg, borderRadius:14, marginBottom:10, overflow:"hidden", border:`1px solid ${border}`, boxShadow:`0 2px 10px rgba(0,0,0,0.06)` }}>
              {/* header */}
              <button onClick={()=>toggle(cat.id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:12,
                padding:"12px 14px", background:"none", border:"none", cursor:"pointer",
                borderBottom: open ? `2px solid ${cat.bg}` : "none",
                background: open ? (dark ? "rgba(255,255,255,0.04)" : cat.bg) : "transparent",
              }}>
                <div style={{
                  width:44, height:44, borderRadius:10, flexShrink:0,
                  background: cat.color, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:22,
                }}>{cat.icon}</div>
                <div style={{ flex:1, textAlign:"right" }}>
                  <div style={{ fontSize:14, fontWeight:800, color:textMain, marginBottom:2 }}>{cat.title}</div>
                  <div style={{ fontSize:10, color:textSub, lineHeight:1.4 }}>{cat.subtitle}</div>
                </div>
                <div style={{ fontSize:16, color:textSub, flexShrink:0 }}>{open?"▲":"▼"}</div>
              </button>

              {open && (
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom: cat.note ? 10 : 0 }}>
                    {cat.items.map(item => (
                      <span key={item} style={{
                        background: dark ? "rgba(37,99,235,0.15)" : cat.bg,
                        border:`1px solid ${dark?"rgba(37,99,235,0.3)":cat.color+"33"}`,
                        color: dark ? "#93c5fd" : cat.color,
                        borderRadius:7, padding:"4px 10px", fontSize:12,
                        fontFamily:"'Cairo',sans-serif",
                      }}>✓ {item}</span>
                    ))}
                  </div>
                  {cat.note && (
                    <div style={{
                      background:dark?"rgba(255,255,255,0.04)":cat.note.bg,
                      borderRight:`4px solid ${cat.note.border}`,
                      borderRadius:8, padding:"10px 12px", marginTop:2,
                    }}>
                      <div style={{ fontSize:11, color:dark?textSub:cat.note.color, lineHeight:1.7 }}>
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
          <div style={{ textAlign:"center", padding:"30px 16px", color:textSub, fontSize:13 }}>
            لا توجد نتائج للبحث عن "{search}"
          </div>
        )}

        {/* ── STEPS ── */}
        {!q && <>
          <div style={{ fontSize:13, fontWeight:800, color:textMain, margin:"20px 0 12px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ display:"inline-block", width:4, height:20, background:"#1d4ed8", borderRadius:2 }}/>
            خطوات الاستقدام المعتادة
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {STEPS.map((s,i) => (
              <div key={s.n} style={{
                background:cardBg, borderRadius:14, padding:"14px 14px 14px 14px",
                border:`1px solid ${border}`, position:"relative", paddingTop:22,
                boxShadow:`0 2px 10px rgba(0,0,0,0.05)`,
              }}>
                <div style={{
                  position:"absolute", top:-14, right:16,
                  width:32, height:32, borderRadius:"50%",
                  background:"#1d4ed8", color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, fontWeight:900, boxShadow:"0 4px 12px rgba(37,99,235,0.4)",
                }}>{s.n}</div>
                <div style={{ fontSize:13, fontWeight:800, color:textMain, marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:12, color:textSub, lineHeight:1.7 }}>{s.body}</div>
              </div>
            ))}
          </div>

          {/* ── ALERTS ── */}
          <div style={{ fontSize:13, fontWeight:800, color:textMain, margin:"20px 0 12px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ display:"inline-block", width:4, height:20, background:"#dc2626", borderRadius:2 }}/>
            تنبيهات مهمة
          </div>

          {/* Red alert */}
          <div style={{ background:dark?"rgba(220,38,38,0.1)":"#fff5f5", border:`1px solid ${dark?"rgba(220,38,38,0.3)":"#fca5a5"}`, borderRight:"4px solid #dc2626", borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>🚫</span>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:dark?"#fca5a5":"#991b1b", marginBottom:6 }}>المهن المقيّدة والمحظورة على الوافدين</div>
                {[
                  "بعض مهن التجزئة محجوزة للسعوديين بموجب قرارات وزارية (محلات الاتصالات، الذهب، العطور، الملابس الرجالية...)",
                  "المهن القانونية الرسمية (المحامون، الموثقون) محصورة في المواطنين السعوديين",
                  "مهن الأذان والإمامة في المساجد الحكومية محجوزة للمواطنين",
                  "بعض المناصب القيادية العليا في الجهات الحكومية لا تُفتح للوافدين",
                ].map((t,i)=>(
                  <div key={i} style={{ fontSize:11, color:dark?textSub:"#7f1d1d", lineHeight:1.7, marginBottom:2, paddingRight:10, borderRight:`2px solid #dc2626`, marginRight:2 }}>• {t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Gold alert */}
          <div style={{ background:dark?"rgba(217,119,6,0.1)":"#fffbeb", border:`1px solid ${dark?"rgba(217,119,6,0.3)":"#fcd34d"}`, borderRight:"4px solid #d97706", borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>⚠️</span>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:dark?"#fcd34d":"#92400e", marginBottom:6 }}>شروط عامة يجب مراعاتها عند الاستقدام</div>
                {[
                  ["الحد الأدنى للسن", "21 سنة للعمالة المنزلية وفق أغلب الاتفاقيات الثنائية"],
                  ["توثيق الشهادات", "يجب تصديق الشهادات الأكاديمية والمهنية من وزارة خارجية البلد المُصدِّر والسفارة السعودية"],
                  ["اشتراط اللغة", "بعض المهن الحساسة (طبية، تعليمية) تشترط مستوى كافياً من اللغة العربية أو الإنجليزية"],
                  ["رسوم المقابل", "يحظر نظام العمل تحميل العامل أي رسوم استقدام (zero cost recruitment)"],
                  ["نظام الكفالة", "الاستقدام مرتبط بصاحب عمل مُحدَّد — والتنقل يتطلب موافقة أو نظام حماية العمالة"],
                ].map(([k,v],i)=>(
                  <div key={i} style={{ fontSize:11, color:dark?textSub:"#78350f", lineHeight:1.7, marginBottom:3 }}>
                    <strong style={{color:dark?"#fcd34d":"#92400e"}}>• {k}: </strong>{v}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Green alert */}
          <div style={{ background:dark?"rgba(5,150,105,0.1)":"#f0fdf4", border:`1px solid ${dark?"rgba(5,150,105,0.3)":"#86efac"}`, borderRight:"4px solid #059669", borderRadius:12, padding:"12px 14px", marginBottom:20 }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>✅</span>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:dark?"#6ee7b7":"#065f46", marginBottom:6 }}>الدول المعتمدة للاستقدام (أبرزها)</div>
                <div style={{ fontSize:11, color:dark?textSub:"#14532d", marginBottom:6, lineHeight:1.6 }}>تتحدد الجنسيات المسموح بها وفق الاتفاقيات الثنائية وتتغير دورياً — الدول المعتمدة حالياً تشمل:</div>
                {[
                  ["🌏 آسيا", "الفلبين، إندونيسيا، الهند، باكستان، بنغلاديش، سريلانكا، نيبال، ميانمار، كمبوديا، فيتنام"],
                  ["🌍 أفريقيا", "إثيوبيا، غانا، أوغندا، كينيا، تنزانيا، نيجيريا، بنين"],
                  ["🌎 العالم العربي", "مصر، الأردن، اليمن، السودان (مع بعض القيود)"],
                  ["🌐 أوروبا وأمريكا", "متاحة للمهن التخصصية والخبراء دون قيود الجنسية"],
                ].map(([k,v],i)=>(
                  <div key={i} style={{ fontSize:11, color:dark?textSub:"#14532d", lineHeight:1.7, marginBottom:2 }}>
                    <strong>{k}: </strong>{v}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PLATFORMS ── */}
          <div style={{ fontSize:13, fontWeight:800, color:textMain, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ display:"inline-block", width:4, height:20, background:"#1d4ed8", borderRadius:2 }}/>
            منصات وجهات مرتبطة بالاستقدام
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {[
              { icon:"💻", title:"المنصات الرقمية", items:["مساند (musaned.com.sa) — استقدام العمالة المنزلية","قوى (qiwa.sa) — العمالة المهنية والتجارية","أبشر (absher.sa) — إصدار التأشيرات والإقامات","مدد (mdd.com.sa) — رواتب ونطاقات السعودة"] },
              { icon:"🏛", title:"الجهات الحكومية المختصة", items:["وزارة الموارد البشرية والتنمية الاجتماعية","الجوازات (الهيئة العامة للجوازات)","الهيئة السعودية للتخصصات الصحية","وزارة التعليم (للكوادر التعليمية)","هيئة السوق المالية (للمهن المالية)"] },
              { icon:"📱", title:"التطبيقات الرسمية", items:["تطبيق أبشر (خدمات الجوازات والإقامة)","تطبيق مساند (تتبع طلب الاستقدام)","تطبيق قوى (بيئة العمل)","تطبيق وطني (خدمات المواطن والمقيم)"] },
            ].map(c=>(
              <div key={c.title} style={{ background:cardBg, borderRadius:12, padding:"12px 14px", border:`1px solid ${border}` }}>
                <div style={{ fontSize:13, fontWeight:800, color:textMain, marginBottom:8 }}>{c.icon} {c.title}</div>
                {c.items.map((item,i)=>(
                  <div key={i} style={{ fontSize:11, color:textSub, lineHeight:1.8, paddingRight:10, borderRight:`2px solid #bfdbfe`, marginRight:2 }}>• {item}</div>
                ))}
              </div>
            ))}
          </div>

          {/* ── SOURCES ── */}
          <div style={{ fontSize:13, fontWeight:800, color:textMain, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ display:"inline-block", width:4, height:20, background:"#1d4ed8", borderRadius:2 }}/>
            📎 المصادر الرسمية الموثّقة
          </div>
          <div style={{ background:cardBg, borderRadius:14, padding:"4px 14px", border:`1px solid ${border}`, marginBottom:16 }}>
            {SOURCES.map((s,i)=>(
              <div key={s.url} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom: i<SOURCES.length-1 ? `1px solid ${border}` : "none" }}>
                <div style={{ width:38, height:38, borderRadius:10, background:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:textMain, marginBottom:2 }}>{s.title}</div>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:"#2563eb", textDecoration:"none" }}>{s.label}</a>
                </div>
              </div>
            ))}
          </div>

          {/* ── FINAL NOTE ── */}
          <div style={{ background:dark?"rgba(5,150,105,0.1)":"#f0fdf4", border:`1px solid ${dark?"rgba(5,150,105,0.3)":"#86efac"}`, borderRight:"4px solid #059669", borderRadius:12, padding:"12px 14px" }}>
            <div style={{ display:"flex", gap:10 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>📌</span>
              <div>
                <div style={{ fontSize:12, fontWeight:800, color:dark?"#6ee7b7":"#065f46", marginBottom:4 }}>ملاحظة مهمة حول دقة المعلومات</div>
                <div style={{ fontSize:11, color:dark?textSub:"#14532d", lineHeight:1.8 }}>
                  قوائم المهن المتاحة وأسماء الدول المعتمدة وشروط الاستقدام <strong>تتغير باستمرار</strong> وفق القرارات الوزارية والاتفاقيات الثنائية. يُنصح دائماً بمراجعة المصادر الرسمية — خاصةً منصتَي <strong>مساند وقوى</strong> — للاطلاع على أحدث القوائم قبل الشروع في إجراءات الاستقدام.
                </div>
              </div>
            </div>
          </div>

          {/* disclaimer */}
          <div style={{ background:dark?"rgba(255,255,255,0.04)":"#f8fafc", border:`1px solid ${dark?"rgba(255,255,255,0.10)":"#e2e8f0"}`, borderRadius:12, padding:"12px 14px", marginTop:16 }}>
            <div style={{ fontSize:11, color:textSub, lineHeight:1.9, textAlign:"center" }}>
              ⚠️ <strong style={{color:textMain}}>تنويه:</strong> هذا التطبيق غير تابع لأي جهة حكومية ولا يمثل وزارة الموارد البشرية أو أي جهة رسمية.<br/>
              المعلومات الواردة هي لأغراض إرشادية فقط وتم جمعها من مصادر متاحة للعامة.<br/>
              يُرجى دائماً مراجعة الجهات الرسمية للحصول على أحدث المعلومات.
            </div>
          </div>
          <div style={{ textAlign:"center", fontSize:10, color:textSub, marginTop:12, paddingBottom:10 }}>
            جميع المعلومات لأغراض إرشادية — راجع المصادر الرسمية للتأكد
          </div>
        </>}

      </div>
    </div>
  );
}
