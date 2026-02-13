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
          const sets = log.sets;
          const isNewShape = Array.isArray(sets);
          const setCount = isNewShape
            ? (sets as { reps?: number; weightKg?: number }[]).length
            : (typeof sets === "number" ? sets : 0);
          const reps = isNewShape
            ? (setCount > 0
                ? (sets as { reps?: number; weightKg?: number }[])[setCount - 1]
                    ?.reps
                : undefined)
            : (log as { reps?: number }).reps;
          const weightKg = isNewShape
            ? (setCount > 0
                ? (sets as { reps?: number; weightKg?: number }[])[setCount - 1]
                    ?.weightKg
                : undefined)
            : (log as { weightKg?: number }).weightKg;
          return {
            date: workout.date,
            setCount,
            reps,
            weightKg,
          };
        }
      }
    }
    return null;
  },
});
