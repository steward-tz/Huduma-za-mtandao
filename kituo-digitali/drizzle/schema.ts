import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected", "blocked"]).default("pending").notNull(),
  tokenBalance: int("tokenBalance").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const serviceRuns = mysqlTable("serviceRuns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  serviceSlug: varchar("serviceSlug", { length: 100 }).notNull(),
  serviceName: varchar("serviceName", { length: 150 }).notNull(),
  brief: text("brief").notNull(),
  credits: int("credits").notNull(),
  status: varchar("status", { length: 40 }).default("Imekamilika").notNull(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 80 }).notNull(),
  tokenCost: int("tokenCost").default(2).notNull(),
  isFree: int("isFree").default(0).notNull(),
  isLocked: int("isLocked").default(0).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tokenTransactions = mysqlTable("tokenTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 40 }).notNull(),
  amount: int("amount").notNull(),
  serviceSlug: varchar("serviceSlug", { length: 100 }),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 40 }).notNull().unique(),
  balanceAfter: int("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serviceUsage = mysqlTable("serviceUsage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  serviceSlug: varchar("serviceSlug", { length: 100 }).notNull(),
  serviceName: varchar("serviceName", { length: 180 }).notNull(),
  tokensUsed: int("tokensUsed").notNull(),
  reference: varchar("reference", { length: 40 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tutorialVideos = mysqlTable("tutorialVideos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  videoUrl: text("videoUrl").notNull(),
  tokenCost: int("tokenCost").default(2).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  message: text("message").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const adminActions = mysqlTable("adminActions", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  targetUserId: int("targetUserId"),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ServiceRun = typeof serviceRuns.$inferSelect;
export type InsertServiceRun = typeof serviceRuns.$inferInsert;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type TutorialVideo = typeof tutorialVideos.$inferSelect;
export type ServiceDefinition = typeof services.$inferSelect;
