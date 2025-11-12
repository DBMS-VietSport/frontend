"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";

const BRANCHES = [
  {
    id: "hcm",
    name: "VietSport TP.HCM",
    address: "Quận 10, TP.HCM",
    hotline: "0901234567",
    courts: [
      {
        type: "Sân Cầu Lông",
        basePrice: 150000,
        unit: "giờ",
        note: "Ngày thường 6h-17h",
      },
      {
        type: "Sân Bóng Đá Mini",
        basePrice: 300000,
        unit: "90 phút",
        note: "Tối + cuối tuần phụ thu",
      },
      { type: "Sân Futsal", basePrice: 280000, unit: "90 phút" },
    ],
  },
  {
    id: "hn",
    name: "VietSport Hà Nội",
    address: "Cầu Giấy, Hà Nội",
    hotline: "0249876543",
    courts: [
      { type: "Sân Cầu Lông", basePrice: 140000, unit: "giờ" },
      { type: "Sân Tennis", basePrice: 220000, unit: "2 giờ" },
      { type: "Sân Bóng Rổ", basePrice: 180000, unit: "giờ" },
    ],
  },
  {
    id: "dn",
    name: "VietSport Đà Nẵng",
    address: "Hải Châu, Đà Nẵng",
    hotline: "02363xxxxxx",
    courts: [
      { type: "Sân Cầu Lông", basePrice: 130000, unit: "giờ" },
      {
        type: "Sân Bóng Đá Mini",
        basePrice: 280000,
        unit: "90 phút",
      },
    ],
  },
  {
    id: "ct",
    name: "VietSport Cần Thơ",
    address: "Ninh Kiều, Cần Thơ",
    hotline: "0123456788",
    courts: [
      { type: "Sân Cầu Lông", basePrice: 135000, unit: "giờ" },
      { type: "Sân Futsal", basePrice: 260000, unit: "90 phút" },
    ],
  },
];

export function BranchPricing() {
  const [selectedBranchId, setSelectedBranchId] = useState("hcm");

  const selectedBranch = BRANCHES.find((b) => b.id === selectedBranchId);

  return (
    <div className="space-y-8">
      {/* Branch Selector */}
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          Chọn cơ sở để xem giá sân
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BRANCHES.map((branch) => (
            <Button
              key={branch.id}
              variant={selectedBranchId === branch.id ? "default" : "outline"}
              onClick={() => setSelectedBranchId(branch.id)}
              className="h-auto py-3 px-4 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm md:text-base">
                {branch.name.replace("VietSport ", "")}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Branch Info */}
      {selectedBranch && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{selectedBranch.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedBranch.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a
                  href={`tel:${selectedBranch.hotline}`}
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  {selectedBranch.hotline}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Cards */}
      {selectedBranch && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedBranch.courts.map((court, idx) => (
            <Card
              key={idx}
              className="rounded-xl border bg-background/60 backdrop-blur hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{court.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {court.basePrice.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-muted-foreground">/ {court.unit}</span>
                </div>
                {court.note && (
                  <Badge variant="secondary" className="text-xs">
                    {court.note}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
