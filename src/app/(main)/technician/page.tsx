"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TechnicianPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to schedule page
    router.replace("/technician/schedule");
  }, [router]);

  return null;
}
