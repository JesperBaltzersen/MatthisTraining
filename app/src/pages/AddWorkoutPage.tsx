import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Exercise } from "../types";
import { Circle, Dumbbell } from "lucide-react";

type WorkoutType = "strength" | "basketball";
type Intensity = "easy" | "medium" | "hard";

interface StrengthLog {
  exerciseId: Id<"exercises">;
  sets: number;
  reps?: number;
  weightKg?: number;
}

interface BasketballDrill {
  name: string;
  reps?: number;
  durationMinutes?: number;
}

export function AddWorkoutPage() {
  const navigate = useNavigate();
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
  const exercises = useQuery(api.exercises.list);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateNum = new Date(date).setHours(0, 0, 0, 0);

    await createWorkout({
      date: dateNum,
      type,
      intensity,
      notes: notes || undefined,
      strength:
        type === "strength" && strengthLogs.length > 0
          ? { exerciseLogs: strengthLogs }
          : undefined,
      basketball:
        type === "basketball"
          ? { totalShots, drills: drills.filter((d) => d.name.trim()) }
          : undefined,
    });

    navigate("/");
  };

  const addStrengthLog = () => {
    const firstExercise = exercises?.[0];
    if (!firstExercise) return;
    setStrengthLogs((prev) => [
      ...prev,
      { exerciseId: firstExercise._id, sets: 3, reps: 10 },
    ]);
  };

  const updateStrengthLog = (i: number, updates: Partial<StrengthLog>) => {
    setStrengthLogs((prev) =>
      prev.map((log, idx) => (idx === i ? { ...log, ...updates } : log))
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
          Tilføj træning
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
                  <div className="mb-2 flex gap-2">
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
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Sæt"
                      value={log.sets || ""}
                      onChange={(e) =>
                        updateStrengthLog(i, {
                          sets: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={log.reps ?? ""}
                      onChange={(e) =>
                        updateStrengthLog(i, {
                          reps: parseInt(e.target.value, 10) || undefined,
                        })
                      }
                      className="rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                    />
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Kg"
                      value={log.weightKg ?? ""}
                      onChange={(e) =>
                        updateStrengthLog(i, {
                          weightKg: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className="rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
                    />
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
          Gem træning
        </button>
      </form>
    </div>
  );
}
