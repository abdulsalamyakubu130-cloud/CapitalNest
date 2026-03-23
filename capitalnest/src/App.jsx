import { useEffect } from 'react'
import { LoadingScreen } from './components/ui'
import { useAuth } from './context/authContextStore'
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/AuthPages'
import { LandingPage } from './pages/LandingPage'
import {
  UserDashboardPage,
  UserInvestmentsPage,
  UserProfilePage,
  UserTransactionsPage,
} from './pages/UserPages'
import {
  AdminApprovalsPage,
  AdminDashboardPage,
  AdminTransactionsPage,
  AdminUsersPage,
} from './pages/AdminPages'
import { navigateTo, useHashPath } from './utils/router'

const Redirect = ({ to }) => {
  useEffect(() => {
    navigateTo(to, { replace: true })
  }, [to])

  return <LoadingScreen message="Redirecting..." />
}

const NotFound = ({ onNavigate }) => (
  <div className="not-found-page">
    <h1>404</h1>
    <p>The page you requested does not exist.</p>
    <button className="primary-btn" onClick={() => onNavigate('/')}>
      Return Home
    </button>
  </div>
)

function App() {
  const path = useHashPath()
  const { loading, isAuthenticated, isAdmin } = useAuth()

  const onNavigate = (nextPath, options = {}) => navigateTo(nextPath, options)

  useEffect(() => {
    if (!window.location.hash) {
      navigateTo('/', { replace: true })
    }
  }, [])

  if (loading) return <LoadingScreen />

  if (path === '/' && isAuthenticated) {
    return <Redirect to={isAdmin ? '/admin/dashboard' : '/app/dashboard'} />
  }

  if (path === '/') return <LandingPage onNavigate={onNavigate} />

  if (path === '/login') {
    return isAuthenticated ? (
      <Redirect to={isAdmin ? '/admin/dashboard' : '/app/dashboard'} />
    ) : (
      <LoginPage onNavigate={onNavigate} />
    )
  }

  if (path === '/register') {
    return isAuthenticated ? (
      <Redirect to={isAdmin ? '/admin/dashboard' : '/app/dashboard'} />
    ) : (
      <RegisterPage onNavigate={onNavigate} />
    )
  }

  if (path === '/forgot-password') {
    return isAuthenticated ? (
      <Redirect to={isAdmin ? '/admin/dashboard' : '/app/dashboard'} />
    ) : (
      <ForgotPasswordPage onNavigate={onNavigate} />
    )
  }

  if (path.startsWith('/app')) {
    if (!isAuthenticated) return <Redirect to="/login" />
    if (isAdmin) return <Redirect to="/admin/dashboard" />

    if (path === '/app/dashboard') {
      return <UserDashboardPage currentPath={path} onNavigate={onNavigate} />
    }
    if (path === '/app/profile') {
      return <UserProfilePage currentPath={path} onNavigate={onNavigate} />
    }
    if (path === '/app/investments') {
      return <UserInvestmentsPage currentPath={path} onNavigate={onNavigate} />
    }
    if (path === '/app/transactions') {
      return <UserTransactionsPage currentPath={path} onNavigate={onNavigate} />
    }

    return <Redirect to="/app/dashboard" />
  }

  if (path.startsWith('/admin')) {
    if (!isAuthenticated) return <Redirect to="/login" />
    if (!isAdmin) return <Redirect to="/app/dashboard" />

    if (path === '/admin/dashboard') {
      return <AdminDashboardPage currentPath={path} onNavigate={onNavigate} />
    }
    if (path === '/admin/users') {
      return <AdminUsersPage currentPath={path} onNavigate={onNavigate} />
    }
    if (path === '/admin/approvals') {
      return <AdminApprovalsPage currentPath={path} onNavigate={onNavigate} />
    }
    if (path === '/admin/transactions') {
      return <AdminTransactionsPage currentPath={path} onNavigate={onNavigate} />
    }

    return <Redirect to="/admin/dashboard" />
  }

  return <NotFound onNavigate={onNavigate} />
}

export default App
