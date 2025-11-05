import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  TrainerSlot,
  TrainerShift,
  TrainerBooking,
} from "@/lib/mock/trainerScheduleRepo";

interface Props {
  schedule: TrainerSlot[];
}

const ShiftItem = ({ item }: { item: TrainerShift }) => (
  <div className="p-4 bg-muted rounded-xl border">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-base">
        {item.start_time} - {item.end_time}
      </div>
      <Badge variant="secondary">Ca trực</Badge>
    </div>
    <div className="text-sm text-muted-foreground mt-2">
      <p>{item.branch}</p>
      <p>{item.note}</p>
    </div>
  </div>
);

const BookingItem = ({ item }: { item: TrainerBooking }) => (
  <div className="p-4 bg-primary/10 border-primary/40 rounded-xl border">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-base">
        {item.start_time} - {item.end_time}
      </div>
      <Badge>Đặt từ khách</Badge>
    </div>
    <div className="text-sm mt-2 space-y-1">
      <p>
        <span className="font-medium">Khách hàng:</span> {item.customer_name}
      </p>
      <p>
        <span className="font-medium">Dịch vụ:</span> {item.service_name}
      </p>
      <p>
        <span className="font-medium">Tại:</span> {item.court_name},{" "}
        {item.branch}
      </p>
    </div>
  </div>
);

export function DayScheduleList({ schedule }: Props) {
  if (schedule.length === 0) {
    return (
      <Card className="p-12 rounded-xl border flex items-center justify-center">
        <p className="text-muted-foreground">Không có lịch trong tháng này.</p>
      </Card>
    );
  }

  const groupedByDate = schedule.reduce((acc, item) => {
    (acc[item.date] = acc[item.date] || []).push(item);
    return acc;
  }, {} as Record<string, TrainerSlot[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date}>
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">
            {new Date(date).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index}>
                {item.type === "shift" ? (
                  <ShiftItem item={item} />
                ) : (
                  <BookingItem item={item} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
