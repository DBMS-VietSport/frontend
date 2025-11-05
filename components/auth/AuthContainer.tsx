import { ReactNode } from "react";
import { AuthLogo } from "./AuthLogo";
import { AuthBackground } from "./AuthBackground";

interface AuthContainerProps {
  children: ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10 lg:p-12">
        <AuthLogo />
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          © 2024 Việt Sport. All rights reserved.
        </div>
      </div>
      <AuthBackground />
    </div>
  );
}
