# Happy Thoughts

A positive social media app where users can share their happy thoughts and spread joy by liking others' thoughts. Built with React and Vite.

## 🌐 Live Demo

**Netlify Link:** ""

## 🚀 Recent Updates

- **Project Restructure**: Frontend and backend in separate directories
- **Login & Registration**: User authentication with JWT
- **Backend API**: Node.js + Express + MongoDB for auth endpoints
- **API Endpoint**: Thoughts API at `https://happy-thoughts-api-4ful.onrender.com/thoughts`

## ✨ Features

- Login and user registration
- Post happy thoughts (5-140 characters)
- Like other people's thoughts
- Real-time character counter
- Responsive design
- Timestamps showing when thoughts were posted
- Form validation with error messages

## 🛠️ Tech Stack

**Frontend:** React, Vite, CSS3  
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT

## 📁 Project Structure

```
├── frontend/              # React + Vite application
│   └── src/
│       ├── components/    # React components
│       ├── services/      # API service layer
│       ├── constants/     # Shared constants
│       └── utils/         # Utility functions
│
└── backend/               # Node.js + Express API
    ├── config/            # Configuration
    │   └── db.ts          # MongoDB connection
    ├── controllers/       # Request handlers
    │   └── auth.controller.ts
    ├── modals/            # Mongoose models
    │   └── User.ts
    ├── routes/            # API routes
    │   └── auth.routes.ts
    ├── utils/             # Helper functions
    │   └── token.ts       # JWT token utilities
    ├── index.ts           # Application entry point
    ├── types.ts           # TypeScript type definitions
    └── package.json
```

## 🔧 Installation & Setup

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# From project root - run frontend dev server
npm run dev

# Run backend (in separate terminal)
cd backend && npm run dev
```

The frontend runs on `http://localhost:5173`, the backend on `http://localhost:3000`.

## 📝 API Configuration

The app uses the Happy Thoughts API endpoint:
```
https://happy-thoughts-api-4ful.onrender.com/thoughts
```

To change the API endpoint, update `API_URL` in `frontend/src/services/api.js`.

## 🎯 Validation Rules

- Minimum length: 5 characters
- Maximum length: 140 characters
- Thoughts cannot be empty

These constants are defined in `frontend/src/constants/index.js` for easy maintenance.

## 🚀 Deployment

### Frontend (Netlify)
The frontend is configured for Netlify deployment using `netlify.toml`.
Ensure `VITE_API_URL` environment variable is set in Netlify.

### Backend (Render/Heroku)
The backend requires a separate deployment.
Required environment variables:
- `MONGO_URI`
- `JWT_SECRET`
- `PORT`
