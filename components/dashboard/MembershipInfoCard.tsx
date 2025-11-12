import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { getMembershipDiscount } from "./utils";

interface MembershipInfoCardProps {
  membershipLevel: string;
}

export function MembershipInfoCard({
  membershipLevel,
}: MembershipInfoCardProps) {
  if (membershipLevel === "Thường") {
    return null;
  }

  return (
    <Card className="rounded-xl border bg-background/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              Ưu đãi hạng {membershipLevel}
            </h3>
            <p className="text-sm text-muted-foreground">
              Bạn được giảm {getMembershipDiscount(membershipLevel)}% khi đặt
              sân tại các cơ sở thuộc hệ thống VietSport.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
