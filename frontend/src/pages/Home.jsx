import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleDot,
  Database,
  Globe2,
  Menu,
  Minus,
  Plus,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Activity,
  Layers,
  Compass
} from "lucide-react";
import { Link } from "wouter";

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
    copy: "Validate, normalize, and structure collected airfare data, stripping predatory surges.",
  },
  {
    number: "03",
    title: "Analyze",
    copy: "Calculate route-level and market-level airfare movements with DGCA passenger weights.",
  },
  {
    number: "04",
    title: "Index",
    copy: "Generate real-time airfare indicators that can support CPI augmentation and policy analysis.",
  },
];

const metrics = [
  { value: "10", label: "Representative routes", note: "Top Indian domestic corridors" },
  { value: "03:00", label: "Daily capture", note: "UTC Heartbeat" },
  { value: "100", label: "Index base", note: "Base Year 2024 = 100" },
  { value: "IQR", label: "Quality screen", note: "Deterministic outlier filtering" },
];

const faqItems = [
  {
    question: "What is a real-time airfare price index?",
    answer:
      "It tracks movements in airfare prices over time using continuously collected high-frequency fare observations, giving MoSPI and policymakers a current view of how the aviation market is moving rather than waiting 45 days for survey-based CPI.",
  },
  {
    question: "Where does AEROVA collect airfare data from?",
    answer:
      "The platform collects airfare information from airline portals (IndiGo, Air India, SpiceJet, Akasa) and online travel aggregator portals (MakeMyTrip, Cleartrip) through automated high-frequency data pipelines.",
  },
  {
    question: "How does AEROVA handle different routes and fare classes?",
    answer:
      "Observations are normalized and categorized by route, travel date, advance purchase window (1d, 7d, 15d, 30d, 45d), airline, and fare characteristics (Base Fare vs Taxes) so that like-for-like movement is accurately aggregated using Jevons Geometric Mean.",
  },
  {
    question: "How does the platform handle incorrect or abnormal fares?",
    answer:
      "Validation, anomaly detection using Interquartile Range (IQR) and Modified Z-Score, and automated normalization help isolate incorrect or predatory surge observations before they enter the upper-level Laspeyres index.",
  },
  {
    question: "How can the airfare index support CPI augmentation for MoSPI?",
    answer:
      "Timely airfare indicators directly map into MoSPI's COICOP classification (Group: Transport, Sub-group: Passenger Transport by Air), providing a real-time nowcast to bridge the 45-day reporting lag of official CPI.",
  },
];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] },
});

