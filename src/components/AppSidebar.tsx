"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  Users,
  UserCog,
  Building2,
  Settings,
  Package,
  Clock,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Medal,
  LogOut,
  BarChart3,
  Receipt,
  Wallet,
  UserRound,
  FileText,
  ClipboardList,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { useAuth } from "@/features/auth/lib/useAuth";
import { ROLE_LABELS } from "@/lib/role-labels";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[]; // Roles that can see this item
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Lịch làm việc của tôi",
        href: "/my-schedule",
        icon: CalendarClock,
        roles: [
          "Quản trị hệ thống",
          "Quản lý",
          "Lễ tân",
          "Thu ngân",
          "Kỹ thuật",
          "Huấn luyện viên",
        ],
      },
      {
        title: "Bảng lương của tôi",
        href: "/my-payroll",
        icon: Wallet,
        roles: [
          "Quản trị hệ thống",
          "Quản lý",
          "Lễ tân",
          "Thu ngân",
          "Kỹ thuật",
          "Huấn luyện viên",
        ],
      },
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["Khách hàng/Member"],
      },
    ],
  },
  {
    label: "Đặt sân",
    items: [
      {
        title: "Đặt sân",
        href: "/booking/court",
        icon: CalendarCheck,
        roles: ["Khách hàng/Member"],
      },
      {
        title: "Lập phiếu đặt sân",
        href: "/booking/court",
        icon: CalendarCheck,
        roles: ["Lễ tân"],
      },
      {
        title: "Đặt dịch vụ kèm theo",
        href: "/booking/services",
        icon: Package,
        roles: ["Khách hàng/Member"],
      },
      {
        title: "Lập phiếu dịch vụ",
        href: "/booking/services",
        icon: Package,
        roles: ["Lễ tân"],
      },
      {
        title: "Thanh toán",
        href: "/booking/payment",
        icon: Receipt,
        roles: ["Khách hàng/Member", "Thu ngân"],
      },
      {
        title: "Quản lý đặt sân",
        href: "/booking/manage",
        icon: CalendarClock,
        roles: ["Quản lý", "Lễ tân"],
      },
      {
        title: "Lịch sử đặt sân",
        href: "/booking/manage",
        icon: CalendarClock,
        roles: ["Khách hàng/Member"],
      },
      {
        title: "Quản lý khách hàng",
        href: "/customers",
        icon: Users,
        roles: ["Quản lý"],
      },
    ],
  },
  {
    label: "Hóa đơn",
    items: [
      {
        title: "Tạo hóa đơn",
        href: "/invoices/create",
        icon: Receipt,
        roles: ["Quản lý", "Thu ngân"],
      },
      {
        title: "Quản lý hóa đơn",
        href: "/invoices/manage",
        icon: FileText,
        roles: ["Quản lý", "Thu ngân"],
      },
    ],
  },
  {
    label: "Cơ sở",
    items: [
      {
        title: "Quản lý nhân viên",
        href: "/employees",
        icon: UserCog,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
      {
        title: "Quản lý sân bãi",
        href: "/courts",
        icon: Building2,
        roles: ["Quản lý", "Kỹ thuật"],
      },
      {
        title: "Quản lý dịch vụ",
        href: "/services",
        icon: Package,
        roles: ["Quản lý"],
      },
      {
        title: "Cấu hình hệ thống",
        href: "/settings",
        icon: Settings,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
    ],
  },
  {
    label: "Bảo trì",
    items: [
      {
        title: "Lịch bảo trì",
        href: "/technician/schedule",
        icon: CalendarCheck,
        roles: ["Kỹ thuật", "Quản lý"],
      },
      {
        title: "Báo cáo bảo trì",
        href: "/technician/reports",
        icon: ClipboardList,
        roles: ["Kỹ thuật", "Quản lý"],
      },
    ],
  },
  {
    label: "Huấn luyện",
    items: [
      {
        title: "Lịch huấn luyện",
        href: "/trainer",
        icon: UserRound,
        roles: ["Huấn luyện viên"],
      },
    ],
  },
  {
    label: "Ca làm việc",
    items: [
      {
        title: "Phân ca",
        href: "/shifts/assign",
        icon: Clock,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
      {
        title: "Cài đặt ca",
        href: "/shifts/settings",
        icon: Wrench,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      {
        title: "Báo cáo doanh thu",
        href: "/reports/revenue",
        icon: TrendingUp,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
      {
        title: "Báo cáo sử dụng sân",
        href: "/reports/courts",
        icon: Activity,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
      {
        title: "Báo cáo khách hàng",
        href: "/reports/customers",
        icon: Users,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
      {
        title: "Báo cáo nhân viên",
        href: "/reports/employee",
        icon: BarChart3,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Cấu hình tham số chi nhánh",
        href: "/settings",
        icon: Settings,
        roles: ["Quản lý", "Quản trị hệ thống"],
      },
    ],
  },
];

export default function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r bg-card transition-all duration-300 flex flex-col",
        isCollapsed ? "w-[64px]" : "w-[280px]"
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "h-16 border-b flex items-center justify-between",
          isCollapsed ? "px-2 justify-center" : "px-6"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-3"
          title={isCollapsed ? "Việt Sport" : undefined}
        >
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg shrink-0">
            <Medal className="size-5" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg whitespace-nowrap">
              Việt Sport
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className={cn("space-y-6 py-4", isCollapsed ? "px-2" : "px-4")}>
          {navigationGroups.map((group, groupIdx) => {
            // Filter items based on roles
            const visibleItems = group.items.filter((item) => {
              if (!item.roles) return true; // No role restriction
              return user && item.roles.includes(user.role);
            });

            // Don't render group if no visible items
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx}>
                {!isCollapsed && (
                  <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </h4>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link key={itemIdx} href={item.href}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 relative h-10",
                            isCollapsed
                              ? "px-2 justify-center"
                              : "px-3 justify-start",
                            active &&
                            "bg-primary/10 text-primary hover:bg-primary/15"
                          )}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <Icon
                            className={cn(
                              "size-5 shrink-0",
                              active && "text-primary"
                            )}
                          />
                          {!isCollapsed && (
                            <span className="flex-1 text-left text-sm whitespace-nowrap">
                              {item.title}
                            </span>
                          )}
                          {!isCollapsed && item.badge && (
                            <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile & Actions */}
      <div className="border-t">
        {/* User Info */}
        {user && !isCollapsed && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {user.fullName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                </p>
                {user.branchName && (
                  <p className="text-xs text-muted-foreground">
                    Chi nhánh: {user.branchName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className={cn("px-2 py-2", isCollapsed && "px-2")}>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10",
              isCollapsed ? "px-2 justify-center" : "px-3 justify-start gap-2"
            )}
            title={isCollapsed ? "Đăng xuất" : undefined}
          >
            <LogOut className="size-4" />
            {!isCollapsed && <span className="text-sm">Đăng xuất</span>}
          </Button>
        </div>

        {/* Toggle Button */}
        <div className={cn("px-2 pb-2", isCollapsed && "px-2")}>
          <Button
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full h-10",
              isCollapsed ? "px-2 justify-center" : "px-3 justify-start gap-2"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span className="text-sm">Thu gọn</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
