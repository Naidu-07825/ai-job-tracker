import React from "react";

export default function Filters({ filters, setFilters }) {
  const update = (k, v) => setFilters({ ...filters, [k]: v });

  // Predefined skill options
  const commonSkills = [
    "React", "Node.js", "Python", "Java", "JavaScript",
    "TypeScript", "SQL", "MongoDB", "AWS", "Docker",
    "Kubernetes", "Angular", "Vue.js", "C++", "Go",
    "PHP", "C#", ".NET", "Ruby", "Django", "Flask"
  ];

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    outline: "none",
  };

  // Parse selected skills from filter string
  const selectedSkills = filters.skills
    ? filters.skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const handleSkillToggle = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    update("skills", updated.join(", "));
  };

  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        marginBottom: "25px",
      }}
    >
      <h3 style={{ margin: "0 0 20px 0", color: "#1f2937", fontSize: "18px", fontWeight: "600" }}>
        🔍 Filters
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Role / Title */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Role / Title
          </label>
          <input
            placeholder="e.g., React Developer"
            value={filters.title || ""}
            onChange={(e) => update("title", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        {/* Location */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Location
          </label>
          <input
            placeholder="e.g., Bangalore, India"
            value={filters.location || ""}
            onChange={(e) => update("location", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        {/* Date Posted */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Date Posted
          </label>
          <select
            value={filters.datePosted || "any"}
            onChange={(e) => update("datePosted", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="any">Any time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last week</option>
            <option value="30d">Last month</option>
          </select>
        </div>

        {/* Match Score */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Match Score
          </label>
          <select
            value={filters.match || "all"}
            onChange={(e) => update("match", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="all">All scores</option>
            <option value="high">High (&gt;70%)</option>
            <option value="medium">Medium (40-70%)</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Job Type
          </label>
          <select
            value={filters.jobType || "all"}
            onChange={(e) => update("jobType", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="all">All types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {/* Work Mode */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Work Mode
          </label>
          <select
            value={filters.workMode || "all"}
            onChange={(e) => update("workMode", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="all">All modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-site</option>
          </select>
        </div>
      </div>

      {/* Skills - Multi-select */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            fontSize: "13px",
            fontWeight: "600",
            display: "block",
            marginBottom: "12px",
            color: "#374151",
          }}
        >
          Select Skills (or type custom ones below)
        </label>
        
        {/* Skill Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
            maxHeight: "140px",
            overflowY: "auto",
            padding: "8px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          {commonSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: selectedSkills.includes(skill)
                  ? "2px solid #667eea"
                  : "1px solid #d1d5db",
                background: selectedSkills.includes(skill)
                  ? "#dbeafe"
                  : "white",
                color: selectedSkills.includes(skill)
                  ? "#0c4a6e"
                  : "#4b5563",
                fontSize: "12px",
                fontWeight: selectedSkills.includes(skill) ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!selectedSkills.includes(skill)) {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedSkills.includes(skill)) {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.background = "white";
                }
              }}
            >
              {selectedSkills.includes(skill) ? "✓ " : ""}{skill}
            </button>
          ))}
        </div>

        <label
          style={{
            fontSize: "12px",
            fontWeight: "500",
            display: "block",
            marginBottom: "6px",
            color: "#6b7280",
          }}
        >
          Selected: {selectedSkills.length > 0 ? selectedSkills.join(", ") : "None"}
        </label>

        <input
          value={filters.skills || ""}
          onChange={(e) => update("skills", e.target.value)}
          placeholder="Add custom skills (comma-separated)"
          style={{
            ...inputStyle,
            fontSize: "12px",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setFilters({})}
          style={{
            flex: 1,
            padding: "10px 16px",
            border: "1px solid #d1d5db",
            background: "white",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#f3f4f6";
            e.target.style.borderColor = "#9ca3af";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "white";
            e.target.style.borderColor = "#d1d5db";
          }}
        >
          Clear All
        </button>
        <button
          onClick={() => console.log("Filters applied:", filters)}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
