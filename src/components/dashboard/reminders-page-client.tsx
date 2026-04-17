"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCw,
  XCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";
import type { Reminder, ReminderChannel, ReminderStatus, ReminderType } from "@/types";

const CHANNELS = [
  { key: "tumu", label: "Tumu" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "sms", label: "SMS" },
  { key: "email", label: "E-posta" },
];

const statusConfig: Record<string, { label: string; className: string; iconClassName: string }> = {
  sent: { label: "Gonderildi", className: "bg-emerald-100 text-emerald-700", iconClassName: "text-emerald-600 bg-emerald-100" },
  delivered: { label: "Teslim Edildi", className: "bg-emerald-100 text-emerald-700", iconClassName: "text-emerald-600 bg-emerald-100" },
  failed: { label: "Basarisiz", className: "bg-red-100 text-red-700", iconClassName: "text-red-600 bg-red-100" },
  pending: { label: "Bekliyor", className: "bg-gray-100 text-gray-600", iconClassName: "text-gray-600 bg-gray-100" },
};

const typeConfig: Record<ReminderType, { label: string; className: string }> = {
  "vade-oncesi": { label: "Vade Oncesi", className: "bg-blue-100 text-blue-700" },
  "vade-gunu": { label: "Vade Gunu", className: "bg-amber-100 text-amber-700" },
  "vade-sonrasi": { label: "Vade Sonrasi", className: "bg-red-100 text-red-700" },
  hatirlatma: { label: "2. Hatirlatma", className: "bg-violet-100 text-violet-700" },
  manuel: { label: "Manuel", className: "bg-gray-100 text-gray-600" },
};

const channelConfig: Record<ReminderChannel, { label: string; className: string }> = {
  whatsapp: { label: "WhatsApp", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  sms: { label: "SMS", className: "bg-blue-50 text-blue-600 border-blue-200" },
  email: { label: "E-posta", className: "bg-violet-50 text-violet-600 border-violet-200" },
};

export default function RemindersPageClient({ initialReminders }: { initialReminders: Reminder[] }) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [activeChannel, setActiveChannel] = useState("tumu");
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());

  async function handleResend(reminder: Reminder) {
    setResendingIds((prev) => new Set(prev).add(reminder.id));
    try {
      const res = await fetch(`/api/invoices/${reminder.invoice_id}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: reminder.channel }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Gonderim basarisiz.");
        return;
      }
      const data = await res.json();
      setReminders((prev) => [data.reminder, ...prev.filter((r) => r.id !== reminder.id)]);
      toast.success("Hatirlatma yeniden gonderildi.");
    } catch {
      toast.error("Bir hata olustu.");
    } finally {
      setResendingIds((prev) => {
        const next = new Set(prev);
        next.delete(reminder.id);
        return next;
      });
    }
  }

  const filtered = activeChannel === "tumu" ? reminders : reminders.filter((r) => r.channel === activeChannel);
  const sentCount = filtered.filter((r) => r.status === "sent" || r.status === "delivered").length;
  const failedCount = filtered.filter((r) => r.status === "failed").length;
  const pendingCount = filtered.filter((r) => r.status === "pending").length;
  const successRate = filtered.length ? Math.round((sentCount / filtered.length) * 100) : 0;

  const summaryCards = [
    { label: "Basarili", value: sentCount, helper: "Gonderilen veya teslim edilen", icon: <CheckCircle2 className="h-4 w-4" />, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    { label: "Bekleyen", value: pendingCount, helper: "Provider sonucu bekleyen", icon: <Clock3 className="h-4 w-4" />, className: "border-slate-200 bg-slate-50 text-slate-700" },
    { label: "Basarisiz", value: failedCount, helper: "Tekrar gonderim gerekebilir", icon: <XCircle className="h-4 w-4" />, className: "border-red-200 bg-red-50 text-red-700" },
    { label: "Basari Orani", value: `%${successRate}`, helper: "Secili filtreye gore", icon: <AlertTriangle className="h-4 w-4" />, className: "border-sky-200 bg-sky-50 text-sky-700" },
  ];

  const getStatusIcon = (status: ReminderStatus) => {
    if (status === "sent" || status === "delivered") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "failed") return <XCircle className="h-4 w-4" />;
    return <Clock3 className="h-4 w-4" />;
  };

  return (
    <DashboardLayout title="Hatirlatmalar" description="Gonderilen hatirlatma gecmisi">
      <div className="flex gap-1 mb-5 bg-muted rounded-lg p-1 w-fit">
        {CHANNELS.map((channel) => (
          <button
            key={channel.key}
            onClick={() => setActiveChannel(channel.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeChannel === channel.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {channel.label}
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={card.className}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium opacity-80">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs opacity-80">{card.helper}</p>
                </div>
                <div className="rounded-full bg-white/80 p-2">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">{activeChannel === "tumu" ? "Henuz hatirlatma yok" : "Bu kanalda hatirlatma yok"}</h3>
          <p className="text-sm text-muted-foreground">Hatirlatmalar gonderildikce burada goruntulenir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reminder) => {
            const status = statusConfig[reminder.status] || statusConfig.pending;
            const type = typeConfig[reminder.type] || typeConfig.manuel;
            const channel = channelConfig[reminder.channel] || channelConfig.whatsapp;

            return (
              <Card
                key={reminder.id}
                className={`transition-shadow hover:shadow-sm ${reminder.status === "failed" ? "border-red-200" : reminder.status === "pending" ? "border-slate-200" : "border-emerald-200"}`}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${status.iconClassName}`}>{getStatusIcon(reminder.status)}</span>
                        <span className="font-semibold text-foreground text-sm">{reminder.customer_name}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 pl-9">
                        <span className="text-xs text-muted-foreground font-mono">{reminder.invoice_no}</span>
                        <span className="text-[11px] text-muted-foreground">{reminder.sent_at ? "Sonuc alindi" : "Kuyruga alindi"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>{status.label}</span>
                      {reminder.status === "failed" && reminder.error_message && <span className="text-[11px] font-medium text-red-600 max-w-[140px] text-right truncate" title={reminder.error_message}>{reminder.error_message}</span>}
                    </div>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type.className}`}>{type.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${channel.className}`}>{channel.label}</span>
                    {reminder.status === "failed" && (
                      <button onClick={() => handleResend(reminder)} disabled={resendingIds.has(reminder.id)} className="flex items-center gap-1 text-xs rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                        {resendingIds.has(reminder.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                        Yeniden gonder
                      </button>
                    )}
                  </div>
                  <p className="mb-2 text-xs italic leading-relaxed text-muted-foreground line-clamp-2">&ldquo;{reminder.message}&rdquo;</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{reminder.sent_at ? formatDate(reminder.sent_at) : formatDate(reminder.created_at)}</span>
                    {reminder.delivered_at && <span>Teslim: {formatDate(reminder.delivered_at)}</span>}
                    {reminder.status === "pending" && <span>Provider cevabi bekleniyor</span>}
                    {reminder.status === "failed" && reminder.error_message && <span className="text-red-500">Hata: {reminder.error_message}</span>}
                    {reminder.provider && reminder.provider !== "none" && <span className="capitalize">{reminder.provider}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
