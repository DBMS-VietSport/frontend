import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface UpcomingBooking {
  id: number;
  branch: string;
  courtName: string;
  date: string;
  timeRange: string;
  status: string;
}

interface UpcomingBookingsTableProps {
  bookings: UpcomingBooking[];
}

export function UpcomingBookingsTable({
  bookings,
}: UpcomingBookingsTableProps) {
  return (
    <Card className="rounded-xl border bg-background/50">
      <CardHeader>
        <CardTitle className="text-lg">Lịch sắp tới</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">Bạn chưa có lịch sắp tới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ngày
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Cơ sở
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Sân
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Giờ
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm">{booking.date}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {booking.branch}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {booking.courtName}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {booking.timeRange}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
