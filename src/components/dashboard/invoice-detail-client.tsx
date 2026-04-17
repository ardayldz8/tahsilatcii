"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MessageCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Check,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "@/lib/dashboard/display";
import { formatCurrency, formatDate, formatDateTime, daysUntil } from "@/lib/utils/format";
import type { Invoice, Reminder } from "@/types/index";
import { Badge } from "@/components/ui/badge";

interface InvoiceDetailClientProps {
  invoice: Invoice;
  reminders: Reminder[];
}

function DueBadge({ dueDate, status }: { dueDate: string; status: string }) {
  if (status === "paid" || status === "cancelled") return null;

  const days = daysUntil(dueDate);
  if (days < 0) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
        {Math.abs(days)} gun gecti
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
        Bugun son gun
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
      {days} gun kaldi
    </span>
  );
}

function ReminderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "delivered":
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
          <Check className="w-3 h-3 mr-1" /> Teslim
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
          <AlertCircle className="w-3 h-3 mr-1" /> Basarisiz
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1" /> Bekliyor
        </Badge>
      );
    case "sent":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <MessageCircle className="w-3 h-3 mr-1" /> Gonderildi
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">{status}</Badge>
      );
  }
}

export default function InvoiceDetailClient({
  invoice,
  reminders,
}: InvoiceDetailClientProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [invoiceData, setInvoiceData] = useState(invoice);
  const [reminderList, setReminderList] = useState<Reminder[]>(reminders);
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadInvoice = useCallback(async () => {
    const res = await fetch(`/api/invoices/${invoice.id}`);
    if (res.ok) {
      const data = await res.json();
      setInvoiceData(data);
      setNotes(data.notes ?? "");
    }
  }, [invoice.id]);

  const loadReminders = useCallback(async () => {
    const res = await fetch(`/api/invoices/${invoice.id}/remind`);
    if (res.ok) {
      const data = await res.json();
      setReminderList(data.reminders || []);
    }
  }, [invoice.id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        newStatus === "paid"
          ? "Fatura odendi olarak isaretlendi."
          : newStatus === "cancelled"
          ? "Fatura iptal edildi."
          : "Durum guncellendi."
      );
      await loadInvoice();
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const handleWhatsApp = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "whatsapp" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Hatirlatma gonderilemedi.");
      }

      const data = await res.json();
      const message = data?.reminder?.message || "";
      const phone = invoiceData.customer?.phone?.replace(/\D/g, "") || "";
      const phoneWithCountry = phone.startsWith("90") ? phone : `90${phone}`;
      const url = `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;

      const opened = window.open(url, "_blank", "noopener,noreferrer");

      if (!opened || opened.closed || opened.location.href === "about:blank") {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        toast.success("WhatsApp acilmadi. Mesaj kopyalandi.");
        setTimeout(() => setCopied(false), 4000);
      } else {
        toast.success("WhatsApp hatirlatmasi gonderildi.");
      }
      await loadReminders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hatirlatma gonderilemedi.");
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Fotoğraf yuklenemedi.");
      }

      toast.success("Fotoğraf yuklendi.");
      await loadInvoice();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fotoğraf yüklenemedi.");
    } finally {
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/photo`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Fotoğraf silinemedi.");
      }

      toast.success("Fotoğraf silindi.");
      await loadInvoice();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fotoğraf silinemedi.");
    }
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Notlar kaydedildi.");
    } catch {
      toast.error("Notlar kaydedilemedi.");
    } finally {
      setNotesSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu fatura silinecek. Emin misiniz?")) return;

    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "İşlem başarısız.");
      }
      toast.success("Fatura silindi.");
      router.push("/faturalar");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
    }
  };

  return (
    <DashboardLayout
      title="Fatura Detay"
      description={invoiceData.invoice_no}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {invoiceData.customer?.name || "—"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {invoiceData.invoice_no}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${INVOICE_STATUS_COLORS[invoiceData.status]}`}
                    >
                      {INVOICE_STATUS_LABELS[invoiceData.status]}
                    </span>
                    <DueBadge dueDate={invoiceData.due_date} status={invoiceData.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-black text-foreground">
                    {formatCurrency(invoiceData.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Vade Tarihi</p>
                    <p className="font-medium mt-0.5">{formatDate(invoiceData.due_date)}</p>
                  </div>
                  {invoiceData.paid_at && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Ödeme Tarihi</p>
                      <p className="font-medium mt-0.5">{formatDate(invoiceData.paid_at)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Oluşturma</p>
                    <p className="font-medium mt-0.5">{formatDate(invoiceData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Son Güncellenme</p>
                    <p className="font-medium mt-0.5">{formatDate(invoiceData.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fatura ile ilgili notlar..."
                  rows={3}
                  className="mb-3"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={notesSaving || notes === invoiceData.notes}
                >
                  {notesSaving ? "Kaydediliyor..." : "Notları Kaydet"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Hatırlatma Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminderList.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Bu fatura için henüz hatırlatma gönderilmedi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminderList.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium uppercase">
                              {reminder.channel === "whatsapp" ? "WhatsApp" : "SMS"}
                            </span>
                            <ReminderStatusBadge status={reminder.status} />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {reminder.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(reminder.created_at)}
                            {reminder.sent_at && ` • ${formatDateTime(reminder.sent_at)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium w-16 flex-shrink-0">Adi:</span>
                  <span>{invoiceData.customer?.name || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span>{invoiceData.customer?.phone || "—"}</span>
                </div>
                {invoiceData.customer?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{invoiceData.customer.email}</span>
                  </div>
                )}
                {invoiceData.customer?.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{invoiceData.customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fotoğraf</CardTitle>
              </CardHeader>
              <CardContent>
                {invoiceData.photo_url ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={invoiceData.photo_url}
                        alt="fatura"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Camera className="w-3.5 h-3.5 mr-1.5" />
                        Değiştir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-600"
                        onClick={handleDeletePhoto}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Fotoğraf Ekle</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoiceData.status !== "paid" && invoiceData.status !== "cancelled" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleWhatsApp}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-2" />
                      {copied ? "Kopyalandı!" : "WhatsApp Hatırlatma"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-green-600 hover:text-green-600"
                      onClick={() => handleStatusChange("paid")}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-2" />
                      Ödendi İşaretle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleStatusChange("cancelled")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-2" />
                      İptal Et
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Faturayı Sil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
