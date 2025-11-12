"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DayScheduleList({ schedule }: { schedule: Array<any> }) {
  if (schedule.length === 0) {
    return (
      <Card className="p-12 rounded-xl border flex items-center justify-center">
        <p className="text-muted-foreground">Không có lịch trong tháng này.</p>
      </Card>
    );
  }
  const groupedByDate = schedule.reduce(
    (acc: Record<string, any[]>, item: any) => {
      (acc[item.date] = acc[item.date] || []).push(item);
      return acc;
    },
    {}
  );
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
            {(items as any[]).map((item: any, index: number) => (
              <div
                key={index}
                className={
                  item.type === "booking"
                    ? "p-4 bg-primary/10 border-primary/40 rounded-xl border"
                    : "p-4 bg-muted rounded-xl border"
                }
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-base">
                    {item.start_time} - {item.end_time}
                  </div>
                  <Badge
                    variant={item.type === "booking" ? "default" : "secondary"}
                  >
                    {item.type === "booking" ? "Đặt từ khách" : "Ca trực"}
                  </Badge>
                </div>
                <div className="text-sm mt-2 space-y-1 text-muted-foreground">
                  {item.type === "booking" ? (
                    <>
                      <p>
                        <span className="font-medium text-foreground">
                          Khách hàng:
                        </span>{" "}
                        {item.customer_name}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Dịch vụ:
                        </span>{" "}
                        {item.service_name}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Tại:
                        </span>{" "}
                        {item.court_name}, {item.branch}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>{item.branch}</p>
                      <p>{item.note}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
