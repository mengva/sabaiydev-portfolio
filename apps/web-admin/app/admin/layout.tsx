'use client'

// src/app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar";
import trpc from "../trpc/client";
import { StaffSessionDto } from "@/admin/packages/types/constants";
import { createContext } from "react";
import LoadingComponent from "./dashboard/components/loading";
import { AppSidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

interface StaffSessionContextDto {
  refetch: () => void;
  isLoading: boolean;
  isRefetching: boolean;
  data: StaffSessionDto;
}

export const StaffSessionContext = createContext<StaffSessionContextDto | undefined>(undefined);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: response,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.app.admin.manage.staff.getBySessionToken.useQuery();
  if (isLoading) {
    return <LoadingComponent />
  }
  const data: StaffSessionDto = response?.data ?? null;
  return (
    <StaffSessionContext.Provider value={{ refetch, isLoading, isRefetching, data }}>
      <SidebarProvider>
        <AppSidebar />
        <main className="md:min-w-[calc(100%-16rem)] w-full">
          <Topbar />
          <div className="p-6">
            <SidebarTrigger className="mb-4 md:hidden" />
            {children}
          </div>
        </main>
      </SidebarProvider>
    </StaffSessionContext.Provider>
  );
}