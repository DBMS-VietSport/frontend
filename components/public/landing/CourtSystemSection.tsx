import { Zap, Users, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Court types data
const courtTypes = [
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
];

/**
 * CourtSystemSection - Shows available court types
 */
export function CourtSystemSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Hệ thống sân đa dạng
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Đáp ứng mọi nhu cầu thể thao của bạn với các loại sân chuyên nghiệp
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courtTypes.map((court, idx) => {
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
  );
}
