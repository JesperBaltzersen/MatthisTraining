import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { SportIcon } from "../components/SportIcon";
import { IntensityBadge } from "../components/IntensityBadge";
import { formatDateShort, normalizeStrengthExerciseLog } from "../lib/utils";
import { ArrowLeft, Pencil } from "lucide-react";

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
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tilbage til kalender
        </Link>
        <Link
          to={`/workout/${workout._id}/edit`}
          className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-foreground/15 bg-background-alt/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
        >
          <Pencil className="h-4 w-4" /> Rediger
        </Link>
      </div>

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
            <ul className="space-y-4">
              {workout.strength.exerciseLogs.map((log, index) => {
                const normalized = normalizeStrengthExerciseLog(
                  log as Parameters<typeof normalizeStrengthExerciseLog>[0]
                );
                const name =
                  exerciseNameById.get(normalized.exerciseId) ?? "Ukendt øvelse";
                const sets = normalized.sets;
                return (
                  <li
                    key={`${normalized.exerciseId}-${index}`}
                    className="rounded-[var(--radius)] border border-foreground/10 bg-background/50 p-3"
                  >
                    <p className="mb-2 font-medium text-foreground">{name}</p>
                    <div className="flex flex-wrap gap-2">
                      {sets.map((set, setIdx) => {
                        const parts: string[] = [];
                        if (set.reps != null) parts.push(`${set.reps} reps`);
                        if (set.weightKg != null)
                          parts.push(`${set.weightKg} kg`);
                        const detail =
                          parts.length > 0 ? parts.join(" × ") : "—";
                        return (
                          <span
                            key={setIdx}
                            className="rounded-[var(--radius)] border border-foreground/10 bg-background px-2.5 py-1.5 text-sm text-foreground/80"
                          >
                            Sæt {setIdx + 1}: {detail}
                          </span>
                        );
                      })}
                    </div>
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
