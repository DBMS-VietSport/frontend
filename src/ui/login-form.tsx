"use client";

import { cn } from "@/utils";
import { Button } from "@/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/ui/field";
import { Input } from "@/ui/input";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/lib/useAuth";
import { MOCK_USERS, ROLE_LABELS } from "@/features/auth/mock/authMock";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { login } = useAuth();
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
      // Find user to check role before redirecting
      const foundUser = MOCK_USERS.find(
        (u) => u.username === data.username && u.password === data.password
      );

      if (!foundUser) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }

      // Use the mock auth login
      login(data.username, data.password);

      toast.success("Đăng nhập thành công!");

      // Redirect based on user role
      setTimeout(() => {
        if (foundUser.role === "customer") {
          router.push("/dashboard");
        } else {
          // For employees (admin, manager, receptionist, cashier, technical, trainer)
          router.push("/my-schedule");
        }
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(message);
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
            Đăng nhập vào hệ thống VietSport
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Field>
            <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="admin"
                className="pl-10"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
            </div>
            <FieldError errors={[errors.username]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="123456"
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

        {/* Test Accounts */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs font-semibold mb-2 text-muted-foreground">
            Tài khoản test:
          </p>
          <div className="max-h-40 overflow-y-auto pr-2">
            <div className="space-y-1 text-xs text-muted-foreground">
              {MOCK_USERS.map((user) => (
                <div key={user.username} className="flex justify-between">
                  <span className="font-mono">{user.username}</span>
                  <span className="text-xs">({ROLE_LABELS[user.role]})</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">
            Mật khẩu: <span className="font-mono">123456</span>
          </p>
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
