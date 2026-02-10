import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import { showToast } from "../components/Toast";
import ApplicationModal from "../components/ApplicationModal";

function AnimatedProgressRing({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score > 70 ? "#16a34a" : score >= 40 ? "#f59e0b" : "#6b7280";

  return (
    <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>
        {`
          @keyframes fillRing {
            from {
              stroke-dashoffset: ${circumference};
            }
            to {
              stroke-dashoffset: ${strokeDashoffset};
            }
          }
          .progress-ring {
            animation: fillRing 1.5s ease-out forwards;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
          }
        `}
      </style>
      <svg width="120" height="120" style={{ position: "absolute" }}>
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        {/* Animated progress circle */}
        <circle
          className="progress-ring"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: "28px", fontWeight: "700", color: color }}>
          {score}%
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600" }}>
          Match
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score > 70 ? "#16a34a" : score >= 40 ? "#f59e0b" : "#6b7280";
  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "600",
      }}
    >
      {score}% Match
    </span>
  );
}

export default function Jobs({ filters = {}, resumeUploaded = false }) {
  const [allJobs, setAllJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalJobs, setTotalJobs] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [offeredJobs, setOfferedJobs] = useState(new Set());
  const [applyingJob, setApplyingJob] = useState(null);
  const [isRecalculatingScores, setIsRecalculatingScores] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const jobsContainerRef = useRef(null);
  const scoreUpdateTimeoutRef = useRef(null);

  useEffect(() => {
    // load first page
    async function loadJobsPage(p = 1) {
      try {
        setLoadingMore(true);
        const resp = await api.get("/jobs", { params: { q: "developer", page: p, limit: 20 } });
        const jobsData = resp?.data?.data || resp?.data || [];
        const total = resp?.data?.count ?? null;

        if (p === 1) {
          setAllJobs((jobsData || []).map((job) => ({ ...job, matchScore: 0, explanation: "" })));
        } else {
          setAllJobs((prev) => [...prev, ...(jobsData || []).map((job) => ({ ...job, matchScore: 0, explanation: "" }))]);
        }

        setTotalJobs(total);
        // If we've loaded all jobs or received fewer than page size, stop
        if (!jobsData || jobsData.length === 0 || (total !== null && (p * 20) >= total)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoadingMore(false);
      }
    }

    loadJobsPage(1);
  }, []);

  // load more when page changes (page > 1)
  useEffect(() => {
    if (page === 1) return;
    loadMoreJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadMoreJobs() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const p = page;
      const resp = await api.get("/jobs", { params: { q: "developer", page: p, limit: 20 } });
      const jobsData = resp?.data?.data || resp?.data || [];
      setAllJobs((prev) => [...prev, ...(jobsData || []).map((job) => ({ ...job, matchScore: 0, explanation: "" }))]);
      const total = resp?.data?.count ?? null;
      setTotalJobs(total);
      if (!jobsData || jobsData.length === 0 || (total !== null && (p * 20) >= total)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more jobs:", err);
    } finally {
      setLoadingMore(false);
    }
  }

  // scroll handler for infinite loading
  useEffect(() => {
    function onScroll() {
      if (!hasMore || loadingMore) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
      if (nearBottom) {
        setPage((p) => p + 1);
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore]);

  // Re-calculate scores when resume is uploaded
  useEffect(() => {
    async function calculateScores() {
      try {
        setIsRecalculatingScores(true);
        
        const jobsData = allJobs;
        const userEmail = localStorage.getItem("user");
        const resumeResp = await api.get("/resume/text", { params: { user: userEmail } }).catch(() => null);
        const resume = resumeResp?.data?.resume?.text || "";
        
        console.log(`📋 Loaded ${jobsData.length} jobs`);
        console.log(`📄 Resume for ${userEmail}: ${resume?.length || 0} chars`);
        
        setResumeText(resume);

        let scored = jobsData;
        if (resume && resume.length > 0) {
          showToast("🔄 Updating job match scores...", "info", 2000);
          
          scored = await Promise.all(
            jobsData.map(async (job) => {
              try {
                const m = await api.post("/match", { 
                  resumeText: resume, 
                  jobDescription: job.description || "" 
                });
                
                const matchScore = m?.data?.matchScore ?? m?.data?.score ?? 0;
                console.log(`✅ ${job.title}: ${matchScore}% match`);
                
                return {
                  ...job,
                  matchScore: matchScore,
                  explanation: m?.data?.explanation || "",
                };
              } catch (err) {
                console.error(`❌ Match failed for ${job.title}:`, err.message);
                return { 
                  ...job, 
                  matchScore: 0, 
                  explanation: `Error calculating match: ${err.message}` 
                };
              }
            })
          );
          
          // Show completion toast
          showToast("✅ Job match scores updated!", "success", 3000);
          
          // Scroll to top to see refreshed scores
          if (jobsContainerRef.current) {
            jobsContainerRef.current.scrollTop = 0;
          }
        } else {
          console.warn("⚠️ No resume found, showing all jobs with 0 match score");
          scored = jobsData.map((job) => ({ ...job, matchScore: 0, explanation: "" }));
        }

        setAllJobs(scored);
      } catch (err) {
        console.error("Failed to calculate scores:", err);
        showToast("❌ Failed to update scores", "error", 3000);
      } finally {
        setIsRecalculatingScores(false);
      }
    }

    if (resumeUploaded && allJobs.length > 0) {
      // Clear any pending timeout
      if (scoreUpdateTimeoutRef.current) {
        clearTimeout(scoreUpdateTimeoutRef.current);
      }
      
      // Debounce the calculation by 300ms to avoid multiple calls
      scoreUpdateTimeoutRef.current = setTimeout(() => {
        calculateScores();
      }, 300);
    }

    return () => {
      if (scoreUpdateTimeoutRef.current) {
        clearTimeout(scoreUpdateTimeoutRef.current);
      }
    };
  }, [resumeUploaded, allJobs.length]);

  const apply = (job) => {
    window.open(job.applyUrl, "_blank");
    setTimeout(() => {
      setModalJob(job);
      setModalOpen(true);
    }, 1000);
  };

  const handleModalConfirm = (option) => {
    const job = modalJob;
    setModalOpen(false);

    if (option === "yes" || option === "earlier") {
      // Mark as applied
      setApplyingJob(job.id);
      
      // Trigger success animation
      setTimeout(() => {
        setAppliedJobs((prev) => new Set([...prev, job.id]));
        setApplyingJob(null);
        
        // Save to backend
        api
          .post("/apply", { userEmail: localStorage.getItem("user"), job })
          .then(() => {
            showToast("✅ Application tracked!", "success", 2000);
          })
          .catch((err) => {
            console.error("Failed to track application:", err);
            showToast("❌ Failed to track application", "error", 2000);
          });
      }, 300);
    } else {
      // User chose "No, just browsing"
      showToast("👍 Got it! Feel free to review more jobs.", "info", 2000);
    }

    setModalJob(null);
  };

  const handleOffered = (jobId, jobTitle, company, salary, location) => {
    // Add to offered jobs state
    setOfferedJobs((prev) => new Set([...prev, jobId]));
    
    // Try to send offer email via backend
    const userEmail = localStorage.getItem("user");
    const userName = localStorage.getItem("userName") || userEmail?.split("@")[0] || "User";
    
    // Call backend to update application status to OFFER and send email
    api
      .post(`/applications/${userEmail}/${jobId}/status`, {
        status: "OFFER",
        location: location,
        jobTitle: jobTitle,
        company: company,
        salary: salary,
      })
      .then((response) => {
        // Show success toast
        showToast("🎉 Offer received! Confirmation email sent.", "success", 4000);
        
        // Show congratulation message
        setTimeout(() => {
          alert(`🎉 Congratulations! You've received an offer from ${company}!\n\nPosition: ${jobTitle}\nPackage: ${salary || "Competitive"}`);
        }, 500);
      })
      .catch((err) => {
        console.error("Error updating offer status:", err);
        // Still show a success message even if backend update fails
        showToast("✅ Offer marked! (Email may not have been sent)", "info", 4000);
        setTimeout(() => {
          alert(`🎉 Congratulations! You've received an offer from ${company}!\n\nPosition: ${jobTitle}`);
        }, 500);
      });
  };

  // Apply filters
  const filtered = allJobs.filter((job) => {
    if (filters.title && !job.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

    if (filters.skills) {
      const skills = filters.skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (skills.length) {
        const text = ((job.description || "") + " " + (job.title || "")).toLowerCase();
        if (!skills.some((sk) => text.includes(sk))) return false;
      }
    }

    if (resumeUploaded && filters.match && filters.match !== "all") {
      const score = job.matchScore || 0;
      if (filters.match === "high" && score <= 70) return false;
      if (filters.match === "medium" && (score < 40 || score > 70)) return false;
    }

    if (filters.jobType && filters.jobType !== "all") {
      if (!job.jobType?.toLowerCase().includes(filters.jobType.toLowerCase())) return false;
    }

    if (filters.workMode && filters.workMode !== "all") {
      if (!job.workMode?.toLowerCase().includes(filters.workMode.toLowerCase())) return false;
    }

    if (filters.datePosted && filters.datePosted !== "any") {
      const jobDate = new Date(job.postedAt);
      const now = new Date();
      let cutoffDate = new Date();

      if (filters.datePosted === "24h") cutoffDate.setDate(now.getDate() - 1);
      if (filters.datePosted === "7d") cutoffDate.setDate(now.getDate() - 7);
      if (filters.datePosted === "30d") cutoffDate.setDate(now.getDate() - 30);

      if (jobDate < cutoffDate) return false;
    }

    return true;
  });

  // Sort by match score
  const sorted = [...filtered].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  // Smart empty state logic
  const hasActiveFilters = () => {
    return !!(filters.title || filters.location || filters.skills || 
              (filters.match && filters.match !== "all") || 
              (filters.jobType && filters.jobType !== "all") || 
              (filters.workMode && filters.workMode !== "all") || 
              (filters.datePosted && filters.datePosted !== "any"));
  };

  const getUnrelaxedFilters = () => {
    const allFilters = {
      title: filters.title,
      location: filters.location,
      skills: filters.skills,
      match: filters.match,
      jobType: filters.jobType,
      workMode: filters.workMode,
      datePosted: filters.datePosted,
    };
    return Object.entries(allFilters)
      .filter(([_, v]) => v && v !== "all" && v !== "any")
      .map(([k]) => k);
  };

  const getSmartEmptyMessage = () => {
    if (!resumeUploaded) {
      return {
        icon: "📄",
        title: "No Resume Uploaded",
        message: "Upload your resume to get AI-powered match scores for jobs",
        action: null,
      };
    }

    const relaxableFilters = getUnrelaxedFilters();
    
    if (relaxableFilters.length === 0) {
      return {
        icon: "🔍",
        title: "No Jobs Available",
        message: "Check back later as new jobs are posted regularly",
        action: null,
      };
    }

    if (filters.match === "high") {
      const mediumMatches = allJobs.filter(j => {
        const score = j.matchScore || 0;
        return (score >= 40 && score <= 70);
      }).length;

      if (mediumMatches > 0) {
        return {
          icon: "📈",
          title: `No high-match jobs found`,
          message: `Found ${mediumMatches} medium-match job${mediumMatches > 1 ? 's' : ''}. Try relaxing the match score filter?`,
          action: { text: "Show Medium Matches", filter: "match", value: "all" },
        };
      }
    }

    const suggestions = {
      title: "job title",
      location: "location",
      skills: "required skills",
      jobType: "job type",
      workMode: "work mode",
      datePosted: "posting date",
    };

    const filterNames = relaxableFilters
      .map(f => suggestions[f] || f)
      .join(", ");

    return {
      icon: "🎯",
      title: "No Jobs Match Your Filters",
      message: `Try adjusting: ${filterNames}`,
      action: { text: "Clear All Filters", filter: "clearAll", value: null },
    };
  };

  const emptyState = getSmartEmptyMessage();

  return (
    <div
      style={{
        maxWidth: "100%",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>
        {`
          @keyframes cardElevate {
            0% { transform: translateY(0px); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
            100% { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
          }
          
          @keyframes applyPulse {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          
          @keyframes applySuccess {
            0% { background: #0ea5e9; }
            50% { background: #10b981; }
            100% { background: #10b981; }
          }
          
          @keyframes scoreScaleIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .job-card-hover:hover {
            animation: cardElevate 0.3s ease-out forwards;
          }
          
          .apply-button-active {
            animation: applyPulse 0.6s ease-out;
          }
          
          .score-badge-enter {
            animation: scoreScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          
          .empty-state {
            animation: slideUp 0.5s ease-out;
          }
          
          .recalculating-overlay {
            animation: pulse 1.5s ease-in-out infinite;
          }
          
          .jobs-container {
            max-height: calc(100vh - 250px);
            overflow-y: auto;
            position: relative;
            border-radius: 12px;
          }
          
          .jobs-container::-webkit-scrollbar {
            width: 8px;
          }
          
          .jobs-container::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          
          .jobs-container::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          
          .jobs-container::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>

      {/* Application Modal */}
      <ApplicationModal 
        isOpen={modalOpen} 
        job={modalJob}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <div style={{ marginBottom: "25px" }}>
        <h2 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "24px" }}>
          💼 Job Opportunities
        </h2>
        <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
          {resumeUploaded && sorted.length > 0
            ? `Showing ${sorted.length} jobs ranked by match`
            : resumeUploaded
            ? "No jobs match your filters"
            : "Upload your resume to see match scores"}
        </p>
      </div>

      {/* Recalculating scores banner */}
      {isRecalculatingScores && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: "linear-gradient(90deg, #dbeafe, #bfdbfe, #dbeafe)",
            backgroundSize: "200% 100%",
            border: "1px solid #0ea5e9",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#0369a1",
            fontSize: "14px",
            fontWeight: "500",
            animation: "shimmer 2s infinite",
          }}
        >
          <span>⚡</span>
          <span>Recalculating job matches with your resume...</span>
          <div
            style={{
              display: "inline-block",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#0ea5e9",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <div
          className="empty-state"
          style={{
            background: "#f8fafc",
            border: "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "60px 40px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {emptyState.icon}
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
            {emptyState.title}
          </h3>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px 0", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            {emptyState.message}
          </p>
          {emptyState.action && (
            <button
              onClick={() => {
                if (emptyState.action.filter === "match") {
                  window.dispatchEvent(new CustomEvent("relaxMatchFilter"));
                } else if (emptyState.action.filter === "clearAll") {
                  window.dispatchEvent(new CustomEvent("clearAllFilters"));
                }
              }}
              style={{
                background: "#667eea",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#5568d3";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#667eea";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ✨ {emptyState.action.text}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Best Matches Section */}
          {resumeUploaded && sorted.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "24px", fontWeight: "700" }}>
                  🎯 Best Matches for You
                </h2>
                <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
                  Top opportunities ranked by AI match with your resume
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                {sorted.slice(0, 8).map((job) => (
                  <div
                    key={`best-${job.id}`}
                    className="job-card-hover"
                    style={{
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      padding: "20px",
                      backgroundColor: offeredJobs.has(job.id) ? "#f0fdf4" : "white",
                      boxShadow: "0 4px 12px rgba(3, 102, 214, 0.15)",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      opacity: isRecalculatingScores ? 0.7 : 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!offeredJobs.has(job.id) && !isRecalculatingScores) {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.boxShadow = "0 12px 24px rgba(3, 102, 214, 0.25)";
                        e.currentTarget.style.borderColor = "#0ea5e9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!offeredJobs.has(job.id)) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(3, 102, 214, 0.15)";
                        e.currentTarget.style.borderColor = "#dbeafe";
                      }
                    }}
                  >
                    {/* "Best Match" badge for top job */}
                    {sorted.indexOf(job) === 0 && (
                      <div style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        ⭐ Top Match
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 4px 0", color: "#1f2937", fontSize: "16px", fontWeight: "600" }}>
                          {job.title}
                        </h3>
                        <p style={{ margin: "0 0 6px 0", color: "#6b7280", fontSize: "13px" }}>
                          <strong>{job.company}</strong> • {job.location}
                        </p>
                        {job.salary && (
                          <p style={{ margin: "0 0 6px 0", color: "#667eea", fontSize: "13px", fontWeight: "600" }}>
                            💰 {job.salary}
                          </p>
                        )}
                      </div>
                      {resumeUploaded && (
                        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          <AnimatedProgressRing score={job.matchScore || 0} />
                        </div>
                      )}
                    </div>

                    {/* Match Details */}
                    {job.matchScore && job.matchScore > 0 && (
                      <div style={{
                        background: job.matchScore > 70 ? "#f0fdf4" : job.matchScore >= 40 ? "#fffbeb" : "#f3f4f6",
                        border: `1px solid ${job.matchScore > 70 ? "#bbf7d0" : job.matchScore >= 40 ? "#fef3c7" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "12px",
                        fontSize: "13px",
                        color: job.matchScore > 70 ? "#166534" : job.matchScore >= 40 ? "#92400e" : "#4b5563",
                      }}>
                        <div style={{ fontWeight: "600", marginBottom: "6px" }}>Why you match:</div>
                        {job.details?.matchedSkills && (
                          <div style={{ marginBottom: "4px", fontSize: "12px" }}>
                            <strong>Skills:</strong> {job.details.matchedSkills.substring(0, 80)}...
                          </div>
                        )}
                        {job.details?.experience && (
                          <div style={{ marginBottom: "4px", fontSize: "12px" }}>
                            <strong>Experience:</strong> {job.details.experience.substring(0, 80)}...
                          </div>
                        )}
                        {job.explanation && (
                          <div style={{ fontSize: "12px", fontStyle: "italic" }}>
                            {job.explanation.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    )}

                    <p style={{ margin: "0 0 12px 0", color: "#4b5563", fontSize: "13px", lineHeight: "1.5" }}>
                      {job.description?.slice(0, 200)}...
                    </p>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {job.jobType && (
                        <span style={{
                          background: "#dbeafe",
                          color: "#0c4a6e",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}>
                          {job.jobType}
                        </span>
                      )}
                      {job.role && (
                        <span style={{
                          background: "#f3e8ff",
                          color: "#6b21a8",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}>
                          {job.role}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "auto" }}>
                      {!offeredJobs.has(job.id) ? (
                        <>
                          <button
                            onClick={() => apply(job)}
                            disabled={appliedJobs.has(job.id) || isRecalculatingScores}
                            className={applyingJob === job.id ? "apply-button-active" : ""}
                            style={{
                              background: applyingJob === job.id ? "#10b981" : appliedJobs.has(job.id) ? "#d1d5db" : "#0ea5e9",
                              color: "white",
                              padding: "8px 14px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: appliedJobs.has(job.id) || isRecalculatingScores ? "default" : "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "all 0.3s ease",
                              opacity: isRecalculatingScores ? 0.6 : 1,
                              flex: 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!appliedJobs.has(job.id) && applyingJob !== job.id && !isRecalculatingScores) {
                                e.target.style.background = "#0284c7";
                                e.target.style.transform = "translateY(-2px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!appliedJobs.has(job.id) && applyingJob !== job.id) {
                                e.target.style.background = "#0ea5e9";
                                e.target.style.transform = "translateY(0)";
                              }
                            }}
                          >
                            {appliedJobs.has(job.id) ? "✅ Applied" : applyingJob === job.id ? "Processing..." : "Apply"}
                          </button>

                          <button
                            onClick={() => handleOffered(job.id, job.title, job.company, job.salary, job.location)}
                            disabled={isRecalculatingScores}
                            style={{
                              background: "#10b981",
                              color: "white",
                              padding: "8px 14px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: isRecalculatingScores ? "default" : "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "all 0.3s ease",
                              opacity: isRecalculatingScores ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isRecalculatingScores) {
                                e.target.style.background = "#059669";
                                e.target.style.transform = "translateY(-2px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#10b981";
                              e.target.style.transform = "translateY(0)";
                            }}
                          >
                            Mark Offered
                          </button>
                        </>
                      ) : (
                        <div
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            padding: "8px 14px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            border: "1px solid #bbf7d0",
                            flex: 1,
                            textAlign: "center",
                          }}
                        >
                          🎉 Offer Received!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: "2px solid #e5e7eb", marginBottom: "30px", paddingTop: "30px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "20px", fontWeight: "700" }}>
                    All Jobs
                  </h2>
                  <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
                    Showing {sorted.length} jobs ranked by match
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Jobs Grid */}
          <div
            ref={jobsContainerRef}
            className="jobs-container"
            style={{
              opacity: isRecalculatingScores ? 0.7 : 1,
              transition: "opacity 0.3s ease",
              pointerEvents: isRecalculatingScores ? "auto" : "auto",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "0 0 20px 0" }}>
              {sorted.map((job) => (
                <div
                  key={job.id}
                  className="job-card-hover"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: offeredJobs.has(job.id) ? "#f0fdf4" : "white",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    opacity: isRecalculatingScores ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!offeredJobs.has(job.id) && !isRecalculatingScores) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!offeredJobs.has(job.id)) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "18px", fontWeight: "600" }}>
                        {job.title}
                      </h3>
                      <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>
                        <strong>{job.company}</strong> • {job.location}
                      </p>
                      {/* Salary/Package Display */}
                      {job.salary && (
                        <p style={{ margin: "0 0 8px 0", color: "#667eea", fontSize: "14px", fontWeight: "600" }}>
                          💰 {job.salary}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                        {job.jobType && (
                          <span
                            style={{
                              background: "#dbeafe",
                              color: "#0c4a6e",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {job.jobType}
                          </span>
                        )}
                        {job.role && (
                          <span
                            style={{
                              background: "#f3e8ff",
                              color: "#6b21a8",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {job.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      {resumeUploaded ? (
                        <div className="score-badge-enter">
                          <AnimatedProgressRing score={job.matchScore || 0} />
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "#f3f4f6",
                            color: "#9ca3af",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Resume needed
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: "0 0 15px 0", color: "#4b5563", fontSize: "13px", lineHeight: "1.6" }}>
                    {job.description?.slice(0, 300)}...
                  </p>

                  {job.explanation && resumeUploaded && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        marginBottom: "15px",
                        fontSize: "12px",
                        color: "#166534",
                      }}
                    >
                      <div style={{ fontWeight: "600", marginBottom: "4px" }}>Why you match:</div>
                      {job.details?.matchedSkills && (
                        <div style={{ marginBottom: "3px", fontSize: "11px" }}>
                          <strong>Skills:</strong> {job.details.matchedSkills}
                        </div>
                      )}
                      {job.details?.experience && (
                        <div style={{ marginBottom: "3px", fontSize: "11px" }}>
                          <strong>Experience:</strong> {job.details.experience}
                        </div>
                      )}
                      {job.details?.education && (
                        <div style={{ fontSize: "11px" }}>
                          <strong>Education:</strong> {job.details.education}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "auto" }}>
                    {!offeredJobs.has(job.id) ? (
                      <>
                        <button
                          onClick={() => apply(job)}
                          disabled={appliedJobs.has(job.id) || isRecalculatingScores}
                          className={applyingJob === job.id ? "apply-button-active" : ""}
                          style={{
                            background: applyingJob === job.id ? "#10b981" : appliedJobs.has(job.id) ? "#d1d5db" : "#0ea5e9",
                            color: "white",
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: appliedJobs.has(job.id) || isRecalculatingScores ? "default" : "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            opacity: isRecalculatingScores ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!appliedJobs.has(job.id) && applyingJob !== job.id && !isRecalculatingScores) {
                              e.target.style.background = "#0284c7";
                              e.target.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!appliedJobs.has(job.id) && applyingJob !== job.id) {
                              e.target.style.background = "#0ea5e9";
                              e.target.style.transform = "translateY(0)";
                            }
                          }}
                        >
                          {appliedJobs.has(job.id) ? "✅ Applied" : applyingJob === job.id ? "Processing..." : "Apply"}
                        </button>

                        <button
                          onClick={() => handleOffered(job.id, job.title, job.company, job.salary, job.location)}
                          disabled={isRecalculatingScores}
                          style={{
                            background: "#10b981",
                            color: "white",
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isRecalculatingScores ? "default" : "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            opacity: isRecalculatingScores ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!isRecalculatingScores) {
                              e.target.style.background = "#059669";
                              e.target.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#10b981";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          Mark Offered
                        </button>
                      </>
                    ) : (
                      <div
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        🎉 Offer Received!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {loadingMore && (
            <div style={{ marginTop: 20, textAlign: "center", gridColumn: "1 / -1" }}>
              <div style={{ display: "inline-block", padding: "8px 16px", background: "#eef2ff", borderRadius: 8 }}>Loading more jobs...</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}