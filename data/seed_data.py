"""
AEROVA Historical Data Generator & Seeder
Generates 90 days of realistic Indian domestic flight price crawls across top routes,
advance windows (1, 7, 15, 30, 45 days), and carriers.
Computes daily Jevons elementary indices and National Laspeyres Airfare Index (Base 2024=100).
"""

import json
import math
import random
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3

from db import init_db, get_connection
import sys

sys.path.append(str(Path(__file__).parent.parent / "pipeline"))
from index_engine import IndexEngine
from clean_data import DataCleaner

def seed_database():
    init_db()
    conn = get_connection()
    cur = conn.cursor()

    # Load weights config
    weights_file = Path(__file__).parent.parent / "pipeline" / "weights.json"
    with open(weights_file, "r") as f:
        config = json.load(f)

    # 1. Insert Routes
    cur.execute("DELETE FROM routes;")
    cur.execute("DELETE FROM raw_fares;")
    cur.execute("DELETE FROM daily_route_indices;")
    cur.execute("DELETE FROM national_indices;")
    cur.execute("DELETE FROM esankhyiki_cpi;")

    for r in config["routes"]:
        cur.execute("""
        INSERT INTO routes (route_id, origin, destination, origin_city, destination_city, distance_km, dgca_weight, base_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (r["route_id"], r["origin"], r["destination"], r["origin_city"], r["destination_city"], r["distance_km"], r["dgca_weight"], r["base_price"]))

    engine = IndexEngine(str(weights_file))
    cleaner = DataCleaner()

    # 2. Insert Official MoSPI eSankhyiki CPI Benchmark Data (Monthly Base 2024=100)
    # Reflects the 45-day survey reporting delay
    esankhyiki_records = [
        ("2026-05", 102.4, 2024, "Final", "2026-06-12"),
        ("2026-06", 104.1, 2024, "Final", "2026-07-12"),
        ("2026-07", 106.8, 2024, "Provisional", "2026-08-12"),
        ("2026-08", 108.5, 2024, "Provisional", "2026-09-12"),
    ]
    for row in esankhyiki_records:
        cur.execute("""
        INSERT INTO esankhyiki_cpi (month_year, official_cpi_transport, base_year, status, published_date)
        VALUES (?, ?, ?, ?, ?)
        """, row)

    # 3. Generate 90 Days of Crawled Data (from June 7, 2026 to Sept 5, 2026)
    end_date = datetime(2026, 9, 5)
    start_date = end_date - timedelta(days=89)

    random.seed(42)  # Deterministic seed for reproducible testing
    carriers = config["carriers"]
    advance_windows = [item["advance_days"] for item in config["lead_time_distribution"]]

    current_date = start_date
    prev_national_index = None

    print("Generating realistic 90-day time-series airfare data...")

    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.weekday()  # 4=Fri, 5=Sat, 6=Sun
        is_weekend = day_of_week in (4, 5, 6)

        # Seasonal inflation drift over time + holiday shocks
        day_index = (current_date - start_date).days
        drift_factor = 1.0 + (day_index / 90.0) * 0.08  # 8% general price inflation over quarter

        # Specific holiday surge (e.g. Independence Day long weekend around Aug 14-17)
        is_holiday_rush = (8 <= current_date.month == 8 and 13 <= current_date.day <= 18)
        holiday_multiplier = 1.25 if is_holiday_rush else 1.0

        daily_route_elem_indices = {}
        daily_fares_to_insert = []
        daily_sample_count = 0

        for r in config["routes"]:
            route_id = r["route_id"]
            base_p = r["base_price"]
            route_lead_fares = {w: [] for w in advance_windows}

            for adv in advance_windows:
                # Booking curve multiplier: 1d is 1.8x, 7d is 1.3x, 15d is 1.08x, 30d is 0.96x, 45d is 0.88x
                if adv == 1:
                    adv_factor = random.uniform(1.75, 2.30)
                elif adv == 7:
                    adv_factor = random.uniform(1.20, 1.45)
                elif adv == 15:
                    adv_factor = random.uniform(1.02, 1.18)
                elif adv == 30:
                    adv_factor = random.uniform(0.92, 1.04)
                else:  # 45
                    adv_factor = random.uniform(0.85, 0.95)

                dep_date = (current_date + timedelta(days=adv)).strftime("%Y-%m-%d")

                # Sample quotes across airlines
                for c in carriers:
                    # Carrier premium: AI (full service) ~+10%, SG/QP discount ~-5%
                    carrier_mult = 1.12 if c["code"] == "AI" else (0.95 if c["code"] in ("SG", "QP") else 1.0)
                    weekend_mult = random.uniform(1.10, 1.22) if is_weekend else 1.0
                    noise = random.uniform(0.96, 1.04)

                    price = round(base_p * drift_factor * holiday_multiplier * adv_factor * carrier_mult * weekend_mult * noise)

                    # Clean and split into base + taxes
                    raw_rec = {
                        "total_fare": price,
                        "base_fare": 0.0,
                    }
                    cleaned = cleaner.clean_record(raw_rec)

                    flight_num = f"{c['code']}-{random.randint(101, 999)}"
                    source = "MakeMyTrip" if random.random() > 0.5 else "IndiGo Portal"

                    daily_fares_to_insert.append((
                        current_date.strftime("%Y-%m-%d %H:%M:%S"),
                        date_str,
                        route_id,
                        c["name"],
                        flight_num,
                        dep_date,
                        adv,
                        cleaned["base_fare"],
                        cleaned["total_fare"],
                        cleaned["taxes_and_fees"],
                        source,
                        1
                    ))
                    route_lead_fares[adv].append(cleaned["total_fare"])
                    daily_sample_count += 1

            # Compute route effective representative price
            eff_price = engine.compute_route_effective_price(route_lead_fares)
            # All fares collected for route on this day
            all_route_fares = [f for sub in route_lead_fares.values() for f in sub]
            jev_idx = engine.calculate_jevons_index(all_route_fares, base_p)
            dutot_idx = engine.calculate_dutot_index(all_route_fares, base_p)

            daily_route_elem_indices[route_id] = jev_idx

            cur.execute("""
            INSERT INTO daily_route_indices (observation_date, route_id, effective_price, jevons_index, dutot_index, sample_count)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (date_str, route_id, round(eff_price, 2), round(jev_idx, 4), round(dutot_idx, 4), len(all_route_fares)))

        # Insert raw fares in batch for performance
        cur.executemany("""
        INSERT INTO raw_fares (scraped_at, observation_date, route_id, carrier, flight_number, departure_date, advance_days, base_fare, total_fare, taxes_and_fees, source_portal, is_valid)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, daily_fares_to_insert)

        # Compute National Laspeyres Index
        national_res = engine.compute_national_index(daily_route_elem_indices)
        national_val = national_res["national_index"]

        daily_change = round(((national_val - prev_national_index) / prev_national_index) * 100, 2) if prev_national_index else 0.0
        prev_national_index = national_val

        cur.execute("""
        INSERT INTO national_indices (observation_date, national_index, base_year, total_weight_covered, daily_change_pct, sample_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (date_str, national_val, 2024, national_res["total_weight_covered"], daily_change, daily_sample_count, datetime.utcnow().isoformat()))

        current_date += timedelta(days=1)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
