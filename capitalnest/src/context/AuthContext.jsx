import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api, BACKEND_MODE, DEMO_CREDENTIALS } from '../services/api'
import { AuthContext } from './authContextStore'
const SESSION_STORAGE_KEY = 'capitalnest_auth_session_v1'

const readStoredSession = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const persistSession = (session) => {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authNotice, setAuthNotice] = useState('')

  const hydrateSession = useCallback(async () => {
    const storedSession = readStoredSession()
    if (!storedSession) {
      setLoading(false)
      return
    }

    try {
      const nextUser = await api.getCurrentUser({
        accessToken: storedSession.accessToken,
        userId: storedSession.userId,
      })
      setSession(storedSession)
      setUser(nextUser)
    } catch {
      persistSession(null)
      setSession(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  const refreshUser = useCallback(async () => {
    if (!session?.userId) return null
    const nextUser = await api.getCurrentUser({
      accessToken: session.accessToken,
      userId: session.userId,
    })
    setUser(nextUser)
    return nextUser
  }, [session])

  const signIn = useCallback(async ({ email, password }) => {
    const payload = await api.signIn({ email, password })
    if (!payload?.session || !payload?.user) {
      throw new Error('Unable to complete sign-in.')
    }
    persistSession(payload.session)
    setSession(payload.session)
    setUser(payload.user)
    setAuthNotice('')
    return payload.user
  }, [])

  const register = useCallback(
    async ({ fullName, email, phone, country, password }) => {
      const payload = await api.register({ fullName, email, phone, country, password })

      if (payload?.needsEmailVerification) {
        setAuthNotice(
          'Account created. Verify your email before logging in if email confirmation is enabled.',
        )
        return null
      }

      if (!payload?.session || !payload?.user) {
        throw new Error('Registration succeeded but no active session was returned.')
      }

      persistSession(payload.session)
      setSession(payload.session)
      setUser(payload.user)
      setAuthNotice('')
      return payload.user
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (session?.accessToken) {
      await api.signOut({ accessToken: session.accessToken }).catch(() => null)
    }
    persistSession(null)
    setSession(null)
    setUser(null)
    setAuthNotice('')
  }, [session])

  const sendPasswordReset = useCallback(async (email) => {
    return api.sendPasswordReset({ email })
  }, [])

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      if (!user) throw new Error('You must be logged in.')
      return api.changePassword({
        accessToken: session?.accessToken,
        userId: user.id,
        currentPassword,
        newPassword,
      })
    },
    [session, user],
  )

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) throw new Error('You must be logged in.')
      const updated = await api.updateProfile({
        accessToken: session?.accessToken,
        userId: user.id,
        updates,
      })
      setUser(updated)
      return updated
    },
    [session, user],
  )

  const uploadKyc = useCallback(
    async (fileName) => {
      if (!user) throw new Error('You must be logged in.')
      const updated = await api.uploadKyc({
        accessToken: session?.accessToken,
        userId: user.id,
        fileName,
      })
      if (updated) setUser(updated)
      return updated
    },
    [session, user],
  )

  const ensureAuthenticated = useCallback(() => {
    if (!session?.accessToken || !user?.id) {
      throw new Error('Session expired. Please login again.')
    }
  }, [session, user])

  const ensureAdmin = useCallback(() => {
    ensureAuthenticated()
    if (user.role !== 'admin') {
      throw new Error('Admin access is required.')
    }
  }, [ensureAuthenticated, user])

  const userActions = useMemo(
    () => ({
      loadDashboard: async () => {
        ensureAuthenticated()
        return api.getUserDashboard({
          accessToken: session.accessToken,
          userId: user.id,
        })
      },
      loadTransactions: async () => {
        ensureAuthenticated()
        return api.getUserTransactions({
          accessToken: session.accessToken,
          userId: user.id,
        })
      },
      loadInvestments: async () => {
        ensureAuthenticated()
        return api.getUserInvestments({
          accessToken: session.accessToken,
          userId: user.id,
        })
      },
      loadDeposits: async () => {
        ensureAuthenticated()
        return api.getUserDeposits({
          accessToken: session.accessToken,
          userId: user.id,
        })
      },
      loadWithdrawals: async () => {
        ensureAuthenticated()
        return api.getUserWithdrawals({
          accessToken: session.accessToken,
          userId: user.id,
        })
      },
      createDeposit: async () => {
        ensureAuthenticated()
        throw new Error(
          'Wallet funding is admin-managed. Send payment to admin for manual credit.',
        )
      },
      createWithdrawal: async () => {
        ensureAuthenticated()
        throw new Error(
          'Withdrawals are handled by admin only. Contact admin for balance processing.',
        )
      },
      createInvestment: async ({ planId, amount }) => {
        ensureAuthenticated()
        const response = await api.createInvestment({
          accessToken: session.accessToken,
          userId: user.id,
          planId,
          amount,
        })
        await refreshUser()
        return response
      },
    }),
    [ensureAuthenticated, refreshUser, session, user],
  )

  const adminActions = useMemo(
    () => ({
      loadStats: async () => {
        ensureAdmin()
        return api.getAdminStats({ accessToken: session.accessToken })
      },
      loadUsers: async (searchTerm = '') => {
        ensureAdmin()
        return api.getAllUsers({
          accessToken: session.accessToken,
          searchTerm,
        })
      },
      editUser: async ({ userId, updates }) => {
        ensureAdmin()
        return api.editUser({
          accessToken: session.accessToken,
          userId,
          updates,
        })
      },
      setUserStatus: async ({ userId, status }) => {
        ensureAdmin()
        return api.setUserStatus({
          accessToken: session.accessToken,
          userId,
          status,
        })
      },
      adjustUserBalance: async ({ userId, delta, reason }) => {
        ensureAdmin()
        return api.adjustUserBalance({
          accessToken: session.accessToken,
          userId,
          delta,
          reason,
          adminId: user.id,
        })
      },
      loadPendingDeposits: async () => {
        ensureAdmin()
        return api.getPendingDeposits({
          accessToken: session.accessToken,
        })
      },
      loadPendingWithdrawals: async () => {
        ensureAdmin()
        return api.getPendingWithdrawals({
          accessToken: session.accessToken,
        })
      },
      approveDeposit: async (depositId) => {
        ensureAdmin()
        return api.approveDeposit({
          accessToken: session.accessToken,
          depositId,
          adminId: user.id,
        })
      },
      processWithdrawal: async ({ withdrawalId, approve, rejectionReason }) => {
        ensureAdmin()
        return api.processWithdrawal({
          accessToken: session.accessToken,
          withdrawalId,
          adminId: user.id,
          approve,
          rejectionReason,
        })
      },
      loadAllTransactions: async () => {
        ensureAdmin()
        return api.getAllTransactions({
          accessToken: session.accessToken,
        })
      },
    }),
    [ensureAdmin, session, user],
  )

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      authNotice,
      backendMode: BACKEND_MODE,
      demoCredentials: DEMO_CREDENTIALS,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      signIn,
      register,
      signOut,
      sendPasswordReset,
      changePassword,
      refreshUser,
      updateProfile,
      uploadKyc,
      userActions,
      adminActions,
      clearAuthNotice: () => setAuthNotice(''),
    }),
    [
      adminActions,
      authNotice,
      changePassword,
      loading,
      refreshUser,
      register,
      sendPasswordReset,
      session,
      signIn,
      signOut,
      updateProfile,
      uploadKyc,
      user,
      userActions,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
