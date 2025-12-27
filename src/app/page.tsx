"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/lib/useAuth";
import { BranchPricing } from "@/features/landing/components/BranchPricing";
import {
  LandingHeader,
  HeroSection,
  CourtSystemSection,
  HowItWorksSection,
  CTASection,
  LandingFooter,
} from "@/features/landing/components";

/**
 * Root page - handles routing based on auth status
 * - If logged in as employee → redirect to /my-schedule
 * - If logged in as customer → redirect to /dashboard
 * - If not logged in → show public landing page
 */
export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      setShouldRedirect(true);
      // If user is employee (not customer), redirect to my-schedule
      if (user.role !== "customer") {
        router.replace("/my-schedule");
      } else {
        // If customer, redirect to dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  // If logged in, show loading while redirecting
  if (loading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show public landing page
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />

      {/* Branch Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <BranchPricing />
        </div>
      </section>

      <CourtSystemSection />
      <HowItWorksSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
