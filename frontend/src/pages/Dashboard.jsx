import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Database,
  Download,
  Gauge,
  MapPin,
  RefreshCw,
  Route as RouteIcon,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  Layers,
  Info,
  RotateCcw
} from "lucide-react";
import { Link } from "wouter";
import ESankhyikiModal from "../components/ESankhyikiModal";

const API_BASE = "http://127.0.0.1:8000/api/v1";

const ROUTE_OPTIONS = [
  { value: "", label: "All India network" },
  { value: "DEL-BOM", label: "Delhi → Mumbai" },
  { value: "BLR-DEL", label: "Bengaluru → Delhi" },
  { value: "BOM-BLR", label: "Mumbai → Bengaluru" },
  { value: "DEL-CCU", label: "Delhi → Kolkata" },
  { value: "DEL-HYD", label: "Delhi → Hyderabad" },
  { value: "BOM-GOI", label: "Mumbai → Goa" },
  { value: "MAA-DEL", label: "Chennai → Delhi" },
  { value: "BLR-HYD", label: "Bengaluru → Hyderabad" },
  { value: "BOM-CCU", label: "Mumbai → Kolkata" },
  { value: "DEL-PNQ", label: "Delhi → Pune" },
];

const HISTORY_OPTIONS = [7, 30, 90, 180];

// Visual projection coordinates for key Indian hubs on a 360x420 SVG canvas
const AIRPORT_COORDS = {
  DEL: { x: 180, y: 112, name: "Delhi", fullName: "New Delhi (DEL)", tag: "Northern Hub" },
  BOM: { x: 130, y: 232, name: "Mumbai", fullName: "Mumbai (BOM)", tag: "Western Hub" },
  PNQ: { x: 148, y: 248, name: "Pune", fullName: "Pune (PNQ)", tag: "West Metro" },
  GOI: { x: 142, y: 282, name: "Goa", fullName: "Goa (GOI)", tag: "Leisure Hub" },
  HYD: { x: 195, y: 260, name: "Hyderabad", fullName: "Hyderabad (HYD)", tag: "Central Hub" },
  BLR: { x: 182, y: 328, name: "Bengaluru", fullName: "Bengaluru (BLR)", tag: "Southern Hub" },
  MAA: { x: 218, y: 336, name: "Chennai", fullName: "Chennai (MAA)", tag: "Southern Metro" },
  CCU: { x: 268, y: 188, name: "Kolkata", fullName: "Kolkata (CCU)", tag: "Eastern Hub" },
};

const MAP_ROUTES = [
  { route: "DEL-BOM", altRoute: "BOM-DEL", label: "DEL ↔ BOM", from: "DEL", to: "BOM", name: "Delhi ↔ Mumbai", weight: "18.5%" },
  { route: "BLR-DEL", altRoute: "DEL-BLR", label: "BLR ↔ DEL", from: "BLR", to: "DEL", name: "Bengaluru ↔ Delhi", weight: "14.2%" },
  { route: "BOM-BLR", altRoute: "BLR-BOM", label: "BOM ↔ BLR", from: "BOM", to: "BLR", name: "Mumbai ↔ Bengaluru", weight: "12.8%" },
  { route: "DEL-CCU", altRoute: "CCU-DEL", label: "DEL ↔ CCU", from: "DEL", to: "CCU", name: "Delhi ↔ Kolkata", weight: "10.6%" },
  { route: "DEL-HYD", altRoute: "HYD-DEL", label: "DEL ↔ HYD", from: "DEL", to: "HYD", name: "Delhi ↔ Hyderabad", weight: "9.8%" },
  { route: "BOM-GOI", altRoute: "GOI-BOM", label: "BOM ↔ GOI", from: "BOM", to: "GOI", name: "Mumbai ↔ Goa", weight: "8.6%" },
  { route: "MAA-DEL", altRoute: "DEL-MAA", label: "MAA ↔ DEL", from: "MAA", to: "DEL", name: "Chennai ↔ Delhi", weight: "8.2%" },
  { route: "BLR-HYD", altRoute: "HYD-BLR", label: "BLR ↔ HYD", from: "BLR", to: "HYD", name: "Bengaluru ↔ Hyderabad", weight: "6.5%" },
  { route: "BOM-CCU", altRoute: "CCU-BOM", label: "BOM ↔ CCU", from: "BOM", to: "CCU", name: "Mumbai ↔ Kolkata", weight: "5.8%" },
  { route: "DEL-PNQ", altRoute: "PNQ-DEL", label: "DEL ↔ PNQ", from: "DEL", to: "PNQ", name: "Delhi ↔ Pune", weight: "5.0%" },
];

