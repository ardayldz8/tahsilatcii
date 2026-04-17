"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, CheckCircle, MoreVertical, Camera, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "@/lib/dashboard/display";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import type { Invoice } from "@/types/index";

function DueText({ dueDate }: { dueDate: string }) {
  const days = daysUntil(dueDate);
  if (days < 0)
    return (
      <span className="text-red-500 font-medium">
        {Math.abs(days)} gun gecti
      </span>
    );
  if (days === 0)
    return <span className="text-amber-500 font-medium">Bugun son gun</span>;
  return <span className="text-muted-foreground">{days} gun kaldi</span>;
}

export default function InvoiceCard({
  invoice,
  onUpdate,
}: {
  invoice: Invoice;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("[data-no-navigate]")
    ) {
      return;
    }
    router.push(`/faturalar/${invoice.id}`);
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
        throw new Error(errorData?.error || "Hatırlatma gönderilemedi.");
      }

      const data = await res.json();
      const message = data?.reminder?.message || "";

      const phone = invoice.customer?.phone?.replace(/\D/g, "") || "";
      const phoneWithCountry = phone.startsWith("90") ? phone : `90${phone}`;
      const url = `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;

      const opened = window.open(url, "_blank", "noopener,noreferrer");

      if (!opened || opened.closed || opened.location.href === "about:blank") {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        toast.success("WhatsApp açılmadı. Mesaj kopyalandı - WhatsApp'i kendiniz açın.");
        setTimeout(() => setCopied(false), 4000);
      } else {
        toast.success("WhatsApp hatırlatması gönderildi.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hatırlatma gönderilemedi.");
    }
  };

  const handlePaid = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Fatura ödendi olarak işaretlendi.");
      onUpdate();
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "İşlem başarısız.");
      }
      toast.info("Fatura iptal edildi.");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "İşlem başarısız.");
      }
      toast.success("Fatura silindi.");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
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
        throw new Error(err?.error || "Fotoğraf yüklenemedi.");
      }

      toast.success("Fotoğraf yüklendi.");
      onUpdate();
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
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fotoğraf silinemedi.");
    }
  };

  return (
    <Card
      className="hover:shadow-sm transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-semibold text-foreground">
              {invoice.customer?.name || "—"}
            </span>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {invoice.invoice_no}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded hover:bg-muted transition-colors" data-no-navigate>
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/faturalar/${invoice.id}`)}>
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Detay Gör
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleWhatsApp}>
                <MessageCircle className="w-3.5 h-3.5 mr-2" />
                WhatsApp Hatırlatma
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePaid}>
                <CheckCircle className="w-3.5 h-3.5 mr-2" />
                Ödendi İşaretle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCancel}>İptal Et</DropdownMenuItem>
              {invoice.photo_url && (
                <DropdownMenuItem onClick={handleDeletePhoto}>
                  Fotoğrafı Sil
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-black text-foreground">
            {formatCurrency(invoice.amount)}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVOICE_STATUS_COLORS[invoice.status]}`}
          >
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <span>Vade: {formatDate(invoice.due_date)}</span>
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <DueText dueDate={invoice.due_date} />
          )}
        </div>

        <div
          className="border-2 border-dashed border-border rounded-lg p-3 flex items-center gap-2 mb-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
          onClick={() => fileRef.current?.click()}
          data-no-navigate
        >
          {invoice.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={invoice.photo_url}
              alt="fatura"
              className="w-full h-16 object-cover rounded"
            />
          ) : (
            <>
              <Camera className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fotoğraf Ekle</span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/faturalar/${invoice.id}`)}
            className="flex-1 text-xs h-8"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Detay
          </Button>
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <>
              <Button
                size="sm"
                variant={copied ? "default" : "outline"}
                onClick={handleWhatsApp}
                className="flex-1 text-xs h-8"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                {copied ? "Kopyalandı!" : "Hatırlatma"}
              </Button>
              <Button
                size="sm"
                onClick={handlePaid}
                className="flex-1 text-xs h-8"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Ödendi
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
