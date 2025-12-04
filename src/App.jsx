import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'https://happy-thoughts-technigo.herokuapp.com/thoughts'

export const App = () => {
  const [thoughts, setThoughts] = useState([])
  const [newThought, setNewThought] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const maxLength = 140
  const minLength = 5
  const remainingChars = maxLength - newThought.length
  const isOverLimit = newThought.length > maxLength

  useEffect(() => {
    fetchThoughts()
  }, [])

  const fetchThoughts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setThoughts(data)
    } catch (err) {
      setError('Failed to load thoughts. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!newThought.trim()) {
      setError('Your thought cannot be empty. Please write something!')
      return
    }

    if (newThought.length < minLength) {
      setError(`Your thought is too short. Please write at least ${minLength} characters.`)
      return
    }

    if (newThought.length > maxLength) {
      setError(`Your thought is too long. Please keep it under ${maxLength} characters.`)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newThought }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API error messages
        if (data.errors) {
          if (data.errors.message) {
            setError(data.errors.message)
          } else {
            setError('Something went wrong. Please try again.')
          }
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      // Clear input and add new thought to the list with animation
      setNewThought('')
      setThoughts([data, ...thoughts])
    } catch (err) {
      setError('Failed to post your thought. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (thoughtId) => {
    try {
      const response = await fetch(`${API_URL}/${thoughtId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const updatedThought = await response.json()
        setThoughts((prevThoughts) =>
          prevThoughts.map((thought) =>
            thought._id === thoughtId ? updatedThought : thought
          )
        )
      }
    } catch (err) {
      // Silently fail for likes
      console.error('Failed to like thought:', err)
    }
  }

  const formatTimeAgo = (createdAt) => {
    const now = new Date()
    const created = new Date(createdAt)
    const seconds = Math.floor((now - created) / 1000)

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    }
    const days = Math.floor(hours / 24)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  return (
    <div className="app">
      <form className="thought-form" onSubmit={handleSubmit}>
        <h2 className="form-title">What's making you happy right now?</h2>
        <textarea
          className="thought-input"
          value={newThought}
          onChange={(e) => {
            setNewThought(e.target.value)
            setError('')
          }}
          placeholder="Share your happy thought..."
          disabled={isSubmitting}
        />
        <div className="form-footer">
          <div className="char-count-container">
            <span className={`char-count ${isOverLimit ? 'char-count-over' : ''}`}>
              {remainingChars} characters remaining
            </span>
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || isOverLimit || newThought.length < minLength}
          >
            <span className="heart-emoji">❤️</span>
            Send Happy Thought
            <span className="heart-emoji">❤️</span>
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>

      <div className="thoughts-list">
        {isLoading ? (
          <div className="loading">Loading thoughts...</div>
        ) : (
          thoughts.map((thought) => (
            <article key={thought._id} className="thought-card">
              <div className="thought-content">
                <p className="thought-message">{thought.message}</p>
                <div className="thought-footer">
                  <button
                    className="like-button"
                    onClick={() => handleLike(thought._id)}
                    aria-label="Like this thought"
                  >
                    <span className="like-icon">
                      <span className="heart-emoji-small">❤️</span>
                    </span>
                    <span className="like-count">x {thought.hearts || 0}</span>
                  </button>
                  <span className="thought-time">{formatTimeAgo(thought.createdAt)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
