"use client";

import { useState } from "react";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PlanType, Profile } from "@/types";

interface PlanConfig {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | null;
  iconClass: string;
  features: string[];
  popular: boolean;
}

const plans: PlanConfig[] = [
  { id: "free", name: "Ucretsiz", price: "₺0", period: "sonsuza kadar", description: "Baslamak icin ideal", icon: null, iconClass: "", features: ["3 musteri", "10 hatirlatma/ay", "WhatsApp link", "Temel dashboard"], popular: false },
  { id: "esnaf", name: "Esnaf", price: "₺99", period: "ay", description: "Buyuyen esnaflar icin", icon: Sparkles, iconClass: "text-blue-500", features: ["25 musteri", "Sinirsiz hatirlatma", "WhatsApp + SMS", "Detayli raporlar", "Fatura fotografi", "Oncelikli destek"], popular: true },
  { id: "usta", name: "Usta", price: "₺199", period: "ay", description: "Buyuk isletmeler icin", icon: Crown, iconClass: "text-amber-500", features: ["Sinirsiz musteri", "Sinirsiz hatirlatma", "WhatsApp + SMS + E-posta", "Gelismis analitik", "CSV toplu yukleme", "API erisimi", "7/24 destek"], popular: false },
];

export default function PricingPageClient({ initialProfile }: { initialProfile: Profile | null }) {
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const currentPlan = initialProfile?.plan || "free";

  const handleUpgrade = async (planId: PlanType) => {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Odeme islemi baslatilamadi.");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.mode === "pending") {
        toast.message("Bekleyen bir odeme oturumu zaten var.");
      } else if (data.mode === "configuration_required") {
        toast.error("Odeme saglayicisi henuz yapilandirilmadi.");
      } else {
        toast.success(`${planId === "esnaf" ? "Esnaf" : "Usta"} planina gecis baslatildi.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Odeme islemi baslatilamadi.");
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <DashboardLayout title="Fiyatlandirma" description="Isletmenize en uygun plani secin">
      <div className="w-full space-y-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative rounded-3xl border transition-all duration-200 ${
                  isCurrent
                    ? "border-emerald-400 bg-gradient-to-b from-emerald-50/70 to-white shadow-xl shadow-emerald-500/10"
                    : plan.popular
                      ? "border-primary bg-gradient-to-b from-blue-50/70 to-white shadow-xl shadow-primary/10"
                      : "border-border bg-white hover:-translate-y-0.5 hover:shadow-lg"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    isCurrent ? "bg-emerald-500" : plan.popular ? "bg-primary" : "bg-amber-400/80"
                  }`}
                />
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex min-h-8 items-start justify-center">
                    {isCurrent ? (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        Mevcut Plan
                      </span>
                    ) : plan.popular ? (
                      <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        <Zap className="w-3 h-3 fill-white" />
                        En Populer
                      </span>
                    ) : null}
                  </div>
                  <div className="mb-6">
                    <div className="mb-2 flex items-center gap-2">
                      {Icon && <Icon className={`h-4 w-4 ${plan.iconClass}`} />}
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-5xl font-black tracking-tight text-foreground">{plan.price}</span>
                      <span className="pb-1 text-base text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>
                  {isCurrent ? (
                    <Button className="mb-6 h-12 w-full rounded-xl bg-emerald-500 text-base hover:bg-emerald-600 cursor-default" disabled>Mevcut Plan</Button>
                  ) : (
                    <Button className="mb-6 h-12 w-full rounded-xl text-base" variant={plan.popular ? "default" : "outline"} onClick={() => handleUpgrade(plan.id)} disabled={upgrading === plan.id}>
                      {upgrading === plan.id ? "Yonlendiriliyor..." : plan.id === "free" ? "Ucretsiz Kullan" : "14 Gun Ucretsiz Dene"}
                    </Button>
                  )}
                  <div className="mb-4 h-px bg-border/80" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3 w-3 text-emerald-600" /></div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-2 text-base font-semibold text-foreground">Odeme</h3>
            <p className="mb-5 text-sm text-muted-foreground">Plan seciminden sonra guvenli odeme formu burada gozukecektir.</p>
            <div className="flex h-28 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40">
              <p className="text-sm text-muted-foreground">iyzico odeme formu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
