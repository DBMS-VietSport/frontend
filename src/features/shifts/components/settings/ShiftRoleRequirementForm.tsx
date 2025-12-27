"use client";

import { useState } from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { listRoles } from "@/features/shifts";

export interface RoleReqDraft {
  role_id: number;
  role_name: string;
  required_count: number;
}

interface ShiftRoleRequirementFormProps {
  onCancel: () => void;
  onSave: (data: {
    start_time: string;
    end_time: string;
    requirements: RoleReqDraft[];
  }) => void;
  initial?: {
    start_time: string;
    end_time: string;
    requirements: RoleReqDraft[];
  };
}

export function ShiftRoleRequirementForm({
  onCancel,
  onSave,
  initial,
}: ShiftRoleRequirementFormProps) {
  const [start, setStart] = useState(initial?.start_time ?? "07:00");
  const [end, setEnd] = useState(initial?.end_time ?? "15:00");
  const [reqs, setReqs] = useState<RoleReqDraft[]>(initial?.requirements ?? []);
  const roles = listRoles();

  const addReq = () => {
    if (roles.length === 0) return;
    setReqs((prev) => [
      ...prev,
      { role_id: roles[0].id, role_name: roles[0].name, required_count: 1 },
    ]);
  };

  const updateReq = (idx: number, patch: Partial<RoleReqDraft>) => {
    setReqs((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeReq = (idx: number) =>
    setReqs((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const norm = (t: string) => (t.length === 5 ? `${t}:00` : t);
    onSave({
      start_time: norm(start),
      end_time: norm(end),
      requirements: reqs,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bắt đầu</Label>
          <Input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Kết thúc</Label>
          <Input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Yêu cầu vai trò</Label>
          <Button variant="outline" size="sm" onClick={addReq}>
            Thêm vai trò
          </Button>
        </div>

        {reqs.length === 0 && (
          <p className="text-sm text-gray-500 italic">Chưa có yêu cầu nào</p>
        )}

        {reqs.map((r, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <Label>Vai trò</Label>
              <Select
                value={String(r.role_id)}
                onValueChange={(v) => {
                  const role = roles.find((ro) => ro.id === Number(v));
                  if (role)
                    updateReq(idx, { role_id: role.id, role_name: role.name });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Số lượng</Label>
              <Input
                type="number"
                min={0}
                value={r.required_count}
                onChange={(e) =>
                  updateReq(idx, { required_count: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                type="button"
                onClick={() => removeReq(idx)}
              >
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={handleSave}>Lưu ca</Button>
      </div>
    </Card>
  );
}
