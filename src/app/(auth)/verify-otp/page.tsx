"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState, useEffect, useRef, Suspense } from "react";

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
import { ShieldCheck, ArrowLeft } from "lucide-react";

const verifyOtpSchema = z.object({
  otp: z.string().min(6, "Mã OTP phải có 6 số").max(6, "Mã OTP phải có 6 số"),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
      return;
    }
    // Auto send OTP when page loads
    const result = passwordResetRepo.requestReset(email);
    if (result.success) {
      const otpCode = passwordResetRepo.getOtp(email);
      if (otpCode) {
        toast.success(`Mã OTP đã được gửi tới email của bạn: ${otpCode}`, {
          duration: 10000, // Show for 10 seconds
        });
      }
    }
  }, [email, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1); // Only take last character
    setOtpValues(newOtpValues);

    // Update form value
    const otpString = newOtpValues.join("");
    setValue("otp", otpString);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtpValues = pastedData
      .split("")
      .concat(Array(6).fill(""))
      .slice(0, 6);
    setOtpValues(newOtpValues);
    setValue("otp", pastedData);

    // Focus last filled input or last input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;

    const result = passwordResetRepo.requestReset(email);
    if (result.success) {
      const otpCode = passwordResetRepo.getOtp(email);
      if (otpCode) {
        toast.success(`Mã OTP đã được gửi lại: ${otpCode}`, {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.success("Mã OTP đã được gửi lại");
      }
      setResendCooldown(60); // 60 seconds cooldown
    } else {
      toast.error("Không thể gửi lại mã OTP");
    }
  };

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      const result = passwordResetRepo.verifyOtp(email, data.otp);
      if (result.valid) {
        toast.success("Xác thực thành công");
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast.error("Mã OTP không hợp lệ hoặc đã hết hạn");
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
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Xác thực OTP</h1>
            <p className="text-muted-foreground text-sm text-balance max-w-sm">
              Mã OTP đã được gửi tới email
            </p>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Field>
            <FieldLabel className="text-center">Nhập mã OTP (6 số)</FieldLabel>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otpValues.map((value, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-lg font-semibold"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            <input type="hidden" {...register("otp")} />
            <FieldError errors={[errors.otp]} />
          </Field>
        </div>

        <Field className="pt-2">
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? "Đang xác thực..." : "Xác thực"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground text-sm">
                Gửi lại mã sau{" "}
                <span className="font-semibold text-primary">
                  {resendCooldown}s
                </span>
              </span>
            ) : (
              <span className="text-sm">
                Chưa nhận được mã?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary hover:underline underline-offset-4 font-medium"
                >
                  Gửi lại mã
                </button>
              </span>
            )}
          </FieldDescription>
        </Field>

        <Field>
          <Button type="button" variant="ghost" className="w-full" asChild>
            <a
              href="/forgot-password"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </a>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
