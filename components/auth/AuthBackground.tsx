export function AuthBackground() {
  return (
    <div className="bg-muted relative hidden lg:block">
      <img
        src="/authen-background.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  );
}
