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
  Database,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
  { title: "Meus Dados", url: "/meus-dados", icon: Database },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" style={{ background: '#FFFFFF', borderRight: '1px solid #E8E2DC' }}>
      <SidebarHeader className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid #F0EBE5' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: 'linear-gradient(135deg, #8B6E5A, #D4B9A8)' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-[18px] font-display font-semibold tracking-[0.12em] uppercase" style={{ color: '#1C1917' }}>GroupFlow</h2>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em] font-sans font-medium px-5 pt-5 pb-1.5" style={{ color: '#C4B8B0' }}>
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
                      className="nav-item-light text-[13px] font-sans font-normal mx-3 rounded-lg px-5 py-2.5 transition-all duration-200"
                      activeClassName="nav-item-light-active"
                    >
                      <item.icon className="mr-2.5 h-4 w-4" style={{ opacity: 0.7 }} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em] font-sans font-medium px-5 pt-5 pb-1.5" style={{ color: '#C4B8B0' }}>
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="nav-item-light text-[13px] font-sans font-normal mx-3 rounded-lg px-5 py-2.5 transition-all duration-200"
                      activeClassName="nav-item-light-active"
                    >
                      <item.icon className="mr-2.5 h-4 w-4" style={{ opacity: 0.7 }} />
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
          <div className="rounded-xl p-4" style={{ background: '#F7F4F0', border: '1px solid #E8E2DC' }}>
            <p className="text-[11px] font-sans font-medium uppercase tracking-[0.07em]" style={{ color: '#A09890' }}>Plano Atual</p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#1C1917' }}>Pro</p>
            <div className="mt-3 progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '75%' }} />
            </div>
            <p className="mt-1.5 text-[11px] font-data" style={{ color: '#A09890' }}>75% do limite usado</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
