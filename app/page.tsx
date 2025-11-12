"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  MapPin,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BranchPricing } from "@/components/public/BranchPricing";

/**
 * Root page - handles routing based on auth status
 * - If logged in as employee → redirect to /my-schedule
 * - If logged in as customer → redirect to /dashboard
 * - If not logged in → show public landing page
 */
export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      setShouldRedirect(true);
      // If user is employee (not customer), redirect to my-schedule
      if (user.role !== "customer") {
        router.replace("/my-schedule");
      } else {
        // If customer, redirect to dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  // If logged in, show loading while redirecting
  if (loading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show public landing page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                V
              </span>
            </div>
            <span className="font-bold text-xl">VietSport</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-blue-950 via-blue-900 to-emerald-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMiAxLTQgMy00czMgMiAzIDRzLTEgNC0zIDRzLTMtMi0zLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              >
                Hệ thống đặt sân thông minh
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Đặt sân thể thao tại nhiều cơ sở trên toàn quốc
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed">
                Chọn cơ sở, xem giá, đặt sân và thêm dịch vụ kèm theo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8"
                  >
                    Đăng nhập để đặt sân
                  </Button>
                </Link>

                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-blue-950 hover:bg-blue-50 border-2 border-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all"
                  >
                    Đăng ký tài khoản
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-blue-200 pt-4">
                <MapPin className="w-4 h-4" />
                <span>Hoạt động tại Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ</span>
              </div>
            </div>

            {/* Right: Preview Card */}
            <div className="hidden md:block">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Lịch đặt sân hôm nay
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      time: "08:00 - 09:00",
                      court: "Sân Cầu Lông 1",
                      status: "Đã đặt",
                    },
                    {
                      time: "10:00 - 11:30",
                      court: "Sân Bóng Đá Mini",
                      status: "Còn trống",
                    },
                    {
                      time: "14:00 - 16:00",
                      court: "Sân Tennis 2",
                      status: "Đã đặt",
                    },
                  ].map((booking, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">
                          {booking.time}
                        </p>
                        <p className="text-blue-200 text-xs">{booking.court}</p>
                      </div>
                      <Badge
                        variant={
                          booking.status === "Còn trống"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Branch Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <BranchPricing />
        </div>
      </section>

      {/* Court System Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Hệ thống sân đa dạng
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Đáp ứng mọi nhu cầu thể thao của bạn với các loại sân chuyên
              nghiệp
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Sân Cầu Lông",
                desc: "Cho thuê theo giờ",
                note: "Có phụ thu buổi tối, cuối tuần",
                icon: Zap,
              },
              {
                title: "Sân Tennis",
                desc: "Theo ca 2 giờ",
                note: "Có phụ thu buổi tối, cuối tuần",
                icon: Users,
              },
              {
                title: "Sân Bóng Đá Mini",
                desc: "90 phút/trận",
                note: "Có phụ thu buổi tối, cuối tuần",
                icon: MapPin,
              },
              {
                title: "Sân Bóng Rổ / Futsal",
                desc: "Linh hoạt theo giờ",
                note: "Có phụ thu buổi tối, cuối tuần",
                icon: CheckCircle2,
              },
            ].map((court, idx) => {
              const Icon = court.icon;
              return (
                <Card
                  key={idx}
                  className="rounded-xl border bg-background/60 backdrop-blur hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{court.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {court.desc}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      {court.note}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Quy trình đặt sân online
            </h2>
            <p className="text-muted-foreground text-lg">
              Chỉ với 4 bước đơn giản
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Đăng ký / Đăng nhập",
                desc: "Tạo tài khoản hoặc đăng nhập vào hệ thống",
                icon: Users,
              },
              {
                step: "2",
                title: "Chọn cơ sở & loại sân",
                desc: "Chọn chi nhánh và loại sân phù hợp",
                icon: MapPin,
              },
              {
                step: "3",
                title: "Chọn khung giờ & dịch vụ",
                desc: "Chọn giờ chơi và thêm dịch vụ kèm theo",
                icon: Clock,
              },
              {
                step: "4",
                title: "Thanh toán",
                desc: "Thanh toán online hoặc tại quầy (giữ chỗ 30 phút)",
                icon: CreditCard,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                        {item.step}
                      </div>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Bạn là khách hàng mới của VietSport?
          </h2>
          <p className="text-lg text-muted-foreground">
            Đăng ký ngay để trải nghiệm dịch vụ đặt sân thể thao chuyên nghiệp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="px-8">
                Đăng ký tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Separator />

      {/* Footer */}
      <footer className="py-8 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 VietSport. Hệ thống đặt sân thể thao.</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-primary">
                Đăng nhập
              </Link>
              <Link href="/register" className="hover:text-primary">
                Đăng ký
              </Link>
              <span>Hotline: 1900-xxxx</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
