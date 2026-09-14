import { z } from "zod";
import { activitySeed, announcementText, findService, serviceCatalog, tutorials } from "../shared/catalog";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, adminPermissionProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  adjustTokens,
  changeUserPin,
  clearLoginFailures,
  consumeTokens,
  createLocalUser,
  createServiceRun,
  deleteService,
  getAnnouncement,
  getNotifications,
  getProfile,
  getServices,
  getServiceBySlug,
  getRecentServiceRuns,
  getTokenTransactions,
  getTutorialVideos,
  getUserByPhone,
  getUserMessages,
  getAnalytics,
  getAppearance,
  listAdvertisements,
  listAllTransactions,
  listAuditActions,
  listRolesAndPermissions,
  listAdminStats,
  listUsers,
  recordLoginFailure,
  requestPinReset,
  saveAdvertisement,
  saveAppearance,
  saveService,
  sendMessage,
  setAccountStatus,
  updateUserVerification,
  updateUserAccount,
  grantUserPermission,
  resetUserPin,
  setUserRole,
} from "./db";
import { TRPCError } from "@trpc/server";
import { checkLoginRateLimit, hashPin, localCookieName, localSessionCookieOptions, normalizePhone, signLocalSession, validatePin, verifyPin } from "./_core/localAuth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure.input(z.object({ firstName: z.string().trim().min(2).max(80), lastName: z.string().trim().min(2).max(80), phone: z.string().trim(), pin: z.string(), confirmPin: z.string() })).mutation(async ({ ctx, input }) => {
      if (!validatePin(input.pin) || input.pin !== input.confirmPin) throw new TRPCError({ code: "BAD_REQUEST", message: "PIN lazima iwe tarakimu 6 na zifanane." });
      let phone: string;
      try { phone = normalizePhone(input.phone); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Namba ya simu si sahihi." }); }
      if (await getUserByPhone(phone)) throw new TRPCError({ code: "CONFLICT", message: "Namba hii tayari imesajiliwa." });
      const user = await createLocalUser({ firstName: input.firstName, lastName: input.lastName, phone, pinHash: await hashPin(input.pin) });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Hifadhidata haipatikani kwa sasa." });
      ctx.res.cookie(localCookieName(), await signLocalSession(user.id), localSessionCookieOptions());
      return { id: user.id, name: user.name, phone: user.phone, status: user.verificationStatus };
    }),
    login: publicProcedure.input(z.object({ phone: z.string().trim(), pin: z.string() })).mutation(async ({ ctx, input }) => {
      const rateKey = `${ctx.req.ip ?? "unknown"}:${input.phone.slice(-9)}`;
      if (!checkLoginRateLimit(rateKey)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Majaribio mengi ya kuingia. Jaribu tena baada ya dakika 15." });
      let phone: string;
      try { phone = normalizePhone(input.phone); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Namba ya simu si sahihi." }); }
      const user = await getUserByPhone(phone);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Namba au PIN si sahihi." });
      if (user.accountStatus === "blocked") throw new TRPCError({ code: "FORBIDDEN", message: "Akaunti yako imefungwa. Wasiliana na admin." });
      if (user.accountStatus === "deleted") throw new TRPCError({ code: "FORBIDDEN", message: "Akaunti hii imefutwa." });
      if (user.lockedUntil && user.lockedUntil > new Date()) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Majaribio yamezidi. Jaribu tena baada ya dakika 15." });
      if (!user.pinHash || !(await verifyPin(input.pin, user.pinHash))) { await recordLoginFailure(user.id, user.failedLoginAttempts + 1); throw new TRPCError({ code: "UNAUTHORIZED", message: "Namba au PIN si sahihi." }); }
      await clearLoginFailures(user.id);
      ctx.res.cookie(localCookieName(), await signLocalSession(user.id), localSessionCookieOptions());
      return { id: user.id, name: user.name, phone: user.phone, role: user.role };
    }),
    requestPinReset: publicProcedure.input(z.object({ phone: z.string().trim() })).mutation(async ({ input }) => {
      try { await requestPinReset(normalizePhone(input.phone)); } catch { /* Keep reset responses generic to avoid account enumeration. */ }
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(localCookieName(), localSessionCookieOptions());
      return { success: true } as const;
    }),
  }),
  portal: router({
    announcement: publicProcedure.query(async () => (await getAnnouncement())?.message ?? announcementText),
    appearance: publicProcedure.query(() => getAppearance()),
    services: publicProcedure.query(async () => { const stored = await getServices(); return stored.length ? stored.map((item) => ({ ...item, kind: item.isLocked ? "locked" : item.isFree ? "free" : "paid" })) : serviceCatalog; }),
    tutorials: publicProcedure.query(async () => {
      const stored = await getTutorialVideos();
      return stored.length ? stored : tutorials;
    }),
    profile: protectedProcedure.query(async ({ ctx }) => {
      const stored = await getProfile(ctx.user.id);
      return stored ?? { ...ctx.user, phone: null, verificationStatus: "pending", tokenBalance: 0 };
    }),
    notifications: protectedProcedure.query(({ ctx }) => getNotifications(ctx.user.id)),
    messages: protectedProcedure.query(({ ctx }) => getUserMessages(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({ firstName: z.string().trim().min(2).max(80).optional(), lastName: z.string().trim().min(2).max(80).optional(), language: z.enum(["sw", "en"]).optional(), profileImageUrl: z.string().url().nullable().optional() })).mutation(({ ctx, input }) => updateUserAccount(ctx.user.id, input)),
    uploadProfileImage: protectedProcedure.input(z.object({ dataUrl: z.string().max(3_000_000) })).mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Chagua picha ya JPG, PNG au WebP." });
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 2 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "Picha isizidi MB 2." });
      const stored = await storagePut(`profiles/${ctx.user.id}.image`, buffer, match[1]);
      return updateUserAccount(ctx.user.id, { profileImageUrl: stored.url });
    }),
    changePin: protectedProcedure.input(z.object({ currentPin: z.string(), newPin: z.string(), confirmPin: z.string() })).mutation(async ({ ctx, input }) => {
      if (!validatePin(input.newPin) || input.newPin !== input.confirmPin) throw new TRPCError({ code: "BAD_REQUEST", message: "PIN mpya lazima iwe tarakimu 6 na zifanane." });
      const user = await getUserByPhone(ctx.user.phone ?? "");
      if (!user?.pinHash || !(await verifyPin(input.currentPin, user.pinHash))) throw new TRPCError({ code: "UNAUTHORIZED", message: "PIN ya sasa si sahihi." });
      await changeUserPin(ctx.user.id, await hashPin(input.newPin));
      return { success: true } as const;
    }),
    tokenHistory: protectedProcedure.query(({ ctx }) => getTokenTransactions(ctx.user.id)),
    activity: protectedProcedure.query(async ({ ctx }) => {
      const stored = await getRecentServiceRuns(ctx.user.id);
      return stored.length ? stored.map((run) => ({ service: run.serviceName, type: "Matumizi ya huduma", credits: run.credits, status: run.status, reference: run.reference, createdAt: run.createdAt })) : activitySeed;
    }),
    useService: protectedProcedure.input(z.object({ serviceSlug: z.string(), brief: z.string().max(5000).optional() })).mutation(async ({ ctx, input }) => {
      const storedService = await getServiceBySlug(input.serviceSlug);
      const service = storedService ? { ...storedService, kind: storedService.isLocked ? "locked" : storedService.isFree ? "free" : "paid" } : findService(input.serviceSlug);
      if (!service) throw new TRPCError({ code: "NOT_FOUND", message: "Huduma haijapatikana." });
      if (service.kind === "locked") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Huduma hii imefungwa kwa sasa." });
      const cost = service.tokenCost;
      if (cost > 0) {
        const result = await consumeTokens({ userId: ctx.user.id, serviceSlug: service.slug, serviceName: service.name, cost, description: `Matumizi ya ${service.name}` });
        if (result.reason === "unverified") throw new TRPCError({ code: "FORBIDDEN", message: "Akaunti yako haijathibitishwa na admin. Tafadhali wasiliana na admin." });
        if (result.reason === "insufficient") throw new TRPCError({ code: "FORBIDDEN", message: "Huna tokeni za kutosha. Tafadhali nunua tokeni." });
        if (result.reason === "database") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Hifadhidata haipatikani kwa sasa." });
      }
      const reference = `HM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await createServiceRun({ userId: ctx.user.id, serviceSlug: service.slug, serviceName: service.name, brief: input.brief ?? "Matumizi kupitia portal ya HUDUMA ZA MTANDAONI", credits: cost, status: "Imekamilika", reference });
      return { ok: true, reference, service: service.name, cost };
    }),
  }),
  admin: router({
    stats: adminProcedure.query(() => listAdminStats()),
    users: adminProcedure.input(z.object({ search: z.string().optional(), status: z.enum(["active", "pending", "blocked", "deleted"]).optional() }).optional()).query(({ input }) => listUsers(input)),
    verifyUser: adminProcedure.input(z.object({ userId: z.number(), status: z.enum(["approved", "rejected", "blocked", "pending"]) })).mutation(({ ctx, input }) => updateUserVerification(ctx.user.id, input.userId, input.status)),
    adjustTokens: adminPermissionProcedure("tokens.manage").input(z.object({ userId: z.number(), amount: z.number().int().min(-100000).max(100000), description: z.string().min(3).max(300) })).mutation(({ ctx, input }) => adjustTokens({ adminUserId: ctx.user.id, userId: input.userId, amount: input.amount, description: input.description })),
    services: adminProcedure.query(async () => { const stored = await getServices(); return stored.length ? stored : serviceCatalog; }),
    analytics: adminProcedure.query(() => getAnalytics()),
    transactions: adminProcedure.query(() => listAllTransactions()),
    messages: adminProcedure.query(({ ctx }) => getUserMessages(ctx.user.id)),
    sendMessage: adminProcedure.input(z.object({ recipientId: z.number().optional(), subject: z.string().min(2).max(180), body: z.string().min(2).max(5000), broadcast: z.boolean().default(false) })).mutation(({ ctx, input }) => sendMessage({ senderId: ctx.user.id, recipientId: input.recipientId, subject: input.subject, body: input.body, isBroadcast: input.broadcast })),
    advertisements: adminProcedure.query(() => listAdvertisements()),
    saveAdvertisement: adminProcedure.input(z.object({ id: z.number().optional(), title: z.string().min(2).max(180), description: z.string().min(2).max(5000), imageUrl: z.string().url().optional(), linkUrl: z.string().url().optional(), status: z.enum(["draft", "active", "paused", "expired"]) })).mutation(({ ctx, input }) => saveAdvertisement({ adminUserId: ctx.user.id, ...input })),
    setAccountStatus: adminProcedure.input(z.object({ userId: z.number(), status: z.enum(["active", "blocked", "deleted"]), reason: z.string().min(3).max(500) })).mutation(({ ctx, input }) => setAccountStatus(ctx.user.id, input.userId, input.status, input.reason)),
    setUserRole: adminPermissionProcedure("users.roles").input(z.object({ userId: z.number(), role: z.enum(["super_admin", "admin", "moderator", "support", "user"]), reason: z.string().min(3).max(500) })).mutation(({ ctx, input }) => setUserRole(ctx.user.id, input.userId, input.role, input.reason)),
    resetUserPin: adminProcedure.input(z.object({ userId: z.number(), newPin: z.string(), reason: z.string().min(3).max(500) })).mutation(async ({ ctx, input }) => { if (!validatePin(input.newPin)) throw new TRPCError({ code: "BAD_REQUEST", message: "PIN lazima iwe tarakimu 6." }); return resetUserPin(ctx.user.id, input.userId, await hashPin(input.newPin), input.reason); }),
    servicesCatalog: adminProcedure.query(async () => { const stored = await getServices(); return stored.length ? stored : serviceCatalog; }),
    saveService: adminPermissionProcedure("services.manage").input(z.object({ id: z.number().optional(), slug: z.string().min(2).max(100), name: z.string().min(2).max(180), description: z.string().min(2).max(5000), icon: z.string().min(1).max(80), tokenCost: z.number().int().min(0).max(100000), isFree: z.boolean(), isLocked: z.boolean(), category: z.string().min(2).max(100), sortOrder: z.number().int().min(0).max(10000), isVisible: z.boolean().optional(), isFeatured: z.boolean().optional() })).mutation(({ ctx, input }) => saveService({ adminUserId: ctx.user.id, ...input })),
    deleteService: adminPermissionProcedure("services.manage").input(z.object({ id: z.number(), reason: z.string().min(3).max(500) })).mutation(({ ctx, input }) => deleteService(ctx.user.id, input.id, input.reason)),
    appearance: adminProcedure.query(() => getAppearance()),
    saveAppearance: adminProcedure.input(z.object({ websiteName: z.string().min(2).max(180), primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), borderRadius: z.number().int().min(0).max(40), darkMode: z.boolean() })).mutation(({ ctx, input }) => saveAppearance({ adminUserId: ctx.user.id, ...input })),
    roles: adminProcedure.query(() => listRolesAndPermissions()),
    grantPermission: adminPermissionProcedure("users.permissions").input(z.object({ userId: z.number(), permissionId: z.number() })).mutation(({ ctx, input }) => grantUserPermission({ adminUserId: ctx.user.id, ...input })),
    auditLogs: adminProcedure.query(() => listAuditActions()),
  }),
});

export type AppRouter = typeof appRouter;
