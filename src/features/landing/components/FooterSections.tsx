import Link from "next/link";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";

/**
 * CTASection - Call to action section before footer
 */
export function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-linear-to-br from-primary/10 via-primary/5 to-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Bạn là khách hàng mới của VietSport?
        </h2>
        <p className="text-lg text-muted-foreground">
          Đăng ký ngay để trải nghiệm dịch vụ đặt sân thể thao chuyên nghiệp
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" className="px-8">
              Đăng ký tài khoản
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * LandingFooter - Simple footer with links
 */
export function LandingFooter() {
  return (
    <>
      <Separator />
      <footer className="py-8 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 VietSport. Hệ thống đặt sân thể thao.</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-primary">
                Đăng nhập
              </Link>
              <Link href="/register" className="hover:text-primary">
                Đăng ký
              </Link>
              <span>Hotline: 1900-xxxx</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
