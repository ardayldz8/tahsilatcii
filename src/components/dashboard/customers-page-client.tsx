"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import type { Customer } from "@/types/index";

function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground">{customer.name}</h3>
            <p className="text-xs text-muted-foreground">{customer.phone}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded hover:bg-muted transition-colors">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(customer)}>Düzenle</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(customer)} className="text-red-600">
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {customer.email && <p className="text-xs text-muted-foreground mb-1">{customer.email}</p>}
        {customer.address && <p className="text-xs text-muted-foreground mb-2">{customer.address}</p>}
        <div className="mt-2">
          {customer.total_debt > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
              {formatCurrency(customer.total_debt)} alacak
            </span>
          ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              Borcu yok
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerForm({
  customer,
  onClose,
  onSaved,
}: {
  customer?: Customer;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [notes, setNotes] = useState(customer?.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Ad ve telefon zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: name.trim(),
        phone: phone.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      const url = customer ? `/api/customers/${customer.id}` : "/api/customers";
      const method = customer ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "İşlem başarısız.");
      }

      toast.success(customer ? "Müşteri güncellendi!" : "Müşteri eklendi!");
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Ad Soyad <span className="text-red-500">*</span></Label>
          <Input className="mt-1" placeholder="Ahmet Yılmaz" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Telefon <span className="text-red-500">*</span></Label>
          <Input className="mt-1" type="tel" placeholder="0532 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <Label>E-posta <span className="text-muted-foreground text-xs">(opsiyonel)</span></Label>
          <Input className="mt-1" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Adres <span className="text-muted-foreground text-xs">(opsiyonel)</span></Label>
          <Input className="mt-1" placeholder="Mahalle, İlçe, Şehir" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label>Notlar <span className="text-muted-foreground text-xs">(opsiyonel)</span></Label>
          <Textarea className="mt-1 resize-none" rows={3} placeholder="Bu müşteri hakkında notlar..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
        <Button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function CustomersPageClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const d = await res.json();
        setCustomers(Array.isArray(d) ? d : d.data || []);
      }
    } catch {
      toast.error("Müşteriler yüklenemedi.");
    }
  };

  const filtered = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search)
  );

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deleteCustomer.id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Silme işlemi başarısız.");
      }

      toast.success(`${deleteCustomer.name} silindi.`);
      setDeleteCustomer(null);
      await loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Silme işlemi başarısız.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Musteriler"
      description={`${customers.length} müşteri kayıtlı`}
      actions={
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Yeni Müşteri
        </Button>
      }
    >
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Müşteri ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Müşteri bulunamadı</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Arama kriterlerinize uygun müşteri yok." : "Ilk müşterinizi ekleyerek başlayın."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} onEdit={setEditCustomer} onDelete={setDeleteCustomer} />
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            <DialogDescription>Müşterinizin bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <CustomerForm onClose={() => setAddOpen(false)} onSaved={loadCustomers} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Musteri Düzenle</DialogTitle>
            <DialogDescription>Müşteri bilgilerini güncelleyin.</DialogDescription>
          </DialogHeader>
          {editCustomer && <CustomerForm customer={editCustomer} onClose={() => setEditCustomer(null)} onSaved={loadCustomers} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Müşteriyi Sil</DialogTitle>
            <DialogDescription>
              <strong>{deleteCustomer?.name}</strong> adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCustomer(null)}>İptal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
