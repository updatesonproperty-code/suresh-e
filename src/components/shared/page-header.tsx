
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function PageHeader() {
  const { open, isMobile } = useSidebar();
  
  // The button should be visible when the sidebar is closed on desktop,
  // or on mobile at all times.
  const isTriggerVisible = !open || isMobile;

  return (
    <header className={cn("sticky top-0 z-10")}>
      <div className="flex h-12 items-center border-b bg-background px-2">
        {isTriggerVisible && <SidebarTrigger />}
      </div>
    </header>
  );
}
