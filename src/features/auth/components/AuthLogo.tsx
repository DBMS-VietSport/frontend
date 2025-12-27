import { Medal } from "lucide-react";

export function AuthLogo() {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <a href="/" className="flex items-center gap-3 font-semibold text-lg">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <Medal className="size-5" />
        </div>
        <span className="text-foreground">Việt Sport</span>
      </a>
    </div>
  );
}
