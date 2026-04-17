"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Upload, FileSpreadsheet } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import InvoiceCard from "@/components/dashboard/invoice-card";
import { NewInvoiceDialog, CSVDialog } from "@/components/dashboard/invoice-dialogs";
import { toast } from "sonner";
import type { Customer, Invoice } from "@/types/index";

const STATUS_TABS = [
  { key: "tumu", label: "Tumu" },
  { key: "pending", label: "Bekliyor" },
  { key: "overdue", label: "Gecikti" },
  { key: "paid", label: "Ödendi" },
];

export default function InvoicesPageClient({
  initialInvoices,
}: {
  initialInvoices: Invoice[];
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tumu");
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const loadInvoices = useCallback(async () => {
    try {
      const response = await fetch("/api/invoices", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      toast.error("Faturalar yüklenirken hata oluştu.");
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    if (customers.length > 0 || customersLoading) {
      return;
    }

    setCustomersLoading(true);
    try {
      const response = await fetch("/api/customers?compact=1");
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      toast.error("Müşteriler yüklenirken hata oluştu.");
    } finally {
      setCustomersLoading(false);
    }
  }, [customers.length, customersLoading]);

  useEffect(() => {
    if (newInvoiceOpen) {
      void loadCustomers();
    }
  }, [loadCustomers, newInvoiceOpen]);

  const filtered =
    activeTab === "tumu"
      ? invoices
      : invoices.filter((invoice) => invoice.status === activeTab);

  const counts = {
    tumu: invoices.length,
    pending: invoices.filter((invoice) => invoice.status === "pending").length,
    overdue: invoices.filter((invoice) => invoice.status === "overdue").length,
    paid: invoices.filter((invoice) => invoice.status === "paid").length,
  };

  return (
    <DashboardLayout
      title="Faturalar"
      description={`${invoices.length} fatura`}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            CSV Yükle
          </Button>
          <Button size="sm" onClick={() => setNewInvoiceOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Yeni Fatura
          </Button>
        </div>
      }
    >
      <div className="flex gap-1 mb-5 bg-muted rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
               className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 activeTab === tab.key
                 ? "bg-white text-foreground shadow-sm"
                 : "text-muted-foreground hover:text-foreground"
               }`}
          >
            {tab.label}{" "}
            <span className="text-xs opacity-70 ml-1">
              ({counts[tab.key as keyof typeof counts] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Bu filtrede fatura yok</h3>
          <p className="text-sm text-muted-foreground">
            Fatura eklemek için &quot;Yeni Fatura&quot; butonunu kullanın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} onUpdate={loadInvoices} />
          ))}
        </div>
      )}

      <NewInvoiceDialog
        open={newInvoiceOpen}
        onClose={() => setNewInvoiceOpen(false)}
        customers={customers}
        customersLoading={customersLoading}
        onCreated={loadInvoices}
      />
      <CSVDialog open={csvOpen} onClose={() => setCsvOpen(false)} onImported={loadInvoices} />
    </DashboardLayout>
  );
}
