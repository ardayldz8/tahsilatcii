"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  Bell,
  Gift,
  Copy,
  Check,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { toast } from "sonner";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "@/lib/dashboard/display";
import { formatCurrency } from "@/lib/utils/format";
import type { DashboardStats, Invoice, PlanType, Profile } from "@/types/index";
import { getOnboardingSteps } from "@/lib/onboarding";

interface DashboardReferralSummary {
  code: string;
  total: number;
  completed: number;
  reward: string;
}

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

export default function PanelPageClient({
  profile,
  stats,
  invoices,
  referrals,
}: {
  profile: Profile;
  stats: DashboardStats;
  invoices: Invoice[];
  referrals: DashboardReferralSummary;
}) {
  const [copied, setCopied] = useState(false);

  const plan = profile.plan || "free";
  const maxC = PLAN_MAX_CUSTOMERS[plan];
  const maxR = PLAN_MAX_REMINDERS[plan];
  const customerPct = Math.min((stats.totalCustomers / maxC) * 100, 100);
  const reminderPct = Math.min((stats.remindersSentThisMonth / maxR) * 100, 100);
  const referralLink = referrals.code
    ? `https://tahsilatci.com/davet/${referrals.code}`
    : "https://tahsilatci.com/davet/...";
  const onboarding = getOnboardingSteps({ profile, stats });

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    toast.success("Davet linki kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout
      title={`Merhaba, ${profile.full_name?.split(" ")[0] || "Kullanici"}`}
      description={profile.business_name || ""}
    >
      <div className="w-full space-y-5">
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
                       <p className="text-sm font-semibold text-foreground">{step.title}</p>
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
                     <Link href={step.href} className="mt-3 inline-flex text-xs font-medium text-sky-700 hover:underline">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Aylik Gelir</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.monthlyRevenue} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`₺${Number(v).toLocaleString("tr-TR")}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="tahsilat" name="Tahsilat" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alacak" name="Alacak" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Fatura Durumlari</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ value }) => `${value}`}
                    labelLine={false}
                  >
                    {stats.invoiceStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, _name, item) => [String(v), INVOICE_STATUS_LABELS[item?.payload?.name] ?? ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tahsilat Orani</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.collectionRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `%${v}`} />
                  <Tooltip formatter={(v) => [`%${v}`, "Tahsilat Orani"]} />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">En Büyük Müşteriler</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.topCustomers} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`₺${Number(v).toLocaleString("tr-TR")}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Toplam" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="paid" name="Odenen" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Son Faturalar</CardTitle>
                <Link href="/faturalar" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  Tümü <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Henuz fatura yok.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-foreground">{invoice.customer?.name || "—"}</span>
                        <span className="text-xs text-muted-foreground ml-2 font-mono">{invoice.invoice_no}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-sm text-foreground">{formatCurrency(invoice.amount)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-sm">Davet Et, Kazan</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Arkadaslarinizi davet edin, her başarılı kayıt icin 1 ay ucretsiz kazanın.
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 text-xs bg-muted rounded-md px-3 py-2 text-muted-foreground border border-border min-w-0 truncate"
                />
                <Button size="sm" variant="outline" onClick={copyLink} className="flex-shrink-0 px-2.5">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Davet", value: String(referrals.total) },
                  { label: "Tamamlanan", value: String(referrals.completed) },
                  { label: "Ödül", value: referrals.reward },
                ].map((stat) => (
                  <div key={stat.label} className="text-center bg-muted rounded-lg p-2">
                    <div className="font-bold text-sm text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
