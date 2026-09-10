import { z } from "zod";
import { serviceCatalog, activitySeed, findService } from "../shared/catalog";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createServiceRun, getRecentServiceRuns } from "./db";

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
  services: router({
    list: publicProcedure.query(() => serviceCatalog),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => findService(input.slug) ?? null),
  }),
  activity: router({
    recent: publicProcedure.query(async () => {
      const stored = await getRecentServiceRuns();
      return stored.length > 0
        ? stored.map((run) => ({
            service: run.serviceName,
            type: "Workbench run",
            credits: run.credits,
            status: run.status,
            reference: run.reference,
            createdAt: run.createdAt.toISOString(),
          }))
        : activitySeed;
    }),
  }),
  workItems: router({
    create: publicProcedure.input(z.object({ serviceSlug: z.string(), brief: z.string().min(3).max(5000) })).mutation(async ({ input }) => {
      const service = findService(input.serviceSlug);
      if (!service) throw new Error("That service is not available.");
      const reference = `KD-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const created = await createServiceRun({
        serviceSlug: service.slug,
        serviceName: service.name,
        brief: input.brief,
        credits: service.credits,
        status: "Complete",
        reference,
      });
      return { reference: created?.reference ?? reference, service: service.name };
    }),
  }),
});

export type AppRouter = typeof appRouter;
