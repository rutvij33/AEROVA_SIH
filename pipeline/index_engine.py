"""
AEROVA Statistical Index Engine
Implements official MoSPI and IMF Consumer Price Index (CPI) methodology:
1. Elementary Aggregation: Jevons Formula (unweighted geometric mean of price relatives)
2. Booking Lead-Time Weighting: Synthetic consumption profile across booking windows
3. Upper-Level Aggregation: Laspeyres / Young Index with DGCA Route Traffic Weights
"""

import json
import math
from pathlib import Path
from typing import List, Dict, Any, Optional

class IndexEngine:
    def __init__(self, weights_path: Optional[str] = None):
        if weights_path is None:
            weights_path = str(Path(__file__).parent / "weights.json")
        
        with open(weights_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        self.routes_map = {r["route_id"]: r for r in self.config["routes"]}
        self.lead_weights = {item["advance_days"]: item["weight"] for item in self.config["lead_time_distribution"]}
        self.base_year = self.config.get("base_year", 2024)
        self.base_index = self.config.get("base_index", 100.0)

    def calculate_jevons_index(self, current_prices: List[float], base_price: float) -> float:
        """
        Jevons Index (Elementary Aggregate):
        Geometric mean of current prices relative to base price.
        Formula: exp( 1/n * sum( ln(P_t / P_0) ) )
        """
        if not current_prices or base_price <= 0:
            return 1.0

        log_sum = sum(math.log(p / base_price) for p in current_prices if p > 0)
        n = len(current_prices)
        if n == 0:
            return 1.0
        return math.exp(log_sum / n)

    def calculate_dutot_index(self, current_prices: List[float], base_price: float) -> float:
        """
        Dutot Index:
        Ratio of arithmetic mean prices: (sum(P_t)/n) / P_0
        """
        if not current_prices or base_price <= 0:
            return 1.0
        return (sum(current_prices) / len(current_prices)) / base_price

    def calculate_carli_index(self, current_prices: List[float], base_price: float) -> float:
        """
        Carli Index:
        Arithmetic mean of price relatives: 1/n * sum(P_t / P_0)
        """
        if not current_prices or base_price <= 0:
            return 1.0
        return sum(p / base_price for p in current_prices) / len(current_prices)

    def compute_route_effective_price(self, fares_by_lead_time: Dict[int, List[float]]) -> float:
        """
        Computes the weighted representative price for a route across booking windows
        (1d, 7d, 15d, 30d, 45d) based on historical consumer booking behavior.
        """
        effective_price = 0.0
        total_weight = 0.0

        for lead_days, fares in fares_by_lead_time.items():
            if fares:
                median_fare = sorted(fares)[len(fares) // 2]
                w = self.lead_weights.get(lead_days, 0.20)
                effective_price += median_fare * w
                total_weight += w

        if total_weight > 0:
            return effective_price / total_weight
        return 0.0

    def compute_national_index(self, route_indices: Dict[str, float]) -> Dict[str, Any]:
        """
        Upper-Level Aggregation (Laspeyres / Young Index):
        Weighted sum of route elementary indices using DGCA passenger volume weights.
        Formula: API_t = sum( w_r * I_r(t) ) * Base_Index
        """
        weighted_sum = 0.0
        total_weight_applied = 0.0
        route_contributions = {}

        for route_id, r_idx in route_indices.items():
            if route_id in self.routes_map:
                w = self.routes_map[route_id]["dgca_weight"]
                contribution = w * r_idx
                weighted_sum += contribution
                total_weight_applied += w
                route_contributions[route_id] = {
                    "weight": w,
                    "index": round(r_idx * self.base_index, 2),
                    "contribution": round(contribution * self.base_index, 3)
                }

        # Normalize if a subset of routes is observed
        normalized_national_index = (
            (weighted_sum / total_weight_applied) * self.base_index
            if total_weight_applied > 0
            else self.base_index
        )

        return {
            "national_index": round(normalized_national_index, 2),
            "base_year": self.base_year,
            "total_weight_covered": round(total_weight_applied, 4),
            "route_contributions": route_contributions
        }
