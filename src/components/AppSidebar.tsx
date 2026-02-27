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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-foreground">GroupFlow</h2>
              <p className="text-[10px] text-muted-foreground">WhatsApp Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-widest">
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
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
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
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-widest">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
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
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-[10px] font-medium text-muted-foreground">Plano Atual</p>
            <p className="text-sm font-semibold text-foreground">Pro</p>
            <div className="mt-2 h-1.5 rounded-full bg-muted">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">75% do limite usado</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
