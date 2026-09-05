"""
AEROVA Statistical & Pipeline Verification Test Suite
"""

import unittest
import math
from index_engine import IndexEngine
from clean_data import DataCleaner
from esankhyiki_bridge import ESankhyikiBridge

class TestAEROVAEngine(unittest.TestCase):
    def setUp(self):
        self.engine = IndexEngine()
        self.cleaner = DataCleaner()
        self.bridge = ESankhyikiBridge()

    def test_jevons_index_calculation(self):
        # 3 quotes: 5000, 5500, 6000 against base 5000
        # Jevons = ( (5000/5000) * (5500/5000) * (6000/5000) ) ^ (1/3)
        prices = [5000.0, 5500.0, 6000.0]
        base = 5000.0
        expected = (1.0 * 1.1 * 1.2) ** (1/3)
        calculated = self.engine.calculate_jevons_index(prices, base)
        self.assertAlmostEqual(calculated, expected, places=5)

    def test_dutot_index_calculation(self):
        prices = [5000.0, 6000.0]
        base = 5000.0
        # Dutot = 5500 / 5000 = 1.1
        calculated = self.engine.calculate_dutot_index(prices, base)
        self.assertAlmostEqual(calculated, 1.1, places=5)

    def test_data_cleaning_and_outlier_filtering(self):
        # Normal fares + 1 extreme promo outlier + 1 extreme predatory spike
        fares = [5000, 5100, 5200, 5050, 5150, 5300, 500, 95000]
        valid, anomalies = self.cleaner.filter_outliers_iqr(fares)
        self.assertIn(500, anomalies)
        self.assertIn(95000, anomalies)
        self.assertEqual(len(valid), 6)

    def test_esankhyiki_export_format(self):
        sample_record = {
            "date": "2026-09-05",
            "national_index": 153.88,
            "sample_count": 250
        }
        export = self.bridge.format_esankhyiki_export(sample_record)
        self.assertEqual(export["dataset"]["series_key"], "IN.NSO.CPI.2024.D.0733")
        self.assertEqual(export["dataset"]["base_year"], 2024)
        self.assertEqual(export["dataset"]["value"], 153.88)
        self.assertEqual(export["dataset"]["status"], "A")

if __name__ == "__main__":
    unittest.main()
