"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDashboardSidebar } from "./dashboard-shell";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  const sidebar = useDashboardSidebar();

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-10">
      <button
        type="button"
        className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        onClick={sidebar?.openMobile}
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <Separator orientation="vertical" className="h-5 lg:hidden" />
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-gray-900 text-sm leading-tight">{title}</h1>
        {description && (
          <p className="text-xs text-gray-500 leading-tight mt-0.5 hidden sm:block">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
