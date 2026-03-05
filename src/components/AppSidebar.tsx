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
  { title: "Meus Dados", url: "/meus-dados", icon: Database },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" style={{ background: '#0a0c10' }}>
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-display font-semibold tracking-[0.1em] uppercase" style={{ color: '#F1F5F9' }}>GroupFlow</h2>
              <p className="text-[11px] font-data tracking-[0.1em] uppercase" style={{ color: '#475569' }}>WhatsApp Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-sans font-medium px-5 pt-4 pb-1.5" style={{ color: '#2d3748' }}>
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
                      className="text-[13px] font-sans font-normal mx-2 rounded-lg px-5 py-2.5 transition-all duration-200"
                      style={{ color: '#475569' }}
                      activeClassName="font-medium"
                      activeStyle={{ background: 'rgba(139,110,90,0.15)', color: '#D4B9A8', borderLeft: '2px solid #8B6E5A' }}
                    >
                      <item.icon className="mr-2.5 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-sans font-medium px-5 pt-4 pb-1.5" style={{ color: '#2d3748' }}>
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-[13px] font-sans font-normal mx-2 rounded-lg px-5 py-2.5 transition-all duration-200"
                      style={{ color: '#475569' }}
                      activeClassName="font-medium"
                      activeStyle={{ background: 'rgba(139,110,90,0.15)', color: '#D4B9A8', borderLeft: '2px solid #8B6E5A' }}
                    >
                      <item.icon className="mr-2.5 h-4 w-4" />
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
          <div className="rounded-xl p-4" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#475569' }}>Plano Atual</p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#F1F5F9' }}>Pro</p>
            <div className="mt-3 progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '75%' }} />
            </div>
            <p className="mt-1.5 text-[11px] font-data" style={{ color: '#475569' }}>75% do limite usado</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
