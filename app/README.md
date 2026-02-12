# Matthis Træning

Workout tracking app for basketball and strength training. Mobile-first design with three visual themes: Warm Paper, Botanical Journal, and Minimal Moleskine.

## Features

- **Calendar**: Day, week, month, and year views of workouts
- **Library**: Exercise library (alphabetical) with search and detail pages showing last performance (sets, reps, weight, date)
- **History**: Timeline of past workouts
- **Add Workout**: Log strength training (exercises, sets, reps, weight) or basketball (drills, total shots, reps/time)
- **Intensity rating**: Green (easy), yellow (medium), red (hard)
- **Sport icons**: Basketball and strength training each have unique icons
- **PWA**: Add to home screen on mobile
- **Theme selector**: Switch between Warm Paper, Botanical, and Minimal designs

## Setup

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Configure Convex

```bash
npx convex dev
```

This will:
- Prompt you to sign in or create a Convex account
- Create/link a Convex project
- Generate the API types in `convex/_generated/`
- Deploy schema and functions

When prompted, copy the `VITE_CONVEX_URL` and add it to a `.env.local` file:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Convex (backend)
- React Router
- Lucide React (icons)

## Project Structure

- `src/pages/` – Calendar, Library, History, Add Workout
- `src/components/` – Layout, BottomNav, SportIcon, IntensityBadge, ThemeSelector
- `src/contexts/` – ThemeContext (Warm Paper / Botanical / Minimal)
- `convex/` – Schema, workouts and exercises API
