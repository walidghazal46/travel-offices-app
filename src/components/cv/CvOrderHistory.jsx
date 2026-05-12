import React from 'react';
import { getCvBuilderStyles } from './CvBuilderStyles';

const CvOrderHistory = ({
  lang,
  t,
  isAr,
  cvBuilderOrders,
  cvBuilderScreen,
  selectedCvBuilderOrder,
  setSelectedCvBuilderOrder,
  setCvBuilderScreen
}) => {
  const styles = getCvBuilderStyles(t);

  if (cvBuilderScreen === "previousOrders") {
    return (
      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <div style={{ ...styles.cardStyle, padding: "14px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
            {lang === "ar" ? "طلباتك السابقة" : "Your Previous Requests"}
          </div>
          {cvBuilderOrders.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {cvBuilderOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedCvBuilderOrder(order);
                    setCvBuilderScreen("orderDetails");
                  }}
                  style={{
                    width: "100%",
                    textAlign: isAr ? "right" : "left",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: `1px solid ${t.border}`,
                    background: t.cardBg,
                    cursor: "pointer",
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: t.text }}>
                      {order.packageName || (lang === "ar" ? "مستخدم عادي" : "Regular User")}
                    </div>
                    <div style={{ fontSize: 10, color: t.gold, fontWeight: 800 }}>
                      {order.orderNumber}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.8 }}>
                    {order.serial} · {order.dateStr}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: t.subText, textAlign: "center", padding: "10px 0", fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "لا توجد طلبات سابقة حتى الآن." : "There are no previous requests yet."}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setCvBuilderScreen("menu")}
            style={{ ...styles.cvActionBtnStyle(t.inputBg, t.gold), border: `1px solid ${t.gold}`, boxShadow: "none", maxWidth: 220 }}
          >
            {lang === "ar" ? "رجوع" : "Back"}
          </button>
        </div>
      </div>
    );
  }

  if (cvBuilderScreen === "orderDetails" && selectedCvBuilderOrder) {
    return (
      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <div style={{ ...styles.cardStyle, padding: "14px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 12 }}>
            {lang === "ar" ? "تفاصيل الطلب السابق" : "Previous Request Details"}
          </div>
          {[
            [lang === "ar" ? "رقم الطلب" : "Order Number", selectedCvBuilderOrder.orderNumber],
            [lang === "ar" ? "السيريال" : "Serial", selectedCvBuilderOrder.serial],
            [lang === "ar" ? "الخدمة" : "Service", selectedCvBuilderOrder.packageName],
            [lang === "ar" ? "الاسم الكامل" : "Full Name", selectedCvBuilderOrder.data?.fullName],
            [lang === "ar" ? "المسمى الوظيفي" : "Job Title", selectedCvBuilderOrder.data?.jobTitle],
            [lang === "ar" ? "الدولة" : "Country", selectedCvBuilderOrder.data?.country],
            [lang === "ar" ? "المدينة / الموقع" : "City / Location", selectedCvBuilderOrder.data?.location],
            [lang === "ar" ? "رقم الموبايل" : "Mobile", selectedCvBuilderOrder.data?.phone],
            [lang === "ar" ? "رقم الواتساب" : "WhatsApp", selectedCvBuilderOrder.data?.whatsapp],
            [lang === "ar" ? "الإيميل" : "Email", selectedCvBuilderOrder.data?.email || "—"],
            [lang === "ar" ? "تاريخ الطلب" : "Request Date", selectedCvBuilderOrder.dateStr],
          ].map(([label, value], idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 12, color: t.subText, fontFamily: "'Cairo',sans-serif" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.text, fontFamily: "'Cairo',sans-serif", textAlign: isAr ? "left" : "right" }}>{value || "—"}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCvBuilderScreen("submittedData")}
          style={{ ...styles.cardStyle, marginBottom: 0, textAlign: "center", background: "linear-gradient(135deg,#fff8e6,#fffdf7)", border: `1px solid ${t.gold}55`, cursor: "pointer", boxShadow: `0 10px 26px ${t.gold}18` }}
        >
          <div style={{ fontSize: 26, marginBottom: 8 }}>🗂️</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: t.gold, fontFamily: "'Cairo',sans-serif", marginBottom: 6 }}>
            {lang === "ar" ? "إظهار بيانات هذا الطلب" : "Show This Request Data"}
          </div>
          <div style={{ fontSize: 11, color: t.subText, lineHeight: 1.8, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar"
              ? "افتح جميع البيانات التي أدخلتها في هذا الطلب بشكل مرتب ومبسط."
              : "Open all the data you submitted in this request in a simple organized view."}
          </div>
        </button>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => {
              setSelectedCvBuilderOrder(null);
              setCvBuilderScreen("previousOrders");
            }}
            style={{ ...styles.cvActionBtnStyle(t.inputBg, t.gold), border: `1px solid ${t.gold}`, boxShadow: "none", maxWidth: 220 }}
          >
            {lang === "ar" ? "رجوع" : "Back"}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CvOrderHistory;
