# Adzuna API Integration Guide

This document outlines the implementation of real external job fetching using the Adzuna Jobs API in the AI Job Tracker application.

## ✅ Implementation Summary

The backend now integrates with the **Adzuna Jobs API** to fetch real-world job listings with seamless fallback to mock data. The implementation follows a clean architecture pattern with clear separation of concerns.

## Architecture Overview

### Backend Service: `jobFetcher.js`
Located at: `backend/src/services/jobFetcher.js`

**Responsibilities:**
- Fetches jobs from Adzuna API
- Transforms Adzuna response into standardized internal schema
- Handles API errors gracefully with fallback to mock data
- Supports filtering by role, location, job type, and posting date
- Never hardcodes API credentials

### API Routes: `jobs.js`
Located at: `backend/src/routes/jobs.js`

**Endpoints:**
1. **GET `/api/jobs`** - Primary endpoint for fetching jobs from Adzuna
2. **GET `/api/jobs/mock`** - Direct access to mock jobs with filters

## Environment Configuration

### Credentials Setup

Update `backend/.env` with your Adzuna credentials:

```env
# Adzuna API Configuration
ADZUNA_APP_ID=149b0533
ADZUNA_APP_KEY=8d54003c8e0499ea35b447dc69b3b7c0

# Other existing variables...
OPENAI_API_KEY=...
```

**✅ Already Configured** with provided credentials.

## API Endpoints

### 1. Fetch Jobs from Adzuna API

```
GET /api/jobs?q=developer&location=London&jobType=Full-time&daysPosted=7
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query (role/skill) | `frontend developer` |
| `location` | string | Filter by location | `London` |
| `jobType` | string | Filter by job type | `Full-time`, `Contract` |
| `daysPosted` | number | Jobs posted in last N days | `7`, `30` |
| `mock` | boolean | Force mock data (for testing) | `true` |

**Response Format:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": "5620371658",
      "title": "Software Engineer II, RSVP",
      "company": "Google",
      "location": "London, UK",
      "description": "...",
      "applyUrl": "https://www.adzuna.co.uk/jobs/...",
      "jobType": "Full-time",
      "salary": "40040.35 - 40040.35",
      "postedAt": "2026-02-08T09:39:14Z",
      "source": "adzuna"
    },
    ...
  ]
}
```

**Examples:**
```bash
# Search for frontend developers in London
curl "http://localhost:5000/api/jobs?q=frontend%20developer&location=London"

# Get recent React jobs (posted in last 7 days)
curl "http://localhost:5000/api/jobs?q=react&daysPosted=7"

# Full-time positions in UK
curl "http://localhost:5000/api/jobs?jobType=Full-time"

# Force mock data for testing
curl "http://localhost:5000/api/jobs?q=developer&mock=true"
```

### 2. Get Mock Jobs

```
GET /api/jobs/mock?q=react&location=Bangalore
```

**Query Parameters:**
Same as above (without `mock` parameter)

**Response Format:**
```json
{
  "success": true,
  "count": 3,
  "source": "mock",
  "data": [
    {
      "id": "job-1",
      "title": "Frontend Developer (React)",
      "company": "TCS",
      "location": "Bangalore, India",
      "description": "Build responsive web applications using React...",
      "applyUrl": "https://example.com/apply/1",
      "jobType": "Full-time",
      "postedAt": "2026-02-07T12:05:01.748Z",
      "industry": "Software"
    },
    ...
  ]
}
```

## Job Schema

All jobs are normalized to this internal schema:

```javascript
{
  id: string,                    // Unique job identifier
  title: string,                 // Job title
  company: string,               // Company name
  location: string,              // Location/city
  description: string,           // Full job description
  applyUrl: string,              // URL to apply
  jobType: string,               // "Full-time", "Contract", etc.
  salary?: string,               // Salary range (if available)
  postedAt: string,              // ISO format date string
  source?: string                // "adzuna" or "mock"
}
```

## Error Handling & Fallback Strategy

### Graceful Degradation

The system implements a robust fallback mechanism:

```
Try Adzuna API
    ↓
API Success? → Return real jobs
    ↓ NO
API Failed / No Results
    ↓
Return mock jobs
    ↓
Log error for debugging
```

**Error Handled:**
- Network timeout (10 seconds)
- API rate limiting
- Invalid credentials
- Empty results
- Malformed responses

All errors are logged to console without crashing the app.

### Example Error Flow:

```
console.log("Using mock jobs (API credentials not configured)")
// OR
console.error("Adzuna API error:", {
  message: "Error details",
  status: 401,
  statusText: "Unauthorized"
})
console.log("Falling back to mock data due to API error")
```

## Feature Implementation

### ✅ Real Job Fetching
- Live integration with Adzuna Jobs API
- 50 jobs per request
- Sorted by posting date

### ✅ Easy Fallback
- No configuration required - automatically uses mock data if API fails
- Support for `?mock=true` to force mock data in testing

### ✅ Seamless Integration with Filters
- Role/skill filtering
- Location filtering
- Job type filtering
- Date posted filtering
- Works with both Adzuna and mock data

### ✅ AI Matching Ready
- Full job descriptions included
- Structured data format
- All required fields for resume matching

### ✅ Functional Requirements
- [x] Fetch jobs from Adzuna using backend service
- [x] No frontend→API direct calls (backend abstraction only)
- [x] Environment variables for credentials
- [x] Normalized job data schema
- [x] Support for: Role, Location, Job type, Date posted filters
- [x] Includes: Title, Company, Location, Description, Type, Salary, URL, Posted date
- [x] Graceful error handling
- [x] Fallback to mock jobs
- [x] App doesn't crash on API failure

