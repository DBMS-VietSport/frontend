import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Award, ShoppingBag } from "lucide-react";
import { formatVND } from "@/lib/booking/pricing";
import type { CustomerBookingStat } from "@/lib/mock/customerDashboardRepo";
import { MembershipBadge } from "./MembershipBadge";

interface CustomerStatsCardsProps {
  stats: CustomerBookingStat;
}

export function CustomerStatsCards({ stats }: CustomerStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Số lượt đặt sân
              </p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng giờ đã chơi
              </p>
              <p className="text-2xl font-bold">{stats.totalPlayHours} giờ</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Hạng thành viên
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.membershipLevel}</p>
                <MembershipBadge level={stats.membershipLevel} />
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Chi tiêu dịch vụ
              </p>
              <p className="text-2xl font-bold">
                {formatVND(stats.totalServiceSpending)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
