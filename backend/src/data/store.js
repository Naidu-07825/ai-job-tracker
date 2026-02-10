import fs from "fs/promises";
import path from "path";
const STORE_FILE = path.resolve("./backend_store.json");
let _data = { users: {}, usersAuth: {}, resumes: {}, jobs: [], applications: {} };
async function load() {
  try {
    const txt = await fs.readFile(STORE_FILE, "utf-8");
    _data = JSON.parse(txt);
  } catch (err) {    
  }  
  _data.users = _data.users || {};
  _data.usersAuth = _data.usersAuth || {};
  _data.resumes = _data.resumes || {};
  _data.jobs = _data.jobs || [];
  _data.applications = _data.applications || {};
}
async function save() {
  await fs.writeFile(STORE_FILE, JSON.stringify(_data, null, 2), "utf-8");
}
export async function initStore() {
  await load();
}
export function saveUser(email, userData) {
  _data.usersAuth[email] = userData;
}
export function getUser(email) {
  return _data.usersAuth[email] || null;
}
export function getAllUsers() {
  return _data.usersAuth || {};
}
export function getResume(userEmail) {
  return _data.resumes[userEmail] || null;
}
export async function saveResume(userEmail, text) {
  _data.resumes[userEmail] = { text, uploadedAt: new Date().toISOString() };
  await save();
}
export function listJobs() {
  return _data.jobs || [];
}
export async function setJobs(jobs) {
  _data.jobs = jobs;
  await save();
}
export function getApplications(userEmail) {
  return _data.applications[userEmail] || [];
}
export async function addApplication(userEmail, application) {
  _data.applications[userEmail] = _data.applications[userEmail] || [];
  _data.applications[userEmail].push(application);
  await save();
}
export async function saveAll() {
  await save();
}
export default { initStore, getResume, saveResume, listJobs, setJobs, getApplications, addApplication, saveUser, getUser, getAllUsers, saveAll };