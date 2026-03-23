import { useEffect, useMemo, useState } from 'react'
import { INVESTMENT_PLANS } from '../data/plans'
import { useAuth } from '../context/authContextStore'
import { formatCurrency, formatDateTime, toAmount } from '../utils/format'
import { Icon } from '../components/icons'
import {
  DataTable,
  EmptyState,
  FormNotice,
  InvestmentPlanCard,
  MiniBarChart,
  SectionCard,
  StatCard,
  StatusBadge,
  TransactionTable,
} from '../components/ui'

const userNav = [
  { path: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/app/profile', label: 'Profile', icon: 'profile' },
  { path: '/app/investments', label: 'Plans', icon: 'plan' },
  { path: '/app/transactions', label: 'Transactions', icon: 'transactions' },
]

const EMPTY_METRICS = {
  accountBalance: 0,
  totalDeposits: 0,
  totalWithdrawals: 0,
  totalProfit: 0,
  activeInvestments: 0,
}

const UserShell = ({ currentPath, onNavigate, title, subtitle, children, action = null }) => {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    onNavigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-mark">CN</span>
          <div>
            <strong>CapitalNest</strong>
            <small>Investor Workspace</small>
          </div>
        </div>
        <nav>
          {userNav.map((item) => (
            <button
              key={item.path}
              className={currentPath === item.path ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate(item.path)}
            >
              <span className="nav-link-inner">
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </span>
            </button>
          ))}
        </nav>
        <button className="secondary-btn full with-icon" onClick={handleLogout}>
          <Icon name="logout" size={15} />
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="dashboard-header-right">
            <div className="wallet-pill">
              <Icon name="money" size={14} />
              <span>Wallet: {formatCurrency(user?.walletBalance || 0)}</span>
            </div>
            {action}
          </div>
        </header>
        <section className="dashboard-content">{children}</section>
      </main>
    </div>
  )
}

export const UserDashboardPage = ({ currentPath, onNavigate }) => {
  const { user, userActions } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const payload = await userActions.loadDashboard()
        if (active) setDashboard(payload)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load dashboard.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userActions])

  const metrics = dashboard?.metrics || EMPTY_METRICS

  const chartData = useMemo(
    () => [
      { label: 'Deposits', value: metrics.totalDeposits },
      { label: 'Withdrawals', value: metrics.totalWithdrawals },
      { label: 'Profit', value: metrics.totalProfit },
      { label: 'Balance', value: metrics.accountBalance },
    ],
    [metrics],
  )

  return (
    <UserShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title={`Welcome, ${user?.fullName?.split(' ')[0] || 'Investor'}`}
      subtitle="Your investment performance and transactions in one view."
    >
      <FormNotice kind="danger" message={error} />
      <div className="stat-grid">
        <StatCard
          label="Account Balance"
          value={formatCurrency(metrics.accountBalance)}
          helper="Available wallet funds"
          tone="primary"
          icon="money"
        />
        <StatCard
          label="Total Deposits"
          value={formatCurrency(metrics.totalDeposits)}
          helper="Approved deposits"
          icon="deposit"
        />
        <StatCard
          label="Total Withdrawals"
          value={formatCurrency(metrics.totalWithdrawals)}
          helper="Approved withdrawals"
          tone="muted"
          icon="withdraw"
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(metrics.totalProfit)}
          helper={`${metrics.activeInvestments} active investments`}
          tone="success"
          icon="trendUp"
        />
      </div>

      <SectionCard
        title="Quick Actions"
        subtitle="Invest, review activity, and contact admin for wallet funding."
      >
        <div className="quick-action-grid">
          <button className="quick-action-btn" onClick={() => onNavigate('/app/investments')}>
            <Icon name="plan" size={18} />
            <strong>Invest Now</strong>
            <small>Allocate into plans</small>
          </button>
          <button className="quick-action-btn" onClick={() => onNavigate('/app/transactions')}>
            <Icon name="transactions" size={18} />
            <strong>View Ledger</strong>
            <small>Review all activity</small>
          </button>
          <button className="quick-action-btn" onClick={() => onNavigate('/app/profile')}>
            <Icon name="profile" size={18} />
            <strong>Profile</strong>
            <small>Manage account settings</small>
          </button>
        </div>
      </SectionCard>

      <div className="dashboard-grid">
        <SectionCard
          title="Performance Overview"
          subtitle="Current financial distribution"
          className="span-5"
        >
          {loading ? (
            <p className="loading-text">Loading chart...</p>
          ) : (
            <MiniBarChart title="USD Movement" data={chartData} />
          )}
        </SectionCard>
        <SectionCard
          title="Active Investments"
          subtitle="Running plans and expected returns"
          className="span-7"
        >
          {!dashboard?.activeInvestments?.length ? (
            <EmptyState
              title="No active investments"
              description="Start with Starter, Pro, or Elite plan to begin tracking performance."
            />
          ) : (
            <div className="compact-list">
              {dashboard.activeInvestments.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.planName}</strong>
                    <small>
                      {formatCurrency(item.amount)} for {item.durationDays} days
                    </small>
                  </div>
                  <div>
                    <strong>{formatCurrency(item.expectedProfit)}</strong>
                    <small>Expected Profit</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Transactions"
        subtitle="Latest deposit, withdrawal, and investment activity"
      >
        {loading ? <p className="loading-text">Loading transactions...</p> : null}
        {!loading ? <TransactionTable transactions={dashboard?.recentTransactions || []} /> : null}
      </SectionCard>
    </UserShell>
  )
}

