# ✨ DermAI — AI Skin Analysis (MERN Stack)

## Project Structure -----
```
dermai/
├── backend/          ← Node.js + Express + MongoDB
│   ├── middleware/authMiddleware.js
│   ├── models/User.js
│   ├── models/Report.js
│   ├── routes/authRoutes.js
│   ├── routes/uploadRoutes.js
│   ├── routes/analyzeRoutes.js
│   ├── routes/reportRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/         ← React JSX + recharts
    ├── public/index.html
    └── src/
        ├── components/Layout.jsx
        ├── components/ScoreRing.jsx
        ├── components/Toast.jsx
        ├── context/AuthContext.jsx
        ├── pages/Landing.jsx
        ├── pages/Login.jsx
        ├── pages/Register.jsx
        ├── pages/Dashboard.jsx
        ├── pages/Scan.jsx
        ├── pages/Report.jsx
        ├── pages/History.jsx
        ├── pages/Profile.jsx
        ├── services/api.js
        ├── App.jsx
        ├── index.js
        └── index.css
```

## ▶️ Run Locally

### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
# ✅ MongoDB Connected
# 🚀 Server: http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## How It Works
```
React (port 3000)
  → proxy /api → Express (port 5000)
     → /api/auth    → MongoDB (User model)
     → /api/upload  → saves to /backend/uploads/
     → /api/analyze → smart mock AI (or Python if running)
     → /api/reports → MongoDB (Report model)
```

## MongoDB
Your Atlas URI is pre-configured in backend/.env
Database: dermai | Collections: users, reports

## Pages
- / → Landing page
- /login → Login
- /register → Register  
- /dashboard → Overview + charts
- /scan → Upload photo or use webcam
- /report/:id → Full AI report
- /history → Past scans
- /profile → User profile
