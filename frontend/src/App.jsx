import { useState, useEffect } from 'react'
import { ThoughtForm, ThoughtList } from './components'
import Login from './login'
import { fetchThoughts, postThought, likeThought } from './services/api'
import { MIN_LENGTH, MAX_LENGTH } from './constants'
import './App.css'

export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [thoughts, setThoughts] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadThoughts()
  }, [])

  const loadThoughts = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchThoughts()
      setThoughts(data)
    } catch (err) {
      const errorMsg = err.message || 'Failed to load thoughts. Please try again later.'
      setError(errorMsg)
      console.error('Error loading thoughts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (message) => {
    setError('')

    // Validation
    if (!message.trim()) {
      setError('Your thought cannot be empty. Please write something!')
      return
    }

    if (message.length < MIN_LENGTH) {
      setError(`Your thought is too short. Please write at least ${MIN_LENGTH} characters.`)
      return
    }

    if (message.length > MAX_LENGTH) {
      setError(`Your thought is too long. Please keep it under ${MAX_LENGTH} characters.`)
      return
    }

    setIsSubmitting(true)
    try {
      const newThought = await postThought(message)
      setThoughts([newThought, ...thoughts])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to post your thought. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (thoughtId) => {
    try {
      const updatedThought = await likeThought(thoughtId)
      setThoughts((prevThoughts) =>
        prevThoughts.map((thought) =>
          thought._id === thoughtId ? updatedThought : thought
        )
      )
    } catch (err) {
      // Silently fail for likes
      console.error('Failed to like thought:', err)
    }
  }

  // Separate form errors from API errors
  const formError = error && (error.includes('empty') || error.includes('short') || error.includes('long') || error.includes('post'))
  const apiError = error && !formError

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="app">
      <ThoughtForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={formError ? error : ''}
      />
      {apiError && (
        <div className="api-error-message">
          {error}
          <p className="api-error-hint">
            Note: The Heroku API endpoint may be unavailable. You may need to update the API_URL in src/services/api.js to use an alternative endpoint.
          </p>
        </div>
      )}
      <ThoughtList
        thoughts={thoughts}
        isLoading={isLoading}
        onLike={handleLike}
      />
    </div>
  )
}
