import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SportIcon } from "../components/SportIcon";
import { IntensityBadge } from "../components/IntensityBadge";
import { formatDateShort } from "../lib/utils";
import type { Workout } from "../types";

type ViewMode = "day" | "week" | "month" | "year";

function getStartOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getRangeForView(date: Date, view: ViewMode): { start: number; end: number } {
  const start = new Date(date);
  const end = new Date(date);

  switch (view) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    case "week":
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      return { start: start.getTime(), end: end.getTime() };
    default:
      return { start: 0, end: 0 };
  }
}

export function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [focusDate, setFocusDate] = useState(() => new Date());

  const { start, end } = useMemo(
    () => getRangeForView(focusDate, view),
    [focusDate, view]
  );

  const workouts = useQuery(api.workouts.listByDateRange, {
    startDate: start,
    endDate: end,
  });

  const workoutsByDate = useMemo(() => {
    const map = new Map<number, Workout[]>();
    if (!workouts) return map;
    for (const w of workouts) {
      const dayStart = getStartOfDay(w.date);
      const list = map.get(dayStart) ?? [];
      list.push(w);
      map.set(dayStart, list);
    }
    return map;
  }, [workouts]);

  const viewLabels: Record<ViewMode, string> = {
    day: "Dag",
    week: "Uge",
    month: "Måned",
    year: "År",
  };

  function handleSelectDay(d: Date) {
    setFocusDate(d);
    setView("day");
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Kalender
        </h1>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {(Object.keys(viewLabels) as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`shrink-0 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
              view === v
                ? "bg-accent text-white"
                : "bg-background-alt text-foreground hover:bg-foreground/5"
            }`}
          >
            {viewLabels[v]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {view === "day" && (
          <DayView date={focusDate} workouts={workoutsByDate} onNavigate={setFocusDate} />
        )}
        {view === "week" && (
          <WeekView
            focusDate={focusDate}
            workoutsByDate={workoutsByDate}
            onNavigate={setFocusDate}
            onSelectDay={handleSelectDay}
          />
        )}
        {view === "month" && (
          <MonthView
            focusDate={focusDate}
            workoutsByDate={workoutsByDate}
            onNavigate={setFocusDate}
            onSelectDay={handleSelectDay}
          />
        )}
        {view === "year" && (
          <YearView
            focusDate={focusDate}
            workoutsByDate={workoutsByDate}
            onNavigate={setFocusDate}
          />
        )}
      </div>
    </div>
  );
}

function DayView({
  date,
  workouts,
  onNavigate,
}: {
  date: Date;
  workouts: Map<number, Workout[]>;
  onNavigate: (d: Date) => void;
}) {
  const dayStart = getStartOfDay(date.getTime());
  const dayWorkouts = workouts.get(dayStart) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          ←
        </button>
        <span className="font-display text-lg font-medium">
          {formatDateShort(date)}
        </span>
        <button
          onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          →
        </button>
      </div>
      {dayWorkouts.length === 0 ? (
        <p className="py-8 text-center text-foreground/60">
          Ingen træning denne dag
        </p>
      ) : (
        <div className="space-y-3">
          {dayWorkouts.map((w) => (
            <WorkoutCard key={w._id} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({
  focusDate,
  workoutsByDate,
  onNavigate,
  onSelectDay,
}: {
  focusDate: Date;
  workoutsByDate: Map<number, Workout[]>;
  onNavigate: (d: Date) => void;
  onSelectDay: (d: Date) => void;
}) {
  const { start } = getRangeForView(focusDate, "week");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = getStartOfDay(Date.now());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            const d = new Date(focusDate);
            d.setDate(d.getDate() - 7);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          ←
        </button>
        <span className="font-display text-lg">
          Uge {getWeekNumber(focusDate)}
        </span>
        <button
          onClick={() => {
            const d = new Date(focusDate);
            d.setDate(d.getDate() + 7);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dayStart = getStartOfDay(d.getTime());
          const list = workoutsByDate.get(dayStart) ?? [];
          const isToday = dayStart === today;
          return (
            <button
              key={dayStart}
              onClick={() => onSelectDay(d)}
              className={`flex flex-col items-center rounded-[var(--radius)] p-2 transition-colors ${
                isToday
                  ? "ring-2 ring-accent bg-accent/10"
                  : "hover:bg-background-alt"
              }`}
            >
              <span className="text-xs text-foreground/70">
                {d.toLocaleDateString("da-DK", { weekday: "short" }).slice(0, 2)}
              </span>
              <span className="font-display text-lg font-semibold">{d.getDate()}</span>
              {list.length > 0 && (
                <div className="mt-1 flex gap-0.5">
                  {list.slice(0, 3).map((w) => (
                    <span
                      key={w._id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        w.intensity === "easy"
                          ? "bg-intensity-easy"
                          : w.intensity === "medium"
                            ? "bg-intensity-medium"
                            : "bg-intensity-hard"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({
  focusDate,
  workoutsByDate,
  onNavigate,
  onSelectDay,
}: {
  focusDate: Date;
  workoutsByDate: Map<number, Workout[]>;
  onNavigate: (d: Date) => void;
  onSelectDay: (d: Date) => void;
}) {
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const total = startPad + daysInMonth;
  const cells = Array.from({ length: Math.ceil(total / 7) * 7 }, (_, i) => {
    if (i < startPad) return null;
    const day = i - startPad + 1;
    if (day > daysInMonth) return null;
    return new Date(year, month, day);
  });

  const today = getStartOfDay(Date.now());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            const d = new Date(focusDate);
            d.setMonth(d.getMonth() - 1);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          ←
        </button>
        <span className="font-display text-lg">
          {focusDate.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => {
            const d = new Date(focusDate);
            d.setMonth(d.getMonth() + 1);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["M", "T", "O", "T", "F", "L", "S"].map((l) => (
          <div key={l} className="py-1 text-xs text-foreground/60">
            {l}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dayStart = getStartOfDay(d.getTime());
          const list = workoutsByDate.get(dayStart) ?? [];
          const isToday = dayStart === today;
          return (
            <button
              key={dayStart}
              onClick={() => onSelectDay(d)}
              className={`flex flex-col items-center justify-center rounded-[var(--radius)] py-2 text-sm ${
                isToday ? "ring-2 ring-accent bg-accent/10" : "hover:bg-background-alt"
              }`}
            >
              {d.getDate()}
              {list.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {list.slice(0, 2).map((w) => (
                    <span
                      key={w._id}
                      className={`h-1 w-1 rounded-full ${
                        w.intensity === "easy"
                          ? "bg-intensity-easy"
                          : w.intensity === "medium"
                            ? "bg-intensity-medium"
                            : "bg-intensity-hard"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearView({
  focusDate,
  workoutsByDate,
  onNavigate,
}: {
  focusDate: Date;
  workoutsByDate: Map<number, Workout[]>;
  onNavigate: (d: Date) => void;
}) {
  const year = focusDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            const d = new Date(focusDate);
            d.setFullYear(d.getFullYear() - 1);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          ←
        </button>
        <span className="font-display text-lg">{year}</span>
        <button
          onClick={() => {
            const d = new Date(focusDate);
            d.setFullYear(d.getFullYear() + 1);
            onNavigate(d);
          }}
          className="rounded-[var(--radius)] p-2 text-foreground hover:bg-background-alt"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((m) => {
          const count = Array.from({ length: new Date(year, m.getMonth() + 1, 0).getDate() }, (_, i) =>
            getStartOfDay(new Date(year, m.getMonth(), i + 1).getTime())
          ).reduce((acc, dayStart) => acc + ((workoutsByDate.get(dayStart)?.length ?? 0) > 0 ? 1 : 0), 0);
          return (
            <button
              key={m.getMonth()}
              onClick={() => onNavigate(m)}
              className="rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4 text-left transition-colors hover:bg-background-alt"
            >
              <span className="font-display font-medium">
                {m.toLocaleDateString("da-DK", { month: "short" })}
              </span>
              <span className="ml-2 text-sm text-foreground/60">{count} træninger</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const summary =
    workout.type === "strength"
      ? `${workout.strength?.exerciseLogs?.length ?? 0} øvelser`
      : `${workout.basketball?.drills?.length ?? 0} drills`;

  return (
    <Link
      to={`/workout/${workout._id}`}
      className="block rounded-[var(--radius)] border border-foreground/10 bg-background-alt/50 p-4 shadow-[var(--shadow)] transition-colors hover:bg-background-alt"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <SportIcon type={workout.type as "strength" | "basketball"} />
          <div>
            <p className="font-medium capitalize">{workout.type === "strength" ? "Styrke" : "Basketball"}</p>
            <p className="text-sm text-foreground/70">{summary}</p>
          </div>
        </div>
        <IntensityBadge intensity={workout.intensity as "easy" | "medium" | "hard"} />
      </div>
    </Link>
  );
}

function getWeekNumber(d: Date): number {
  const first = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - first.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + first.getDay() + 1) / 7);
}
