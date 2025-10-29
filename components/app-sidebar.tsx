"use client";

import * as React from "react";
import {
  AudioWaveform,
  Calendar,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings,
  Home,
  Users,
  UserCog,
  MapPin,
  Package,
  BarChart3,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Việt Sport",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Việt Sport",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Việt Sport",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Trang chủ",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Quản lý đặt sân",
      url: "/booking/schedule",
      icon: Calendar,
      items: [
        {
          title: "Đặt sân",
          url: "/booking/court-booking",
        },
        {
          title: "Danh sách đặt sân",
          url: "/booking/schedule",
        },
      ],
    },
    {
      title: "Quản lý khách hàng",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Quản lý nhân viên",
      url: "/employees",
      icon: UserCog,
    },
    {
      title: "Quản lý ca trực",
      url: "/shifts",
      icon: Calendar,
      items: [
        {
          title: "Phân ca trực",
          url: "/shifts/assign",
        },
        {
          title: "Chỉnh sửa ca",
          url: "/shifts/edit",
        },
      ],
    },
    {
      title: "Quản lý sân bãi",
      url: "/fields",
      icon: MapPin,
    },
    {
      title: "Quản lý dịch vụ",
      url: "/services",
      icon: Package,
    },
    {
      title: "Báo cáo thống kê",
      url: "/reports",
      icon: BarChart3,
      items: [
        {
          title: "Báo cáo doanh thu",
          url: "/reports/revenue",
        },
        {
          title: "Báo cáo sử dụng sân",
          url: "/reports/field-usage",
        },
        {
          title: "Báo cáo sử dụng dịch vụ",
          url: "/reports/service-usage",
        },
      ],
    },
    {
      title: "Cài đặt hệ thống",
      url: "/settings",
      icon: Settings,
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
