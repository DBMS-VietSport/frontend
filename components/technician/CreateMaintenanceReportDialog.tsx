"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { maintenanceRepo } from "@/lib/mock/maintenanceRepo";
import { useAuth } from "@/lib/auth/useAuth";
import { toast } from "sonner";

interface Props {
  onCreated?: () => void;
}

export function CreateMaintenanceReportDialog({ onCreated }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const branches = maintenanceRepo.listBranches();
  const [branch, setBranch] = React.useState<string | undefined>(branches[0]);
  const [courtId, setCourtId] = React.useState<number | undefined>(undefined);
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [work, setWork] = React.useState("");
  const [cost, setCost] = React.useState<number>(0);
  const [materials, setMaterials] = React.useState("");
  const [postStatus, setPostStatus] = React.useState<
    "Available" | "Maintenance" | "Limited"
  >("Available");
  const [loading, setLoading] = React.useState(false);

  const courts = maintenanceRepo.listCourts(branch);

  React.useEffect(() => {
    if (courts.length > 0) {
      setCourtId(courts[0].id);
    } else {
      setCourtId(undefined);
    }
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    if (!courtId) {
      toast.error("Vui lòng chọn sân");
      return;
    }
    const court = courts.find((c) => c.id === courtId);
    if (!court) {
      toast.error("Sân không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      maintenanceRepo.createReport({
        courtId,
        courtName: court.name,
        branch: court.branch,
        work_description: work.trim(),
        cost: Number(cost) || 0,
        material_used: materials.trim(),
        post_maintenance_status: postStatus,
        repairer_username: user.username,
      });
      toast.success("Đã tạo báo cáo bảo trì");
      setOpen(false);
      onCreated?.();
      setWork("");
      setMaterials("");
      setCost(0);
      setPostStatus("Available");
    } catch (err) {
      console.error(err);
      toast.error("Tạo báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tạo báo cáo bảo trì</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Tạo báo cáo bảo trì</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cơ sở</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sân</Label>
              <Select
                value={courtId ? courtId.toString() : undefined}
                onValueChange={(v) => setCourtId(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ngày bảo trì</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Chi phí (VNĐ)</Label>
              <Input
                type="number"
                min="0"
                value={Number.isNaN(cost) ? 0 : cost}
                onChange={(e) => setCost(parseInt(e.target.value || "0"))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nội dung bảo trì</Label>
            <Textarea
              rows={4}
              value={work}
              onChange={(e) => setWork(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Vật tư sử dụng</Label>
            <Textarea
              rows={3}
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái sau bảo trì</Label>
            <Select
              value={postStatus}
              onValueChange={(v) => setPostStatus(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
