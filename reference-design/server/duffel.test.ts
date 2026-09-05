import { describe, expect, it } from "vitest";
import { AIRFARE_ROUTES, calculateAirlineSummary, calculateAnomalies, calculateFareDistribution, calculateIndexFromBaseline, calculateRouteSummary, calculateShortTermProjection, isIndianDomesticCarrier, type FareObservation, type TrendPoint } from "./duffel";

const observation = (overrides: Partial<FareObservation>): FareObservation => ({
  id: "sample",
  route: "DEL → BOM",
  routeKey: "DEL-BOM",
  origin: "DEL",
  destination: "BOM",
  airline: "Air India",
  amount: 100,
  currency: "GBP",
  stops: 0,
  departureDate: "2026-09-13",
  capturedAt: "2026-08-30T12:00:00.000Z",
  ...overrides,
});

describe("Duffel airfare analytics", () => {
  it("keeps the route basket representative and the carrier scope domestic", () => {
    expect(AIRFARE_ROUTES.map(([origin, destination]) => `${origin}-${destination}`)).toEqual(expect.arrayContaining(["BOM-DEL", "DEL-BLR", "BOM-BLR", "DEL-CCU", "BLR-HYD", "MAA-DEL"]));
    expect(isIndianDomesticCarrier("IndiGo")).toBe(true);
    expect(isIndianDomesticCarrier("American Airlines")).toBe(false);
  });
  it("calculates route averages, ranges, and medians from observed fares", () => {
    const summary = calculateRouteSummary([
      observation({ id: "1", amount: 100 }),
      observation({ id: "2", amount: 160 }),
      observation({ id: "3", airline: "British Airways", amount: 220, stops: 1 }),
    ]);

    expect(summary).toEqual([{ route: "DEL → BOM", routeKey: "DEL-BOM", origin: "DEL", destination: "BOM", averageFare: 160, minFare: 100, maxFare: 220, medianFare: 160, offers: 3, indexValue: 100, deltaPercent: 0, baselineDate: "initializing" }]);
  });

  it("calculates a baseline-relative index and movement", () => {
    expect(calculateIndexFromBaseline(112.4, 100)).toEqual({ indexValue: 112, deltaPercent: 12.4 });
    expect(calculateIndexFromBaseline(0, 0)).toEqual({ indexValue: 100, deltaPercent: 0 });
  });

  it("groups fares by airline and creates a distribution", () => {
    const fares = [
      observation({ id: "1", airline: "Air India", amount: 100 }),
      observation({ id: "2", airline: "Air India", amount: 140 }),
      observation({ id: "3", airline: "IndiGo", amount: 220 }),
      observation({ id: "4", airline: "IndiGo", amount: 240 }),
    ];
    const airlines = calculateAirlineSummary(fares, 180);
    expect(airlines[0]).toMatchObject({ airline: "Air India", averageFare: 120, observations: 2 });
    expect(calculateFareDistribution(fares).reduce((total, bin) => total + bin.count, 0)).toBe(4);
  });

  it("gates forecasts until seven stored snapshots exist", () => {
    expect(calculateShortTermProjection([])).toMatchObject({ status: "insufficient", horizonDays: 7 });
    const history: TrendPoint[] = Array.from({ length: 7 }, (_, index) => ({ date: `2026-08-${String(index + 1).padStart(2, "0")}`, value: 100 + index, medianFare: 100 }));
    expect(calculateShortTermProjection(history)).toMatchObject({ status: "available", projectedIndex: 113, direction: "up" });
  });

  it("flags route-level outliers with the IQR rule", () => {
    const fares = [100, 110, 120, 125, 130, 800].map((amount, index) => observation({ id: String(index), amount }));
    const anomalies = calculateAnomalies(fares);
    expect(anomalies).toHaveLength(1);
    expect(anomalies[0]).toMatchObject({ amount: 800, route: "DEL → BOM" });
  });
});

describe("Duffel live smoke tests", () => {
  it.skipIf(process.env.RUN_LIVE_DUFFEL_TESTS !== "1")("can authenticate against the airports endpoint", async () => {
    const token = process.env.DUFFEL_API_TOKEN;
    expect(token, "DUFFEL_API_TOKEN must be configured").toBeTruthy();
    const response = await fetch("https://api.duffel.com/air/airports?iata_code=DEL", { headers: { Authorization: `Bearer ${token}`, "Duffel-Version": "v2", Accept: "application/json" } });
    expect(response.ok, `Duffel responded with ${response.status}`).toBe(true);
    const payload = (await response.json()) as { data?: unknown[] };
    expect(Array.isArray(payload.data)).toBe(true);
  }, 20_000);

  it.skipIf(process.env.RUN_LIVE_DUFFEL_TESTS !== "1")("can create a flight offer request", async () => {
    const token = process.env.DUFFEL_API_TOKEN;
    expect(token, "DUFFEL_API_TOKEN must be configured").toBeTruthy();
    const departureDate = new Date();
    departureDate.setUTCDate(departureDate.getUTCDate() + 14);
    const response = await fetch("https://api.duffel.com/air/offer_requests", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Duffel-Version": "v2", "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ data: { slices: [{ origin: "DEL", destination: "BOM", departure_date: departureDate.toISOString().slice(0, 10) }], passengers: [{ type: "adult" }], cabin_class: "economy", max_connections: 1 } }),
    });
    expect(response.ok, `Duffel responded with ${response.status}`).toBe(true);
    const payload = (await response.json()) as { data?: { id?: string } };
    expect(payload.data?.id).toBeTruthy();
  }, 30_000);
});
