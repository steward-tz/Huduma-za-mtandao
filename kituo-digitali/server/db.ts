import { and, desc, eq, gte, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  adminActions,
  advertisements,
  appearanceSettings,
  announcements,
  messages,
  permissions,
  roles,
  notifications,
  serviceRuns,
  serviceUsage,
  services,
  tokenTransactions,
  tutorialVideos,
  userPermissions,
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
  else if (user.openId === ENV.ownerOpenId) { values.role = "super_admin"; updateSet.role = "super_admin"; updateSet.verificationStatus = "approved"; updateSet.accountStatus = "active"; }
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
    await tx.insert(adminActions).values({ adminUserId: input.adminUserId, targetUserId: input.userId, action: input.amount >= 0 ? "add_tokens" : "remove_tokens", details: input.description, reason: input.description });
    await tx.insert(notifications).values({ userId: input.userId, title: input.amount >= 0 ? "Tokeni zimeongezwa" : "Tokeni zimeondolewa", message: `${Math.abs(input.amount)} tokeni ${input.amount >= 0 ? "zimeongezwa" : "zimeondolewa"}.`, isRead: 0 });
    return { balance, reference };
  });
}

export async function listUsers(filters?: { search?: string; status?: "active" | "pending" | "blocked" | "deleted" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(users.accountStatus, filters.status));
  if (filters?.search) conditions.push(or(like(users.name, `%${filters.search}%`), like(users.phone, `%${filters.search}%`), like(users.email, `%${filters.search}%`)));
  return db.select().from(users).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(users.createdAt)).limit(100);
}

export async function updateUserVerification(adminUserId: number, userId: number, status: "approved" | "rejected" | "blocked" | "pending") {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ verificationStatus: status }).where(eq(users.id, userId));
  await db.insert(adminActions).values({ adminUserId, targetUserId: userId, action: `user_${status}`, details: `Mabadiliko ya hali kuwa ${status}`, reason: `Mabadiliko ya hali kuwa ${status}` });
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


export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.phone, phone)).limit(1))[0];
}

export async function createLocalUser(input: { firstName: string; lastName: string; phone: string; pinHash: string }) {
  const db = await getDb();
  if (!db) return undefined;
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  await db.insert(users).values({ openId: `local:${input.phone}`, firstName: input.firstName, lastName: input.lastName, name: fullName, phone: input.phone, pinHash: input.pinHash, loginMethod: "phone_pin", role: "user", accountStatus: "active", verificationStatus: "pending", tokenBalance: 0, pinChangedAt: new Date() });
  return getUserByPhone(input.phone);
}

export async function recordLoginFailure(userId: number, attempts: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ failedLoginAttempts: attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null }).where(eq(users.id, userId));
}

