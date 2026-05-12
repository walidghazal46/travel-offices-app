import React from 'react';
import { getCvBuilderStyles } from './CvBuilderStyles';

const CvAdminOrders = ({
  lang,
  t,
  isCompactPhone,
  cvAdminOrdersQuery,
  setCvAdminOrdersQuery,
  cvAdminOrdersStageFilter,
  setCvAdminOrdersStageFilter,
  cvAdminOrdersSortMode,
  setCvAdminOrdersSortMode,
  cvAdminBuilderOrders,
  cvAdminBuilderOrdersFiltered,
  setCvBuilderScreen
}) => {
  const styles = getCvBuilderStyles(t);

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
      <div style={{ ...styles.cardStyle, padding: "14px" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#7c3aed", fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
          🔑 {lang === "ar" ? "طلبات المستخدمين العاديين" : "Regular Users Orders"}
        </div>
        <div style={{ fontSize: 10, color: t.subText, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
          {lang === "ar"
            ? `إجمالي الطلبات: ${cvAdminBuilderOrders.length} • بعد الفلتر: ${cvAdminBuilderOrdersFiltered.length}`
            : `Total orders: ${cvAdminBuilderOrders.length} • Filtered: ${cvAdminBuilderOrdersFiltered.length}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isCompactPhone ? "1fr" : "1.6fr .8fr .8fr", gap: 8, marginBottom: 10 }}>
          <input
            value={cvAdminOrdersQuery}
            onChange={(e) => setCvAdminOrdersQuery(e.target.value)}
            placeholder={lang === "ar" ? "فلتر بالاسم أو الرقم أو الهاتف" : "Filter by name, number, or phone"}
            style={{ width: "100%", height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, padding: "0 10px", fontSize: 11, fontFamily: "'Cairo',sans-serif", outline: "none" }}
          />
          <select
            value={cvAdminOrdersStageFilter}
            onChange={(e) => setCvAdminOrdersStageFilter(e.target.value)}
            style={{ width: "100%", height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, padding: "0 8px", fontSize: 11, fontFamily: "'Cairo',sans-serif", outline: "none" }}
          >
            <option value="all">{lang === "ar" ? "كل الحالات" : "All statuses"}</option>
            <option value="active">{lang === "ar" ? "قيد التنفيذ" : "Active"}</option>
            <option value="done">{lang === "ar" ? "مكتمل" : "Done"}</option>
          </select>
          <select
            value={cvAdminOrdersSortMode}
            onChange={(e) => setCvAdminOrdersSortMode(e.target.value)}
            style={{ width: "100%", height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, padding: "0 8px", fontSize: 11, fontFamily: "'Cairo',sans-serif", outline: "none" }}
          >
            <option value="newest">{lang === "ar" ? "الأحدث" : "Newest"}</option>
            <option value="oldest">{lang === "ar" ? "الأقدم" : "Oldest"}</option>
            <option value="name">{lang === "ar" ? "الاسم" : "Name"}</option>
          </select>
        </div>

        {cvAdminBuilderOrdersFiltered.length ? (
          <div style={{ display: "grid", gap: 8, maxHeight: 470, overflowY: "auto", paddingRight: 4 }}>
            {cvAdminBuilderOrdersFiltered.map((order, idx) => {
              const orderStage = Number(order?.statusIndex);
              const stageText = orderStage >= 4
                ? (lang === "ar" ? "مكتمل" : "Done")
                : (lang === "ar" ? "قيد التنفيذ" : "Active");
              const stageColor = orderStage >= 4 ? "#16a34a" : "#f59e0b";
              return (
                <div key={order.id || order.firebaseId || idx} style={{ minHeight: 86, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "10px 12px", display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: t.text, fontFamily: "'Cairo',sans-serif" }}>
                      {String(order.name || order.fullName || "—")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: 800, fontFamily: "'Cairo',sans-serif" }}>
                        {String(order.orderNumber || order.serial || "")}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: stageColor, border: `1px solid ${stageColor}44`, borderRadius: 999, padding: "2px 7px", background: `${stageColor}18` }}>
                        {stageText}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: t.subText, fontFamily: "'Cairo',sans-serif", lineHeight: 1.65 }}>
                    {lang === "ar" ? "الهاتف" : "Phone"}: {String(order.phone || "—")} | {lang === "ar" ? "واتساب" : "WhatsApp"}: {String(order.whatsapp || "—")}
                  </div>
                  <div style={{ fontSize: 10, color: t.subText, fontFamily: "'Cairo',sans-serif", lineHeight: 1.65 }}>
                    {lang === "ar" ? "الدولة" : "Country"}: {String(order.country || "—")} | {lang === "ar" ? "التاريخ" : "Date"}: {String(order.dateStr || order.date?.slice?.(0, 10) || "—")}
                  </div>
                  {!!order.email && (
                    <div style={{ fontSize: 10, color: t.subText, fontFamily: "'Cairo',sans-serif", lineHeight: 1.65 }}>
                      {lang === "ar" ? "الإيميل" : "Email"}: {order.email}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: t.subText, textAlign: "center", padding: "14px 0", fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "لا توجد نتائج مطابقة للفلتر." : "No orders match the current filter."}
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
};

export default CvAdminOrders;
