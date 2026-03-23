import { formatCurrency, formatNumber } from '../utils/format'
import { Icon } from '../components/icons'

const stats = [
  { label: 'Assets Managed', value: '$128M+', icon: 'money' },
  { label: 'Active Investors', value: '18,500+', icon: 'users' },
  { label: 'Avg. Monthly Yield', value: '8.4%', icon: 'trendUp' },
  { label: 'Trust Score', value: '99.2%', icon: 'shield' },
]

const features = [
  {
    icon: 'lock',
    title: 'Create Your Secure Account',
    text: 'Register in minutes with strong identity protection and optional KYC verification.',
  },
  {
    icon: 'plan',
    title: 'Choose the Right Investment Plan',
    text: 'Compare risk-adjusted plans designed for conservative, growth, and premium portfolios.',
  },
  {
    icon: 'dashboard',
    title: 'Track and Grow in Real Time',
    text: 'Monitor wallet balance, admin credits, and profits from a professional dashboard built for clarity.',
  },
]

const liveSignals = [
  'KYC queue average: 4m',
  'Funding rails online',
  'Support response SLA: < 10m',
]

const testimonials = [
  {
    quote:
      'CapitalNest gave me institutional-level visibility. I finally understand exactly where my money is performing.',
    author: 'Melissa Turner',
    role: 'Finance Director, New York',
  },
  {
    quote:
      'The approval and transaction timeline is extremely transparent. It feels like a real fintech platform.',
    author: 'Jason Reed',
    role: 'Startup Founder, Texas',
  },
  {
    quote:
      'The plan structure is simple, returns are clear, and the dashboard makes portfolio management effortless.',
    author: 'Aisha Bello',
    role: 'Portfolio Analyst, Lagos',
  },
]

const faqs = [
  {
    q: 'Is CapitalNest secure?',
    a: 'Yes. CapitalNest applies protected authentication, role-based access controls, and server-side validation for balance-sensitive actions.',
  },
  {
    q: 'How is wallet funding handled?',
    a: 'Users send payment to admin, and the admin credits the wallet after confirmation.',
  },
  {
    q: 'Which currency is supported?',
    a: 'All balances and transactions use USD ($) with standard financial formatting for consistency.',
  },
  {
    q: 'Do you support beginners?',
    a: 'Yes. The Starter Plan is designed for low-risk onboarding with a clear minimum entry amount.',
  },
]

export const LandingPage = ({ onNavigate }) => (
  <div className="landing-page">
    <header className="landing-nav">
      <div className="brand">
        <span className="brand-mark">CN</span>
        <span>CapitalNest</span>
      </div>
      <div className="landing-nav-actions">
        <button className="ghost-btn with-icon" onClick={() => onNavigate('/login')}>
          <Icon name="profile" size={14} />
          <span>Login</span>
        </button>
        <button className="primary-btn with-icon" onClick={() => onNavigate('/register')}>
          <Icon name="arrowRight" size={14} />
          <span>Get Started</span>
        </button>
      </div>
    </header>

    <section className="live-status-strip">
      <div className="live-status-badge">
        <span className="pulse-dot" />
        <Icon name="activity" size={14} />
        <strong>Platform Live</strong>
      </div>
      <div className="live-status-items">
        {liveSignals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </div>
    </section>

    <section className="hero-section">
      <div className="hero-content">
        <span className="kicker">Modern Investment Infrastructure</span>
        <h1>Grow Your Wealth with Confidence</h1>
        <p>
          CapitalNest helps you build wealth through structured investment plans, transparent
          reporting, and enterprise-grade account controls.
        </p>
        <div className="hero-actions">
          <button className="primary-btn with-icon" onClick={() => onNavigate('/register')}>
            <Icon name="arrowRight" size={15} />
            <span>Get Started</span>
          </button>
          <button className="secondary-btn with-icon" onClick={() => onNavigate('/login')}>
            <Icon name="profile" size={15} />
            <span>Login</span>
          </button>
        </div>
      </div>
      <div className="hero-panel">
        <h3>Portfolio Snapshot</h3>
        <div className="hero-metrics">
          <div>
            <span>
              <Icon name="money" size={13} /> Wallet Balance
            </span>
            <strong>{formatCurrency(35840.75)}</strong>
          </div>
          <div>
            <span>
              <Icon name="trendUp" size={13} /> Total Profit
            </span>
            <strong>{formatCurrency(6420.2)}</strong>
          </div>
          <div>
            <span>
              <Icon name="dashboard" size={13} /> Active Investments
            </span>
            <strong>{formatNumber(4)}</strong>
          </div>
        </div>
      </div>
    </section>

    <section className="stats-grid">
      {stats.map((item) => (
        <article key={item.label}>
          <div className="stats-card-top">
            <span className="stats-icon">
              <Icon name={item.icon} size={15} />
            </span>
          </div>
          <h3>{item.value}</h3>
          <p>{item.label}</p>
        </article>
      ))}
    </section>

    <section className="feature-section">
      <div className="section-title">
        <h2>How It Works</h2>
        <p>Three straightforward steps to start investing with discipline and transparency.</p>
      </div>
      <div className="feature-grid">
        {features.map((item) => (
          <article key={item.title}>
            <span>
              <Icon name={item.icon} size={14} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="testimonial-section">
      <div className="section-title">
        <h2>What Investors Say</h2>
        <p>Trusted by professionals who expect a reliable and compliant investment workflow.</p>
      </div>
      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <article key={item.author}>
            <p>"{item.quote}"</p>
            <h4>{item.author}</h4>
            <span>{item.role}</span>
          </article>
        ))}
      </div>
    </section>

    <section className="faq-section">
      <div className="section-title">
        <h2>Frequently Asked Questions</h2>
      </div>
      <div className="faq-list">
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>

    <footer className="landing-footer">
      <div>
        <h4>CapitalNest</h4>
        <p>Professional investment management for modern wealth growth.</p>
      </div>
      <div className="footer-links">
        <a href="#/">Home</a>
        <a href="#/login">Login</a>
        <a href="#/register">Register</a>
        <a href="#/forgot-password">Reset Password</a>
      </div>
    </footer>
  </div>
)
