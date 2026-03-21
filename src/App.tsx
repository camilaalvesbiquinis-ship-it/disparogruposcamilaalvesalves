import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

import Dashboard from "./pages/Dashboard";
import ConnectionsPage from "./pages/ConnectionsPage";
import GroupsPage from "./pages/GroupsPage";
import BroadcastPage from "./pages/BroadcastPage";
import MessagesPage from "./pages/MessagesPage";
import SchedulesPage from "./pages/SchedulesPage";
import SecurityPage from "./pages/SecurityPage";



import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import AuthPage from "./pages/AuthPage";


import JoinPage from "./pages/JoinPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — avoid refetch on every navigation
      gcTime: 10 * 60 * 1000,   // 10 min cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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

function SessionManager({ children }: { children: React.ReactNode }) {
  useSessionTimeout();
  return <>{children}</>;
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
    
    
    <Route path="/users" element={<ProtectedRoute><RoleProtectedRoute requiredRole="gerente"><UsersPage /></RoleProtectedRoute></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SessionManager>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SessionManager>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
