---
# 🚀 AI-Powered Job Tracker

A modern, AI-enhanced job search platform with resume matching, application tracking, and intelligent job recommendations powered by AI.

## 🎯 Project Overview

**AI Job Tracker** is a full-stack application that helps job seekers find their perfect match using:
- 🤖 **AI-powered resume matching** (OpenAI integration)
- 💼 **50+ India-based job listings** (Software, Hardware, Business)
- 🎯 **Advanced job filtering** and search capabilities
- 📊 **Application lifecycle tracking** from application to offer
- 🗣️ **Natural language AI assistant** for smart job discovery
- 💾 **Persistent user profiles** and application history

## ✨ Key Features

### 🏠 Home Page
- Welcome dashboard with user personalization
- Resume upload prompt
- Feature overview cards (AI matching, job search, application tracking)
- Quick navigation to start job hunting

### 🔐 Authentication
- Beautiful login page with auto-refresh
- Comprehensive registration (name, email, password, confirm password)
- Session persistence across browser refreshes
- Secure logout with data cleanup

### 👤 User Profile
- View personal information (name, email)
- **Complete application management** (moved from job page)
- Application status tracking (Applied → Interview → Offer → Rejected)
- Application timeline and history
- Sign out functionality

### 💼 Job Search
- **50+ India-focused jobs** across:
  - Software Engineering (React, Python, Node.js, Go, Java, etc.)
  - Hardware & IoT (FPGA, Embedded Systems, PCB Design)
  - Business & Management (Product, Sales, Operations, Finance)
- Company details and role descriptions clearly displayed
- All positions based in India

### 📄 Resume Matching
- Upload resume (PDF, DOC, DOCX, TXT)
- AI-powered compatibility scoring
- **Match scores hidden until resume uploaded** ✨
- Score explanation and skill matching
- Color-coded results (Green >70%, Yellow 40-70%, Gray <40%)

### 🎉 Offer Management
- "Mark Offered" button for successful applications
- **Congratulations alert** with company name and role
- **Automatic removal of action buttons** after marking offered
- Visual indicator showing offer status
- Application locked in "offered" state

### 🔍 Advanced Filters
- Filter by role/title (React, Python, etc.)
- Filter by location (India-focused)
- Filter by date posted (24h, 7d, 30d, any)
- Filter by match score (High, Medium, All)
- Filter by job type (Full-time, Part-time, Contract, Internship)
- Filter by work mode (Remote, Hybrid, On-site)
- Filter by multiple skills (comma-separated)

### 🤖 AI Assistant
- Floating chat widget (bottom-right)
- Natural language query understanding
- Automatic filter extraction from plain English
- Suggested queries and help text
- Example queries:
  - "Find React developer jobs in Bangalore"
  - "Show me remote Python roles"
  - "Filter jobs matching 70%+ score"
  - "Clear all filters"

### 📱 Responsive Design
- Mobile-optimized interface
- Tablet-friendly layouts
- Desktop full-featured experience
- Touch-friendly buttons and inputs
- Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **Axios** - HTTP client
- **CSS-in-JS** - Inline styling for simplicity

### Backend
- **Node.js** with **Fastify** - Modern, fast web framework
- **OpenAI API** - AI-powered matching and intent detection
- **LangChain** - LLM integration
- **JSON Storage** - Simple file-based persistence

### AI/ML Services
- **OpenAI GPT-4o-mini** - Intent detection and job matching
- **LangGraph** - Workflow orchestration
- **Fallback heuristics** - Works without API key

## 📊 Data Structure

### Jobs Database (50+ entries)
```javascript
{
  id: "job-1",
  title: "Senior Software Engineer",
  company: "TCS",
  location: "Bangalore, India",
  role: "Backend Development",
  jobType: "Full-time",
  description: "...",
  applyUrl: "https://careers.tcs.com",
  postedAt: "2026-02-06T..."
}
```

### User Applications
```javascript
{
  id: "job-1-timestamp",
  jobId: "job-1",
  jobTitle: "Senior Software Engineer",
  company: "TCS",
  appliedAt: "2026-02-08T...",
  status: "Applied|Interview|Offer|Rejected",
  history: [{status, at}, ...]
}
```

## 🚀 Getting Started

### Quick Start (3 steps)
```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Start servers (in separate terminals)
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev

# 3. Open browser to http://localhost:5173
# Login with: test@gmail.com / test@123
```

### Detailed Setup
See [QUICK_START.md](QUICK_START.md) for complete installation guide.

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Setup and basic usage guide
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Detailed feature documentation
- **[FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md)** - Complete feature inventory

## 🎯 User Journey

1. **Register/Login** → Create account or use demo (test@gmail.com / test@123)
2. **Home Page** → View features and upload resume
3. **Jobs Page** → Upload resume to enable AI matching
4. **Search/Filter** → Use filters or AI assistant to find jobs
5. **Review Jobs** → See match scores and job details (after resume upload)
6. **Apply** → Click Apply button to open job posting
7. **Confirm** → Confirm application in dialog
8. **Track** → View all applications in Profile page
9. **Update Status** → Move through pipeline (Interview → Offer)
10. **Mark Offered** → Get congratulations message when offer arrives!

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Grays

### Typography
- Headers: Bold, 18-32px
- Body: Regular, 13-16px
- Labels: Medium, 13-14px

### Spacing
- Base unit: 8px
- Padding: 16-40px
- Gap: 8-20px

