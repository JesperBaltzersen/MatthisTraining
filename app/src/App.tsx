import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignIn } from "@clerk/clerk-react";
import { authEnabled } from "./config";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { CalendarPage } from "./pages/CalendarPage";
import { LibraryPage, ExerciseDetailPage } from "./pages/LibraryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AddWorkoutPage } from "./pages/AddWorkoutPage";
import { WorkoutDetailPage } from "./pages/WorkoutDetailPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CalendarPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="library/:id" element={<LibraryDetailRoute />} />
          <Route path="add" element={<AddWorkoutPage />} />
          <Route path="workout/:id/edit" element={<AddWorkoutPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="workout/:id" element={<WorkoutDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      {authEnabled ? (
        <>
          <AuthLoading>
            <AuthLoadingScreen />
          </AuthLoading>
          <Unauthenticated>
            <SignInScreen />
          </Unauthenticated>
          <Authenticated>
            <AppRoutes />
          </Authenticated>
        </>
      ) : (
        <AppRoutes />
      )}
    </ThemeProvider>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <p className="text-foreground/70">Indlæser...</p>
    </div>
  );
}

function SignInScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          variables: { colorPrimary: "var(--accent)" },
        }}
      />
    </div>
  );
}

function LibraryDetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ExerciseDetailPage id={id as import("../convex/_generated/dataModel").Id<"exercises">} />;
}

export default App;
