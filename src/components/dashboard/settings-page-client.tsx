"use client";

import { useRef, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_REMINDER_TEMPLATES } from "@/lib/reminders/templates";
import type { BusinessType, Profile, ReminderSettings, ReminderType } from "@/types/index";

const TRADES: { value: BusinessType; label: string }[] = [
  { value: "tesisatci", label: "Tesisatci" },
  { value: "elektrikci", label: "Elektrikci" },
  { value: "boyaci", label: "Boyaci" },
  { value: "klimaci", label: "Klima Teknisyeni" },
  { value: "oto_tamirci", label: "Oto Tamirci" },
  { value: "diger", label: "Diger" },
];

const VARIABLE_BADGES = [
  { var: "{customerName}", label: "Musteri Adi", desc: "Ahmet Yilmaz" },
  { var: "{invoiceNo}", label: "Fatura No", desc: "INV-1024" },
  { var: "{amount}", label: "Tutar", desc: "4.250 TL" },
  { var: "{dueDate}", label: "Vade Tarihi", desc: "25 Nisan 2026" },
  { var: "{businessName}", label: "Isletme Adi", desc: "Yildiz Teknik" },
];

const TEMPLATE_TYPES: { key: ReminderType; label: string }[] = [
  { key: "vade-oncesi", label: "Vade Oncesi" },
  { key: "vade-gunu", label: "Vade Gunu" },
  { key: "vade-sonrasi", label: "Vade Sonrasi" },
  { key: "hatirlatma", label: "Hatirlatma" },
  { key: "manuel", label: "Manuel" },
];

const TEMPLATE_PREVIEW_VALUES: Record<string, string> = {
  "{customerName}": "Ahmet Yilmaz",
  "{invoiceNo}": "INV-1024",
  "{amount}": "4.250 TL",
  "{dueDate}": "25 Nisan 2026",
  "{businessName}": "Yildiz Teknik",
};

