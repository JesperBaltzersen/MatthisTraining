import { Circle, Dumbbell } from "lucide-react";
import { cn } from "../lib/utils";

type SportType = "strength" | "basketball";

interface SportIconProps {
  type: SportType;
  size?: "default" | "sm";
  className?: string;
}

const sizeClasses = {
  default: {
    wrapper: "h-9 w-9",
    icon: "h-5 w-5",
  },
  sm: {
    wrapper: "h-4 w-4 min-w-4",
    icon: "h-2.5 w-2.5",
  },
} as const;

export function SportIcon({ type, size = "default", className }: SportIconProps) {
  const sizes = sizeClasses[size];
  if (type === "basketball") {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-intensity-medium/20 text-intensity-medium",
          sizes.wrapper,
          className
        )}
        aria-label="Basketball"
      >
        <Circle className={sizes.icon} strokeWidth={2} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-intensity-easy/20 text-intensity-easy",
        sizes.wrapper,
        className
      )}
      aria-label="Styrke"
    >
      <Dumbbell className={sizes.icon} strokeWidth={2} />
    </span>
  );
}
