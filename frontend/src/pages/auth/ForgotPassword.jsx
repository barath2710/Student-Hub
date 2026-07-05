import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../services/authService'

function FloatingInput({ id, label, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false)
  const isFloating = focused || value.length > 0

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '18px 12px 6px 12px',
          background: 'var(--surface-1)',
          border: `1px solid ${focused ? 'var(--text-primary)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
        }}
      />
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          left: '12px',
          top: isFloating ? '4px' : '14px',
          fontSize: isFloating ? '10px' : '14px',
          color: 'var(--text-secondary)',
          transition: 'all 0.15s ease',
          pointerEvents: 'none',
          fontWeight: 500,
        }}
      >
        {label}
      </label>
    </div>
  )
}

function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div role="alert" style={{
      padding: '10px 14px',
      background: 'var(--danger-subtle)',
      border: '1px solid var(--danger)',
      borderRadius: '8px',
      color: 'var(--danger-text)',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span>⚠️</span>
      {message}
    </div>
  )
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setSuccess('')
    setResetToken('')
    setLoading(true)

    try {
      const res = await forgotPassword(email.trim())
      setSuccess('Reset link generated! For development, the link is shown below.')
      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      backgroundColor: 'var(--bg-app)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <style>{`
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: currentColor;
          border-radius: 50%;
          aria-hidden: true;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '360px', background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Forgot Password
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ErrorAlert message={error} />

          {success && (
            <div style={{ padding: '12px', background: 'var(--success-subtle, #DEF7EC)', border: '1px solid var(--success, #31C48D)', borderRadius: '8px', color: 'var(--success-text, #03543F)', fontSize: '13px' }}>
              🎉 {success}
            </div>
          )}

          {resetToken && (
            <div style={{ padding: '12px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', wordBreak: 'break-all', fontSize: '12px' }}>
              <strong>Reset URL:</strong><br />
              <Link to={`/reset-password/${resetToken}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                /reset-password/{resetToken}
              </Link>
            </div>
          )}

          <FloatingInput
            id="reset-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Sending link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '24px', margin: '24px 0 0' }}>
          Remember your password?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
