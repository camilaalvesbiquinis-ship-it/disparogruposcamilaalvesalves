import {
  LayoutDashboard, Smartphone, Users, Send, Mail, CalendarClock,
  Shield, BarChart3, Settings, UserCog, ScrollText } from
"lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar } from
"@/components/ui/sidebar";

const mainNav = [
{ title: "Dashboard", url: "/", icon: LayoutDashboard },
{ title: "Conexões", url: "/connections", icon: Smartphone },
{ title: "Grupos", url: "/groups", icon: Users },
{ title: "Disparos", url: "/broadcast", icon: Send },
{ title: "Mensagens", url: "/messages", icon: Mail },
{ title: "Agendamentos", url: "/schedules", icon: CalendarClock }];


const systemNav = [
{ title: "Usuários", url: "/users", icon: UserCog },
{ title: "Auditoria", url: "/admin/audit-logs", icon: ScrollText },
{ title: "Segurança", url: "/security", icon: Shield },
{ title: "Relatórios", url: "/reports", icon: BarChart3 },

{ title: "Configurações", url: "/settings", icon: Settings }];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="bg-card border-r">
      <SidebarHeader className="px-6 pt-6 pb-5 border-b">
        <div className="flex items-center gap-3">
          <Gem className="h-5 w-5 text-foreground shrink-0" />
          {!collapsed &&
          <h2 className="text-lg font-display font-light tracking-[0.15em] uppercase text-foreground">
              Disparo Grupo 🌴CA🌴    
            </h2>
          }
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] font-sans font-semibold px-5 pt-5 pb-1.5 text-muted-foreground">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="nav-item-light text-[13px] font-sans mx-3 rounded-sm px-5 py-2.5 transition-colors duration-200"
                    activeClassName="nav-item-light-active">
                    
                      <item.icon className="mr-2.5 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] font-sans font-semibold px-5 pt-5 pb-1.5 text-muted-foreground">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                    to={item.url}
                    className="nav-item-light text-[13px] font-sans mx-3 rounded-sm px-5 py-2.5 transition-colors duration-200"
                    activeClassName="nav-item-light-active">
                    
                      <item.icon className="mr-2.5 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed &&
        <div className="rounded-sm p-4 bg-secondary border">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.07em] text-muted-foreground">Plano Atual</p>
            <p className="text-sm font-semibold mt-1 text-foreground">Pro</p>
            <div className="mt-3 progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '75%' }} />
            </div>
            <p className="mt-1.5 text-[11px] font-data text-muted-foreground">75% do limite usado</p>
          </div>
        }
      </SidebarFooter>
    </Sidebar>);

}