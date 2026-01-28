# PhishGuard - Phishing Detection & Website Safety Analyzer

A full-stack web application that analyzes URLs for phishing threats using VirusTotal and PhishTank APIs.

**Tech Stack:** React + Vite (Frontend) | Node.js + Express.js + MongoDB (Backend)

## Features

- 🔍 **URL Analysis** - Scan any URL for phishing threats
- 📊 **Risk Scoring** - Weighted risk calculation (0-100)
- 🏷️ **Classification** - Safe / Suspicious / Phishing
- 📈 **Dashboard** - Visual analytics with charts
- 📜 **History** - Track all your scans
- 📤 **Export** - Download reports as CSV or PDF
- 🔐 **JWT Authentication** - Secure user accounts
- 🛡️ **Per-user Data** - Users only see their own scans

## Quick Start

### 1. Start MongoDB

Make sure MongoDB is running locally:
```bash
# If using MongoDB locally
mongod

# Or use MongoDB Atlas (update .env with connection string)
```

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at: http://localhost:5000

### 3. Start Frontend

```bash
# In root folder
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### 4. Create Account & Test

1. Open http://localhost:5173
2. Click "Sign up" to create an account
3. Scan URLs like `google.com` or `suspicious-login-verify.com`

## Project Structure

```
phising/
├── backend/                 # Express.js API
│   ├── models/              # Mongoose models (User, Scan)
│   ├── routes/              # API routes (auth, scan)
│   ├── middleware/          # JWT auth middleware
│   └── server.js            # Express server
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── contexts/            # Auth context
│   ├── lib/                 # API client
│   └── pages/               # Route pages
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| POST | /api/scan/analyze | Analyze a URL |
| GET | /api/scan/history | Get scan history |
| GET | /api/scan/stats | Get statistics |

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/phishguard
JWT_SECRET=your-secret-key
PORT=5000
VIRUSTOTAL_API_KEY=optional
PHISHTANK_API_KEY=optional
```

## Risk Score Calculation

| Factor | Weight |
|--------|--------|
| VirusTotal | 50% |
| PhishTank | 30% |
| URL Patterns | 20% |

## License

MIT
