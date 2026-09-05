import React, { useState } from "react";
import { ArrowLeft, Braces, Copy, ExternalLink, ShieldCheck, Check } from "lucide-react";
import { Link } from "wouter";

const exampleSummary = `curl -X GET "http://127.0.0.1:8000/api/v1/summary" -H "Accept: application/json"`;

const exampleResponse = `{
  "as_of_date": "2026-09-05",
  "national_airfare_index": 153.88,
  "base_year": 2024,
  "base_index": 100.0,
  "daily_change_pct": 1.93,
  "mom_inflation_pct": 20.19,
  "volatility_index": 10.51,
  "total_fares_collected": 22500,
  "active_corridors_monitored": 10,
  "cpi_transport_official": 108.5,
  "cpi_official_month": "2026-08",
  "augmentation_divergence": 45.38,
  "reporting_latency_days_saved": 42
}`;

export default function ApiDocs() {
  const [copied, setCopied] = useState(false);

  const copyExample = async () => {
    try {
      await navigator.clipboard?.writeText(exampleSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
  };

  return (
    <div className="intel-page api-page">
      <div className="dashboard-ambient" aria-hidden="true">
        <div className="dashboard-video-shade" />
      </div>

      <header className="dashboard-header intel-header">
        <Link href="/" className="dashboard-back">
          <ArrowLeft size={15} /> Back to AEROVA
        </Link>
        <div className="dashboard-title-lockup">
          <span className="dashboard-kicker">A / 08 — Machine-readable interface</span>
          <h1>
            Index <span>API</span>
          </h1>
        </div>
        <Link href="/dashboard" className="dashboard-refresh">
          Open live index <ExternalLink size={14} />
        </Link>
      </header>

      <main className="intel-main">
        <section className="intel-hero">
          <p className="dashboard-kicker">AEROVA / public API contract</p>
          <h2>Power your analytics with the real-time airfare index feed.</h2>
          <p>
            The dashboard and downstream statistical systems (including MoSPI eSankhyiki) ingest standardized RESTful endpoints returning high-frequency daily indices, lead-time curves, route matrix distributions, and automated SDMX feeds.
          </p>
        </section>

        <section className="api-callout glass-card">
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-kicker">Endpoint</p>
              <h3>GET /api/v1/summary</h3>
            </div>
            <Braces size={16} />
          </div>
          <code>{exampleSummary}</code>
          <button className="dashboard-refresh" onClick={copyExample}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy request"}
          </button>
        </section>

        <section className="intel-grid">
          <div className="intel-card glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Core Endpoints</p>
                <h3>Available Routes</h3>
              </div>
            </div>
            <div className="api-field-list">
              <div>
                <b>GET /summary</b>
                <span>National index, daily delta, MoM inflation, and eSankhyiki divergence</span>
              </div>
              <div>
                <b>GET /index-trend?range=90d</b>
                <span>Daily time series comparing AEROVA Index vs MoSPI CPI benchmark</span>
              </div>
              <div>
                <b>GET /routes</b>
                <span>Corridor-level indices, DGCA weights, and baseline fares</span>
              </div>
              <div>
                <b>GET /advance-curve</b>
                <span>Escalation curve across 1d, 7d, 15d, 30d, 45d advance windows</span>
              </div>
              <div>
                <b>GET /esankhyiki/export</b>
                <span>MoSPI-compliant SDMX / JSON-STAT data feed for eSankhyiki ingestion</span>
              </div>
            </div>
          </div>

          <div className="intel-card glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Sample Response</p>
                <h3>200 OK (application/json)</h3>
              </div>
            </div>
            <pre
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
                overflowX: "auto",
              }}
            >
              {exampleResponse}
            </pre>
          </div>
        </section>

        <section className="intel-card glass-card">
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-kicker">Integrity &amp; Standards</p>
              <h3>MoSPI eSankhyiki COICOP 07.3.3 Standard</h3>
            </div>
            <ShieldCheck size={16} />
          </div>
          <p>
            All indices are computed on Base Year 2024 = 100.0, aligning directly with MoSPI’s official CPI Base Revision standards. Aggregations use unweighted Jevons Geometric Mean for elementary cells and DGCA passenger traffic volume weights for the upper-level Laspeyres index.
          </p>
        </section>
      </main>
    </div>
  );
}
