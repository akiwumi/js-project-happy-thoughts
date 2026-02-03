// Mock API for Happy Thoughts
// This simulates the backend API and stores data in localStorage for persistence

const STORAGE_KEY = 'happy-thoughts-mock-data'

// Initialize mock data from localStorage or use default
const getStoredThoughts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (err) {
    console.error('Error reading from localStorage:', err)
  }
  return []
}

// Save thoughts to localStorage
const saveThoughts = (thoughts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts))
  } catch (err) {
    console.error('Error saving to localStorage:', err)
  }
}

// Generate a unique ID
const generateId = () => {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Simulate network delay
const delay = (ms = 300) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock API implementation
export const mockApi = {
  // Fetch all thoughts
  async fetchThoughts() {
    await delay(200)
    const thoughts = getStoredThoughts()
    // Return in reverse chronological order (newest first)
    return [...thoughts].reverse()
  },

  // Post a new thought
  async postThought(message) {
    await delay(400)
    
    // Validation
    if (!message || !message.trim()) {
      const error = new Error('Message cannot be empty')
      error.errors = { message: 'Your thought cannot be empty. Please write something!' }
      throw error
    }

    if (message.length < 5) {
      const error = new Error('Message too short')
      error.errors = { message: 'Your thought is too short. Please write at least 5 characters.' }
      throw error
    }

    if (message.length > 140) {
      const error = new Error('Message too long')
      error.errors = { message: 'Your thought is too long. Please keep it under 140 characters.' }
      throw error
    }

    const newThought = {
      _id: generateId(),
      message: message.trim(),
      hearts: 0,
      createdAt: new Date().toISOString(),
    }

    const thoughts = getStoredThoughts()
    thoughts.push(newThought)
    saveThoughts(thoughts)

    return newThought
  },

  // Like a thought
  async likeThought(thoughtId) {
    await delay(200)
    
    const thoughts = getStoredThoughts()
    const thoughtIndex = thoughts.findIndex((t) => t._id === thoughtId)

    if (thoughtIndex === -1) {
      const error = new Error('Thought not found')
      throw error
    }

    thoughts[thoughtIndex].hearts = (thoughts[thoughtIndex].hearts || 0) + 1
    saveThoughts(thoughts)

    return thoughts[thoughtIndex]
  },

  // Clear all thoughts (useful for testing)
  clearAllThoughts() {
    localStorage.removeItem(STORAGE_KEY)
  },
}

// Initialize with some sample thoughts if empty
const initializeSampleData = () => {
  const thoughts = getStoredThoughts()
  if (thoughts.length === 0) {
    const sampleThoughts = [
      {
        _id: generateId(),
        message: 'Just finished a great workout! Feeling energized and ready for the day. 💪',
        hearts: 3,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        _id: generateId(),
        message: 'Had an amazing cup of coffee this morning. The little things that bring joy! ☕',
        hearts: 5,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
      {
        _id: generateId(),
        message: 'Beautiful sunset today. Nature always finds a way to amaze me. 🌅',
        hearts: 8,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
    ]
    saveThoughts(sampleThoughts)
  }
}

// Initialize on module load
initializeSampleData()

