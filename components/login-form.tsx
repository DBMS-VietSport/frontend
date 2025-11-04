"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { accounts } from "@/lib/mock/data";
import { sharedPasswordStorage } from "@/lib/mock/passwordStorage";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Find account by username (email)
      const account = accounts.find((a) => a.username === data.email);

      if (!account) {
        toast.error("Email hoặc mật khẩu không chính xác");
        return;
      }

      // Check password
      const storedPassword = sharedPasswordStorage.get(account.id);
      if (storedPassword !== data.password) {
        toast.error("Email hoặc mật khẩu không chính xác");
        return;
      }

      // Success
      toast.success("Đăng nhập thành công!");

      // Store user info in localStorage (mock session)
      localStorage.setItem("userId", account.id);
      localStorage.setItem("userEmail", data.email);

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Chào mừng trở lại
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Đăng nhập để tiếp tục đặt sân thể thao
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="pl-10"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              <a
                href="/forgot-password"
                className="text-xs text-primary hover:underline underline-offset-4"
              >
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError errors={[errors.password]} />
          </Field>
        </div>

        <Field className="pt-2">
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </Field>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc
            </span>
          </div>
        </div>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full h-11"
            asChild
          >
            <a href="/register">Tạo tài khoản mới</a>
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-xs">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Đăng ký ngay
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
