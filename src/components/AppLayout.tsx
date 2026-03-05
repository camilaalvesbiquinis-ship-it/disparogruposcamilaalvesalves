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
      <div className="min-h-screen flex w-full" style={{ background: '#F7F4F0' }}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-10" style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E2DC', boxShadow: '0 1px 0 #E8E2DC' }}>
            <div className="flex items-center gap-2">
              <SidebarTrigger style={{ color: '#A09890' }} />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative" style={{ color: '#A09890' }}>
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" style={{ background: '#922B21' }} />
              </Button>
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: '#F5EDE5' }}>
                <span className="text-xs font-semibold font-data" style={{ color: '#8B6E5A' }}>{initial}</span>
              </div>
              <Button variant="ghost" size="icon" style={{ color: '#A09890' }} onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-7 overflow-auto max-w-[1400px] mx-auto w-full">
            {children}
          </main>
          <footer style={{ borderTop: '1px solid #F0EBE5', padding: '16px 0' }}>
            <p className="text-center font-data text-[11px] tracking-[0.15em] uppercase" style={{ color: '#C4B8B0' }}>
              GroupFlow · WhatsApp Manager
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
