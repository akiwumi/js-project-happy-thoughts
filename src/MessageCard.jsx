import { useState } from 'react'
import './MessageCard.css'

function MessageCard({ message, isNew }) {
  const [hearts, setHearts] = useState(message.hearts || 0)
  const [hasLiked, setHasLiked] = useState(false)

  const handleLike = (e) => {
    e.preventDefault()
    if (!hasLiked) {
      setHearts(prev => prev + 1)
      setHasLiked(true)
    }
  }

  const formatTimeAgo = (createdAt) => {
    const now = new Date()
    const created = new Date(createdAt)
    const secondsAgo = Math.floor((now - created) / 1000)

    if (secondsAgo < 60) {
      return `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60)
      return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`
    } else if (secondsAgo < 86400) {
      const hoursAgo = Math.floor(secondsAgo / 3600)
      return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`
    } else {
      const daysAgo = Math.floor(secondsAgo / 86400)
      return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className={`message-card ${isNew ? 'new-message' : ''}`}>
      <p className="message-text">{message.message}</p>
      
      <div className="message-footer">
        <button 
          className={`heart-button ${hasLiked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-label="Like this happy thought"
        >
          <span className="heart-icon-small">❤️</span>
          <span className="heart-count">x {hearts}</span>
        </button>
        
        <span className="timestamp">
          {formatTimeAgo(message.createdAt)}
        </span>
      </div>
    </div>
  )
}

export default MessageCard




