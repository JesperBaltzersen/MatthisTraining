import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const workoutIntensity = ["easy", "medium", "hard"] as const;
export type WorkoutIntensity = (typeof workoutIntensity)[number];

export const workoutType = ["strength", "basketball"] as const;
export type WorkoutType = (typeof workoutType)[number];

const workoutIntensityValidator = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard")
);

const workoutTypeValidator = v.union(
  v.literal("strength"),
  v.literal("basketball")
);

export const schema = defineSchema({
  workouts: defineTable({
    date: v.number(),
    type: workoutTypeValidator,
    intensity: workoutIntensityValidator,
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
  })
    .index("by_date", ["date"])
    .index("by_date_type", ["date", "type"]),

  exercises: defineTable({
    name: v.string(),
    type: v.literal("strength"),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .searchIndex("search_exercises", {
      searchField: "name",
    }),
});

export default schema;
