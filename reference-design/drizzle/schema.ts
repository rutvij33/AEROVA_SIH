import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const airfareIndexBaselines = mysqlTable("airfareIndexBaselines", {
  id: int("id").autoincrement().primaryKey(),
  scopeKey: varchar("scopeKey", { length: 64 }).notNull().unique(),
  currency: varchar("currency", { length: 3 }).notNull(),
  baseFareCents: int("baseFareCents").notNull(),
  baseDate: varchar("baseDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const airfareSnapshots = mysqlTable("airfareSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  captureKey: varchar("captureKey", { length: 96 }).unique(),
  routeKey: varchar("routeKey", { length: 32 }).notNull(),
  departureDate: varchar("departureDate", { length: 10 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  environment: varchar("environment", { length: 8 }).notNull(),
  networkMedianFareCents: int("networkMedianFareCents").notNull(),
  networkIndexValue: int("networkIndexValue").notNull(),
  observationsCount: int("observationsCount").notNull(),
  successfulRoutes: int("successfulRoutes").notNull(),
  failedRoutes: int("failedRoutes").notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
});

export const airfareObservations = mysqlTable("airfareObservations", {
  id: int("id").autoincrement().primaryKey(),
  snapshotId: int("snapshotId").notNull(),
  offerId: varchar("offerId", { length: 96 }).notNull(),
  routeKey: varchar("routeKey", { length: 32 }).notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  airline: varchar("airline", { length: 160 }).notNull(),
  amountCents: int("amountCents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  stops: int("stops").notNull(),
  departureDate: varchar("departureDate", { length: 10 }).notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AirfareIndexBaseline = typeof airfareIndexBaselines.$inferSelect;
export type InsertAirfareIndexBaseline = typeof airfareIndexBaselines.$inferInsert;
export type AirfareSnapshot = typeof airfareSnapshots.$inferSelect;
export type InsertAirfareSnapshot = typeof airfareSnapshots.$inferInsert;
export type AirfareObservation = typeof airfareObservations.$inferSelect;
export type InsertAirfareObservation = typeof airfareObservations.$inferInsert;
