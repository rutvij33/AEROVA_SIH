/**
 * AEROVA visual direction: monochrome Swiss editorialism meets aviation instrumentation.
 * This page uses high-contrast Space Grotesk display type, Inter body copy, smoky glass
 * surfaces, route-line texture, and restrained motion to make the product feel measured,
 * incisive, and future-facing.
 */
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleDot,
  Database,
  Globe2,
  Menu,
  Minus,
  Plus,
  Radar,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const HERO_IMAGE = "/manus-storage/aerova-commercial-landing_06f20ab5.jpg";
const MARK_IMAGE = "/manus-storage/aerova-mark_07466fde.png";
const CONTEXT_IMAGES = [
  "/manus-storage/aerova-context-airport_f8b99570.jpg",
  "/manus-storage/aerova-context-airline_abc1d248.jpg",
  "/manus-storage/aerova-context-route_df5f9a99.jpg",
];

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about", action: "about" },
  { label: "Analytics", href: "#analytics" },
  { label: "Airfare Index", href: "/dashboard" },
  { label: "Methodology", href: "/methodology" },
  { label: "API", href: "/api" },
  { label: "Contact", href: "#contact" },
];

const pipeline = [
  { label: "Collect", copy: "Continuously capture fares across the network.", icon: Database },
  { label: "Validate", copy: "Normalize observations and flag anomalies.", icon: ShieldCheck },
  { label: "Analyze", copy: "Read route-level movement in real time.", icon: Radar },
  { label: "Index", copy: "Translate signals into a usable price indicator.", icon: BarChart3 },
];

const processSteps = [
  {
    number: "01",
    title: "Collect",
    copy: "Automatically gather airfare information from airline and online travel aggregator portals.",
  },
  {
    number: "02",
    title: "Clean",
    copy: "Validate, normalize, and structure collected airfare data.",
  },
  {
    number: "03",
    title: "Analyze",
    copy: "Calculate route-level and market-level airfare movements.",
  },
  {
    number: "04",
    title: "Index",
    copy: "Generate real-time airfare indicators that can support CPI augmentation and policy analysis.",
  },
];

const metrics = [
  { value: "08", label: "Representative routes", note: "Domestic basket" },
  { value: "03:00", label: "Daily capture", note: "UTC Heartbeat" },
  { value: "100", label: "Index base", note: "First persisted snapshot" },
  { value: "IQR", label: "Quality screen", note: "Deterministic rule" },
];

const faqItems = [
  {
    question: "What is a real-time airfare price index?",
    answer:
      "It tracks movements in airfare prices over time using continuously collected fare observations, giving teams a more current view of how the aviation market is moving.",
  },
  {
    question: "Where does AEROVA collect airfare data from?",
    answer:
      "The platform is designed to collect airfare information from airline and online travel aggregator portals through automated data collection.",
  },
  {
    question: "How does AEROVA handle different routes and fare classes?",
    answer:
      "Observations are normalized and categorized by route, travel date, airline, and fare characteristics so that like-for-like movement can be analyzed across the network.",
  },
  {
    question: "How does the platform handle incorrect or abnormal fares?",
    answer:
      "Validation, anomaly detection, normalization, and data-quality checks help identify and isolate incorrect or abnormal observations before they influence an index.",
  },
  {
    question: "How can the airfare index support CPI augmentation?",
    answer:
      "Timely airfare indicators can provide an additional data source for monitoring aviation-related price movements and complement existing statistical measurement processes.",
  },
];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] as const },
});

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

