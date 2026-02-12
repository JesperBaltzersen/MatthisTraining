import { cn, getIntensityColor, type WorkoutIntensity } from "../lib/utils";

interface IntensityBadgeProps {
  intensity: WorkoutIntensity;
  className?: string;
}

const labels: Record<WorkoutIntensity, string> = {
  easy: "Let",
  medium: "Medium",
  hard: "Hård",
};

export function IntensityBadge({ intensity, className }: IntensityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white",
        getIntensityColor(intensity),
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {labels[intensity]}
    </span>
  );
}
