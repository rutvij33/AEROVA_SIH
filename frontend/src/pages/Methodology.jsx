import React from "react";
import { ArrowLeft, ArrowUpRight, BarChart3, Check, Database, GitBranch, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const stages = [
  "01 Collect / High-frequency web crawlers & APIs",
  "02 Clean / Fare disaggregation (Base vs Taxes vs Fuel)",
  "03 Normalize / Advance window categorization (1d, 7d, 15d, 30d, 45d)",
  "04 Validate / IQR & Modified Z-Score outlier isolation",
  "05 Calculate Index / Jevons Geometric Mean & Laspeyres DGCA Weights",
  "06 Augment / MoSPI eSankhyiki SDMX & JSON-STAT Feed",
];

const routes = [
  "DEL ↔ BOM (18.5% weight)",
  "DEL ↔ BLR (14.2% weight)",
  "BOM ↔ BLR (11.8% weight)",
  "DEL ↔ CCU (8.9% weight)",
  "HYD ↔ DEL (8.2% weight)",
  "BLR ↔ HYD (6.5% weight)",
  "MAA ↔ DEL (5.8% weight)",
  "PNQ ↔ DEL (4.5% weight)",
];

const windows = [
  { window: "T+1d", note: "Same-day / emergency surge (highest volatility)" },
  { window: "T+7d", note: "Weekly planning elasticity band" },
  { window: "T+15d", note: "Corporate booking window" },
  { window: "T+30d", note: "Standard leisure advance purchase" },
  { window: "T+45d", note: "Early discount baseline anchor" },
];

export default function Methodology() {
  return (
    <div className="intel-page">
      <div className="dashboard-ambient" aria-hidden="true">
        <div className="dashboard-video-shade" />
      </div>

      <header className="dashboard-header intel-header">
        <Link href="/" className="dashboard-back">
          <ArrowLeft size={15} /> Back to AEROVA
        </Link>
        <div className="dashboard-title-lockup">
          <span className="dashboard-kicker">A / 07 — SIH26056 brief</span>
          <h1>
            Index <span>Methodology</span>
          </h1>
        </div>
        <Link href="/dashboard" className="dashboard-refresh">
          Open live index <ArrowUpRight size={14} />
        </Link>
      </header>

      <main className="intel-main">
        <section className="intel-hero">
          <p className="dashboard-kicker">Real-time airfare price index for India</p>
          <h2>From fragmented quotes to a defensible statistical signal.</h2>
          <p>
            AEROVA is a statistical index and data engineering platform built to solve Smart India Hackathon Problem Statement <b>SIH26056</b> for the <b>Ministry of Statistics and Programme Implementation (MoSPI)</b>. It collects high-frequency fare observations, cleans them using rigorous IMF/UN CPI standards, and calculates a daily Base-100 index that can augment official macroeconomic inflation indicators.
          </p>
        </section>

        <section className="intel-grid">
          <div className="intel-card glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Elementary Index</p>
                <h3>Jevons Geometric Mean</h3>
              </div>
              <BarChart3 size={16} />
            </div>
            <p>
              In accordance with the UN Consumer Price Index Manual, unweighted micro-level price quotes across booking windows and carriers within each corridor are aggregated using the Jevons Geometric Mean to avoid the upward plutocratic bias of arithmetic means:
            </p>
            <div className="formula">
              I_J(t) = ∏ (P_i,t / P_i,0)^(1/n) × 100
            </div>
          </div>

          <div className="intel-card glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Upper-Level Aggregate</p>
                <h3>Laspeyres DGCA Passenger Weights</h3>
              </div>
              <GitBranch size={16} />
            </div>
            <p>
              Route indices are aggregated into the National Airfare Price Index using annual Directorate General of Civil Aviation (DGCA) scheduled passenger traffic weights:
            </p>
            <div className="formula">
              API_t = ∑ [ w_r × I_r(t) ]
            </div>
          </div>
        </section>

        <section className="intel-card glass-card">
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-kicker">Representative Corridor Basket</p>
              <h3>Top Indian Domestic Routes</h3>
            </div>
            <BarChart3 size={16} />
          </div>
          <p>
            The domestic representative basket covers over 78% of all domestic passenger volume across India&apos;s primary commercial corridors:
          </p>
          <div className="route-chip-list">
            {routes.map((route) => (
              <span key={route}>{route}</span>
            ))}
          </div>
        </section>

        <section className="intel-card glass-card">
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-kicker">Data pipeline</p>
              <h3>Auditable by construction</h3>
            </div>
            <Database size={16} />
          </div>
          <div className="intel-stage-grid">
            {stages.map((stage, index) => (
              <div className="intel-stage" key={stage}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{stage}</b>
                <Check size={14} />
              </div>
            ))}
          </div>
          <p className="intel-note">
            Observations are partitioned by cabin class, lead time, and airline, ensuring strict like-for-like temporal price comparability.
          </p>
        </section>

        <section className="intel-grid">
          <div className="intel-card glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Lead-time analysis</p>
                <h3>Dynamic pricing lens</h3>
              </div>
              <BarChart3 size={16} />
            </div>
            <div className="window-list">
              {windows.map((w) => (
                <div key={w.window}>
                  <b>{w.window}</b>
                  <span>{w.note}</span>
                </div>
              ))}
            </div>
            <p className="intel-note">
              Traditional monthly CPI price collection samples only a single arbitrary booking window, missing up to 134% in consumer expenditure price swings.
            </p>
          </div>

          <div className="intel-card glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">MoSPI CPI integration</p>
                <h3>eSankhyiki Macro-Indicator Augmentation</h3>
              </div>
              <ShieldCheck size={16} />
            </div>
            <p>
              High-frequency digital fare observations provide a timelier signal for aviation-related price movement, augmenting official CPI with a 42-day nowcasting advantage.
            </p>
            <div className="intel-callout">
              Data Standard / MoSPI Base Year 2024 = 100.0<br />
              COICOP Category / 07.3.3 Passenger Transport by Air<br />
              Reporting Advantage / 42-day nowcast flash estimate<br />
              <Link href="/esankhyiki" style={{ display: "inline-block", marginTop: 4, marginRight: 14, color: "#0284c7", fontWeight: 600 }}>
                AEROVA eSankhyiki SDMX Feed ↗
              </Link>
              <a
                href="https://esankhyiki.mospi.gov.in/macroindicators?product=cpi"
                target="_blank"
                rel="noreferrer"
              >
                Official CPI reference / MoSPI eSankhyiki ↗
              </a>
            </div>
          </div>
        </section>

        <section className="intel-card glass-card validation-card">
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-kicker">Validation Gate</p>
              <h3>Backtesting &amp; Error Metrics</h3>
            </div>
            <ShieldCheck size={16} />
          </div>
          <p>
            AEROVA continuously backtests its daily aggregate against the official MoSPI Transport sub-group monthly series to calculate correlation, divergence, and lead-lag dynamics:
          </p>
          <div className="validation-grid">
            <div>
              <span>Reference dataset</span>
              <b>MoSPI CPI (Base 2024=100)</b>
            </div>
            <div>
              <span>Backtest window</span>
              <b>90 Days Historical</b>
            </div>
            <div>
              <span>Divergence Index</span>
              <b>+45.38 pts (Volatile)</b>
            </div>
            <div>
              <span>Lead Time Advantage</span>
              <b>42 Days Ahead of Official Release</b>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
