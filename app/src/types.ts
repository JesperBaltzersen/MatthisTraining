import type { Id } from "../convex/_generated/dataModel";

export interface Workout {
  _id: Id<"workouts">;
  date: number;
  type: "strength" | "basketball";
  intensity: "easy" | "medium" | "hard";
  notes?: string;
  strength?: {
    exerciseLogs: {
      exerciseId: Id<"exercises">;
      sets: number;
      reps?: number;
      weightKg?: number;
    }[];
  };
  basketball?: {
    totalShots?: number;
    drills: {
      name: string;
      reps?: number;
      durationMinutes?: number;
    }[];
  };
}

export interface Exercise {
  _id: Id<"exercises">;
  name: string;
  type: "strength";
}
