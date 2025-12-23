# Kế hoạch kiểm tra và sửa lỗi TypeScript

## Mục tiêu
Kiểm tra toàn bộ codebase để tìm và sửa các lỗi TypeScript liên quan đến optional properties, undefined checks, và type mismatches để đảm bảo build không còn lỗi.

## Phạm vi kiểm tra

### 1. Optional Properties trong Entities

#### Court (lib/types/entities.ts)
- `display_name?: string` - Đã sửa một số chỗ, cần kiểm tra toàn bộ
- `name?: string` - Cần kiểm tra
- `capacity?: number` - Cần kiểm tra
- `maintenance_date?: string` - Cần kiểm tra

#### Employee (lib/types/entities.ts)
- `gender?: string` - Cần kiểm tra
- `dob?: string` - Cần kiểm tra
- `address?: string` - Cần kiểm tra
- `status?: string` - Cần kiểm tra
- `commission_rate?: number` - Cần kiểm tra
- `base_salary?: number` - Đã sửa một chỗ, cần kiểm tra toàn bộ
- `base_allowance?: number` - Đã sửa một chỗ, cần kiểm tra toàn bộ
- `branch_id?: number` - Cần kiểm tra
- `role_id?: number` - Cần kiểm tra

#### Customer (lib/types/entities.ts)
- `dob?: string` - Cần kiểm tra
- `gender?: string` - Cần kiểm tra
- `id_card_number?: string` - Cần kiểm tra
- `address?: string` - Cần kiểm tra
- `customer_level_id?: number` - Cần kiểm tra
- `bonus_point?: number` - Cần kiểm tra

#### CourtBooking (lib/types/entities.ts)
- `slots?: BookingSlot[]` - Đã sửa nhiều chỗ, cần kiểm tra toàn bộ
- `employee_id?: number | null` - Cần kiểm tra

#### ServiceBooking (lib/types/entities.ts)
- `employee_id?: number | null` - Cần kiểm tra

#### ServiceBookingItem (lib/types/entities.ts)
- `trainer_ids?: number[]` - Cần kiểm tra

#### Invoice (lib/types/entities.ts)
- `service_booking_id?: number | null` - Cần kiểm tra
- `court_booking_id?: number | null` - Cần kiểm tra

#### Branch (lib/types/entities.ts)
- `hotline?: string` - Cần kiểm tra
- `late_time_limit?: number` - Cần kiểm tra

#### BranchService (lib/types/entities.ts)
- `current_stock?: number` - Cần kiểm tra
- `min_stock_threshold?: number` - Cần kiểm tra
- `status?: BranchServiceStatus` - Cần kiểm tra

## Chiến lược kiểm tra

### Bước 1: Quét toàn bộ codebase
```bash
# Tìm tất cả chỗ sử dụng optional properties chưa có null check
grep -r "\.display_name[^|?]" lib/
grep -r "\.name[^|?]" lib/
grep -r "\.base_salary[^|?]" lib/
grep -r "\.base_allowance[^|?]" lib/
grep -r "\.slots[^|?]" lib/
# ... và các properties khác
```

### Bước 2: Phân loại theo mức độ ưu tiên

**Ưu tiên cao (thường xuyên sử dụng):**
1. `CourtBooking.slots` - Đã sửa nhiều, cần kiểm tra lại
2. `Court.display_name` / `Court.name` - Đã sửa một số, cần kiểm tra toàn bộ
3. `Employee.base_salary` / `Employee.base_allowance` - Đã sửa một chỗ, cần kiểm tra toàn bộ

**Ưu tiên trung bình:**
4. `Employee.role_id`, `Employee.branch_id`
5. `Customer.dob`, `Customer.gender`, `Customer.address`
6. `Invoice.service_booking_id`, `Invoice.court_booking_id`

**Ưu tiên thấp (ít sử dụng):**
7. `Branch.hotline`, `Branch.late_time_limit`
8. `BranchService.current_stock`, `BranchService.min_stock_threshold`

### Bước 3: Pattern sửa lỗi

#### Pattern 1: Optional string → fallback
```typescript
// ❌ Sai
const name = court.display_name;

// ✅ Đúng
const name = court.display_name || court.name || `Sân ${court.id}`;
// hoặc
const name = court.display_name ?? court.name ?? `Sân ${court.id}`;
```

