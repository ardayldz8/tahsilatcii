"use client";

import type { ReactNode } from "react";
import PageHeader from "./page-header";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Compatibility wrapper. The real sidebar + shell is hoisted to
 * `src/app/(dashboard)/layout.tsx` via <DashboardShell>.
 * Pages still use <DashboardLayout title=... actions=...> to render
 * their per-page header and content padding.
 */
export default function DashboardLayout({
  children,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <div className="p-4 md:p-6">{children}</div>
    </>
  );
}
