import { INVESTMENT_PLANS } from '../data/plans'
import * as demo from './demoDb'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const BACKEND_MODE =
  SUPABASE_URL && SUPABASE_ANON_KEY ? 'supabase' : 'demo'

const queryString = (query = {}) => {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const built = params.toString()
  return built ? `?${built}` : ''
}

const mapProfile = (row) => ({
  id: row.id,
  fullName: row.full_name || row.fullName || '',
  email: row.email || '',
  phone: row.phone || '',
  country: row.country || '',
  walletBalance: Number(row.wallet_balance ?? row.walletBalance ?? 0),
  role: row.role || 'user',
  status: row.status || 'active',
  avatarUrl: row.avatar_url || row.avatarUrl || '',
  kycDocument: row.kyc_document_url || row.kycDocument || '',
  createdAt: row.created_at || row.createdAt,
  updatedAt: row.updated_at || row.updatedAt,
})

const mapSession = (payload) => ({
  accessToken: payload.access_token,
  refreshToken: payload.refresh_token,
  expiresAt: new Date(Date.now() + Number(payload.expires_in || 3600) * 1000).toISOString(),
  userId: payload.user?.id,
})

const mapTransaction = (row) => ({
  id: row.id,
  userId: row.user_id || row.userId,
  type: row.type,
  amount: Number(row.amount || 0),
  status: row.status,
  description: row.description,
  sourceId: row.source_id || row.sourceId,
  createdAt: row.created_at || row.createdAt,
})

const mapDeposit = (row) => ({
  id: row.id,
  userId: row.user_id || row.userId,
  amount: Number(row.amount || 0),
  method: row.method || 'Bank Transfer',
  reference: row.reference || '',
  status: row.status,
  createdAt: row.created_at || row.createdAt,
  approvedAt: row.approved_at || row.approvedAt,
  approvedBy: row.approved_by || row.approvedBy,
})

const mapWithdrawal = (row) => ({
  id: row.id,
  userId: row.user_id || row.userId,
  amount: Number(row.amount || 0),
  walletAddress: row.wallet_address || row.walletAddress || '',
  status: row.status,
  rejectionReason: row.rejection_reason || row.rejectionReason || '',
  createdAt: row.created_at || row.createdAt,
  approvedAt: row.approved_at || row.approvedAt,
  approvedBy: row.approved_by || row.approvedBy,
})

const mapInvestment = (row) => ({
  id: row.id,
  userId: row.user_id || row.userId,
  planId: row.plan_id || row.planId,
  planName: row.plan_name || row.planName,
  roi: Number(row.roi || 0),
  amount: Number(row.amount || 0),
  durationDays: Number(row.duration_days || row.durationDays || 0),
  expectedProfit: Number(row.expected_profit || row.expectedProfit || 0),
  status: row.status,
  createdAt: row.created_at || row.createdAt,
  maturesAt: row.matures_at || row.maturesAt,
})

