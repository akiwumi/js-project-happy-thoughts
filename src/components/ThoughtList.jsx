import { ThoughtCard } from './ThoughtCard'
import './ThoughtList.css'

export const ThoughtList = ({ thoughts, isLoading, onLike }) => {
  if (isLoading) {
    return (
      <div className="thoughts-list">
        <div className="loading">Loading thoughts...</div>
      </div>
    )
  }

  if (thoughts.length === 0) {
    return (
      <div className="thoughts-list">
        <div className="empty-state">No thoughts yet. Be the first to share!</div>
      </div>
    )
  }

  return (
    <div className="thoughts-list">
      {thoughts.map((thought) => (
        <ThoughtCard key={thought._id} thought={thought} onLike={onLike} />
      ))}
    </div>
  )
}

