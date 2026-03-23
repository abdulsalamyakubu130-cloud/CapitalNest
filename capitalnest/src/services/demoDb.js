import { INVESTMENT_PLANS } from '../data/plans'

const DB_KEY = 'capitalnest_demo_db_v1'
const LATENCY_MS = 180

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@capitalnest.io',
    password: 'Admin@123',
  },
  user: {
    email: 'olivia@capitalnest.io',
    password: 'User@123',
  },
}

const pause = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

const run = async (fn) => {
  await pause()
  return fn()
}

const nowIso = () => new Date().toISOString()

const minusDaysIso = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const plusDaysIso = (days) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const createId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`

const clone = (value) => JSON.parse(JSON.stringify(value))

const sanitizeUser = (user) => {
  const sanitized = { ...user }
  delete sanitized.password
  return sanitized
}

const buildSeedDb = () => {
  const users = [
    {
      id: 'user_admin_001',
      fullName: 'CapitalNest Admin',
      email: 'admin@capitalnest.io',
      phone: '+1 202 555 0199',
      country: 'United States',
      walletBalance: 0,
      role: 'admin',
      status: 'active',
      avatarUrl: '',
      kycDocument: '',
      password: 'Admin@123',
      createdAt: minusDaysIso(180),
      updatedAt: minusDaysIso(1),
    },
    {
      id: 'user_olivia_001',
      fullName: 'Olivia Bennett',
      email: 'olivia@capitalnest.io',
      phone: '+1 202 555 0136',
      country: 'United States',
      walletBalance: 18450.25,
      role: 'user',
      status: 'active',
      avatarUrl: '',
      kycDocument: '',
      password: 'User@123',
      createdAt: minusDaysIso(120),
      updatedAt: minusDaysIso(1),
    },
    {
      id: 'user_ethan_002',
      fullName: 'Ethan Brooks',
      email: 'ethan@capitalnest.io',
      phone: '+1 202 555 0114',
      country: 'Canada',
      walletBalance: 7350.8,
      role: 'user',
      status: 'active',
      avatarUrl: '',
      kycDocument: '',
      password: 'User@123',
      createdAt: minusDaysIso(92),
      updatedAt: minusDaysIso(2),
    },
    {
      id: 'user_sophia_003',
      fullName: 'Sophia Mills',
      email: 'sophia@capitalnest.io',
      phone: '+1 202 555 0177',
      country: 'United Kingdom',
      walletBalance: 2200,
      role: 'user',
      status: 'suspended',
      avatarUrl: '',
      kycDocument: '',
      password: 'User@123',
      createdAt: minusDaysIso(70),
      updatedAt: minusDaysIso(5),
    },
  ]

  const deposits = [
    {
      id: 'dep_0001',
      userId: 'user_olivia_001',
      amount: 10000,
      method: 'Bank Transfer',
      reference: 'WIRE-7781',
      status: 'approved',
      createdAt: minusDaysIso(20),
      approvedAt: minusDaysIso(19),
      approvedBy: 'user_admin_001',
    },
    {
      id: 'dep_0002',
      userId: 'user_olivia_001',
      amount: 2500,
      method: 'USDT',
      reference: 'CRYPTO-992',
      status: 'approved',
      createdAt: minusDaysIso(8),
      approvedAt: minusDaysIso(7),
      approvedBy: 'user_admin_001',
    },
    {
      id: 'dep_0003',
      userId: 'user_ethan_002',
      amount: 3000,
      method: 'Card',
      reference: 'CARD-566',
      status: 'pending',
      createdAt: minusDaysIso(1),
      approvedAt: null,
      approvedBy: null,
    },
  ]

  const withdrawals = [
    {
      id: 'wd_0001',
      userId: 'user_olivia_001',
      amount: 1250,
      walletAddress: 'Bank ACH - ****4451',
      status: 'approved',
      rejectionReason: '',
      createdAt: minusDaysIso(12),
      approvedAt: minusDaysIso(11),
      approvedBy: 'user_admin_001',
    },
    {
      id: 'wd_0002',
      userId: 'user_olivia_001',
      amount: 800,
      walletAddress: 'USDT TRC20 - TBx45...',
      status: 'pending',
      rejectionReason: '',
      createdAt: minusDaysIso(2),
      approvedAt: null,
      approvedBy: null,
    },
    {
      id: 'wd_0003',
      userId: 'user_ethan_002',
      amount: 500,
      walletAddress: 'Bank ACH - ****3221',
      status: 'rejected',
      rejectionReason: 'Account verification pending.',
      createdAt: minusDaysIso(5),
      approvedAt: minusDaysIso(4),
      approvedBy: 'user_admin_001',
    },
  ]

  const investments = [
    {
      id: 'inv_0001',
      userId: 'user_olivia_001',
      planId: 'starter',
      planName: 'Starter Plan',
      roi: 5,
      amount: 2000,
      durationDays: 14,
      expectedProfit: 100,
      status: 'active',
      createdAt: minusDaysIso(7),
      maturesAt: plusDaysIso(7),
    },
    {
      id: 'inv_0002',
      userId: 'user_olivia_001',
      planId: 'pro',
      planName: 'Pro Plan',
      roi: 10,
      amount: 7000,
      durationDays: 30,
      expectedProfit: 700,
      status: 'active',
      createdAt: minusDaysIso(3),
      maturesAt: plusDaysIso(27),
    },
    {
      id: 'inv_0003',
      userId: 'user_ethan_002',
      planId: 'starter',
      planName: 'Starter Plan',
      roi: 5,
      amount: 1200,
      durationDays: 14,
      expectedProfit: 60,
      status: 'completed',
      createdAt: minusDaysIso(40),
      maturesAt: minusDaysIso(26),
    },
  ]

  const transactions = [
    {
      id: 'tx_0001',
      userId: 'user_olivia_001',
      type: 'deposit',
      amount: 10000,
      status: 'approved',
      description: 'Deposit approved - WIRE-7781',
      sourceId: 'dep_0001',
      createdAt: minusDaysIso(19),
    },
    {
      id: 'tx_0002',
      userId: 'user_olivia_001',
      type: 'deposit',
      amount: 2500,
      status: 'approved',
      description: 'Deposit approved - CRYPTO-992',
      sourceId: 'dep_0002',
      createdAt: minusDaysIso(7),
    },
    {
      id: 'tx_0003',
      userId: 'user_olivia_001',
      type: 'withdrawal',
      amount: 1250,
      status: 'approved',
      description: 'Withdrawal approved',
      sourceId: 'wd_0001',
      createdAt: minusDaysIso(11),
    },
    {
      id: 'tx_0004',
      userId: 'user_olivia_001',
      type: 'withdrawal',
      amount: 800,
      status: 'pending',
      description: 'Withdrawal request created',
      sourceId: 'wd_0002',
      createdAt: minusDaysIso(2),
    },
    {
      id: 'tx_0005',
      userId: 'user_olivia_001',
      type: 'investment',
      amount: 2000,
      status: 'approved',
      description: 'Investment allocated - Starter Plan',
      sourceId: 'inv_0001',
      createdAt: minusDaysIso(7),
    },
    {
      id: 'tx_0006',
      userId: 'user_olivia_001',
      type: 'investment',
      amount: 7000,
      status: 'approved',
      description: 'Investment allocated - Pro Plan',
      sourceId: 'inv_0002',
      createdAt: minusDaysIso(3),
    },
    {
      id: 'tx_0007',
      userId: 'user_ethan_002',
      type: 'deposit',
      amount: 3000,
      status: 'pending',
      description: 'Deposit request created - CARD-566',
      sourceId: 'dep_0003',
      createdAt: minusDaysIso(1),
    },
    {
      id: 'tx_0008',
      userId: 'user_ethan_002',
      type: 'withdrawal',
      amount: 500,
      status: 'rejected',
      description: 'Withdrawal rejected',
      sourceId: 'wd_0003',
      createdAt: minusDaysIso(4),
    },
  ]

  return {
    users,
    deposits,
    withdrawals,
    investments,
    transactions,
  }
}

const readDb = () => {
  if (typeof window === 'undefined') return buildSeedDb()

  const raw = window.localStorage.getItem(DB_KEY)
  if (!raw) {
    const seed = buildSeedDb()
    window.localStorage.setItem(DB_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    return JSON.parse(raw)
  } catch {
    const seed = buildSeedDb()
    window.localStorage.setItem(DB_KEY, JSON.stringify(seed))
    return seed
  }
}

const writeDb = (db) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DB_KEY, JSON.stringify(db))
}

const toPublicUser = (user) => sanitizeUser(clone(user))

const getUserOrThrow = (db, userId) => {
  const user = db.users.find((entry) => entry.id === userId)
  if (!user) throw new Error('User record could not be found.')
  return user
}

const getPlanOrThrow = (planId) => {
  const plan = INVESTMENT_PLANS.find((entry) => entry.id === planId)
  if (!plan) throw new Error('Investment plan does not exist.')
  return plan
}

const assertEmailIsAvailable = (db, email, currentUserId = '') => {
  const normalized = email.trim().toLowerCase()
  const exists = db.users.some(
    (entry) => entry.id !== currentUserId && entry.email.toLowerCase() === normalized,
  )
  if (exists) {
    throw new Error('An account with this email already exists.')
  }
}

const sortDescByCreatedAt = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)

const mapTransaction = (entry) => ({
  id: entry.id,
  userId: entry.userId,
  type: entry.type,
  amount: Number(entry.amount),
  status: entry.status,
  description: entry.description,
  sourceId: entry.sourceId,
  createdAt: entry.createdAt,
})

const withUserDetails = (db, list) =>
  list.map((entry) => {
    const user = db.users.find((item) => item.id === entry.userId)
    return {
      ...clone(entry),
      userName: user?.fullName || 'Unknown User',
      userEmail: user?.email || '-',
    }
  })

const updateTransactionStatus = (db, sourceId, status, description = '') => {
  const tx = db.transactions.find((entry) => entry.sourceId === sourceId)
  if (!tx) return
  tx.status = status
  if (description) tx.description = description
  tx.updatedAt = nowIso()
}

export const signIn = ({ email, password }) =>
  run(() => {
    const db = readDb()
    const user = db.users.find(
      (entry) => entry.email.toLowerCase() === email.trim().toLowerCase(),
    )

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.')
    }

    if (user.status !== 'active') {
      throw new Error('This account is suspended. Please contact support.')
    }

    return {
      session: {
        accessToken: createId('demo_access'),
        refreshToken: createId('demo_refresh'),
        expiresAt: plusDaysIso(7),
        userId: user.id,
      },
      user: toPublicUser(user),
    }
  })

export const register = ({ fullName, email, phone, country, password }) =>
  run(() => {
    const db = readDb()
    assertEmailIsAvailable(db, email)

    if (String(password).length < 8) {
      throw new Error('Password must be at least 8 characters long.')
    }

    const newUser = {
      id: createId('user'),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country.trim(),
      walletBalance: 0,
      role: 'user',
      status: 'active',
      avatarUrl: '',
      kycDocument: '',
      password,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    db.users.push(newUser)
    writeDb(db)

    return {
      session: {
        accessToken: createId('demo_access'),
        refreshToken: createId('demo_refresh'),
        expiresAt: plusDaysIso(7),
        userId: newUser.id,
      },
      user: toPublicUser(newUser),
    }
  })

export const signOut = () => run(() => true)

export const sendPasswordReset = ({ email }) =>
  run(() => {
    if (!email.trim()) {
      throw new Error('Please provide a valid email address.')
    }
    return {
      message: 'If an account exists, a reset link has been sent.',
    }
  })

export const getCurrentUser = ({ userId }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)
    if (user.status !== 'active') {
      throw new Error('Account is no longer active.')
    }
    return toPublicUser(user)
  })

export const changePassword = ({ userId, currentPassword, newPassword }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)

    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect.')
    }
    if (String(newPassword).length < 8) {
      throw new Error('New password must be at least 8 characters.')
    }

    user.password = newPassword
    user.updatedAt = nowIso()
    writeDb(db)

    return { message: 'Password updated successfully.' }
  })

export const updateProfile = ({ userId, updates }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)

    if (updates.email && updates.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      assertEmailIsAvailable(db, updates.email, user.id)
      user.email = updates.email.trim().toLowerCase()
    }

    if (updates.fullName) user.fullName = updates.fullName.trim()
    if (updates.phone) user.phone = updates.phone.trim()
    if (updates.country) user.country = updates.country.trim()
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl

    user.updatedAt = nowIso()
    writeDb(db)
    return toPublicUser(user)
  })

export const uploadKyc = ({ userId, fileName }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)
    user.kycDocument = fileName
    user.updatedAt = nowIso()
    writeDb(db)
    return toPublicUser(user)
  })

export const getUserDashboard = ({ userId }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)

    const deposits = db.deposits.filter(
      (entry) => entry.userId === userId && entry.status === 'approved',
    )
    const withdrawals = db.withdrawals.filter(
      (entry) => entry.userId === userId && entry.status === 'approved',
    )
    const investments = db.investments.filter((entry) => entry.userId === userId)
    const activeInvestments = investments.filter((entry) => entry.status === 'active')
    const totalProfit = investments.reduce(
      (sum, entry) => sum + Number(entry.expectedProfit || 0),
      0,
    )

    const recentTransactions = db.transactions
      .filter((entry) => entry.userId === userId)
      .sort(sortDescByCreatedAt)
      .slice(0, 8)
      .map(mapTransaction)

    return {
      metrics: {
        accountBalance: Number(user.walletBalance),
        totalDeposits: deposits.reduce((sum, entry) => sum + Number(entry.amount), 0),
        totalWithdrawals: withdrawals.reduce((sum, entry) => sum + Number(entry.amount), 0),
        totalProfit,
        activeInvestments: activeInvestments.length,
      },
      activeInvestments: clone(activeInvestments),
      recentTransactions,
    }
  })

export const getUserTransactions = ({ userId }) =>
  run(() => {
    const db = readDb()
    return db.transactions
      .filter((entry) => entry.userId === userId)
      .sort(sortDescByCreatedAt)
      .map(mapTransaction)
  })

export const getUserInvestments = ({ userId }) =>
  run(() => {
    const db = readDb()
    return db.investments
      .filter((entry) => entry.userId === userId)
      .sort(sortDescByCreatedAt)
      .map((entry) => clone(entry))
  })

export const getUserDeposits = ({ userId }) =>
  run(() => {
    const db = readDb()
    return db.deposits
      .filter((entry) => entry.userId === userId)
      .sort(sortDescByCreatedAt)
      .map((entry) => clone(entry))
  })

export const getUserWithdrawals = ({ userId }) =>
  run(() => {
    const db = readDb()
    return db.withdrawals
      .filter((entry) => entry.userId === userId)
      .sort(sortDescByCreatedAt)
      .map((entry) => clone(entry))
  })

export const createDepositRequest = ({ userId, amount, method, reference }) =>
  run(() => {
    const db = readDb()
    getUserOrThrow(db, userId)
    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Deposit amount must be greater than zero.')
    }

    const deposit = {
      id: createId('dep'),
      userId,
      amount: parsedAmount,
      method: method || 'Bank Transfer',
      reference: reference || `DEP-${Math.floor(Math.random() * 900000 + 100000)}`,
      status: 'pending',
      createdAt: nowIso(),
      approvedAt: null,
      approvedBy: null,
    }

    db.deposits.unshift(deposit)
    db.transactions.unshift({
      id: createId('tx'),
      userId,
      type: 'deposit',
      amount: parsedAmount,
      status: 'pending',
      description: `Deposit request submitted - ${deposit.reference}`,
      sourceId: deposit.id,
      createdAt: nowIso(),
    })
    writeDb(db)
    return clone(deposit)
  })

export const createWithdrawalRequest = ({ userId, amount, walletAddress }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)
    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero.')
    }
    if (parsedAmount > Number(user.walletBalance)) {
      throw new Error('Insufficient wallet balance for this withdrawal.')
    }

    const withdrawal = {
      id: createId('wd'),
      userId,
      amount: parsedAmount,
      walletAddress: walletAddress.trim() || 'Primary Wallet',
      status: 'pending',
      rejectionReason: '',
      createdAt: nowIso(),
      approvedAt: null,
      approvedBy: null,
    }

    db.withdrawals.unshift(withdrawal)
    db.transactions.unshift({
      id: createId('tx'),
      userId,
      type: 'withdrawal',
      amount: parsedAmount,
      status: 'pending',
      description: 'Withdrawal request submitted',
      sourceId: withdrawal.id,
      createdAt: nowIso(),
    })
    writeDb(db)
    return clone(withdrawal)
  })

export const createInvestment = ({ userId, planId, amount }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)
    const plan = getPlanOrThrow(planId)
    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Investment amount must be greater than zero.')
    }
    if (parsedAmount < plan.minDeposit || parsedAmount > plan.maxDeposit) {
      throw new Error(
        `Amount must be between ${plan.minDeposit} and ${plan.maxDeposit} for ${plan.name}.`,
      )
    }
    if (parsedAmount > Number(user.walletBalance)) {
      throw new Error('Insufficient wallet balance for this investment.')
    }

    user.walletBalance = Number(user.walletBalance) - parsedAmount
    user.updatedAt = nowIso()

    const investment = {
      id: createId('inv'),
      userId,
      planId: plan.id,
      planName: plan.name,
      roi: plan.roi,
      amount: parsedAmount,
      durationDays: plan.durationDays,
      expectedProfit: (parsedAmount * plan.roi) / 100,
      status: 'active',
      createdAt: nowIso(),
      maturesAt: plusDaysIso(plan.durationDays),
    }

    db.investments.unshift(investment)
    db.transactions.unshift({
      id: createId('tx'),
      userId,
      type: 'investment',
      amount: parsedAmount,
      status: 'approved',
      description: `Investment allocated - ${plan.name}`,
      sourceId: investment.id,
      createdAt: nowIso(),
    })
    writeDb(db)

    return {
      investment: clone(investment),
      user: toPublicUser(user),
    }
  })

export const getAdminStats = () =>
  run(() => {
    const db = readDb()
    const userCount = db.users.filter((entry) => entry.role === 'user').length
    const totalDeposits = db.deposits
      .filter((entry) => entry.status === 'approved')
      .reduce((sum, entry) => sum + Number(entry.amount), 0)
    const totalWithdrawals = db.withdrawals
      .filter((entry) => entry.status === 'approved')
      .reduce((sum, entry) => sum + Number(entry.amount), 0)

    return {
      totalUsers: userCount,
      totalDeposits,
      totalWithdrawals,
      pendingDeposits: db.deposits.filter((entry) => entry.status === 'pending').length,
      pendingWithdrawals: db.withdrawals.filter((entry) => entry.status === 'pending').length,
    }
  })

export const getAllUsers = ({ searchTerm = '' }) =>
  run(() => {
    const db = readDb()
    const term = searchTerm.trim().toLowerCase()

    return db.users
      .filter((entry) => entry.role === 'user')
      .filter((entry) => {
        if (!term) return true
        return [entry.fullName, entry.email, entry.phone, entry.country]
          .join(' ')
          .toLowerCase()
          .includes(term)
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(toPublicUser)
  })

export const editUser = ({ userId, updates }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)

    if (user.role !== 'user') {
      throw new Error('Only investor profiles can be edited here.')
    }

    if (updates.email && updates.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      assertEmailIsAvailable(db, updates.email, user.id)
      user.email = updates.email.trim().toLowerCase()
    }

    if (updates.fullName) user.fullName = updates.fullName.trim()
    if (updates.phone) user.phone = updates.phone.trim()
    if (updates.country) user.country = updates.country.trim()
    if (updates.status && ['active', 'suspended'].includes(updates.status)) {
      user.status = updates.status
    }

    user.updatedAt = nowIso()
    writeDb(db)
    return toPublicUser(user)
  })

export const setUserStatus = ({ userId, status }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)

    if (!['active', 'suspended'].includes(status)) {
      throw new Error('Invalid status selected.')
    }

    user.status = status
    user.updatedAt = nowIso()
    writeDb(db)
    return toPublicUser(user)
  })

export const adjustUserBalance = ({ userId, delta, reason, adminId }) =>
  run(() => {
    const db = readDb()
    const user = getUserOrThrow(db, userId)
    const parsedDelta = Number(delta)

    if (!Number.isFinite(parsedDelta) || parsedDelta === 0) {
      throw new Error('Adjustment value must be a non-zero number.')
    }

    const nextBalance = Number(user.walletBalance) + parsedDelta
    if (nextBalance < 0) {
      throw new Error('Adjustment would result in a negative balance.')
    }

    user.walletBalance = nextBalance
    user.updatedAt = nowIso()

    db.transactions.unshift({
      id: createId('tx'),
      userId: user.id,
      type: 'balance_adjustment',
      amount: Math.abs(parsedDelta),
      status: 'approved',
      description: parsedDelta > 0 ? `Admin credit: ${reason}` : `Admin debit: ${reason}`,
      sourceId: createId('adj'),
      createdAt: nowIso(),
      approvedBy: adminId,
    })

    writeDb(db)
    return toPublicUser(user)
  })

export const getPendingDeposits = () =>
  run(() => {
    const db = readDb()
    return withUserDetails(
      db,
      db.deposits.filter((entry) => entry.status === 'pending').sort(sortDescByCreatedAt),
    )
  })

export const getPendingWithdrawals = () =>
  run(() => {
    const db = readDb()
    return withUserDetails(
      db,
      db.withdrawals.filter((entry) => entry.status === 'pending').sort(sortDescByCreatedAt),
    )
  })

export const approveDeposit = ({ depositId, adminId }) =>
  run(() => {
    const db = readDb()
    const deposit = db.deposits.find((entry) => entry.id === depositId)
    if (!deposit) throw new Error('Deposit request could not be found.')
    if (deposit.status !== 'pending') {
      throw new Error('This deposit has already been processed.')
    }

    const user = getUserOrThrow(db, deposit.userId)
    deposit.status = 'approved'
    deposit.approvedAt = nowIso()
    deposit.approvedBy = adminId

    user.walletBalance = Number(user.walletBalance) + Number(deposit.amount)
    user.updatedAt = nowIso()

    updateTransactionStatus(db, deposit.id, 'approved', `Deposit approved - ${deposit.reference}`)
    writeDb(db)
    return clone(deposit)
  })

export const processWithdrawal = ({
  withdrawalId,
  adminId,
  approve,
  rejectionReason = '',
}) =>
  run(() => {
    const db = readDb()
    const withdrawal = db.withdrawals.find((entry) => entry.id === withdrawalId)
    if (!withdrawal) throw new Error('Withdrawal request could not be found.')
    if (withdrawal.status !== 'pending') {
      throw new Error('This withdrawal has already been processed.')
    }

    const user = getUserOrThrow(db, withdrawal.userId)

    if (approve) {
      if (Number(user.walletBalance) < Number(withdrawal.amount)) {
        throw new Error('Insufficient user balance. Approval cannot be completed.')
      }

      user.walletBalance = Number(user.walletBalance) - Number(withdrawal.amount)
      user.updatedAt = nowIso()
      withdrawal.status = 'approved'
      withdrawal.rejectionReason = ''
      updateTransactionStatus(db, withdrawal.id, 'approved', 'Withdrawal approved')
    } else {
      withdrawal.status = 'rejected'
      withdrawal.rejectionReason = rejectionReason || 'Request rejected by admin.'
      updateTransactionStatus(db, withdrawal.id, 'rejected', 'Withdrawal rejected')
    }

    withdrawal.approvedAt = nowIso()
    withdrawal.approvedBy = adminId
    writeDb(db)
    return clone(withdrawal)
  })

export const getAllTransactions = () =>
  run(() => {
    const db = readDb()
    return withUserDetails(db, db.transactions)
      .sort(sortDescByCreatedAt)
      .map((entry) => ({
        ...entry,
        amount: Number(entry.amount),
      }))
  })