const getHeaders = (accessToken, prefer = '') => {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  } else if (SUPABASE_ANON_KEY) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`
  }

  if (prefer) headers.Prefer = prefer
  return headers
}

const supabaseFetch = async (
  path,
  { method = 'GET', accessToken = '', body, query, prefer = '' } = {},
) => {
  const response = await fetch(`${SUPABASE_URL}${path}${queryString(query)}`, {
    method,
    headers: getHeaders(accessToken, prefer),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json().catch(() => ({})) : await response.text()

  if (!response.ok) {
    const message =
      payload?.msg ||
      payload?.message ||
      payload?.error_description ||
      payload?.error ||
      `Supabase request failed (${response.status}).`
    throw new Error(message)
  }

  return payload
}

const fetchProfile = async (userId, accessToken) => {
  const profileRows = await supabaseFetch('/rest/v1/profiles', {
    accessToken,
    query: {
      id: `eq.${userId}`,
      select: '*',
      limit: 1,
    },
  })
  const row = Array.isArray(profileRows) ? profileRows[0] : profileRows
  return row ? mapProfile(row) : null
}

const upsertProfile = async (profile, accessToken) => {
  const rows = await supabaseFetch('/rest/v1/profiles', {
    method: 'POST',
    accessToken,
    body: [
      {
        id: profile.id,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        country: profile.country,
        wallet_balance: profile.walletBalance ?? 0,
        role: profile.role || 'user',
        status: profile.status || 'active',
      },
    ],
    prefer: 'resolution=merge-duplicates,return=representation',
  })

  return Array.isArray(rows) && rows[0] ? mapProfile(rows[0]) : null
}

const filterBySearch = (users, searchTerm = '') => {
  const term = searchTerm.trim().toLowerCase()
  if (!term) return users
  return users.filter((user) =>
    [user.fullName, user.email, user.phone, user.country].join(' ').toLowerCase().includes(term),
  )
}

const normalizeSupabaseData = async (accessToken, userId) => {
  const [profile, approvedDeposits, approvedWithdrawals, investments, recentTransactions] =
    await Promise.all([
      fetchProfile(userId, accessToken),
      supabaseFetch('/rest/v1/deposits', {
        accessToken,
        query: {
          user_id: `eq.${userId}`,
          status: 'eq.approved',
          select: 'amount',
        },
      }),
      supabaseFetch('/rest/v1/withdrawals', {
        accessToken,
        query: {
          user_id: `eq.${userId}`,
          status: 'eq.approved',
          select: 'amount',
        },
      }),
      supabaseFetch('/rest/v1/investments', {
        accessToken,
        query: {
          user_id: `eq.${userId}`,
          select: '*',
          order: 'created_at.desc',
        },
      }),
      supabaseFetch('/rest/v1/transactions', {
        accessToken,
        query: {
          user_id: `eq.${userId}`,
          select: '*',
          order: 'created_at.desc',
          limit: 8,
        },
      }),
    ])

  const mappedInvestments = investments.map(mapInvestment)
  const metrics = {
    accountBalance: Number(profile?.walletBalance || 0),
    totalDeposits: approvedDeposits.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    totalWithdrawals: approvedWithdrawals.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    totalProfit: mappedInvestments.reduce(
      (sum, investment) => sum + Number(investment.expectedProfit || 0),
      0,
    ),
    activeInvestments: mappedInvestments.filter((investment) => investment.status === 'active')
      .length,
  }

  return {
    profile,
    metrics,
    activeInvestments: mappedInvestments.filter((investment) => investment.status === 'active'),
    recentTransactions: recentTransactions.map(mapTransaction),
  }
}

const supabaseApi = {
  async signIn({ email, password }) {
    const payload = await supabaseFetch('/auth/v1/token', {
      method: 'POST',
      query: { grant_type: 'password' },
      body: { email, password },
    })

    const session = mapSession(payload)
    const profile = await fetchProfile(session.userId, session.accessToken)

    if (!profile) {
      throw new Error('Profile record not found. Apply the SQL schema and retry.')
    }
    if (profile.status !== 'active') {
      throw new Error('This account is suspended.')
    }

    return {
      session,
      user: profile,
    }
  },

  async register({ fullName, email, phone, country, password }) {
    const payload = await supabaseFetch('/auth/v1/signup', {
      method: 'POST',
      body: {
        email,
        password,
        data: {
          full_name: fullName,
          phone,
          country,
          role: 'user',
        },
      },
    })

    const accessToken = payload.access_token || payload.session?.access_token
    const userId = payload.user?.id

    if (!userId) {
      throw new Error('Registration failed. Supabase did not return a user id.')
    }

    await upsertProfile(
      {
        id: userId,
        fullName,
        email,
        phone,
        country,
        walletBalance: 0,
        role: 'user',
        status: 'active',
      },
      accessToken,
    )

    if (!accessToken) {
      return {
        session: null,
        user: null,
        needsEmailVerification: true,
      }
    }

    const session = mapSession({
      ...payload,
      access_token: accessToken,
      refresh_token: payload.refresh_token || payload.session?.refresh_token,
      expires_in: payload.expires_in || payload.session?.expires_in,
      user: payload.user,
    })

    const user = await fetchProfile(session.userId, session.accessToken)
    return { session, user, needsEmailVerification: false }
  },

  async signOut() {
    return true
  },

  async sendPasswordReset({ email }) {
    await supabaseFetch('/auth/v1/recover', {
      method: 'POST',
      body: { email },
    })
    return { message: 'Password reset instructions sent.' }
  },

  async getCurrentUser({ accessToken }) {
    const authUser = await supabaseFetch('/auth/v1/user', {
      accessToken,
    })
    const profile = await fetchProfile(authUser.id, accessToken)
    return profile || mapProfile({ id: authUser.id, email: authUser.email })
  },

  async changePassword({ accessToken, newPassword }) {
    await supabaseFetch('/auth/v1/user', {
      method: 'PUT',
      accessToken,
      body: { password: newPassword },
    })
    return { message: 'Password updated.' }
  },

  async updateProfile({ accessToken, userId, updates }) {
    const body = {
      updated_at: new Date().toISOString(),
    }
    if (updates.fullName) body.full_name = updates.fullName
    if (updates.email) body.email = updates.email
    if (updates.phone) body.phone = updates.phone
    if (updates.country) body.country = updates.country
    if (updates.avatarUrl !== undefined) body.avatar_url = updates.avatarUrl

    const rows = await supabaseFetch('/rest/v1/profiles', {
      method: 'PATCH',
      accessToken,
      query: {
        id: `eq.${userId}`,
        select: '*',
      },
      body,
      prefer: 'return=representation',
    })

    return rows[0] ? mapProfile(rows[0]) : null
  },

  async uploadKyc({ accessToken, userId, fileName }) {
    return this.updateProfile({
      accessToken,
      userId,
      updates: { avatarUrl: undefined },
      kycDocument: fileName,
    })
  },

  async getUserDashboard({ accessToken, userId }) {
    const payload = await normalizeSupabaseData(accessToken, userId)
    return {
      metrics: payload.metrics,
      activeInvestments: payload.activeInvestments,
      recentTransactions: payload.recentTransactions,
    }
  },

  async getUserTransactions({ accessToken, userId }) {
    const rows = await supabaseFetch('/rest/v1/transactions', {
      accessToken,
      query: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc',
      },
    })
    return rows.map(mapTransaction)
  },

  async getUserInvestments({ accessToken, userId }) {
    const rows = await supabaseFetch('/rest/v1/investments', {
      accessToken,
      query: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc',
      },
    })
    return rows.map(mapInvestment)
  },

  async getUserDeposits({ accessToken, userId }) {
    const rows = await supabaseFetch('/rest/v1/deposits', {
      accessToken,
      query: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc',
      },
    })
    return rows.map(mapDeposit)
  },

  async getUserWithdrawals({ accessToken, userId }) {
    const rows = await supabaseFetch('/rest/v1/withdrawals', {
      accessToken,
      query: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc',
      },
    })
    return rows.map(mapWithdrawal)
  },

  async createDepositRequest({ accessToken, userId, amount, method, reference }) {
    const rows = await supabaseFetch('/rest/v1/deposits', {
      method: 'POST',
      accessToken,
      body: [
        {
          user_id: userId,
          amount,
          method: method || 'Bank Transfer',
          reference: reference || `DEP-${Math.floor(Math.random() * 900000 + 100000)}`,
          status: 'pending',
        },
      ],
      prefer: 'return=representation',
    })

    const deposit = rows[0]
    await supabaseFetch('/rest/v1/transactions', {
      method: 'POST',
      accessToken,
      body: [
        {
          user_id: userId,
          type: 'deposit',
          amount,
          status: 'pending',
          source_id: deposit.id,
          description: `Deposit request submitted - ${deposit.reference}`,
        },
      ],
    })

    return mapDeposit(deposit)
  },

  async createWithdrawalRequest({ accessToken, userId, amount, walletAddress }) {
    try {
      const payload = await supabaseFetch('/rest/v1/rpc/create_withdrawal_request', {
        method: 'POST',
        accessToken,
        body: {
          p_user_id: userId,
          p_amount: Number(amount),
          p_wallet_address: walletAddress,
        },
      })
      return mapWithdrawal(payload)
    } catch {
      const rows = await supabaseFetch('/rest/v1/withdrawals', {
        method: 'POST',
        accessToken,
        body: [
          {
            user_id: userId,
            amount,
            wallet_address: walletAddress,
            status: 'pending',
            rejection_reason: '',
          },
        ],
        prefer: 'return=representation',
      })
      const withdrawal = rows[0]
      await supabaseFetch('/rest/v1/transactions', {
        method: 'POST',
        accessToken,
        body: [
          {
            user_id: userId,
            type: 'withdrawal',
            amount,
            status: 'pending',
            source_id: withdrawal.id,
            description: 'Withdrawal request submitted',
          },
        ],
      })
      return mapWithdrawal(withdrawal)
    }
  },

  async createInvestment({ accessToken, userId, planId, amount }) {
    const plan = INVESTMENT_PLANS.find((entry) => entry.id === planId)
    if (!plan) throw new Error('Selected plan does not exist.')

    if (Number(amount) < plan.minDeposit || Number(amount) > plan.maxDeposit) {
      throw new Error(`Amount must be between ${plan.minDeposit} and ${plan.maxDeposit}.`)
    }

    try {
      const payload = await supabaseFetch('/rest/v1/rpc/create_investment_order', {
        method: 'POST',
        accessToken,
        body: {
          p_user_id: userId,
          p_plan_id: plan.id,
          p_plan_name: plan.name,
          p_roi: plan.roi,
          p_amount: Number(amount),
          p_duration_days: plan.durationDays,
        },
      })
      return {
        investment: mapInvestment(payload.investment || payload),
      }
    } catch {
      const profile = await fetchProfile(userId, accessToken)
      if (Number(profile.walletBalance) < Number(amount)) {
        throw new Error('Insufficient wallet balance.')
      }

      await supabaseFetch('/rest/v1/profiles', {
        method: 'PATCH',
        accessToken,
        query: {
          id: `eq.${userId}`,
        },
        body: {
          wallet_balance: Number(profile.walletBalance) - Number(amount),
          updated_at: new Date().toISOString(),
        },
      })

      const investmentRows = await supabaseFetch('/rest/v1/investments', {
        method: 'POST',
        accessToken,
        body: [
          {
            user_id: userId,
            plan_id: plan.id,
            plan_name: plan.name,
            roi: plan.roi,
            amount: Number(amount),
            duration_days: plan.durationDays,
            expected_profit: (Number(amount) * plan.roi) / 100,
            status: 'active',
            matures_at: new Date(
              Date.now() + plan.durationDays * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        ],
        prefer: 'return=representation',
      })

      const investment = investmentRows[0]
      await supabaseFetch('/rest/v1/transactions', {
        method: 'POST',
        accessToken,
        body: [
          {
            user_id: userId,
            type: 'investment',
            amount: Number(amount),
            status: 'approved',
            source_id: investment.id,
            description: `Investment allocated - ${plan.name}`,
          },
        ],
      })

      return {
        investment: mapInvestment(investment),
      }
    }
  },

  async getAdminStats({ accessToken }) {
    const [users, deposits, withdrawals] = await Promise.all([
      supabaseFetch('/rest/v1/profiles', {
        accessToken,
        query: { role: 'eq.user', select: 'id' },
      }),
      supabaseFetch('/rest/v1/deposits', {
        accessToken,
        query: { status: 'in.(approved,pending)', select: 'status,amount' },
      }),
      supabaseFetch('/rest/v1/withdrawals', {
        accessToken,
        query: { status: 'in.(approved,pending)', select: 'status,amount' },
      }),
    ])

    return {
      totalUsers: users.length,
      totalDeposits: deposits
        .filter((entry) => entry.status === 'approved')
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
      totalWithdrawals: withdrawals
        .filter((entry) => entry.status === 'approved')
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
      pendingDeposits: deposits.filter((entry) => entry.status === 'pending').length,
      pendingWithdrawals: withdrawals.filter((entry) => entry.status === 'pending').length,
    }
  },

  async getAllUsers({ accessToken, searchTerm }) {
    const rows = await supabaseFetch('/rest/v1/profiles', {
      accessToken,
      query: {
        role: 'eq.user',
        select: '*',
        order: 'created_at.desc',
      },
    })
    return filterBySearch(rows.map(mapProfile), searchTerm)
  },

  async editUser({ accessToken, userId, updates }) {
    const body = {
      updated_at: new Date().toISOString(),
    }
    if (updates.fullName) body.full_name = updates.fullName
    if (updates.email) body.email = updates.email
    if (updates.phone) body.phone = updates.phone
    if (updates.country) body.country = updates.country
    if (updates.status) body.status = updates.status

    const rows = await supabaseFetch('/rest/v1/profiles', {
      method: 'PATCH',
      accessToken,
      query: {
        id: `eq.${userId}`,
        select: '*',
      },
      body,
      prefer: 'return=representation',
    })

    return rows[0] ? mapProfile(rows[0]) : null
  },

  async setUserStatus({ accessToken, userId, status }) {
    return this.editUser({ accessToken, userId, updates: { status } })
  },

  async adjustUserBalance({ accessToken, userId, delta, reason, adminId }) {
    try {
      const payload = await supabaseFetch('/rest/v1/rpc/admin_adjust_balance', {
        method: 'POST',
        accessToken,
        body: {
          p_user_id: userId,
          p_delta: Number(delta),
          p_reason: reason,
          p_admin_id: adminId,
        },
      })
      return payload?.user ? mapProfile(payload.user) : mapProfile(payload)
    } catch {
      const user = await fetchProfile(userId, accessToken)
      const nextBalance = Number(user.walletBalance) + Number(delta)
      if (nextBalance < 0) throw new Error('Adjustment would result in a negative balance.')

      const rows = await supabaseFetch('/rest/v1/profiles', {
        method: 'PATCH',
        accessToken,
        query: {
          id: `eq.${userId}`,
          select: '*',
        },
        body: {
          wallet_balance: nextBalance,
          updated_at: new Date().toISOString(),
        },
        prefer: 'return=representation',
      })

      await supabaseFetch('/rest/v1/transactions', {
        method: 'POST',
        accessToken,
        body: [
          {
            user_id: userId,
            type: 'balance_adjustment',
            amount: Math.abs(Number(delta)),
            status: 'approved',
            description: Number(delta) > 0 ? `Admin credit: ${reason}` : `Admin debit: ${reason}`,
            source_id: `adj_${Date.now()}`,
            approved_by: adminId,
          },
        ],
      })

      return mapProfile(rows[0])
    }
  },

  async getPendingDeposits({ accessToken }) {
    const [deposits, users] = await Promise.all([
      supabaseFetch('/rest/v1/deposits', {
        accessToken,
        query: {
          status: 'eq.pending',
          select: '*',
          order: 'created_at.desc',
        },
      }),
      supabaseFetch('/rest/v1/profiles', {
        accessToken,
        query: {
          select: 'id,full_name,email',
        },
      }),
    ])

    const userMap = new Map(users.map((entry) => [entry.id, entry]))
    return deposits.map((entry) => {
      const user = userMap.get(entry.user_id)
      return {
        ...mapDeposit(entry),
        userName: user?.full_name || 'Unknown User',
        userEmail: user?.email || '-',
      }
    })
  },

  async getPendingWithdrawals({ accessToken }) {
    const [withdrawals, users] = await Promise.all([
      supabaseFetch('/rest/v1/withdrawals', {
        accessToken,
        query: {
          status: 'eq.pending',
          select: '*',
          order: 'created_at.desc',
        },
      }),
      supabaseFetch('/rest/v1/profiles', {
        accessToken,
        query: {
          select: 'id,full_name,email',
        },
      }),
    ])

    const userMap = new Map(users.map((entry) => [entry.id, entry]))
    return withdrawals.map((entry) => {
      const user = userMap.get(entry.user_id)
      return {
        ...mapWithdrawal(entry),
        userName: user?.full_name || 'Unknown User',
        userEmail: user?.email || '-',
      }
    })
  },

  async approveDeposit({ accessToken, depositId, adminId }) {
    try {
      return await supabaseFetch('/rest/v1/rpc/approve_deposit_request', {
        method: 'POST',
        accessToken,
        body: {
          p_deposit_id: depositId,
          p_admin_id: adminId,
        },
      })
    } catch {
      const depositRows = await supabaseFetch('/rest/v1/deposits', {
        accessToken,
        query: {
          id: `eq.${depositId}`,
          select: '*',
          limit: 1,
        },
      })
      const deposit = depositRows[0]
      if (!deposit) throw new Error('Deposit record not found.')
      if (deposit.status !== 'pending') throw new Error('Deposit already processed.')

      const user = await fetchProfile(deposit.user_id, accessToken)

      await Promise.all([
        supabaseFetch('/rest/v1/deposits', {
          method: 'PATCH',
          accessToken,
          query: {
            id: `eq.${depositId}`,
          },
          body: {
            status: 'approved',
            approved_by: adminId,
            approved_at: new Date().toISOString(),
          },
        }),
        supabaseFetch('/rest/v1/profiles', {
          method: 'PATCH',
          accessToken,
          query: {
            id: `eq.${deposit.user_id}`,
          },
          body: {
            wallet_balance: Number(user.walletBalance) + Number(deposit.amount),
            updated_at: new Date().toISOString(),
          },
        }),
        supabaseFetch('/rest/v1/transactions', {
          method: 'PATCH',
          accessToken,
          query: {
            source_id: `eq.${depositId}`,
          },
          body: {
            status: 'approved',
            description: `Deposit approved - ${deposit.reference}`,
          },
        }),
      ])

      return true
    }
  },

  async processWithdrawal({ accessToken, withdrawalId, adminId, approve, rejectionReason }) {
    try {
      return await supabaseFetch('/rest/v1/rpc/process_withdrawal_request', {
        method: 'POST',
        accessToken,
        body: {
          p_withdrawal_id: withdrawalId,
          p_admin_id: adminId,
          p_approve: approve,
          p_rejection_reason: rejectionReason || '',
        },
      })
    } catch {
      const withdrawalRows = await supabaseFetch('/rest/v1/withdrawals', {
        accessToken,
        query: {
          id: `eq.${withdrawalId}`,
          select: '*',
          limit: 1,
        },
      })
      const withdrawal = withdrawalRows[0]
      if (!withdrawal) throw new Error('Withdrawal record not found.')
      if (withdrawal.status !== 'pending') throw new Error('Withdrawal already processed.')

      if (approve) {
        const user = await fetchProfile(withdrawal.user_id, accessToken)
        if (Number(user.walletBalance) < Number(withdrawal.amount)) {
          throw new Error('Insufficient balance to approve withdrawal.')
        }

        await Promise.all([
          supabaseFetch('/rest/v1/profiles', {
            method: 'PATCH',
            accessToken,
            query: { id: `eq.${withdrawal.user_id}` },
            body: {
              wallet_balance: Number(user.walletBalance) - Number(withdrawal.amount),
              updated_at: new Date().toISOString(),
            },
          }),
          supabaseFetch('/rest/v1/withdrawals', {
            method: 'PATCH',
            accessToken,
            query: { id: `eq.${withdrawalId}` },
            body: {
              status: 'approved',
              rejection_reason: '',
              approved_by: adminId,
              approved_at: new Date().toISOString(),
            },
          }),
          supabaseFetch('/rest/v1/transactions', {
            method: 'PATCH',
            accessToken,
            query: {
              source_id: `eq.${withdrawalId}`,
            },
            body: {
              status: 'approved',
              description: 'Withdrawal approved',
            },
          }),
        ])
      } else {
        await Promise.all([
          supabaseFetch('/rest/v1/withdrawals', {
            method: 'PATCH',
            accessToken,
            query: { id: `eq.${withdrawalId}` },
            body: {
              status: 'rejected',
              rejection_reason: rejectionReason || 'Rejected by admin.',
              approved_by: adminId,
              approved_at: new Date().toISOString(),
            },
          }),
          supabaseFetch('/rest/v1/transactions', {
            method: 'PATCH',
            accessToken,
            query: {
              source_id: `eq.${withdrawalId}`,
            },
            body: {
              status: 'rejected',
              description: 'Withdrawal rejected',
            },
          }),
        ])
      }

      return true
    }
  },

  async getAllTransactions({ accessToken }) {
    const [transactions, users] = await Promise.all([
      supabaseFetch('/rest/v1/transactions', {
        accessToken,
        query: {
          select: '*',
          order: 'created_at.desc',
        },
      }),
      supabaseFetch('/rest/v1/profiles', {
        accessToken,
        query: { select: 'id,full_name,email' },
      }),
    ])

    const userMap = new Map(users.map((entry) => [entry.id, entry]))
    return transactions.map((row) => {
      const user = userMap.get(row.user_id)
      return {
        ...mapTransaction(row),
        userName: user?.full_name || 'Unknown User',
        userEmail: user?.email || '-',
      }
    })
  },
}

const wrapDemo = (fnName) => (payload) => demo[fnName](payload)

const demoApi = {
  signIn: wrapDemo('signIn'),
  register: wrapDemo('register'),
  signOut: wrapDemo('signOut'),
  sendPasswordReset: wrapDemo('sendPasswordReset'),
  getCurrentUser: wrapDemo('getCurrentUser'),
  changePassword: wrapDemo('changePassword'),
  updateProfile: wrapDemo('updateProfile'),
  uploadKyc: wrapDemo('uploadKyc'),
  getUserDashboard: wrapDemo('getUserDashboard'),
  getUserTransactions: wrapDemo('getUserTransactions'),
  getUserInvestments: wrapDemo('getUserInvestments'),
  getUserDeposits: wrapDemo('getUserDeposits'),
  getUserWithdrawals: wrapDemo('getUserWithdrawals'),
  createDepositRequest: wrapDemo('createDepositRequest'),
  createWithdrawalRequest: wrapDemo('createWithdrawalRequest'),
  createInvestment: wrapDemo('createInvestment'),
  getAdminStats: wrapDemo('getAdminStats'),
  getAllUsers: wrapDemo('getAllUsers'),
  editUser: wrapDemo('editUser'),
  setUserStatus: wrapDemo('setUserStatus'),
  adjustUserBalance: wrapDemo('adjustUserBalance'),
  getPendingDeposits: wrapDemo('getPendingDeposits'),
  getPendingWithdrawals: wrapDemo('getPendingWithdrawals'),
  approveDeposit: wrapDemo('approveDeposit'),
  processWithdrawal: wrapDemo('processWithdrawal'),
  getAllTransactions: wrapDemo('getAllTransactions'),
}

export const api = BACKEND_MODE === 'supabase' ? supabaseApi : demoApi
export { DEMO_CREDENTIALS } from './demoDb'
