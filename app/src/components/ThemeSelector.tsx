import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "midnight";

  const toggleTheme = () => {
    setTheme(isDark ? "brutalist" : "midnight");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-background-alt"
      aria-label={isDark ? "Skift til lys tema" : "Skift til mørkt tema"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
