"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/ui/field";
import { Input } from "@/ui/input";
import { passwordResetRepo } from "@/mock/passwordResetRepo";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = passwordResetRepo.requestReset(data.email);

      if (result.success) {
        const otpCode = passwordResetRepo.getOtp(data.email);

        if (otpCode) {
          toast.success(`Mã OTP đã được gửi tới email của bạn: ${otpCode}`, {
            duration: 10000,
          });
        } else {
          toast.success("Mã OTP đã được gửi tới email của bạn");
        }

        // Small delay to ensure toast is shown
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        }, 100);
      } else {
        toast.error("Email không tồn tại trong hệ thống");
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quên mật khẩu?
            </h1>
            <p className="text-muted-foreground text-sm text-balance max-w-sm">
              Không sao! Nhập email bạn đã đăng ký và chúng tôi sẽ gửi mã OTP để
              đặt lại mật khẩu.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Field>
            <FieldLabel htmlFor="email">Email đã đăng ký</FieldLabel>
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
            <FieldDescription className="text-xs">
              Email demo: minh@vs.com, hoa@vs.com, khang@vs.com
            </FieldDescription>
          </Field>
        </div>

        <Field className="pt-2">
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
          </Button>
        </Field>

        <Field>
          <Button type="button" variant="ghost" className="w-full" asChild>
            <a href="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </a>
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-xs">
            Nhớ mật khẩu?{" "}
            <a
              href="/login"
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Đăng nhập ngay
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
