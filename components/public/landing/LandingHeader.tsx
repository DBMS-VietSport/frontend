import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * LandingHeader - Sticky navigation header for public landing page
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              V
            </span>
          </div>
          <span className="font-bold text-xl">VietSport</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Đăng nhập</Button>
          </Link>
          <Link href="/register">
            <Button>Đăng ký</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
