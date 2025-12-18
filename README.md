# Happy Thoughts

A positive social media app where users can share their happy thoughts and spread joy by liking others' thoughts. Built with React and Vite.

## 🌐 Live Demo

**Netlify Link:** https://pebbleshappy-app.netlify.app

## 🚀 Recent Updates

- **API Endpoint Updated**: Switched to `https://happy-thoughts-api-4ful.onrender.com/thoughts`
- **Code Refactoring**: Created shared constants file (`src/constants/index.js`) to eliminate duplication of `MIN_LENGTH` and `MAX_LENGTH` across components
- **Improved Code Organization**: Better separation of concerns with constants in a dedicated directory

## ✨ Features

- Post happy thoughts (5-140 characters)
- Like other people's thoughts
- Real-time character counter
- Responsive design
- Timestamps showing when thoughts were posted
- Form validation with error messages

## 🛠️ Tech Stack

- React
- Vite
- CSS3
- REST API

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── ThoughtForm.jsx
│   ├── ThoughtList.jsx
│   └── ThoughtCard.jsx
├── services/          # API service layer
│   ├── api.js
│   └── mockApi.js
├── constants/         # Shared constants
│   └── index.js
└── utils/            # Utility functions
    └── timeUtils.js
```

## 🔧 Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 API Configuration

The app uses the Happy Thoughts API endpoint:
```
https://happy-thoughts-api-4ful.onrender.com/thoughts
```

To change the API endpoint, update `API_URL` in `src/services/api.js`.

## 🎯 Validation Rules

- Minimum length: 5 characters
- Maximum length: 140 characters
- Thoughts cannot be empty

These constants are defined in `src/constants/index.js` for easy maintenance.
