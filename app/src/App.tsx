import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { CalendarPage } from "./pages/CalendarPage";
import { LibraryPage, ExerciseDetailPage } from "./pages/LibraryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AddWorkoutPage } from "./pages/AddWorkoutPage";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL ?? "");

function App() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<CalendarPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="library/:id" element={<LibraryDetailRoute />} />
              <Route path="add" element={<AddWorkoutPage />} />
              <Route path="history" element={<HistoryPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ConvexProvider>
  );
}

function LibraryDetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ExerciseDetailPage id={id as import("../convex/_generated/dataModel").Id<"exercises">} />;
}

export default App;
