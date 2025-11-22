"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Info, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { RequireRole } from "@/components/auth/RequireRole";
import {
  listBranches,
  getBranchSettings,
  updateBranchSettings,
  type BranchSettings,
  type UpdateBranchSettingsPayload,
} from "@/lib/mock/branchSettingsRepo";

// --- Helpers ---

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const formatPercent = (value: number) => {
  // Stored as 0.1 (10%), display as 10
  return Math.round(value * 100);
};

const parsePercent = (displayValue: number) => {
  // Input 10, store as 0.1
  return displayValue / 100;
};

export default function BranchSettingsPage() {
  const { user } = useAuth();
  const isManagerOrAdmin =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === ("system_admin" as any); // 'system_admin' based on common conventions, checking authMock usually 'admin' covers it.

  // State
  const [branches, setBranches] = React.useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("");
  const [settings, setSettings] = React.useState<BranchSettings | null>(null);
  const [originalSettings, setOriginalSettings] =
    React.useState<BranchSettings | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Load Branches
  React.useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await listBranches();
        setBranches(data);

        // Default selection logic
        if (data.length > 0) {
          // If manager, try to select their branch if possible (mock doesn't link user to branch ID strictly, but by name in some mocks)
          // For now, just pick the first one or keep current
          if (!selectedBranchId) {
            setSelectedBranchId(data[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Failed to load branches", error);
        toast.error("Không thể tải danh sách chi nhánh");
      }
    };
    fetchBranches();
  }, []);

  // Load Settings when branch changes
  React.useEffect(() => {
    if (!selectedBranchId) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await getBranchSettings(parseInt(selectedBranchId));
        setSettings(data);
        setOriginalSettings(data);
        setErrors({});
      } catch (error) {
        console.error("Failed to load settings", error);
        toast.error("Không thể tải cấu hình chi nhánh");
        setSettings(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [selectedBranchId]);

  // Handlers
  const handleFieldChange = (field: keyof BranchSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });

    // Clear error
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validate = (): boolean => {
    if (!settings) return false;
    const newErrors: Record<string, string> = {};

    // Validate General
    if (!settings.address.trim())
      newErrors.address = "Địa chỉ không được để trống";
    if (!settings.hotline.trim())
      newErrors.hotline = "Hotline không được để trống";
    // Phone regex validation could go here

    // Validate Numbers
    if (settings.late_time_limit < 0)
      newErrors.late_time_limit = "Không được âm";
    if (settings.max_courts_per_day_per_user < 1)
      newErrors.max_courts_per_day_per_user = "Phải ít nhất là 1";

    // Validate Money
    if (settings.night_booking_additional_charge < 0)
      newErrors.night_booking_additional_charge = "Không được âm";
    if (settings.holiday_booking_additional_charge < 0)
      newErrors.holiday_booking_additional_charge = "Không được âm";
    if (settings.weekend_booking_additional_charge < 0)
      newErrors.weekend_booking_additional_charge = "Không được âm";

    // Validate Percentages (stored as decimal, but checked logically)
    // The UI inputs handle 0-100 constraints, but we check here too
    if (
      settings.cancel_fee_before_24h_percent < 0 ||
      settings.cancel_fee_before_24h_percent > 1
    )
      newErrors.cancel_fee_before_24h_percent = "Tỷ lệ không hợp lệ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (groupName?: string) => {
    if (!settings || !selectedBranchId) return;

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường dữ liệu");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, we might only send changed fields.
      // For mock, we send the whole object or just the relevant subset.
      const payload: UpdateBranchSettingsPayload = {
        ...settings,
      };

      await updateBranchSettings(parseInt(selectedBranchId), payload);
      setOriginalSettings(settings); // Update snapshot
      toast.success(groupName ? `Đã lưu ${groupName}` : "Đã lưu cấu hình");
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Lưu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // Only managers/admins can edit
  const canEdit = isManagerOrAdmin;

  if (!branches.length && !isLoading) {
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Cấu hình tham số chi nhánh
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các tham số về giá, phụ phí, chính sách hủy và quy tắc đặt
            sân cho từng chi nhánh VietSport.
          </p>
        </div>

        {/* Branch Selector */}
        <div className="w-full md:w-72 space-y-2">
          <Label htmlFor="branch-select" className="sr-only">
            Chọn chi nhánh
          </Label>
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {settings && (
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Mở cửa: {settings.open_time} - {settings.close_time}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {!canEdit && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3 text-amber-800">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium">Chế độ xem</h4>
            <p className="text-sm mt-1">
              Bạn chỉ có quyền xem cấu hình. Mọi thay đổi cần được thực hiện bởi
              Quản lý chi nhánh hoặc Quản trị viên.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : settings ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Group 1: Thông tin chi nhánh */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi nhánh</CardTitle>
              <CardDescription>
                Thông tin cơ bản và thời gian hoạt động.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên chi nhánh</Label>
                <Input
                  value={settings.name}
                  disabled
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  disabled={!canEdit}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <span className="text-xs text-destructive">
                    {errors.address}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Hotline</Label>
                <Input
                  value={settings.hotline}
                  onChange={(e) => handleFieldChange("hotline", e.target.value)}
                  disabled={!canEdit}
                  className={errors.hotline ? "border-destructive" : ""}
                />
                {errors.hotline && (
                  <span className="text-xs text-destructive">
                    {errors.hotline}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giờ mở cửa</Label>
                  <Input
                    type="time"
                    value={settings.open_time}
                    onChange={(e) =>
                      handleFieldChange("open_time", e.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giờ đóng cửa</Label>
                  <Input
                    type="time"
                    value={settings.close_time}
                    onChange={(e) =>
                      handleFieldChange("close_time", e.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
            {canEdit && (
              <CardFooter className="justify-end border-t pt-4 bg-slate-50/50 rounded-b-xl">
                <Button
                  onClick={() => handleSave("Thông tin chi nhánh")}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Group 2: Quy tắc đặt sân */}
          <Card>
            <CardHeader>
              <CardTitle>Quy tắc đặt sân & giới hạn</CardTitle>
              <CardDescription>
                Kiểm soát việc giữ sân và giới hạn đặt của khách.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thời gian giữ sân tối đa (phút)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={settings.late_time_limit}
                    onChange={(e) =>
                      handleFieldChange(
                        "late_time_limit",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!canEdit}
                    className={
                      errors.late_time_limit ? "border-destructive" : ""
                    }
                  />
                  <span className="text-sm font-medium text-muted-foreground w-12">
                    phút
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nếu khách chưa check-in sau khoảng thời gian này, hệ thống có
                  thể tự động hủy hoặc đánh dấu no-show.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Số sân tối đa mỗi khách / ngày</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={settings.max_courts_per_day_per_user}
                    onChange={(e) =>
                      handleFieldChange(
                        "max_courts_per_day_per_user",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!canEdit}
                    className={
                      errors.max_courts_per_day_per_user
                        ? "border-destructive"
                        : ""
                    }
                  />
                  <span className="text-sm font-medium text-muted-foreground w-12">
                    sân
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Giới hạn số lượng sân một khách hàng có thể đặt trong cùng một
                  ngày để tránh spam.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-md text-blue-700 text-xs space-y-1 mt-4">
                <div className="flex items-center gap-2 font-medium">
                  <Info className="h-3 w-3" />
                  <span>Thông tin thêm</span>
                </div>
                <p>
                  Thời lượng thuê cơ bản (60p, 90p...) được định nghĩa trong
                  loại sân (Court Type).
                </p>
                <p>
                  Thời gian giữ chỗ tạm thời dựa trên cấu hình hệ thống chung.
                </p>
              </div>
            </CardContent>
            {canEdit && (
              <CardFooter className="justify-end border-t pt-4 bg-slate-50/50 rounded-b-xl">
                <Button
                  onClick={() => handleSave("Quy tắc đặt sân")}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Group 3: Phụ phí */}
          <Card>
            <CardHeader>
              <CardTitle>Phụ phí & Giá đặc biệt</CardTitle>
              <CardDescription>
                Các khoản thu thêm dựa trên thời điểm đặt sân.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                {
                  id: "night_booking_additional_charge",
                  label: "Phụ thu ca đêm",
                  hint: "Áp dụng cho các khung giờ sau 18:00 hoặc tùy chỉnh.",
                },
                {
                  id: "holiday_booking_additional_charge",
                  label: "Phụ thu ngày lễ",
                  hint: "Áp dụng vào các ngày lễ tết theo lịch hệ thống.",
                },
                {
                  id: "weekend_booking_additional_charge",
                  label: "Phụ thu cuối tuần",
                  hint: "Áp dụng vào Thứ 7 và Chủ Nhật.",
                },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <span className="text-xs font-medium text-slate-500">
                      {formatCurrency((settings as any)[field.id])}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id={field.id}
                      type="number"
                      min="0"
                      step="1000"
                      value={(settings as any)[field.id]}
                      onChange={(e) =>
                        handleFieldChange(
                          field.id as keyof BranchSettings,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={!canEdit}
                      className={`pr-12 ${
                        errors[field.id] ? "border-destructive" : ""
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">VND</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                </div>
              ))}
            </CardContent>
            {canEdit && (
              <CardFooter className="justify-end border-t pt-4 bg-slate-50/50 rounded-b-xl">
                <Button
                  onClick={() => handleSave("Phụ phí")}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Group 4: Chính sách hủy & Ưu đãi */}
          <Card>
            <CardHeader>
              <CardTitle>Chính sách hủy & Ưu đãi</CardTitle>
              <CardDescription>
                Cấu hình phí phạt hủy sân và tỷ lệ tích điểm thành viên.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Penalty Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Phí hủy sân
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hủy trước 24h</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formatPercent(
                          settings.cancel_fee_before_24h_percent
                        )}
                        onChange={(e) =>
                          handleFieldChange(
                            "cancel_fee_before_24h_percent",
                            parsePercent(parseFloat(e.target.value) || 0)
                          )
                        }
                        disabled={!canEdit}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Phạt trên tổng tiền sân.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Hủy trong 24h</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formatPercent(
                          settings.cancel_fee_within_24h_percent
                        )}
                        onChange={(e) =>
                          handleFieldChange(
                            "cancel_fee_within_24h_percent",
                            parsePercent(parseFloat(e.target.value) || 0)
                          )
                        }
                        disabled={!canEdit}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mức phạt cao hơn khi hủy gấp.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Phí No-show (Không đến)</Label>
                  <div className="relative max-w-[50%]">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formatPercent(settings.no_show_fee_percent)}
                      onChange={(e) =>
                        handleFieldChange(
                          "no_show_fee_percent",
                          parsePercent(parseFloat(e.target.value) || 0)
                        )
                      }
                      disabled={!canEdit}
                      className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Thường là 100% nếu khách không đến mà không hủy.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Loyalty Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Tích điểm thành viên
                </h3>
                <div className="space-y-2">
                  <Label>Tỷ lệ tích điểm (Loyalty Rate)</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formatPercent(settings.loyalty_point_rate)}
                        onChange={(e) =>
                          handleFieldChange(
                            "loyalty_point_rate",
                            parsePercent(parseFloat(e.target.value) || 0)
                          )
                        }
                        disabled={!canEdit}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">
                      Ví dụ: 5% nghĩa là hóa đơn 100.000 VND sẽ tích được 5.000
                      điểm (hoặc quy đổi tương đương).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            {canEdit && (
              <CardFooter className="justify-end border-t pt-4 bg-slate-50/50 rounded-b-xl">
                <Button
                  onClick={() => handleSave("Chính sách & Ưu đãi")}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          Vui lòng chọn một chi nhánh để xem cấu hình.
        </div>
      )}
    </div>
  );
}
