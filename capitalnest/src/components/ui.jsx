import { formatCurrency, formatDateTime, formatPercent } from '../utils/format'
import { Icon } from './icons'

export const LoadingScreen = ({
  message = 'Preparing your secure workspace...',
}) => (
  <div className="loading-screen">
    <div className="loading-card">
      <div className="spinner" />
      <h2>CapitalNest</h2>
      <p>{message}</p>
    </div>
  </div>
)

export const FormNotice = ({ kind = 'info', message = '' }) => {
  if (!message) return null
  return <div className={`form-notice ${kind}`}>{message}</div>
}

export const StatusBadge = ({ status = 'pending' }) => {
  const normalized = String(status).toLowerCase()
  return <span className={`status-badge ${normalized}`}>{normalized}</span>
}

export const StatCard = ({ label, value, helper = '', tone = 'default', icon = '$' }) => (
  <article className={`stat-card ${tone}`}>
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <span className="stat-icon">
        {typeof icon === 'string' && icon.length > 1 ? (
          <Icon name={icon} size={14} />
        ) : (
          icon
        )}
      </span>
    </div>
    <div className="stat-value">{value}</div>
    {helper ? <div className="stat-helper">{helper}</div> : null}
  </article>
)

export const SectionCard = ({ title, subtitle = '', action = null, children, className = '' }) => (
  <section className={`section-card ${className}`.trim()}>
    {(title || action) && (
      <header className="section-header">
        <div>
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
)

export const EmptyState = ({ title, description }) => (
  <div className="empty-state">
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
)

export const DataTable = ({ columns, rows, emptyTitle = 'No records yet.' }) => {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description="When data arrives, it will show here." />
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.key}>
              {columns.map((column) => (
                <td key={`${row.id || row.key}_${column.key}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const TransactionTable = ({ transactions }) => (
  <DataTable
    columns={[
      { key: 'type', label: 'Type' },
      {
        key: 'amount',
        label: 'Amount',
        render: (row) => formatCurrency(row.amount),
      },
      { key: 'description', label: 'Description' },
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
    rows={transactions}
    emptyTitle="No transactions yet."
  />
)

export const InvestmentPlanCard = ({
  plan,
  amount,
  onAmountChange,
  onInvest,
  loading = false,
}) => (
  <article className="plan-card">
    <header>
      <h4>{plan.name}</h4>
      <span className="plan-roi">{formatPercent(plan.roi)} ROI</span>
    </header>
    <p>{plan.description}</p>
    <div className="plan-meta">
      <span>Min: {formatCurrency(plan.minDeposit)}</span>
      <span>Max: {formatCurrency(plan.maxDeposit)}</span>
      <span>Duration: {plan.durationDays} days</span>
    </div>
    <div className="plan-action">
      <input
        type="number"
        min={plan.minDeposit}
        max={plan.maxDeposit}
        value={amount}
        onChange={(event) => onAmountChange(plan.id, event.target.value)}
        placeholder="Amount in USD"
      />
      <button className="primary-btn with-icon" onClick={() => onInvest(plan.id)} disabled={loading}>
        <Icon name="trendUp" size={14} />
        <span>{loading ? 'Processing...' : 'Invest'}</span>
      </button>
    </div>
  </article>
)

export const MiniBarChart = ({ title, data }) => {
  const max = Math.max(...data.map((entry) => entry.value), 1)

  return (
    <div className="mini-chart">
      <div className="mini-chart-title">{title}</div>
      <div className="mini-chart-list">
        {data.map((entry) => (
          <div className="mini-chart-row" key={entry.label}>
            <span>{entry.label}</span>
            <div className="mini-chart-track">
              <div
                className="mini-chart-fill"
                style={{ width: `${(entry.value / max) * 100}%` }}
              />
            </div>
            <strong>{formatCurrency(entry.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Modal = ({ title, open, onClose, children, width = '480px' }) => {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h4>{title}</h4>
          <button className="ghost-btn" onClick={onClose}>
            Close
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
