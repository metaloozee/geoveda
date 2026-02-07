import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getAppUser,
  getCurrentUser,
  requireAdmin,
  requireAuthWithWallet,
} from "./lib/permissions";

const userRole = v.union(
  v.literal("farmer"),
  v.literal("processor"),
  v.literal("distributor"),
  v.literal("retailer"),
  v.literal("admin"),
  v.literal("unassigned")
);

export const getCurrent = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      walletAddress: v.string(),
      name: v.optional(v.string()),
      role: userRole,
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const ensureUser = mutation({
  args: {
    name: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);

    const existingUser = await getAppUser(ctx, walletAddress);
    if (existingUser) {
      if (args.name && args.name !== existingUser.name) {
        await ctx.db.patch(existingUser._id, { name: args.name });
      }
      return existingUser._id;
    }

    const adminWallets = process.env.ADMIN_WALLET_ADDRESSES?.split(",") ?? [];
    const isConfiguredAdmin = adminWallets.some(
      (addr) => addr.trim().toLowerCase() === walletAddress.toLowerCase()
    );

    let role: "admin" | "unassigned" = "unassigned";

    if (isConfiguredAdmin) {
      role = "admin";
    } else {
      const existingAdmins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first();

      if (!existingAdmins) {
        role = "admin";
      }
    }

    return await ctx.db.insert("users", {
      walletAddress,
      name: args.name,
      role,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      walletAddress: v.string(),
      name: v.optional(v.string()),
      role: userRole,
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRole,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (admin._id === args.userId && args.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Cannot remove your own admin role",
      });
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return null;
  },
});
