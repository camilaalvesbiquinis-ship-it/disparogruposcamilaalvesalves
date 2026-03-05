import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Dashboard from "./pages/Dashboard";
import ConnectionsPage from "./pages/ConnectionsPage";
import GroupsPage from "./pages/GroupsPage";
import BroadcastPage from "./pages/BroadcastPage";
import MessagesPage from "./pages/MessagesPage";
import SchedulesPage from "./pages/SchedulesPage";
import SecurityPage from "./pages/SecurityPage";
import ReportsPage from "./pages/ReportsPage";
import PlansPage from "./pages/PlansPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import AuthPage from "./pages/AuthPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import JoinPage from "./pages/JoinPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function RoleProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: "gerente" | "criador" }) {
  const { role, isLoading, canCreate, canManage } = useUserRole();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  const hasAccess = requiredRole === "gerente" ? canManage : canCreate;
  if (!hasAccess) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthRoute />} />
    <Route path="/join" element={<JoinPage />} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
    <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
    <Route path="/broadcast" element={<ProtectedRoute><RoleProtectedRoute requiredRole="criador"><BroadcastPage /></RoleProtectedRoute></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
    <Route path="/schedules" element={<ProtectedRoute><RoleProtectedRoute requiredRole="criador"><SchedulesPage /></RoleProtectedRoute></ProtectedRoute>} />
    <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
    <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute><RoleProtectedRoute requiredRole="gerente"><UsersPage /></RoleProtectedRoute></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    <Route path="/admin/audit-logs" element={<ProtectedRoute><RoleProtectedRoute requiredRole="gerente"><AuditLogsPage /></RoleProtectedRoute></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
