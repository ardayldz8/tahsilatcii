"use client";

import Link from "next/link";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  Bell,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils/format";
import type { PlanType, Profile } from "@/types/index";
import { getOnboardingSteps } from "@/lib/onboarding";
import type { DashboardCoreStats } from "@/lib/dashboard/overview";

const PLAN_LABELS: Record<PlanType, string> = {
  free: "Ucretsiz",
  esnaf: "Esnaf",
  usta: "Usta",
};

const PLAN_PRICE_LABELS: Record<PlanType, string> = {
  free: "₺0/ay",
  esnaf: "₺99/ay",
  usta: "₺199/ay",
};

const PLAN_MAX_CUSTOMERS: Record<PlanType, number> = {
  free: 3,
  esnaf: 25,
  usta: 999,
};

const PLAN_MAX_REMINDERS: Record<PlanType, number> = {
  free: 10,
  esnaf: 999,
  usta: 999,
};

export default function PanelCoreSection({
  profile,
  stats,
}: {
  profile: Profile;
  stats: DashboardCoreStats;
}) {
  const plan = profile.plan || "free";
  const maxC = PLAN_MAX_CUSTOMERS[plan];
  const maxR = PLAN_MAX_REMINDERS[plan];
  const customerPct = Math.min((stats.totalCustomers / maxC) * 100, 100);
  const reminderPct = Math.min((stats.remindersSentThisMonth / maxR) * 100, 100);
  const onboarding = getOnboardingSteps({ profile, stats });

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground capitalize">
                  {PLAN_LABELS[plan]} Plani
                </span>
                <Badge variant="secondary" className="text-xs">
                  {PLAN_PRICE_LABELS[plan]}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Müşteriler</span>
                    <span>
                      {stats.totalCustomers} / {maxC === 999 ? "∞" : maxC}
                    </span>
                  </div>
                  <Progress value={maxC === 999 ? 0 : customerPct} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Hatirlatma (bu ay)</span>
                    <span>
                      {stats.remindersSentThisMonth} / {maxR === 999 ? "∞" : maxR}
                    </span>
                  </div>
                  <Progress value={maxR === 999 ? 0 : reminderPct} />
                </div>
              </div>
              {(customerPct >= 80 || reminderPct >= 80) && (
                <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  Plan limitinize yaklasiyorsunuz. Planınızı yükseltin.
                </p>
              )}
            </div>
            {plan === "free" && (
              <Link href="/fiyatlandirma">
                <Button size="sm" className="flex-shrink-0">
                  Yükselt
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {!onboarding.isComplete && (
        <Card className="border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  İlk Kurulum
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  TahsilatCI&apos;yi 10 dakikada kullanmaya başlayın
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ilk tahsilat akisinizi kurmak için aşağıdaki adımları tamamlayın.
                </p>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 text-sm shadow-sm ring-1 ring-sky-100">
                <div className="text-muted-foreground">Tamamlanan</div>
                <div className="text-2xl font-bold text-sky-700">
                  {onboarding.completedCount}/{onboarding.totalCount}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {onboarding.steps.map((step) => (
                <div
                  key={step.key}
                  className={`rounded-xl border p-4 ${
                    step.completed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-sky-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    {step.completed ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        Tamam
                      </span>
                    ) : (
                      <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                        Sıradaki
                      </span>
                    )}
                  </div>
                  <p className="mt-2 min-h-10 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex text-xs font-medium text-sky-700 hover:underline"
                  >
                    {step.completed ? "Tekrar göz at" : "Adıma git"}
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          iconClass="bg-orange-100 text-orange-600"
          label="Bekleyen Alacak"
          value={formatCurrency(stats.pendingAmount)}
          sub={`${stats.totalInvoices} fatura`}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          iconClass="bg-emerald-100 text-emerald-600"
          label="Tahsil Edilen"
          value={formatCurrency(stats.collectedAmount)}
          sub="Toplam tahsilat"
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          iconClass="bg-red-100 text-red-600"
          label="Geciken Faturalar"
          value={String(stats.overdueCount)}
          sub="Vadesi gecmis"
        />
        <StatCard
          icon={<Users className="w-4 h-4" />}
          iconClass="bg-blue-100 text-blue-600"
          label="Toplam Müşteri"
          value={String(stats.totalCustomers)}
          sub="Kayıtlı müşteri"
        />
        <StatCard
          icon={<Bell className="w-4 h-4" />}
          iconClass="bg-violet-100 text-violet-600"
          label="Hatırlatma"
          value={String(stats.remindersSentThisMonth)}
          sub="Bu ay gönderilen"
        />
      </div>
    </>
  );
}
