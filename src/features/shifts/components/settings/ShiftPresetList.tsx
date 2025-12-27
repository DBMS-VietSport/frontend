"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Card } from "@/ui/card";
import { listPresets } from "@/features/shifts/mock/settingsRepo";

interface ShiftPresetListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (presetId: string) => void;
}

export function ShiftPresetList({
  open,
  onOpenChange,
  onApply,
}: ShiftPresetListProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const presets = listPresets();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn preset</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {presets.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có preset nào</p>
            )}
            {presets.map((p) => (
              <Card
                key={p.id}
                className={`p-3 ${
                  selected === p.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.description && (
                      <div className="text-sm text-gray-500">
                        {p.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Tạo lúc: {new Date(p.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelected(p.id)}>
                      Chọn
                    </Button>
                    <Button onClick={() => onApply(p.id)}>Áp dụng</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
