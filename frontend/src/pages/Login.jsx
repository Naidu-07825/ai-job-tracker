import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function Login({ onLogin, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-refresh for demo purposes
  useEffect(() => {
    const storedEmail = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedEmail && storedToken) {
      setEmail(storedEmail);
    }
  }, []);

  const login = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", email);
        if (res.data.user?.name) {
          localStorage.setItem("userName", res.data.user.name);
        }
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "50px 40px",
          maxWidth: "450px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", margin: "0 0 10px 0", color: "#1f2937" }}>
            🚀 Job Tracker
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Find your perfect tech job
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              border: "1px solid #fecaca",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: 500 }}>
            Email Address <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: 5 }}>
            Password <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: loading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)")}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Test Credentials Hint */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "13px", fontWeight: "600" }}>
            💡 Test Credentials
          </p>
          <p style={{ margin: "0 0 4px 0", color: "#16a34a", fontSize: "12px" }}>
            <strong>Email:</strong> test@gmail.com
          </p>
          <p style={{ margin: "0", color: "#16a34a", fontSize: "12px" }}>
            <strong>Password:</strong> test@123
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#6b7280", fontSize: "14px" }}>
          Don't have an account?{" "}
          <button
            onClick={onRegisterClick}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}