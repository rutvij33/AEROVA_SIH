import { z } from "zod";
import { getAirfareTrend, getOrCreateAirfareBaseline, persistAirfareSnapshot } from "./db";

const DUFFEL_API_URL = "https://api.duffel.com";

export const AIRFARE_ROUTES = [
  ["PNQ", "DEL"],
  ["BOM", "DEL"],
  ["DEL", "BLR"],
  ["HYD", "DEL"],
  ["BOM", "BLR"],
  ["DEL", "CCU"],
  ["BLR", "HYD"],
  ["MAA", "DEL"],
] as const;

export const INDIAN_DOMESTIC_CARRIERS = ["IndiGo", "Air India", "Air India Express", "SpiceJet", "Akasa Air", "Alliance Air", "Star Air", "Fly91", "IndiaOne Air", "FlyBig"] as const;
export const isIndianDomesticCarrier = (name: string) => INDIAN_DOMESTIC_CARRIERS.some((carrier) => name.toLowerCase().includes(carrier.toLowerCase()));

const routeKeys = AIRFARE_ROUTES.map(([origin, destination]) => `${origin}-${destination}`) as [string, ...string[]];

export const airfareQuerySchema = z.object({
  route: z.enum(routeKeys).optional(),
  airline: z.string().trim().min(1).max(160).optional(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
  historyDays: z.coerce.number().int().min(7).max(365).default(30),
});

export type FareObservation = {
  id: string;
  route: string;
  routeKey: string;
  origin: string;
  destination: string;
  airline: string;
  amount: number;
  currency: string;
  stops: number;
  departureDate: string;
  capturedAt: string;
};

export type RouteSummary = {
  route: string;
  routeKey: string;
  origin: string;
  destination: string;
  averageFare: number;
  minFare: number;
  maxFare: number;
  medianFare: number;
  offers: number;
  indexValue: number;
  deltaPercent: number;
  baselineDate: string;
};

export type AirlineSummary = {
  airline: string;
  averageFare: number;
  minFare: number;
  maxFare: number;
  observations: number;
  movementPercent: number;
};

export type TrendPoint = {
  date: string;
  value: number;
  medianFare: number;
};

export type FareDistributionBin = {
  label: string;
  minFare: number;
  maxFare: number;
  count: number;
};

export type ForecastResult = {
  status: "available" | "insufficient";
  horizonDays: number;
  projectedIndex?: number;
  movementPercent?: number;
  direction?: "up" | "down" | "flat";
  method: string;
};

export type FareAnomaly = {
  id: string;
  route: string;
  airline: string;
  amount: number;
  expectedMin: number;
  expectedMax: number;
  reason: string;
};

export type AirfareIndexResponse = {
  fetchedAt: string;
  departureDate: string;
  environment: "test" | "live";
  currency: string;
  observations: FareObservation[];
  routeSummary: RouteSummary[];
  airlineSummary: AirlineSummary[];
  airlineOptions: string[];
  fareDistribution: FareDistributionBin[];
  anomalies: FareAnomaly[];
  anomalyCount: number;
  history: TrendPoint[];
  historyDays: number;
  forecast: ForecastResult;
  networkMedianFare: number;
  networkIndexValue: number;
  networkDeltaPercent: number;
  baselineDate: string;
  indexBasis: string;
  sourceCount: number;
  sourceLabels: string[];
  pipeline: Array<{ stage: string; status: "complete" | "partial" | "error" }>;
  monitoring: {
    provider: string;
    status: "healthy" | "partial" | "error";
    successfulRequests: number;
    failedRequests: number;
    lastSuccessfulCollection: string | null;
  };
  cpiNote: string;
  errors: string[];
};

type DuffelOfferRequestResponse = {
  data?: {
    offers?: Array<{
      id?: string;
      total_amount?: string;
      total_currency?: string;
      owner?: { name?: string };
      slices?: Array<{
        segments?: Array<{
          origin?: { iata_code?: string };
          destination?: { iata_code?: string };
          operating_carrier?: { name?: string };
        }>;
      }>;
    }>;
  };
};

function getDepartureDate(input?: string) {
  if (input) return input;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  return date.toISOString().slice(0, 10);
}

function quantile(values: number[], percentile: number) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function median(values: number[]) {
  return quantile(values, 0.5);
}

function average(values: number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

async function fetchRouteOffers(origin: string, destination: string, departureDate: string, token: string): Promise<FareObservation[]> {
  const response = await fetch(`${DUFFEL_API_URL}/air/offer_requests?return_offers=true&supplier_timeout=10000&view=offers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        slices: [{ origin, destination, departure_date: departureDate }],
        passengers: [{ type: "adult" }],
        cabin_class: "economy",
        max_connections: 1,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${origin}-${destination}: Duffel ${response.status} ${body.slice(0, 180)}`);
  }

  const payload = (await response.json()) as DuffelOfferRequestResponse;
  const capturedAt = new Date().toISOString();
  const routeKey = `${origin}-${destination}`;
  return (payload.data?.offers ?? []).slice(0, 20).map((offer, index): FareObservation | null => {
    const amount = Number(offer.total_amount);
    const firstSlice = offer.slices?.[0];
    const segments = firstSlice?.segments ?? [];
    const firstSegment = segments[0];
    const finalSegment = segments[segments.length - 1];
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return {
      id: offer.id ?? `${routeKey}-${index}`,
      route: `${origin} → ${destination}`,
      routeKey,
      origin: firstSegment?.origin?.iata_code ?? origin,
      destination: finalSegment?.destination?.iata_code ?? destination,
      airline: firstSegment?.operating_carrier?.name ?? offer.owner?.name ?? "Unspecified carrier",
      amount,
      currency: offer.total_currency ?? "INR",
      stops: Math.max(0, segments.length - 1),
      departureDate,
      capturedAt,
    };
  }).filter((observation): observation is FareObservation => observation !== null);
}

export function calculateRouteSummary(observations: FareObservation[]): RouteSummary[] {
  const groups = new Map<string, FareObservation[]>();
  for (const observation of observations) {
    const group = groups.get(observation.routeKey) ?? [];
    group.push(observation);
    groups.set(observation.routeKey, group);
  }

  return Array.from(groups.entries()).map(([routeKey, fares]) => {
    const fareValues = fares.map((fare) => fare.amount);
    return {
      route: fares[0].route,
      routeKey,
      origin: fares[0].origin,
      destination: fares[0].destination,
      averageFare: Math.round(average(fareValues)),
      minFare: Math.round(Math.min(...fareValues)),
      maxFare: Math.round(Math.max(...fareValues)),
      medianFare: Math.round(median(fareValues)),
      offers: fares.length,
      indexValue: 100,
      deltaPercent: 0,
      baselineDate: "initializing",
    };
  }).sort((a, b) => a.route.localeCompare(b.route));
}

export function calculateAirlineSummary(observations: FareObservation[], networkMedianFare: number): AirlineSummary[] {
  const groups = new Map<string, FareObservation[]>();
  for (const observation of observations) {
    const group = groups.get(observation.airline) ?? [];
    group.push(observation);
    groups.set(observation.airline, group);
  }
  return Array.from(groups.entries()).map(([airline, fares]) => {
    const values = fares.map((fare) => fare.amount);
    const averageFare = average(values);
    return {
      airline,
      averageFare: Math.round(averageFare),
      minFare: Math.round(Math.min(...values)),
      maxFare: Math.round(Math.max(...values)),
      observations: values.length,
      movementPercent: networkMedianFare ? Number((((averageFare / networkMedianFare) - 1) * 100).toFixed(1)) : 0,
    };
  }).sort((a, b) => a.averageFare - b.averageFare);
}

export function calculateFareDistribution(observations: FareObservation[]): FareDistributionBin[] {
  if (!observations.length) return [];
  const values = observations.map((observation) => observation.amount);
  const minFare = Math.min(...values);
  const maxFare = Math.max(...values);
  if (minFare === maxFare) return [{ label: `${Math.round(minFare)} · all offers`, minFare, maxFare, count: values.length }];
  const step = (maxFare - minFare) / 5;
  return Array.from({ length: 5 }, (_, index) => {
    const lower = minFare + step * index;
    const upper = index === 4 ? maxFare : minFare + step * (index + 1);
    const count = values.filter((value) => index === 4 ? value >= lower && value <= upper : value >= lower && value < upper).length;
    return { label: `${Math.round(lower)}–${Math.round(upper)}`, minFare: Math.round(lower), maxFare: Math.round(upper), count };
  });
}

export function calculateAnomalies(observations: FareObservation[]): FareAnomaly[] {
  const groups = new Map<string, FareObservation[]>();
  for (const observation of observations) {
    const group = groups.get(observation.routeKey) ?? [];
    group.push(observation);
    groups.set(observation.routeKey, group);
  }

  const anomalies: FareAnomaly[] = [];
  for (const fares of Array.from(groups.values())) {
    if (fares.length < 4) continue;
    const values = fares.map((fare) => fare.amount);
    const q1 = quantile(values, 0.25);
    const q3 = quantile(values, 0.75);
    const iqr = q3 - q1;
    const expectedMin = Math.max(0, Math.round(q1 - 1.5 * iqr));
    const expectedMax = Math.round(q3 + 1.5 * iqr);
    for (const fare of fares) {
      if (fare.amount < expectedMin || fare.amount > expectedMax) {
        anomalies.push({ id: fare.id, route: fare.route, airline: fare.airline, amount: fare.amount, expectedMin, expectedMax, reason: "Outside the route interquartile range × 1.5 rule" });
      }
    }
  }
  return anomalies;
}

export function calculateShortTermProjection(history: TrendPoint[], horizonDays = 7): ForecastResult {
  if (history.length < 7) {
    return { status: "insufficient", horizonDays, method: "Requires at least 7 stored snapshots; no values are projected from missing history." };
  }
  const recent = history.slice(-7);
  const first = recent[0].value;
  const last = recent[recent.length - 1].value;
  const slope = (last - first) / Math.max(recent.length - 1, 1);
  const projectedIndex = Math.max(0, Number((last + slope * horizonDays).toFixed(1)));
  const movementPercent = last ? Number((((projectedIndex / last) - 1) * 100).toFixed(1)) : 0;
  return {
    status: "available",
    horizonDays,
    projectedIndex,
    movementPercent,
    direction: movementPercent > 0.5 ? "up" : movementPercent < -0.5 ? "down" : "flat",
    method: "Seven-snapshot linear projection; directional research aid only, not a machine-learning forecast.",
  };
}

export function calculateIndexFromBaseline(currentFare: number, baseFare: number) {
  if (!baseFare) return { indexValue: 100, deltaPercent: 0 };
  return { indexValue: Math.round((currentFare / baseFare) * 100), deltaPercent: Number((((currentFare / baseFare) - 1) * 100).toFixed(1)) };
}

function buildPipeline(successfulRoutes: number, failedRoutes: number, observationCount: number) {
  const collectionStatus = successfulRoutes ? (failedRoutes ? "partial" : "complete") : "error";
  const dataStatus = observationCount ? "complete" : "error";
  return [
    { stage: "Collect", status: collectionStatus as "complete" | "partial" | "error" },
    { stage: "Clean", status: dataStatus as "complete" | "partial" | "error" },
    { stage: "Normalize", status: dataStatus as "complete" | "partial" | "error" },
    { stage: "Validate", status: dataStatus as "complete" | "partial" | "error" },
    { stage: "Calculate index", status: dataStatus as "complete" | "partial" | "error" },
    { stage: "Dashboard", status: dataStatus as "complete" | "partial" | "error" },
  ];
}

export async function getAirfareIndex(input?: z.infer<typeof airfareQuerySchema>): Promise<AirfareIndexResponse> {
  const token = process.env.DUFFEL_API_TOKEN;
  const departureDate = getDepartureDate(input?.departureDate);
  const historyDays = input?.historyDays ?? 30;
  if (!token) throw new Error("DUFFEL_API_TOKEN is not configured");

  const requestedRoutes = AIRFARE_ROUTES.filter(([origin, destination]) => !input?.route || `${origin}-${destination}` === input.route);
  const results = await Promise.allSettled(requestedRoutes.map(([origin, destination]) => fetchRouteOffers(origin, destination, departureDate, token)));
  const allObservations: FareObservation[] = [];
  const errors: string[] = [];
  let successfulRoutes = 0;
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      successfulRoutes += 1;
      allObservations.push(...result.value);
    } else {
      errors.push(result.reason instanceof Error ? result.reason.message : "Unable to fetch route offers");
    }
  });

  const domesticObservations = allObservations.filter((observation) => isIndianDomesticCarrier(observation.airline));
  const airlineOptions = Array.from(new Set(domesticObservations.map((observation) => observation.airline))).sort();
  const observations = input?.airline ? domesticObservations.filter((observation) => observation.airline.toLowerCase() === input.airline?.toLowerCase()) : domesticObservations;
  const currentRouteSummary = calculateRouteSummary(observations);
  const networkMedianFare = median(currentRouteSummary.map((route) => route.medianFare));
  const currency = observations[0]?.currency ?? allObservations[0]?.currency ?? "INR";
  const environment = token.startsWith("duffel_test_") ? "test" : "live";
  const scopeSuffix = input?.airline ? `:${input.airline.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "";

  const routeSummariesWithBaselines = await Promise.all(currentRouteSummary.map(async (route) => {
    const routeBaseline = await getOrCreateAirfareBaseline({ scopeKey: `route:${route.routeKey}:${currency}${scopeSuffix}`, currency, currentFare: route.medianFare, baseDate: departureDate });
    const baseFare = routeBaseline?.baseFareCents ? routeBaseline.baseFareCents / 100 : route.medianFare;
    const indexed = calculateIndexFromBaseline(route.medianFare, baseFare);
    return { ...route, ...indexed, baselineDate: routeBaseline?.baseDate ?? departureDate };
  }));

  const networkBaseline = networkMedianFare ? await getOrCreateAirfareBaseline({ scopeKey: `network:${input?.route ?? "ALL"}:${currency}${scopeSuffix}`, currency, currentFare: networkMedianFare, baseDate: departureDate }) : null;
  const networkBaseFare = networkBaseline?.baseFareCents ? networkBaseline.baseFareCents / 100 : networkMedianFare;
  const networkIndexed = calculateIndexFromBaseline(networkMedianFare, networkBaseFare);
  const selectedRoute = input?.route ? routeSummariesWithBaselines[0] : null;
  const primaryIndex = selectedRoute?.indexValue ?? networkIndexed.indexValue;
  const primaryDelta = selectedRoute?.deltaPercent ?? networkIndexed.deltaPercent;
  const primaryBaselineDate = selectedRoute?.baselineDate ?? networkBaseline?.baseDate ?? departureDate;
  const fetchedAt = new Date().toISOString();
  const snapshotScope = `${input?.route ?? "ALL"}${scopeSuffix}`;
  const captureKey = `${snapshotScope}:${departureDate}:${fetchedAt.slice(0, 10)}:${currency}`;
  const snapshotId = observations.length ? await persistAirfareSnapshot({ captureKey, routeKey: snapshotScope, departureDate, currency, environment, networkMedianFare, networkIndexValue: primaryIndex, observations, successfulRoutes, failedRoutes: errors.length }) : null;
  const trendRows = await getAirfareTrend({ routeKey: `${input?.route ?? "ALL"}${scopeSuffix}`, currency, days: historyDays });
  const history = trendRows.reverse().map((row) => ({ date: row.capturedAt.toISOString(), value: row.networkIndexValue, medianFare: row.networkMedianFareCents / 100 }));
  const anomalies = calculateAnomalies(observations);
  const sourceLabel = environment === "test" ? "Duffel Developer Test API" : "Duffel Live API";
  const successfulCollection = observations.length ? fetchedAt : null;

  return {
    fetchedAt,
    departureDate,
    environment,
    currency,
    observations,
    routeSummary: routeSummariesWithBaselines,
    airlineSummary: calculateAirlineSummary(observations, networkMedianFare),
    airlineOptions,
    fareDistribution: calculateFareDistribution(observations),
    anomalies,
    anomalyCount: anomalies.length,
    history,
    historyDays,
    forecast: calculateShortTermProjection(history),
    networkMedianFare,
    networkIndexValue: primaryIndex,
    networkDeltaPercent: primaryDelta,
    baselineDate: primaryBaselineDate,
    indexBasis: "100 is the first persisted median fare for the selected route scope, airline scope, and currency. New snapshots are compared with that baseline; no historical values are invented when the database lacks observations.",
    sourceCount: 1,
    sourceLabels: [sourceLabel],
    pipeline: buildPipeline(successfulRoutes, errors.length, observations.length),
    monitoring: { provider: "Duffel", status: errors.length ? (observations.length ? "partial" : "error") : "healthy", successfulRequests: successfulRoutes, failedRequests: errors.length, lastSuccessfulCollection: successfulCollection },
    cpiNote: "AEROVA is an experimental, offer-observation index. It can supplement CPI-related research by exposing high-frequency fare movement, but it does not replace the official CPI methodology, weights, sampling frame, or publication process.",
    errors: snapshotId || !observations.length ? errors : [...errors, "Snapshot persistence was unavailable; this view is current-only."],
  };
}