export async function clearLoginFailures(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ failedLoginAttempts: 0, lockedUntil: null, lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updateUserAccount(userId: number, input: { firstName?: string; lastName?: string; language?: string; profileImageUrl?: string | null }) {
  const db = await getDb();
  if (!db) return undefined;
  const patch: Record<string, unknown> = {};
  if (input.firstName !== undefined) patch.firstName = input.firstName;
  if (input.lastName !== undefined) patch.lastName = input.lastName;
  if (input.firstName !== undefined || input.lastName !== undefined) patch.name = `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim();
  if (input.language !== undefined) patch.language = input.language;
  if (input.profileImageUrl !== undefined) patch.profileImageUrl = input.profileImageUrl;
  if (Object.keys(patch).length) await db.update(users).set(patch).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function changeUserPin(userId: number, pinHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ pinHash, pinChangedAt: new Date() }).where(eq(users.id, userId));
  return true;
}

export async function setAccountStatus(adminUserId: number, userId: number, status: "active" | "blocked" | "deleted", reason: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ accountStatus: status, deletedAt: status === "deleted" ? new Date() : null, verificationStatus: status === "blocked" ? "blocked" : "pending" }).where(eq(users.id, userId));
  await db.insert(adminActions).values({ adminUserId, targetUserId: userId, action: `account_${status}`, details: reason, reason });
  await db.insert(notifications).values({ userId, title: `Akaunti ${status}`, message: reason, isRead: 0 });
  return getUserById(userId);
}

export async function listAllTransactions(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tokenTransactions).orderBy(desc(tokenTransactions.createdAt)).limit(limit);
}

export async function getUserMessages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.recipientId, userId)).orderBy(desc(messages.createdAt)).limit(100);
}

export async function sendMessage(input: { senderId: number; recipientId?: number; subject: string; body: string; isBroadcast?: boolean }) {
  const db = await getDb();
  if (!db) return undefined;
  if (input.isBroadcast) {
    const all = await db.select({ id: users.id }).from(users).where(eq(users.accountStatus, "active"));
    for (const recipient of all) {
      await db.insert(messages).values({ senderId: input.senderId, recipientId: recipient.id, subject: input.subject, body: input.body, isBroadcast: 1, isRead: 0 });
      await db.insert(notifications).values({ userId: recipient.id, title: input.subject, message: input.body, isRead: 0 });
    }
  } else if (input.recipientId) {
    await db.insert(messages).values({ senderId: input.senderId, recipientId: input.recipientId, subject: input.subject, body: input.body, isBroadcast: 0, isRead: 0 });
    await db.insert(notifications).values({ userId: input.recipientId, title: input.subject, message: input.body, isRead: 0 });
  }
  return true;
}

export async function listAdvertisements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(advertisements).orderBy(desc(advertisements.createdAt)).limit(100);
}

export async function saveAdvertisement(input: { adminUserId: number; id?: number; title: string; description: string; imageUrl?: string; linkUrl?: string; status: string }) {
  const db = await getDb();
  if (!db) return undefined;
  if (input.id) await db.update(advertisements).set({ title: input.title, description: input.description, imageUrl: input.imageUrl, linkUrl: input.linkUrl, status: input.status }).where(eq(advertisements.id, input.id));
  else await db.insert(advertisements).values({ createdBy: input.adminUserId, title: input.title, description: input.description, imageUrl: input.imageUrl, linkUrl: input.linkUrl, status: input.status });
  await db.insert(adminActions).values({ adminUserId: input.adminUserId, action: input.id ? "advertisement_update" : "advertisement_create", details: `${input.title}`, reason: `${input.title}` });
  return true;
}

export async function getAnalytics() {
  const db = await getDb();
  if (!db) return { daily: [], weekly: [], monthly: [], popular: [] };
  const usage = await db.select().from(serviceUsage).orderBy(desc(serviceUsage.createdAt)).limit(1000);
  const counts = new Map<string, number>();
  for (const row of usage) counts.set(row.serviceName, (counts.get(row.serviceName) ?? 0) + 1);
  return { daily: usage.slice(0, 30), weekly: usage.slice(0, 100), monthly: usage, popular: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([service, count]) => ({ service, count })) };
}


export async function saveService(input: { adminUserId: number; id?: number; slug: string; name: string; description: string; icon: string; tokenCost: number; isFree: boolean; isLocked: boolean; category: string; sortOrder: number }) {
  const db = await getDb();
  if (!db) return undefined;
  const values = { slug: input.slug, name: input.name, description: input.description, icon: input.icon, tokenCost: input.tokenCost, isFree: input.isFree ? 1 : 0, isLocked: input.isLocked ? 1 : 0, category: input.category, sortOrder: input.sortOrder };
  if (input.id) await db.update(services).set(values).where(eq(services.id, input.id));
  else await db.insert(services).values(values);
  await db.insert(adminActions).values({ adminUserId: input.adminUserId, action: input.id ? "service_update" : "service_create", details: `${input.name}`, reason: `${input.name}` });
  return true;
}

export async function deleteService(adminUserId: number, id: number, reason: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(services).where(eq(services.id, id));
  await db.insert(adminActions).values({ adminUserId, action: "service_delete", details: reason, reason });
  return true;
}

export async function getAppearance() {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(appearanceSettings).limit(1))[0];
}

export async function saveAppearance(input: { adminUserId: number; websiteName: string; primaryColor: string; secondaryColor: string; backgroundColor: string; textColor: string; borderRadius: number; darkMode: boolean }) {
  const db = await getDb();
  if (!db) return undefined;
  const values = { websiteName: input.websiteName, primaryColor: input.primaryColor, secondaryColor: input.secondaryColor, backgroundColor: input.backgroundColor, textColor: input.textColor, borderRadius: input.borderRadius, darkMode: input.darkMode ? 1 : 0, updatedBy: input.adminUserId };
  const current = await getAppearance();
  if (current) await db.update(appearanceSettings).set(values).where(eq(appearanceSettings.id, current.id));
  else await db.insert(appearanceSettings).values(values);
  await db.insert(adminActions).values({ adminUserId: input.adminUserId, action: "appearance_update", details: input.websiteName, reason: "Mabadiliko ya appearance" });
  return getAppearance();
}

export async function listAuditActions(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminActions).orderBy(desc(adminActions.createdAt)).limit(limit);
}

export async function listRolesAndPermissions() {
  const db = await getDb();
  if (!db) return { roles: [], permissions: [] };
  const roleRows = await db.select().from(roles);
  const permissionRows = await db.select().from(permissions);
  return { roles: roleRows, permissions: permissionRows };
}

export async function grantUserPermission(input: { adminUserId: number; userId: number; permissionId: number }) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(userPermissions).values({ userId: input.userId, permissionId: input.permissionId, grantedBy: input.adminUserId });
  await db.insert(adminActions).values({ adminUserId: input.adminUserId, targetUserId: input.userId, action: "permission_grant", details: `Permission ${input.permissionId}`, reason: "Permission imetolewa" });
  return true;
}


export async function setUserRole(adminUserId: number, userId: number, role: "super_admin" | "admin" | "moderator" | "support" | "user", reason: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  await db.insert(adminActions).values({ adminUserId, targetUserId: userId, action: "role_change", details: `${role}: ${reason}`, reason });
  return getUserById(userId);
}

export async function resetUserPin(adminUserId: number, userId: number, pinHash: string, reason: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ pinHash, pinChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null }).where(eq(users.id, userId));
  await db.insert(adminActions).values({ adminUserId, targetUserId: userId, action: "pin_reset", details: reason, reason });
  return true;
}
