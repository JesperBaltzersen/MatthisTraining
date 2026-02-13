import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Exercise } from "../types";
import { normalizeStrengthExerciseLog } from "../lib/utils";
import { Circle, Dumbbell } from "lucide-react";

type WorkoutType = "strength" | "basketball";
type Intensity = "easy" | "medium" | "hard";

interface StrengthSet {
  reps?: number;
  weightKg?: number;
}

interface StrengthLog {
  exerciseId: Id<"exercises">;
  sets: StrengthSet[];
}

interface BasketballDrill {
  name: string;
  reps?: number;
  durationMinutes?: number;
}

export function AddWorkoutPage() {
  const navigate = useNavigate();
  const { id: workoutId } = useParams<{ id: string }>();
  const isEditMode = Boolean(workoutId);

  const [type, setType] = useState<WorkoutType>("strength");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");

  const [strengthLogs, setStrengthLogs] = useState<StrengthLog[]>([]);
  const [totalShots, setTotalShots] = useState<number | undefined>();
  const [drills, setDrills] = useState<BasketballDrill[]>([]);

  const createWorkout = useMutation(api.workouts.create);
  const updateWorkout = useMutation(api.workouts.update);
  const exercises = useQuery(api.exercises.list);
  const existingWorkout = useQuery(
    api.workouts.get,
    workoutId ? { id: workoutId as Id<"workouts"> } : "skip"
  );

  const hasInitializedEdit = useRef<string | null>(null);
  useEffect(() => {
    if (workoutId) hasInitializedEdit.current = null;
  }, [workoutId]);
  useEffect(() => {
    if (
      !isEditMode ||
      existingWorkout == null ||
      hasInitializedEdit.current === workoutId
    ) {
      return;
    }
    hasInitializedEdit.current = workoutId ?? null;
    const w = existingWorkout;
    setType(w.type);
    setIntensity(w.intensity);
    setDate(new Date(w.date).toISOString().slice(0, 10));
    setNotes(w.notes ?? "");
    if (w.type === "strength" && w.strength?.exerciseLogs?.length) {
      setStrengthLogs(
        w.strength.exerciseLogs.map((log) => {
          const normalized = normalizeStrengthExerciseLog(
            log as Parameters<typeof normalizeStrengthExerciseLog>[0]
          );
          return {
            exerciseId: normalized.exerciseId,
            sets:
              normalized.sets.length > 0
                ? normalized.sets.map((s) => ({
                    reps: s.reps,
                    weightKg: s.weightKg,
                  }))
                : [{ reps: undefined, weightKg: undefined }],
          };
        })
      );
    }
    if (w.type === "basketball" && w.basketball) {
      setTotalShots(w.basketball.totalShots);
      setDrills(
        (w.basketball.drills ?? []).map((d) => ({
          name: d.name,
          reps: d.reps,
          durationMinutes: d.durationMinutes,
        }))
      );
    }
  }, [isEditMode, existingWorkout, workoutId]);

  if (isEditMode && existingWorkout === undefined) {
    return (
      <div className="animate-fade-in">
        <p className="py-8 text-center text-foreground/60">Henter træning…</p>
      </div>
    );
  }
  if (isEditMode && existingWorkout === null) {
    return (
      <div className="animate-fade-in">
        <p className="py-8 text-center text-foreground/60">
          Træningen blev ikke fundet.
        </p>
        <Link to="/" className="mt-4 block text-center text-accent hover:underline">
          Tilbage til kalender
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateNum = new Date(date).setHours(0, 0, 0, 0);

    if (isEditMode && workoutId) {
      await updateWorkout({
        id: workoutId as Id<"workouts">,
        date: dateNum,
        type,
        intensity,
        notes: notes || undefined,
        strength:
          type === "strength" && strengthLogs.length > 0
            ? {
                exerciseLogs: strengthLogs.map((log) => ({
                  exerciseId: log.exerciseId,
                  sets: log.sets,
                })),
              }
            : undefined,
        basketball:
          type === "basketball"
            ? { totalShots, drills: drills.filter((d) => d.name.trim()) }
            : undefined,
      });
      navigate(`/workout/${workoutId}`);
    } else {
      await createWorkout({
        date: dateNum,
        type,
        intensity,
        notes: notes || undefined,
        strength:
          type === "strength" && strengthLogs.length > 0
            ? {
                exerciseLogs: strengthLogs.map((log) => ({
                  exerciseId: log.exerciseId,
                  sets: log.sets,
                })),
              }
            : undefined,
        basketball:
          type === "basketball"
            ? { totalShots, drills: drills.filter((d) => d.name.trim()) }
            : undefined,
      });
      navigate("/");
    }
  };

  const addStrengthLog = () => {
    const firstExercise = exercises?.[0];
    if (!firstExercise) return;
    setStrengthLogs((prev) => [
      ...prev,
      { exerciseId: firstExercise._id, sets: [{ reps: undefined, weightKg: undefined }] },
    ]);
  };

  const updateStrengthLog = (i: number, updates: Partial<StrengthLog>) => {
    setStrengthLogs((prev) =>
      prev.map((log, idx) => (idx === i ? { ...log, ...updates } : log))
    );
  };

  const addSet = (logIndex: number) => {
    setStrengthLogs((prev) =>
      prev.map((log, idx) => {
        if (idx !== logIndex) return log;
        const lastSet = log.sets[log.sets.length - 1];
        const nextSet: StrengthSet = {
          reps: lastSet?.reps,
          weightKg: lastSet?.weightKg,
        };
        return { ...log, sets: [...log.sets, nextSet] };
      })
    );
  };

  const updateSet = (
    logIndex: number,
    setIndex: number,
    updates: Partial<StrengthSet>
  ) => {
    setStrengthLogs((prev) =>
      prev.map((log, idx) => {
        if (idx !== logIndex) return log;
        return {
          ...log,
          sets: log.sets.map((s, si) =>
            si === setIndex ? { ...s, ...updates } : s
          ),
        };
      })
    );
  };

  const removeSet = (logIndex: number, setIndex: number) => {
    setStrengthLogs((prev) =>
      prev.map((log, idx) => {
        if (idx !== logIndex) return log;
        const newSets = log.sets.filter((_, si) => si !== setIndex);
        return {
          ...log,
          sets: newSets.length > 0 ? newSets : [{ reps: undefined, weightKg: undefined }],
        };
      })
    );
  };

  const removeStrengthLog = (i: number) => {
    setStrengthLogs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addDrill = () => {
    setDrills((prev) => [...prev, { name: "" }]);
  };

  const updateDrill = (i: number, updates: Partial<BasketballDrill>) => {
    setDrills((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...updates } : d))
    );
  };

  const removeDrill = (i: number) => {
    setDrills((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {isEditMode ? "Rediger træning" : "Tilføj træning"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("strength")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] border py-3 transition-colors ${
                type === "strength"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-foreground/15 hover:border-foreground/30"
              }`}
            >
              <Dumbbell className="h-5 w-5" />
              Styrke
            </button>
            <button
              type="button"
              onClick={() => setType("basketball")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] border py-3 transition-colors ${
                type === "basketball"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-foreground/15 hover:border-foreground/30"
              }`}
            >
              <Circle className="h-5 w-5" />
              Basketball
            </button>
          </div>
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Intensitet
          </label>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIntensity(i)}
                className={`flex-1 rounded-[var(--radius)] py-2 text-sm font-medium transition-colors ${
                  intensity === i
                    ? i === "easy"
                      ? "bg-intensity-easy text-white"
                      : i === "medium"
                        ? "bg-intensity-medium text-white"
                        : "bg-intensity-hard text-white"
                    : "bg-background-alt text-foreground/70 hover:bg-foreground/10"
                }`}
              >
                {i === "easy" ? "Let" : i === "medium" ? "Medium" : "Hård"}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Dato
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[var(--radius)] border border-foreground/15 bg-background-alt/50 px-4 py-3 text-foreground focus:border-accent focus:outline-none"
          />
        </section>

        {type === "strength" && (
          <section>
            {(!exercises || exercises.length === 0) && (
              <p className="mb-4 rounded-[var(--radius)] border border-foreground/15 bg-background-alt/50 p-4 text-sm text-foreground/70">
                Tilføj øvelser i{" "}
                <Link to="/library" className="text-accent hover:underline">
                  biblioteket
                </Link>{" "}
                først for at logge styrketræning.
              </p>
            )}
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Øvelser
              </label>
              <button
                type="button"
                onClick={addStrengthLog}
                disabled={!exercises || exercises.length === 0}
                className="text-sm text-accent hover:underline disabled:pointer-events-none disabled:opacity-50"
              >
                + Tilføj
              </button>
            </div>
            <div className="space-y-3">
              {strengthLogs.map((log, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4"
                >
                  <div className="mb-3 flex gap-2">
                    <select
                      value={log.exerciseId}
                      onChange={(e) =>
                        updateStrengthLog(i, {
                          exerciseId: e.target.value as Id<"exercises">,
                        })
                      }
                      className="flex-1 rounded-[var(--radius)] border border-foreground/15 bg-white px-3 py-2 text-foreground"
                    >
                      {(exercises ?? []).map((ex: Exercise) => (
                        <option key={ex._id} value={ex._id}>
                          {ex.name}
                        </option>
                      ))}
                      {(!exercises || exercises.length === 0) && (
                        <option value="">Vælg øvelse</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeStrengthLog(i)}
                      className="text-foreground/60 hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-2">
                    {log.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className="flex flex-wrap items-center gap-2 rounded-[var(--radius)] border border-foreground/10 bg-background/50 px-3 py-2"
                      >
                        <span className="w-12 text-sm font-medium text-foreground/70">
                          Sæt {setIdx + 1}
                        </span>
                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps ?? ""}
                          onChange={(e) =>
                            updateSet(i, setIdx, {
                              reps: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          className="w-20 rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                        />
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Kg"
                          value={set.weightKg ?? ""}
                          onChange={(e) =>
                            updateSet(i, setIdx, {
                              weightKg: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                          className="w-20 rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                        />
                        {log.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(i, setIdx)}
                            className="text-foreground/60 hover:text-foreground"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSet(i)}
                      className="text-sm text-accent hover:underline"
                    >
                      + Tilføj sæt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {type === "basketball" && (
          <section>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Totalt antal skud
            </label>
            <input
              type="number"
              value={totalShots ?? ""}
              onChange={(e) =>
                setTotalShots(
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              placeholder="fx 200"
              className="w-full rounded-[var(--radius)] border border-foreground/15 bg-background-alt/50 px-4 py-3"
            />

            <div className="mt-4 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Drills
              </label>
              <button
                type="button"
                onClick={addDrill}
                className="text-sm text-accent hover:underline"
              >
                + Tilføj drill
              </button>
            </div>
            <div className="mt-2 space-y-3">
              {drills.map((d, i) => (
                <div
                  key={i}
                  className="flex gap-2 rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4"
                >
                  <input
                    type="text"
                    placeholder="Drill navn"
                    value={d.name}
                    onChange={(e) => updateDrill(i, { name: e.target.value })}
                    className="flex-1 rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={d.reps ?? ""}
                    onChange={(e) =>
                      updateDrill(i, {
                        reps: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    className="w-20 rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Min"
                    value={d.durationMinutes ?? ""}
                    onChange={(e) =>
                      updateDrill(i, {
                        durationMinutes: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    className="w-20 rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeDrill(i)}
                    className="text-foreground/60 hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Noter
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Valgfrie noter..."
            className="w-full rounded-[var(--radius)] border border-foreground/15 bg-background-alt/50 px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
          />
        </section>

        <button
          type="submit"
          className="w-full rounded-[var(--radius)] bg-accent py-3 font-medium text-white transition-colors hover:bg-accent/90"
        >
          {isEditMode ? "Opdater træning" : "Gem træning"}
        </button>
      </form>
    </div>
  );
}
