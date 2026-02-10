import { useState } from "react";
import { apiUrl } from "../services/api";

export default function UploadResume({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setUploadStatus("❌ Invalid file format. Please upload PDF, DOC, DOCX, or TXT files only.");
      e.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setUploadStatus("❌ File size exceeds 10MB limit. Please upload a smaller file.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadStatus("");

    const form = new FormData();
    form.append("resume", file);
    form.append("email", localStorage.getItem("user") || "test@gmail.com");

    try {
      const res = await fetch(apiUrl("/api/resume/upload"), {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadStatus("✅ Resume uploaded successfully!");
        localStorage.setItem("resumeUploaded", "true");
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        // Clear status after 3 seconds
        setTimeout(() => setUploadStatus(""), 3000);
      } else {
        setUploadStatus(data.error || "❌ Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload error. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "25px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        marginBottom: "25px",
      }}
    >
      <h2 style={{ margin: "0 0 15px 0", color: "#1f2937", fontSize: "20px" }}>
        📄 Upload Your Resume <span style={{ color: "#dc2626" }}>*</span>
      </h2>
      <p style={{ margin: "0 0 20px 0", color: "#6b7280", fontSize: "14px" }}>
        Upload your resume to get AI-powered job match scores
      </p>

      <div
        style={{
          border: "2px dashed #d1d5db",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          backgroundColor: "#f9fafb",
        }}
      >
        <input
          type="file"
          onChange={upload}
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.txt"
          style={{
            display: "none",
            cursor: "pointer",
          }}
          id="resume-input"
        />
        <label
          htmlFor="resume-input"
          style={{
            cursor: isUploading ? "not-allowed" : "pointer",
            display: "block",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>📎</div>
          <p style={{ margin: "0 0 5px 0", color: "#374151", fontWeight: "600", fontSize: "14px" }}>
            {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
          </p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>
            PDF, DOC, DOCX (Max 10MB)
          </p>
        </label>
      </div>

      {uploadStatus && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            backgroundColor: uploadStatus.includes("✅") ? "#f0fdf4" : "#fef2f2",
            color: uploadStatus.includes("✅") ? "#166534" : "#991b1b",
            border: uploadStatus.includes("✅") ? "1px solid #bbf7d0" : "1px solid #fecaca",
          }}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
}