### Effects
- Hover: Subtle lift & color change
- Transitions: 0.2s-0.3s smooth
- Shadows: Soft drop shadows

## 📈 Feature Metrics

| Category | Count |
|----------|-------|
| Total Jobs | 50+ |
| Software Roles | 25+ |
| Hardware/IoT Roles | 8+ |
| Business Management Roles | 12+ |
| API Endpoints | 12 |
| React Components | 9+ |
| Filter Options | 7 |
| Page Transitions | 4 |

## 🔐 Security Notes

### Current Implementation (Development)
- ⚠️ Plain text passwords
- ⚠️ Mock JWT tokens
- ⚠️ Local JSON storage

### Production Recommendations
- Use bcrypt for password hashing
- Implement proper JWT with expiry
- Use secure database (MongoDB, PostgreSQL)
- Enable HTTPS/SSL
- Add rate limiting
- Implement CORS properly
- Validate all inputs
- Use environment variables for secrets

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 5000 availability, update .env |
| Can't login | Use test@gmail.com / test@123 or register |
| Match scores not showing | Upload resume on Jobs page |
| AI responses slow | May need OpenAI API key in .env |
| Resume upload fails | Check format (PDF/DOC/DOCX/TXT) and size (<10MB) |

## 🔄 Workflow Architecture

```
User Registration
    ↓
Login with Auth
    ↓
Home Page (Welcome)
    ↓
Upload Resume
    ↓
Jobs Page (with Match Scores)
    ↓
Filter/Search (AI or Manual)
    ↓
Apply to Job
    ↓
Confirm Application
    ↓
Profile Page (View Applications)
    ↓
Update Status (Interview/Offer/Rejected)
    ↓
Mark as Offered (Get Congratulations!)
    ↓
Application Complete
```

## 📂 Project Structure

```
ai-job-tracker/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx (Enhanced)
│   │   │   ├── Register.jsx (Enhanced)
│   │   │   ├── Home.jsx (NEW)
│   │   │   ├── Profile.jsx (NEW)
│   │   │   ├── Jobs.jsx (Updated)
│   │   │   ├── UploadResume.jsx (Enhanced)
│   │   │   └── Applications.jsx (Legacy)
│   │   ├── components/
│   │   │   ├── AIAssistant.jsx (Enhanced)
│   │   │   └── Filters.jsx (Enhanced)
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx (Rewritten)
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── store.js
│   │   │   └── jobsData.js (NEW - 50+ Jobs)
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── jobs.js (Updated)
│   │   │   ├── applications.js
│   │   │   ├── resume.js
│   │   │   └── lang.js
│   │   ├── services/
│   │   │   ├── jobFetcher.js
│   │   │   ├── langgraph.js
│   │   │   ├── langchainMatcher.js
│   │   │   ├── matchService.js
│   │   │   └── resumeParser.js
│   │   ├── fastifyServer.js (Updated)
│   │   └── server.js (Legacy)
│   └── package.json
├── QUICK_START.md (NEW)
├── IMPLEMENTATION_GUIDE.md (NEW)
├── FEATURE_CHECKLIST.md (NEW)
├── README.md (This file)
└── README_COMPREHENSIVE.md
```

## 🎓 Learning Resources

### Key Files to Study
1. **Frontend Routing**: `frontend/src/App.jsx`
2. **Job Display**: `frontend/src/pages/Jobs.jsx`
3. **AI Assistant**: `frontend/src/components/AIAssistant.jsx`
4. **Jobs Database**: `backend/src/data/jobsData.js`
5. **AI Services**: `backend/src/services/langgraph.js`
6. **API Server**: `backend/src/fastifyServer.js`

### Understanding the Features
- Resume matching explained in IMPLEMENTATION_GUIDE.md
- AI intent detection logic in `langgraph.js`
- Application lifecycle in Profile.jsx and applications.js

## 🚀 Deployment

### Frontend Deploy to Vercel
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend Deploy
- Recommended: Heroku, Railway, Render
- Update API URL in frontend/src/services/api.js
- Set environment variables (OPENAI_API_KEY, PORT)

## 📞 Support & Feedback

For issues or suggestions:
1. Check [FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md)
2. Review [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
3. Check browser console (F12) for errors
4. Review backend logs in terminal

## 📅 Version History

### v2.0 (Current) - Feb 2026
- Complete UI redesign with gradient theme
- Added Home, Profile pages
- AI Assistant enhancement
- 50+ job database
- Offer congratulations feature
- Advanced filtering
- Application tracking

### v1.0 - Initial Release
- Basic job listing
- Resume upload
- Simple matching

## 🎯 Future Enhancements

- [ ] Real-time job notifications
- [ ] Interview preparation assistant
- [ ] Salary negotiation guide
- [ ] Company reviews integration
- [ ] LinkedIn profile import
- [ ] Email subscription for matches
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] Skill gap analysis
- [ ] Career path recommendations

## 📝 License

This project is created for educational purposes.

## ✨ Credits

Built with:
- React & Vite
- Fastify & Node.js
- OpenAI API
- Modern CSS & Design patterns

---

## 🎉 Ready to Get Started?

👉 **[Jump to QUICK_START.md](QUICK_START.md)** for step-by-step setup instructions!

**Status**: ✅ Complete & Ready for Use
**Last Updated**: February 8, 2026
**Version**: 2.0

---

**Happy Job Hunting! 🚀**
