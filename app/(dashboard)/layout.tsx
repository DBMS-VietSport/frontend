import type { Metadata } from "next";
import AppSidebar from "@/components/layout/AppSidebar";

export const metadata: Metadata = {
  title: "Dashboard - Việt Sport",
  description: "Hệ thống quản lý sân thể thao Việt Sport",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <AppSidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
