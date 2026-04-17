"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";

const TRADE_OPTIONS = [
  { value: "tesisatci", label: "Tesisatci" },
  { value: "elektrikci", label: "Elektrikci" },
  { value: "boyaci", label: "Boyaci" },
  { value: "klimaci", label: "Klima Teknisyeni" },
  { value: "oto_tamirci", label: "Oto Tamirci" },
  { value: "diger", label: "Diger" },
] as const;

const registerSchema = z.object({
  name: z.string().min(2, "Isim en az 2 karakter olmali"),
  email: z.string().email("Gecerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Telefon en az 10 karakter olmali"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
  businessName: z.string().optional(),
  trade: z.string().min(1, "Meslek seciniz"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function KayitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [loading, setLoading] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      trade: "",
    },
  });

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/panel`,
          data: {
            full_name: data.name,
            phone: data.phone,
            business_name: data.businessName || "",
            business_type: data.trade,
            referred_by: referralCode || "",
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        const res = await fetch("/api/profile/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: authData.user.id,
            full_name: data.name,
            email: data.email,
            phone: data.phone,
            business_name: data.businessName || "",
            business_type: data.trade,
            referred_by: referralCode || null,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error("Profil olusturulurken hata: " + (err.error || "Bilinmeyen hata"));
          return;
        }
      }

      if (!authData.session) {
        setAwaitingVerification(data.email);
        toast.success("Kayit tamamlandi. E-posta dogrulama baglantisini kontrol edin.");
        router.push("/giris?kayit=basarili");
        return;
      }

      toast.success("Hesabiniz basariyla olusturuldu!");
      router.push("/panel");
      router.refresh();
    } catch {
      toast.error("Bir hata olustu. Lutfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="items-center gap-3 pb-2 pt-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">TahsilatCI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ucretsiz hesap olusturun
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          {awaitingVerification && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {awaitingVerification} adresine dogrulama e-postasi gonderildi.
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                placeholder="Ahmet Yilmaz"
                className="h-10"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                className="h-10"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="05XX XXX XX XX"
                className="h-10"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Sifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 6 karakter"
                className="h-10"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="businessName">Isletme Adi (Opsiyonel)</Label>
              <Input
                id="businessName"
                placeholder="Yilmaz Tesisat"
                className="h-10"
                {...register("businessName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trade">Meslek</Label>
              <select
                id="trade"
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                {...register("trade")}
              >
                <option value="">Meslek seciniz</option>
                  {TRADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              {errors.trade && (
                <p className="text-xs text-red-500">{errors.trade.message}</p>
              )}
            </div>

            {referralCode && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                Referans kodu: <span className="font-medium">{referralCode}</span>
              </div>
            )}

            <Button
              type="submit"
              className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kayit yapiliyor...
                </>
              ) : (
                "Ucretsiz Kayit Ol"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabiniz var mi?{" "}
            <Link
              href="/giris"
              className="font-medium text-blue-600 hover:underline"
            >
              Giris yapin
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
