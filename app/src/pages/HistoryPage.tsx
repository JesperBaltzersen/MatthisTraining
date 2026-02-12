import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SportIcon } from "../components/SportIcon";
import { IntensityBadge } from "../components/IntensityBadge";
import { formatDate } from "../lib/utils";
import type { Workout } from "../types";

const START_OFFSET = 90 * 24 * 60 * 60 * 1000;

export function HistoryPage() {
  const now = Date.now();
  const start = now - START_OFFSET;

  const workouts = useQuery(api.workouts.listByDateRange, {
    startDate: start,
    endDate: now,
  });

  const grouped = (workouts ?? [])
    .sort((a: Workout, b: Workout) => b.date - a.date)
    .reduce(
      (acc: Record<string, Workout[]>, w: Workout) => {
        const key = new Date(w.date).toDateString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(w);
        return acc;
      },
      {}
    );

  const entries = Object.entries(grouped) as [string, Workout[]][];

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Historik
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          Dine seneste træninger
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="py-12 text-center text-foreground/60">
          Ingen træninger endnu
        </p>
      ) : (
        <div className="space-y-6">
          {entries.map(([dateKey, dayWorkouts]) => {
            const date = new Date(dateKey);
            return (
              <section key={dateKey}>
                <h2 className="mb-3 font-display text-lg font-medium text-foreground">
                  {formatDate(date)}
                </h2>
                <div className="space-y-2">
                  {dayWorkouts.map((w) => (
                    <div
                      key={w._id}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4"
                    >
                      <div className="flex gap-3">
                        <SportIcon
                          type={w.type as "strength" | "basketball"}
                        />
                        <div>
                          <p className="font-medium capitalize">
                            {w.type === "strength" ? "Styrke" : "Basketball"}
                          </p>
                          <p className="text-sm text-foreground/70">
                            {w.type === "strength"
                              ? `${w.strength?.exerciseLogs?.length ?? 0} øvelser`
                              : `${w.basketball?.drills?.length ?? 0} drills`}
                          </p>
                        </div>
                      </div>
                      <IntensityBadge
                        intensity={w.intensity as "easy" | "medium" | "hard"}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
