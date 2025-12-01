'use client'

// src/app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Spinner } from "@workspace/ui/components/spinner";
import trpc from "../trpc/client";
import { MyDataDto } from "@/admin/packages/types/constants";
import { createContext, useEffect, useState } from "react";
import { AppSidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import LoadingComponent from "@/components/loading";

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

  const [myData, setMyData] = useState({} as MyDataDto);

  const {
    data: response,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.app.admin.manage.staff.getBySessionToken.useQuery();

  useEffect(() => {
    const data = response?.data || null;
    if (data) {
      setMyData(data as MyDataDto);
    }
  }, [response?.data]);

  if (isLoading) {
    return <LoadingComponent />
  }

  if (!myData || !myData?.id) {
    return <LoadingComponent />
  }

  return (
    <MyDataContext.Provider value={{ refetch, isLoading, isRefetching, data: myData }}>
      <SidebarProvider>
        <AppSidebar />
        <main className="md:min-w-[calc(100%-16rem)] md:sticky top-0 w-full">
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