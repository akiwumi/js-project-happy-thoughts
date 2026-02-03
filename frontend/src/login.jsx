import { useState } from 'react'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin?.()
  }

  return (
    <div className="login-page">
      <h1>{isRegister ? 'Create account' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input type="text" placeholder="Name" required />
        )}
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        {isRegister && (
          <input type="password" placeholder="Confirm password" required />
        )}
        <button type="submit">
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <p className="login-page-toggle">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setIsRegister(false)}>
              Log in
            </button>
          </>
        ) : (
          <>
            New user?{' '}
            <button type="button" onClick={() => setIsRegister(true)}>
              Create account
            </button>
          </>
        )}
      </p>
    </div>
  )
}