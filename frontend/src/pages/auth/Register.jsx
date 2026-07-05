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

  const handleSocialClick = async (provider) => {
    setError('')
    setLoading(true)
    try {
      const id = `${provider}_id_${Math.floor(100000 + Math.random() * 900000)}`
      const name = provider === 'google' ? 'Google Student' : 'GitHub Developer'
      const email = provider === 'google' ? 'google.student@studenthub.com' : 'github.dev@studenthub.com'
      
      await loginWithSocial(provider, id, email, name)
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
    </div>
  )
}
