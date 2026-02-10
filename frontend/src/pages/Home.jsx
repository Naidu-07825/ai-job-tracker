import { useState, useRef, useEffect } from "react";
import { getJobs } from "../services/api.js";

export default function Home({ userName, onResumeCheck, onNavigateToJobs, resumeUploaded }) {
  const [showMap, setShowMap] = useState(false);

  // Jobs fetched from backend
  const [jobs, setJobs] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterJobType, setFilterJobType] = useState("");
  const [filterDaysPosted, setFilterDaysPosted] = useState("");

  async function fetchAndSetJobs(opts = {}) {
    setLoadingJobs(true);
    try {
      const resp = await getJobs(opts);
      // resp shape: { success, count, data }
      if (resp && resp.data) setJobs(resp.data);
      else if (Array.isArray(resp)) setJobs(resp);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    // initial load
    fetchAndSetJobs({ q: "developer" });
  }, []);

  return (
    <div style={{ background: "#ffffff", color: "#1f2937", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* ============ HERO SECTION ============ */}
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "80px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            transform: "translate(100px, -100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            transform: "translate(-100px, 100px)",
          }}
        />

        <div
          style={{
            maxWidth: "900px",
            width: "100%",
            textAlign: "center",
            color: "white",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "800",
              margin: "0 0 24px 0",
              lineHeight: "1.2",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              letterSpacing: "-1px",
            }}
          >
            🚀 AI-Powered Job Tracking & Smart Career Matching
          </h1>
          <p
            style={{
              fontSize: "24px",
              margin: "0 0 40px 0",
              opacity: 0.95,
              fontWeight: "300",
              lineHeight: "1.6",
            }}
          >
            Find jobs that truly match your skills — powered by AI. Upload your resume and let our intelligent matching engine find your perfect opportunity.
          </p>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "30px" }}>
            <button
              onClick={onNavigateToJobs}
              style={{
                background: "white",
                color: "#667eea",
                padding: "16px 40px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.2)";
              }}
            >
              ✨ Get Started
            </button>

            <button
              onClick={onResumeCheck}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "16px 40px",
                border: "2px solid white",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              📄 Upload Resume
            </button>
          </div>

          {resumeUploaded && (
            <p style={{ color: "#e0e7ff", fontSize: "14px", fontWeight: "500" }}>
              ✅ Resume uploaded! Ready to find your perfect job match.
            </p>
          )}
        </div>
      </div>


      {/* ============ LATEST JOBS (from backend) ============ */}
      <section style={{ padding: "60px 20px", background: "#ffffff", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", marginBottom: "18px", color: "#1f2937" }}>
          🧭 Latest Jobs
        </h2>
        <p style={{ textAlign: "center", color: "#6b7280", marginTop: 0, marginBottom: 24 }}>Live jobs from Adzuna (with mock fallback)</p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search roles, companies, skills" style={{ padding: 12, width: 300, borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <input value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} placeholder="Location (e.g., London)" style={{ padding: 12, width: 200, borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <select value={filterJobType} onChange={(e) => setFilterJobType(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <option value="">Any type</option>
            <option value="Full-time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
          </select>
          <input value={filterDaysPosted} onChange={(e) => setFilterDaysPosted(e.target.value)} placeholder="Posted within (days)" style={{ padding: 12, width: 160, borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <button onClick={() => fetchAndSetJobs({ q: searchQ, location: filterLocation, jobType: filterJobType, daysPosted: filterDaysPosted })} style={{ padding: "12px 18px", background: "#667eea", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Search</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {loadingJobs && <div style={{ gridColumn: "1/-1", textAlign: "center" }}>Loading jobs…</div>}
          {!loadingJobs && jobs && jobs.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#6b7280" }}>No jobs found for current filters.</div>
          )}

          {jobs && jobs.map((job) => (
            <div key={job.id} style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e6eefb" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 18 }}>{job.title}</h3>
              <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>{job.company} • {job.location}</div>
              <div style={{ fontSize: 13, color: "#374151", height: 56, overflow: "hidden", marginBottom: 8 }}>{job.description?.replace(/(<([^>]+)>)/gi, "").slice(0, 220)}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{job.jobType || job.contract_time || ""}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {job.applyUrl && (
                    <a href={job.applyUrl} target="_blank" rel="noreferrer" style={{ background: "#10b981", color: "white", padding: "8px 10px", borderRadius: 8, textDecoration: "none", fontSize: 13 }}>Apply</a>
                  )}
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{job.postedAt ? new Date(job.postedAt).toLocaleDateString() : ""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section style={{ padding: "100px 20px", background: "#f9fafb", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "44px", fontWeight: "800", marginBottom: "60px", color: "#1f2937" }}>
          🎯 Powerful Features
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              background: "white",
              padding: "40px 30px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
              AI Resume Matching
            </h3>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
              Our advanced AI analyzes your resume and matches you with the most suitable job opportunities with detailed explanations.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              background: "white",
              padding: "40px 30px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
              Smart Job Filters
            </h3>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
              Filter jobs by location, salary, job type, skills required, and match percentage to find exactly what you're looking for.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              background: "white",
              padding: "40px 30px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
              Application Tracking
            </h3>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
              Track all your applications in one place. Monitor application status and get instant notifications when you receive offers.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            style={{
              background: "white",
              padding: "40px 30px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
              AI Assistant
            </h3>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
              Get personalized recommendations and career guidance powered by AI. Ask questions and get instant answers about job opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS SECTION ============ */}
      <section style={{ padding: "100px 20px", background: "#f3f4f6" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "44px", fontWeight: "800", marginBottom: "60px", color: "#1f2937" }}>
            🎬 How It Works
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px" }}>
            {/* Step 1 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "700",
                  margin: "0 auto 20px",
                }}
              >
                1️⃣
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
                Sign Up / Login
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: "0", lineHeight: "1.6" }}>
                Create your account or log in with your credentials. Takes less than a minute!
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "700",
                  margin: "0 auto 20px",
                }}
              >
                2️⃣
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
                Upload Resume
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: "0", lineHeight: "1.6" }}>
                Upload your resume in PDF or DOC format. Our AI instantly analyzes your skills and experience.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "700",
                  margin: "0 auto 20px",
                }}
              >
                3️⃣
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
                Get AI-Matched Jobs
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: "0", lineHeight: "1.6" }}>
                See job opportunities ranked by match percentage. Each job shows why it's a good fit for you.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "700",
                  margin: "0 auto 20px",
                }}
              >
                4️⃣
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#1f2937" }}>
                Apply & Track
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: "0", lineHeight: "1.6" }}>
                Apply to jobs and track your applications. Automatic updates when you get selected or receive offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER SECTION ============ */}
      <footer style={{ background: "#1f2937", color: "white", padding: "60px 20px 30px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            {/* Company Info */}
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 16px 0" }}>🚀 Job Tracker</h3>
              <p style={{ margin: "0 0 12px 0", color: "#d1d5db", fontSize: "14px", lineHeight: "1.6" }}>
                AI-Powered Job Tracking & Smart Career Matching. Find jobs that truly match your skills.
              </p>
              <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "16px" }}>
                <p style={{ margin: "4px 0" }}>© 2026 TC Consulting Services</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 16px 0" }}>📞 Contact Us</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>📞</span>
                  <div>
                    <p style={{ margin: "0", fontSize: "14px", color: "#d1d5db" }}>Phone</p>
                    <a
                      href="tel:+919441800447"
                      style={{
                        color: "#667eea",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#764ba2")}
                      onMouseLeave={(e) => (e.target.style.color = "#667eea")}
                    >
                      +91 94418 00447
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>✉</span>
                  <div>
                    <p style={{ margin: "0", fontSize: "14px", color: "#d1d5db" }}>Email</p>
                    <a
                      href="mailto:info@tcconsultingservices.in"
                      style={{
                        color: "#667eea",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#764ba2")}
                      onMouseLeave={(e) => (e.target.style.color = "#667eea")}
                    >
                      info@tcconsultingservices.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 16px 0" }}>📍 Address</h3>
              <p style={{ margin: "0 0 12px 0", color: "#d1d5db", fontSize: "14px", lineHeight: "1.8" }}>
                <strong>TC Consulting Services</strong> <br />
                Hyderabad <br />
                Telangana, India
              </p>
              <button
                onClick={() => {
                  window.open(
                    "https://www.google.com/maps/search/Hyderabad+Telangana+India/@17.3850,78.4867,13z",
                    "_blank"
                  );
                }}
                style={{
                  background: "#667eea",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  marginTop: "12px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#764ba2";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#667eea";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🗺️ Get Directions
              </button>
            </div>
          </div>

          {/* Map Section */}
          {showMap && (
            <div style={{ marginBottom: "40px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              <iframe
                title="Company Location"
                width="100%"
                height="400"
                style={{ border: "none" }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.9220263876936!2d78.4744053!3d17.3850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91c1a0000001%3A0x1000!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1623456789"
              />
            </div>
          )}

          {/* Bottom divider and copyright */}
          <div style={{ borderTop: "1px solid #374151", paddingTop: "30px", textAlign: "center" }}>
            <p style={{ margin: "0", color: "#9ca3af", fontSize: "13px" }}>
              © {new Date().getFullYear()} TC Consulting Services. All rights reserved. | Powered by AI Job Tracker
            </p>
          </div>
        </div>
      </footer>

      {/* Show map toggle button */}
      <style>
        {`
          @media (max-width: 768px) {
            h1 { font-size: 36px !important; }
            h2 { font-size: 28px !important; }
            .feature-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>
    </div>
  );
}
