"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  icon,
  iconClass,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1.5" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
