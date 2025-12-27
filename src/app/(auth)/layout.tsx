import { AuthContainer } from "@/features/auth/components/AuthContainer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContainer>{children}</AuthContainer>;
}
