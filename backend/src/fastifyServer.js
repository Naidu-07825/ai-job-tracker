import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";

import authRoute from "./routes/auth.js";
import jobsRoute from "./routes/jobs.js";
import resumeRoute from "./routes/resume.js";
import applicationsRoute from "./routes/applications.js";
import langRoute from "./routes/lang.js";
import setupAIRoutes from "./routes/ai.js";
import { matchResumeWithJob } from "./services/matchService.js";
import store from "./data/store.js";

await store.initStore();

dotenv.config();

const app = Fastify({ logger: true });

await app.register(fastifyCors, { origin: true });
// Register multipart with limits to avoid interfering with JSON
await app.register(multipart, {
  limits: {
    fieldNameSize: 100,
    fieldSize: 1000000,
    fields: 10,
    fileSize: 16777216,
    files: 1,
    headerPairs: 2000,
  }
});

// Register routes (each file exports a default function that receives `app`)
authRoute(app);
jobsRoute(app);
resumeRoute(app);
applicationsRoute(app);
langRoute(app);
setupAIRoutes(app);

app.post("/api/match", async (request, reply) => {
  try {
    // Get body - Fastify should parse JSON automatically
    const body = request.body;
    
    if (!body) {
      app.log.warn("Match request received with no body");
      return reply.status(400).send({ error: "Missing request body" });
    }

    const { resumeText, jobDescription } = body;

    app.log.debug({ resumeLength: resumeText?.length, jobDescLength: jobDescription?.length }, "Match request");

    if (!resumeText || !jobDescription) {
      return reply.status(400).send({ 
        error: "Missing input data",
        received: { hasResume: !!resumeText, hasJobDesc: !!jobDescription }
      });
    }

    const result = await matchResumeWithJob(resumeText, jobDescription);
    return result;
  } catch (err) {
    app.log.error({ error: err, message: err.message }, "Match endpoint error");
    
    // Check if it's a resume validation error
    if (err.message.includes("Invalid resume format")) {
      return reply.status(400).send({ 
        error: "❌ Invalid resume format. Please upload a proper resume with education, experience, and skills information."
      });
    }
    
    return reply.status(500).send({ error: "AI matching failed", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen({ port: Number(PORT), host: "0.0.0.0" }).then(() => {
  app.log.info(`🚀 AI Job Tracker (Fastify) running on port ${PORT}`);
});
