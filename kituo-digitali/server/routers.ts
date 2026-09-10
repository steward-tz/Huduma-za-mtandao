import { z } from "zod";
import { activitySeed, announcementText, findService, serviceCatalog, tutorials } from "../shared/catalog";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  adjustTokens,
  consumeTokens,
  createServiceRun,
  getAnnouncement,
  getNotifications,
  getProfile,
  getRecentServiceRuns,
  getTokenTransactions,
  getTutorialVideos,
  listAdminStats,
  listUsers,
  updateUserVerification,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  portal: router({
    announcement: publicProcedure.query(async () => (await getAnnouncement())?.message ?? announcementText),
    services: publicProcedure.query(() => serviceCatalog),
    tutorials: publicProcedure.query(async () => {
      const stored = await getTutorialVideos();
      return stored.length ? stored : tutorials;
    }),
    profile: protectedProcedure.query(async ({ ctx }) => {
      const stored = await getProfile(ctx.user.id);
      return stored ?? { ...ctx.user, phone: null, verificationStatus: "pending", tokenBalance: 0 };
    }),
    notifications: protectedProcedure.query(({ ctx }) => getNotifications(ctx.user.id)),
    tokenHistory: protectedProcedure.query(({ ctx }) => getTokenTransactions(ctx.user.id)),
    activity: protectedProcedure.query(async ({ ctx }) => {
      const stored = await getRecentServiceRuns(ctx.user.id);
      return stored.length ? stored.map((run) => ({ service: run.serviceName, type: "Matumizi ya huduma", credits: run.credits, status: run.status, reference: run.reference, createdAt: run.createdAt })) : activitySeed;
    }),
    useService: protectedProcedure.input(z.object({ serviceSlug: z.string(), brief: z.string().max(5000).optional() })).mutation(async ({ ctx, input }) => {
      const service = findService(input.serviceSlug);
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
    users: adminProcedure.query(() => listUsers()),
    verifyUser: adminProcedure.input(z.object({ userId: z.number(), status: z.enum(["approved", "rejected", "blocked", "pending"]) })).mutation(({ ctx, input }) => updateUserVerification(ctx.user.id, input.userId, input.status)),
    adjustTokens: adminProcedure.input(z.object({ userId: z.number(), amount: z.number().int().min(-100000).max(100000), description: z.string().min(3).max(300) })).mutation(({ ctx, input }) => adjustTokens({ adminUserId: ctx.user.id, userId: input.userId, amount: input.amount, description: input.description })),
    services: adminProcedure.query(() => serviceCatalog),
  }),
});

export type AppRouter = typeof appRouter;
