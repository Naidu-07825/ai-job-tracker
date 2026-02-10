import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UploadResume from "./pages/UploadResume";
import Jobs from "./pages/Jobs";
import AIAssistant from "./components/AIAssistant";
import Filters from "./components/Filters";
import Toast from "./components/Toast";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [filters, setFilters] = useState({});
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [userName, setUserName] = useState("");

  // Auto-restore login state
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const name = localStorage.getItem("userName");
    const resumed = localStorage.getItem("resumeUploaded");

    if (token && user) {
      setLoggedIn(true);
      setUserName(name || user?.split("@")[0] || "User");
      // If no resume uploaded yet, redirect to jobs page to upload
      setCurrentPage(resumed === "true" ? "home" : "jobs");
      if (resumed === "true") {
        setResumeUploaded(true);
      }
    }
  }, []);

  const handleAIAction = (action) => {
    if (!action) return;

    switch (action.action) {
      case "updateFilters":
        setFilters((prev) => ({ ...prev, ...action.params }));
        break;
      case "clearFilters":
        setFilters({});
        break;
      case "showApplyPrompt":
        console.log("AI prompted to show apply dialog");
        break;
      case "showHelp":
        console.log("AI showing help");
        break;
      default:
        console.log("Unknown AI action:", action.action);
    }
  };

  const handleLogin = () => {
    const name = localStorage.getItem("userName");
    setUserName(name || "User");
    setLoggedIn(true);
    setCurrentPage("jobs");
  };

  const handleRegister = () => {
    const name = localStorage.getItem("userName");
    setUserName(name || "User");
    setLoggedIn(true);
    // After registration, redirect to jobs page to upload resume
    setCurrentPage("jobs");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentPage("login");
    setResumeUploaded(false);
  };

  const handleResumeUpload = () => {
    setResumeUploaded(true);
    localStorage.setItem("resumeUploaded", "true");
  };

  if (!loggedIn) {
    return (
      <>
        <style>
          {`
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; background: #fafbfc; }
          `}
        </style>
        {currentPage === "login" ? (
          <Login onLogin={handleLogin} onRegisterClick={() => setCurrentPage("register")} />
        ) : (
          <Register onRegisterSuccess={handleRegister} onBackToLogin={() => setCurrentPage("login")} />
        )}
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafbfc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Toast />
      <style>
        {`
          * { box-sizing: border-box; }
          body { margin: 0; background: #fafbfc; }
        `}
      </style>

      {/* Navigation Header */}
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 20px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                cursor: "pointer",
              }}
              onClick={() => setCurrentPage("home")}
            >
              🚀 Job Tracker
            </h1>
            {currentPage !== "home" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage("home")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f3f4f6";
                    e.target.style.color = "#1f2937";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "none";
                    e.target.style.color = "#6b7280";
                  }}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage("jobs")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f3f4f6";
                    e.target.style.color = "#1f2937";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "none";
                    e.target.style.color = "#6b7280";
                  }}
                >
                  Jobs
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setCurrentPage("profile")}
            style={{
              background: "#f3f4f6",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.target.style.background = "#f3f4f6")}
          >
            👤 Profile
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        {currentPage === "home" && (
          <Home
            userName={userName}
            onResumeCheck={() => setCurrentPage("jobs")}
            onNavigateToJobs={() => setCurrentPage("jobs")}
            resumeUploaded={resumeUploaded}
          />
        )}

        {currentPage === "jobs" && (
          <>
            <UploadResume onUploadSuccess={handleResumeUpload} />
            <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              <div>
                <Filters filters={filters} setFilters={setFilters} />
                <Jobs filters={filters} resumeUploaded={resumeUploaded} />
              </div>
            </div>
            <AIAssistant 
              filters={filters} 
              setFilters={setFilters}
              onFilterUpdate={(updatedFilters) => {
                setFilters((prev) => ({ ...prev, ...updatedFilters }));
              }}
            />
          </>
        )}

        {currentPage === "profile" && <Profile onLogout={handleLogout} onViewApplications={() => setCurrentPage("profile")} />}
      </div>
    </div>
  );
}