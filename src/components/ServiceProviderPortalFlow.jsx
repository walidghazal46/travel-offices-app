import React, { useState, useEffect } from 'react';
import {
  fetchServiceProviderRequestsByUserFromFirebase,
  subscribeServiceProviderRequestsByUser,
  submitServiceProviderRequestToFirebase,
  updateServiceProviderRequestInFirebase,
} from '../firebase';
import { generateServiceProviderSerial } from '../utils/reviewUtils';
import { T } from '../i18n/translations';

export default function ServiceProviderPortalFlow({
  lang,
  dark,
  selectedCountry,
  selectedNationality,
  countryCities = [],
  serviceOptions = [],
  currentUser = null,
  approvalSnapshot = null,
  onSubmitted = null,
  portalMode = "office",
}) {
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const isOfficePortal = portalMode === "office";
  const portalTitle = isOfficePortal
    ? (isAr ? "ضيف مكتبك" : "Add Your Office")
    : (isAr ? "ضيف خدمتك" : "Add Your Service");
  const portalDescription = isOfficePortal
    ? (isAr
      ? "قدّم بيانات مكتبك كاملة وسيتم مراجعة الطلب واعتماده أو رفضه من الأدمن."
      : "Submit full office details. Your request will be reviewed and approved/rejected by admin.")
    : (isAr
      ? "قدّم بيانات خدمتك كاملة وسيتم مراجعة الطلب واعتماده أو رفضه من الأدمن."
      : "Submit full service details. Your request will be reviewed and approved/rejected by admin.");
  const t = dark
    ? { bg:"#0a1628", cardBg:"rgba(255,255,255,0.04)", inputBg:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.1)", text:"#ffffff", subText:"rgba(255,255,255,0.55)", gold:"#d4af37", goldBg:"rgba(212,175,55,0.12)" }
    : { bg:"#f0f4ff", cardBg:"#ffffff", inputBg:"#f5f7ff", border:"rgba(0,0,0,0.09)", text:"#1a2340", subText:"#556080", gold:"#c8960c", goldBg:"rgba(212,175,55,0.1)" };

  const card = { borderRadius:16, padding:14, background:t.cardBg, border:`1px solid ${t.border}`, marginBottom:10 };
  const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:10, fontSize:13, border:`1px solid ${t.border}`, background:t.inputBg, color:t.text, fontFamily:"'Cairo',sans-serif", outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:11, fontWeight:700, color:t.subText, fontFamily:"'Cairo',sans-serif", marginBottom:4, display:"block" };

  const [form, setForm] = useState({
    providerName: "",
    officeName: "",
    email: String(currentUser?.email || "").trim(),
    phone: String(currentUser?.phoneNumber || "").trim(),
    whatsapp: String(currentUser?.phoneNumber || "").trim(),
    country: selectedCountry || "",
    nationality: selectedNationality || "",
    city: "",
    services: [],
    commercialRegister: "",
    taxCard: "",
    portfolioLink: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [emailFailureFallback, setEmailFailureFallback] = useState(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: prev.email || String(currentUser?.email || "").trim(),
      phone: prev.phone || String(currentUser?.phoneNumber || "").trim(),
      whatsapp: prev.whatsapp || String(currentUser?.phoneNumber || "").trim(),
      country: selectedCountry || prev.country || "",
      nationality: selectedNationality || prev.nationality || "",
      city: prev.city || String(countryCities?.[0] || ""),
    }));
  }, [countryCities, currentUser?.email, currentUser?.phoneNumber, selectedCountry, selectedNationality]);

  const selectedServices = form.services || [];
  const canSubmit =
    String(form.providerName || "").trim() &&
    String(form.officeName || "").trim() &&
    String(form.email || "").trim() &&
    String(form.phone || "").trim() &&
    String(form.whatsapp || "").trim() &&
    String(form.country || "").trim() &&
    String(form.nationality || "").trim() &&
    String(form.city || "").trim() &&
    String(form.notes || "").trim() &&
    selectedServices.length > 0 &&
    selectedServices.length <= 6;

  const toggleService = (serviceLabel) => {
    setSubmitError("");
    setForm((prev) => {
      const hasItem = prev.services.includes(serviceLabel);
      if (hasItem) {
        return { ...prev, services: prev.services.filter((item) => item !== serviceLabel) };
      }
      if (prev.services.length >= 6) {
        setSubmitError(isAr ? "يمكنك اختيار 6 خدمات كحد أقصى." : "You can select up to 6 services only.");
        return prev;
      }
      return { ...prev, services: [...prev.services, serviceLabel] };
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      if (!String(form.providerName || "").trim()) {
        setSubmitError(isAr ? "اسم مقدم الطلب إلزامي." : "Applicant name is required.");
      } else if (!String(form.officeName || "").trim()) {
        setSubmitError(isAr ? "اسم المكتب إلزامي." : "Office name is required.");
      } else if (!String(form.email || "").trim()) {
        setSubmitError(isAr ? "البريد الإلكتروني إلزامي." : "Email is required.");
      } else if (!String(form.phone || "").trim()) {
        setSubmitError(isAr ? "رقم الهاتف إلزامي." : "Phone is required.");
      } else if (!String(form.whatsapp || "").trim()) {
        setSubmitError(isAr ? "رقم واتساب إلزامي." : "WhatsApp is required.");
      } else if (!String(form.country || "").trim()) {
        setSubmitError(isAr ? "الدولة إلزامية." : "Country is required.");
      } else if (!String(form.nationality || "").trim()) {
        setSubmitError(isAr ? "الجنسية إلزامية." : "Nationality is required.");
      } else if (!String(form.city || "").trim()) {
        setSubmitError(isAr ? "المدينة إلزامية." : "City is required.");
      } else if (!String(form.notes || "").trim()) {
        setSubmitError(isAr ? "وصف المكتب إلزامي." : "Office description is required.");
      } else {
        setSubmitError(isAr ? "اختر خدمة واحدة على الأقل (حتى 6 خدمات)." : "Select at least one service (up to 6 services).");
      }
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setEmailFailureFallback(null);
    const serial = generateServiceProviderSerial();
    const payload = {
      serial,
      requestType: isOfficePortal ? "office" : "service",
      providerName: String(form.providerName || "").trim(),
      officeName: String(form.officeName || "").trim(),
      email: String(form.email || "").trim(),
      phone: String(form.phone || "").trim(),
      whatsapp: String(form.whatsapp || "").trim(),
      country: String(form.country || "").trim(),
      nationality: String(form.nationality || "").trim(),
      city: String(form.city || "").trim(),
      services: selectedServices,
      commercialRegister: String(form.commercialRegister || "").trim(),
      taxCard: String(form.taxCard || "").trim(),
      portfolioLink: String(form.portfolioLink || "").trim(),
      notes: String(form.notes || "").trim(),
      portalLink: String(form.portfolioLink || "").trim(),
      status: "pending",
      userUid: String(currentUser?.uid || "").trim(),
      userEmail: String(currentUser?.email || "").trim(),
    };

    try {
      const requestId = await submitServiceProviderRequestToFirebase(payload);
      const savedRequest = { ...payload, id: requestId };
      setSubmitSuccess(savedRequest);
      onSubmitted?.(savedRequest);
      setForm((prev) => ({ ...prev, services: [], notes: "" }));

      const emailResult = await sendServiceProviderEmails({
        type: "submission",
        request: { ...savedRequest, requestId },
      });

      if (!emailResult?.ok) {
        const whatsappText = isAr
          ? [
              `السلام عليكم، واجهتني مشكلة أثناء إرسال الإيميل بعد حفظ طلب ${isOfficePortal ? "إضافة المكتب" : "إضافة الخدمة"}.`,
              `رقم الطلب: ${savedRequest.serial}`,
              `اسم مقدم الطلب: ${savedRequest.providerName}`,
              `${isOfficePortal ? "اسم المكتب" : "اسم الخدمة"}: ${savedRequest.officeName}`,
              `الدولة: ${savedRequest.country}`,
              `المدينة: ${savedRequest.city}`,
              `الجنسية: ${savedRequest.nationality}`,
              `الإيميل: ${savedRequest.email}`,
              `الهاتف: ${savedRequest.phone}`,
              `واتساب: ${savedRequest.whatsapp}`,
              `الخدمات: ${(savedRequest.services || []).join(" - ")}`,
              `السجل التجاري: ${savedRequest.commercialRegister}`,
              `البطاقة الضريبية: ${savedRequest.taxCard}`,
              `البورتفوليو: ${savedRequest.portfolioLink}`,
              `الوصف: ${savedRequest.notes}`,
              isOfficePortal
                ? "برجاء ارفاق الاوراق المطلوبة: السجل التجاري والبطاقة الضريبية والبورتفوليو للشركة أو المكتب إذا كان متاح."
                : "برجاء ارفاق أي ملفات أو روابط داعمة للخدمة إذا كانت متاحة.",
            ].join("\n")
          : [
              `Hello, I had an email sending issue after saving my ${isOfficePortal ? "office" : "service"} request.`,
              `Request number: ${savedRequest.serial}`,
              `Applicant: ${savedRequest.providerName}`,
              `${isOfficePortal ? "Office" : "Service"}: ${savedRequest.officeName}`,
              `Country: ${savedRequest.country}`,
              `City: ${savedRequest.city}`,
              `Nationality: ${savedRequest.nationality}`,
              `Email: ${savedRequest.email}`,
              `Phone: ${savedRequest.phone}`,
              `WhatsApp: ${savedRequest.whatsapp}`,
              `Services: ${(savedRequest.services || []).join(" - ")}`,
              `Commercial register: ${savedRequest.commercialRegister}`,
              `Tax card: ${savedRequest.taxCard}`,
              `Portfolio: ${savedRequest.portfolioLink}`,
              `Description: ${savedRequest.notes}`,
              isOfficePortal
                ? "Please attach required documents: commercial register, tax card, and office/company portfolio if available."
                : "Please attach any supporting files or links related to the service if available.",
            ].join("\n");

        setEmailFailureFallback({
          text: whatsappText,
          href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappText)}`,
        });
      }
    } catch (error) {
      console.error("Provider request submit failed", error);
      setSubmitError(isAr ? "تعذر إرسال الطلب الآن. حاول مرة أخرى." : "Unable to submit the request now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const status = String(approvalSnapshot?.status || "").trim().toLowerCase();
  const statusColor = status === "approved" ? "#16a34a" : status === "rejected" ? "#dc2626" : t.gold;

  return (
    <div dir={dir} style={{ fontFamily:"'Cairo',sans-serif", color:t.text }}>
      <div style={{ ...card, background:`linear-gradient(135deg,${t.gold}16,${t.gold}07)`, border:`1px solid ${t.gold}30` }}>
        <div style={{ fontSize:14, fontWeight:900, color:t.gold, marginBottom:4 }}>
          {portalTitle}
        </div>
        <div style={{ fontSize:11, color:t.subText, lineHeight:1.8 }}>
          {portalDescription}
        </div>
      </div>

      {!!approvalSnapshot && (
        <div style={{ ...card, border:`1px solid ${statusColor}55`, background: status === "approved" ? "rgba(22,163,74,0.12)" : status === "rejected" ? "rgba(220,38,38,0.10)" : `${t.gold}12` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <div style={{ fontSize:12, fontWeight:900, color:statusColor }}>
              {status === "approved"
                ? (isAr ? "✅ تم اعتماد طلبك" : "✅ Your request is approved")
                : status === "rejected"
                  ? (isAr ? "❌ تم رفض الطلب" : "❌ Request rejected")
                  : (isAr ? "⏳ الطلب قيد المراجعة" : "⏳ Request is under review")}
            </div>
            {status === "approved" && (
              <span style={{ width:10, height:10, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 12px #22c55e" }} />
            )}
          </div>
          <div style={{ marginTop:6, fontSize:11, color:t.subText, lineHeight:1.75 }}>
            {(approvalSnapshot?.decisionNote || approvalSnapshot?.adminDecisionNote)
              ? String(approvalSnapshot?.decisionNote || approvalSnapshot?.adminDecisionNote)
              : (isAr ? "سيصلك تحديث بالحالة عبر الإيميل." : "You will receive status updates by email.")}
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <label style={labelStyle}>{isAr ? "اسم مقدم الطلب" : "Applicant Name"}</label>
            <input style={inputStyle} value={form.providerName} onChange={(e) => setForm((prev) => ({ ...prev, providerName: e.target.value }))} placeholder={isAr ? "الاسم الكامل" : "Full name"} />
          </div>
          <div>
            <label style={labelStyle}>{isAr ? (isOfficePortal ? "اسم المكتب" : "اسم الخدمة") : (isOfficePortal ? "Office Name" : "Service Name")}</label>
            <input style={inputStyle} value={form.officeName} onChange={(e) => setForm((prev) => ({ ...prev, officeName: e.target.value }))} placeholder={isAr ? (isOfficePortal ? "اسم المكتب" : "اسم الخدمة أو نشاطك") : (isOfficePortal ? "Office name" : "Service or activity name")} />
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
          <div>
            <label style={labelStyle}>{isAr ? "البريد الإلكتروني *" : "Email *"}</label>
            <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="example@email.com" />
          </div>
          <div>
            <label style={labelStyle}>{isAr ? "رقم الهاتف" : "Phone"}</label>
            <input style={inputStyle} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder={isAr ? "رقم الهاتف" : "Phone number"} />
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
          <div>
            <label style={labelStyle}>{isAr ? "الدولة *" : "Country *"}</label>
            <input style={inputStyle} value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>{isAr ? "الجنسية *" : "Nationality *"}</label>
            <input style={inputStyle} value={form.nationality} onChange={(e) => setForm((prev) => ({ ...prev, nationality: e.target.value }))} />
          </div>
        </div>

        <div style={{ marginTop:10 }}>
          <label style={labelStyle}>{isAr ? "المدينة *" : "City *"}</label>
          {Array.isArray(countryCities) && countryCities.length > 0 ? (
            <select style={inputStyle} value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}>
              <option value="">{isAr ? "اختر المدينة" : "Select city"}</option>
              {countryCities.map((cityName) => (
                <option key={cityName} value={cityName}>{cityName}</option>
              ))}
            </select>
          ) : (
            <input style={inputStyle} value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder={isAr ? "اكتب المدينة" : "Enter city"} />
          )}
        </div>

        <div style={{ marginTop:10 }}>
          <label style={labelStyle}>{isAr ? "واتساب" : "WhatsApp"}</label>
          <input style={inputStyle} value={form.whatsapp} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} placeholder={isAr ? "رقم واتساب" : "WhatsApp number"} />
        </div>

        <div style={{ marginTop:10 }}>
          <label style={labelStyle}>{isAr ? "رقم السجل التجاري" : "Commercial Register"}</label>
          <input style={inputStyle} value={form.commercialRegister} onChange={(e) => setForm((prev) => ({ ...prev, commercialRegister: e.target.value }))} placeholder={isAr ? "رقم السجل التجاري" : "Commercial register number"} />
        </div>

        <div style={{ marginTop:10 }}>
          <label style={labelStyle}>{isAr ? "رقم البطاقة الضريبية" : "Tax Card Number"}</label>
          <input style={inputStyle} value={form.taxCard} onChange={(e) => setForm((prev) => ({ ...prev, taxCard: e.target.value }))} placeholder={isAr ? "رقم البطاقة الضريبية" : "Tax card number"} />
        </div>

        <div style={{ marginTop:10 }}>
          <label style={labelStyle}>{isAr ? "رابط البورتفوليو" : "Portfolio Link"}</label>
          <input style={inputStyle} value={form.portfolioLink} onChange={(e) => setForm((prev) => ({ ...prev, portfolioLink: e.target.value }))} placeholder="https://" />
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize:12, fontWeight:900, color:t.gold, marginBottom:6 }}>
          {isAr ? "الخدمات المطلوبة (بحد أقصى 6)" : "Requested Services (max 6)"}
        </div>
        <div style={{ fontSize:10, color:t.subText, marginBottom:8 }}>
          {isAr ? `تم اختيار ${selectedServices.length} من 6` : `${selectedServices.length} of 6 selected`}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {serviceOptions.map((item, idx) => {
            const label = String(item?.label || item || "").trim();
            const active = selectedServices.includes(label);
            return (
              <button
                key={`${label}-${idx}`}
                onClick={() => toggleService(label)}
                style={{
                  border:`1px solid ${active ? t.gold : t.border}`,
                  background: active ? `${t.gold}18` : t.inputBg,
                  color: active ? t.gold : t.text,
                  borderRadius: 10,
                  padding: "9px 8px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: isAr ? "right" : "left",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop:10 }}>
          <label style={labelStyle}>{isAr ? (isOfficePortal ? "وصف المكتب/الشركة *" : "وصف الخدمة *") : (isOfficePortal ? "Office/Company Description *" : "Service Description *")}</label>
          <textarea style={{ ...inputStyle, minHeight:72, resize:"vertical" }} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder={isAr ? (isOfficePortal ? "اكتب أي تفاصيل إضافية عن المكتب" : "اكتب أي تفاصيل إضافية عن خدمتك") : (isOfficePortal ? "Add any extra details about the office" : "Add any extra details about your service")} />
        </div>
      </div>

      {!!submitError && (
        <div style={{ ...card, background:"rgba(127,29,29,0.18)", border:"1px solid rgba(248,113,113,0.38)", color:"#fecaca", fontSize:11, fontWeight:800, lineHeight:1.8 }}>
          {submitError}
        </div>
      )}

      {!!submitSuccess && (
        <div style={{ ...card, background:"rgba(22,163,74,0.16)", border:"1px solid rgba(34,197,94,0.42)", color:"#ffffff", fontSize:11, fontWeight:800, lineHeight:1.8 }}>
          {isAr
            ? `تم إرسال طلبك بنجاح. رقم الطلب: ${submitSuccess.serial}`
            : `Your request was submitted successfully. Request number: ${submitSuccess.serial}`}
        </div>
      )}

      {!!emailFailureFallback && (
        <div style={{ ...card, background:"rgba(245,158,11,0.14)", border:"1px solid rgba(245,158,11,0.42)", color:"#ffffff", fontSize:11, fontWeight:800, lineHeight:1.8 }}>
          <div style={{ marginBottom: 8 }}>
            {isAr
              ? "تم حفظ الطلب على فايربيز لكن حدث فشل في إرسال الإيميل."
              : "The request was saved to Firebase, but email delivery failed."}
          </div>
          <a
            href={emailFailureFallback.href}
            target="_blank"
            rel="noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:6, textDecoration:"none", background:"#16a34a", color:"#fff", borderRadius:10, padding:"8px 11px", fontSize:11, fontWeight:900 }}
          >
            <span>🟢</span>
            <span>{isAr ? "إذا واجهت مشكلة فى الحفظ دوس على هذا الزر واتساب" : "If you face a save issue, tap this WhatsApp button"}</span>
          </a>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        style={{
          width:"100%",
          padding:"12px",
          borderRadius:12,
          border:"none",
          background: canSubmit && !submitting ? `linear-gradient(135deg,${t.gold},#b8860b)` : t.border,
          color:"#fff",
          fontSize:13,
          fontWeight:900,
          cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
          fontFamily:"'Cairo',sans-serif",
          opacity: canSubmit && !submitting ? 1 : 0.6,
        }}
      >
        {submitting
          ? (isAr ? "جارٍ الإرسال..." : "Submitting...")
          : (isAr ? "إرسال طلب الإضافة" : "Submit Provider Request")}
      </button>

      <div style={{ marginTop:10, borderRadius:12, border:`1px solid ${t.border}`, background:t.inputBg, padding:"10px 12px", fontSize:10.5, color:t.subText, lineHeight:1.8 }}>
        {isAr
          ? "المنصة مستقلة وغير تابعة لأي جهة حكومية، ويتم اعتماد الطلبات بعد مراجعة الأدمن فقط."
          : "The portal is independent and not affiliated with any government entity, and requests are approved only after admin review."}
      </div>
    </div>
  );
}

const CV_PDF_SECTION_COLOR = "#2f6fb3";
const CV_PDF_BORDER_COLOR = "#b9c2cd";

