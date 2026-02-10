import { fetchJobs, getMockJobs } from "../services/jobFetcher.js";
import store from "../data/store.js";

export default async function (app) {

  app.get("/api/jobs", async (request, reply) => {
    try {
      const {
        q = "",
        location = "",
        jobType = "",
        daysPosted = "",
        mock = false,
        page = undefined,
        limit = undefined,
      } = request.query;

      
      const filters = {};
      if (location) filters.location = location;
      if (jobType) filters.jobType = jobType;
      if (daysPosted) filters.daysPosted = parseInt(daysPosted, 10);

     
      const jobs = await fetchJobs(q, filters, mock === "true" || mock === true);

      
      if (jobs && jobs.length > 0) {
        await store.setJobs(jobs);
      }

      
      const total = jobs.length;
      let out = jobs;
      const p = page ? parseInt(page, 10) : null;
      const l = limit ? parseInt(limit, 10) : null;

      if (p && l) {
        const start = (p - 1) * l;
        out = jobs.slice(start, start + l);
      }

      return {
        success: true,
        count: total,
        data: out
      };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({
        success: false,
        error: "Failed to fetch jobs",
        message: err.message
      });
    }
  });

  app.get("/api/jobs/mock", async (request, reply) => {
    try {
      const {
        q = "",
        location = "",
        jobType = "",
        daysPosted = ""
      } = request.query;

      
      const filters = {};
      if (q) filters.query = q;
      if (location) filters.location = location;
      if (jobType) filters.jobType = jobType;
      if (daysPosted) filters.daysPosted = parseInt(daysPosted, 10);

      const jobs = getMockJobs(filters);

      return {
        success: true,
        count: jobs.length,
        source: "mock",
        data: jobs
      };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({
        success: false,
        error: "Failed to retrieve mock jobs"
      });
    }
  });
}