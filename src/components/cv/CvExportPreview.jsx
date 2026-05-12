import React, { useMemo, useState } from "react";
import { buildCvPreviewDocument } from "./cvExportDocument";

const previewModes = ["bilingual", "ar", "en"];

const CvExportPreview = ({ cvData, lang, onClose, onExportPdf, onExportWord }) => {
  const [previewMode, setPreviewMode] = useState("bilingual");
  const [zoom, setZoom] = useState(0.8);

  const documents = useMemo(() => ({
    ar: buildCvPreviewDocument(cvData, "ar"),
    en: buildCvPreviewDocument(cvData, "en"),
  }), [cvData]);

  const visibleModes = previewMode === "bilingual" ? ["ar", "en"] : [previewMode];
  const copy = lang === "ar"
    ? {
        title: "معاينة احترافية للسيرة الذاتية",
        subtitle: "عرض A4 جاهز للطباعة والتصدير باللغتين مع تكبير وتصغير مباشر.",
        bilingual: "عربي + إنجليزي",
        ar: "عربي فقط",
        en: "إنجليزي فقط",
        zoomOut: "تصغير",
        zoomIn: "تكبير",
        exportPdf: "تصدير PDF",
        exportWord: "تصدير Word",
        close: "إغلاق",
      }
    : {
        title: "Professional CV Preview",
        subtitle: "A print-ready A4 preview with live zoom and bilingual layouts.",
        bilingual: "Arabic + English",
        ar: "Arabic Only",
        en: "English Only",
        zoomOut: "Zoom Out",
        zoomIn: "Zoom In",
        exportPdf: "Export PDF",
        exportWord: "Export Word",
        close: "Close",
      };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(2,6,23,0.76)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 2, padding: "14px 18px", background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))", borderBottom: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 14px 34px rgba(0,0,0,0.28)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", fontFamily: "'Cairo',sans-serif", marginBottom: 4 }}>{copy.title}</div>
            <div style={{ fontSize: 11, color: "#cbd5e1", fontFamily: "'Cairo',sans-serif" }}>{copy.subtitle}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
            {previewModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                style={{ border: "1px solid rgba(251,191,36,0.34)", borderRadius: 999, padding: "8px 12px", background: previewMode === mode ? "linear-gradient(135deg,#fbbf24,#d97706)" : "rgba(255,255,255,0.06)", color: previewMode === mode ? "#111827" : "#f8fafc", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
              >
                {copy[mode]}
              </button>
            ))}
            <button type="button" onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(2))))} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 12px", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>− {copy.zoomOut}</button>
            <div style={{ minWidth: 58, textAlign: "center", color: "#fbbf24", fontSize: 12, fontWeight: 900, fontFamily: "'Cairo',sans-serif" }}>{Math.round(zoom * 100)}%</div>
            <button type="button" onClick={() => setZoom((value) => Math.min(1.2, Number((value + 0.1).toFixed(2))))} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 12px", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>+ {copy.zoomIn}</button>
            <button type="button" onClick={() => onExportPdf(previewMode === "bilingual" ? "en" : previewMode)} style={{ border: "none", borderRadius: 12, padding: "9px 14px", background: "linear-gradient(135deg,#fee2e2,#fda4af)", color: "#9f1239", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>{copy.exportPdf}</button>
            <button type="button" onClick={() => onExportWord(previewMode === "bilingual" ? "en" : previewMode)} style={{ border: "none", borderRadius: 12, padding: "9px 14px", background: "linear-gradient(135deg,#dbeafe,#93c5fd)", color: "#1d4ed8", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>{copy.exportWord}</button>
            <button type="button" onClick={onClose} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "9px 14px", background: "rgba(255,255,255,0.08)", color: "#f8fafc", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>{copy.close}</button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "22px 18px 34px", background: "radial-gradient(circle at top, rgba(59,130,246,0.14), transparent 28%), linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: visibleModes.length === 2 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)", gap: 18, alignItems: "start", maxWidth: visibleModes.length === 2 ? 1680 : 860, margin: "0 auto" }}>
          {visibleModes.map((mode) => (
            <div key={mode} style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ zoom, transformOrigin: "top center" }} dangerouslySetInnerHTML={{ __html: documents[mode] }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CvExportPreview;