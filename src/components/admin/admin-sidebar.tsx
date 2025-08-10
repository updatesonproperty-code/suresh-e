
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "../icons/logo";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";

const menuItems = [
  { href: "/admin/chat", label: "Conversational UI", icon: MessageSquare },
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, admin: true },
  { href: "/admin/products", label: "Manage Products", icon: Package, admin: true },
  { href: "/admin/staff", label: "Manage Staff", icon: Users, admin: true },
  { href: "/admin/slips", label: "Manage Slips", icon: FileText, admin: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const [isClient, setIsClient] = useState(false);
  const user = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem("user");
    
    // Clear application state from localStorage
    localStorage.removeItem("products");
    localStorage.removeItem("slips");

    // Also clear from window object for immediate effect
    if (typeof window !== "undefined") {
      (window as any).productState = null;
      (window as any).slipState = null;
    }

    // Redirect to login page
    window.location.href = "/";
  };

  if (!isClient) {
    return null;
  }

  return (
    <SidebarContent className="flex flex-col">
      <SidebarHeader className="border-b p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">Suresh Electricals</span>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {menuItems.map(({ href, label, icon: Icon, admin }) => (
          <SidebarMenuItem key={href} onClick={handleMenuItemClick}>
            <Link href={href}>
              <SidebarMenuButton
                className="justify-between"
                isActive={pathname === href}
              >
                <div className="flex items-center gap-2">
                  <Icon />
                  <span>{label}</span>
                </div>
                {admin && <Badge variant="outline">Admin</Badge>}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarFooter className="border-t p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 p-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                        </Avatar>
                        <SidebarMenuButton variant="ghost" className="p-0 h-auto" onClick={handleLogout}>
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <ChevronLeft />
                    </Button>
                </div>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </SidebarContent>
  );
}
