import { AuthContainer } from "../../components/auth/AuthContainer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContainer>{children}</AuthContainer>;
}
