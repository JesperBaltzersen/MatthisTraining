import { useTheme, type ThemeId } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";

const themes: { id: ThemeId; label: string }[] = [
  { id: "warm-paper", label: "Varm papir" },
  { id: "botanical", label: "Botanisk" },
  { id: "minimal", label: "Minimal" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium transition-colors",
            theme === t.id
              ? "bg-accent text-white"
              : "bg-background-alt text-foreground/70 hover:text-foreground"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
