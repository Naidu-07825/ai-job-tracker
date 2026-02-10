# 🚀 AI Job Tracker - Quick Start Guide

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- OpenAI API key (optional, for better AI matching)

### Step 1: Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup (in new terminal)
cd frontend
npm install
```

### Step 2: Configure Environment (Optional)

Create `.env` file in `backend/` directory:
```
OPENAI_API_KEY=your-api-key-here
PORT=5000
```

### Step 3: Start the Application

```bash
# Terminal 1: Start Backend Server
cd backend
npm start
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend Dev Server
cd frontend
npm run dev
# Opens on http://localhost:5173 (or shown in terminal)
```

### Step 4: Access the Application

Open your browser and go to: `http://localhost:5173`

## 🔐 Demo Credentials

- **Email**: test@gmail.com
- **Password**: test@123

Or create a new account by clicking "Create one" on the login page.

## 📋 Features Overview

### 1️⃣ **Home Page**
- Welcome message
- Feature overview cards
- Resume upload prompt
- Quick navigation to jobs

### 2️⃣ **Jobs Page**
- Browse 50+ jobs across multiple categories
- Upload resume to enable AI matching
- Apply to jobs directly
- View match scores (shows only after resume upload)
- Use advanced filters

### 3️⃣ **AI Assistant**
- Click 🤖 AI button (bottom-right)
- Ask natural language questions
- Get smart filter suggestions
- Examples:
  - "Show me React developer jobs"
  - "Find remote backend roles"
  - "Filter high match positions"

### 4️⃣ **Profile Page**
- View your name and email
- See all applications
- Track application status
- Mark jobs as "Offer received"
- See application timeline

## 🎯 How to Find Jobs

1. **Login** with your credentials
2. **Home Page**: Click "Upload Resume" or "Explore Jobs"
3. **Upload Resume** on Jobs page (PDF, DOC, DOCX, TXT)
4. **View Match Scores** - AI ranks jobs by compatibility
5. **Filter Jobs**:
   - By role (React, Python, etc.)
   - By location (India-focused)
   - By match score
   - By job type (Full-time, Remote, etc.)
   - By skills
6. **Apply** to jobs - opens job posting in new tab
7. **Confirm Application** when prompted

## 🤖 AI Assistant Tips

The AI understands natural language. Try:

```
"Find React developer jobs in Bangalore"
"Show me remote backend salary positions"
"Filter high match jobs"
"Find DevOps engineers"
"Clear all filters"
"Full-time Python roles"
"Show startup jobs"
```

## 📊 Job Categories Available

### Software Engineering (25+ roles)
- Frontend (React, Vue, Angular)
- Backend (Node.js, Python, Java)
- Full Stack
- DevOps
- Data Science & ML
- Mobile Development
- Cloud & Infrastructure

### Hardware & IoT (8+ roles)
- Embedded Systems
- FPGA Development
- IoT Engineering
- PCB Design
- Firmware Development
- Hardware Testing

### Business & Management (12+ roles)
- Product Manager
- Business Analyst
- Sales Engineer
- Operations Manager
- Finance & Strategy
- HR & Marketing

## 💡 User Journey Examples

### Example 1: Job Applicant
1. Register new account
2. Upload resume on Jobs page
3. See match scores appear
4. Use AI: "React jobs in Bangalore"
5. Apply to matching positions
6. Go to Profile to track applications

### Example 2: Feature Exploration
1. Login with test account
2. Explore Home page
3. Upload resume
4. Use AI assistant to find roles
5. Apply to jobs


6. Mark as "Offer received" for favorite job
7. View congratulations message
8. Check Profile for application timelines

### Example 3: Advanced Filtering
1. Login and navigate to Jobs
2. Upload resume
3. Use Filters panel:
   - Role: "Backend"
   - Location: Keep India (default)
   - Match Score: "High (>70%)"
   - Job Type: "Full-time"
   - Skills: "Python, FastAPI"
4. View filtered results sorted by match

## 🔍 Match Score Explanation

### Match Score System
- **Green (>70%)**: Excellent match - Highly recommended
- **Yellow (40-70%)**: Good match - Worth considering
- **Gray (<40%)**: Fair match - May need skill development

### How it Works
The AI compares your resume against the job description to:
1. Identify matching skills
2. Calculate compatibility percentage
3. Explain why it's a good/poor match
4. Suggest key required skills

**Note**: Match scores only appear after uploading a resume.

## 📱 Using on Different Devices

### Desktop
- Full-featured experience
- All functionality available
- Optimal for applying to jobs

### Tablet
- Responsive layout
- Touch-friendly buttons
- Good match score visibility

### Mobile
- Responsive design
- Finger-friendly buttons
- Scrollable filter panel
- Compact job cards

## ⚠️ Troubleshooting

### Problem: Backend won't start
```bash
# Check if port 5000 is available
# Update PORT in backend/.env
npm start
```

### Problem: Frontend shows "Cannot GET /"
```bash
# Make sure backend is running on port 5000
# Check API in frontend/src/services/api.js
```

### Problem: Match scores not showing
```bash
# Make sure you uploaded a resume
# Check if OpenAI API key is configured (backend/.env)
# App works without API key - uses fallback scores
```

### Problem: Login says "Invalid credentials"
```bash
# Double-check email and password
# Use demo: test@gmail.com / test@123
# Or create new account via Register page
```

### Problem: Resume upload fails
```bash
# Check file format (PDF, DOC, DOCX, TXT)
# Check file size (<10MB)
# Try a different file
```

## 🔐 Important Notes

### Development Mode
- ⚠️ Passwords stored in plain text (not for production)
- ⚠️ Mock JWT tokens
- ⚠️ Data stored in local JSON file (backend_store.json)

### For Production
- Use password hashing (bcrypt)
- Implement proper JWT with expiry
- Use secure database (MongoDB, PostgreSQL)
- Enable HTTPS
- Add rate limiting
- Implement proper CORS
- Add input validation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review IMPLEMENTATION_GUIDE.md for detailed features
3. Check browser console for errors (F12)
4. Check terminal for backend logs

## 🎓 Learning Resources

### About the Tech Stack
- **Frontend**: React 19 with Vite
- **Backend**: Fastify (modern Node.js framework)
- **AI**: OpenAI API (with fallback heuristics)
- **Storage**: JSON files (development) / databases (production)

### Files to Explore
1. `frontend/src/App.jsx` - Main routing and state management
2. `frontend/src/pages/Jobs.jsx` - Job listing and AI matching display
3. `backend/src/data/jobsData.js` - 50+ job listings
4. `backend/src/services/langgraph.js` - AI intent detection
5. `backend/src/fastifyServer.js` - API endpoints

## ✨ Next Steps

1. **Register a new account** - Explore with your own data
2. **Upload a resume** - Enable AI matching
3. **Use AI Assistant** - Ask natural language questions
4. **Apply to jobs** - Start building applications
5. **Track progress** - Check Profile page

---

**Happy Job Hunting! 🎉**

Need help? Review the detailed IMPLEMENTATION_GUIDE.md file.
