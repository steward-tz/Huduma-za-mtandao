import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the built-in auth flow. */
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

export const serviceRuns = mysqlTable("serviceRuns", {
  id: int("id").autoincrement().primaryKey(),
  serviceSlug: varchar("serviceSlug", { length: 100 }).notNull(),
  serviceName: varchar("serviceName", { length: 150 }).notNull(),
  brief: text("brief").notNull(),
  credits: int("credits").notNull(),
  status: varchar("status", { length: 40 }).default("Complete").notNull(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ServiceRun = typeof serviceRuns.$inferSelect;
export type InsertServiceRun = typeof serviceRuns.$inferInsert;
