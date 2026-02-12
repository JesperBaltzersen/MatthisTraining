import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workouts")
      .withIndex("by_date", (q) =>
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();
  },
});

export const getByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workouts")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const create = mutation({
  args: {
    date: v.number(),
    type: v.union(v.literal("strength"), v.literal("basketball")),
    intensity: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    notes: v.optional(v.string()),
    strength: v.optional(
      v.object({
        exerciseLogs: v.array(
          v.object({
            exerciseId: v.id("exercises"),
            sets: v.number(),
            reps: v.optional(v.number()),
            weightKg: v.optional(v.number()),
          })
        ),
      })
    ),
    basketball: v.optional(
      v.object({
        totalShots: v.optional(v.number()),
        drills: v.array(
          v.object({
            name: v.string(),
            reps: v.optional(v.number()),
            durationMinutes: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workouts", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("workouts"),
    date: v.optional(v.number()),
    type: v.optional(
      v.union(v.literal("strength"), v.literal("basketball"))
    ),
    intensity: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))
    ),
    notes: v.optional(v.string()),
    strength: v.optional(
      v.object({
        exerciseLogs: v.array(
          v.object({
            exerciseId: v.id("exercises"),
            sets: v.number(),
            reps: v.optional(v.number()),
            weightKg: v.optional(v.number()),
          })
        ),
      })
    ),
    basketball: v.optional(
      v.object({
        totalShots: v.optional(v.number()),
        drills: v.array(
          v.object({
            name: v.string(),
            reps: v.optional(v.number()),
            durationMinutes: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
