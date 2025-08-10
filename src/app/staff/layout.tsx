
import { PageHeader } from "@/components/shared/page-header";
import { StaffSidebar } from "@/components/staff/staff-sidebar";
import { Sidebar, SidebarInset, SidebarRail } from "@/components/ui/sidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <StaffSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <PageHeader />
        {children}
      </SidebarInset>
    </div>
  );
}
