// src/app/(dashboard)/layout.tsx
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Topbar />
        <div className="p-6">
          <SidebarTrigger className="mb-4 md:hidden" />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );

}