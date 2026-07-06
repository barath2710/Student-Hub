import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ─── Password strength bar ──────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null

  let strength = 0
  if (password.length >= 6)                       strength++
  if (password.length >= 10)                      strength++
  if (/[A-Z]/.test(password))                    strength++
  if (/[0-9]/.test(password))                    strength++
  if (/[^A-Za-z0-9]/.test(password))             strength++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['', '#DC2626', '#D97706', '#D97706', '#16A34A', '#16A34A']
  const widths = ['0%', '20%', '40%', '60%', '80%', '100%']

  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '4px',
          width: widths[strength],
          background: colors[strength],
          transition: 'all 0.3s ease',
        }} />
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '11px', color: colors[strength] || 'var(--text-secondary)', textAlign: 'right', fontWeight: 600 }}>
        {labels[strength]}
      </p>
    </div>
  )
}

/* ─── Reusable form input with floating label ─────────────────────────────────── */
function FloatingInput({ id, label, type = 'text', value, onChange, autoComplete, children }) {
  const [focused, setFocused] = useState(false)
  const isFloating = focused || value.length > 0

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
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
      {children}
    </div>
  )
}

/* ─── Error alert ────────────────────────────────────────────────────────── */
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
      <span style={{ fontSize: '15px' }}>⚠️</span>
      {message}
    </div>
  )
}

