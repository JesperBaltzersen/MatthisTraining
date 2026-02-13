import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WorkoutIntensity = "easy" | "medium" | "hard";

export function getIntensityColor(intensity: WorkoutIntensity): string {
  switch (intensity) {
    case "easy":
      return "bg-intensity-easy";
    case "medium":
      return "bg-intensity-medium";
    case "hard":
      return "bg-intensity-hard";
    default:
      return "bg-gray-400";
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
  });
}

export type NormalizedStrengthSet = { reps?: number; weightKg?: number };

/** Normalize exercise log so that sets is always an array (handles old data where sets was a number). */
export function normalizeStrengthExerciseLog(log: {
  exerciseId: string;
  sets?: number | NormalizedStrengthSet[];
  reps?: number;
  weightKg?: number;
}): { exerciseId: string; sets: NormalizedStrengthSet[] } {
  const sets = log.sets;
  if (Array.isArray(sets)) {
    return { exerciseId: log.exerciseId, sets };
  }
  const count = typeof sets === "number" && sets > 0 ? sets : 1;
  const single: NormalizedStrengthSet = {
    reps: log.reps,
    weightKg: log.weightKg,
  };
  return {
    exerciseId: log.exerciseId,
    sets: Array.from({ length: count }, () => ({ ...single })),
  };
}
