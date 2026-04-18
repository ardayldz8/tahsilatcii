import type { Profile } from "@/types/index";

export interface OnboardingStep {
  key: "profile" | "customer" | "invoice" | "reminder";
  title: string;
  description: string;
  href: string;
  completed: boolean;
}

interface OnboardingStats {
  totalCustomers: number;
  totalInvoices: number;
  remindersSentThisMonth: number;
}

export function getOnboardingSteps(params: {
  profile: Profile | null;
  stats: OnboardingStats | null;
}) {
  const { profile, stats } = params;

  const steps: OnboardingStep[] = [
    {
      key: "profile",
      title: "Profilini tamamla",
      description: "Isletme adi, telefon ve meslek bilgilerini doldur.",
      href: "/ayarlar",
      completed: Boolean(profile?.business_name && profile?.phone && profile?.business_type),
    },
    {
      key: "customer",
      title: "Ilk musterini ekle",
      description: "Tahsilat takibine baslamak icin musteri olustur.",
      href: "/musteriler",
      completed: (stats?.totalCustomers ?? 0) > 0,
    },
    {
      key: "invoice",
      title: "Ilk faturani olustur",
      description: "Musterine ait ilk alacagini sisteme kaydet.",
      href: "/faturalar",
      completed: (stats?.totalInvoices ?? 0) > 0,
    },
    {
      key: "reminder",
      title: "Hatirlatma gonder",
      description: "Bir fatura icin manuel veya otomatik hatirlatma kullan.",
      href: "/hatirlatmalar",
      completed: (stats?.remindersSentThisMonth ?? 0) > 0,
    },
  ];

  return {
    steps,
    completedCount: steps.filter((step) => step.completed).length,
    totalCount: steps.length,
    isComplete: steps.every((step) => step.completed),
  };
}
