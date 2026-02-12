import { Circle, Dumbbell } from "lucide-react";
import { cn } from "../lib/utils";

type SportType = "strength" | "basketball";

interface SportIconProps {
  type: SportType;
  className?: string;
}

export function SportIcon({ type, className }: SportIconProps) {
  if (type === "basketball") {
    return (
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-intensity-medium/20 text-intensity-medium",
          className
        )}
        aria-label="Basketball"
      >
        <Circle className="h-5 w-5" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-intensity-easy/20 text-intensity-easy",
        className
      )}
      aria-label="Styrke"
    >
      <Dumbbell className="h-5 w-5" strokeWidth={2} />
    </span>
  );
}
