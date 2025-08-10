
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { Sidebar, SidebarInset, SidebarRail } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <AdminSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <PageHeader />
        {children}
      </SidebarInset>
    </div>
  );
}
