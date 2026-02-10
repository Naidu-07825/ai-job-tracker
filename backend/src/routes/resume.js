import { parseResume } from "../services/resumeParser.js";
import { isResumeContent } from "../services/matchService.js";
import store from "../data/store.js";
import fs from "fs/promises";

export default async function (app) {
  app.post("/api/resume/upload", async (request, reply) => {
    try {
      app.log.info(`Resume upload request - Content-Type: ${request.headers['content-type']}`);
      
      let user = "test@gmail.com";
      let uploadedPath = null;
      let fileName = "";
      let fileMimetype = null;
      let hasResumeFile = false;

      let parts;
      try {
        parts = request.parts();
      } catch (partErr) {
        app.log.error({ error: partErr }, "Error getting parts");
        return reply.status(400).send({ error: "Invalid request format. Please upload a file as multipart/form-data." });
      }

      for await (const part of parts) {
        app.log.info(`Part received: type=${part.type}, fieldname=${part.fieldname}`);
        
        
        if (part.type === "field" && part.fieldname === "email") {
          user = part.value || user;
          app.log.info(`Email field: ${user}`);
        }
        
        
        if (part.type === "file" && part.fieldname === "resume") {
          hasResumeFile = true;
          fileName = part.filename;
          fileMimetype = part.mimetype || "application/octet-stream";
          app.log.info(`File received: ${fileName}, mimetype: ${fileMimetype}`);

          
          const tmpPath = `./uploads/${Date.now()}-${part.filename}`;
          await fs.mkdir("./uploads", { recursive: true });
          const buffer = await part.toBuffer();
          await fs.writeFile(tmpPath, buffer);
          uploadedPath = tmpPath;
          app.log.info(`File written to: ${tmpPath}, size: ${buffer.length}`);
        }
      }

      if (!hasResumeFile) {
        app.log.warn("No resume file found in multipart request");
        return reply.status(400).send({ error: "No resume file found. Please upload a file with field name 'resume'." });
      }

      app.log.info(`Before parseResume - uploadedPath: ${uploadedPath}, fileName: ${fileName}`);

      if (uploadedPath) {
        const text = await parseResume(uploadedPath, fileMimetype || "application/pdf");
        
        app.log.info(`Resume parsed, length: ${text.length} chars, keywords check...`);
        
        
        if (!isResumeContent(text)) {
          app.log.warn(`Resume validation failed for ${user}: content too short or missing keywords`);
          app.log.warn(`  Text length: ${text.length}`);
          app.log.warn(`  Text preview: ${text.substring(0, 100)}...`);
          
          
          await fs.unlink(uploadedPath).catch(() => {});
          return reply.status(400).send({ 
            error: "❌ The uploaded file doesn't appear to be a valid resume. It must contain resume content such as education, experience, or skills. Please ensure your resume has: education/degree information, work experience, or professional skills listed." 
          });
        }
        
       
        await store.saveResume(user, text);
        
        app.log.info(`✅ Resume uploaded for ${user}, length: ${text.length} chars`);
        return { 
          success: true, 
          uploadedFor: user,
          resumeLength: text.length 
        };
      }

      app.log.error("Uploaded path is null - no file was processed");
      return reply.status(400).send({ error: "❌ No resume file found in upload. Please select a file and try again." });
    } catch (err) {
      app.log.error({ error: err, message: err.message }, "Resume upload error");
      
      
      if (err.message && (err.message.includes("multipart") || err.message.includes("Invalid"))) {
        return reply.status(400).send({ error: "❌ Invalid request format. Please upload a file as multipart form data and ensure the field name is 'resume'." });
      }
      
      
      if (err.message && err.message.includes("Parse")) {
        return reply.status(400).send({ error: "❌ Failed to parse the resume file. Please ensure it's a valid document." });
      }
      
      return reply.status(500).send({ error: "❌ Resume upload failed. Please try again with a valid resume.", message: err.message });
    }
  });

  app.get("/api/resume/text", async (request, reply) => {
    try {
      const user = request.query.user || localStorage?.getItem("user") || "test@gmail.com";
      const resumeObj = store.getResume(user);
      
      console.log(`📄 Fetching resume for ${user}:`, resumeObj ? `${resumeObj.text?.length || 0} chars` : "not found");
      
      if (!resumeObj) {
        return { resume: { text: "", uploadedAt: null } };
      }
      
      return { 
        resume: { 
          text: resumeObj.text || "",
          uploadedAt: resumeObj.uploadedAt 
        } 
      };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: "Failed to retrieve resume" });
    }
  });
}