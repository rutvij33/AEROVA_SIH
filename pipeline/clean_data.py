"""
AEROVA Data Cleansing & Outlier Filtering Module
Conforms to MoSPI / UN CPI Manual standards for handling volatile airline micro-data.
"""

from typing import List, Dict, Any, Tuple
import math

class DataCleaner:
    def __init__(self, min_price: float = 1200.0, max_price: float = 65000.0):
        self.min_price = min_price
        self.max_price = max_price

    def filter_outliers_iqr(self, fares: List[float], multiplier: float = 1.8) -> Tuple[List[float], List[float]]:
        """
        Uses Interquartile Range (IQR) to detect statistical anomalies in airfares.
        Returns: (valid_fares, anomalous_fares)
        """
        if len(fares) < 4:
            valid = [f for f in fares if self.min_price <= f <= self.max_price]
            anomalies = [f for f in fares if f not in valid]
            return valid, anomalies

        sorted_fares = sorted(fares)
        n = len(sorted_fares)
        q1_idx = int(0.25 * n)
        q3_idx = int(0.75 * n)
        q1 = sorted_fares[q1_idx]
        q3 = sorted_fares[q3_idx]
        iqr = q3 - q1

        lower_bound = max(self.min_price, q1 - multiplier * iqr)
        upper_bound = min(self.max_price, q3 + multiplier * iqr)

        valid_fares = []
        anomalies = []
        for f in fares:
            if lower_bound <= f <= upper_bound:
                valid_fares.append(f)
            else:
                anomalies.append(f)

        return valid_fares, anomalies

    def clean_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes fare components (separating base fare and taxes/fees).
        Standard Indian domestic airfare breakdown:
        - Base Fare: ~70-75%
        - Aviation Security Fee (ASF): ~₹236
        - User Development Fee (UDF): ~₹300 - ₹1100 depending on airport
        - GST: 5% on Economy, 12% on Business
        """
        total = float(raw_record.get("total_fare", 0.0))
        base = float(raw_record.get("base_fare", 0.0))
        
        # If base fare is missing or malformed, infer it using typical statutory fee structure
        if base <= 0 and total > 0:
            statutory_fees = 236.0 + 450.0  # ASF + average UDF
            net_taxable = max(0.0, total - statutory_fees)
            base = round(net_taxable / 1.05, 2)  # Removing 5% GST
            taxes_fees = round(total - base, 2)
        else:
            taxes_fees = round(total - base, 2)

        cleaned = dict(raw_record)
        cleaned["total_fare"] = total
        cleaned["base_fare"] = base
        cleaned["taxes_and_fees"] = taxes_fees
        cleaned["is_valid"] = (self.min_price <= total <= self.max_price)
        return cleaned
