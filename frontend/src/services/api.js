import axios from "axios";

// Allow overriding backend URL with Vite env `VITE_API_URL`, fallback to localhost:5010
const backendHost = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: `${backendHost}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// helper to build full URLs when needed
export function apiUrl(path) {
  return `${backendHost}${path}`;
}

/**
 * Fetch jobs from backend `/api/jobs` endpoint.
 * Accepts an object with optional keys: q, location, jobType, daysPosted, mock
 */
export async function getJobs({ q = "", location = "", jobType = "", daysPosted = "", mock = false } = {}) {
  const params = {};
  if (q) params.q = q;
  if (location) params.location = location;
  if (jobType) params.jobType = jobType;
  if (daysPosted) params.daysPosted = daysPosted;
  if (mock) params.mock = mock;

  const res = await api.get("/jobs", { params });
  return res.data; // { success, count, data }
}