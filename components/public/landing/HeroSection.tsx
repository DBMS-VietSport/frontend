import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock booking data for preview card
const previewBookings = [
  { time: "08:00 - 09:00", court: "Sân Cầu Lông 1", status: "Đã đặt" },
  { time: "10:00 - 11:30", court: "Sân Bóng Đá Mini", status: "Còn trống" },
  { time: "14:00 - 16:00", court: "Sân Tennis 2", status: "Đã đặt" },
];

/**
 * HeroSection - Main hero banner with CTA and preview card
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center bg-linear-to-br from-blue-950 via-blue-900 to-emerald-950 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMiAxLTQgMy00czMgMiAzIDRzLTEgNC0zIDRzLTMtMi0zLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

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
                {previewBookings.map((booking, idx) => (
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
                      variant={booking.status === "Còn trống" ? "default" : "secondary"}
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
  );
}
