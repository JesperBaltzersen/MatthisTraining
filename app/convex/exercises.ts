import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exercises").collect();
    return exercises.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db.query("exercises").collect();
    }
    return await ctx.db
      .query("exercises")
      .withSearchIndex("search_exercises", (q) =>
        q.search("name", args.searchTerm)
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("exercises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.literal("strength"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("exercises", args);
  },
});

export const getLastPerformance = query({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, args) => {
    const workouts = await ctx.db.query("workouts").collect();
    for (const workout of workouts.sort((a, b) => b.date - a.date)) {
      if (workout.strength?.exerciseLogs) {
        const log = workout.strength.exerciseLogs.find(
          (l) => l.exerciseId === args.exerciseId
        );
        if (log) {
          return {
            date: workout.date,
            sets: log.sets,
            reps: log.reps,
            weightKg: log.weightKg,
          };
        }
      }
    }
    return null;
  },
});
