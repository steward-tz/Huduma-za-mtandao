import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  firstName: varchar("firstName", { length: 80 }),
  lastName: varchar("lastName", { length: 80 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }).unique(),
  pinHash: varchar("pinHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "admin", "moderator", "support", "user"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["active", "pending", "blocked", "deleted"]).default("pending").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected", "blocked"]).default("pending").notNull(),
  language: varchar("language", { length: 10 }).default("sw").notNull(),
  tokenBalance: int("tokenBalance").default(0).notNull(),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  pinChangedAt: timestamp("pinChangedAt"),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const roles = mysqlTable("roles", { id: int("id").autoincrement().primaryKey(), slug: varchar("slug", { length: 50 }).notNull().unique(), name: varchar("name", { length: 100 }).notNull(), description: text("description").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const permissions = mysqlTable("permissions", { id: int("id").autoincrement().primaryKey(), slug: varchar("slug", { length: 100 }).notNull().unique(), name: varchar("name", { length: 120 }).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const rolePermissions = mysqlTable("rolePermissions", { id: int("id").autoincrement().primaryKey(), roleId: int("roleId").notNull(), permissionId: int("permissionId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const userPermissions = mysqlTable("userPermissions", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), permissionId: int("permissionId").notNull(), grantedBy: int("grantedBy").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });

export const serviceRuns = mysqlTable("serviceRuns", { id: int("id").autoincrement().primaryKey(), userId: int("userId"), serviceSlug: varchar("serviceSlug", { length: 100 }).notNull(), serviceName: varchar("serviceName", { length: 150 }).notNull(), brief: text("brief").notNull(), credits: int("credits").notNull(), status: varchar("status", { length: 40 }).default("Imekamilika").notNull(), reference: varchar("reference", { length: 32 }).notNull().unique(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const services = mysqlTable("services", { id: int("id").autoincrement().primaryKey(), slug: varchar("slug", { length: 100 }).notNull().unique(), name: varchar("name", { length: 180 }).notNull(), description: text("description").notNull(), icon: varchar("icon", { length: 80 }).notNull(), tokenCost: int("tokenCost").default(2).notNull(), isFree: int("isFree").default(0).notNull(), isLocked: int("isLocked").default(0).notNull(), category: varchar("category", { length: 100 }).notNull(), actionUrl: text("actionUrl"), sortOrder: int("sortOrder").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export const tokenTransactions = mysqlTable("tokenTransactions", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), operatorId: int("operatorId"), type: varchar("type", { length: 40 }).notNull(), amount: int("amount").notNull(), serviceSlug: varchar("serviceSlug", { length: 100 }), description: text("description").notNull(), status: varchar("status", { length: 30 }).default("successful").notNull(), reference: varchar("reference", { length: 40 }).notNull().unique(), balanceAfter: int("balanceAfter").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const serviceUsage = mysqlTable("serviceUsage", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), serviceSlug: varchar("serviceSlug", { length: 100 }).notNull(), serviceName: varchar("serviceName", { length: 180 }).notNull(), tokensUsed: int("tokensUsed").notNull(), reference: varchar("reference", { length: 40 }).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const tutorialVideos = mysqlTable("tutorialVideos", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 180 }).notNull(), description: text("description").notNull(), videoUrl: text("videoUrl").notNull(), tokenCost: int("tokenCost").default(2).notNull(), isActive: int("isActive").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export const announcements = mysqlTable("announcements", { id: int("id").autoincrement().primaryKey(), message: text("message").notNull(), isActive: int("isActive").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const notifications = mysqlTable("notifications", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), title: varchar("title", { length: 180 }).notNull(), message: text("message").notNull(), isRead: int("isRead").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const messages = mysqlTable("messages", { id: int("id").autoincrement().primaryKey(), senderId: int("senderId").notNull(), recipientId: int("recipientId"), subject: varchar("subject", { length: 180 }).notNull(), body: text("body").notNull(), isBroadcast: int("isBroadcast").default(0).notNull(), isRead: int("isRead").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const advertisements = mysqlTable("advertisements", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 180 }).notNull(), description: text("description").notNull(), imageUrl: text("imageUrl"), linkUrl: text("linkUrl"), startAt: timestamp("startAt"), endAt: timestamp("endAt"), status: varchar("status", { length: 30 }).default("draft").notNull(), createdBy: int("createdBy").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export const languages = mysqlTable("languages", { id: int("id").autoincrement().primaryKey(), code: varchar("code", { length: 10 }).notNull().unique(), name: varchar("name", { length: 80 }).notNull(), isActive: int("isActive").default(1).notNull() });
export const appearanceSettings = mysqlTable("appearanceSettings", { id: int("id").autoincrement().primaryKey(), websiteName: varchar("websiteName", { length: 180 }).default("HUDUMA ZA MTANDAONI").notNull(), primaryColor: varchar("primaryColor", { length: 20 }).default("#18b969").notNull(), secondaryColor: varchar("secondaryColor", { length: 20 }).default("#071a36").notNull(), backgroundColor: varchar("backgroundColor", { length: 20 }).default("#071a36").notNull(), textColor: varchar("textColor", { length: 20 }).default("#ffffff").notNull(), borderRadius: int("borderRadius").default(12).notNull(), logoUrl: text("logoUrl"), faviconUrl: text("faviconUrl"), darkMode: int("darkMode").default(1).notNull(), updatedBy: int("updatedBy"), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export const systemSettings = mysqlTable("systemSettings", { id: int("id").autoincrement().primaryKey(), settingKey: varchar("settingKey", { length: 120 }).notNull().unique(), settingValue: text("settingValue").notNull(), updatedBy: int("updatedBy"), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export const adminActions = mysqlTable("adminActions", { id: int("id").autoincrement().primaryKey(), adminUserId: int("adminUserId").notNull(), targetUserId: int("targetUserId"), action: varchar("action", { length: 100 }).notNull(), details: text("details").notNull(), reason: text("reason").notNull(), ipAddress: varchar("ipAddress", { length: 64 }), userAgent: text("userAgent"), createdAt: timestamp("createdAt").defaultNow().notNull() });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ServiceRun = typeof serviceRuns.$inferSelect;
export type InsertServiceRun = typeof serviceRuns.$inferInsert;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type TutorialVideo = typeof tutorialVideos.$inferSelect;
export type ServiceDefinition = typeof services.$inferSelect;