export default function SettingsPageClient({
  initialProfile,
  initialTemplates,
  initialReminderSettings,
}: {
  initialProfile: Profile;
  initialTemplates: Record<ReminderType, string>;
  initialReminderSettings: ReminderSettings;
}) {
  const templateRefs = useRef<Partial<Record<ReminderType, HTMLTextAreaElement | null>>>({});
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [businessName, setBusinessName] = useState(initialProfile.business_name || "");
  const [businessType, setBusinessType] = useState<BusinessType>(initialProfile.business_type || "diger");
  const [savingProfile, setSavingProfile] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(initialReminderSettings.enabled);
  const [daysBefore, setDaysBefore] = useState(String(initialReminderSettings.days_before));
  const [daysAfter, setDaysAfter] = useState(String(initialReminderSettings.days_after));
  const [dueDay, setDueDay] = useState(initialReminderSettings.due_day);
  const [channels, setChannels] = useState({
    whatsapp: initialReminderSettings.channels.includes("whatsapp"),
    sms: initialReminderSettings.channels.includes("sms"),
    email: initialReminderSettings.channels.includes("email"),
  });
  const [templates, setTemplates] = useState<Record<ReminderType, string>>(initialTemplates);
  const [savingReminders, setSavingReminders] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone, business_name: businessName, business_type: businessType }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil kaydedildi!");
    } catch {
      toast.error("Profil kaydedilemedi.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveReminders = async () => {
    setSavingReminders(true);
    try {
      const parsedDaysBefore = Number.parseInt(daysBefore, 10);
      const parsedDaysAfter = Number.parseInt(daysAfter, 10);
      const res = await fetch("/api/settings/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: remindersEnabled,
          days_before: Number.isNaN(parsedDaysBefore) ? 3 : parsedDaysBefore,
          days_after: Number.isNaN(parsedDaysAfter) ? 1 : parsedDaysAfter,
          due_day: dueDay,
          channels: Object.entries(channels).filter(([, value]) => value).map(([key]) => key),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Hatirlatma ayarlari kaydedildi!");
    } catch {
      toast.error("Ayarlar kaydedilemedi.");
    } finally {
      setSavingReminders(false);
    }
  };

  const handleSaveTemplates = async () => {
    setSavingTemplates(true);
    try {
      const res = await fetch("/api/settings/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates }),
      });
      if (!res.ok) throw new Error();
      toast.success("Sablonlar kaydedildi!");
    } catch {
      toast.error("Sablonlar kaydedilemedi.");
    } finally {
      setSavingTemplates(false);
    }
  };

  const resetTemplate = (key: ReminderType) => {
    setTemplates((prev) => ({ ...prev, [key]: DEFAULT_REMINDER_TEMPLATES[key] }));
  };

  const toggleChannel = (channel: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const insertVariable = (templateKey: ReminderType, variable: string) => {
    const textarea = templateRefs.current[templateKey];
    const currentValue = templates[templateKey] || "";

    if (!textarea) {
      setTemplates((prev) => ({ ...prev, [templateKey]: `${currentValue} ${variable}`.trim() }));
      return;
    }

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const nextValue = `${currentValue.slice(0, start)}${variable}${currentValue.slice(end)}`;

    setTemplates((prev) => ({ ...prev, [templateKey]: nextValue }));

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + variable.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const getTemplatePreview = (template: string) => {
    return Object.entries(TEMPLATE_PREVIEW_VALUES).reduce(
      (message, [variable, value]) => message.replaceAll(variable, value),
      template
    );
  };

  return (
    <DashboardLayout title="Ayarlar" description="Hesap, isletme ve hatirlatma ayarlarinizi yonetin">
      <div className="grid w-full gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-3">
          <CardHeader className="pb-3"><CardTitle className="text-base">Profil Bilgileri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div><Label>Ad Soyad</Label><Input className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div><Label>Telefon</Label><Input className="mt-1" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="xl:col-span-2"><Label>Isletme Adi</Label><Input className="mt-1" value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>
              <div className="xl:col-span-2">
                <Label>Meslek</Label>
                <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                  <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{TRADES.map((trade) => <SelectItem key={trade.value} value={trade.value}>{trade.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? "Kaydediliyor..." : "Kaydet"}</Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Otomatik Hatirlatma</CardTitle>
              <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
            </div>
          </CardHeader>
          <CardContent className={`space-y-5 ${!remindersEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><Label className="text-xs">Kac gun once</Label><Input className="mt-1" type="number" value={daysBefore} onChange={(e) => setDaysBefore(e.target.value)} min="1" /></div>
              <div><Label className="text-xs">Kac gun sonra</Label><Input className="mt-1" type="number" value={daysAfter} onChange={(e) => setDaysAfter(e.target.value)} min="1" /></div>
            </div>
            <div className="flex items-center gap-2"><Checkbox checked={dueDay} onCheckedChange={(v) => setDueDay(!!v)} /><span className="text-xs">Vade gununde gonder</span></div>
            <div>
              <Label className="text-xs mb-2 block">Kanal Secimi</Label>
              <div className="flex gap-4">
                {([
                  { key: "whatsapp", label: "WhatsApp" },
                  { key: "sms", label: "SMS" },
                  { key: "email", label: "E-posta" },
                ] as const).map((channel) => (
                  <label key={channel.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={channels[channel.key]} onCheckedChange={() => toggleChannel(channel.key)} />
                    <span className="text-sm">{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveReminders} disabled={savingReminders}>{savingReminders ? "Kaydediliyor..." : "Kaydet"}</Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mesaj Sablonlari</CardTitle>
            <p className="text-xs text-muted-foreground">
              Her hatirlatma tipi icin ozel mesaj sablonlari olusturun. Akilli alanlari tiklayarak mesaja ekleyin.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-700">
                <Wand2 className="h-4 w-4" />
                <p className="text-sm font-medium">Akilli alanlar</p>
              </div>
              <p className="mb-3 text-xs text-blue-700/90">
                Asagidaki alanlar mesaj gonderilirken otomatik doldurulur. Ornegin `Musteri Adi` alanini eklerseniz,
                mesajda ilgili musterinin adi gorunur.
              </p>
              <div className="flex flex-wrap gap-2">
                {VARIABLE_BADGES.map((variable) => (
                  <div
                    key={variable.var}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs"
                  >
                    <span className="font-medium text-blue-700">{variable.label}</span>
                    <span className="text-blue-500">ornek: {variable.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {TEMPLATE_TYPES.map((template) => (
              <div key={template.key} className="rounded-2xl border border-border p-4">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <Label className="text-sm font-medium">{template.label}</Label>
                  <div className="flex flex-wrap gap-2">
                    {VARIABLE_BADGES.map((variable) => (
                      <button
                        key={`${template.key}-${variable.var}`}
                        type="button"
                        className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                        onClick={() => insertVariable(template.key, variable.var)}
                      >
                        + {variable.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  className="resize-none text-sm"
                  rows={3}
                  value={templates[template.key] || ""}
                  ref={(node) => {
                    templateRefs.current[template.key] = node;
                  }}
                  onChange={(e) => setTemplates((prev) => ({ ...prev, [template.key]: e.target.value }))}
                />
                <div className="mt-3 rounded-xl bg-muted/50 p-3">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Ornek onizleme
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {getTemplatePreview(templates[template.key] || "")}
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => resetTemplate(template.key)}
                >
                  Varsayilan sablona don
                </button>
              </div>
            ))}

            <Button onClick={handleSaveTemplates} disabled={savingTemplates}>{savingTemplates ? "Kaydediliyor..." : "Sablonlari Kaydet"}</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
