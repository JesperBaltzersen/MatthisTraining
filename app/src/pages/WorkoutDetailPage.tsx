import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { SportIcon } from "../components/SportIcon";
import { IntensityBadge } from "../components/IntensityBadge";
import { formatDateShort } from "../lib/utils";
import { ArrowLeft } from "lucide-react";

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const workout = useQuery(
    api.workouts.get,
    id ? { id: id as Id<"workouts"> } : "skip"
  );
  const exercises = useQuery(api.exercises.list, {});

  const exerciseNameById = new Map(
    (exercises ?? []).map((e) => [e._id, e.name])
  );

  if (workout === undefined) {
    return (
      <div className="animate-fade-in">
        <p className="py-8 text-center text-foreground/60">Henter træning…</p>
      </div>
    );
  }

  if (workout === null) {
    return (
      <div className="animate-fade-in">
        <p className="py-8 text-center text-foreground/60">
          Træningen blev ikke fundet.
        </p>
        <Link
          to="/"
          className="mt-4 flex items-center justify-center gap-2 text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Tilbage til kalender
        </Link>
      </div>
    );
  }

  const date = new Date(workout.date);

  return (
    <div className="animate-fade-in">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tilbage til kalender
      </Link>

      <div className="rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4 shadow-[var(--shadow)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <SportIcon type={workout.type} />
            <div>
              <p className="font-display text-lg font-semibold capitalize">
                {workout.type === "strength" ? "Styrke" : "Basketball"}
              </p>
              <p className="text-sm text-foreground/70">
                {formatDateShort(date)}
              </p>
            </div>
          </div>
          <IntensityBadge intensity={workout.intensity} />
        </div>

        {workout.notes?.trim() && (
          <p className="mb-4 text-sm text-foreground/80">{workout.notes}</p>
        )}

        {workout.type === "strength" && workout.strength?.exerciseLogs && (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Øvelser</h3>
            <ul className="space-y-3">
              {workout.strength.exerciseLogs.map((log, index) => {
                const name =
                  exerciseNameById.get(log.exerciseId) ?? "Ukendt øvelse";
                const parts: string[] = [];
                if (log.sets != null) parts.push(`${log.sets} sæt`);
                if (log.reps != null) parts.push(`${log.reps} reps`);
                if (log.weightKg != null) parts.push(`${log.weightKg} kg`);
                const detail = parts.length > 0 ? parts.join(" · ") : null;
                return (
                  <li
                    key={`${log.exerciseId}-${index}`}
                    className="flex justify-between rounded-[var(--radius)] border border-foreground/10 bg-background/50 px-3 py-2"
                  >
                    <span className="font-medium text-foreground">{name}</span>
                    {detail && (
                      <span className="text-sm text-foreground/70">
                        {detail}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {workout.type === "basketball" && workout.basketball && (
          <div className="space-y-4">
            {workout.basketball.totalShots != null && (
              <p className="text-sm text-foreground/80">
                <span className="font-medium">Skud i alt:</span>{" "}
                {workout.basketball.totalShots}
              </p>
            )}
            {workout.basketball.drills?.length > 0 && (
              <>
                <h3 className="font-medium text-foreground">Drills</h3>
                <ul className="space-y-3">
                  {workout.basketball.drills.map((drill, index) => {
                    const parts: string[] = [];
                    if (drill.reps != null) parts.push(`${drill.reps} reps`);
                    if (drill.durationMinutes != null)
                      parts.push(`${drill.durationMinutes} min`);
                    const detail =
                      parts.length > 0 ? parts.join(" · ") : null;
                    return (
                      <li
                        key={index}
                        className="flex justify-between rounded-[var(--radius)] border border-foreground/10 bg-background/50 px-3 py-2"
                      >
                        <span className="font-medium text-foreground">
                          {drill.name}
                        </span>
                        {detail && (
                          <span className="text-sm text-foreground/70">
                            {detail}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
