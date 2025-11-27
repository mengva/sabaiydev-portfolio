'use client'

// src/app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar";
import trpc from "../trpc/client";
import { MyDataDto } from "@/admin/packages/types/constants";
import { createContext } from "react";
import { AppSidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

interface MyDataContextDto {
  refetch: () => void;
  isLoading: boolean;
  isRefetching: boolean;
  data: MyDataDto;
}

export const MyDataContext = createContext<MyDataContextDto | undefined>(undefined);

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
    return <div className="w-full min-h-screen flex justify-center items-center">
      <div className="text-2xl!">
        Loading...
      </div>
    </div>
  }
  const data: MyDataDto = response?.data ?? null;
  return (
    <MyDataContext.Provider value={{ refetch, isLoading, isRefetching, data }}>
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
    </MyDataContext.Provider>
  );
}