export const UserProfilePage = ({ currentPath, onNavigate }) => {
  const { user, updateProfile, changePassword, uploadKyc } = useAuth()
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || '',
  })
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setProfile({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      country: user?.country || '',
    })
  }, [user])

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    setError('')
    try {
      await updateProfile(profile)
      setNotice('Profile updated successfully.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    setNotice('')
    setError('')
    if (password.newPassword !== password.confirmPassword) {
      setError('New password confirmation does not match.')
      return
    }
    try {
      await changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      })
      setNotice('Password changed successfully.')
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (saveError) {
      setError(saveError.message || 'Unable to change password.')
    }
  }

  const handleKycUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setNotice('')
    setError('')
    try {
      await uploadKyc(file.name)
      setNotice('KYC document uploaded for review.')
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload KYC document.')
    }
  }

  return (
    <UserShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Profile Settings"
      subtitle="Manage account details, security, and verification."
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <div className="dashboard-grid">
        <SectionCard title="Account Information" subtitle="Basic profile and contact details" className="span-7">
          <form className="form-grid" onSubmit={handleProfileSave}>
            <label>
              Full Name
              <input
                type="text"
                value={profile.fullName}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, fullName: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                value={profile.phone}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, phone: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Country
              <input
                type="text"
                value={profile.country}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, country: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Wallet Balance (USD)
              <input type="text" value={formatCurrency(user?.walletBalance || 0)} disabled />
            </label>
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Edit Profile'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Security & KYC" subtitle="Protect your account and update verification status" className="span-5">
          <form className="stacked-form" onSubmit={handlePasswordSave}>
            <label>
              Current Password
              <input
                type="password"
                value={password.currentPassword}
                onChange={(event) =>
                  setPassword((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
                required
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                minLength={8}
                value={password.newPassword}
                onChange={(event) =>
                  setPassword((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                minLength={8}
                value={password.confirmPassword}
                onChange={(event) =>
                  setPassword((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                required
              />
            </label>
            <button className="secondary-btn" type="submit">
              Change Password
            </button>
          </form>
          <div className="kyc-box">
            <h4>KYC Upload (Optional)</h4>
            <p>Upload identity documentation for enhanced account limits.</p>
            <input type="file" onChange={handleKycUpload} />
            {user?.kycDocument ? <small>Current file: {user.kycDocument}</small> : null}
          </div>
        </SectionCard>
      </div>
    </UserShell>
  )
}

export const UserInvestmentsPage = ({ currentPath, onNavigate }) => {
  const { userActions } = useAuth()
  const [investments, setInvestments] = useState([])
  const [amountMap, setAmountMap] = useState(
    Object.fromEntries(INVESTMENT_PLANS.map((plan) => [plan.id, String(plan.minDeposit)])),
  )
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loadingPlan, setLoadingPlan] = useState('')
  const [loading, setLoading] = useState(true)

  const loadInvestments = async () => {
    const rows = await userActions.loadInvestments()
    setInvestments(rows)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const rows = await userActions.loadInvestments()
        if (active) setInvestments(rows)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to fetch investments.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userActions])

  const updateAmount = (planId, value) => {
    setAmountMap((prev) => ({ ...prev, [planId]: value }))
  }

  const handleInvest = async (planId) => {
    setLoadingPlan(planId)
    setError('')
    setNotice('')
    try {
      await userActions.createInvestment({
        planId,
        amount: toAmount(amountMap[planId]),
      })
      await loadInvestments()
      setNotice('Investment created successfully.')
    } catch (createError) {
      setError(createError.message || 'Unable to create investment.')
    } finally {
      setLoadingPlan('')
    }
  }

  return (
    <UserShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Investment Plans"
      subtitle="Select your plan and allocate capital with controlled risk bands."
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <div className="plan-grid">
        {INVESTMENT_PLANS.map((plan) => (
          <InvestmentPlanCard
            key={plan.id}
            plan={plan}
            amount={amountMap[plan.id]}
            onAmountChange={updateAmount}
            onInvest={handleInvest}
            loading={loadingPlan === plan.id}
          />
        ))}
      </div>

      <SectionCard title="Your Investments" subtitle="All plan allocations and maturity timeline">
        {loading ? (
          <p className="loading-text">Loading investments...</p>
        ) : (
          <DataTable
            columns={[
              { key: 'planName', label: 'Plan' },
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatCurrency(row.amount),
              },
              {
                key: 'expectedProfit',
                label: 'Expected Profit',
                render: (row) => formatCurrency(row.expectedProfit),
              },
              {
                key: 'maturesAt',
                label: 'Matures',
                render: (row) => formatDateTime(row.maturesAt),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            rows={investments}
            emptyTitle="No investments yet."
          />
        )}
      </SectionCard>
    </UserShell>
  )
}

export const UserDepositPage = ({ currentPath, onNavigate }) => {
  const { userActions } = useAuth()
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    amount: '',
    method: 'Bank Transfer',
    reference: '',
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDeposits = async () => {
    const rows = await userActions.loadDeposits()
    setDeposits(rows)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const rows = await userActions.loadDeposits()
        if (active) setDeposits(rows)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to fetch deposits.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userActions])

  const submitDeposit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setNotice('')
    setError('')

    try {
      await userActions.createDeposit({
        amount: toAmount(form.amount),
        method: form.method,
        reference: form.reference,
      })
      await loadDeposits()
      setForm({ amount: '', method: 'Bank Transfer', reference: '' })
      setNotice('Deposit request submitted. Awaiting admin approval.')
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit deposit request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <UserShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Deposit Requests"
      subtitle="Submit funding requests and track approval status."
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <SectionCard title="Create Deposit" subtitle="All values are in USD">
        <form className="form-row" onSubmit={submitDeposit}>
          <label>
            Amount (USD)
            <input
              type="number"
              value={form.amount}
              min={1}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label>
            Method
            <select
              value={form.method}
              onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
            >
              <option>Bank Transfer</option>
              <option>Card</option>
              <option>USDT</option>
            </select>
          </label>
          <label>
            Reference (Optional)
            <input
              type="text"
              value={form.reference}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reference: event.target.value }))
              }
            />
          </label>
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Deposit'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Deposit History" subtitle="Track pending and approved requests">
        {loading ? (
          <p className="loading-text">Loading deposits...</p>
        ) : (
          <DataTable
            columns={[
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatCurrency(row.amount),
              },
              { key: 'method', label: 'Method' },
              { key: 'reference', label: 'Reference' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'createdAt',
                label: 'Date',
                render: (row) => formatDateTime(row.createdAt),
              },
            ]}
            rows={deposits}
            emptyTitle="No deposits found."
          />
        )}
      </SectionCard>
    </UserShell>
  )
}

export const UserWithdrawalsPage = ({ currentPath, onNavigate }) => {
  const { userActions } = useAuth()
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    amount: '',
    walletAddress: '',
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadWithdrawals = async () => {
    const rows = await userActions.loadWithdrawals()
    setWithdrawals(rows)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const rows = await userActions.loadWithdrawals()
        if (active) setWithdrawals(rows)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to fetch withdrawals.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userActions])

  const submitWithdrawal = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setNotice('')
    setError('')

    try {
      await userActions.createWithdrawal({
        amount: toAmount(form.amount),
        walletAddress: form.walletAddress,
      })
      await loadWithdrawals()
      setForm({ amount: '', walletAddress: '' })
      setNotice('Withdrawal request submitted for admin review.')
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit withdrawal request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <UserShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Withdrawal Requests"
      subtitle="Submit withdrawal requests and monitor processing decisions."
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <SectionCard title="Create Withdrawal" subtitle="Withdrawals are validated against wallet balance">
        <form className="form-row" onSubmit={submitWithdrawal}>
          <label>
            Amount (USD)
            <input
              type="number"
              value={form.amount}
              min={1}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label>
            Wallet / Bank Details
            <input
              type="text"
              value={form.walletAddress}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, walletAddress: event.target.value }))
              }
              required
            />
          </label>
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Withdrawal'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Withdrawal History" subtitle="Review all requests and outcomes">
        {loading ? (
          <p className="loading-text">Loading withdrawals...</p>
        ) : (
          <DataTable
            columns={[
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatCurrency(row.amount),
              },
              { key: 'walletAddress', label: 'Destination' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'createdAt',
                label: 'Date',
                render: (row) => formatDateTime(row.createdAt),
              },
              {
                key: 'rejectionReason',
                label: 'Reason',
                render: (row) => row.rejectionReason || '-',
              },
            ]}
            rows={withdrawals}
            emptyTitle="No withdrawals found."
          />
        )}
      </SectionCard>
    </UserShell>
  )
}

export const UserTransactionsPage = ({ currentPath, onNavigate }) => {
  const { userActions } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const rows = await userActions.loadTransactions()
        if (active) setTransactions(rows)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to fetch transactions.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userActions])

  return (
    <UserShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Transactions"
      subtitle="Complete transaction ledger for your account."
    >
      <FormNotice kind="danger" message={error} />
      <SectionCard title="Transaction Ledger" subtitle="Deposits, withdrawals, investments, and adjustments">
        {loading ? <p className="loading-text">Loading transactions...</p> : null}
        {!loading ? <TransactionTable transactions={transactions} /> : null}
      </SectionCard>
    </UserShell>
  )
}
