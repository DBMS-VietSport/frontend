import { branches } from "./data";

export interface BranchSettings {
  id: number;
  name: string;
  late_time_limit: number;
  max_courts_per_day_per_user: number;
  shift_pay: number;
  shift_absence_penalty: number;
  loyalty_point_rate: number;
  cancel_fee_before_24h_percent: number;
  cancel_fee_within_24h_percent: number;
  no_show_fee_percent: number;
  night_booking_additional_charge: number;
  holiday_booking_additional_charge: number;
  weekend_booking_additional_charge: number;
}

export interface UpdateBranchSettingsPayload {
  late_time_limit?: number;
  max_courts_per_day_per_user?: number;
  shift_pay?: number;
  shift_absence_penalty?: number;
  loyalty_point_rate?: number;
  cancel_fee_before_24h_percent?: number;
  cancel_fee_within_24h_percent?: number;
  no_show_fee_percent?: number;
  night_booking_additional_charge?: number;
  holiday_booking_additional_charge?: number;
  weekend_booking_additional_charge?: number;
}

const DEFAULT_SETTINGS: Omit<BranchSettings, "id" | "name"> = {
  late_time_limit: 15,
  max_courts_per_day_per_user: 3,
  shift_pay: 200_000,
  shift_absence_penalty: 50_000,
  loyalty_point_rate: 1,
  cancel_fee_before_24h_percent: 10,
  cancel_fee_within_24h_percent: 50,
  no_show_fee_percent: 100,
  night_booking_additional_charge: 50_000,
  holiday_booking_additional_charge: 100_000,
  weekend_booking_additional_charge: 30_000,
};

const mockBranchSettings = new Map<number, BranchSettings>();

function resolveBranchSettings(branchId: number): BranchSettings {
  const branch = branches.find((b) => b.id === branchId);

  return {
    id: branchId,
    name: branch?.name ?? `Chi nhánh #${branchId}`,
    late_time_limit:
      branch?.late_time_limit ?? DEFAULT_SETTINGS.late_time_limit,
    max_courts_per_day_per_user: DEFAULT_SETTINGS.max_courts_per_day_per_user,
    shift_pay: DEFAULT_SETTINGS.shift_pay,
    shift_absence_penalty: DEFAULT_SETTINGS.shift_absence_penalty,
    loyalty_point_rate: DEFAULT_SETTINGS.loyalty_point_rate,
    cancel_fee_before_24h_percent:
      DEFAULT_SETTINGS.cancel_fee_before_24h_percent,
    cancel_fee_within_24h_percent:
      DEFAULT_SETTINGS.cancel_fee_within_24h_percent,
    no_show_fee_percent: DEFAULT_SETTINGS.no_show_fee_percent,
    night_booking_additional_charge:
      DEFAULT_SETTINGS.night_booking_additional_charge,
    holiday_booking_additional_charge:
      DEFAULT_SETTINGS.holiday_booking_additional_charge,
    weekend_booking_additional_charge:
      DEFAULT_SETTINGS.weekend_booking_additional_charge,
  };
}

export async function listBranches(): Promise<
  Array<{ id: number; name: string }>
> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return branches.map((b) => ({ id: b.id, name: b.name }));
}

export async function getBranchSettings(
  branchId: number
): Promise<BranchSettings> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  if (!mockBranchSettings.has(branchId)) {
    mockBranchSettings.set(branchId, resolveBranchSettings(branchId));
  }
  // Return a copy to avoid accidental mutation
  return { ...mockBranchSettings.get(branchId)! };
}

export async function updateBranchSettings(
  branchId: number,
  payload: UpdateBranchSettingsPayload
): Promise<BranchSettings> {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const current =
    mockBranchSettings.get(branchId) ?? resolveBranchSettings(branchId);

  const updated: BranchSettings = {
    ...current,
    ...payload,
  };

  mockBranchSettings.set(branchId, updated);

  return { ...updated };
}
