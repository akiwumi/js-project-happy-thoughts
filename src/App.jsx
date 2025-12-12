import { useState } from 'react'
import './App.css'
import MessageCard from './MessageCard'

const MAX_CHARACTERS = 140
const MIN_CHARACTERS = 5
const API_URL = import.meta.env.VITE_API_URL || 'https://happy-thoughts-api.com/thoughts'

function App() {
  const [message, setMessage] = useState('React is making me happy!')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newMessageId, setNewMessageId] = useState(null)

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const validateMessage = (text) => {
    if (!text || text.trim().length === 0) {
      return 'Please share what\'s making you happy! 💕'
    }
    if (text.trim().length < MIN_CHARACTERS) {
      return `Your happy thought needs to be at least ${MIN_CHARACTERS} characters long! 🌟`
    }
    if (text.length > MAX_CHARACTERS) {
      return `Your happy thought is too long! Please keep it under ${MAX_CHARACTERS} characters. ✨`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateMessage(message)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // POST request to API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle different error response formats
        let errorMessage = null
        
        // Check for errors.errors.message format
        if (errorData.errors?.message) {
          errorMessage = errorData.errors.message
        }
        // Check for error.message format
        else if (errorData.message) {
          errorMessage = errorData.message
        }
        // Check for error format
        else if (errorData.error) {
          errorMessage = errorData.error
        }
        
        // Map common API error messages to friendly messages
        if (errorMessage) {
          const lowerMessage = errorMessage.toLowerCase()
          if (lowerMessage.includes('empty') || lowerMessage.includes('required')) {
            setError('Please share what\'s making you happy! 💕')
          } else if (lowerMessage.includes('too long') || lowerMessage.includes('exceed')) {
            setError(`Your happy thought is too long! Please keep it under ${MAX_CHARACTERS} characters. ✨`)
          } else if (lowerMessage.includes('too short') || lowerMessage.includes('minimum')) {
            setError(`Your happy thought needs to be at least ${MIN_CHARACTERS} characters long! 🌟`)
          } else {
            setError(`${errorMessage} 🌈`)
          }
        } else {
          setError('Something went wrong. Please try again! 🌈')
        }
        setIsSubmitting(false)
        return
      }

      const newThought = await response.json().catch(() => ({
        message: message.trim(),
        createdAt: new Date().toISOString(),
        hearts: 0,
        id: Date.now().toString(),
      }))

      // Add new message to the list with animation
      const messageId = newThought.id || Date.now().toString()
      setNewMessageId(messageId)
      setMessages(prev => [newThought, ...prev])
      
      // Clear animation flag after animation completes
      setTimeout(() => setNewMessageId(null), 500)
      
      // Clear the form
      setMessage('')
      
    } catch (err) {
      // If fetch fails (e.g., no API), create message locally
      const messageId = Date.now().toString()
      const newThought = {
        message: message.trim(),
        createdAt: new Date().toISOString(),
        hearts: 0,
        id: messageId,
      }
      
      setNewMessageId(messageId)
      setMessages(prev => [newThought, ...prev])
      
      // Clear animation flag after animation completes
      setTimeout(() => setNewMessageId(null), 500)
      
      setMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const charactersRemaining = MAX_CHARACTERS - message.length
  const isOverLimit = message.length > MAX_CHARACTERS

  return (
    <div className="app">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2 className="form-title">What's making you happy right now?</h2>
        
        <textarea
          className="form-input"
          value={message}
          onChange={handleInputChange}
          placeholder="Share your happy thought..."
          rows="4"
        />
        
        <div className="form-footer">
          <div className={`character-count ${isOverLimit ? 'over-limit' : ''}`}>
            {isOverLimit ? `${Math.abs(charactersRemaining)} characters over limit` : `${charactersRemaining} characters remaining`}
          </div>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            <span className="heart-icon">❤️</span>
            Send Happy Thought
            <span className="heart-icon">❤️</span>
          </button>
        </div>
      </form>

      <div className="messages-container">
        {messages.map((msg) => (
          <MessageCard 
            key={msg.id} 
            message={msg}
            isNew={msg.id === newMessageId}
          />
        ))}
      </div>
    </div>
  )
}

export default App
