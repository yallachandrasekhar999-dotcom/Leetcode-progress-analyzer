import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import AppLayout from "./components/Layout/AppLayout";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import AnalysisPage from "./pages/AnalysisPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import PlannerPage from "./pages/PlannerPage";
import TrackerPage from "./pages/TrackerPage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Public home page (no sidebar) */}
            <Route path="/" element={<Home />} />

            {/* App routes with sidebar layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analysis"  element={<AnalysisPage />} />
              <Route path="/recommend" element={<RecommendationsPage />} />
              <Route path="/planner"   element={<PlannerPage />} />
              <Route path="/tracker"   element={<TrackerPage />} />
              <Route path="/compare"   element={<ComparePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}
