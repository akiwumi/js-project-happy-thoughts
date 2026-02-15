import { useState } from 'react'
import { loginUser, registerUser } from './services/api'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsLoading(true)

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }
        const data = await registerUser(name, email, password)
        if (data.success) {
          setSuccessMsg(data.message || 'Registration successful! You can now log in.')
          setIsRegister(false)
          // Clear form
          setName('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        const data = await loginUser(email, password)
        if (data.success) {
          // Store token if needed, or just notify parent
          onLogin?.()
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <h1>{isRegister ? 'Create account' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        {isRegister && (
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
        </button>
      </form>
      <div className="login-page-toggle">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}>
              Log in
            </button>
          </>
        ) : (
          <>
            New user?{' '}
            <button type="button" onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}>
              Create account
            </button>
          </>
        )}
      </div>
    </div>
  )
}