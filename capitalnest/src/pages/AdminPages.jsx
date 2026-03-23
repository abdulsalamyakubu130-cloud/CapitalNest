import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/authContextStore'
import { formatCurrency, formatDateTime, toAmount } from '../utils/format'
import { Icon } from '../components/icons'
import {
  DataTable,
  FormNotice,
  MiniBarChart,
  Modal,
  SectionCard,
  StatCard,
  StatusBadge,
} from '../components/ui'

const adminNav = [
  { path: '/admin/dashboard', label: 'Overview', icon: 'dashboard' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
  { path: '/admin/approvals', label: 'Approvals', icon: 'checkCircle' },
  { path: '/admin/transactions', label: 'Transactions', icon: 'transactions' },
]

const AdminShell = ({ currentPath, onNavigate, title, subtitle, children }) => {
  const { user, signOut } = useAuth()

  const logout = async () => {
    await signOut()
    onNavigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="dashboard-brand">
          <span className="brand-mark">CN</span>
          <div>
            <strong>CapitalNest</strong>
            <small>Admin Control</small>
          </div>
        </div>
        <nav>
          {adminNav.map((item) => (
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
        <button className="secondary-btn full with-icon" onClick={logout}>
          <Icon name="logout" size={15} />
          <span>Logout</span>
        </button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="admin-pill">
            <strong>
              <Icon name="profile" size={13} /> {user?.fullName}
            </strong>
            <span>
              <Icon name="shield" size={13} /> Role: Admin
            </span>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </main>
    </div>
  )
}

export const AdminDashboardPage = ({ currentPath, onNavigate }) => {
  const { adminActions } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const payload = await adminActions.loadStats()
        if (active) setStats(payload)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load admin statistics.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [adminActions])

  const chart = useMemo(
    () => [
      { label: 'Deposits', value: stats?.totalDeposits || 0 },
      { label: 'Withdrawals', value: stats?.totalWithdrawals || 0 },
    ],
    [stats],
  )

  return (
    <AdminShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Admin Dashboard"
      subtitle="Monitor platform activity, capital flow, and pending actions."
    >
      <FormNotice kind="danger" message={error} />
      <div className="stat-grid">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          helper="Registered investors"
          icon="users"
        />
        <StatCard
          label="Total Deposits"
          value={formatCurrency(stats?.totalDeposits || 0)}
          helper="Approved deposits"
          tone="success"
          icon="deposit"
        />
        <StatCard
          label="Total Withdrawals"
          value={formatCurrency(stats?.totalWithdrawals || 0)}
          helper="Approved withdrawals"
          icon="withdraw"
        />
        <StatCard
          label="Pending Actions"
          value={(stats?.pendingDeposits || 0) + (stats?.pendingWithdrawals || 0)}
          helper={`${stats?.pendingDeposits || 0} deposits | ${stats?.pendingWithdrawals || 0} withdrawals`}
          tone="primary"
          icon="activity"
        />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Cash Movement" subtitle="Approved platform cash flow" className="span-6">
          {loading ? <p className="loading-text">Loading chart...</p> : <MiniBarChart title="USD" data={chart} />}
        </SectionCard>
        <SectionCard title="Action Queue" subtitle="Items requiring admin approval" className="span-6">
          <div className="compact-list">
            <article>
              <div>
                <strong>Pending Deposits</strong>
                <small>Awaiting admin validation</small>
              </div>
              <div>
                <strong>{stats?.pendingDeposits || 0}</strong>
              </div>
            </article>
            <article>
              <div>
                <strong>Pending Withdrawals</strong>
                <small>Awaiting decision</small>
              </div>
              <div>
                <strong>{stats?.pendingWithdrawals || 0}</strong>
              </div>
            </article>
          </div>
          <button className="primary-btn with-icon" onClick={() => onNavigate('/admin/approvals')}>
            <Icon name="checkCircle" size={14} />
            <span>Open Approvals</span>
          </button>
        </SectionCard>
        <SectionCard
          title="Operational Signals"
          subtitle="Realtime indicators for service and review throughput"
          className="span-6"
        >
          <div className="signal-list">
            <article>
              <div className="signal-label">
                <Icon name="activity" size={14} />
                <div>
                  <strong>Queue Latency</strong>
                  <small>1.3s avg processing</small>
                </div>
              </div>
              <StatusBadge status="active" />
            </article>
            <article>
              <div className="signal-label">
                <Icon name="shield" size={14} />
                <div>
                  <strong>Fraud Checks</strong>
                  <small>Automated monitoring enabled</small>
                </div>
              </div>
              <StatusBadge status="approved" />
            </article>
            <article>
              <div className="signal-label">
                <Icon name="users" size={14} />
                <div>
                  <strong>Support Coverage</strong>
                  <small>24/7 ops window active</small>
                </div>
              </div>
              <StatusBadge status="pending" />
            </article>
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  )
}

export const AdminUsersPage = ({ currentPath, onNavigate }) => {
  const { adminActions } = useAuth()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    status: 'active',
  })
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    reason: '',
  })

  const loadUsers = async (term = '') => {
    const rows = await adminActions.loadUsers(term)
    setUsers(rows)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const rows = await adminActions.loadUsers()
        if (active) setUsers(rows)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load users.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [adminActions])

  const searchUsers = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice('')
    setError('')
    try {
      await loadUsers(searchTerm)
    } catch (searchError) {
      setError(searchError.message || 'Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      status: user.status,
    })
    setEditModalOpen(true)
  }

  const saveUserChanges = async (event) => {
    event.preventDefault()
    if (!selectedUser) return
    setNotice('')
    setError('')
    try {
      await adminActions.editUser({
        userId: selectedUser.id,
        updates: editForm,
      })
      await loadUsers(searchTerm)
      setEditModalOpen(false)
      setNotice('User profile updated.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save user changes.')
    }
  }

  const toggleStatus = async (user) => {
    const next = user.status === 'active' ? 'suspended' : 'active'
    setNotice('')
    setError('')
    try {
      await adminActions.setUserStatus({
        userId: user.id,
        status: next,
      })
      await loadUsers(searchTerm)
      setNotice(`User ${next === 'active' ? 'activated' : 'suspended'}.`)
    } catch (toggleError) {
      setError(toggleError.message || 'Unable to update status.')
    }
  }

  const openBalanceModal = (user) => {
    setSelectedUser(user)
    setBalanceForm({
      amount: '',
      reason: '',
    })
    setBalanceModalOpen(true)
  }

  const submitBalanceAdjustment = async (event) => {
    event.preventDefault()
    if (!selectedUser) return
    setNotice('')
    setError('')
    try {
      const creditAmount = toAmount(balanceForm.amount)
      if (!creditAmount) {
        throw new Error('Enter a valid credit amount.')
      }

      await adminActions.adjustUserBalance({
        userId: selectedUser.id,
        delta: creditAmount,
        reason: balanceForm.reason || 'Manual credit',
      })
      await loadUsers(searchTerm)
      setBalanceModalOpen(false)
      setNotice('User wallet credited.')
    } catch (adjustError) {
      setError(adjustError.message || 'Unable to credit wallet.')
    }
  }

  return (
    <AdminShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="User Management"
      subtitle="Search, edit, suspend, and credit investor wallets."
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <SectionCard
        title="Investor Accounts"
        subtitle="Admin-level user controls"
        action={
          <form className="table-search" onSubmit={searchUsers}>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search users"
            />
            <button className="secondary-btn" type="submit">
              Search
            </button>
          </form>
        }
      >
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : (
          <DataTable
            columns={[
              {
                key: 'fullName',
                label: 'Name',
                render: (row) => (
                  <div>
                    <strong>{row.fullName}</strong>
                    <small>{row.email}</small>
                  </div>
                ),
              },
              { key: 'country', label: 'Country' },
              {
                key: 'walletBalance',
                label: 'Wallet',
                render: (row) => formatCurrency(row.walletBalance),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'createdAt',
                label: 'Joined',
                render: (row) => formatDateTime(row.createdAt),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="row-actions">
                    <button className="ghost-btn" onClick={() => openEditModal(row)}>
                      Edit
                    </button>
                    <button className="ghost-btn" onClick={() => openBalanceModal(row)}>
                      Credit
                    </button>
                    <button className="ghost-btn" onClick={() => toggleStatus(row)}>
                      {row.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                ),
              },
            ]}
            rows={users}
            emptyTitle="No investors found."
          />
        )}
      </SectionCard>

      <Modal
        title={`Edit User: ${selectedUser?.fullName || ''}`}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <form className="stacked-form" onSubmit={saveUserChanges}>
          <label>
            Full Name
            <input
              type="text"
              value={editForm.fullName}
              onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              value={editForm.phone}
              onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
              required
            />
          </label>
          <label>
            Country
            <input
              type="text"
              value={editForm.country}
              onChange={(event) => setEditForm((prev) => ({ ...prev, country: event.target.value }))}
              required
            />
          </label>
          <label>
            Status
            <select
              value={editForm.status}
              onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
          <button className="primary-btn" type="submit">
            Save Changes
          </button>
        </form>
      </Modal>

      <Modal
        title={`Credit Wallet: ${selectedUser?.fullName || ''}`}
        open={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
      >
        <form className="stacked-form" onSubmit={submitBalanceAdjustment}>
          <label>
            Credit Amount (USD)
            <input
              type="number"
              min={1}
              step="any"
              value={balanceForm.amount}
              onChange={(event) => setBalanceForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label>
            Reason
            <input
              type="text"
              value={balanceForm.reason}
              onChange={(event) => setBalanceForm((prev) => ({ ...prev, reason: event.target.value }))}
              required
            />
          </label>
          <button className="primary-btn" type="submit">
            Apply Credit
          </button>
        </form>
      </Modal>
    </AdminShell>
  )
}

