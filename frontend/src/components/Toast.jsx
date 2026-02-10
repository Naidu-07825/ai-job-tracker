import { useState, useEffect } from "react";

let toastId = 0;

// Global toast state manager
let toastCallback = null;

export const showToast = (message, type = "success", duration = 3000) => {
  if (toastCallback) {
    const id = toastId++;
    toastCallback({ id, message, type, duration });
  }
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallback = (newToastOrUpdater) => {
      if (typeof newToastOrUpdater === "function") {
        setToasts(newToastOrUpdater);
      } else {
        setToasts((prev) => [...prev, newToastOrUpdater]);
        if (newToastOrUpdater.duration > 0) {
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newToastOrUpdater.id));
          }, newToastOrUpdater.duration);
        }
      }
    };

    return () => {
      toastCallback = null;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {Array.isArray(toasts) && toasts.map((toast) => {
        const bgColor = {
          success: "#dcfce7",
          error: "#fee2e2",
          warning: "#fef3c7",
          info: "#dbeafe",
        }[toast.type] || "#dcfce7";

        const borderColor = {
          success: "#bbf7d0",
          error: "#fecaca",
          warning: "#fde68a",
          info: "#bfdbfe",
        }[toast.type] || "#bbf7d0";

        const textColor = {
          success: "#166534",
          error: "#991b1b",
          warning: "#92400e",
          info: "#0c4a6e",
        }[toast.type] || "#166534";

        const icon = {
          success: "✅",
          error: "❌",
          warning: "⚠️",
          info: "ℹ️",
        }[toast.type] || "✅";

        return (
          <div
            key={toast.id}
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              color: textColor,
              padding: "14px 18px",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "slideIn 0.3s ease-out",
              pointerEvents: "auto",
              maxWidth: "400px",
              minWidth: "250px",
            }}
          >
            <span style={{ fontSize: "18px" }}>{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(400px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
