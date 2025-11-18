'use client'

// src/app/(dashboard)/layout.tsx
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import trpc from "../trpc/client";
import { StaffSessionDto } from "@/admin/packages/types/constants";
import { createContext } from "react";

interface StaffSessionContextDto {
  refetch: () => void;
  isLoading: boolean;
  isRefetching: boolean;
  data: StaffSessionDto;
}

export const StaffSessionContext = createContext<StaffSessionContextDto | undefined>(undefined);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: response,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.app.admin.staff.getBySessionToken.useQuery();
  if (isLoading) {
    return <div></div>
  }
  const data: StaffSessionDto = response?.data ?? null;
  return (
    <StaffSessionContext.Provider value={{ refetch, isLoading, isRefetching, data }}>
      <SidebarProvider>
        <main className="w-full">
          {children}
        </main>
      </SidebarProvider>
    </StaffSessionContext.Provider>
  );
}