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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border px-8 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary font-data">{initial}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-7 overflow-auto max-w-[1400px] mx-auto w-full">
            {children}
          </main>
          <footer className="border-t border-border py-4">
            <p className="text-center font-data text-[11px] text-muted-foreground tracking-[0.15em] uppercase">
              GroupFlow · WhatsApp Manager
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
