"use client";

import { useState, useRef } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Customer } from "@/types/index";

export function NewInvoiceDialog({
  open,
  onClose,
  customers,
  customersLoading,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  customersLoading: boolean;
  onCreated: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount || !dueDate) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          amount: parseFloat(amount.replace(",", ".")),
          due_date: dueDate,
          notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      await onCreated();
      toast.success("Fatura oluşturuldu!");
      onClose();
      setCustomerId("");
      setAmount("");
      setDueDate("");
      setNotes("");
    } catch {
      toast.error("Fatura oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Fatura Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Müşteri</Label>
            <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue
                  placeholder={
                    customersLoading ? "Müşteriler yükleniyor" : "Müşteri seçin"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tutar (TL)</Label>
            <Input
              className="mt-1"
              placeholder="1.500"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label>Son Odeme Tarihi</Label>
            <Input
              className="mt-1"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Notlar</Label>
            <Textarea
              className="mt-1 resize-none"
              rows={3}
              placeholder="Opsiyonel not..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Iptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Fatura Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CSVDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<
    { musteri: string; tutar: string; tarih: string; not: string }[]
  >([]);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const rows = lines.slice(1, 6).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          musteri: cols[0] || "",
          tutar: cols[1] || "",
          tarih: cols[2] || "",
          not: cols[3] || "",
        };
      });
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/invoices/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      await onImported();
      toast.success(
        `${data.count || preview.length} fatura başarıyla aktarıldı!`
      );
      onClose();
      setFile(null);
      setPreview([]);
    } catch {
      toast.error("CSV aktarımı başarısız.");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Toplu Fatura Yükle (CSV)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
            CSV kolonları: Müşteri Adı, Tutar, Son Odeme Tarihi (YYYY-AA-GG),
            Notlar
          </p>
          <div
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
              file
                ? "border-emerald-400 bg-emerald-50"
                : "border-border hover:border-primary/40 hover:bg-primary/5"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet
              className={`w-7 h-7 ${
                file ? "text-emerald-500" : "text-muted-foreground"
              }`}
            />
            <p className="text-sm text-muted-foreground text-center">
              {file
                ? file.name
                : "CSV dosyanızı buraya sürükleyin veya tıklayın"}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </div>

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-2">
                {preview.length} fatura önizlemesi:
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Müşteri
                      </th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                        Tutar
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Tarih
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">
                        Not
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-t border-border ${
                          i % 2 === 1 ? "bg-muted/30" : ""
                        }`}
                      >
                        <td className="px-3 py-2 text-foreground font-medium">
                          {row.musteri}
                        </td>
                        <td className="px-3 py-2 text-right text-foreground">
                          ₺{row.tutar}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {row.tarih}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                          {row.not || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Iptal
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing
              ? "Aktarılıyor..."
              : file
              ? `${preview.length} Fatura Aktar`
              : "Önce Dosya Seçin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
