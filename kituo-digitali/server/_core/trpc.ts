import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { hasPermission } from "../db";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !['super_admin', 'admin', 'moderator', 'support'].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export const adminPermissionProcedure = (permission: string) => t.procedure.use(t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user || !["super_admin", "admin", "moderator", "support"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  if (ctx.user.role !== "super_admin" && !(await hasPermission(ctx.user.id, permission))) throw new TRPCError({ code: "FORBIDDEN", message: "Huna ruhusa ya kufanya kitendo hiki." });
  return next({ ctx: { ...ctx, user: ctx.user } });
}));
