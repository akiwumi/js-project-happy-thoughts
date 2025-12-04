// API Configuration
// Using mock API for development (stores data in localStorage)
// To switch back to real API, set USE_MOCK_API to false and update API_URL
import { mockApi } from './mockApi.js'

const USE_MOCK_API = true // Set to false to use real API
const API_URL = 'https://happy-thoughts-technigo.herokuapp.com/thoughts'

// Real API implementation
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Something went wrong'
    try {
      const data = await response.json()
      errorMessage = data.errors?.message || data.message || errorMessage
    } catch {
      errorMessage = `Server error: ${response.status} ${response.statusText}`
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

const fetchThoughtsReal = async () => {
  try {
    const response = await fetch(API_URL)
    return await handleResponse(response)
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.')
    }
    throw err
  }
}

const postThoughtReal = async (message) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    return await handleResponse(response)
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.')
    }
    throw err
  }
}

const likeThoughtReal = async (thoughtId) => {
  try {
    const response = await fetch(`${API_URL}/${thoughtId}/like`, {
      method: 'POST',
    })

    return await handleResponse(response)
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Network error: Unable to like thought. Please check your internet connection.')
    }
    throw err
  }
}

// Export functions that use either mock or real API
export const fetchThoughts = USE_MOCK_API
  ? () => mockApi.fetchThoughts()
  : fetchThoughtsReal

export const postThought = USE_MOCK_API
  ? (message) => {
      try {
        return mockApi.postThought(message)
      } catch (err) {
        // Format error to match real API error structure
        const error = new Error(err.errors?.message || err.message || 'Failed to post thought')
        error.errors = err.errors
        throw error
      }
    }
  : postThoughtReal

export const likeThought = USE_MOCK_API
  ? (thoughtId) => mockApi.likeThought(thoughtId)
  : likeThoughtReal

