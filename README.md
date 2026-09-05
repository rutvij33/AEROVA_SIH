# ✈️ AEROVA — Real-Time Airfare Price Index for India

> **SIH26056 Solution for the Ministry of Statistics and Programme Implementation (MoSPI)**  
> Augmenting official Consumer Price Index (CPI) with high-frequency automated domestic airfare ingestion & eSankhyiki SDMX data bridging.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aerova--ufne.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=black)](https://aerova-ufne.vercel.app/)  
🌐 **Live Web Application**: [https://aerova-ufne.vercel.app/](https://aerova-ufne.vercel.app/)

---

## 📌 Executive Summary

Official Consumer Price Index (CPI) reporting in India suffers from a traditional **45-day survey collection lag**, sampling static fares across arbitrary monthly dates that fail to reflect the high-frequency dynamics of airline yield management.

**AEROVA** bridges this gap by deploying automated crawlers and airline aggregators across **10 top domestic high-density trunk corridors**, categorizing observations across **5 advance booking windows (1d, 7d, 15d, 30d, 45d)**, and compiling daily Laspeyres indices over elementary Jevons geometric means aligned to **MoSPI Base Year 2024 = 100.0** and **COICOP Category 07.3.3 (Passenger Transport by Air)**.

---

## 🌟 Key Features

- **Real-Time Airfare Index**: Daily Laspeyres index weighted by DGCA passenger traffic volumes across India's busiest metro corridors (DEL-BOM, BLR-DEL, BOM-BLR, etc.).
- **Live Flight Tracker & Airspace Map**: Interactive real-time map displaying airborne domestic aircraft over India powered by OpenSky Network API and domestic telemetry fallback.
- **FlightAware-Inspired Interface**: Modern, ultra-premium responsive web app with route search, corridor analytics, and price dispersion matrices.
- **MoSPI eSankhyiki SDMX & JSON-STAT Bridge**: Full compliance with UN/IMF SDMX 2.1 machine-readable data feeds for turnkey ingestion into the MoSPI open data platform.
- **Advance Booking Volatility Curves**: Analyzes price sensitivity from emergency same-day purchases (T+1d) to leisure advance bookings (T+45d).
- **Automated Anomaly Detection**: Modified Z-score and IQR models identifying price spikes, holiday surges, and reporting divergences.

---

## 🏗️ Architecture

```
AEROVA/
├── backend/                  # FastAPI high-performance RESTful API
│   └── main.py               # Endpoints: /summary, /routes, /advance-curve, /esankhyiki/export, /live-flights
├── pipeline/                 # Statistical index computation engine
│   ├── index_engine.py       # Jevons geometric mean & Laspeyres DGCA weighting
│   ├── esankhyiki_bridge.py  # SDMX 2.1 & JSON-STAT export generator
│   ├── clean_data.py         # Fare disaggregation & outlier filtering
│   └── weights.json          # DGCA corridor passenger traffic weights
├── data/                     # Database & Seeding
│   ├── db.py                 # SQLite persistence layer
│   ├── seed_data.py          # Historical fare observations & synthetic backfill
│   └── aerova.db             # Ingested records & computed daily series
└── frontend/                 # Vite + React interactive client
    ├── src/
    │   ├── pages/            # Home, Dashboard, Methodology, ApiDocs, ESankhyiki
    │   └── components/       # LiveAirspaceMap, ESankhyikiModal, IndexChart, etc.
    └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
# Navigate to backend and install requirements
cd backend
pip install fastapi uvicorn sqlite3 pydantic requests

# Start API server on port 8000
python3 -m uvicorn main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
# Navigate to frontend and install dependencies
cd frontend
npm install

# Start Vite dev server on port 5173
npm run dev
```

Visit **`http://localhost:5173`** to access the application.

---

## 📊 Endpoints & Standards

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/summary` | GET | National index, daily delta, MoM inflation, and divergence metrics |
| `/api/v1/index-trend` | GET | Historical time-series comparing AEROVA vs MoSPI official transport CPI |
| `/api/v1/routes` | GET | Corridor-level index, base price, and DGCA weights |
| `/api/v1/advance-curve` | GET | Fare escalation curve across 1d, 7d, 15d, 30d, 45d windows |
| `/api/v1/airline-dispersion` | GET | Fare distribution across IndiGo, Air India, SpiceJet, Akasa |
| `/api/v1/esankhyiki/export` | GET | MoSPI SDMX 2.1 & JSON-STAT machine-readable export feed |
| `/api/v1/live-flights` | GET | Live Indian domestic airborne flights with telemetry |

---

## 📜 License
MIT License. Built for Smart India Hackathon 2026 (SIH26056).
