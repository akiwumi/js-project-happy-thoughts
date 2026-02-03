import { useState } from 'react'
import { MIN_LENGTH, MAX_LENGTH } from '../constants'
import './ThoughtForm.css'

export const ThoughtForm = ({ onSubmit, isSubmitting, error }) => {
  const [newThought, setNewThought] = useState('')

  const remainingChars = MAX_LENGTH - newThought.length
  const isOverLimit = newThought.length > MAX_LENGTH
  const isValid = newThought.trim().length >= MIN_LENGTH && newThought.length <= MAX_LENGTH

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValid) {
      return
    }

    await onSubmit(newThought)
    setNewThought('')
  }

  const handleChange = (e) => {
    setNewThought(e.target.value)
  }

  return (
    <form className="thought-form" onSubmit={handleSubmit}>
      <h2 className="form-title">What's making you happy right now?</h2>
      <textarea
        className="thought-input"
        value={newThought}
        onChange={handleChange}
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
          disabled={isSubmitting || !isValid}
        >
          <span className="heart-emoji">❤️</span>
          Send Happy Thought
          <span className="heart-emoji">❤️</span>
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  )
}

