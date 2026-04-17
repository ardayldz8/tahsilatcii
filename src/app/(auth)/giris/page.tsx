"use client";

import { useMemo, useState } from "react";
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

const loginSchema = z.object({
  email: z.string().email("Gecerli bir e-posta adresi girin"),
  password: z.string().min(1, "Sifre gereklidir"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function GirisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const verificationNotice = useMemo(() => {
    if (searchParams.get("kayit") === "basarili") {
      return "Kayit tamamlandi. E-posta adresinizi dogrulayip giris yapabilirsiniz.";
    }

    if (searchParams.get("reset") === "gonderildi") {
      return "Sifre sifirlama baglantisi gonderildi. E-posta kutunuzu kontrol edin.";
    }

    return null;
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Basariyla giris yapildi!");
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
            Hesabiniza giris yapin
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          {verificationNotice && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {verificationNotice}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="password">Sifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-10"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giris yapiliyor...
                </>
              ) : (
                "Giris Yap"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/sifre-sifirla"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Sifremi unuttum
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hesabiniz yok mu?{" "}
            <Link
              href="/kayit"
              className="font-medium text-blue-600 hover:underline"
            >
              Ucretsiz kayit olun
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
