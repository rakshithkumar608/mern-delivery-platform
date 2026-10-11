import * as React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

interface AdminLayoutProps {
  children?: React.ReactNode;
  ordersCount?: number;
}

export function AdminLayout({ children, ordersCount = 12 }: AdminLayoutProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-[#F8F9FA] text-[#111827]">
        <AppSidebar ordersCount={ordersCount} />

        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
