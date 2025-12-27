import { Users, MapPin, Clock, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

// Steps data
const steps = [
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
];

/**
 * HowItWorksSection - Shows the booking process steps
 */
export function HowItWorksSection() {
  return (
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
          {steps.map((item, idx) => {
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
  );
}
