import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BarChart3, CalendarDays, Check, CircleAlert, Clock3, Database, Download, Gauge, MapPin, RefreshCw, Route as RouteIcon, ShieldCheck, SlidersHorizontal, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const ROUTE_OPTIONS = [
  { value: "", label: "All India network" },
  { value: "PNQ-DEL", label: "Pune → Delhi" },
  { value: "BOM-DEL", label: "Mumbai → Delhi" },
  { value: "DEL-BLR", label: "Delhi → Bengaluru" },
  { value: "HYD-DEL", label: "Hyderabad → Delhi" },
  { value: "BOM-BLR", label: "Mumbai → Bengaluru" },
  { value: "DEL-CCU", label: "Delhi → Kolkata" },
  { value: "BLR-HYD", label: "Bengaluru → Hyderabad" },
  { value: "MAA-DEL", label: "Chennai → Delhi" },
] as const;
type RouteFilter = (typeof ROUTE_OPTIONS)[number]["value"];

const HISTORY_OPTIONS = [7, 30, 90, 365] as const;
const MAP_ROUTES = [
  { route: "PNQ-DEL", label: "PNQ → DEL", a: [308, 236], b: [340, 137] },
  { route: "BOM-DEL", label: "BOM → DEL", a: [247, 274], b: [340, 137] },
  { route: "DEL-BLR", label: "DEL → BLR", a: [340, 137], b: [360, 320] },
  { route: "HYD-DEL", label: "HYD → DEL", a: [335, 286], b: [340, 137] },
  { route: "BOM-BLR", label: "BOM → BLR", a: [247, 274], b: [360, 320] },
  { route: "DEL-CCU", label: "DEL → CCU", a: [340, 137], b: [457, 205] },
  { route: "BLR-HYD", label: "BLR → HYD", a: [360, 320], b: [335, 286] },
  { route: "MAA-DEL", label: "MAA → DEL", a: [393, 374], b: [340, 137] },
] as const;

function getDefaultDepartureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function formatMoney(amount: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function projectFlight(latitude: number, longitude: number) {
  return { x: 76 + ((longitude - 68) / 29) * 448, y: 382 - ((latitude - 6) / 31) * 320 };
}

function exportObservations(observations: Array<{ routeKey: string; origin: string; destination: string; airline: string; amount: number; currency: string; stops: number; departureDate: string; capturedAt: string }>) {
  const columns = ["route", "origin", "destination", "airline", "fare", "currency", "stops", "departure_date", "captured_at"];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = observations.map((item) => [item.routeKey, item.origin, item.destination, item.airline, item.amount, item.currency, item.stops, item.departureDate, item.capturedAt].map(escape).join(","));
  const blob = new Blob([[columns.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `aerova-fares-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function TrendChart({ history, currency }: { history: Array<{ date: string; value: number; medianFare: number }>; currency: string }) {
  if (history.length < 2) {
    return <div className="chart-empty"><TrendingUp size={17} /><span>Trend is building. A second captured snapshot is required for a plotted series.</span></div>;
  }
  const values = history.map((point) => point.value);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const points = history.map((point, index) => {
    const x = history.length === 1 ? 0 : (index / (history.length - 1)) * 100;
    const y = 92 - ((point.value - min) / Math.max(max - min, 1)) * 76;
    return `${x},${y}`;
  }).join(" ");
  const latest = history[history.length - 1];
  return (
    <div className="trend-chart-wrap">
      <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Airfare index trend, latest value ${latest.value}`}>
        <line x1="0" y1="23" x2="100" y2="23" />
        <line x1="0" y1="56" x2="100" y2="56" />
        <line x1="0" y1="92" x2="100" y2="92" />
        <polyline points={points} />
        {history.map((point, index) => {
          const x = history.length === 1 ? 0 : (index / (history.length - 1)) * 100;
          const y = 92 - ((point.value - min) / Math.max(max - min, 1)) * 76;
          return <circle key={`${point.date}-${index}`} cx={x} cy={y} r="1.35" />;
        })}
      </svg>
      <div className="trend-axis"><span>{new Date(history[0].date).toLocaleDateString([], { day: "2-digit", month: "short" })}</span><span>{history.length} snapshots · {formatMoney(latest.medianFare, currency)} latest median</span><span>{new Date(latest.date).toLocaleDateString([], { day: "2-digit", month: "short" })}</span></div>
    </div>
  );
}

export default function Dashboard() {
  const [route, setRoute] = useState<RouteFilter>("");
  const [airline, setAirline] = useState("");
  const [departureDate, setDepartureDate] = useState(getDefaultDepartureDate);
  const [historyDays, setHistoryDays] = useState<(typeof HISTORY_OPTIONS)[number]>(30);
  const queryInput = useMemo(() => ({ ...(route ? { route } : {}), ...(airline ? { airline } : {}), departureDate, historyDays }), [route, airline, departureDate, historyDays]);
  const query = trpc.airfare.index.useQuery(queryInput, { refetchInterval: 120_000, retry: 1 });
  const data = query.data;
  const observations = data?.observations ?? [];
  const routeSummary = data?.routeSummary ?? [];
  const airlineSummary = data?.airlineSummary ?? [];
  const distribution = data?.fareDistribution ?? [];
  const anomalies = data?.anomalies ?? [];
  const maxRouteFare = Math.max(...routeSummary.map((item) => item.maxFare), 1);
  const maxDistributionCount = Math.max(...distribution.map((item) => item.count), 1);
  const maxAirlineFare = Math.max(...airlineSummary.map((item) => item.averageFare), 1);
  const indexHeadline = route ? routeSummary[0]?.indexValue ?? 0 : data?.networkIndexValue ?? 0;
  const indexMovement = route ? routeSummary[0]?.deltaPercent ?? 0 : data?.networkDeltaPercent ?? 0;
  const baselineDate = route ? routeSummary[0]?.baselineDate : data?.baselineDate;
  const indexLabel = route ? "Selected route index" : "India network index";
  const routeLabel = ROUTE_OPTIONS.find((option) => option.value === route)?.label ?? "All monitored routes";
  const flightInput = useMemo(() => ({}), []);
  const flightQuery = trpc.flights.india.useQuery(flightInput, { refetchInterval: 300_000, retry: 0 });
  const flights = flightQuery.data?.flights ?? [];
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId) ?? flights[0] ?? null;
  const hasData = Boolean(data && observations.length);

  return (
    <div className="dashboard-page">
      <div className="dashboard-ambient" aria-hidden="true">
        <video className="dashboard-background-video" autoPlay muted loop playsInline preload="auto" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260212_043536_e0d3c69f-5c0c-4533-8395-fbe962587446.mp4" />
        <div className="dashboard-video-shade" />
      </div>
      <header className="dashboard-header">
        <Link href="/" className="dashboard-back"><ArrowLeft size={15} /> Back to AEROVA</Link>
        <div className="dashboard-title-lockup"><span className="dashboard-kicker">A / 06 — Live instrument</span><h1>Airfare <span>Index</span></h1></div>
        <div className="dashboard-actions">
          <span className={`dashboard-status ${query.isFetching ? "is-fetching" : ""}`}><span /> {query.isFetching ? "Syncing" : "DATA LIVE"}</span>
          <button className="dashboard-refresh" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw size={15} className={query.isFetching ? "spin" : ""} /> Refresh</button>
        </div>
      </header>

      <main className="dashboard-main">
        <motion.section className="dashboard-intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div><p className="dashboard-kicker">India / observed fare movement</p><h2>Real-time airfare intelligence, in one view.</h2></div>
          <p className="dashboard-intro-copy">An experimental indicator designed to augment transport-price analysis with bookable Duffel {data?.environment === "live" ? "live" : "test-environment"} offers across selected India routes. The current feed is transparent prototype data, not an official government CPI series.</p>
        </motion.section>

        <section className="dashboard-filter-bar glass-card" aria-label="Dashboard filters">
          <div className="dashboard-filter-heading"><SlidersHorizontal size={15} /><span>Query controls</span></div>
          <label className="dashboard-filter"><span>From / to</span><select value={route} onChange={(event) => setRoute(event.target.value as RouteFilter)}>{ROUTE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="dashboard-filter"><span><CalendarDays size={13} /> Travel date</span><input type="date" value={departureDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDepartureDate(event.target.value)} /></label>
          <label className="dashboard-filter"><span>Airline</span><select value={airline} onChange={(event) => setAirline(event.target.value)}><option value="">All returned carriers</option>{(data?.airlineOptions ?? []).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          {data && observations.length ? <button className="dashboard-export" onClick={() => exportObservations(observations)}><Download size={14} /> Export CSV</button> : null}
        </section>

        {query.isLoading && <section className="dashboard-state glass-card"><RefreshCw size={19} className="spin" /><h2>Collecting fare observations</h2><p>Requesting the latest offer snapshot from the connected airfare feed.</p></section>}
        {query.isError && <section className="dashboard-state dashboard-error glass-card"><ShieldCheck size={20} /><h2>Feed unavailable</h2><p>{query.error.message || "Duffel did not return a usable offer snapshot."}</p><button className="dashboard-refresh" onClick={() => query.refetch()}><RefreshCw size={15} /> Try again</button></section>}
        {!query.isLoading && !query.isError && !observations.length && <section className="dashboard-state glass-card"><RouteIcon size={20} /><h2>No fare observations returned</h2><p>The connection is active, but the selected route, carrier, and travel date returned no current offers. Try a different date or widen the filters.</p></section>}

        {hasData && (
          <>
            <section className="dashboard-stat-grid">
              <motion.div className="dashboard-stat dashboard-stat-primary glass-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
                <div className="dashboard-stat-head"><span>{indexLabel}</span><Gauge size={16} /></div>
                <div className="dashboard-big-value">{indexHeadline}<small>/ 100</small></div>
                <div className={`dashboard-movement ${indexMovement > 0 ? "is-up" : indexMovement < 0 ? "is-down" : ""}`}>{formatSigned(indexMovement)} <span>vs baseline</span></div>
                <p>{route ? `First observation / ${routeLabel}` : "Network median indexed to its first observation"}</p>
                <div className="dashboard-stat-foot"><span>Baseline / {baselineDate ?? "initializing"}</span><span className="mono">{data?.environment.toUpperCase()} / API</span></div>
              </motion.div>
              <div className="dashboard-stat glass-card"><div className="dashboard-stat-head"><span>Last updated</span><Clock3 size={16} /></div><div className="dashboard-time">{data ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}</div><p>{data ? new Date(data.fetchedAt).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) : "Waiting"}</p></div>
              <div className="dashboard-stat glass-card"><div className="dashboard-stat-head"><span>Fares collected</span><Database size={16} /></div><div className="dashboard-stat-value">{observations.length}</div><p>Bookable offers in this snapshot</p></div>
              <div className="dashboard-stat glass-card"><div className="dashboard-stat-head"><span>India basket coverage</span><RouteIcon size={16} /></div><div className="dashboard-stat-value">{routeSummary.length}<small> routes</small></div><p>{data?.sourceLabels[0]} · {data?.monitoring.failedRequests ?? 0} failed requests</p></div>
            </section>
          </>
        )}

        <section className="dashboard-panel glass-card flight-map-panel">
              <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Live airspace / India</p><h2>Aircraft in the sky</h2></div><div className="flight-map-status"><span className={flightQuery.isFetching ? "is-fetching" : ""} />{flightQuery.isFetching ? "Syncing" : flightQuery.isError ? "Feed unavailable" : "DATA LIVE"}</div></div>
              <div className="flight-map-layout">
                <div className="flight-map-canvas">
                  <svg viewBox="0 0 600 450" role="img" aria-label="Live Aviationstack aircraft positions over India">
                    <defs><pattern id="flight-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="currentColor" strokeOpacity=".16" /></pattern></defs>
                    <rect width="600" height="450" fill="url(#flight-grid)" />
                    <path className="flight-map-outline" d="M303 30 365 67 421 119 459 181 437 242 412 287 393 347 349 401 303 365 278 322 235 307 206 270 227 222 215 179 248 140 273 89Z" />
                    <path className="flight-map-arc" d="M84 350 Q300 20 535 350" /><path className="flight-map-arc" d="M126 396 Q300 80 494 396" />
                    {flights.map((flight) => { const point = projectFlight(flight.latitude, flight.longitude); const isSelected = selectedFlight?.id === flight.id; return <g key={flight.id} className={`flight-marker ${isSelected ? "is-active" : ""}`} transform={`translate(${point.x} ${point.y})`} role="button" tabIndex={0} onClick={() => setSelectedFlightId(flight.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedFlightId(flight.id); } }} aria-label={`Select flight ${flight.flightNumber}`}><circle r="15" /><circle className="flight-marker-core" r="4" /><text style={{ transform: `rotate(${flight.direction ?? 0}deg)` }} textAnchor="middle" dominantBaseline="central">✈</text></g>; })}
                    {!flightQuery.isLoading && !flightQuery.isError && !flights.length && <text className="flight-map-empty" x="300" y="220" textAnchor="middle">No positioned aircraft returned for India</text>}
                  </svg>
                  <div className="flight-map-legend"><span><i className="legend-dot live" /> Live position</span><span>Bounds / 6°–37° N · 68°–97° E</span><span>Refresh / 5 min</span></div>
                </div>
                <div className="flight-detail-card">
                  <div className="flight-detail-heading"><span>Selected aircraft</span><b>{flights.length || 0}<small> mapped</small></b></div>
                  {flightQuery.isLoading ? <div className="flight-detail-empty"><RefreshCw size={16} className="spin" /> Loading live positions…</div> : flightQuery.isError ? <div className="flight-detail-empty"><CircleAlert size={16} /> {flightQuery.error.data?.code === "TOO_MANY_REQUESTS" ? "Aviationstack rate limit reached." : flightQuery.error.message || "Aviationstack could not return live positions."}<small>{flightQuery.error.data?.code === "TOO_MANY_REQUESTS" ? "Free-tier request limits apply; the map will retry on the next refresh window." : "Check API plan limits or try again later."}</small></div> : selectedFlight ? <div className="flight-detail-content"><div className="flight-callsign">{selectedFlight.flightNumber}</div><p>{selectedFlight.airline} · {selectedFlight.status}</p><div className="flight-detail-route"><span>{selectedFlight.origin}</span><i>→</i><span>{selectedFlight.destination}</span></div><dl><div><dt>Altitude</dt><dd>{selectedFlight.altitudeFeet ? `${selectedFlight.altitudeFeet.toLocaleString()} ft` : "—"}</dd></div><div><dt>Speed</dt><dd>{selectedFlight.speedKnots ? `${selectedFlight.speedKnots} kt` : "—"}</dd></div><div><dt>Heading</dt><dd>{selectedFlight.direction != null ? `${selectedFlight.direction}°` : "—"}</dd></div><div><dt>Updated</dt><dd>{selectedFlight.updatedAt ? new Date(selectedFlight.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</dd></div></dl></div> : <div className="flight-detail-empty"><MapPin size={16} /> No active aircraft with an in-bounds position.</div>}
                  <div className="flight-source-note">Source / Aviationstack · {flightQuery.data?.environment ?? "free-tier"}<br />Live flight positions are subject to provider coverage, refresh limits, and data latency.</div>
                </div>
              </div>
            </section>

        {hasData && (
          <>
            <section className="dashboard-content-grid dashboard-content-grid-wide">
              <div className="dashboard-panel glass-card trend-panel">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Airfare price index / {routeLabel}</p><h2>Observed movement</h2></div><div className="history-toggle">{HISTORY_OPTIONS.map((days) => <button key={days} className={historyDays === days ? "is-active" : ""} onClick={() => setHistoryDays(days)}>{days}D</button>)}</div></div>
                <TrendChart history={data?.history ?? []} currency={data?.currency ?? "INR"} />
                <div className="dashboard-chart-note">Baseline = 100 · {data?.history.length ? `${data.history.length} stored snapshot${data.history.length === 1 ? "" : "s"}` : "No stored snapshots yet"} · {data?.indexBasis}</div>
              </div>
              <div className="dashboard-panel glass-card distribution-panel">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Fare distribution</p><h2>Observed spread</h2></div><BarChart3 size={16} /></div>
                <div className="distribution-chart">{distribution.map((item) => <div className="distribution-row" key={item.label}><span>{item.label}</span><div><i style={{ width: `${Math.max(item.count ? 10 : 0, (item.count / maxDistributionCount) * 100)}%` }} /></div><strong>{item.count}</strong></div>)}</div>
                <div className="dashboard-chart-note">Distribution uses the returned offer sample rather than an average alone.</div>
              </div>
            </section>

            <section className="dashboard-content-grid dashboard-content-grid-wide">
              <div className="dashboard-panel glass-card">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Route-wise analytics</p><h2>Corridor performance</h2></div><span className="dashboard-date">Departure / {data?.departureDate}</span></div>
                <div className="route-analytics-table"><div className="table-head"><span>Route</span><span>Avg</span><span>Min / max</span><span>Index</span></div>{routeSummary.map((item, index) => <motion.div className="route-analytics-row" key={item.routeKey} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}><span><b>{item.route}</b><small>{item.offers} observations</small></span><strong>{formatMoney(item.averageFare, data?.currency ?? "INR")}</strong><span>{formatMoney(item.minFare, data?.currency ?? "INR")} — {formatMoney(item.maxFare, data?.currency ?? "INR")}</span><em className={item.deltaPercent > 0 ? "is-up" : item.deltaPercent < 0 ? "is-down" : ""}>{item.indexValue} <small>{formatSigned(item.deltaPercent)}</small></em></motion.div>)}</div>
              </div>
              <div className="dashboard-panel glass-card">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Airline comparison</p><h2>Carrier spread</h2></div><TrendingUp size={16} /></div>
                <div className="airline-list">{airlineSummary.slice(0, 8).map((item) => <div className="airline-row" key={item.airline}><span><b>{item.airline}</b><small>{item.observations} observations · {formatMoney(item.minFare, data?.currency ?? "INR")}–{formatMoney(item.maxFare, data?.currency ?? "INR")}</small></span><div className="airline-bar"><i style={{ width: `${Math.max(9, (item.averageFare / maxAirlineFare) * 100)}%` }} /></div><strong>{formatMoney(item.averageFare, data?.currency ?? "INR")}<small>{formatSigned(item.movementPercent)}</small></strong></div>)}</div>
              </div>
            </section>

            <section className="dashboard-content-grid dashboard-content-grid-wide">
              <div className="dashboard-panel glass-card map-panel">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">India route monitor</p><h2>Corridor map</h2></div><MapPin size={16} /></div>
                <div className="route-map-shell"><svg viewBox="0 0 600 420" role="img" aria-label="Stylized interactive map of monitored India airfare routes"><path className="india-outline" d="M309 33 366 72 420 124 447 190 430 248 411 287 389 348 350 388 309 359 280 320 241 307 210 272 229 220 216 182 248 142 275 96Z" />{MAP_ROUTES.map((item) => <g key={item.route} className={route === item.route ? "map-route is-active" : "map-route"} onClick={() => setRoute(item.route as RouteFilter)}><line x1={item.a[0]} y1={item.a[1]} x2={item.b[0]} y2={item.b[1]} /><circle cx={item.a[0]} cy={item.a[1]} r="5" /><circle cx={item.b[0]} cy={item.b[1]} r="5" /><text x={(item.a[0] + item.b[0]) / 2} y={(item.a[1] + item.b[1]) / 2 - 9}>{item.label}</text></g>)}</svg><div className="map-legend"><span><i className="legend-dot" /> Select a corridor</span><span>{route ? routeLabel : "Network view"}</span></div></div>
              </div>
              <div className="dashboard-panel glass-card pipeline-panel">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Data pipeline</p><h2>Observation path</h2></div><Database size={16} /></div>
                <div className="pipeline-list">{(data?.pipeline ?? []).map((step, index) => <div className="pipeline-step" key={step.stage}><span className={`pipeline-node ${step.status}`}><Check size={13} /></span><b>{step.stage}</b>{index < (data?.pipeline.length ?? 0) - 1 && <i />}</div>)}</div>
                <p className="pipeline-caption">Collect → Clean → Normalize → Validate → Calculate Index → Dashboard. AEROVA stores returned observations and does not fill missing history with simulated values.</p>
              </div>
            </section>

            <section className="dashboard-content-grid dashboard-content-grid-wide">
              <div className="dashboard-panel glass-card anomaly-panel">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Data quality / anomaly detection</p><h2>{data?.anomalyCount ?? 0} anomalous fares detected</h2></div><CircleAlert size={17} /></div>
                {anomalies.length ? <div className="anomaly-list">{anomalies.slice(0, 6).map((anomaly) => <div className="anomaly-row" key={anomaly.id}><CircleAlert size={15} /><span><b>{anomaly.route} · {anomaly.airline}</b><small>{formatMoney(anomaly.amount, data?.currency ?? "INR")} · expected {formatMoney(anomaly.expectedMin, data?.currency ?? "INR")}–{formatMoney(anomaly.expectedMax, data?.currency ?? "INR")}</small></span><strong>Flagged</strong></div>)}</div> : <div className="quality-clear"><ShieldCheck size={18} /><span>Current offer sample is within the route-level interquartile quality rule. Minimum sample size: four observations per route.</span></div>}
                <div className="dashboard-chart-note">Rule: flag offers outside Q1 − 1.5×IQR and Q3 + 1.5×IQR. This is deterministic quality screening, not a machine-learning diagnosis.</div>
              </div>
              <div className="dashboard-panel glass-card monitoring-panel">
                <div className="dashboard-panel-head"><div><p className="dashboard-kicker">Admin / monitoring view</p><h2>Collection health</h2></div><ShieldCheck size={16} /></div>
                <div className="monitoring-grid"><div><span>Provider</span><b>{data?.monitoring.provider}</b></div><div><span>Status</span><b className={data?.monitoring.status === "healthy" ? "is-up" : "is-down"}>{data?.monitoring.status.toUpperCase()}</b></div><div><span>Successful routes</span><b>{data?.monitoring.successfulRequests}</b></div><div><span>Failed requests</span><b>{data?.monitoring.failedRequests}</b></div></div>
                <p className="dashboard-chart-note">Last successful collection / {data?.monitoring.lastSuccessfulCollection ? new Date(data.monitoring.lastSuccessfulCollection).toLocaleTimeString() : "none recorded"}. API request status is scoped to this snapshot.</p>
              </div>
            </section>

            <section className="dashboard-content-grid dashboard-content-grid-wide">
              <div className="dashboard-panel glass-card transparency-panel"><div className="dashboard-panel-head"><div><p className="dashboard-kicker">Source transparency</p><h2>What feeds the index</h2></div><ArrowUpRight size={16} /></div><div className="source-tree"><span>Data sources</span><b>├── Airline sources <small>not connected</small></b><b>├── OTA sources <small>not connected</small></b><b>└── API sources <small>{data?.sourceLabels.join(" · ")}</small></b></div><div className="transparency-meta"><span>Collected / {data ? new Date(data.fetchedAt).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span><span>Environment / {data?.environment}</span><span>Currency / {data?.currency}</span></div></div>
              <div className="dashboard-panel glass-card methodology-panel"><div className="dashboard-panel-head"><div><p className="dashboard-kicker">Methodology / CPI relevance</p><h2>How to read AEROVA</h2></div><BarChart3 size={16} /></div><p>{data?.cpiNote}</p><p className="methodology-small">Current observation basis: {data?.indexBasis}</p><div className="forecast-note"><TrendingUp size={15} /><span>{data?.forecast.status === "available" ? <><b>7-day projection</b> / index {data.forecast.projectedIndex} ({formatSigned(data.forecast.movementPercent ?? 0)} from latest). {data.forecast.method}</> : <><b>Forecast gated</b> / {data?.forecast.method} Current history: {data?.history.length ?? 0} snapshots.</>}</span></div></div>
            </section>

            {data?.errors.length ? <div className="dashboard-warning"><ShieldCheck size={14} /> Partial snapshot — {data.errors.length} request or persistence warning{data.errors.length > 1 ? "s" : ""}. Values above reflect available data only.</div> : null}
          </>
        )}
      </main>
    </div>
  );
}