export const AdminApprovalsPage = ({ currentPath, onNavigate }) => {
  const { adminActions } = useAuth()
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    const [depositRows, withdrawalRows] = await Promise.all([
      adminActions.loadPendingDeposits(),
      adminActions.loadPendingWithdrawals(),
    ])
    setDeposits(depositRows)
    setWithdrawals(withdrawalRows)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [depositRows, withdrawalRows] = await Promise.all([
          adminActions.loadPendingDeposits(),
          adminActions.loadPendingWithdrawals(),
        ])
        if (active) {
          setDeposits(depositRows)
          setWithdrawals(withdrawalRows)
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load approval queue.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [adminActions])

  const approveDeposit = async (depositId) => {
    setNotice('')
    setError('')
    try {
      await adminActions.approveDeposit(depositId)
      await loadData()
      setNotice('Deposit approved successfully.')
    } catch (approveError) {
      setError(approveError.message || 'Unable to approve deposit.')
    }
  }

  const decideWithdrawal = async (withdrawalId, approve) => {
    setNotice('')
    setError('')
    try {
      const reason = approve
        ? ''
        : window.prompt('Reason for rejection:', 'Compliance review failed') || 'Rejected'
      await adminActions.processWithdrawal({
        withdrawalId,
        approve,
        rejectionReason: reason,
      })
      await loadData()
      setNotice(approve ? 'Withdrawal approved.' : 'Withdrawal rejected.')
    } catch (decisionError) {
      setError(decisionError.message || 'Unable to process withdrawal decision.')
    }
  }

  return (
    <AdminShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Approvals Center"
      subtitle="Approve or reject pending deposit and withdrawal requests."
    >
      <FormNotice kind="success" message={notice} />
      <FormNotice kind="danger" message={error} />
      <SectionCard title="Pending Deposits" subtitle="Review incoming funding requests">
        {loading ? (
          <p className="loading-text">Loading pending deposits...</p>
        ) : (
          <DataTable
            columns={[
              {
                key: 'userName',
                label: 'Investor',
                render: (row) => (
                  <div>
                    <strong>{row.userName}</strong>
                    <small>{row.userEmail}</small>
                  </div>
                ),
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatCurrency(row.amount),
              },
              { key: 'method', label: 'Method' },
              { key: 'reference', label: 'Reference' },
              {
                key: 'createdAt',
                label: 'Requested',
                render: (row) => formatDateTime(row.createdAt),
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <button className="primary-btn compact" onClick={() => approveDeposit(row.id)}>
                    Approve
                  </button>
                ),
              },
            ]}
            rows={deposits}
            emptyTitle="No pending deposits."
          />
        )}
      </SectionCard>

      <SectionCard title="Pending Withdrawals" subtitle="Validate requests before release">
        {loading ? (
          <p className="loading-text">Loading pending withdrawals...</p>
        ) : (
          <DataTable
            columns={[
              {
                key: 'userName',
                label: 'Investor',
                render: (row) => (
                  <div>
                    <strong>{row.userName}</strong>
                    <small>{row.userEmail}</small>
                  </div>
                ),
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatCurrency(row.amount),
              },
              { key: 'walletAddress', label: 'Destination' },
              {
                key: 'createdAt',
                label: 'Requested',
                render: (row) => formatDateTime(row.createdAt),
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <div className="row-actions">
                    <button
                      className="primary-btn compact"
                      onClick={() => decideWithdrawal(row.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="ghost-btn compact"
                      onClick={() => decideWithdrawal(row.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                ),
              },
            ]}
            rows={withdrawals}
            emptyTitle="No pending withdrawals."
          />
        )}
      </SectionCard>
    </AdminShell>
  )
}

export const AdminTransactionsPage = ({ currentPath, onNavigate }) => {
  const { adminActions } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const rows = await adminActions.loadAllTransactions()
        if (active) setTransactions(rows)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load transactions.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [adminActions])

  return (
    <AdminShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Transaction Monitor"
      subtitle="System-wide financial ledger and processing outcomes."
    >
      <FormNotice kind="danger" message={error} />
      <SectionCard title="All Transactions" subtitle="Deposits, withdrawals, investments, and adjustments">
        {loading ? (
          <p className="loading-text">Loading transactions...</p>
        ) : (
          <DataTable
            columns={[
              {
                key: 'userName',
                label: 'Investor',
                render: (row) => (
                  <div>
                    <strong>{row.userName}</strong>
                    <small>{row.userEmail}</small>
                  </div>
                ),
              },
              { key: 'type', label: 'Type' },
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatCurrency(row.amount),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'description', label: 'Description' },
              {
                key: 'createdAt',
                label: 'Date',
                render: (row) => formatDateTime(row.createdAt),
              },
            ]}
            rows={transactions}
            emptyTitle="No transactions recorded."
          />
        )}
      </SectionCard>
    </AdminShell>
  )
}

