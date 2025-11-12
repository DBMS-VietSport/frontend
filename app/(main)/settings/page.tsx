"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireRole } from "@/components/auth/RequireRole";
import {
  listBranches,
  getBranchSettings,
  updateBranchSettings,
  type BranchSettings,
  type UpdateBranchSettingsPayload,
} from "@/lib/mock/branchSettingsRepo";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );

function BranchSettingsPage() {
  const { user } = useAuth();
  const [branches, setBranches] = React.useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedBranchId, setSelectedBranchId] = React.useState<number | null>(
    null
  );
  const [originalSettings, setOriginalSettings] =
    React.useState<BranchSettings | null>(null);
  const [settings, setSettings] = React.useState<BranchSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof BranchSettings, string>>
  >({});

  const getInitialBranchId = React.useCallback(
    (list: Array<{ id: number; name: string }>) => {
      if (user?.role === "manager") {
        return list[0]?.id ?? null;
      }
      if (user?.branch) {
        const normalized = user.branch.toLowerCase();
        const matched = list.find((b) =>
          b.name.toLowerCase().includes(normalized)
        );
        if (matched) {
          return matched.id;
        }
      }
      return null;
    },
    [user]
  );

  React.useEffect(() => {
    loadBranches();
  }, [getInitialBranchId]);

  const loadBranches = async () => {
    try {
      const data = await listBranches();
      setBranches(data);
      const initialId = getInitialBranchId(data);
      if (initialId) {
        setSelectedBranchId(initialId);
        loadSettings(initialId);
      } else {
        setSelectedBranchId(null);
        setSettings(null);
        setOriginalSettings(null);
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
      toast.error("Không thể tải danh sách chi nhánh");
    }
  };

  const loadSettings = async (branchId: number) => {
    setIsLoading(true);
    try {
      const data = await getBranchSettings(branchId);
      setSettings(data);
      setOriginalSettings(data);
      setHasUnsavedChanges(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Không thể tải cấu hình chi nhánh");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (
    field: keyof BranchSettings,
    value: string | number
  ) => {
    if (!settings) return;

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    const newSettings = { ...settings, [field]: numValue };
    setSettings(newSettings);
    setHasUnsavedChanges(true);

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }

    // Validate on change
    validateField(field, numValue);
  };

  const validateField = (field: keyof BranchSettings, value: number) => {
    const newErrors = { ...errors };

    // Integer fields
    if (
      field === "late_time_limit" ||
      field === "max_courts_per_day_per_user"
    ) {
      if (!Number.isInteger(value) || value < 0) {
        if (field === "late_time_limit") {
          newErrors[field] = "Phải là số nguyên ≥ 0";
        } else {
          newErrors[field] = "Phải là số nguyên ≥ 1";
        }
      } else if (field === "max_courts_per_day_per_user" && value < 1) {
        newErrors[field] = "Phải ≥ 1";
      } else {
        delete newErrors[field];
      }
    }

    // Percentage fields
    if (
      field === "loyalty_point_rate" ||
      field === "cancel_fee_before_24h_percent" ||
      field === "cancel_fee_within_24h_percent" ||
      field === "no_show_fee_percent"
    ) {
      if (value < 0 || value > 100) {
        newErrors[field] = "Phải từ 0 đến 100";
      } else {
        delete newErrors[field];
      }
    }

    // Money fields (non-negative)
    if (
      field === "shift_pay" ||
      field === "shift_absence_penalty" ||
      field === "night_booking_additional_charge" ||
      field === "holiday_booking_additional_charge" ||
      field === "weekend_booking_additional_charge"
    ) {
      if (value < 0) {
        newErrors[field] = "Phải ≥ 0";
      } else {
        delete newErrors[field];
      }
    }

    setErrors(newErrors);
  };

  const validateAll = (): boolean => {
    if (!settings) return false;

    const newErrors: Partial<Record<keyof BranchSettings, string>> = {};

    // Validate all fields
    Object.keys(settings).forEach((key) => {
      const field = key as keyof BranchSettings;
      if (field === "id" || field === "name") return; // Skip non-numeric fields
      const value = settings[field] as number;

      // Integer fields
      if (
        field === "late_time_limit" ||
        field === "max_courts_per_day_per_user"
      ) {
        if (!Number.isInteger(value) || value < 0) {
          if (field === "late_time_limit") {
            newErrors[field] = "Phải là số nguyên ≥ 0";
          } else {
            newErrors[field] = "Phải là số nguyên ≥ 1";
          }
        } else if (field === "max_courts_per_day_per_user" && value < 1) {
          newErrors[field] = "Phải ≥ 1";
        }
      }

      // Percentage fields
      if (
        field === "loyalty_point_rate" ||
        field === "cancel_fee_before_24h_percent" ||
        field === "cancel_fee_within_24h_percent" ||
        field === "no_show_fee_percent"
      ) {
        if (value < 0 || value > 100) {
          newErrors[field] = "Phải từ 0 đến 100";
        }
      }

      // Money fields (non-negative)
      if (
        field === "shift_pay" ||
        field === "shift_absence_penalty" ||
        field === "night_booking_additional_charge" ||
        field === "holiday_booking_additional_charge" ||
        field === "weekend_booking_additional_charge"
      ) {
        if (value < 0) {
          newErrors[field] = "Phải ≥ 0";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!settings || !selectedBranchId) return;

    // Validate all fields
    if (!validateAll()) {
      toast.error("Vui lòng sửa các lỗi trước khi lưu");
      return;
    }

    setIsSaving(true);
    try {
      const payload: UpdateBranchSettingsPayload = {
        late_time_limit: settings.late_time_limit,
        max_courts_per_day_per_user: settings.max_courts_per_day_per_user,
        shift_pay: settings.shift_pay,
        shift_absence_penalty: settings.shift_absence_penalty,
        loyalty_point_rate: settings.loyalty_point_rate,
        cancel_fee_before_24h_percent: settings.cancel_fee_before_24h_percent,
        cancel_fee_within_24h_percent: settings.cancel_fee_within_24h_percent,
        no_show_fee_percent: settings.no_show_fee_percent,
        night_booking_additional_charge:
          settings.night_booking_additional_charge,
        holiday_booking_additional_charge:
          settings.holiday_booking_additional_charge,
        weekend_booking_additional_charge:
          settings.weekend_booking_additional_charge,
      };

      const updated = await updateBranchSettings(selectedBranchId, payload);
      setSettings(updated);
      setOriginalSettings(updated);
      setHasUnsavedChanges(false);
      toast.success(`Đã lưu cấu hình cho chi nhánh ${updated.name}.`);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Không thể lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasUnsavedChanges(false);
      setErrors({});
      toast.info("Đã khôi phục giá trị ban đầu");
    }
  };

  const currentBranch = branches.find((b) => b.id === selectedBranchId);

  if (isLoading && !settings) {
    return (
      <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cấu hình tham số chi nhánh
            </h1>
            <p className="text-muted-foreground mt-1">
              Thiết lập các quy tắc đặt sân, phạt và phụ thu cho từng cơ sở.
            </p>
          </div>
        </div>
      </div>
      <Separator />

      {currentBranch && (
        <Card className="p-4 rounded-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Đang cấu hình cho chi nhánh
            </span>
            <span className="text-lg font-semibold">{currentBranch.name}</span>
          </div>
        </Card>
      )}

      {settings && (
        <>
          {/* Group 1: Quy tắc đặt sân */}
          <Card className="p-6 rounded-2xl">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Quy tắc đặt sân</h2>
                <p className="text-sm text-muted-foreground">
                  Áp dụng cho cả đặt online và tại quầy.
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late_time_limit">
                    Thời gian giữ sân tối đa (phút)
                  </Label>
                  <Input
                    id="late_time_limit"
                    type="number"
                    min="0"
                    value={settings.late_time_limit}
                    onChange={(e) =>
                      handleFieldChange(
                        "late_time_limit",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    aria-invalid={!!errors.late_time_limit}
                  />
                  {errors.late_time_limit && (
                    <p className="text-sm text-destructive">
                      {errors.late_time_limit}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Gợi ý: 15 phút
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_courts_per_day_per_user">
                    Số sân tối đa mỗi khách được đặt trong ngày
                  </Label>
                  <Input
                    id="max_courts_per_day_per_user"
                    type="number"
                    min="1"
                    value={settings.max_courts_per_day_per_user}
                    onChange={(e) =>
                      handleFieldChange(
                        "max_courts_per_day_per_user",
                        parseInt(e.target.value, 10) || 1
                      )
                    }
                    aria-invalid={!!errors.max_courts_per_day_per_user}
                  />
                  {errors.max_courts_per_day_per_user && (
                    <p className="text-sm text-destructive">
                      {errors.max_courts_per_day_per_user}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Group 2: Chính sách ca làm việc */}
          <Card className="p-6 rounded-2xl">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Chính sách ca làm việc
                </h2>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shift_pay">Tiền công một ca (VND)</Label>
                  <Input
                    id="shift_pay"
                    type="number"
                    min="0"
                    value={settings.shift_pay}
                    onChange={(e) =>
                      handleFieldChange(
                        "shift_pay",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.shift_pay}
                  />
                  {errors.shift_pay && (
                    <p className="text-sm text-destructive">
                      {errors.shift_pay}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatVND(settings.shift_pay)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift_absence_penalty">
                    Tiền phạt vắng ca (VND)
                  </Label>
                  <Input
                    id="shift_absence_penalty"
                    type="number"
                    min="0"
                    value={settings.shift_absence_penalty}
                    onChange={(e) =>
                      handleFieldChange(
                        "shift_absence_penalty",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.shift_absence_penalty}
                  />
                  {errors.shift_absence_penalty && (
                    <p className="text-sm text-destructive">
                      {errors.shift_absence_penalty}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatVND(settings.shift_absence_penalty)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Group 3: Tích điểm khách hàng */}
          <Card className="p-6 rounded-2xl">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Tích điểm khách hàng
                </h2>
                <p className="text-sm text-muted-foreground">
                  Hệ thống sẽ nhân tỷ lệ này với giá trị hóa đơn để cộng điểm.
                </p>
              </div>
              <Separator />
              <div className="space-y-2 max-w-md">
                <Label htmlFor="loyalty_point_rate">Tỷ lệ tích điểm (%)</Label>
                <Input
                  id="loyalty_point_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.loyalty_point_rate}
                  onChange={(e) =>
                    handleFieldChange(
                      "loyalty_point_rate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  aria-invalid={!!errors.loyalty_point_rate}
                />
                {errors.loyalty_point_rate && (
                  <p className="text-sm text-destructive">
                    {errors.loyalty_point_rate}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Group 4: Phí hủy / no-show */}
          <Card className="p-6 rounded-2xl">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Phí hủy / no-show
                </h2>
                <p className="text-sm text-muted-foreground">
                  Các giá trị này sẽ dùng để sinh hóa đơn hoặc phiếu hoàn tiền.
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cancel_fee_before_24h_percent">
                    Phí hủy trước 24h (%)
                  </Label>
                  <Input
                    id="cancel_fee_before_24h_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.cancel_fee_before_24h_percent}
                    onChange={(e) =>
                      handleFieldChange(
                        "cancel_fee_before_24h_percent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.cancel_fee_before_24h_percent}
                  />
                  {errors.cancel_fee_before_24h_percent && (
                    <p className="text-sm text-destructive">
                      {errors.cancel_fee_before_24h_percent}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancel_fee_within_24h_percent">
                    Phí hủy trong vòng 24h (%)
                  </Label>
                  <Input
                    id="cancel_fee_within_24h_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.cancel_fee_within_24h_percent}
                    onChange={(e) =>
                      handleFieldChange(
                        "cancel_fee_within_24h_percent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.cancel_fee_within_24h_percent}
                  />
                  {errors.cancel_fee_within_24h_percent && (
                    <p className="text-sm text-destructive">
                      {errors.cancel_fee_within_24h_percent}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_show_fee_percent">
                    Phí không đến (no-show) (%)
                  </Label>
                  <Input
                    id="no_show_fee_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.no_show_fee_percent}
                    onChange={(e) =>
                      handleFieldChange(
                        "no_show_fee_percent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.no_show_fee_percent}
                  />
                  {errors.no_show_fee_percent && (
                    <p className="text-sm text-destructive">
                      {errors.no_show_fee_percent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Group 5: Phụ thu theo thời điểm */}
          <Card className="p-6 rounded-2xl">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Phụ thu theo thời điểm
                </h2>
                <p className="text-sm text-muted-foreground">
                  Áp dụng cộng thêm vào giá gốc sân.
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="night_booking_additional_charge">
                    Phụ thu ca đêm (VND)
                  </Label>
                  <Input
                    id="night_booking_additional_charge"
                    type="number"
                    min="0"
                    value={settings.night_booking_additional_charge}
                    onChange={(e) =>
                      handleFieldChange(
                        "night_booking_additional_charge",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.night_booking_additional_charge}
                  />
                  {errors.night_booking_additional_charge && (
                    <p className="text-sm text-destructive">
                      {errors.night_booking_additional_charge}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatVND(settings.night_booking_additional_charge)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday_booking_additional_charge">
                    Phụ thu ngày lễ (VND)
                  </Label>
                  <Input
                    id="holiday_booking_additional_charge"
                    type="number"
                    min="0"
                    value={settings.holiday_booking_additional_charge}
                    onChange={(e) =>
                      handleFieldChange(
                        "holiday_booking_additional_charge",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.holiday_booking_additional_charge}
                  />
                  {errors.holiday_booking_additional_charge && (
                    <p className="text-sm text-destructive">
                      {errors.holiday_booking_additional_charge}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatVND(settings.holiday_booking_additional_charge)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekend_booking_additional_charge">
                    Phụ thu cuối tuần (VND)
                  </Label>
                  <Input
                    id="weekend_booking_additional_charge"
                    type="number"
                    min="0"
                    value={settings.weekend_booking_additional_charge}
                    onChange={(e) =>
                      handleFieldChange(
                        "weekend_booking_additional_charge",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-invalid={!!errors.weekend_booking_additional_charge}
                  />
                  {errors.weekend_booking_additional_charge && (
                    <p className="text-sm text-destructive">
                      {errors.weekend_booking_additional_charge}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatVND(settings.weekend_booking_additional_charge)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer Actions */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Khôi phục
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default function BranchSettingsPageWithAuth() {
  return (
    <RequireRole roles={["manager", "admin"]}>
      <BranchSettingsPage />
    </RequireRole>
  );
}
