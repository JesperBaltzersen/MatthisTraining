import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Exercise } from "../types";
import { Search, Plus, ArrowLeft } from "lucide-react";

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const createExercise = useMutation(api.exercises.create);

  const exercises = useQuery(
    api.exercises.search,
    search.trim() ? { searchTerm: search } : "skip"
  );

  const allExercises = useQuery(
    api.exercises.list,
    !search.trim() ? {} : "skip"
  );

  const list = search.trim() ? exercises ?? [] : allExercises ?? [];

  async function handleAddExercise() {
    const name = newName.trim();
    if (!name) return;
    await createExercise({ name, type: "strength" });
    setNewName("");
    setShowAdd(false);
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Øvelsesbibliotek
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          Find øvelser i alfabetisk rækkefølge
        </p>
      </header>

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
          <input
          type="search"
          placeholder="Søg efter øvelse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[var(--radius)] border border-foreground/15 bg-background-alt/50 py-3 pl-10 pr-4 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent text-white hover:bg-accent/90"
          title="Tilføj øvelse"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4">
          <h3 className="mb-2 font-medium">Ny øvelse</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Øvelsens navn"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-[var(--radius)] border border-foreground/15 px-3 py-2"
              onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
            />
            <button
              onClick={handleAddExercise}
              className="rounded-[var(--radius)] bg-accent px-4 py-2 text-white hover:bg-accent/90"
            >
              Tilføj
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(""); }}
              className="rounded-[var(--radius)] border border-foreground/15 px-4 py-2 hover:bg-foreground/5"
            >
              Annuller
            </button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-12 text-center text-foreground/60">
          {search.trim()
            ? "Ingen øvelser fundet"
            : "Ingen øvelser endnu. Tilføj øvelser via styrketræning."}
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((ex: Exercise) => (
            <li key={ex._id}>
              <Link
                to={`/library/${ex._id}`}
                className="flex items-center justify-between rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4 transition-colors hover:border-accent/30 hover:bg-background-alt"
              >
                <span className="font-medium capitalize">{ex.name}</span>
                <span className="text-foreground/50">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ExerciseDetailPage({ id }: { id: Id<"exercises"> }) {
  const navigate = useNavigate();
  const exercise = useQuery(api.exercises.get, { id });
  const lastPerformance = useQuery(api.exercises.getLastPerformance, {
    exerciseId: id,
  });

  if (exercise === undefined) {
    return (
      <div className="py-12 text-center text-foreground/60">
        Indlæser...
      </div>
    );
  }

  if (exercise === null) {
    return (
      <div className="py-12 text-center text-foreground/60">
        Øvelse ikke fundet
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbage
      </button>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold capitalize text-foreground">
          {exercise.name}
        </h1>
      </header>

      <section className="mb-8 rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-6 shadow-[var(--shadow)]">
        <h2 className="mb-4 font-display text-lg font-medium text-foreground">
          Sidste træning
        </h2>
        {lastPerformance ? (
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-foreground/70">Dato</dt>
              <dd>
                {new Date(lastPerformance.date).toLocaleDateString("da-DK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/70">Sæt</dt>
              <dd>{lastPerformance.sets}</dd>
            </div>
            {lastPerformance.reps != null && (
              <div className="flex justify-between">
                <dt className="text-foreground/70">Reps</dt>
                <dd>{lastPerformance.reps}</dd>
              </div>
            )}
            {lastPerformance.weightKg != null && (
              <div className="flex justify-between">
                <dt className="text-foreground/70">Vægt (kg)</dt>
                <dd>{lastPerformance.weightKg}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-foreground/60">Ingen træningsdata endnu</p>
        )}
      </section>
    </div>
  );
}
