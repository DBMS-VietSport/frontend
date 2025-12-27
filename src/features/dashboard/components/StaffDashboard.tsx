export function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Chào mừng đến với hệ thống quản lý VietSport
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Dashboard content will go here */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Tổng quan</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Nội dung dashboard sẽ được thêm vào đây
          </p>
        </div>
      </div>
    </div>
  );
}
