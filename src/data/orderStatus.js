export const STATUS_STEPS_AR = [
  { key: "paid",       icon: "✅", label: "تم الدفع",                    duration: null },
  { key: "contact48",  icon: "📞", label: "جاري التواصل مع العميل",       duration: "خلال 48 ساعة" },
  { key: "contacted",  icon: "🤝", label: "تم التواصل مع العميل",         duration: null },
  { key: "inProgress", icon: "⚙️", label: "جاري البدء في الخدمة",         duration: "3 – 7 أيام" },
  { key: "done",       icon: "🎉", label: "تم الانتهاء من تنفيذ الخدمة",  duration: null },
];
export const STATUS_STEPS_EN = [
  { key: "paid",       icon: "✅", label: "Payment Confirmed",   duration: null },
  { key: "contact48",  icon: "📞", label: "Contacting Client",   duration: "Within 48 hrs" },
  { key: "contacted",  icon: "🤝", label: "Client Contacted",    duration: null },
  { key: "inProgress", icon: "⚙️", label: "Service In Progress", duration: "3 – 7 days" },
  { key: "done",       icon: "🎉", label: "Service Completed",   duration: null },
];

export const STATUS_STEP_KEYS = STATUS_STEPS_AR.map((step) => step.key);

