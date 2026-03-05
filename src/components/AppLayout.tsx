import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const initial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: '#080a0f' }}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-10" style={{ background: '#080a0f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <SidebarTrigger style={{ color: '#64748b' }} />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative" style={{ color: '#64748b' }}>
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,110,90,0.2)' }}>
                <span className="text-xs font-semibold font-data" style={{ color: '#D4B9A8' }}>{initial}</span>
              </div>
              <Button variant="ghost" size="icon" style={{ color: '#64748b' }} onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-7 overflow-auto max-w-[1400px] mx-auto w-full">
            {children}
          </main>
          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 0' }}>
            <p className="text-center font-data text-[11px] tracking-[0.15em] uppercase" style={{ color: '#1e293b' }}>
              GroupFlow · WhatsApp Manager
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
