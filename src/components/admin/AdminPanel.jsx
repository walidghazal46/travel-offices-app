import React from 'react';
import {
  fetchUserProfilesFromFirebase, fetchServiceOrdersFromFirebase,
  fetchServiceProviderRequestsFromFirebase, deleteAuthUserByAdminInFirebase,
  updateUserProfileStatusInFirebase, updateOrderInFirebase,
  updateServiceProviderRequestInFirebase,
} from '../../firebase';

export default function AdminPanel({
  lang, dark, dir, styles, t,
  adminPanelOpen, isAdminUser,
  adminPanelSection, setAdminPanelSection,
  adminUsers, adminUsersLoading, adminUsersError,
  adminUsersQuery, setAdminUsersQuery,
  adminOrders, adminOrdersLoading, adminOrdersError,
  adminOrdersQuery, setAdminOrdersQuery,
  adminOrdersFilter, setAdminOrdersFilter,
  adminOrdersFilterLabel, setAdminOrdersFilterLabel,
  adminOrdersSortMode, setAdminOrdersSortMode,
  adminSelectedOrderId, setAdminSelectedOrderId,
  adminExpandedOrderId, setAdminExpandedOrderId,
  adminOrderActionBusyId, setAdminOrderActionBusyId,
  adminDelayedStageKey, setAdminDelayedStageKey,
  adminActionConfirm, setAdminActionConfirm,
  adminActionBusyUid, setAdminActionBusyUid,
  adminOpsFilter, setAdminOpsFilter,
  adminOpsFilterLabel, setAdminOpsFilterLabel,
  adminCriticalCount, adminPendingProvidersCount,
  adminProviderRequests, adminProviderRequestsLoading,
  adminProviderRequestsError, adminProviderRequestsQuery,
  setAdminProviderRequestsQuery, adminProviderActionBusyId,
  setAdminProviderActionBusyId, adminOrdersTimeCounts,
  closeAdminPanel, closeAdminActionConfirm,
  canManageAdminUsers, isCompactPhone,
}) {
  if (!(adminPanelOpen && isAdminUser)) return null;
  return (

    <div style={{ ...styles.overlay, background: "rgba(2, 6, 23, 0.84)", backdropFilter: "blur(10px)" }}>
      {!!adminActionConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10002,
            background: "rgba(2, 6, 23, 0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: "min(100%, 360px)",
              borderRadius: 20,
              padding: "16px 14px 14px",
              background: adminActionConfirm.type === "delete"
                ? "linear-gradient(180deg, rgba(30,58,138,0.98) 0%, rgba(15,23,42,0.98) 100%)"
                : "linear-gradient(180deg, rgba(127,29,29,0.98) 0%, rgba(30,12,12,0.98) 100%)",
              border: adminActionConfirm.type === "delete"
                ? "1px solid rgba(96,165,250,0.55)"
                : "1px solid rgba(248,113,113,0.55)",
              boxShadow: adminActionConfirm.type === "delete"
                ? "0 18px 48px rgba(30,64,175,0.42), 0 0 28px rgba(96,165,250,0.30)"
                : "0 18px 48px rgba(127,29,29,0.42), 0 0 28px rgba(248,113,113,0.28)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            <div style={{ color: "#f8fafc", fontSize: 15, fontWeight: 900, fontFamily: "'Cairo',sans-serif", marginBottom: 8 }}>
              {adminActionConfirm.type === "delete"
                ? (lang === "ar" ? "تأكيد حذف الحساب" : "Confirm Account Deletion")
                : (lang === "ar" ? "تأكيد حظر المستخدم" : "Confirm User Block")}
            </div>
            <div style={{ color: "rgba(241,245,249,0.92)", fontSize: 12, lineHeight: 1.75, fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 12 }}>
              {adminActionConfirm.type === "delete"
                ? (lang === "ar"
                  ? "سيتم حذف الحساب نهائيًا من النظام، وسيحتاج المستخدم للتسجيل من جديد."
                  : "This account will be permanently deleted and the user must register again.")
                : (lang === "ar"
                  ? "سيتم حظر هذا الحساب ومنع تسجيل الدخول به حتى يقوم الأدمن بإلغاء الحظر."
                  : "This account will be blocked and sign-in will be denied until an admin unblocks it.")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={closeAdminActionConfirm}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.24)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#f8fafc",
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                }}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleAdminConfirmProceed}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 12,
                  border: "none",
                  background: adminActionConfirm.type === "delete"
                    ? "linear-gradient(135deg, #38bdf8, #2563eb)"
                    : "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 900,
                  fontFamily: "'Cairo',sans-serif",
                  cursor: "pointer",
                }}
              >
                {adminActionConfirm.type === "delete"
                  ? (lang === "ar" ? "تأكيد الحذف" : "Confirm Delete")
                  : (lang === "ar" ? "تأكيد الحظر" : "Confirm Block")}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          maxHeight: "84vh",
          overflowY: "auto",
          borderRadius: 28,
          padding: isCompactPhone ? "20px 16px 18px" : "24px 20px 20px",
          background: "linear-gradient(180deg, #122b63 0%, #0b1f4a 100%)",
          border: "1px solid rgba(212,175,55,0.34)",
          boxShadow: "0 24px 80px rgba(7, 15, 35, 0.6), 0 0 0 1px rgba(212,175,55,0.12)",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <button
          onClick={closeAdminPanel}
          style={{
            position: "absolute",
            top: 14,
            right: dir === "rtl" ? "auto" : 14,
            left: dir === "rtl" ? 14 : "auto",
            border: "1px solid rgba(212,175,55,0.32)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5d77b",
            borderRadius: 12,
            padding: "7px 12px",
            fontFamily: "'Cairo',sans-serif",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "إغلاق" : "Close"}
        </button>

        <div style={{ textAlign: dir === "rtl" ? "right" : "left", paddingTop: 6 }}>
          <div style={{ color: "#e7c55b", fontSize: isCompactPhone ? 18 : 20, fontWeight: 900, lineHeight: 1.1, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "لوحة تحكم الأدمن" : "Admin Control Panel"}
          </div>
          <div style={{ color: "rgba(245,215,123,0.92)", fontSize: 11, fontWeight: 700, marginTop: 3, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar" ? "المستخدمون والطلبات (آخر 30 يوم)" : "Users and orders (last 30 days)"}
          </div>
          {adminPanelSection !== "overview" && (
            <button
              onClick={() => {
                if (adminSelectedOrderId) {
                  setAdminSelectedOrderId("");
                } else {
                  setAdminPanelSection("overview");
                  setAdminSelectedProviderRequestId("");
                }
              }}
              style={{ marginTop: 8, border: "1px solid rgba(212,175,55,0.35)", background: "rgba(255,255,255,0.06)", color: "#f5d77b", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
            >
              {adminSelectedOrderId
                ? (lang === "ar" ? "← رجوع للطلبات" : "← Back to Orders")
                : (lang === "ar" ? "رجوع للوحة الرئيسية" : "Back to Main Panel")}
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 18 }}>
          <div style={{ color: "rgba(255,255,255,0.76)", fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {lang === "ar"
              ? `المستخدمون: ${adminUsers.length} | الطلبات: ${adminOrders.length} | مزودو الخدمات: ${providerRequestsVisible.length}`
              : `Users: ${adminUsers.length} | Orders: ${adminOrders.length} | Providers: ${providerRequestsVisible.length}`}
          </div>
          <button
            onClick={() => {
              loadAdminUsers();
              loadAdminOrders();
              loadAdminProviderRequests();
            }}
            disabled={adminUsersLoading || adminOrdersLoading || adminProviderRequestsLoading}
            style={{
              border: "1px solid rgba(212,175,55,0.32)",
              background: "rgba(255,255,255,0.06)",
              color: "#f5d77b",
              borderRadius: 12,
              padding: "8px 12px",
              fontFamily: "'Cairo',sans-serif",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              opacity: adminUsersLoading || adminOrdersLoading || adminProviderRequestsLoading ? 0.7 : 1,
            }}
          >
            {adminUsersLoading || adminOrdersLoading || adminProviderRequestsLoading
              ? (lang === "ar" ? "جارٍ التحديث..." : "Refreshing...")
              : (lang === "ar" ? "تحديث" : "Refresh")}
          </button>
        </div>

        {adminPanelSection === "overview" && (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {[{
              key: "users",
              titleAr: "المستخدمون",
              titleEn: "Users",
              count: adminUsers.length,
              tone: "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(37,99,235,0.16))",
              border: "1px solid rgba(96,165,250,0.45)",
              icon: "👥",
            }, {
              key: "orders",
              titleAr: "الطلبات",
              titleEn: "Orders",
              count: adminOrders.length,
              tone: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(180,83,9,0.16))",
              border: "1px solid rgba(251,191,36,0.42)",
              icon: "📦",
            }, {
              key: "providers",
              titleAr: "مقدمو الخدمات",
              titleEn: "Service Providers",
              count: providerRequestsVisible.length,
              pending: adminPendingProvidersCount,
              tone: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(21,128,61,0.16))",
              border: "1px solid rgba(74,222,128,0.42)",
              icon: "🧰",
            }].map((item) => (
              <button
                key={item.key}
                onClick={() => setAdminPanelSection(item.key)}
                style={{
                  width: "100%",
                  textAlign: dir === "rtl" ? "right" : "left",
                  borderRadius: 16,
                  border: item.border,
                  background: item.tone,
                  padding: "12px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 900 }}>
                    {lang === "ar" ? item.titleAr : item.titleEn}
                  </div>
                  <div style={{ color: "#dbeafe", fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                    {lang === "ar" ? `الإجمالي: ${item.count}` : `Total: ${item.count}`}
                    {item.key === "providers" ? (lang === "ar" ? ` | الجديد: ${item.pending || 0}` : ` | New: ${item.pending || 0}`) : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!!adminUsersError && (
          <div style={{ marginTop: 14, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 14, padding: "10px 12px", textAlign: "center", fontSize: 12, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {adminUsersError}
          </div>
        )}

        <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "10px 10px 12px", display: adminPanelSection === "users" ? "block" : "none" }}>
          <div style={{ marginBottom: 8, color: "#f8fafc", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>{lang === "ar" ? "المستخدمون" : "Users"}</span>
            <span style={{ color: "#cbd5e1", fontSize: 10, fontWeight: 800 }}>
              {lang === "ar"
                ? `${filteredAdminUsers.length} / ${adminUsers.length}`
                : `${filteredAdminUsers.length} / ${adminUsers.length}`}
            </span>
          </div>

          <input
            value={adminUsersQuery}
            onChange={(event) => setAdminUsersQuery(event.target.value)}
            placeholder={lang === "ar" ? "بحث بالاسم أو الإيميل أو الهاتف" : "Search by name, email, or phone"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(212,175,55,0.30)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 11, fontWeight: 700, padding: "8px 10px", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}
          />

          {!canManageAdminUsers && (
            <div style={{ marginTop: 2, marginBottom: 8, borderRadius: 14, border: "1px solid rgba(34,197,94,0.38)", background: "rgba(22,163,74,0.14)", padding: "10px 12px", color: "#bbf7d0", textAlign: "center", fontSize: 11, lineHeight: 1.8, fontWeight: 800, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? "أنت أدمن متابعة فقط: يمكنك متابعة الطلبات والتواصل مع العملاء، ولا تملك صلاحيات إدارة المستخدمين."
                : "You are a tracking admin only: you can follow orders and contact clients, but cannot manage users."}
            </div>
          )}

          {canManageAdminUsers && (
          <div style={{ display: "grid", gap: 8, marginTop: 2 }}>
            {filteredAdminUsers.map((entry) => {
            const entryUid = String(entry.uid || entry.id || "").trim();
            const entryEmail = String(entry.email || "").trim().toLowerCase();
            const isBlocked = String(entry.status || "active").trim() === "blocked";
            const entryRole = String(entry.role || "user").trim().toLowerCase();
            const isEntryOwnerAdmin = entryEmail === PRIMARY_ADMIN_EMAIL;
            const isEntryDelegatedAdmin = entryRole === "admin_delegate";
            const canManage = !!entryUid && entryUid !== authPreviewUser?.uid && !isEntryOwnerAdmin;
            return (
              <div
                key={entryUid || entry.id}
                style={{
                  borderRadius: 18,
                  border: `1px solid ${isBlocked ? "rgba(248,113,113,0.34)" : "rgba(212,175,55,0.22)"}`,
                  background: isBlocked ? "rgba(127,29,29,0.14)" : "rgba(255,255,255,0.05)",
                  padding: "8px 9px 7px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#f8fafc", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", lineHeight: 1.35 }}>
                      {entry.displayName || (lang === "ar" ? "مستخدم بدون اسم" : "Unnamed user")}
                    </div>
                    <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 700, fontFamily: "sans-serif", marginTop: 1, wordBreak: "break-word", lineHeight: 1.3 }}>
                      {entry.email || entry.phoneNumber || entryUid}
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: isBlocked ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.16)",
                    color: isBlocked ? "#fecaca" : "#bbf7d0",
                    fontSize: 10,
                    fontWeight: 900,
                    fontFamily: "'Cairo',sans-serif",
                    whiteSpace: "nowrap",
                  }}>
                    <span>{isBlocked ? (lang === "ar" ? "محظور" : "Blocked") : (lang === "ar" ? "نشط" : "Active")}</span>
                    {!isBlocked && (isEntryOwnerAdmin || isEntryDelegatedAdmin) && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginInlineStart: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                        <span>
                          {isEntryOwnerAdmin
                            ? (lang === "ar" ? "أدمن أساسي" : "Primary Admin")
                            : (lang === "ar" ? "أدمن متابعة" : "Tracking Admin")}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 7 }}>
                  {[
                    [lang === "ar" ? "الدولة" : "Country", entry.country || "—"],
                    [lang === "ar" ? "الجنسية" : "Nationality", entry.nationality || "—"],
                  ].map(([label, value]) => (
                    <div key={`${entryUid}-${label}`} style={{ borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "5px 7px" }}>
                      <div style={{ color: "rgba(255,255,255,0.56)", fontSize: 9, fontWeight: 700, fontFamily: "'Cairo',sans-serif", marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, fontFamily: "'Cairo',sans-serif", wordBreak: "break-word", lineHeight: 1.25 }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 7 }}>
                  <button
                    onClick={() => executeAdminToggleRole(entry)}
                    disabled={!canManage || adminActionBusyUid === entryUid}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 12,
                      border: "none",
                      background: isEntryDelegatedAdmin ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #22c55e, #15803d)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 900,
                      fontFamily: "'Cairo',sans-serif",
                      cursor: canManage ? "pointer" : "not-allowed",
                      opacity: !canManage || adminActionBusyUid === entryUid ? 0.6 : 1,
                    }}
                  >
                    {!canManage
                      ? (lang === "ar" ? "غير متاح" : "Locked")
                      : adminActionBusyUid === entryUid
                        ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...")
                        : isEntryDelegatedAdmin
                          ? (lang === "ar" ? "إلغاء الأدمن" : "Remove admin")
                          : (lang === "ar" ? "🟢 جعل هذا الحساب أدمن" : "🟢 Make Admin")}
                  </button>
                  <button
                    onClick={() => handleAdminStatusToggle(entry)}
                    disabled={!canManage || adminActionBusyUid === entryUid}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 12,
                      border: "none",
                      background: isBlocked ? "linear-gradient(135deg, #22c55e, #15803d)" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 900,
                      fontFamily: "'Cairo',sans-serif",
                      cursor: canManage ? "pointer" : "not-allowed",
                      opacity: !canManage || adminActionBusyUid === entryUid ? 0.6 : 1,
                    }}
                  >
                    {!canManage
                      ? (lang === "ar" ? "هذا حسابك" : "Your account")
                      : adminActionBusyUid === entryUid
                        ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...")
                        : isBlocked
                          ? (lang === "ar" ? "فك الحظر" : "Unblock")
                          : (lang === "ar" ? "حظر المستخدم" : "Block user")}
                  </button>
                  <button
                    onClick={() => handleAdminDeleteUser(entry)}
                    disabled={!canManage || adminActionBusyUid === entryUid}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 900,
                      fontFamily: "'Cairo',sans-serif",
                      cursor: canManage ? "pointer" : "not-allowed",
                      opacity: !canManage || adminActionBusyUid === entryUid ? 0.6 : 1,
                    }}
                  >
                    {!canManage
                      ? (lang === "ar" ? "هذا حسابك" : "Your account")
                      : adminActionBusyUid === entryUid
                        ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...")
                        : (lang === "ar" ? "حذف الحساب" : "Delete account")}
                  </button>
                </div>
              </div>
            );
          })}

          {!adminUsersLoading && filteredAdminUsers.length === 0 && (
            <div style={{ borderRadius: 18, border: "1px dashed rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "18px 14px", textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.8, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar" ? "لا توجد نتائج مطابقة للمستخدمين." : "No matching users were found."}
            </div>
          )}
        </div>
        )}
        </div>

        <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "10px 10px 12px", display: adminPanelSection === "orders" && !adminSelectedOrderId ? "block" : "none" }}>
        <div style={{ marginBottom: 6, color: "#f8fafc", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span>{lang === "ar" ? "الطلبات" : "Orders"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: adminCriticalCount > 0 ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.16)", border: adminCriticalCount > 0 ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(34,197,94,0.35)", color: adminCriticalCount > 0 ? "#fecaca" : "#bbf7d0", fontSize: 10, fontWeight: 900 }}>
            <span>{lang === "ar" ? "حالات حرجة" : "Critical"}</span>
            <span style={{ minWidth: 16, textAlign: "center" }}>{adminCriticalCount}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6, marginBottom: 8 }}>
          {[
            { key: "today", ar: "اليوم", en: "Today" },
            { key: "7d", ar: "آخر 7 أيام", en: "7 Days" },
            { key: "30d", ar: "آخر 30 يوم", en: "30 Days" },
            { key: "all", ar: "الكل", en: "All" },
          ].map((item) => {
            const active = adminOrdersFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setAdminOrdersFilter(item.key)}
                style={{
                  border: `1px solid ${active ? "rgba(212,175,55,0.65)" : "rgba(212,175,55,0.30)"}`,
                  background: active ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.06)",
                  color: active ? "#f5d77b" : "#e2e8f0",
                  borderRadius: 10,
                  padding: "6px 4px",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                <span>{lang === "ar" ? item.ar : item.en}</span>
                <span style={{ marginInlineStart: 4, padding: "1px 5px", borderRadius: 999, background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)", color: active ? "#fff" : "#ffe4e6", fontSize: 9, fontWeight: 900, lineHeight: 1.2, display: "inline-block", minWidth: 16 }}>
                  {adminOrdersTimeCounts[item.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6, marginBottom: 8 }}>
          {[
            { key: "all", ar: "كل الحالات", en: "All" },
            { key: "delayed", ar: "متأخرة", en: "Delayed" },
            { key: "no-review", ar: "بدون تقييم", en: "No Review" },
            { key: "email-failed", ar: "فشل الإيميل", en: "Email Fail" },
          ].map((item) => {
            const active = adminOpsFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setAdminOpsFilter(item.key)}
                style={{
                  border: `1px solid ${active ? "rgba(248,113,113,0.62)" : "rgba(248,113,113,0.28)"}`,
                  background: active ? "rgba(248,113,113,0.16)" : "rgba(255,255,255,0.05)",
                  color: active ? "#fecaca" : "#fca5a5",
                  borderRadius: 10,
                  padding: "6px 4px",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                {lang === "ar" ? item.ar : item.en}
              </button>
            );
          })}
        </div>

        {adminOpsFilter === "delayed" && (
          <div style={{ marginBottom: 8 }}>
            <select
              value={adminDelayedStageKey}
              onChange={(event) => setAdminDelayedStageKey(event.target.value)}
              style={{
                width: "100%",
                border: "1px solid rgba(248,113,113,0.35)",
                background: "rgba(255,255,255,0.06)",
                color: "#fecaca",
                borderRadius: 10,
                padding: "7px 8px",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              <option value="contact48">{lang === "ar" ? "متأخر في: جاري التواصل" : "Delayed in: Contacting"}</option>
              <option value="contacted">{lang === "ar" ? "متأخر في: تم التواصل" : "Delayed in: Contacted"}</option>
              <option value="inProgress">{lang === "ar" ? "متأخر في: جاري البدء" : "Delayed in: In Progress"}</option>
              <option value="done">{lang === "ar" ? "متأخر في: إنهاء الخدمة" : "Delayed in: Done"}</option>
            </select>
          </div>
        )}

        <input
          value={adminOrdersQuery}
          onChange={(event) => setAdminOrdersQuery(event.target.value)}
          placeholder={lang === "ar" ? "بحث برقم الطلب أو اسم العميل أو الهاتف" : "Search by order ID, customer, or phone"}
          style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(212,175,55,0.30)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 11, fontWeight: 700, padding: "8px 10px", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}
        />

        {!!adminOrdersError && (
          <div style={{ marginTop: 8, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 14, padding: "8px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.6, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
            {adminOrdersError}
          </div>
        )}

        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {filteredAdminOrdersForView.map((orderItem, index) => {
            const orderId = String(orderItem.id || orderItem.firebaseId || orderItem.serialLabel || `order-${index + 1}`);
            const isExpanded = adminExpandedOrderId === orderId;
            const busy = adminOrderActionBusyId === orderId;
            const currentStageIndex = Number.isInteger(orderItem?.statusIndex)
              ? orderItem.statusIndex
              : Math.max(0, STATUS_STEP_KEYS.findIndex((key) => !(orderItem?.stageConfirmations || {})[key]) - 1);
            const orderTitle = lang === "ar"
              ? `طلب رقم ${index + 1}`
              : `Order #${index + 1}`;
            const hasWhatsapp = String(orderItem.whatsappNumber || "").length >= 8;
            const whatsappMessage = encodeURIComponent(
              lang === "ar"
                ? `مرحبًا ${orderItem.customerName || "عميلنا الكريم"}\n\nمتابعة طلبك:\nرقم الطلب: ${orderItem.serialLabel || "-"}\nالخدمة: ${orderItem.serviceName || "-"}\nالدولة: ${orderItem.countryName || "-"}\nالجنسية: ${orderItem.nationalityName || "-"}\nالتاريخ: ${orderItem.createdAtLabel || "-"}\n\nنحن معك لأي استفسار.`
                : `Hello ${orderItem.customerName || "dear customer"},\n\nOrder follow-up:\nOrder ID: ${orderItem.serialLabel || "-"}\nService: ${orderItem.serviceName || "-"}\nCountry: ${orderItem.countryName || "-"}\nNationality: ${orderItem.nationalityName || "-"}\nDate: ${orderItem.createdAtLabel || "-"}\n\nWe are here for any questions.`
            );
            const whatsappHref = hasWhatsapp
              ? `https://wa.me/${orderItem.whatsappNumber}?text=${whatsappMessage}`
              : "#";

            return (
              <div
                key={orderId}
                style={{ borderRadius: 14, border: "1px solid rgba(212,175,55,0.22)", background: "rgba(255,255,255,0.05)", padding: "8px 9px", cursor: "pointer" }}
                onClick={() => setAdminSelectedOrderId(orderId)}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 900, lineHeight: 1.25 }}>{orderTitle}</div>
                    <div style={{ color: "#cbd5e1", fontSize: 10, marginTop: 2 }}>
                      {lang === "ar" ? "رقم الطلب" : "Order ID"}: {orderItem.serialLabel || "—"}
                    </div>
                    <div style={{ color: "#93c5fd", fontSize: 10, marginTop: 1 }}>
                      {(lang === "ar" ? "العميل" : "Customer")}: {orderItem.customerName || "—"}
                    </div>
                    <div style={{ color: "#bbf7d0", fontSize: 10, marginTop: 1 }}>
                      {(lang === "ar" ? "الخدمة" : "Service")}: {orderItem.serviceName || "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleAdminDeleteOrder(orderItem)}
                      disabled={busy}
                      title={lang === "ar" ? "حذف الطلب نهائيًا" : "Delete order permanently"}
                      style={{
                        width: 27, height: 27, borderRadius: 9,
                        border: "1px solid rgba(239,68,68,0.45)",
                        background: "rgba(239,68,68,0.16)",
                        color: "#fca5a5",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, cursor: busy ? "not-allowed" : "pointer",
                        opacity: busy ? 0.5 : 1,
                      }}
                    >🗑️</button>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => {
                        if (!hasWhatsapp) {
                          event.preventDefault();
                          setAdminOrdersError(lang === "ar" ? "لا يوجد رقم واتساب صالح لهذا الطلب." : "No valid WhatsApp number for this order.");
                        }
                      }}
                      title={lang === "ar" ? "متابعة الطلب عبر واتساب" : "Follow up via WhatsApp"}
                      style={{
                        width: 27,
                        height: 27,
                        borderRadius: 9,
                        border: "1px solid rgba(37,211,102,0.45)",
                        background: "rgba(37,211,102,0.16)",
                        color: "#4ade80",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        fontSize: 14,
                        fontWeight: 900,
                        opacity: hasWhatsapp ? 1 : 0.45,
                        cursor: hasWhatsapp ? "pointer" : "not-allowed",
                      }}
                    >
                      ☏
                    </a>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 5, color: "rgba(245,215,123,0.7)", fontSize: 9, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                    {lang === "ar" ? "اضغط على البطاقة لعرض التفاصيل الكاملة" : "Tap card to view full details"}
                  </div>
                )}
              </div>
            );
          })}

          {!adminOrdersLoading && filteredAdminOrdersForView.length === 0 && (
            <div style={{ borderRadius: 14, border: "1px dashed rgba(212,175,55,0.28)", background: "rgba(255,255,255,0.04)", padding: "12px 10px", textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 11, lineHeight: 1.7, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {lang === "ar"
                ? `لا توجد طلبات ضمن الفلتر: ${adminOrdersFilterLabel} | ${adminOpsFilterLabel}.`
                : `No orders found for filter: ${adminOrdersFilterLabel} | ${adminOpsFilterLabel}.`}
            </div>
          )}
        </div>
        </div>

        {/* ===== ORDER DETAIL PAGE ===== */}
        {(() => {
          if (!adminSelectedOrderId || adminPanelSection !== "orders") return null;
          const detailOrder = filteredAdminOrdersForView.find(
            (o) => String(o.id || o.firebaseId || o.serialLabel || "").trim() === adminSelectedOrderId
          ) || adminOrders.find(
            (o) => String(o.id || o.firebaseId || o.serialLabel || "").trim() === adminSelectedOrderId
          );
          if (!detailOrder) return null;
          const dBusy = adminOrderActionBusyId === adminSelectedOrderId;
          const dStageIndex = Number.isInteger(detailOrder?.statusIndex)
            ? detailOrder.statusIndex
            : Math.max(0, STATUS_STEP_KEYS.findIndex((key) => !(detailOrder?.stageConfirmations || {})[key]) - 1);
          const hasWa = String(detailOrder.whatsappNumber || "").length >= 8;
          const waMsg = encodeURIComponent(
            lang === "ar"
              ? `مرحبًا ${detailOrder.customerName || "عميلنا الكريم"}\n\nمتابعة طلبك:\nرقم الطلب: ${detailOrder.serialLabel || "-"}\nالخدمة: ${detailOrder.serviceName || "-"}\nالدولة: ${detailOrder.countryName || "-"}\nالجنسية: ${detailOrder.nationalityName || "-"}\nالتاريخ: ${detailOrder.createdAtLabel || "-"}\n\nنحن معك لأي استفسار.`
              : `Hello ${detailOrder.customerName || "dear customer"},\n\nOrder follow-up:\nOrder ID: ${detailOrder.serialLabel || "-"}\nService: ${detailOrder.serviceName || "-"}\nCountry: ${detailOrder.countryName || "-"}\nNationality: ${detailOrder.nationalityName || "-"}\nDate: ${detailOrder.createdAtLabel || "-"}\n\nWe are here for any questions.`
          );
          const waHref = hasWa ? `https://wa.me/${detailOrder.whatsappNumber}?text=${waMsg}` : "#";

          const detailFields = [
            [lang === "ar" ? "رقم الطلب" : "Order ID", detailOrder.serialLabel || "—"],
            [lang === "ar" ? "اسم العميل" : "Customer", detailOrder.customerName || "—"],
            [lang === "ar" ? "رقم الهاتف" : "Phone", detailOrder.customerPhone || "—"],
            [lang === "ar" ? "الخدمة" : "Service", detailOrder.serviceName || "—"],
            [lang === "ar" ? "الدولة" : "Country", detailOrder.countryName || "—"],
            [lang === "ar" ? "الجنسية" : "Nationality", detailOrder.nationalityName || "—"],
            [lang === "ar" ? "التاريخ" : "Date", detailOrder.createdAtLabel || "—"],
            [lang === "ar" ? "الحالة" : "Status", String(detailOrder.status || detailOrder.orderStatus || "new")],
            [lang === "ar" ? "التقييم" : "Rating", `${Number(detailOrder.ratingValue || detailOrder.rating || 0)}/5`],
            [lang === "ar" ? "التعليق" : "Comment", String(detailOrder.reviewTextValue || detailOrder.reviewText || "—")],
            [lang === "ar" ? "حالة الإيميل" : "Email Status", String(detailOrder.emailDeliveryStatus || "—")],
          ];

          return (
            <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(212,175,55,0.38)", background: "rgba(255,255,255,0.04)", padding: "12px 12px 14px" }}>
              <div style={{ color: "#e7c55b", fontSize: 13, fontWeight: 900, fontFamily: "'Cairo',sans-serif", marginBottom: 10 }}>
                {lang === "ar" ? "تفاصيل الطلب" : "Order Details"}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {detailFields.map(([label, value]) => (
                  <div key={label} style={{ borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 8px" }}>
                    <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                    <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 800, wordBreak: "break-word", lineHeight: 1.3 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
                <button
                  onClick={() => handleAdminOrderSetStage(detailOrder, Math.min(STATUS_STEP_KEYS.length - 1, (Number(dStageIndex) || 0) + 1))}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#166534)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {dBusy ? (lang === "ar" ? "جارٍ..." : "...") : (lang === "ar" ? "المرحلة التالية" : "Next Stage")}
                </button>
                <button
                  onClick={() => handleAdminOrderSetStage(detailOrder, 0)}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f59e0b,#b45309)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {lang === "ar" ? "إرجاع للبداية" : "Reset Stage"}
                </button>
                <button
                  onClick={() => handleAdminOrderEditDetails(detailOrder)}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {lang === "ar" ? "تعديل البيانات" : "Edit Data"}
                </button>
                <button
                  onClick={() => handleAdminOrderClearReview(detailOrder)}
                  disabled={dBusy}
                  style={{ padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#4c1d95)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
                >
                  {lang === "ar" ? "حذف التقييم" : "Delete Review"}
                </button>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => { if (!hasWa) { e.preventDefault(); setAdminOrdersError(lang === "ar" ? "لا يوجد رقم واتساب." : "No WhatsApp number."); } }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", padding: "9px 8px", borderRadius: 10, marginBottom: 7,
                  border: "1px solid rgba(37,211,102,0.45)", background: "rgba(37,211,102,0.14)",
                  color: "#4ade80", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif",
                  textDecoration: "none", opacity: hasWa ? 1 : 0.45, cursor: hasWa ? "pointer" : "not-allowed",
                }}
              >
                ☏ {lang === "ar" ? "متابعة عبر واتساب" : "Follow up via WhatsApp"}
              </a>

              <button
                onClick={() => handleAdminDeleteOrder(detailOrder)}
                disabled={dBusy}
                style={{ width: "100%", padding: "9px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 11, fontWeight: 900, fontFamily: "'Cairo',sans-serif", cursor: dBusy ? "not-allowed" : "pointer", opacity: dBusy ? 0.6 : 1 }}
              >
                {lang === "ar" ? "🗑️ حذف الطلب نهائيًا" : "🗑️ Delete Order Permanently"}
              </button>
            </div>
          );
        })()}

        <div style={{ marginTop: 12, borderRadius: 18, border: "1px solid rgba(34,197,94,0.32)", background: "rgba(255,255,255,0.04)", padding: "10px 10px 12px", display: (adminPanelSection === "providers" || adminPanelSection === "providerDetails") ? "block" : "none" }}>
          <div style={{ marginBottom: 8, color: "#bbf7d0", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>{lang === "ar" ? "طلبات مزودي الخدمات" : "Service Provider Requests"}</span>
            <span style={{ color: "#bbf7d0", fontSize: 10, fontWeight: 800 }}>
              {filteredAdminProviderRequestsForView.length} / {providerRequestsVisible.length}
            </span>
          </div>

          <input
            value={adminProviderRequestsQuery}
            onChange={(event) => setAdminProviderRequestsQuery(event.target.value)}
            placeholder={lang === "ar" ? "بحث بالاسم أو السيريال أو الإيميل" : "Search by name, serial, or email"}
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 11, fontWeight: 700, padding: "8px 10px", marginBottom: 8, fontFamily: "'Cairo',sans-serif" }}
          />

          {!!adminProviderRequestsError && (
            <div style={{ marginBottom: 8, color: "#fecaca", background: "rgba(127,29,29,0.24)", border: "1px solid rgba(248,113,113,0.32)", borderRadius: 12, padding: "8px 10px", textAlign: "center", fontSize: 11, lineHeight: 1.6, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
              {adminProviderRequestsError}
            </div>
          )}

          {adminPanelSection === "providerDetails" && selectedAdminProviderRequest ? (
            <div style={{ display: "grid", gap: 7 }}>
              <div style={{ borderRadius: 14, border: "1px solid rgba(74,222,128,0.45)", background: "rgba(255,255,255,0.05)", padding: "10px" }}>
                <div style={{ color: "#f8fafc", fontSize: 12, fontWeight: 900, marginBottom: 8 }}>
                  {lang === "ar" ? "تفاصيل مقدم الخدمة" : "Service Provider Details"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    [lang === "ar" ? "الاسم" : "Name", selectedAdminProviderRequest?.providerNameValue || selectedAdminProviderRequest?.providerName || selectedAdminProviderRequest?.officeName || "—"],
                    [lang === "ar" ? "السيريال" : "Serial", selectedAdminProviderRequest?.serialLabel || selectedAdminProviderRequest?.id || "—"],
                    [lang === "ar" ? "الإيميل" : "Email", selectedAdminProviderRequest?.emailValue || selectedAdminProviderRequest?.email || "—"],
                    [lang === "ar" ? "الهاتف" : "Phone", selectedAdminProviderRequest?.phone || "—"],
                    [lang === "ar" ? "واتساب" : "WhatsApp", selectedAdminProviderRequest?.whatsapp || "—"],
                    [lang === "ar" ? "الدولة" : "Country", selectedAdminProviderRequest?.countryValue || selectedAdminProviderRequest?.country || "—"],
                    [lang === "ar" ? "المدينة" : "City", selectedAdminProviderRequest?.city || "—"],
                    [lang === "ar" ? "الجنسية" : "Nationality", selectedAdminProviderRequest?.nationalityValue || selectedAdminProviderRequest?.nationality || "—"],
                    [lang === "ar" ? "السجل التجاري" : "Commercial Register", selectedAdminProviderRequest?.commercialRegister || "—"],
                    [lang === "ar" ? "البطاقة الضريبية" : "Tax Card", selectedAdminProviderRequest?.taxCard || "—"],
                    [lang === "ar" ? "رابط البورتفوليو" : "Portfolio", selectedAdminProviderRequest?.portfolioLink || "—"],
                    [lang === "ar" ? "التاريخ" : "Created At", selectedAdminProviderRequest?.createdAtLabel || "—"],
                  ].map(([label, value]) => (
                    <div key={`${label}-${value}`} style={{ borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 7px" }}>
                      <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                      <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, wordBreak: "break-word", lineHeight: 1.35 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 7, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "7px" }}>
                  <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{lang === "ar" ? "الخدمات" : "Services"}</div>
                  <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, lineHeight: 1.45 }}>
                    {((selectedAdminProviderRequest?.servicesValue || selectedAdminProviderRequest?.services || []).join(" • ")) || (lang === "ar" ? "لا توجد خدمات" : "No services")}
                  </div>
                </div>

                <div style={{ marginTop: 7, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "7px" }}>
                  <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{lang === "ar" ? "الوصف" : "Description"}</div>
                  <div style={{ color: "#f8fafc", fontSize: 10, fontWeight: 800, lineHeight: 1.45, wordBreak: "break-word" }}>
                    {selectedAdminProviderRequest?.notes || "—"}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                  {(() => {
                    const statusValue = String(selectedAdminProviderRequest?.statusValue || selectedAdminProviderRequest?.status || "pending").toLowerCase();
                    const detailId = String(selectedAdminProviderRequest?.id || "").trim();
                    const busy = adminProviderActionBusyId === detailId;

                    if (statusValue === "pending") {
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <button onClick={() => handleAdminProviderDecision(selectedAdminProviderRequest, "approved")} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#166534)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "اعتماد" : "Approve")}
                          </button>
                          <button onClick={() => handleAdminProviderDecision(selectedAdminProviderRequest, "rejected")} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "رفض" : "Reject")}
                          </button>
                        </div>
                      );
                    }

                    if (statusValue === "approved") {
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <button onClick={() => handleAdminProviderBlock(selectedAdminProviderRequest)} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f97316,#b45309)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "🚫 حظر" : "🚫 Block")}
                          </button>
                          <button onClick={() => handleAdminProviderDelete(selectedAdminProviderRequest)} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                            {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "🗑️ حذف" : "🗑️ Delete")}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button onClick={() => handleAdminProviderDelete(selectedAdminProviderRequest)} disabled={busy} style={{ padding: "7px 8px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#7f1d1d)", color: "#fff", fontSize: 10, fontWeight: 900, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.65 : 1 }}>
                        {busy ? (lang === "ar" ? "جارٍ التنفيذ..." : "Updating...") : (lang === "ar" ? "🗑️ حذف الطلب" : "🗑️ Delete Request")}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 7 }}>
              {filteredAdminProviderRequestsForView.map((entry, index) => {
                const requestId = String(entry?.id || "").trim();
                const statusValue = String(entry?.statusValue || entry?.status || "pending").toLowerCase();
                const statusLabel = statusValue === "approved"
                  ? (lang === "ar" ? "معتمد" : "Approved")
                  : statusValue === "rejected"
                    ? (lang === "ar" ? "مرفوض" : "Rejected")
                    : statusValue === "blocked"
                      ? (lang === "ar" ? "محظور" : "Blocked")
                      : (lang === "ar" ? "قيد المراجعة" : "Pending");
                const statusColor = statusValue === "approved" ? "#22c55e" : statusValue === "rejected" ? "#ef4444" : statusValue === "blocked" ? "#f97316" : "#f59e0b";

                return (
                  <button
                    key={requestId || `provider-${index + 1}`}
                    onClick={() => {
                      setAdminSelectedProviderRequestId(requestId);
                      setAdminPanelSection("providerDetails");
                    }}
                    style={{ width: "100%", textAlign: dir === "rtl" ? "right" : "left", borderRadius: 14, border: `1px solid ${statusColor}44`, background: "rgba(255,255,255,0.05)", padding: "9px", cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#f8fafc", fontSize: 11, fontWeight: 900, lineHeight: 1.35 }}>
                          {lang === "ar" ? `مقدم خدمة رقم ${index + 1}` : `Provider #${index + 1}`}
                        </div>
                        <div style={{ color: "#93c5fd", fontSize: 10, marginTop: 2 }}>{entry?.providerNameValue || entry?.officeName || "—"}</div>
                        <div style={{ color: "#cbd5e1", fontSize: 10, marginTop: 2 }}>
                          {lang === "ar" ? "السيريال" : "Serial"}: {entry?.serialLabel || requestId || "—"}
                        </div>
                      </div>
                      <div style={{ padding: "3px 8px", borderRadius: 999, background: `${statusColor}22`, border: `1px solid ${statusColor}66`, color: statusColor, fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>
                        {statusLabel}
                      </div>
                    </div>
                  </button>
                );
              })}

              {!adminProviderRequestsLoading && filteredAdminProviderRequestsForView.length === 0 && (
                <div style={{ borderRadius: 14, border: "1px dashed rgba(34,197,94,0.40)", background: "rgba(255,255,255,0.03)", padding: "12px 10px", textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 11, lineHeight: 1.7, fontWeight: 700, fontFamily: "'Cairo',sans-serif" }}>
                  {lang === "ar" ? "لا توجد طلبات مزودي خدمات مطابقة للبحث." : "No matching service provider requests."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  
  );
}
