import { Card } from '@/components/ui/card';

export function ShiftLegend() {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Chú thích</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
          <span className="text-sm text-gray-600">Đã phân đủ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
          <span className="text-sm text-gray-600">Thiếu nhân sự</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
          <span className="text-sm text-gray-600">Không có ca</span>
        </div>
      </div>
    </Card>
  );
}
