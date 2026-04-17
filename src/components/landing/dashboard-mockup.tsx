import { MessageCircle, Check, Clock, AlertCircle, Bell } from "lucide-react";

const invoices = [
  { name: "Ahmet Yilmaz", amount: "₺2.400", status: "odendi", date: "15 Ara" },
  { name: "Fatma Demir", amount: "₺1.850", status: "bekliyor", date: "18 Ara" },
  { name: "Mehmet Kaya", amount: "₺3.200", status: "gecikti", date: "10 Ara" },
  { name: "Ayse Celik", amount: "₺950", status: "odendi", date: "20 Ara" },
  { name: "Ibrahim Sahin", amount: "₺1.600", status: "bekliyor", date: "22 Ara" },
];

const statusConfig = {
  odendi: {
    label: "Odendi",
    icon: Check,
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  bekliyor: {
    label: "Bekliyor",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  gecikti: {
    label: "Gecikti",
    icon: AlertCircle,
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-60" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="bg-primary px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                <Bell className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">TahsilatCI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs">Canli</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/15 rounded-xl p-2.5 text-center">
              <div className="text-white font-bold text-sm">₺8.450</div>
              <div className="text-white/70 text-xs">Bu ay</div>
            </div>
            <div className="bg-white/15 rounded-xl p-2.5 text-center">
              <div className="text-white font-bold text-sm">12</div>
              <div className="text-white/70 text-xs">Fatura</div>
            </div>
            <div className="bg-emerald-500/30 rounded-xl p-2.5 text-center">
              <div className="text-white font-bold text-sm">%94</div>
              <div className="text-white/70 text-xs">Tahsilat</div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Son Faturalar</span>
            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
              Tumu
            </span>
          </div>

          <div className="space-y-1.5">
            {invoices.map((invoice, i) => {
              const config = statusConfig[invoice.status as keyof typeof statusConfig];
              const Icon = config.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {invoice.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground leading-tight">
                        {invoice.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{invoice.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{invoice.amount}</span>
                    <span
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="mt-3 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
            data-testid="button-whatsapp-mockup"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Hatirlatma Gonder
          </button>
        </div>
      </div>
    </div>
  );
}
