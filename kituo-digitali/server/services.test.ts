import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("services router", () => {
  it("returns the original service catalog", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const services = await caller.services.list();

    expect(services.length).toBeGreaterThanOrEqual(4);
    expect(services.some((service) => service.slug === "invoice-studio")).toBe(true);
    expect(services.every((service) => service.name && service.description)).toBe(true);
  });

  it("looks up a service by slug and safely misses unknown slugs", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.services.getBySlug({ slug: "brand-spark" })).resolves.toMatchObject({
      name: "Cheche ya Chapa",
      credits: 4,
    });
    await expect(caller.services.getBySlug({ slug: "not-a-real-tool" })).resolves.toBeNull();
  });
});
