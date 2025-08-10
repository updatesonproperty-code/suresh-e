
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Receipt, MessageSquare, LogOut } from "lucide-react";
import { Logo } from "../icons/logo";
import { useEffect, useState } from "react";
import { useSidebar } from "../ui/sidebar";

const menuItems = [
  { href: "/staff/chat", label: "Chat", icon: MessageSquare },
  { href: "/staff/slips", label: "Generated Slips", icon: Receipt },
];

export function StaffSidebar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { isMobile, setOpenMobile } = useSidebar();

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
    
    // Clear application state
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
        {menuItems.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href} onClick={handleMenuItemClick}>
            <Link href={href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(href)}
                tooltip={{ children: label }}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="p-2 mt-auto border-t">
         <SidebarMenuButton onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
        </SidebarMenuButton>
      </div>
    </SidebarContent>
  );
}
