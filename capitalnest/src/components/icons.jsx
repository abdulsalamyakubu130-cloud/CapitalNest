const iconMap = {
  activity: (
    <>
      <polyline points="3 12 7.5 12 10.5 7 13.5 17 16.5 12 21 12" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="8" y1="2.5" x2="8" y2="6" />
      <line x1="16" y1="2.5" x2="16" y2="6" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8.5 12.5 11 15 15.5 9.8" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </>
  ),
  deposit: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  logout: (
    <>
      <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
      <line x1="14" y1="12" x2="21" y2="12" />
      <polyline points="18 9 21 12 18 15" />
    </>
  ),
  money: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="6" y1="12" x2="6.01" y2="12" />
      <line x1="18" y1="12" x2="18.01" y2="12" />
    </>
  ),
  plan: (
    <>
      <path d="M4 19h16" />
      <rect x="5" y="9" width="3" height="7" rx="1" />
      <rect x="10.5" y="6" width="3" height="10" rx="1" />
      <rect x="16" y="3.5" width="3" height="12.5" rx="1" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />
      <polyline points="9.5 12 11.5 14 15 10" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3z" />
      <path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z" />
      <path d="M19 13l.8 1.7L21.5 15l-1.7.8L19 17.5l-.8-1.7L16.5 15l1.7-.8L19 13z" />
    </>
  ),
  transactions: (
    <>
      <polyline points="17 1 21 5 17 9" />
      <line x1="21" y1="5" x2="9" y2="5" />
      <polyline points="7 23 3 19 7 15" />
      <line x1="3" y1="19" x2="15" y2="19" />
    </>
  ),
  trendUp: (
    <>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.88" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  withdraw: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <polyline points="9.5 13.5 12 16 14.5 13.5" />
    </>
  ),
}

export const Icon = ({ name = 'sparkles', size = 16, className = '', title = '' }) => {
  const glyph = iconMap[name] || iconMap.sparkles

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  )
}