function SectionLabel({ children, className = "" }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

function GlassCard({ children, className = "", ...props }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

function ArrowButton({ href, children, inverse = false }) {
  return (
    <a href={href} className={`arrow-button ${inverse ? "arrow-button-inverse" : ""}`}>
      <span>{children}</span>
      <ArrowUpRight size={16} strokeWidth={1.7} />
    </a>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="aerova-site" id="home">
      {/* Ambient background styling */}
      <div className="ambient-backdrop" aria-hidden="true">
        <div className="hero-visual" />
        <div className="hero-vignette" />
        <div className="route-grid" />
      </div>

      {/* Header */}
      <header className="site-header">
        <a className="brand-lockup" href="#home" aria-label="AEROVA home">
          <span className="brand-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-name">AEROVA</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) =>
            item.action === "about" ? (
              <button key={item.label} className="nav-link nav-button" onClick={() => setAboutOpen(true)}>
                {item.label}
              </button>
            ) : item.href.startsWith("/") ? (
              <Link key={item.label} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="header-actions">
          <Link
            className="icon-button dashboard-button"
            aria-label="Open live airfare dashboard"
            href="/dashboard"
          >
            <BarChart3 size={18} strokeWidth={1.6} />
          </Link>
          <button
            className="icon-button mobile-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
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
              {navItems.map((item) =>
                item.action === "about" ? (
                  <button
                    key={item.label}
                    onClick={() => {
                      setAboutOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                    <ArrowUpRight size={14} />
                  </button>
                ) : item.href.startsWith("/") ? (
                  <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                    <ArrowUpRight size={14} />
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                    <ArrowUpRight size={14} />
                  </a>
                )
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ─── FlightAware-style dark hero ─── */}
        <section className="fa-hero">
          {/* Background image with dark overlay */}
          <div className="fa-hero-bg" aria-hidden="true">
            <div className="fa-hero-overlay" />
          </div>

          {/* Nav inside hero */}
          <div className="fa-hero-inner">
            <motion.div
              className="fa-hero-content"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="fa-hero-kicker">India&apos;s Real-Time Airfare Intelligence</p>
              <h1 className="fa-hero-title">
                AEROVA is Central
                <br />
                <span>to Aviation Data.</span>
              </h1>

              {/* Search bar row */}
              <div className="fa-search-row">
                <div className="fa-search-bar">
                  <Search size={18} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search route, airline or corridor (e.g. DEL-BOM)"
                    className="fa-search-input"
                    aria-label="Search routes"
                  />
                </div>
                <Link href="/dashboard" className="fa-explore-btn">
                  Explore Index <ArrowUpRight size={16} strokeWidth={2} />
                </Link>
              </div>

              <p className="fa-hero-sub">MoSPI CPI Augmentation &middot; SIH26056 &middot; COICOP 07.3.3</p>
            </motion.div>
          </div>

          {/* Scroll cue */}
          <div className="fa-scroll-cue">
            <ArrowDownRight size={14} />
            <span>Scroll to explore</span>
          </div>
        </section>

      <main>
        {/* Hero Section — FlightAware style above */}

        {/* FlightAware-style info cards */}
        <section className="fa-cards-section">
          <div className="fa-info-card">
            <h2>Innovative real-time airfare intelligence.</h2>
            <p>
              Elevate India's CPI methodology with AEROVA's AI-assisted daily fare index —
              augmenting MoSPI's official CPI with 42-day nowcasting advantage.
            </p>
            <Link href="/methodology" className="fa-info-card-link">
              Learn more about the methodology <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="fa-info-card">
            <h2>Delivering live data to policymakers on demand.</h2>
            <p>
              Integrate AEROVA's eSankhyiki-compatible SDMX/JSON feed directly into
              MoSPI's macroeconomic portal for real-time CPI augmentation.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: "auto" }}>
              <Link href="/esankhyiki" className="fa-info-card-link">
                Explore eSankhyiki Hub <ArrowUpRight size={14} />
              </Link>
              <Link href="/api" className="fa-info-card-link" style={{ opacity: 0.85 }}>
                API Specs <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div className="fa-map-card">
            <div className="fa-map-card-overlay" aria-hidden="true" />
            <div className="fa-map-card-content">
              <h2>Unlock real-time Indian domestic flight tracking and ADS-B data.</h2>
              <p>
                Watch 15+ live domestic flights across India's top corridors — powered by
                OpenSky Network ADS-B transponder data and AEROVA's live feed.
              </p>
              <Link href="/dashboard" className="fa-track-btn">
                Track Now <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="fa-info-card">
            <h2>Secure, high-frequency price monitoring.</h2>
            <p>
              Keep track of every fare observation across 10 major Indian domestic corridors —
              with deterministic IQR quality screening and DGCA passenger volume weights.
            </p>
            <Link href="/methodology" className="fa-info-card-link">
              Compare methodology tiers <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        {/* Intro Section */}
        <section className="intro-grid section-shell" id="about">
          <motion.div className="intro-statement" {...reveal(0.05)}>
            <SectionLabel>01 — The signal</SectionLabel>
            <h2>See the movement <em>before</em> it becomes the headline.</h2>
          </motion.div>
          <motion.div className="intro-copy" {...reveal(0.15)}>
            <div className="copy-rule" />
            <p>
              AEROVA transforms fragmented fare observations across IndiGo, Air India, and OTAs into a living, high-frequency view of India&apos;s aviation market — built for statistical agencies that need a faster, cleaner read on inflation.
            </p>
            <div className="intro-meta">
              <span>Platform metrics</span>
              <span>Sep 2026 / Base 2024=100</span>
            </div>
          </motion.div>
        </section>

        {/* SIH Signal Strip */}
        <section className="sih-signal-strip section-shell" aria-label="SIH26056 solution overview">
          <div className="sih-signal-intro">
            <SectionLabel>SIH26056 / solution map</SectionLabel>
            <h2>
              One signal.
              <br />
              <span>Six accountable steps.</span>
            </h2>
            <Link className="text-button" href="/methodology">
              Read the methodology <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="sih-signal-grid">
            <div>
              <span>01</span>
              <b>Observe</b>
              <p>Automated collection from airline and OTA portals across booking windows.</p>
            </div>
            <div>
              <span>02</span>
              <b>Normalize</b>
              <p>Disaggregate base fares, taxes, fuel surcharges, and cabin classes.</p>
            </div>
            <div>
              <span>03</span>
              <b>Index</b>
              <p>Two-tier Jevons Geometric Mean &amp; Laspeyres DGCA weighted aggregation.</p>
            </div>
            <div>
              <span>04</span>
              <b>Augment</b>
              <p>Direct plug-and-play feed into MoSPI eSankhyiki CPI macroeconomic portal.</p>
            </div>
          </div>
        </section>

        {/* Highlight Cards */}
        <section className="hero-cards section-shell" aria-label="Platform highlights">
          <motion.div className="routes-card" {...reveal(0.05)}>
            <GlassCard className="routes-card-inner">
              <div className="card-topline">
                <SectionLabel>Network coverage</SectionLabel>
                <CircleDot size={16} className="soft-icon" />
              </div>
              <div className="routes-value">10</div>
              <p className="routes-copy">Top Indian domestic metro corridors monitored in real time</p>
              <div className="status-badge">
                <Check size={13} /> Automated Data Pipeline Active
              </div>
              <div className="card-coordinate">DEL · BOM · BLR · CCU · HYD · MAA · PNQ</div>
            </GlassCard>
          </motion.div>

          <motion.div className="precision-card" {...reveal(0.15)}>
            <GlassCard className="precision-card-inner">
              <div className="precision-mark">
                <Sparkles size={16} strokeWidth={1.4} />
              </div>
              <SectionLabel>Data quality / 02</SectionLabel>
              <h3>Precision airfare monitoring</h3>
              <div className="precision-bottom">
                <p>
                  <span>(IQR &amp; Z-Score)</span> Deterministic quality screen
                </p>
                <ArrowButton href="#analytics">See how it works</ArrowButton>
              </div>
            </GlassCard>
          </motion.div>
        </section>

        {/* Pipeline Section */}
        <section className="pipeline-section section-shell" id="index">
          <div className="section-heading-row">
            <motion.div {...reveal(0.02)}>
              <SectionLabel>02 — The pipeline</SectionLabel>
              <h2 className="section-display">
                Collect / Clean / <span>Calculate</span>
              </h2>
            </motion.div>
            <motion.p className="section-heading-aside" {...reveal(0.12)}>
              An automated statistical pipeline that turns high-frequency web fare observations into an official-grade price index.
            </motion.p>
          </div>

          <div className="pipeline-grid">
            <motion.div className="monitor-card" {...reveal(0.08)}>
              <GlassCard className="monitor-card-inner">
                <div className="monitor-orbit" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="monitor-header">
                  <SectionLabel>Live status</SectionLabel>
                  <span className="live-dot">Live</span>
                </div>
                <div className="monitor-value">
                  03<span>:00</span>
                </div>
                <p>Daily snapshot collection / UTC</p>
                <div className="signal-bars" aria-hidden="true">
                  <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
                </div>
                <Link className="text-button" href="/dashboard">
                  Open live instrument <ArrowUpRight size={15} />
                </Link>
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
                    <div className={`pipeline-item ${index < 4 ? "is-done" : ""}`} key={item.label}>
                      <span className="pipeline-icon">
                        <Icon size={14} strokeWidth={1.6} />
                      </span>
                      <span className="pipeline-label">{item.label}</span>
                      <span className="pipeline-copy">{item.copy}</span>
                      <Check size={14} className="pipeline-check" />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <motion.div className="pipeline-cta-row" {...reveal(0.22)}>
            <p>Monitor India&apos;s airfare movement and augment CPI with 42-day nowcasting advantage</p>
            <Link href="/dashboard" className="round-arrow">
              <ArrowUpRight size={19} />
            </Link>
          </motion.div>

          <motion.div className="index-seal" {...reveal(0.18)} aria-label="India Airfare Index">
            <span className="seal-ring seal-ring-outer" />
            <span className="seal-ring seal-ring-inner" />
            <span className="seal-crosshair">+</span>
            <span className="seal-text">India Airfare Index</span>
          </motion.div>
        </section>

        {/* Analytics Platform Capabilities */}
        <section className="services-section section-shell" id="analytics">
          <motion.div className="services-heading" {...reveal(0.02)}>
            <SectionLabel>03 — The platform</SectionLabel>
            <h2 className="section-display">
              Airfare <span>Intelligence</span>
            </h2>
          </motion.div>
          <div className="services-grid">
            <motion.div className="services-intro" {...reveal(0.08)}>
              <p className="large-copy">
                AEROVA is an enterprise statistical platform built to transform fragmented flight fare data into reliable Consumer Price Index indicators for MoSPI.
              </p>
              <ArrowButton href="#process">Learn more</ArrowButton>
              <div className="services-coordinate">IND / MOSPI / CPI AUGMENTATION</div>
            </motion.div>

            <div className="service-stack">
              <motion.div {...reveal(0.12)}>
                <GlassCard className="service-card">
                  <div className="service-icon">
                    <Check size={16} />
                  </div>
                  <SectionLabel>Capability / 01</SectionLabel>
                  <h3>Automated Fare Collection</h3>
                  <p>Continuously collect airfare information across 1d, 7d, 15d, 30d, 45d advance booking lead times.</p>
                </GlassCard>
              </motion.div>
              <motion.div {...reveal(0.2)}>
                <GlassCard className="service-card service-card-pipeline">
                  <div className="service-icon">
                    <Database size={16} />
                  </div>
                  <SectionLabel>Capability / 02</SectionLabel>
                  <h3>DGCA Weighted Aggregation</h3>
                  <p>Route weights mirror actual DGCA annual domestic passenger distributions across major Indian corridors.</p>
                  <div className="data-chips">
                    <span>DEL-BOM (18.5%)</span>
                    <span>DEL-BLR (14.2%)</span>
                    <span>BOM-BLR (11.8%)</span>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            <motion.div className="trusted-service" {...reveal(0.16)}>
              <div className="trusted-rule" />
              <Globe2 size={19} strokeWidth={1.35} />
              <SectionLabel>Built for scrutiny</SectionLabel>
              <h3>MoSPI eSankhyiki Ready</h3>
              <p>
                Exportable in SDMX and JSON schema matching MoSPI eSankhyiki macro-indicator specifications (Base Year 2024 = 100).
              </p>
              <div className="trusted-mark">AEROVA / 2026</div>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="process-section section-shell" id="process">
          <div className="process-heading">
            <motion.div {...reveal(0.02)}>
              <SectionLabel>04 — Methodology</SectionLabel>
              <h2 className="section-display">The Process</h2>
            </motion.div>
            <motion.h3 {...reveal(0.12)}>
              From fare collection <span>to official index</span>
            </motion.h3>
          </div>
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <motion.div key={step.number} className="process-item" {...reveal(index * 0.06)}>
                <GlassCard className="process-card">
                  <div className="process-topline">
                    <span className="process-number">{step.number}</span>
                    <ArrowUpRight size={15} />
                  </div>
                  <div className="process-line" />
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section section-shell">
          <motion.div className="stats-heading" {...reveal(0.02)}>
            <SectionLabel>05 — Platform metrics</SectionLabel>
            <p>Operational signals from the live AEROVA pipeline — augmenting official statistics.</p>
          </motion.div>
          <div className="stats-grid">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.value}
                className="metric-item"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-note">{metric.note}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section section-shell" id="faq">
          <motion.div className="faq-intro" {...reveal(0.02)}>
            <SectionLabel>06 — FAQ</SectionLabel>
            <h2>
              Common
              <br />
              <span>questions</span>
            </h2>
            <p>Clear answers for teams evaluating real-time airfare index augmentation.</p>
          </motion.div>
          <div className="faq-list">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={item.question}
                  className={`faq-item ${isOpen ? "is-open" : ""}`}
                  {...reveal(index * 0.04)}
                >
                  <button
                    className="faq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span>
                      <span className="faq-index">0{index + 1}</span>
                      {item.question}
                    </span>
                    {isOpen ? <Minus size={17} /> : <Plus size={17} />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.24,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      >
                        <p className="faq-answer">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section section-shell" id="contact">
          <motion.div className="cta-orbit" aria-hidden="true" {...reveal(0.04)}>
            <span />
            <span />
            <span />
          </motion.div>
          <motion.div className="cta-content" {...reveal(0.12)}>
            <SectionLabel>Ready to explore?</SectionLabel>
            <h2>
              Let&apos;s track what&apos;s <span>changing.</span>
            </h2>
            <Link href="/dashboard" className="primary-button">
              Explore AEROVA <ArrowUpRight size={17} />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer section-shell">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand-lockup" href="#home">
              <span className="brand-mark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="currentColor" />
                </svg>
              </span>
              <span className="brand-name">AEROVA</span>
            </a>
            <p>Real-time airfare intelligence for India.</p>
            <div className="footer-caption">An instrument for sharper macroeconomic signals.</div>
          </div>
          <div className="footer-links">
            <div>
              <SectionLabel>Product</SectionLabel>
              <Link href="/dashboard">Airfare Index</Link>
              <a href="#analytics">Route Analytics</a>
              <a href="#analytics">Fare Monitoring</a>
              <a href="#analytics">Data Quality</a>
            </div>
            <div>
              <SectionLabel>Company</SectionLabel>
              <button
                className="nav-link nav-button"
                style={{ textAlign: "left", padding: 0 }}
                onClick={() => setAboutOpen(true)}
              >
                About Us
              </button>
              <a href="#analytics">Technology</a>
              <Link href="/methodology">Research</Link>
              <a href="#contact">Contact</a>
            </div>
            <div>
              <SectionLabel>Support</SectionLabel>
              <Link href="/api">Documentation</Link>
              <a href="#faq">FAQ</a>
              <Link href="/methodology">Methodology</Link>
              <Link href="/dashboard">Data Sources</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 AEROVA</span>
          <span className="footer-status">
            <span className="status-dot" /> SIH26056 / MoSPI CPI Augmentation Solution
          </span>
          <div className="social-links">
            <Link href="/api">
              API contract <ArrowUpRight size={13} />
            </Link>
            <Link href="/methodology">
              Methodology <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </footer>

      {/* About Us Modal Dialog */}
      <AnimatePresence>
        {aboutOpen && (
          <motion.div
            className="about-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="about-backdrop"
              aria-label="Close About Us panel"
              onClick={() => setAboutOpen(false)}
            />
            <motion.section
              className="about-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="about-dialog-head">
                <SectionLabel>About AEROVA</SectionLabel>
                <button
                  className="icon-button about-close"
                  aria-label="Close About Us panel"
                  onClick={() => setAboutOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>
              <h2 id="about-title" className="about-dialog-title">
                About <span>Us</span>
              </h2>
              <p className="about-dialog-copy">
                The engineering and statistical team building high-frequency airfare intelligence for MoSPI.
              </p>
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
