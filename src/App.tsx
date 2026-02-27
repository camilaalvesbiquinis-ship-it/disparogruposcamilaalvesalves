import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ConnectionsPage from "./pages/ConnectionsPage";
import GroupsPage from "./pages/GroupsPage";
import BroadcastPage from "./pages/BroadcastPage";
import SchedulesPage from "./pages/SchedulesPage";
import SecurityPage from "./pages/SecurityPage";
import ReportsPage from "./pages/ReportsPage";
import PlansPage from "./pages/PlansPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