#### Pattern 2: Optional number → default value
```typescript
// ❌ Sai
const total = emp.base_salary + emp.base_allowance;

// ✅ Đúng
const total = (emp.base_salary || 0) + (emp.base_allowance || 0);
// hoặc
const total = (emp.base_salary ?? 0) + (emp.base_allowance ?? 0);
```

#### Pattern 3: Optional array → empty array
```typescript
// ❌ Sai
booking.slots.forEach(...)

// ✅ Đúng
const slots = booking.slots || [];
slots.forEach(...)
// hoặc
(booking.slots || []).forEach(...)
```

#### Pattern 4: Optional object property access
```typescript
// ❌ Sai
const name = branch.name;

// ✅ Đúng
const name = branch?.name || "";
// hoặc
const name = branch?.name ?? "";
```

## Danh sách file cần kiểm tra

### lib/mock/ (Mock repositories)
- [ ] `lib/mock/reportCourts.ts` - Đã sửa một số chỗ
- [ ] `lib/mock/employeeReportRepo.ts` - Đã sửa một chỗ
- [ ] `lib/mock/customerDashboardRepo.ts` - Đã sửa một số chỗ
- [ ] `lib/mock/invoiceCashierRepo.ts`
- [ ] `lib/mock/invoiceManagerRepo.ts`
- [ ] `lib/mock/reportCustomers.ts`
- [ ] `lib/mock/reportRevenue.ts`
- [ ] `lib/mock/scheduleRepo.ts`
- [ ] `lib/mock/employeeRepo.ts`
- [ ] `lib/mock/customerRepo.ts`
- [ ] `lib/mock/courtRepo.ts`
- [ ] `lib/mock/serviceRepo.ts`
- [ ] `lib/mock/branchSettingsRepo.ts`
- [ ] `lib/mock/passwordResetRepo.ts`
- [ ] `lib/mock/authRepo.ts`
- [ ] `lib/mock/bookingFlowMock.ts`

### lib/booking/
- [ ] `lib/booking/mockRepo.ts` - Đã sửa một số chỗ
- [ ] `lib/booking/selectors.ts` - Đã sửa một số chỗ

### lib/courts/
- [ ] `lib/courts/mockRepo.ts` - Đã sửa một chỗ
- [ ] `lib/courts/selectors.ts`

### lib/customers/
- [ ] `lib/customers/mockRepo.ts` - Đã sửa một chỗ
- [ ] `lib/customers/selectors.ts`

### lib/employees/
- [ ] `lib/employees/mockRepo.ts`
- [ ] `lib/employees/selectors.ts`

### lib/services/
- [ ] `lib/services/selectors.ts`

### lib/api/
- [ ] `lib/api/booking/service.ts` - Đã sửa một số chỗ
- [ ] `lib/api/client.ts`

### components/ (nếu có)
- [ ] Kiểm tra các component có sử dụng optional properties trực tiếp

## Quy trình thực hiện

1. **Chạy TypeScript check toàn bộ:**
   ```bash
   npx tsc --noEmit
   # hoặc
   npm run build
   ```

2. **Ghi lại tất cả lỗi TypeScript còn lại**

3. **Phân loại lỗi theo:**
   - Optional property chưa check
   - Type mismatch
   - Missing type assertion
   - Other

4. **Sửa từng nhóm lỗi:**
   - Bắt đầu với các lỗi trong `lib/mock/` (nhiều nhất)
   - Sau đó `lib/booking/`, `lib/courts/`, `lib/customers/`, `lib/employees/`
   - Cuối cùng là `lib/api/` và `components/`

5. **Chạy lại type check sau mỗi nhóm sửa**

6. **Đảm bảo không có regression**

## Lưu ý

- Luôn dùng `||` hoặc `??` cho optional properties
- Ưu tiên `??` (nullish coalescing) khi muốn giữ giá trị `0`, `false`, `""`
- Ưu tiên `||` khi muốn fallback cho mọi falsy value
- Với arrays, luôn dùng `|| []` hoặc `?? []`
- Với numbers, luôn dùng `|| 0` hoặc `?? 0`
- Với strings, luôn có fallback string (không để undefined)

## Tiêu chí hoàn thành

- [ ] `npx tsc --noEmit` chạy không có lỗi
- [ ] `npm run build` build thành công
- [ ] Tất cả optional properties đều có null/undefined check
- [ ] Không có type assertion không an toàn (`as any`, `!` operator không cần thiết)

