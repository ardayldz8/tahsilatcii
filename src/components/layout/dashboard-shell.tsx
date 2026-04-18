"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import SidebarContent from "./dashboard-sidebar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SidebarControls {
  openMobile: () => void;
}

const SidebarContext = createContext<SidebarControls | null>(null);

export function useDashboardSidebar() {
  return useContext(SidebarContext);
}

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Cikis yapildi.");
    router.push("/");
    router.refresh();
  };

  return (
    <SidebarContext.Provider value={{ openMobile: () => setSidebarOpen(true) }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-gray-200">
          <SidebarContent onLogout={handleLogout} />
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-56 border-0">
            <SidebarContent
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