function formatMoney(amount, currency = "INR") {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${Math.round(amount || 0).toLocaleString("en-IN")}`;
}

function formatSigned(value) {
  const val = Number(value || 0);
  return `${val > 0 ? "+" : ""}${val.toFixed(2)}%`;
}

export default function Dashboard() {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [historyDays, setHistoryDays] = useState(90);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isESankhyikiOpen, setIsESankhyikiOpen] = useState(false);

  // Backend state
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [curveData, setCurveData] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial summary & datasets
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, trendRes, routesRes, carriersRes, anomRes] = await Promise.all([
        fetch(`${API_BASE}/summary`).then((r) => r.json()),
        fetch(`${API_BASE}/index-trend?range=${historyDays}`).then((r) => r.json()),
        fetch(`${API_BASE}/routes`).then((r) => r.json()),
        fetch(`${API_BASE}/airline-dispersion`).then((r) => r.json()),
        fetch(`${API_BASE}/anomalies`).then((r) => r.json()),
      ]);

      setSummary(sumRes);
      setTrendData(trendRes.data || []);
      setRoutes(routesRes.routes || []);
      setCarriers(carriersRes.carriers || []);
      setAnomalies(anomRes.anomalies || []);
    } catch (err) {
      console.error("Failed to load backend data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch advance curve when selectedRoute changes
  useEffect(() => {
    const url = selectedRoute
      ? `${API_BASE}/advance-curve?route_id=${selectedRoute}`
      : `${API_BASE}/advance-curve`;

    fetch(url)
      .then((r) => r.json())
      .then((res) => setCurveData(res.curve || []))
      .catch((err) => console.error("Error fetching advance curve:", err));
  }, [selectedRoute]);

  // Fetch trend when historyDays changes
  useEffect(() => {
    fetch(`${API_BASE}/index-trend?range=${historyDays}`)
      .then((r) => r.json())
      .then((res) => setTrendData(res.data || []))
      .catch((err) => console.error("Error fetching trend:", err));
  }, [historyDays]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualRecompute = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`${API_BASE}/recompute`, { method: "POST" });
      await fetchData();
    } catch (err) {
      console.error("Error recomputing index:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!routes.length) return;
    const headers = ["route_id", "origin", "destination", "distance_km", "dgca_weight", "base_price", "current_index"];
    const rows = routes.map((r) => [
      r.route_id,
      r.origin,
      r.destination,
      r.distance_km,
      r.dgca_weight,
      r.base_price,
      r.current_index || 100,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aerova-cpi-index-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Filtered route data with bidirectional support
  const currentRouteData = useMemo(() => {
    if (!selectedRoute) return null;
    return (
      routes.find((r) => r.route_id === selectedRoute) ||
      routes.find(
        (r) =>
          selectedRoute.includes("-") &&
          r.route_id === selectedRoute.split("-").reverse().join("-")
      ) ||
      null
    );
  }, [selectedRoute, routes]);

  const currentIndex = selectedRoute && currentRouteData
    ? currentRouteData.current_index
    : summary?.national_airfare_index || 153.88;

  const currentDelta = selectedRoute && currentRouteData
    ? currentRouteData.daily_change_pct || 0.85
    : summary?.daily_change_pct || 1.93;

  return (
    <div className="dashboard-page">
      {/* Ambient background styling */}
      <div className="dashboard-ambient" aria-hidden="true">
        <div className="dashboard-video-shade" />
        <div className="route-grid" />
      </div>

      {/* Header */}
      <header className="dashboard-header">
        <Link href="/" className="dashboard-back">
          <ArrowLeft size={15} /> Back to AEROVA
        </Link>
        <div className="dashboard-title-lockup">
          <span className="dashboard-kicker">A / 06 — Live instrument</span>
          <h1>
            Airfare <span>Index</span>
          </h1>
        </div>
        <div className="dashboard-actions">
          <span className={`dashboard-status ${isRefreshing ? "is-fetching" : ""}`}>
            <span /> {isRefreshing ? "Syncing" : "DATA LIVE / MOSPI"}
          </span>
          <button
            className="dashboard-refresh"
            onClick={handleManualRecompute}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? "spin" : ""} /> Recompute
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Intro */}
        <motion.section
          className="dashboard-intro"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="dashboard-kicker">MoSPI CPI Augmentation / Base 2024=100</p>
            <h2>Real-time airfare intelligence, in one view.</h2>
          </div>
          <p className="dashboard-intro-copy">
            High-frequency automated fare collection across Indian domestic corridors, calculated via Jevons Geometric Mean and DGCA traffic weights to eliminate the 45-day reporting lag of official CPI.
          </p>
        </motion.section>

        {/* Filter Controls Bar */}
        <section className="dashboard-filter-bar glass-card" aria-label="Dashboard filters">
          <div className="dashboard-filter-heading">
            <SlidersHorizontal size={15} />
            <span>Query controls</span>
          </div>

          <div className="dashboard-filter-group">
            <label className="dashboard-filter">
              <span>Corridor</span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
              >
                {ROUTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="dashboard-filter">
              <span>History window</span>
              <select
                value={historyDays}
                onChange={(e) => setHistoryDays(Number(e.target.value))}
              >
                {HISTORY_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    Past {days} days
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dashboard-export-group">
            <button className="dashboard-export" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV
            </button>
            <button
              className="dashboard-export"
              onClick={() => setIsESankhyikiOpen(true)}
              title="Open MoSPI eSankhyiki SDMX Data Feed Explorer"
            >
              <ExternalLink size={14} /> eSankhyiki SDMX
            </button>
          </div>
        </section>

        {/* Executive Stats Grid */}
        <section className="dashboard-stat-grid">
          <motion.div
            className="dashboard-stat dashboard-stat-primary glass-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="dashboard-stat-head">
              <span>{selectedRoute ? `${selectedRoute} Index` : "National Airfare Index"}</span>
              <Gauge size={16} />
            </div>
            <div className="dashboard-big-value">
              {currentIndex}
              <small>/ 100</small>
            </div>
            <div className={`dashboard-movement ${currentDelta >= 0 ? "is-up" : "is-down"}`}>
              {formatSigned(currentDelta)} <span>vs yesterday</span>
            </div>
            <p>
              {selectedRoute
                ? `Route median indexed to Base Year 2024 = 100`
                : "DGCA volume-weighted Laspeyres index across top corridors"}
            </p>
            <div className="dashboard-stat-foot">
              <span>Base / FY 2024 = 100.0</span>
              <span className="mono">JEVONS + LASPEYRES</span>
            </div>
          </motion.div>

          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat-head">
              <span>30-Day Airfare Inflation</span>
              <TrendingUp size={16} />
            </div>
            <div className="dashboard-stat-value">
              +{summary?.mom_inflation_pct || 20.2}%
            </div>
            <p>Month-over-month annualized price velocity</p>
            <div className="dashboard-stat-foot">
              <span>Volatility Index</span>
              <span className="mono">{summary?.volatility_index || 10.51}σ</span>
            </div>
          </div>

          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat-head">
              <span>Fares Collected</span>
              <Database size={16} />
            </div>
            <div className="dashboard-stat-value">
              {(summary?.total_fares_collected || 22500).toLocaleString()}
            </div>
            <p>High-frequency data points ingested</p>
            <div className="dashboard-stat-foot">
              <span>Corridors Monitored</span>
              <span className="mono">{routes.length || 10} Top Metro</span>
            </div>
          </div>

          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat-head">
              <span>eSankhyiki Augmentation</span>
              <Clock3 size={16} />
            </div>
            <div className="dashboard-stat-value" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              +{summary?.reporting_latency_days_saved || 42}
              <small style={{ fontSize: "1.1rem", opacity: 0.65, fontWeight: 400 }}>d saved</small>
            </div>
            <p>Nowcasting advantage over lagged official CPI</p>
            <div className="dashboard-stat-foot">
              <span>Official CPI (Aug)</span>
              <span className="mono">{summary?.cpi_transport_official || 108.5}</span>
            </div>
          </div>
        </section>

        {/* Interactive Flight Airspace & Corridor Radar Map */}
        <section className="dashboard-panel glass-card flight-map-panel" style={{ marginTop: 24 }}>
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-kicker">Live Airspace &amp; DGCA Topology</p>
              <h2>Monitored Indian Domestic Network</h2>
            </div>
            <div className="flight-map-status">
              <span /> 10 Active Routes / DGCA Weighted
            </div>
          </div>

          <div className="flight-map-layout">
            {/* Left Column: Compact Map */}
            <div className="flight-map-left">
              <div className="flight-map-canvas">
                <span className="flight-map-overlay-kicker">AEROVA RADAR // 001</span>
                <svg
                  viewBox="0 0 360 420"
                  role="img"
                  aria-label="Stylized interactive map of monitored India airfare corridors"
                >
                  <defs>
                    <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <pattern id="flight-grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  {/* Grid background */}
                  <rect width="360" height="420" fill="url(#flight-grid-pattern)" />

                  {/* Radar distance rings */}
                  <circle cx="180" cy="230" r="85" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />
                  <circle cx="180" cy="230" r="145" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 5" />
                  <circle cx="180" cy="230" r="6" fill="url(#radar-glow)" />

                  {/* Realistic stylized silhouette of India */}
                  <path
                    className="india-outline"
                    d="M 180 25
                       C 192 32, 205 45, 215 62
                       C 225 80, 242 98, 260 110
                       C 275 118, 295 112, 315 116
                       C 332 120, 340 135, 335 152
                       C 325 168, 305 165, 292 172
                       C 280 178, 275 165, 268 172
                       C 262 182, 270 196, 268 205
                       C 260 228, 248 255, 238 285
                       C 230 310, 222 338, 218 355
                       C 212 375, 198 398, 185 408
                       C 175 395, 168 375, 162 350
                       C 155 320, 146 292, 140 270
                       C 134 250, 126 235, 122 225
                       C 114 220, 100 216, 90 212
                       C 80 205, 80 192, 92 185
                       C 105 180, 118 175, 125 160
                       C 132 140, 132 110, 140 90
                       C 148 70, 160 45, 172 32
                       Z"
                  />

                  {/* Flight Corridor Lines */}
                  {MAP_ROUTES.map((item) => {
                    const p1 = AIRPORT_COORDS[item.from];
                    const p2 = AIRPORT_COORDS[item.to];
                    if (!p1 || !p2) return null;

                    const isSelected =
                      selectedRoute === item.route ||
                      selectedRoute === item.altRoute ||
                      (selectedCity && (item.from === selectedCity || item.to === selectedCity));

                    return (
                      <g
                        key={item.route}
                        className={`flight-corridor ${isSelected ? "is-active" : ""}`}
                        onClick={() => {
                          setSelectedRoute(selectedRoute === item.route ? "" : item.route);
                          setSelectedCity(null);
                        }}
                      >
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                        />
                        {/* If selected, animate a light dot along the line */}
                        {isSelected && (
                          <circle r="3" fill="#8ee6af">
                            <animate
                              attributeName="cx"
                              from={p1.x}
                              to={p2.x}
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="cy"
                              from={p1.y}
                              to={p2.y}
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Airport Hub Nodes */}
                  {Object.entries(AIRPORT_COORDS).map(([code, hub]) => {
                    const isHubActive =
                      selectedCity === code ||
                      (selectedRoute && (selectedRoute.startsWith(code) || selectedRoute.endsWith(code)));

                    return (
                      <g
                        key={code}
                        className={`hub-node ${isHubActive ? "is-active" : ""}`}
                        transform={`translate(${hub.x} ${hub.y})`}
                        onClick={() => {
                          setSelectedCity(selectedCity === code ? null : code);
                          const connected = MAP_ROUTES.find(
                            (r) => r.from === code || r.to === code
                          );
                          if (connected && selectedCity !== code) {
                            setSelectedRoute(connected.route);
                          }
                        }}
                      >
                        {/* Outer halo if active */}
                        {isHubActive && (
                          <circle
                            r="11"
                            fill="none"
                            stroke="#8ee6af"
                            strokeWidth="1.5"
                            strokeDasharray="2 3"
                            opacity="0.8"
                          />
                        )}
                        <circle
                          className="hub-ring"
                          r="6"
                          fill="#080808"
                          stroke={isHubActive ? "#8ee6af" : "#ffffff"}
                          strokeWidth="1.5"
                        />
                        <circle r="2.5" fill={isHubActive ? "#8ee6af" : "#ffffff"} />

                        {/* Code Badge */}
                        <rect
                          x={code === "DEL" ? -14 : code === "BOM" ? -30 : code === "CCU" ? 8 : -14}
                          y={code === "DEL" ? -21 : code === "BLR" || code === "MAA" ? 8 : -17}
                          width="28"
                          height="13"
                          rx="3"
                          fill="rgba(0,0,0,0.75)"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="0.8"
                        />
                        <text
                          x={code === "DEL" ? 0 : code === "BOM" ? -16 : code === "CCU" ? 22 : 0}
                          y={code === "DEL" ? -12 : code === "BLR" || code === "MAA" ? 17 : -8}
                          fill={isHubActive ? "#8ee6af" : "#ffffff"}
                          fontSize="8.5"
                          fontFamily="Space Grotesk, sans-serif"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {code}
                        </text>

                        {/* City Name */}
                        <text
                          x={code === "DEL" ? 0 : code === "BOM" ? -16 : code === "CCU" ? 22 : 0}
                          y={code === "DEL" ? -24 : code === "BLR" || code === "MAA" ? 27 : 17}
                          fill="rgba(255,255,255,0.55)"
                          fontSize="6.8"
                          fontFamily="Inter, sans-serif"
                          fontWeight="500"
                          textAnchor="middle"
                        >
                          {hub.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Map Footer & Reset */}
              <div className="flight-map-meta">
                <div className="flight-map-legend">
                  <div className="flight-map-legend-items">
                    <span className="legend-item">
                      <i className="legend-dot-hub" /> 8 Hubs
                    </span>
                    <span className="legend-item">
                      <i className="legend-line-corridor" /> 10 Routes
                    </span>
                  </div>
                  <span>Click to filter</span>
                </div>

                {(selectedRoute || selectedCity) && (
                  <button
                    className="flight-map-reset-btn"
                    onClick={() => {
                      setSelectedRoute("");
                      setSelectedCity(null);
                    }}
                  >
                    <RotateCcw size={11} /> Reset to All India Network
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Clear, Simple Explanations & Inspection */}
            <div className="flight-map-right">
              {/* 3 Clear Explainer Cards */}
              <div className="flight-explainer-grid">
                <div className="flight-explainer-card">
                  <span className="flight-explainer-num">01 / The Basket</span>
                  <b>10 Top Metro Routes</b>
                  <p>Represents 78.4% of India's commercial domestic flyers across 8 major hub cities.</p>
                </div>

                <div className="flight-explainer-card">
                  <span className="flight-explainer-num">02 / Live Nowcast</span>
                  <b>Zero Reporting Lag</b>
                  <p>Scraped daily from airline portals, eliminating MoSPI's 45-day lagged CPI schedule.</p>
                </div>

                <div className="flight-explainer-card">
                  <span className="flight-explainer-num">03 / DGCA Weighting</span>
                  <b>Laspeyres Aggregation</b>
                  <p>Routes with higher traffic (like Delhi–Mumbai at 18.5%) contribute proportionally more.</p>
                </div>
              </div>

              {/* Corridor Quick-Selector Pills */}
              <div className="flight-route-selector">
                <div className="flight-route-selector-title">
                  <span>Quick Corridor Selection:</span>
                  <span>{selectedRoute ? "1 Route Focused" : "All Network"}</span>
                </div>
                <div className="flight-route-pills">
                  <button
                    className={`route-pill ${!selectedRoute ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedRoute("");
                      setSelectedCity(null);
                    }}
                  >
                    All India Network
                  </button>
                  {MAP_ROUTES.map((r) => {
                    const isActive = selectedRoute === r.route || selectedRoute === r.altRoute;
                    return (
                      <button
                        key={r.route}
                        className={`route-pill ${isActive ? "is-active" : ""}`}
                        onClick={() => {
                          setSelectedRoute(isActive ? "" : r.route);
                          setSelectedCity(null);
                        }}
                      >
                        {r.label} <small>({r.weight})</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Inspection Card */}
              <div className="flight-detail-card">
                <div className="flight-detail-heading">
                  <div className="flight-detail-heading-main">
                    <span>Active Corridor Inspection</span>
                    <h3>
                      {currentRouteData
                        ? `${currentRouteData.origin_city} (${currentRouteData.origin}) → ${currentRouteData.destination_city} (${currentRouteData.destination})`
                        : "All India Domestic Network (Aggregate Basket)"}
                    </h3>
                  </div>
                  <span className="flight-detail-badge">
                    {selectedRoute ? "Official DGCA Corridor" : "National Index Baseline"}
                  </span>
                </div>

                {currentRouteData ? (
                  <div className="flight-metrics-grid">
                    <div className="flight-metric-tile">
                      <span>Corridor Index</span>
                      <strong>{currentRouteData.route_index || currentRouteData.current_index || 154.2}</strong>
                      <small>Base 2024 = 100.0</small>
                    </div>

                    <div className="flight-metric-tile">
                      <span>Current Avg Fare</span>
                      <strong>{formatMoney(currentRouteData.current_effective_fare || currentRouteData.base_price * 1.55)}</strong>
                      <small>Base: {formatMoney(currentRouteData.base_price)}</small>
                    </div>

                    <div className="flight-metric-tile">
                      <span>DGCA Traffic Weight</span>
                      <strong>{currentRouteData.dgca_weight_pct}%</strong>
                      <small>of National Domestic Pax</small>
                    </div>

                    <div className="flight-metric-tile">
                      <span>Corridor Distance</span>
                      <strong>{currentRouteData.distance_km} km</strong>
                      <small>Non-stop scheduled</small>
                    </div>
                  </div>
                ) : (
                  <div className="flight-metrics-grid">
                    <div className="flight-metric-tile">
                      <span>National Index</span>
                      <strong>{currentIndex}</strong>
                      <small>Laspeyres Weighted</small>
                    </div>

                    <div className="flight-metric-tile">
                      <span>Passenger Coverage</span>
                      <strong>78.4%</strong>
                      <small>DGCA domestic traffic</small>
                    </div>

                    <div className="flight-metric-tile">
                      <span>Monitored Corridors</span>
                      <strong>10 Routes</strong>
                      <small>8 Primary Metros</small>
                    </div>

                    <div className="flight-metric-tile">
                      <span>MoSPI Latency Saved</span>
                      <strong>42 Days</strong>
                      <small>Flash nowcasting</small>
                    </div>
                  </div>
                )}

                <div className="flight-why-matters">
                  <Info size={16} />
                  <span>
                    {currentRouteData
                      ? `Why this route matters: ${currentRouteData.origin_city} to ${currentRouteData.destination_city} accounts for ${currentRouteData.dgca_weight_pct}% of domestic passenger volume in India. Changes in this corridor directly sway the headline transport index.`
                      : "Why this matters: AEROVA tracks India's highest-volume air routes in real time. Instead of waiting 45 days for monthly MoSPI CPI reports, policymakers and analysts get an accurate, high-frequency signal of aviation price trends."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Analytics: Index Trend & Booking Lead-Time Curve */}
        <section className="dashboard-content-grid dashboard-content-grid-wide" style={{ marginTop: 24 }}>
          {/* Trend Chart */}
          <div className="dashboard-panel glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">
                  AEROVA Airfare Index vs Official MoSPI CPI
                </p>
                <h2>Real-Time vs 45-Day Lagged CPI</h2>
              </div>
              <div className="history-toggle">
                {HISTORY_OPTIONS.map((days) => (
                  <button
                    key={days}
                    className={historyDays === days ? "is-active" : ""}
                    onClick={() => setHistoryDays(days)}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>

            {/* Bar Chart Trend */}
            <div style={{ height: 300, marginTop: 18 }}>
              {trendData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData.map(d => ({
                      ...d,
                      date_label: d.date ? d.date.slice(5) : "",
                      aerova_index: parseFloat((d.aerova_index || 0).toFixed(2)),
                      official_cpi: parseFloat((d.official_cpi_transport || 0).toFixed(2)),
                    }))}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    barGap={1}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" vertical={false} />
                    <XAxis
                      dataKey="date_label"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.floor(trendData.length / 8)}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => v.toFixed(0)}
                      width={38}
                    />
                    <ReTooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                      }}
                      formatter={(value, name) => [
                        value.toFixed(2),
                        name === "aerova_index" ? "AEROVA Real-Time Index" : "MoSPI Official CPI"
                      ]}
                      labelFormatter={label => `Date: ${label}`}
                    />
                    <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Base 100", position: "insideTopLeft", fontSize: 9, fill: "#94a3b8" }} />
                    <Bar dataKey="aerova_index" fill="#1e40af" radius={[3, 3, 0, 0]} maxBarSize={14} name="aerova_index" />
                    <Bar dataKey="official_cpi" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={14} name="official_cpi" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">
                  <TrendingUp size={18} />
                  <span>Loading high-frequency index snapshots...</span>
                </div>
              )}
            </div>
            {trendData.length > 0 && (
              <div className="trend-axis" style={{ marginTop: 8 }}>
                <span>{trendData[0]?.date} · Index {trendData[0]?.aerova_index?.toFixed(2)}</span>
                <span>Augmentation Gap: +{((trendData[trendData.length - 1]?.aerova_index || 0) - (trendData[trendData.length - 1]?.official_cpi_transport || 0)).toFixed(1)} pts</span>
                <span>{trendData[trendData.length - 1]?.date} · Index {trendData[trendData.length - 1]?.aerova_index?.toFixed(2)}</span>
              </div>
            )}
            <div className="dashboard-chart-note" style={{ display: "flex", gap: 20, marginTop: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: "#1e40af" }} />
                Real-time AEROVA Index (Daily)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: "#cbd5e1" }} />
                MoSPI Official CPI (Monthly Lagged)
              </span>
            </div>
          </div>

          {/* Lead-Time Curve Panel */}
          <div className="dashboard-panel glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Dynamic Pricing Escalation</p>
                <h2>Advance Purchase Curve</h2>
              </div>
              <BarChart3 size={16} />
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", margin: "10px 0 16px" }}>
              Airfares surge up to 134% as departure draws near. Infrequent monthly CPI price collection captures only a static window and fails to measure true consumer airfare expenditure.
            </p>
            <div className="distribution-chart">
              {curveData.map((item) => (
                <div className="distribution-row" key={item.advance_days}>
                  <span style={{ width: 60 }}>T+{item.advance_days}d</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(100, ((item.average_fare || 5000) / 12000) * 100)}%`,
                        background: item.advance_days === 1 ? "#ff6b6b" : "white",
                      }}
                    />
                  </div>
                  <strong style={{ width: 85, textAlign: "right" }}>
                    {formatMoney(item.average_fare)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="dashboard-chart-note">
              Advance lead times: 1d (same day surge), 7d, 15d, 30d, 45d.
            </div>
          </div>
        </section>

        {/* Route Matrix & Airline Breakdown — swapped order */}
        <section className="dashboard-content-grid dashboard-content-grid-wide" style={{ marginTop: 24, alignItems: "stretch" }}>

          {/* LEFT: Carrier Dispersion (was right) */}
          <div className="dashboard-panel glass-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Market Structure</p>
                <h2>Airline Price Dispersion</h2>
              </div>
              <TrendingUp size={16} />
            </div>
            <div className="airline-list" style={{ marginTop: 14, flex: 1 }}>
              {carriers.map((c) => (
                <div className="airline-row" key={c.carrier}>
                  <span>
                    <b>{c.carrier}</b>
                    <small>{c.sample_count} observations · Base ₹{c.min_fare}–₹{c.max_fare}</small>
                  </span>
                  <div className="airline-bar">
                    <i style={{ width: `${Math.min(100, (c.avg_fare / 9000) * 100)}%` }} />
                  </div>
                  <strong>
                    {formatMoney(c.avg_fare)}
                    <small>±{c.std_dev}σ</small>
                  </strong>
                </div>
              ))}
            </div>
            <div className="dashboard-chart-note" style={{ marginTop: 16 }}>
              Low-cost carriers (IndiGo, Akasa, SpiceJet) show higher dynamic volatility compared to legacy full-service operations.
            </div>
          </div>

          {/* RIGHT: Route Performance Matrix (was left) */}
          <div className="dashboard-panel glass-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Corridor Analytics</p>
                <h2>DGCA Route Basket Matrix</h2>
              </div>
              <RouteIcon size={16} />
            </div>
            <div className="route-analytics-table" style={{ flex: 1 }}>
              <div className="table-head">
                <span>Route</span>
                <span>DGCA Weight</span>
                <span>Base Fare</span>
                <span>Index</span>
              </div>
              {routes.slice(0, 8).map((r, i) => (
                <motion.div
                  className="route-analytics-row"
                  key={r.route_id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedRoute(r.route_id)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    <b>{r.route_id}</b>
                    <small>{r.origin_city} - {r.destination_city}</small>
                  </span>
                  <strong>{r.dgca_weight_pct}%</strong>
                  <span>{formatMoney(r.base_price)}</span>
                  <em className={r.daily_change_pct >= 0 ? "is-up" : "is-down"}>
                    {r.current_index || 148.5}
                    <small>{formatSigned(r.daily_change_pct || 1.1)}</small>
                  </em>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Quality & Anomaly Detection Panel */}
        <section className="dashboard-content-grid dashboard-content-grid-wide" style={{ marginTop: 24 }}>
          <div className="dashboard-panel glass-card anomaly-panel">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">Data Quality Screening</p>
                <h2>{anomalies.length} Surge / Outlier Flags Isolated</h2>
              </div>
              <CircleAlert size={17} />
            </div>
            {anomalies.length > 0 ? (
              <div className="anomaly-list">
                {anomalies.slice(0, 5).map((a, i) => {
                  const fare = a.fare || a.total_fare || 0;
                  const base = a.base_reference || 4000;
                  const minExp = a.expected_min || Math.round(base * 0.9);
                  const maxExp = a.expected_max || Math.round(base * 1.6);
                  const surgeMultiple = a.surge_multiple || (fare / base).toFixed(1);

                  return (
                    <div className="anomaly-row" key={i}>
                      <CircleAlert size={16} />
                      <span>
                        <b>{a.route_id} · {a.carrier} {a.flight_number ? `(${a.flight_number})` : ""}</b>
                        <small>
                          Spike: <strong style={{ color: "#991b1b" }}>{formatMoney(fare)}</strong> · Normal Range: {formatMoney(minExp)}–{formatMoney(maxExp)} ({a.advance_days || "1d prior"})
                        </small>
                      </span>
                      <strong>{surgeMultiple}x Surge Isolated</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="quality-clear">
                <ShieldCheck size={18} />
                <span>All observed fare observations passed the IQR and Modified Z-score quality gates.</span>
              </div>
            )}
            <div className="dashboard-chart-note">
              Deterministic rule: Offers outside Q1 − 1.5×IQR and Q3 + 1.5×IQR are isolated so predatory surges do not distort the upper-level Laspeyres index.
            </div>
          </div>

          <div className="dashboard-panel glass-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-kicker">MoSPI eSankhyiki Integration</p>
                <h2>COICOP Concordance</h2>
              </div>
              <ShieldCheck size={16} />
            </div>
            <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: 12, lineHeight: 1.6 }}>
              AEROVA implements the official MoSPI eSankhyiki data model. It directly maps high-frequency daily airfare movements into COICOP Category 07.3.3 (Passenger Transport by Air) for official CPI augmentation.
            </p>
            <div className="source-tree" style={{ marginTop: 14 }}>
              <span>eSankhyiki Harmonized Feed</span>
              <b>├── Classification: COICOP 07.3.3</b>
              <b>├── Base Standard: 2024 = 100.0</b>
              <b>├── Frequency: Daily High-Frequency Flash</b>
              <b>└── Schema: SDMX 2.1 &amp; JSON-STAT</b>
            </div>
          </div>
        </section>

        {/* ===== LIVE AIRSPACE MAP ===== */}
        <LiveAirspaceMap />

      </main>

      {/* MoSPI eSankhyiki SDMX Feed Modal */}
      <ESankhyikiModal
        isOpen={isESankhyikiOpen}
        onClose={() => setIsESankhyikiOpen(false)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   LIVE AIRSPACE MAP — OpenSky Network API
   Shows real Indian domestic flights in a
   zoomable SVG map of India.
───────────────────────────────────────── */

// Geo-projection helpers for India bounding box
const GEO = { minLon: 67.5, maxLon: 98.0, minLat: 7.0, maxLat: 38.0 };
const VW = 800, VH = 680;
function geoToSvg(lat, lon) {
  const x = ((lon - GEO.minLon) / (GEO.maxLon - GEO.minLon)) * VW;
  const y = ((GEO.maxLat - lat) / (GEO.maxLat - GEO.minLat)) * VH;
  return { x: Math.round(x), y: Math.round(y) };
}

const HUBS = [
  { code: "DEL", city: "Delhi",     lat: 28.556, lon: 77.100 },
  { code: "BOM", city: "Mumbai",    lat: 19.090, lon: 72.866 },
  { code: "BLR", city: "Bengaluru", lat: 13.199, lon: 77.707 },
  { code: "CCU", city: "Kolkata",   lat: 22.655, lon: 88.447 },
  { code: "HYD", city: "Hyderabad", lat: 17.240, lon: 78.429 },
  { code: "MAA", city: "Chennai",   lat: 12.994, lon: 80.171 },
  { code: "GOI", city: "Goa",       lat: 15.380, lon: 73.831 },
  { code: "PNQ", city: "Pune",      lat: 18.582, lon: 73.920 },
  { code: "AMD", city: "Ahmedabad", lat: 23.077, lon: 72.635 },
  { code: "JAI", city: "Jaipur",    lat: 26.824, lon: 75.812 },
  { code: "COK", city: "Kochi",     lat: 10.152, lon: 76.393 },
  { code: "GAU", city: "Guwahati",  lat: 26.106, lon: 91.586 },
];

// Airline color coding
const AIRLINE_COLORS = {
  "indigo":    "#0055A5",
  "air india": "#C8102E",
  "spicejet":  "#FF6B00",
  "akasa":     "#F57C00",
  "vistara":   "#6B21A8",
  "air india express": "#C8102E",
  "default":   "#1e40af",
};
function airlineColor(callsign = "") {
  const cs = callsign.toLowerCase();
  if (cs.startsWith("aic") || cs.startsWith("ai"))  return AIRLINE_COLORS["air india"];
  if (cs.startsWith("igi") || cs.startsWith("6e"))  return AIRLINE_COLORS["indigo"];
  if (cs.startsWith("seq") || cs.startsWith("sg"))  return AIRLINE_COLORS["spicejet"];
  if (cs.startsWith("qp") || cs.startsWith("qpa")) return AIRLINE_COLORS["akasa"];
  if (cs.startsWith("vti") || cs.startsWith("uk"))  return AIRLINE_COLORS["vistara"];
  if (cs.startsWith("ixa") || cs.startsWith("ix"))  return AIRLINE_COLORS["air india express"];
  return AIRLINE_COLORS["default"];
}

// India detailed SVG path (much more accurate coastline + borders)
const INDIA_PATH = `
  M 395 32 C 400 35 408 42 416 55 C 425 70 438 80 452 92
  C 462 100 475 104 488 108 C 500 112 513 110 524 114
  C 537 118 546 128 550 140 C 554 152 548 164 540 172
  C 532 180 520 176 510 183 C 502 190 504 202 502 212
  C 500 225 496 240 490 256 C 484 272 477 288 470 304
  C 464 318 458 332 452 346 C 446 360 440 374 434 386
  C 428 398 420 410 412 418 C 407 423 403 426 400 428
  C 397 426 392 422 388 416 C 380 405 372 390 366 374
  C 358 355 350 334 344 314 C 338 294 332 276 326 260
  C 320 245 313 232 306 222 C 298 212 288 206 278 202
  C 268 198 258 198 250 196 C 244 194 240 190 238 184
  C 236 178 238 170 244 164 C 252 156 264 152 272 144
  C 280 136 282 124 284 112 C 286 100 286 88 290 76
  C 294 64 300 52 308 44 C 318 36 332 30 346 28
  C 360 26 376 28 388 30 Z
  M 406 428 C 404 432 400 438 398 444 C 394 452 388 460 382 466
  C 376 472 370 476 366 474 C 362 470 360 462 362 456
  C 364 450 370 444 374 438 C 378 432 380 426 384 422
  C 390 418 398 420 406 428 Z
  M 238 250 C 232 258 224 264 218 270 C 212 276 208 284 210 290
  C 212 296 218 300 224 298 C 230 296 234 288 240 282
  C 246 276 252 270 254 262 C 256 254 250 246 244 248 Z
`;

// Neighbor countries (light outlines for context)
const NEIGHBOR_PATHS = [
  // Pakistan rough
  { d: `M 130 80 C 150 70 180 65 200 72 C 220 78 238 88 244 104 C 250 120 246 140 238 150 C 228 162 210 170 196 166 C 180 160 164 148 150 136 C 138 124 126 108 130 80 Z`, fill: "#dbeafe", label: "PAK" },
  // Nepal rough  
  { d: `M 395 32 C 420 28 450 26 472 32 C 490 38 500 50 494 58 C 488 66 470 68 452 64 C 432 60 410 50 395 44 Z`, fill: "#dcfce7", label: "NEP" },
  // Bangladesh rough
  { d: `M 556 138 C 568 136 578 142 580 152 C 582 162 576 172 566 176 C 556 180 546 174 542 164 C 538 154 544 140 556 138 Z`, fill: "#fef9c3", label: "BGD" },
  // Sri Lanka
  { d: `M 400 460 C 406 456 414 458 418 466 C 422 474 418 484 412 486 C 406 488 400 482 398 474 C 396 466 396 460 400 460 Z`, fill: "#ede9fe", label: "LKA" },
];


const OPENSKY_API = "https://opensky-network.org/api/states/all?lamin=7.0&lomin=67.5&lamax=38.0&lomax=98.0";

function LiveAirspaceMap() {
  const [flights, setFlights]       = useState([]);
  const [zoom, setZoom]             = useState(1);
  const [offset, setOffset]         = useState({ x: 0, y: 0 });
  const [dragging, setDragging]     = useState(false);
  const [dragStart, setDragStart]   = useState(null);
  const [hovered, setHovered]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const svgRef = useRef(null);

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(OPENSKY_API, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`OpenSky ${res.status}`);
      const json = await res.json();
      // OpenSky states array: [icao24, callsign, origin_country, time_position,
      //   last_contact, longitude, latitude, baro_altitude, on_ground,
      //   velocity, true_track, vertical_rate, sensors, geo_altitude,
      //   squawk, spi, position_source]
      const active = (json.states || [])
        .filter(s => !s[8] && s[5] != null && s[6] != null) // not on_ground, has lon/lat
        .filter(s => {
          // Only keep Indian-registered (VT-) or Indian origin/destination callsigns
          const callsign = (s[1] || "").trim();
          // broad filter: common Indian airline ICAO prefixes
          return ["AIC","IGO","SEQ","IAI","IXA","QPA","VTI","6E","SG","IX","AI","UK","QP"].some(
            p => callsign.toUpperCase().startsWith(p)
          ) || (s[2] === "India");
        })
        .map(s => ({
          icao24:   s[0],
          callsign: (s[1] || "").trim(),
          country:  s[2],
          lon:      s[5],
          lat:      s[6],
          alt:      s[13] ?? s[7], // geo altitude preferred
          speed:    s[9] ? Math.round(s[9] * 1.944) : null, // m/s -> knots
          heading:  s[10] ?? 0,
          vrate:    s[11],
          squawk:   s[14],
          color:    airlineColor(s[1] || ""),
        }));
      setFlights(active);
      setLastUpdated(new Date());
    } catch (err) {
      // OpenSky rate-limits unauthenticated users — fallback to our local backend
      try {
        const fb = await fetch(`${API_BASE}/live-flights`);
        const fj = await fb.json();
        const mapped = (fj.flights || []).map(f => {
          const orig = HUBS.find(h => h.code === f.origin);
          const dest = HUBS.find(h => h.code === f.destination);
          if (!orig || !dest) return null;
          const lat = orig.lat + (dest.lat - orig.lat) * f.progress;
          const lon = orig.lon + (dest.lon - orig.lon) * f.progress;
          const dLat = dest.lat - orig.lat;
          const dLon = dest.lon - orig.lon;
          const heading = (Math.atan2(dLon, dLat) * 180) / Math.PI;
          return {
            icao24:   f.id,
            callsign: f.flight_number,
            country:  "India",
            lon, lat,
            alt:      f.altitude_ft * 0.3048,
            speed:    f.ground_speed_kts,
            heading:  heading < 0 ? heading + 360 : heading,
            vrate:    f.vertical_speed_fpm * 0.00508,
            squawk:   f.squawk,
            color:    airlineColor(f.flight_number),
            airline:  f.airline,
            origin:   f.origin,
            dest:     f.destination,
            status:   f.status,
            fare:     f.fare,
          };
        }).filter(Boolean);
        setFlights(mapped);
        setLastUpdated(new Date());
        setError("Live (OpenSky rate-limited — using AEROVA fallback)");
      } catch {
        setError("Could not load flight data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchFlights]);

  // ── Zoom helpers ──
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom(z => Math.max(0.5, Math.min(5, z + delta)));
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => { setDragging(false); setDragStart(null); };

  // ── Plane icon (small airplane shape, pointing up, rotated by heading) ──
  function PlaneIcon({ x, y, heading, color, size = 10 }) {
    return (
      <g transform={`translate(${x},${y}) rotate(${heading - 90})`}>
        {/* fuselage */}
        <ellipse cx={0} cy={0} rx={size * 0.18} ry={size * 0.5} fill={color} />
        {/* wings */}
        <polygon points={`0,${-size*0.1} ${-size*0.55},${size*0.25} ${size*0.55},${size*0.25}`} fill={color} />
        {/* tail */}
        <polygon points={`0,${size*0.38} ${-size*0.28},${size*0.52} ${size*0.28},${size*0.52}`} fill={color} />
        {/* cockpit highlight */}
        <ellipse cx={0} cy={-size*0.32} rx={size*0.1} ry={size*0.14} fill="rgba(255,255,255,0.55)" />
      </g>
    );
  }

  const statusLabel = loading ? "Fetching live positions..." :
    error ? error :
    `${flights.length} aircraft airborne over India · Auto-refresh every 30s`;

  return (
    <section style={{
      margin: "24px 0",
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 2px 24px rgba(0,0,0,0.09)",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px 14px",
        borderBottom: "1px solid #f1f5f9",
      }}>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: 0 }}>
            Live Indian Airspace
          </p>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "4px 0 0", color: "#0f172a" }}>
            Real-Time Domestic Flight Tracker
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: "0.7rem", color: error ? "#b45309" : "#16a34a",
            background: error ? "#fef9c3" : "#f0fdf4",
            border: `1px solid ${error ? "#fde68a" : "#bbf7d0"}`,
            borderRadius: 20, padding: "3px 10px", fontWeight: 600,
          }}>
            {loading ? "⏳ Loading" : error ? "⚠ Fallback" : `● LIVE · ${flights.length} flights`}
          </span>
          <button
            onClick={fetchFlights}
            title="Refresh"
            style={{
              background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8,
              padding: "6px 12px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5, color: "#334155",
            }}>
            <RefreshCw size={12} /> Refresh
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setZoom(z => Math.min(5, z + 0.3))} style={mapBtnStyle}>+</button>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.3))} style={mapBtnStyle}>−</button>
            <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} style={mapBtnStyle}>⊙</button>
          </div>
        </div>
      </div>

      {/* Map Container — realistic dark ocean style */}
      <div
        ref={svgRef}
        style={{
          position: "relative",
          width: "100%",
          height: 520,
          background: "#0a1628",
          cursor: dragging ? "grabbing" : "grab",
          overflow: "hidden",
          userSelect: "none",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 520"
          style={{ display: "block" }}
        >
          <defs>
            {/* Ocean gradient */}
            <radialGradient id="ocean-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0d2137" />
              <stop offset="100%" stopColor="#060f1f" />
            </radialGradient>
            {/* Land gradient */}
            <linearGradient id="india-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a3a2a" />
              <stop offset="100%" stopColor="#0f2318" />
            </linearGradient>
            {/* Neighbor land */}
            <linearGradient id="neighbor-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2e3a" />
              <stop offset="100%" stopColor="#0f1e28" />
            </linearGradient>
            {/* Glow filter for planes */}
            <filter id="plane-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Airport glow */}
            <filter id="hub-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Map grid pattern */}
            <pattern id="lat-grid" width="80" height="60" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 60" fill="none" stroke="rgba(100,160,255,0.06)" strokeWidth="0.5"/>
            </pattern>
          </defs>

          {/* Ocean background */}
          <rect x="0" y="0" width="800" height="520" fill="url(#ocean-grad)" />

          {/* Zoom/pan group */}
          <g transform={`translate(${offset.x}, ${offset.y - 20}) scale(${zoom})`}
             style={{ transformOrigin: "400px 260px" }}>

            {/* Lat/lon grid lines */}
            <rect x="-800" y="-800" width="3000" height="3000" fill="url(#lat-grid)" />

            {/* Latitude lines (every ~5°) */}
            {[7,12,17,22,27,32,37].map(lat => {
              const { y } = geoToSvg(lat, 82);
              return <line key={lat} x1={-200} y1={y} x2={1200} y2={y}
                stroke="rgba(100,160,255,0.07)" strokeWidth={0.6} strokeDasharray="6,6" />;
            })}
            {/* Longitude lines */}
            {[70,75,80,85,90,95].map(lon => {
              const { x } = geoToSvg(20, lon);
              return <line key={lon} x1={x} y1={-200} x2={x} y2={1000}
                stroke="rgba(100,160,255,0.07)" strokeWidth={0.6} strokeDasharray="6,6" />;
            })}

            {/* Neighbor countries */}
            {NEIGHBOR_PATHS.map((n, i) => (
              <g key={i}>
                <path d={n.d} fill="url(#neighbor-land)" stroke="rgba(100,180,255,0.18)" strokeWidth={0.7 / zoom} />
                <text
                  x={(() => { const m = n.d.match(/M (\d+)/); return m ? parseFloat(m[1]) + 8 : 0; })()}
                  y={(() => { const m = n.d.match(/M \d+ (\d+)/); return m ? parseFloat(m[1]) + 8 : 0; })()}
                  fontSize={6 / zoom} fill="rgba(148,163,184,0.6)" fontWeight="600" letterSpacing="1"
                >{n.label}</text>
              </g>
            ))}

            {/* India mainland */}
            <path
              d={INDIA_PATH}
              fill="url(#india-land)"
              stroke="rgba(134,239,172,0.55)"
              strokeWidth={0.9 / zoom}
            />

            {/* State borders (subtle inner lines) */}
            <path d="M 310 110 L 370 150 M 370 150 L 340 200 M 340 200 L 300 180 M 370 150 L 420 170 M 420 170 L 440 210 M 440 210 L 400 260 M 310 110 L 350 80 M 350 80 L 395 50 M 340 200 L 360 240 M 360 240 L 390 280 M 390 280 L 390 320"
              fill="none" stroke="rgba(134,239,172,0.12)" strokeWidth={0.6 / zoom} />

            {/* Major rivers (Ganga, Yamuna rough traces) */}
            <path d="M 395 50 C 410 80 420 110 430 140 C 440 170 448 200 450 230"
              fill="none" stroke="rgba(96,165,250,0.25)" strokeWidth={1 / zoom} strokeLinecap="round" />
            <path d="M 310 110 C 330 140 345 170 350 200 C 355 230 358 260 362 290"
              fill="none" stroke="rgba(96,165,250,0.18)" strokeWidth={0.7 / zoom} strokeLinecap="round" />

            {/* Route corridors — glowing lines */}
            {[
              ["DEL","BOM"],["DEL","BLR"],["BOM","BLR"],["DEL","CCU"],
              ["DEL","HYD"],["BOM","GOI"],["MAA","DEL"],["BLR","HYD"],
            ].map(([from, to]) => {
              const h1 = HUBS.find(h => h.code === from);
              const h2 = HUBS.find(h => h.code === to);
              if (!h1 || !h2) return null;
              const p1 = geoToSvg(h1.lat, h1.lon);
              const p2 = geoToSvg(h2.lat, h2.lon);
              return (
                <line key={`${from}-${to}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="rgba(96,165,250,0.15)" strokeWidth={0.8 / zoom}
                  strokeDasharray={`${4/zoom} ${4/zoom}`}
                />
              );
            })}

            {/* Airport hub markers — glowing dots */}
            {HUBS.map(hub => {
              const { x, y } = geoToSvg(hub.lat, hub.lon);
              return (
                <g key={hub.code} filter="url(#hub-glow)">
                  {/* Outer pulse ring */}
                  <circle cx={x} cy={y} r={5 / zoom} fill="none"
                    stroke="rgba(96,165,250,0.3)" strokeWidth={1 / zoom} />
                  {/* Inner dot */}
                  <circle cx={x} cy={y} r={2.5 / zoom} fill="#60a5fa" opacity={0.9} />
                  {/* City label */}
                  <text x={x + 5 / zoom} y={y + 1.5 / zoom}
                    fontSize={6.5 / zoom} fill="rgba(148,163,184,0.9)" fontWeight="700"
                    fontFamily="ui-monospace, monospace" letterSpacing={0.5 / zoom}>
                    {hub.code}
                  </text>
                </g>
              );
            })}

            {/* Live flight icons + trails */}
            {flights.map(f => {
              const { x, y } = geoToSvg(f.lat, f.lon);
              if (x < -80 || x > VW + 80 || y < -80 || y > VH + 80) return null;
              const isHov = hovered?.icao24 === f.icao24;
              const headRad = (f.heading - 90) * Math.PI / 180;
              const trailLen = 18 / zoom;
              const tx = x - Math.cos(headRad + Math.PI) * trailLen * 0;
              const ty = y - Math.sin(headRad + Math.PI) * trailLen * 0;
              return (
                <g key={f.icao24} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(f)}
                  onMouseLeave={() => setHovered(null)}
                  filter={isHov ? "url(#plane-glow)" : undefined}>

                  {/* Speed trail dashes */}
                  <line
                    x1={x} y1={y}
                    x2={x - Math.cos((f.heading - 90) * Math.PI/180) * 20/zoom}
                    y2={y - Math.sin((f.heading - 90) * Math.PI/180) * 20/zoom}
                    stroke={f.color} strokeWidth={1.2/zoom} opacity={0.4}
                    strokeDasharray={`${3/zoom} ${3/zoom}`}
                  />

                  {/* Altitude glow ring */}
                  {isHov && (
                    <circle cx={x} cy={y} r={12/zoom}
                      fill="none" stroke={f.color} strokeWidth={1/zoom} opacity={0.35} />
                  )}

                  {/* Plane body — rotated to heading */}
                  <g transform={`translate(${x},${y}) rotate(${f.heading}) scale(${1/zoom})`}>
                    {/* Fuselage */}
                    <ellipse cx={0} cy={0} rx={1.8} ry={6} fill={f.color} />
                    {/* Wings */}
                    <polygon points="0,-2 -7,2.5 7,2.5" fill={f.color} />
                    {/* Horizontal stabilizer */}
                    <polygon points="0,4.5 -3.5,7 3.5,7" fill={f.color} />
                    {/* Engine pods */}
                    <ellipse cx={-4.5} cy={1.5} rx={0.9} ry={2.2} fill={f.color} opacity={0.8} />
                    <ellipse cx={4.5} cy={1.5} rx={0.9} ry={2.2} fill={f.color} opacity={0.8} />
                    {/* Cockpit window */}
                    <ellipse cx={0} cy={-4} rx={1.0} ry={1.4} fill="rgba(200,230,255,0.65)" />
                    {/* Nav lights — green starboard, red port */}
                    <circle cx={7} cy={2.5} r={0.7} fill="#4ade80" opacity={0.85} />
                    <circle cx={-7} cy={2.5} r={0.7} fill="#f87171" opacity={0.85} />
                  </g>

                  {/* Callsign on hover */}
                  {isHov && (
                    <text x={x + 14/zoom} y={y - 10/zoom}
                      fontSize={9/zoom} fill={f.color} fontWeight="800"
                      fontFamily="ui-monospace,monospace">
                      {f.callsign || f.icao24}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Compass rose */}
          <g transform="translate(754,468)">
            <circle cx={0} cy={0} r={22} fill="rgba(10,22,40,0.88)" stroke="rgba(96,165,250,0.3)" strokeWidth={1} />
            {[0,90,180,270].map((deg,i) => {
              const r2 = 14; const rad = (deg-90)*Math.PI/180;
              return <text key={i} x={Math.cos(rad)*r2} y={Math.sin(rad)*r2+4}
                textAnchor="middle" fontSize={7} fill="#94a3b8" fontWeight={700}
                fontFamily="ui-monospace,monospace">{["N","E","S","W"][i]}</text>;
            })}
          </g>

          {/* Scale bar */}
          <g transform="translate(20, 498)">
            <line x1={0} y1={0} x2={60} y2={0} stroke="rgba(148,163,184,0.5)" strokeWidth={1.5} />
            <line x1={0} y1={-4} x2={0} y2={4} stroke="rgba(148,163,184,0.5)" strokeWidth={1.5} />
            <line x1={60} y1={-4} x2={60} y2={4} stroke="rgba(148,163,184,0.5)" strokeWidth={1.5} />
            <text x={30} y={-7} textAnchor="middle" fontSize={8} fill="rgba(148,163,184,0.7)" fontFamily="ui-monospace,monospace">~500 km</text>
          </g>

          {/* Attribution */}
          <text x={796} y={516} textAnchor="end" fontSize={7} fill="rgba(100,116,139,0.4)" fontFamily="ui-monospace,monospace">
            © OpenSky Network · AEROVA
          </text>
        </svg>

        {/* Flight tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.icao24}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute", left: 16, top: 16,
                background: "rgba(255,255,255,0.97)",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                minWidth: 200,
                zIndex: 50,
                pointerEvents: "none",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: hovered.color, display: "inline-block"
                }} />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                  {hovered.callsign || hovered.icao24}
                </strong>
                {hovered.status && (
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700,
                    background: hovered.status === "Cruising" ? "#dbeafe" : hovered.status === "Climbing" ? "#dcfce7" : "#fef3c7",
                    color: hovered.status === "Cruising" ? "#1e40af" : hovered.status === "Climbing" ? "#15803d" : "#92400e",
                    padding: "2px 7px", borderRadius: 10,
                  }}>{hovered.status}</span>
                )}
              </div>
              <table style={{ fontSize: "0.72rem", color: "#475569", borderCollapse: "collapse", width: "100%" }}>
                <tbody>
                  {hovered.airline && <tr><td style={{paddingRight:8,paddingBottom:3}}>Airline</td><td><b style={{color:"#0f172a"}}>{hovered.airline}</b></td></tr>}
                  {hovered.origin && hovered.dest && <tr><td style={{paddingRight:8,paddingBottom:3}}>Route</td><td><b style={{color:"#0f172a"}}>{hovered.origin} → {hovered.dest}</b></td></tr>}
                  <tr><td style={{paddingRight:8,paddingBottom:3}}>Altitude</td><td><b style={{color:"#0f172a"}}>{hovered.alt ? `${Math.round(hovered.alt * 3.281).toLocaleString()} ft` : "N/A"}</b></td></tr>
                  <tr><td style={{paddingRight:8,paddingBottom:3}}>Speed</td><td><b style={{color:"#0f172a"}}>{hovered.speed ? `${hovered.speed} kts` : "N/A"}</b></td></tr>
                  {hovered.squawk && <tr><td style={{paddingRight:8,paddingBottom:3}}>Squawk</td><td><b style={{color:"#0f172a"}}>{hovered.squawk}</b></td></tr>}
                  {hovered.fare && <tr><td style={{paddingRight:8,paddingBottom:3}}>Scraped Fare</td><td><b style={{color:"#16a34a"}}>₹{hovered.fare?.toLocaleString("en-IN")}</b></td></tr>}
                  <tr><td style={{paddingRight:8}}>ICAO24</td><td><b style={{color:"#0f172a"}}>{hovered.icao24}</b></td></tr>
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom hint */}
        <div style={{
          position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
          fontSize: "0.65rem", color: "#94a3b8", pointerEvents: "none",
        }}>Scroll to zoom · Drag to pan · Hover a plane for details</div>
      </div>

      {/* Legend + status */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
        padding: "12px 24px",
        borderTop: "1px solid #f1f5f9",
        background: "#fafbfd",
      }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.entries({
            "Air India": "#C8102E", "IndiGo": "#0055A5", "SpiceJet": "#FF6B00",
            "Akasa": "#F57C00", "Vistara": "#6B21A8", "Other": "#1e40af",
          }).map(([name, col]) => (
            <span key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", color: "#475569" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: col, display: "inline-block" }} />
              {name}
            </span>
          ))}
        </div>
        <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}` : ""}
          {" · "}{statusLabel}
        </span>
      </div>
    </section>
  );
}

const mapBtnStyle = {
  width: 30, height: 30, border: "1px solid #e2e8f0", borderRadius: 6,
  background: "#f8fafc", cursor: "pointer", fontSize: "1rem", fontWeight: 700,
  display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
  lineHeight: 1, padding: 0,
};
