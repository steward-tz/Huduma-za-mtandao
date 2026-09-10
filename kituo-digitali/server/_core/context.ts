import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserById } from "../db";
import { sdk } from "./sdk";
import { localCookieName, verifyLocalSession } from "./localAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function readCookie(header: string | undefined, name: string) {
  if (!header) return undefined;
  const match = header.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try { user = await sdk.authenticateRequest(opts.req); } catch { user = null; }
  if (!user) {
    const token = readCookie(opts.req.headers.cookie, localCookieName());
    const userId = token ? await verifyLocalSession(token) : null;
    if (userId) user = (await getUserById(userId)) ?? null;
  }
  return { req: opts.req, res: opts.res, user };
}
