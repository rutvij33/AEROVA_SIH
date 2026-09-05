"""
AEROVA SQLite Database Layer
Stores raw scraped airfares, computed daily elementary indices, and official MoSPI eSankhyiki CPI benchmarks.
"""

import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).parent / "aerova.db"

def get_connection(db_file: Optional[Path] = None) -> sqlite3.Connection:
    target = db_file or DB_PATH
    conn = sqlite3.connect(str(target))
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_file: Optional[Path] = None):
    conn = get_connection(db_file)
    cur = conn.cursor()

    # 1. Routes Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS routes (
        route_id TEXT PRIMARY KEY,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        distance_km INTEGER NOT NULL,
        dgca_weight REAL NOT NULL,
        base_price REAL NOT NULL
    );
    """)

    # 2. Raw Scraped Fares Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS raw_fares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scraped_at TEXT NOT NULL,
        observation_date TEXT NOT NULL,
        route_id TEXT NOT NULL,
        carrier TEXT NOT NULL,
        flight_number TEXT,
        departure_date TEXT NOT NULL,
        advance_days INTEGER NOT NULL,
        base_fare REAL NOT NULL,
        total_fare REAL NOT NULL,
        taxes_and_fees REAL NOT NULL,
        source_portal TEXT NOT NULL,
        is_valid INTEGER DEFAULT 1,
        FOREIGN KEY (route_id) REFERENCES routes (route_id)
    );
    """)

    # Index for speedy time-series queries
    cur.execute("CREATE INDEX IF NOT EXISTS idx_fares_date_route ON raw_fares (observation_date, route_id);")

    # 3. Daily Route Elementary Indices
    cur.execute("""
    CREATE TABLE IF NOT EXISTS daily_route_indices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        observation_date TEXT NOT NULL,
        route_id TEXT NOT NULL,
        effective_price REAL NOT NULL,
        jevons_index REAL NOT NULL,
        dutot_index REAL NOT NULL,
        sample_count INTEGER NOT NULL,
        UNIQUE (observation_date, route_id),
        FOREIGN KEY (route_id) REFERENCES routes (route_id)
    );
    """)

    # 4. National Airfare Price Index (API)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS national_indices (
        observation_date TEXT PRIMARY KEY,
        national_index REAL NOT NULL,
        base_year INTEGER DEFAULT 2024,
        total_weight_covered REAL NOT NULL,
        daily_change_pct REAL,
        sample_count INTEGER NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 5. Official MoSPI eSankhyiki Benchmark Series
    cur.execute("""
    CREATE TABLE IF NOT EXISTS esankhyiki_cpi (
        month_year TEXT PRIMARY KEY,
        official_cpi_transport REAL NOT NULL,
        base_year INTEGER DEFAULT 2024,
        status TEXT NOT NULL,
        published_date TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"AEROVA database initialized at: {DB_PATH}")
