import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  LayoutDashboard,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import { UserNav } from "@/pages/main/ui/user-nav";

export function AppSidebar() {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: HomeIcon,
      color: "text-rose-500 dark:text-rose-400",
      hoverColor: "group-hover:text-rose-600 dark:group-hover:text-rose-300",
    },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-sky-500 dark:text-sky-400",
      hoverColor: "group-hover:text-sky-600 dark:group-hover:text-sky-300",
    },
    {
      path: "/users",
      label: "Users",
      icon: UsersIcon,
      color: "text-violet-500 dark:text-violet-400",
      hoverColor:
        "group-hover:text-violet-600 dark:group-hover:text-violet-300",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: SettingsIcon,
      color: "text-amber-500 dark:text-amber-400",
      hoverColor: "group-hover:text-amber-600 dark:group-hover:text-amber-300",
    },
  ];

  return (
    <>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex h-full items-center px-4">
          <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">
            My App
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="hover:bg-rose-100 dark:hover:bg-slate-700"
                  >
                    <Link to={item.path} className="group">
                      <item.icon
                        className={`mr-3 h-6 w-6 ${item.color} ${item.hoverColor}`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 bg-white/50 dark:bg-slate-800/50">
        <UserNav />
      </SidebarFooter>
    </>
  );
}
