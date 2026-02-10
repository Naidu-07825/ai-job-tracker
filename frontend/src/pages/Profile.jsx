import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function Profile({ onLogout, onViewApplications }) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [apps, setApps] = useState([]);
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("user");
    const name = localStorage.getItem("userName") || email?.split("@")[0] || "User";
    const phone = localStorage.getItem("userPhone") || "";
    setUserEmail(email);
    setUserName(name);
    setUserPhone(phone);

    // Load applications
    async function loadApps() {
      try {
        const res = await api.get("/applications", { params: { user: email } });
        setApps(res.data.applications || []);
      } catch (err) {
        console.error("Failed to load applications:", err);
      }
    }
    loadApps();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("resumeUploaded");
    onLogout();
  };

  const advance = async (appId, toStatus) => {
    const user = userEmail;
    try {
      await api.post(`/applications/${user}/${appId}/status`, { status: toStatus });
      setApps((s) =>
        s.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: toStatus,
                history: [...(a.history || []), { status: toStatus, at: new Date().toISOString() }],
              }
            : a
        )
      );

      if (toStatus === "Offer") {
        // Show congratulations
        setTimeout(() => {
          alert("🎉 Congratulations! You've received a job offer!");
        }, 300);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h1 style={{ margin: "0 0 10px 0", color: "#1f2937", fontSize: "28px" }}>
                👤 {userName}
              </h1>
              <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
                {userEmail}
              </p>
              {userPhone && (
                <p style={{ margin: "5px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
                  📱 {userPhone}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Applications Section */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ margin: "0 0 30px 0", color: "#1f2937", fontSize: "24px" }}>
            📋 Your Applications
          </h2>

          {apps.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6b7280",
              }}
            >
              <p style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                No applications yet
              </p>
              <p style={{ margin: 0, fontSize: "14px" }}>
                Start applying to jobs to see them here
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {apps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: app.status === "Offer" ? "#f0fdf4" : "#fafbfc",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#1f2937" }}>
                        {app.jobTitle}
                      </h3>
                      <p style={{ margin: "0 0 5px 0", color: "#6b7280", fontSize: "14px" }}>
                        {app.company} • {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            app.status === "Offer"
                              ? "#dcfce7"
                              : app.status === "Rejected"
                              ? "#fee2e2"
                              : app.status === "Interview"
                              ? "#dbeafe"
                              : "#fef3c7",
                          color:
                            app.status === "Offer"
                              ? "#166534"
                              : app.status === "Rejected"
                              ? "#991b1b"
                              : app.status === "Interview"
                              ? "#0c4a6e"
                              : "#92400e",
                        }}
                      >
                        {app.status}
                      </span>
                    </div>
                    {app.status !== "Offer" && app.status !== "Rejected" && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {app.status !== "Interview" && (
                          <button
                            onClick={() => advance(app.id, "Interview")}
                            style={{
                              padding: "6px 12px",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Interview
                          </button>
                        )}
                        {app.status !== "Offer" && (
                          <button
                            onClick={() => advance(app.id, "Offer")}
                            style={{
                              padding: "6px 12px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            🎉 Offer
                          </button>
                        )}
                        {app.status !== "Rejected" && (
                          <button
                            onClick={() => advance(app.id, "Rejected")}
                            style={{
                              padding: "6px 12px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Rejected
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {(app.history || []).length > 0 && (
                    <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>
                      <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>
                        Timeline:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", color: "#6b7280" }}>
                        {app.history.map((h, idx) => (
                          <li key={idx} style={{ marginBottom: "4px" }}>
                            {h.status} • {new Date(h.at).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
