import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  airfareIndexBaselines,
  airfareObservations,
  airfareSnapshots,
  AirfareIndexBaseline,
  AirfareObservation,
  AirfareSnapshot,
  InsertAirfareIndexBaseline,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateAirfareBaseline({
  scopeKey,
  currency,
  currentFare,
  baseDate,
}: {
  scopeKey: string;
  currency: string;
  currentFare: number;
  baseDate: string;
}): Promise<AirfareIndexBaseline | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(airfareIndexBaselines).where(eq(airfareIndexBaselines.scopeKey, scopeKey)).limit(1);
  if (existing[0]) return existing[0];

  const values: InsertAirfareIndexBaseline = {
    scopeKey,
    currency: currency.slice(0, 3).toUpperCase(),
    baseFareCents: Math.max(1, Math.round(currentFare * 100)),
    baseDate,
  };
  await db.insert(airfareIndexBaselines).values(values).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const created = await db.select().from(airfareIndexBaselines).where(eq(airfareIndexBaselines.scopeKey, scopeKey)).limit(1);
  return created[0] ?? null;
}

export async function persistAirfareSnapshot({
  captureKey,
  routeKey,
  departureDate,
  currency,
  environment,
  networkMedianFare,
  networkIndexValue,
  observations,
  successfulRoutes,
  failedRoutes,
}: {
  captureKey: string;
  routeKey: string;
  departureDate: string;
  currency: string;
  environment: "test" | "live";
  networkMedianFare: number;
  networkIndexValue: number;
  observations: Array<{
    id: string;
    route: string;
    origin: string;
    destination: string;
    airline: string;
    amount: number;
    currency: string;
    stops: number;
  }>;
  successfulRoutes: number;
  failedRoutes: number;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await db.select().from(airfareSnapshots).where(eq(airfareSnapshots.captureKey, captureKey)).limit(1);
    if (existing[0]) return existing[0].id;

    await db.insert(airfareSnapshots).values({
      captureKey,
      routeKey,
      departureDate,
      currency: currency.slice(0, 3).toUpperCase(),
      environment,
      networkMedianFareCents: Math.max(0, Math.round(networkMedianFare * 100)),
      networkIndexValue: Math.max(0, Math.round(networkIndexValue)),
      observationsCount: observations.length,
      successfulRoutes,
      failedRoutes,
    });
    const created = await db.select().from(airfareSnapshots).where(eq(airfareSnapshots.captureKey, captureKey)).limit(1);
    const snapshotId = created[0]?.id ?? null;
    if (!snapshotId || !observations.length) return snapshotId;

    await db.insert(airfareObservations).values(observations.map((observation) => ({
      snapshotId,
      offerId: observation.id.slice(0, 96),
      routeKey: observation.route.replace(" → ", "-").slice(0, 32),
      origin: observation.origin.slice(0, 3),
      destination: observation.destination.slice(0, 3),
      airline: observation.airline.slice(0, 160),
      amountCents: Math.max(0, Math.round(observation.amount * 100)),
      currency: observation.currency.slice(0, 3).toUpperCase(),
      stops: observation.stops,
      departureDate,
    })));
    return snapshotId;
  } catch (error) {
    console.warn("[Database] Failed to persist airfare snapshot:", error);
    return null;
  }
}

export async function getAirfareTrend({ routeKey, currency, days }: { routeKey: string; currency: string; days: number }): Promise<AirfareSnapshot[]> {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000);
  return db.select().from(airfareSnapshots)
    .where(and(
      gte(airfareSnapshots.capturedAt, since),
      eq(airfareSnapshots.currency, currency.slice(0, 3).toUpperCase()),
      eq(airfareSnapshots.routeKey, routeKey),
    ))
    .orderBy(desc(airfareSnapshots.capturedAt));
}

export async function getAirfareObservationRows({ snapshotIds }: { snapshotIds: number[] }): Promise<AirfareObservation[]> {
  const db = await getDb();
  if (!db || !snapshotIds.length) return [];
  const rows: AirfareObservation[] = [];
  for (const snapshotId of snapshotIds) {
    const result = await db.select().from(airfareObservations).where(eq(airfareObservations.snapshotId, snapshotId));
    rows.push(...result);
  }
  return rows;
}
