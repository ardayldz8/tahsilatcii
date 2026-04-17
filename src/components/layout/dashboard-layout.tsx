"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import SidebarContent from "./dashboard-sidebar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Separator orientation="vertical" className="h-5 lg:hidden" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-sm leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-gray-500 leading-tight mt-0.5 hidden sm:block">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
