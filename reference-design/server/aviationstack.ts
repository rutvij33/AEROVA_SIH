import { z } from "zod";

const aviationstackFlightSchema = z.object({
  flight_status: z.string().nullable().optional(),
  departure: z.object({ airport: z.string().nullable().optional(), iata: z.string().nullable().optional(), scheduled: z.string().nullable().optional() }).nullable().optional(),
  arrival: z.object({ airport: z.string().nullable().optional(), iata: z.string().nullable().optional(), scheduled: z.string().nullable().optional() }).nullable().optional(),
  airline: z.object({ name: z.string().nullable().optional(), iata: z.string().nullable().optional() }).nullable().optional(),
  flight: z.object({ number: z.string().nullable().optional(), iata: z.string().nullable().optional(), icao: z.string().nullable().optional() }).nullable().optional(),
  live: z.object({
    updated: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    altitude: z.number().nullable().optional(),
    direction: z.number().nullable().optional(),
    speed_horizontal: z.number().nullable().optional(),
    speed_vertical: z.number().nullable().optional(),
    is_ground: z.boolean().nullable().optional(),
  }).nullable().optional(),
});

const aviationstackResponseSchema = z.object({
  pagination: z.object({ total: z.number().optional(), count: z.number().optional() }).optional(),
  data: z.array(z.unknown()).default([]),
  error: z.object({ code: z.string().optional(), message: z.string().optional() }).optional(),
});

export const INDIA_FLIGHT_BOUNDS = { minLatitude: 6, maxLatitude: 37, minLongitude: 68, maxLongitude: 97 } as const;

export type NormalizedLiveFlight = {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string | null;
  status: string;
  origin: string;
  originAirport: string;
  destination: string;
  destinationAirport: string;
  latitude: number;
  longitude: number;
  altitudeFeet: number | null;
  speedKnots: number | null;
  direction: number | null;
  verticalSpeed: number | null;
  isGround: boolean;
  updatedAt: string | null;
};

const inIndia = (latitude: number, longitude: number) => latitude >= INDIA_FLIGHT_BOUNDS.minLatitude && latitude <= INDIA_FLIGHT_BOUNDS.maxLatitude && longitude >= INDIA_FLIGHT_BOUNDS.minLongitude && longitude <= INDIA_FLIGHT_BOUNDS.maxLongitude;

export function normalizeAviationstackFlight(input: unknown): NormalizedLiveFlight | null {
  const parsed = aviationstackFlightSchema.safeParse(input);
  if (!parsed.success) return null;
  const live = parsed.data.live;
  if (live?.latitude == null || live.longitude == null || !inIndia(live.latitude, live.longitude)) return null;

  const flightIata = parsed.data.flight?.iata?.trim().toUpperCase();
  const flightNumber = flightIata || parsed.data.flight?.number?.trim().toUpperCase();
  if (!flightNumber) return null;

  return {
    id: flightIata || flightNumber,
    flightNumber,
    airline: parsed.data.airline?.name?.trim() || "Unknown carrier",
    airlineCode: parsed.data.airline?.iata?.trim().toUpperCase() || null,
    status: parsed.data.flight_status?.trim() || "active",
    origin: parsed.data.departure?.iata?.trim().toUpperCase() || "—",
    originAirport: parsed.data.departure?.airport?.trim() || "Unknown origin",
    destination: parsed.data.arrival?.iata?.trim().toUpperCase() || "—",
    destinationAirport: parsed.data.arrival?.airport?.trim() || "Unknown destination",
    latitude: live.latitude,
    longitude: live.longitude,
    altitudeFeet: live.altitude == null ? null : Math.round(live.altitude * 3.28084),
    speedKnots: live.speed_horizontal == null ? null : Math.round(live.speed_horizontal * 0.539957),
    direction: live.direction == null ? null : Math.round(live.direction),
    verticalSpeed: live.speed_vertical == null ? null : Math.round(live.speed_vertical * 196.8504),
    isGround: Boolean(live.is_ground),
    updatedAt: live.updated || null,
  };
}

export class AviationstackRequestError extends Error {
  constructor(public readonly status: number, public readonly providerCode: string | null, message: string) {
    super(message);
    this.name = "AviationstackRequestError";
  }
}

export type IndiaFlightMapResponse = {
  fetchedAt: string;
  source: "Aviationstack";
  environment: "free-tier";
  totalReturned: number;
  mappedCount: number;
  flights: NormalizedLiveFlight[];
};

export async function fetchIndiaFlightStates(flightIata?: string): Promise<IndiaFlightMapResponse> {
  const accessKey = process.env.AVIATIONSTACK_API_KEY;
  if (!accessKey) throw new Error("AVIATIONSTACK_API_KEY is not configured");

  const params = new URLSearchParams({ access_key: accessKey, flight_status: "active", limit: "100" });
  if (flightIata) params.set("flight_iata", flightIata.replace(/\s+/g, "").toUpperCase());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`http://api.aviationstack.com/v1/flights?${params.toString()}`, { signal: controller.signal });
    const payload = aviationstackResponseSchema.parse(await response.json());
    if (!response.ok || payload.error) {
      const providerCode = payload.error?.code ?? null;
      const message = payload.error?.message || `Aviationstack request failed (${response.status})`;
      throw new AviationstackRequestError(response.status, providerCode, message);
    }

    const flights = payload.data.map(normalizeAviationstackFlight).filter((flight): flight is NormalizedLiveFlight => flight !== null);
    return { fetchedAt: new Date().toISOString(), source: "Aviationstack", environment: "free-tier", totalReturned: payload.data.length, mappedCount: flights.length, flights };
  } finally {
    clearTimeout(timeout);
  }
}
