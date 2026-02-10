import React from "react";

export default function ApplicationModal({ isOpen, job, onConfirm, onCancel }) {
  if (!isOpen || !job) return null;

  const handleBackdropClick = () => {
    onCancel();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <style>
          {`
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}
        </style>

        <h2 style={{ margin: "0 0 10px 0", color: "#1f2937", fontSize: "24px", fontWeight: "700" }}>
          📝 Did you apply?
        </h2>
        <p style={{ margin: "0 0 25px 0", color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>
          We opened <strong>{job.title}</strong> at <strong>{job.company}</strong> for you. Did you submit an application?
        </p>

        {/* Option Buttons */}
        <div style={{ display: "grid", gap: "12px" }}>
          {/* Yes, Applied */}
          <button
            onClick={() => onConfirm("yes")}
            style={{
              padding: "14px 20px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#059669";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 12px rgba(16, 185, 129, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#10b981";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(16, 185, 129, 0.2)";
            }}
          >
            ✅ Yes, I Applied
          </button>

          {/* Applied Earlier */}
          <button
            onClick={() => onConfirm("earlier")}
            style={{
              padding: "14px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 12px rgba(59, 130, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.2)";
            }}
          >
            ⏰ Applied Earlier
          </button>

          {/* No, Just Browsing */}
          <button
            onClick={() => onConfirm("no")}
            style={{
              padding: "14px 20px",
              background: "#e5e7eb",
              color: "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#d1d5db";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#e5e7eb";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            ✕ No, Just Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
