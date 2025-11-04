"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { passwordResetRepo } from "@/lib/mock/passwordResetRepo";
import { Lock, Eye, EyeOff, CheckCircle2, LockKeyhole } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirm_password: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Yếu", color: "text-red-500" };
    if (strength <= 3)
      return { strength, label: "Trung bình", color: "text-yellow-500" };
    return { strength, label: "Mạnh", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const result = passwordResetRepo.resetPassword(email, data.password);
      if (result.success) {
        toast.success("Đặt lại mật khẩu thành công");
        router.push("/login");
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <LockKeyhole className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Đặt lại mật khẩu
            </h1>
            <p className="text-muted-foreground text-sm text-balance max-w-sm">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Field>
            <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
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
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength <= 2
                          ? "bg-red-500"
                          : passwordStrength.strength <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${passwordStrength.color}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        password.length >= 6
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>Tối thiểu 6 ký tự</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        /\d/.test(password)
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>Chứa ít nhất một số</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        /[a-z]/.test(password) && /[A-Z]/.test(password)
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>Chứa chữ hoa và chữ thường</span>
                  </div>
                </div>
              </div>
            )}
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm_password">
              Xác nhận mật khẩu
            </FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className="pl-10 pr-10"
                {...register("confirm_password")}
                aria-invalid={!!errors.confirm_password}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError errors={[errors.confirm_password]} />
          </Field>
        </div>

        <Field className="pt-2">
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-xs">
            <a
              href="/login"
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Quay lại đăng nhập
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
