"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
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
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Đặt sân",
    items: [
      {
        title: "Đặt sân mới",
        href: "/booking/court",
        icon: CalendarCheck,
      },
      {
        title: "Quản lý đặt sân",
        href: "/booking/manage",
        icon: CalendarClock,
      },
    ],
  },
  {
    label: "Vận hành",
    items: [
      {
        title: "Quản lý dịch vụ",
        href: "/services",
        icon: Package,
      },
      {
        title: "Quản lý khách hàng",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Quản lý nhân viên",
        href: "/employees",
        icon: UserCog,
      },
      {
        title: "Quản lý sân bãi",
        href: "/courts",
        icon: Building2,
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
      },
      {
        title: "Cài đặt ca",
        href: "/shifts/settings",
        icon: Wrench,
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Cấu hình",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
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
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {!isCollapsed && (
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
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
          ))}
        </nav>
      </ScrollArea>

      {/* Toggle Button */}
      <div
        className={cn(
          "h-14 border-t flex items-center",
          isCollapsed ? "px-2 justify-center" : "px-4"
        )}
      >
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
    </aside>
  );
}
