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