/* ── Checkbox ────────────────────────────────────────────────────────────── */
function Checkbox({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.4' }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginTop: '2px', cursor: 'pointer', accentColor: 'var(--text-primary)' }}
      />
      {label}
    </label>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Register Page
══════════════════════════════════════════════════════════════════════════ */
export default function Register() {
  const { register, loginWithSocial, loginWithMobile } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [agreed,  setAgreed]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Mobile OTP signup states
  const [isMobileLogin, setIsMobileLogin] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    if (!form.name.trim())             return 'Full name is required.'
    if (form.name.trim().length < 2)   return 'Name must be at least 2 characters.'
    if (!form.email.trim())            return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.'
    if (!form.password)                return 'Password is required.'
    if (form.password.length < 6)      return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    if (!agreed)                       return 'You must agree to the terms to continue.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [socialModal, setSocialModal] = useState({ isOpen: false, provider: '' })
  const [socialEmail, setSocialEmail] = useState('')
  const [socialName, setSocialName] = useState('')

  const handleSocialClick = (provider) => {
    setError('')
    setSocialEmail('')
    setSocialName(provider === 'google' ? 'Google Student' : 'GitHub Developer')
    setSocialModal({ isOpen: true, provider })
  }

  const handleSocialSubmit = async (e) => {
    e.preventDefault()
    if (!socialEmail.trim()) {
      setError('Email or username is required.')
      return
    }
    const emailVal = socialEmail.trim()
    const nameVal = socialName.trim() || (socialModal.provider === 'google' ? 'Google Student' : 'GitHub Developer')
    const providerVal = socialModal.provider
    
    setSocialModal({ isOpen: false, provider: '' })
    setLoading(true)
    try {
      const id = `${providerVal}_id_${Math.floor(100000 + Math.random() * 900000)}`
      await loginWithSocial(providerVal, id, emailVal, nameVal)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Social registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      setError('Phone number is required.')
      return
    }
    setError('')
    setOtpLoading(true)
    try {
      const { mobileLogin: reqMobileLogin } = await import('../../services/authService')
      await reqMobileLogin(phoneNumber)
      setOtpSent(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpCode.trim()) {
      setError('OTP Code is required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await loginWithMobile(phoneNumber, otpCode)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed.')
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
    }}>
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .social-btn:hover {
          background: var(--surface-2);
        }
      `}</style>

      {/* Left side (Marketing Banner) */}
      <div className="hide-mobile" style={{
        flex: 1,
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid #1F1F1F',
      }}>
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 700,
          }}>
            🎓
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            StudentHub
          </span>
        </div>

        {/* Feature Highlights */}
        <div style={{ maxWidth: '440px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: '32px', color: '#FFFFFF' }}>
            Elevate your study experience today.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                ✦ Integrated Study Tools
              </h3>
              <p style={{ fontSize: '13px', color: '#A3A3A3', lineHeight: 1.5, margin: 0 }}>
                Notes, schedules, courses, and grades in a highly optimized student interface.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                ✦ Meet Jarvis AI
              </h3>
              <p style={{ fontSize: '13px', color: '#A3A3A3', lineHeight: 1.5, margin: 0 }}>
                Get instant quiz questions, concept explanations, and study guides tailored directly to your resources.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                ✦ Complete Privacy
              </h3>
              <p style={{ fontSize: '13px', color: '#A3A3A3', lineHeight: 1.5, margin: 0 }}>
                Your assignments and records are stored securely, accessible only by you.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '12px', color: '#525252' }}>
          © {new Date().getFullYear()} StudentHub Inc. All rights reserved.
        </div>
      </div>

      {/* Right side (Form) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {isMobileLogin ? 'Register with Mobile' : 'Create an account'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              {isMobileLogin ? 'Use your phone number to sign up instantly.' : 'Get started by creating your new student profile.'}
            </p>
          </div>

          <ErrorAlert message={error} />

          {isMobileLogin ? (
            /* ─── Mobile signup form ─── */
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!otpSent ? (
                <>
                  <FloatingInput
                    id="mobile-phone"
                    label="Phone Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={otpLoading}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--primary)',
                      color: 'var(--text-inverse)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: otpLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {otpLoading ? <span className="spinner" /> : null}
                    Send Verification Code
                  </button>
                </>
              ) : (
                <>
                  <div style={{ padding: '10px 14px', background: 'var(--success-subtle, #DEF7EC)', border: '1px solid var(--success, #31C48D)', borderRadius: '8px', color: 'var(--success-text, #03543F)', fontSize: '13px' }}>
                    Code sent! Sandbox OTP is <strong>123456</strong>
                  </div>
                  <FloatingInput
                    id="mobile-otp"
                    label="OTP Verification Code"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--primary)',
                      color: 'var(--text-inverse)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {loading ? <span className="spinner" /> : null}
                    Verify & Register
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => { setIsMobileLogin(false); setOtpSent(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textAlign: 'center',
                }}
              >
                Back to Email Signup
              </button>
            </form>
          ) : (
            /* ─── Regular email registration form ─── */
            <form id="register-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FloatingInput
                id="register-name"
                label="Full Name"
                value={form.name}
                onChange={handleChange('name')}
                autoComplete="name"
              />

              <FloatingInput
                id="register-email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <FloatingInput
                    id="register-password"
                    label="Password (min. 6 chars)"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px',
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <FloatingInput
                  id="register-confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px',
                  }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <Checkbox
                id="register-terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                label="I agree to the Terms of Service and Privacy Policy"
              />

              <button
                id="register-submit"
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
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
          </form>
        )}

          {/* Social Register */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px', gap: '8px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button type="button" className="social-btn" onClick={() => handleSocialClick('google')} disabled={loading}>
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocialClick('github')} disabled={loading}>
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Continue with GitHub
            </button>
            {!isMobileLogin && (
              <button type="button" className="social-btn" onClick={() => setIsMobileLogin(true)} disabled={loading}>
                <span style={{ fontSize: '16px' }}>📱</span> Continue with Mobile
              </button>
            )}
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '24px', margin: '24px 0 0' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Choose Account Modal */}
      {socialModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '32px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--surface-1)', marginBottom: '16px' }}>
                {socialModal.provider === 'google' ? (
                  <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg" fill="var(--text-primary)">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                )}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {socialModal.provider === 'google' ? 'Continue with Google' : 'Continue with GitHub'}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Enter your {socialModal.provider === 'google' ? 'Google' : 'GitHub'} account email to sign up.
              </p>
            </div>

            <form onSubmit={handleSocialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {socialModal.provider === 'google' ? 'Google Email Address' : 'GitHub Email Address'}
                </label>
                <input
                  type="email"
                  required
                  placeholder={socialModal.provider === 'google' ? 'yourname@gmail.com' : 'yourname@github.com'}
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder={socialModal.provider === 'google' ? 'Google Student' : 'GitHub Developer'}
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSocialModal({ isOpen: false, provider: '' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'var(--text-inverse)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
