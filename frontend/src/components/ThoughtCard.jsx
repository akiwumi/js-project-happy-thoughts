import { formatTimeAgo } from '../utils/timeUtils'
import './ThoughtCard.css'

export const ThoughtCard = ({ thought, onLike }) => {
  return (
    <article className="thought-card">
      <div className="thought-content">
        <p className="thought-message">{thought.message}</p>
        <div className="thought-footer">
          <button
            className="like-button"
            onClick={() => onLike(thought._id)}
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
  )
}

