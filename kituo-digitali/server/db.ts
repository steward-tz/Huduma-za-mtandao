import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  adminActions,
  announcements,
  notifications,
  serviceRuns,
  serviceUsage,
  services,
  tokenTransactions,
  tutorialVideos,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "phone", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; updateSet.verificationStatus = "approved"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createServiceRun(run: typeof serviceRuns.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(serviceRuns).values(run);
  const result = await db.select().from(serviceRuns).where(eq(serviceRuns.reference, run.reference)).limit(1);
  return result[0];
}

export async function getRecentServiceRuns(userId?: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return userId
    ? db.select().from(serviceRuns).where(eq(serviceRuns.userId, userId)).orderBy(desc(serviceRuns.createdAt)).limit(limit)
    : db.select().from(serviceRuns).orderBy(desc(serviceRuns.createdAt)).limit(limit);
}

export async function getProfile(userId: number) {
  return getUserById(userId);
}

export async function getTokenTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tokenTransactions).where(eq(tokenTransactions.userId, userId)).orderBy(desc(tokenTransactions.createdAt)).limit(limit);
}

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(30);
}

export async function getAnnouncement() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(announcements).where(eq(announcements.isActive, 1)).orderBy(desc(announcements.createdAt)).limit(1);
  return result[0];
}

export async function getTutorialVideos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorialVideos).where(eq(tutorialVideos.isActive, 1)).orderBy(desc(tutorialVideos.createdAt));
}

export async function consumeTokens(input: { userId: number; serviceSlug: string; serviceName: string; cost: number; description: string }) {
  const db = await getDb();
  if (!db) return { ok: false as const, reason: "database" as const };
  return db.transaction(async (tx) => {
    const current = (await tx.select({ verificationStatus: users.verificationStatus, tokenBalance: users.tokenBalance }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
    if (!current || current.verificationStatus !== "approved") return { ok: false as const, reason: "unverified" as const };
    if (current.tokenBalance < input.cost) return { ok: false as const, reason: "insufficient" as const };
    const updated = await tx.update(users).set({ tokenBalance: sql`${users.tokenBalance} - ${input.cost}` }).where(and(eq(users.id, input.userId), eq(users.verificationStatus, "approved"), gte(users.tokenBalance, input.cost)));
    const result = updated as unknown as { affectedRows?: number };
    if (result.affectedRows === 0) return { ok: false as const, reason: "insufficient" as const };
    const profile = (await tx.select({ tokenBalance: users.tokenBalance }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
    const reference = `TK-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const usageReference = `US-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    await tx.insert(tokenTransactions).values({ userId: input.userId, type: "deduction", amount: -input.cost, serviceSlug: input.serviceSlug, description: input.description, reference, balanceAfter: profile?.tokenBalance ?? 0 });
    await tx.insert(serviceUsage).values({ userId: input.userId, serviceSlug: input.serviceSlug, serviceName: input.serviceName, tokensUsed: input.cost, reference: usageReference });
    await tx.insert(notifications).values({ userId: input.userId, title: "Tokeni zimetumika", message: `Tokeni ${input.cost} zimetumika kwenye ${input.serviceName}.`, isRead: 0 });
    return { ok: true as const, balance: profile?.tokenBalance ?? 0, reference };
  });
}

export async function adjustTokens(input: { adminUserId: number; userId: number; amount: number; description: string }) {
  const db = await getDb();
  if (!db) return undefined;
  return db.transaction(async (tx) => {
    const current = (await tx.select({ tokenBalance: users.tokenBalance }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
    const balance = Math.max(0, (current?.tokenBalance ?? 0) + input.amount);
    await tx.update(users).set({ tokenBalance: balance }).where(eq(users.id, input.userId));
    const reference = `AD-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    await tx.insert(tokenTransactions).values({ userId: input.userId, type: input.amount >= 0 ? "addition" : "removal", amount: input.amount, description: input.description, reference, balanceAfter: balance });
    await tx.insert(adminActions).values({ adminUserId: input.adminUserId, targetUserId: input.userId, action: input.amount >= 0 ? "add_tokens" : "remove_tokens", details: input.description });
    await tx.insert(notifications).values({ userId: input.userId, title: input.amount >= 0 ? "Tokeni zimeongezwa" : "Tokeni zimeondolewa", message: `${Math.abs(input.amount)} tokeni ${input.amount >= 0 ? "zimeongezwa" : "zimeondolewa"}.`, isRead: 0 });
    return { balance, reference };
  });
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
}

export async function updateUserVerification(adminUserId: number, userId: number, status: "approved" | "rejected" | "blocked" | "pending") {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ verificationStatus: status }).where(eq(users.id, userId));
  await db.insert(adminActions).values({ adminUserId, targetUserId: userId, action: `user_${status}`, details: `Mabadiliko ya hali kuwa ${status}` });
  await db.insert(notifications).values({ userId, title: "Hali ya akaunti imebadilika", message: `Akaunti yako sasa iko katika hali: ${status}.`, isRead: 0 });
  return getUserById(userId);
}

export async function listAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, pendingUsers: 0, approvedUsers: 0, totalTokensIssued: 0, totalTokensUsed: 0, totalServiceUsage: 0 };
  const allUsers = await db.select().from(users);
  const transactions = await db.select().from(tokenTransactions);
  const usage = await db.select().from(serviceUsage);
  return { totalUsers: allUsers.length, pendingUsers: allUsers.filter((u) => u.verificationStatus === "pending").length, approvedUsers: allUsers.filter((u) => u.verificationStatus === "approved").length, totalTokensIssued: transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0), totalTokensUsed: Math.abs(transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)), totalServiceUsage: usage.length };
}
