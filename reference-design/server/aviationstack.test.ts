import { describe, expect, it } from "vitest";
import { AviationstackRequestError, normalizeAviationstackFlight } from "./aviationstack";

describe("Aviationstack normalization", () => {
  it("normalizes an in-bounds aircraft position without exposing raw provider fields", () => {
    const flight = normalizeAviationstackFlight({ flight_status: "active", departure: { iata: "BOM", airport: "Mumbai" }, arrival: { iata: "DEL", airport: "Delhi" }, airline: { name: "IndiGo", iata: "6E" }, flight: { iata: "6E 204" }, live: { latitude: 19.08, longitude: 72.88, altitude: 10000, speed_horizontal: 220, direction: 90, speed_vertical: 0, is_ground: false, updated: "2026-09-01T04:00:00Z" } });
    expect(flight).toMatchObject({ flightNumber: "6E 204", airline: "IndiGo", origin: "BOM", destination: "DEL", latitude: 19.08, longitude: 72.88 });
    expect(flight).not.toHaveProperty("access_key");
  });

  it("drops records without an in-bounds live position", () => {
    expect(normalizeAviationstackFlight({ flight: { iata: "6E 205" }, live: { latitude: null, longitude: 72.88 } })).toBeNull();
    expect(normalizeAviationstackFlight({ flight: { iata: "6E 206" }, live: { latitude: 51.5, longitude: -0.1 } })).toBeNull();
  });
});

describe("Aviationstack provider errors", () => {
  it("preserves HTTP status and provider code for rate-limit handling", () => {
    const error = new AviationstackRequestError(429, "rate_limit_reached", "Rate limit reached");
    expect(error).toMatchObject({ status: 429, providerCode: "rate_limit_reached", message: "Rate limit reached" });
    expect(error.name).toBe("AviationstackRequestError");
  });
});

describe("Aviationstack credential", () => {
  it("authenticates against the lightweight flights endpoint", async () => {
    const key = process.env.AVIATIONSTACK_API_KEY;
    expect(key, "AVIATIONSTACK_API_KEY must be configured").toBeTruthy();

    const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(key!)}&limit=1`);
    const payload = (await response.json()) as { success?: boolean; error?: { message?: string } };

    expect(response.ok, payload.error?.message ?? "Aviationstack request failed").toBe(true);
    expect(payload.success).not.toBe(false);
  }, 30_000);
});