## Service Implementation Details

### `transformAdzunaJob(job)`
Converts Adzuna API response to internal schema:
```javascript
function transformAdzunaJob(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.display_name || "Unknown Company",
    location: job.location?.display_name || "Unknown Location",
    description: job.description || "",
    applyUrl: job.redirect_url,
    jobType: job.contract_time || "Full-time",
    salary: job.salary_min && job.salary_max 
      ? `${job.salary_min} - ${job.salary_max}` 
      : job.salary_is_predicted ? "Estimated: Contact for details" : null,
    postedAt: job.created,
    source: "adzuna",
  };
}
```

### `filterMockJobs(jobs, filters)`
Client-side filtering for mock data:
- **query**: Search in title, company, description
- **location**: Exact location match
- **jobType**: Exact job type match
- **daysPosted**: Recent jobs within N days

### `fetchJobs(query, filters, useMock)`
Main service function:
- Validates environment variables
- Makes API request with parameters
- Transforms response
- Catches errors and falls back to mock
- Returns normalized jobs array

### `getMockJobs(filters)`
Direct access to mock jobs for fallback endpoint.

## Testing

### Test Real API
```bash
# Navigate to project root
cd c:\Users\Naidu\Downloads\ai-job-tracker

# Start backend
cd backend && npm start

# In another terminal, test the endpoint
node -e "fetch('http://localhost:5000/api/jobs?q=developer').then(r => r.json()).then(d => console.log(d))"
```

### Server Logs Show:
```
Fetching jobs from Adzuna API for: "developer"
Successfully fetched 50 jobs from Adzuna
```

### Test Mock Endpoint
```bash
node -e "fetch('http://localhost:5000/api/jobs/mock?q=react').then(r => r.json()).then(d => console.log(d))"
```

### Test with Filters
```bash
# Location filter
curl "http://localhost:5000/api/jobs/mock?q=developer&location=Bangalore"

# Job type filter
curl "http://localhost:5000/api/jobs/mock?jobType=Full-time"

# Date filter
curl "http://localhost:5000/api/jobs/mock?daysPosted=7"
```

## Integration with AI Matching

The job descriptions fetched from Adzuna are now available for:
1. Resume matching via `matchService.js`
2. AI-powered recommendations
3. Skill gap analysis
4. Job compatibility scoring

## Files Modified

### 1. `backend/.env`
- Added Adzuna credentials:
  - `ADZUNA_APP_ID=149b0533`
  - `ADZUNA_APP_KEY=8d54003c8e0499ea35b447dc69b3b7c0`

### 2. `backend/src/services/jobFetcher.js`
**Complete rewrite with:**
- Adzuna API integration
- Transform function for data normalization
- Filter functions for mock jobs
- Comprehensive error handling
- Fallback mechanism
- JSDoc documentation

**Key additions:**
```javascript
// Transform Adzuna response
function transformAdzunaJob(job) { ... }

// Filter mock jobs
function filterMockJobs(jobs, filters) { ... }

// Main fetch function
export async function fetchJobs(query, filters, useMock) { ... }

// Get mock directly
export function getMockJobs(filters) { ... }
```

### 3. `backend/src/routes/jobs.js`
**Updated to use jobFetcher service:**

```javascript
// Old: Used hardcoded jobsData
// New: Calls fetchJobs() with Adzuna integration

app.get("/api/jobs", async (request, reply) => {
  // Extract filters from query params
  const { q, location, jobType, daysPosted, mock } = request.query;
  
  // Build filter object
  const filters = { location, jobType, daysPosted };
  
  // Fetch from Adzuna (with mock fallback)
  const jobs = await fetchJobs(q, filters, mock === "true");
  
  return {
    success: true,
    count: jobs.length,
    data: jobs
  };
});
```

## Dependencies Used

- **axios** - HTTP client for Adzuna API calls (already installed)
- **dotenv** - Environment variable management (already installed)
- **Node.js built-in** - No additional packages needed

## Troubleshooting

### Issue: "Using mock jobs (API credentials not configured)"
**Solution:** Ensure `.env` file has:
```env
ADZUNA_APP_ID=149b0533
ADZUNA_APP_KEY=8d54003c8e0499ea35b447dc69b3b7c0
```

### Issue: API returns "401 Unauthorized"
**Solution:** Verify credentials are correct. They may have expired or been revoked.

### Issue: Network timeout
**Solution:** The API has a 10-second timeout. Check your internet connection.

### Issue: No jobs returned
**Solution:** Try a different search query or check the Adzuna API status.

## Future Enhancements

1. **Caching** - Cache API results to reduce API calls
2. **Rate Limiting** - Implement client-side rate limiting
3. **Multiple Providers** - Add Indeed, LinkedIn API integration
4. **Advanced Filters** - Salary range, experience level filtering
5. **Job Search History** - Store and analyze job searches
6. **CORS Support** - Enable frontend direct calls (if needed)

## Summary

✅ **Complete Integration Achieved**

- Real jobs fetched from Adzuna API
- Seamless fallback to mock data
- Clean backend abstraction (no frontend API calls)
- Comprehensive filtering support
- Robust error handling
- AI matching compatible
- Production-ready error logs
- Zero modifications to frontend needed
- Fully tested and working

The AI Job Tracker now provides real-world job listings while maintaining reliability through intelligent fallback mechanisms.
