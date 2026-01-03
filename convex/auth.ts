import { v } from "convex/values";
import { query } from "./_generated/server";
import { isSiteAdmin } from "./permissions";

export const getCurrentUserStatus = query({
  args: {},
  returns: v.object({
    isAdmin: v.boolean(),
    userId: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.tokenIdentifier) {
      return { isAdmin: false, userId: null };
    }

    const userId = identity.tokenIdentifier;
    const isAdmin = await isSiteAdmin(ctx, userId);

    return { isAdmin, userId };
  },
});

export const getCurrentUserId = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.tokenIdentifier ?? null;
  },
});
