"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { leaveRequestRepo } from "@/features/employee/mock/leaveRequestRepo";
import { useAuth } from "@/features/auth/lib/useAuth";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface LeaveRequestDialogTriggerProps {
  onSuccess?: () => void;
}

export function LeaveRequestDialogTrigger({
  onSuccess,
}: LeaveRequestDialogTriggerProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    toast.success("Đã gửi yêu cầu nghỉ phép thành công");
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Xin nghỉ phép</Button>
      </DialogTrigger>
      <LeaveRequestForm onSuccess={handleSuccess} />
    </Dialog>
  );
}

function LeaveRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!start || !end) {
      setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }

    if (new Date(start) > new Date(end)) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    if (!reason.trim()) {
      setError("Vui lòng nhập lý do nghỉ phép");
      return;
    }

    if (!user) {
      setError("Vui lòng đăng nhập để gửi yêu cầu");
      return;
    }

    setLoading(true);

    try {
      leaveRequestRepo.create(user.username, {
        start_date: start,
        end_date: end,
        reason: reason.trim(),
      });
      onSuccess();
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi yêu cầu");
      logger.error("Leave request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Xin nghỉ phép</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Ngày bắt đầu *</Label>
            <Input
              id="start_date"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Ngày kết thúc *</Label>
            <Input
              id="end_date"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              min={start}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do nghỉ phép *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do nghỉ phép..."
              rows={4}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