function GlassCard({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

function ArrowButton({ href, children, inverse = false }: { href: string; children: React.ReactNode; inverse?: boolean }) {
  return (
    <a href={href} className={`arrow-button ${inverse ? "arrow-button-inverse" : ""}`}>
      <span>{children}</span>
      <ArrowUpRight size={16} strokeWidth={1.7} />
    </a>
  );
}

function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="aerova-site" id="home">
      <div className="ambient-backdrop" aria-hidden="true">
        <div className="background-video passenger-background" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="hero-visual" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="hero-vignette" />
        <div className="route-grid" />
      </div>

      <header className="site-header">
        <a className="brand-lockup" href="#home" aria-label="AEROVA home">
          <span className="brand-mark"><img src={MARK_IMAGE} alt="" /></span>
          <span className="brand-name">AEROVA</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => item.action === "about" ? (
            <button key={item.label} className="nav-link nav-button" onClick={() => setAboutOpen(true)}>
              {item.label}
            </button>
          ) : (
            <a key={item.label} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
            <a
            className="icon-button dashboard-button"
            aria-label="Open live airfare dashboard"
            href="/dashboard"
          >
            <BarChart3 size={18} strokeWidth={1.6} />
          </a>
          <button
            className="icon-button mobile-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              className="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => item.action === "about" ? (
                <button key={item.label} onClick={() => { setAboutOpen(true); setMenuOpen(false); }}>
                  {item.label}
                  <ArrowUpRight size={14} />
                </button>
              ) : (
                <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="hero-section section-shell">
          <motion.div className="hero-kicker" {...reveal(0.05)}>
            <span className="kicker-rule" />
            <div>
              <p>India Airfare Intelligence</p>
              <p className="muted">Real-time monitoring</p>
            </div>
          </motion.div>

          <div className="hero-side-note">
            <p>Tracking airfare trends across India&apos;s aviation network</p>
            <span className="side-note-index">01 / 09</span>
          </div>

          <motion.div className="hero-cta-wrap" {...reveal(0.16)}>
            <a href="/dashboard" className="hero-cta">
              <span>Explore Index</span>
              <ArrowUpRight size={18} strokeWidth={1.6} />
            </a>
          </motion.div>

          <motion.div
            className="hero-title-wrap"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.24, ease: [0.23, 1, 0.32, 1] as const }}
          >
            <p className="hero-pretitle">A / 01 — Price signals in motion</p>
            <h1 className="hero-title">
              Real-Time
              <br />
              <span>Airfare</span> Intelligence
            </h1>
          </motion.div>

          <motion.div className="hero-footer-line" {...reveal(0.3)}>
            <span>Built for India&apos;s aviation ecosystem</span>
            <span className="scroll-cue"><ArrowDownRight size={15} /> Scroll to explore</span>
          </motion.div>
        </section>

        <section className="intro-grid section-shell" id="about">
          <motion.div className="intro-statement" {...reveal(0.05)}>
            <SectionLabel>01 — The signal</SectionLabel>
            <h2>See the movement <em>before</em> it becomes the headline.</h2>
          </motion.div>
          <motion.div className="intro-copy" {...reveal(0.15)}>
            <div className="copy-rule" />
            <p>
              AEROVA transforms fragmented fare observations into a living view of India&apos;s aviation market — built for teams that need a faster, cleaner read on price movement.
            </p>
            <div className="intro-meta">
              <span>Platform metrics</span>
              <span>Aug 2026 / v1.0</span>
            </div>
          </motion.div>
        </section>

        <section className="sih-signal-strip section-shell" aria-label="SIH26056 solution overview">
          <div className="sih-signal-intro"><SectionLabel>SIH26056 / solution map</SectionLabel><h2>One signal.<br /><span>Six accountable steps.</span></h2><a className="text-button" href="/methodology">Read the methodology <ArrowUpRight size={15} /></a></div>
          <div className="sih-signal-grid"><div><span>01</span><b>Observe</b><p>Permissioned fare observations from connected API sources.</p></div><div><span>02</span><b>Normalize</b><p>Comparable routes, carriers, dates, and currencies.</p></div><div><span>03</span><b>Index</b><p>Transparent Base-100 movement with route context.</p></div><div><span>04</span><b>Validate</b><p>Quality flags and backtesting when reference data exists.</p></div></div>
        </section>

        <section className="hero-cards section-shell" aria-label="Platform highlights">
          <motion.div className="routes-card" {...reveal(0.05)}>
            <GlassCard className="routes-card-inner">
              <div className="card-topline">
                <SectionLabel>Network coverage</SectionLabel>
                <CircleDot size={16} className="soft-icon" />
              </div>
              <div className="avatar-stack" aria-label="Airport, airline, and travel data imagery">
                {CONTEXT_IMAGES.map((src, index) => (
                  <img key={src} src={src} alt={index === 0 ? "Indian airport terminal" : index === 1 ? "Airline operations" : "Aviation route data"} />
                ))}
              </div>
              <div className="routes-value">08</div>
              <p className="routes-copy">Representative domestic corridors in the current India basket</p>
              <div className="status-badge"><Check size={13} /> Automated Data Collection</div>
              <div className="card-coordinate">LAT 20.5937° N / LON 78.9629° E</div>
            </GlassCard>
          </motion.div>

          <motion.div className="precision-card" {...reveal(0.15)}>
            <GlassCard className="precision-card-inner">
              <div className="precision-mark"><Sparkles size={16} strokeWidth={1.4} /></div>
              <SectionLabel>Data quality / 02</SectionLabel>
              <h3>Precision airfare monitoring</h3>
              <div className="precision-bottom">
                <p><span>(IQR)</span> Deterministic quality screen</p>
                <ArrowButton href="#analytics">See how it works</ArrowButton>
              </div>
            </GlassCard>
          </motion.div>
        </section>

        <section className="pipeline-section section-shell" id="index">
          <div className="section-heading-row">
            <motion.div {...reveal(0.02)}>
              <SectionLabel>02 — The pipeline</SectionLabel>
              <h2 className="section-display">Collect / Clean / <span>Calculate</span></h2>
            </motion.div>
            <motion.p className="section-heading-aside" {...reveal(0.12)}>
              An automated data pipeline that turns live fare observations into a consistent airfare price index.
            </motion.p>
          </div>

          <div className="pipeline-grid">
            <motion.div className="monitor-card" {...reveal(0.08)}>
              <GlassCard className="monitor-card-inner">
                <div className="monitor-orbit" aria-hidden="true"><span /><span /><span /></div>
                <div className="monitor-header"><SectionLabel>Live status</SectionLabel><span className="live-dot">Live</span></div>
                <div className="monitor-value">03<span>:00</span></div>
                <p>Daily snapshot collection / UTC</p>
                <div className="signal-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
                <a className="text-button" href="/dashboard">Open live instrument <ArrowUpRight size={15} /></a>
              </GlassCard>
            </motion.div>

            <motion.div className="checklist-card" {...reveal(0.16)}>
              <div className="checklist-top">
                <SectionLabel>Signal processing</SectionLabel>
                <span className="mono-code">SYS / 04</span>
              </div>
              <div className="pipeline-list">
                {pipeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div className={`pipeline-item ${index < 3 ? "is-done" : ""}`} key={item.label}>
                      <span className="pipeline-icon"><Icon size={14} strokeWidth={1.6} /></span>
                      <span className="pipeline-label">{item.label}</span>
                      <span className="pipeline-copy">{item.copy}</span>
                      {index < 3 ? <Check size={14} className="pipeline-check" /> : <span className="pipeline-pending">—</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <motion.div className="pipeline-cta-row" {...reveal(0.22)}>
            <p>Monitor India&apos;s airfare movement and generate actionable price intelligence</p>
            <a href="#contact" className="round-arrow"><ArrowUpRight size={19} /></a>
          </motion.div>

          <motion.div className="index-seal" {...reveal(0.18)} aria-label="India Airfare Index">
            <span className="seal-ring seal-ring-outer" />
            <span className="seal-ring seal-ring-inner" />
            <span className="seal-crosshair">+</span>
            <span className="seal-text">India Airfare Index</span>
          </motion.div>
        </section>

        <section className="services-section section-shell" id="analytics">
          <motion.div className="services-heading" {...reveal(0.02)}>
            <SectionLabel>03 — The platform</SectionLabel>
            <h2 className="section-display">Airfare <span>Intelligence</span></h2>
          </motion.div>
          <div className="services-grid">
            <motion.div className="services-intro" {...reveal(0.08)}>
              <p className="large-copy">AEROVA is a real-time airfare intelligence platform built to transform fragmented flight fare data into reliable price indicators.</p>
              <ArrowButton href="#process">Learn more</ArrowButton>
              <div className="services-coordinate">IND / AVIATION / INTELLIGENCE</div>
            </motion.div>

            <div className="service-stack">
              <motion.div {...reveal(0.12)}>
                <GlassCard className="service-card">
                  <div className="service-icon"><Check size={16} /></div>
                  <SectionLabel>Capability / 01</SectionLabel>
                  <h3>Automated Fare Collection</h3>
                  <p>Continuously collect airfare information from airline and online travel aggregator portals.</p>
                </GlassCard>
              </motion.div>
              <motion.div {...reveal(0.2)}>
                <GlassCard className="service-card service-card-pipeline">
                  <div className="service-icon"><Database size={16} /></div>
                  <SectionLabel>Capability / 02</SectionLabel>
                  <h3>Fare Data Pipeline</h3>
                  <p>Technical identifiers keep every observation traceable from input to index.</p>
                  <div className="data-chips"><span>DOM</span><span>API</span><span>S-05</span><span>S-10</span><span>S-14</span></div>
                </GlassCard>
              </motion.div>
            </div>

            <motion.div className="trusted-service" {...reveal(0.16)}>
              <div className="trusted-rule" />
              <Globe2 size={19} strokeWidth={1.35} />
              <SectionLabel>Built for scrutiny</SectionLabel>
              <h3>Trusted analytics</h3>
              <p>Built to provide transparent, timely, and scalable airfare intelligence for monitoring price movements across India&apos;s aviation ecosystem.</p>
              <div className="trusted-mark">AEROVA / 2026</div>
            </motion.div>
          </div>
        </section>

        <section className="process-section section-shell" id="process">
          <div className="process-heading">
            <motion.div {...reveal(0.02)}>
              <SectionLabel>04 — Methodology</SectionLabel>
              <h2 className="section-display">The Process</h2>
            </motion.div>
            <motion.h3 {...reveal(0.12)}>From fare collection <span>to price index</span></motion.h3>
          </div>
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <motion.div key={step.number} className="process-item" {...reveal(index * 0.06)}>
                <GlassCard className="process-card">
                  <div className="process-topline"><span className="process-number">{step.number}</span><ArrowUpRight size={15} /></div>
                  <div className="process-line" />
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="stats-section section-shell">
          <motion.div className="stats-heading" {...reveal(0.02)}>
            <SectionLabel>05 — Platform metrics</SectionLabel>
            <p>Operational signals from the AEROVA platform — not official government statistics.</p>
          </motion.div>
          <div className="stats-grid">
            {metrics.map((metric, index) => (
              <motion.div key={metric.value} className="metric-item" initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] as const }}>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-note">{metric.note}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="faq-section section-shell" id="faq">
          <motion.div className="faq-intro" {...reveal(0.02)}>
            <SectionLabel>06 — FAQ</SectionLabel>
            <h2>Common<br /><span>questions</span></h2>
            <p>Clear answers for teams evaluating a real-time airfare signal.</p>
          </motion.div>
          <div className="faq-list">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div key={item.question} className={`faq-item ${isOpen ? "is-open" : ""}`} {...reveal(index * 0.04)}>
                  <button className="faq-question" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)}>
                    <span><span className="faq-index">0{index + 1}</span>{item.question}</span>
                    {isOpen ? <Minus size={17} /> : <Plus size={17} />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] as const }}>
                        <p className="faq-answer">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="cta-section section-shell" id="contact">
          <motion.div className="cta-orbit" aria-hidden="true" {...reveal(0.04)}><span /><span /><span /></motion.div>
          <motion.div className="cta-content" {...reveal(0.12)}>
            <SectionLabel>Ready to explore?</SectionLabel>
            <h2>Let&apos;s track what&apos;s <span>changing.</span></h2>
            <a href="/dashboard" className="primary-button">Explore AEROVA <ArrowUpRight size={17} /></a>
          </motion.div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand-lockup" href="#home">
              <span className="brand-mark"><img src={MARK_IMAGE} alt="" /></span>
              <span className="brand-name">AEROVA</span>
            </a>
            <p>Real-time airfare intelligence for India.</p>
            <div className="footer-caption">An instrument for sharper signals.</div>
          </div>
          <div className="footer-links">
            <div><SectionLabel>Product</SectionLabel><a href="/dashboard">Airfare Index</a><a href="#analytics">Route Analytics</a><a href="#analytics">Fare Monitoring</a><a href="#analytics">Data Quality</a></div>
            <div><SectionLabel>Company</SectionLabel><a href="#about">About</a><a href="#analytics">Technology</a><a href="#process">Research</a><a href="#contact">Contact</a></div>
            <div><SectionLabel>Support</SectionLabel><a href="/api">Documentation</a><a href="#faq">FAQ</a><a href="/methodology">Methodology</a><a href="/dashboard">Data Sources</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 AEROVA</span>
          <span className="footer-status"><span className="status-dot" /> SIH26056 / observed-fare research prototype</span>
          <div className="social-links"><a href="/api">API contract <ArrowUpRight size={13} /></a><a href="/methodology">Methodology <ArrowUpRight size={13} /></a></div>
        </div>
      </footer>

      <AnimatePresence>
        {aboutOpen && (
          <motion.div className="about-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="about-backdrop" aria-label="Close About Us panel" onClick={() => setAboutOpen(false)} />
            <motion.section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] as const }}>
              <div className="about-dialog-head">
                <SectionLabel>About AEROVA</SectionLabel>
                <button className="icon-button about-close" aria-label="Close About Us panel" onClick={() => setAboutOpen(false)}><X size={17} /></button>
              </div>
              <h2 id="about-title" className="about-dialog-title">About <span>Us</span></h2>
              <p className="about-dialog-copy">The team building a clearer signal for India&apos;s aviation ecosystem.</p>
              <div className="team-list">
                <p>Rutvij Harishchandre</p>
                <p>Jaydev Singh</p>
                <p>Sagar Sagat</p>
                <p>Jeevan Shendge</p>
                <p>Vignesh Kalbhor</p>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
