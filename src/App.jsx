import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CompetitorsPage from "./pages/CompetitorsPage.jsx";
import ScrapePage from "./pages/ScrapePage.jsx";
import ChangesPage from "./pages/ChangesPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

const App = () => {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/competitors" element={<CompetitorsPage />} />
        <Route path="/scrape" element={<ScrapePage />} />
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </ToastProvider>
  );
};

export default App;
