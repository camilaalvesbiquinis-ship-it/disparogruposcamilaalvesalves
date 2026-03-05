import {
  LayoutDashboard,
  Smartphone,
  Users,
  Send,
  Mail,
  CalendarClock,
  Shield,
  BarChart3,
  Settings,
  CreditCard,
  Zap,
  UserCog,
  ScrollText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Conexões", url: "/connections", icon: Smartphone },
  { title: "Grupos", url: "/groups", icon: Users },
  { title: "Disparos", url: "/broadcast", icon: Send },
  { title: "Mensagens", url: "/messages", icon: Mail },
  { title: "Agendamentos", url: "/schedules", icon: CalendarClock },
];

const systemNav = [
  { title: "Usuários", url: "/users", icon: UserCog },
  { title: "Auditoria", url: "/admin/audit-logs", icon: ScrollText },
  { title: "Segurança", url: "/security", icon: Shield },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Planos", url: "/plans", icon: CreditCard },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">GroupFlow</h2>
              <p className="text-[11px] text-muted-foreground font-data tracking-[0.1em] uppercase">WhatsApp Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-widest font-data">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      activeClassName="bg-accent/15 text-accent border border-accent/30 font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-widest font-data">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      activeClassName="bg-accent/15 text-accent border border-accent/30 font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-xl bg-secondary p-4 border border-border">
            <p className="text-[11px] font-data text-muted-foreground uppercase tracking-[0.08em]">Plano Atual</p>
            <p className="text-sm font-semibold text-foreground mt-1">Pro</p>
            <div className="mt-3 progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '75%' }} />
            </div>
            <p className="mt-1.5 text-[11px] font-data text-muted-foreground">75% do limite usado</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
