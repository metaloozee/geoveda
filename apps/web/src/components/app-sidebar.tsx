"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Home,
  LayoutDashboard,
  Leaf,
  Package,
  PlusCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import UserMenu from "./user-menu";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "All Lots", url: "/lots", icon: Package },
  { title: "Create Lot", url: "/lots/new", icon: PlusCircle },
];

const adminItems = [
  { title: "User Management", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useQuery(api.users.getCurrent);
  const isAdmin = user?.role === "admin";

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="flex items-center gap-2 px-2 py-1" href="/">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">Geoveda</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  render={<Link href={"/" as never} />}
                >
                  <Home />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<Link href={item.url as never} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={pathname === item.url}
                        render={<Link href={item.url as never} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
