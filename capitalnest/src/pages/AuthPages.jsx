import { useState } from 'react'
import { FormNotice } from '../components/ui'
import { useAuth } from '../context/authContextStore'

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="auth-page">
    <div className="auth-panel">
      <div className="auth-brand">
        <span className="brand-mark">CN</span>
        <span>CapitalNest</span>
      </div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
      {footer}
    </div>
  </div>
)

export const LoginPage = ({ onNavigate }) => {
  const { signIn, backendMode, demoCredentials, authNotice, clearAuthNotice } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    clearAuthNotice()

    try {
      const user = await signIn({
        email: form.email,
        password: form.password,
      })
      onNavigate(user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (kind) => {
    if (kind === 'admin') {
      setForm({
        email: demoCredentials.admin.email,
        password: demoCredentials.admin.password,
      })
      return
    }
    setForm({
      email: demoCredentials.user.email,
      password: demoCredentials.user.password,
    })
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your secure investment workspace."
      footer={
        <p className="auth-footer">
          No account?{' '}
          <button className="link-btn" onClick={() => onNavigate('/register')}>
            Create one
          </button>
        </p>
      }
    >
      <FormNotice kind="success" message={authNotice} />
      <FormNotice kind="danger" message={error} />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <button className="link-btn" onClick={() => onNavigate('/forgot-password')}>
        Forgot password?
      </button>

      {backendMode === 'demo' ? (
        <div className="demo-box">
          <h4>Demo Accounts</h4>
          <p>Use preloaded credentials to explore user and admin panels.</p>
          <div className="demo-actions">
            <button className="secondary-btn" onClick={() => fillCredentials('user')}>
              Use Investor Demo
            </button>
            <button className="secondary-btn" onClick={() => fillCredentials('admin')}>
              Use Admin Demo
            </button>
          </div>
        </div>
      ) : null}
    </AuthLayout>
  )
}

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        password: form.password,
      })

      if (user) {
        onNavigate('/app/dashboard', { replace: true })
      } else {
        onNavigate('/login', { replace: true })
      }
    } catch (submitError) {
      setError(submitError.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start building your portfolio with secure investment workflows."
      footer={
        <p className="auth-footer">
          Already have an account?{' '}
          <button className="link-btn" onClick={() => onNavigate('/login')}>
            Sign in
          </button>
        </p>
      }
    >
      <FormNotice kind="danger" message={error} />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label>
          Phone Number
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
        </label>
        <label>
          Country
          <input
            type="text"
            value={form.country}
            onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            minLength={8}
            required
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            minLength={8}
            required
          />
        </label>
        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export const ForgotPasswordPage = ({ onNavigate }) => {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice('')
    setError('')

    try {
      const payload = await sendPasswordReset(email)
      setNotice(payload.message || 'Reset instructions sent.')
    } catch (submitError) {
      setError(submitError.message || 'Unable to send reset instructions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email and we will send password reset instructions."
      footer={
        <p className="auth-footer">
          Remember your password?{' '}
          <button className="link-btn" onClick={() => onNavigate('/login')}>
            Return to login
          </button>
        </p>
      }
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  )
}
