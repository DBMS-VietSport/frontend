"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/ui/field";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { authRepo } from "@/features/auth/mock/authRepo";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

const registerSchema = z
  .object({
    full_name: z.string().min(1, "Họ và tên là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    phone_number: z
      .string()
      .min(1, "Số điện thoại là bắt buộc")
      .regex(/^\d{10}$/, "Số điện thoại phải có 10 chữ số"),
    dob: z.string().optional(),
    gender: z.enum(["Nam", "Nữ", "Khác"]).optional(),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirm_password: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với điều khoản sử dụng",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accept_terms: false,
    },
  });

  const gender = watch("gender");
  const acceptTerms = watch("accept_terms");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRepo.registerCustomer({
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        dob: data.dob,
        gender: data.gender,
        password: data.password,
      });

      toast.success("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi đăng ký";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Đăng ký để bắt đầu đặt sân thể thao
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Field>
            <FieldLabel htmlFor="full_name">Họ và tên</FieldLabel>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="full_name"
                placeholder="Nguyễn Văn A"
                className="pl-10"
                {...register("full_name")}
                aria-invalid={!!errors.full_name}
              />
            </div>
            <FieldError errors={[errors.full_name]} />
          </Field>

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
            <FieldLabel htmlFor="phone_number">Số điện thoại</FieldLabel>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone_number"
                type="tel"
                placeholder="0912345678"
                className="pl-10"
                {...register("phone_number")}
                aria-invalid={!!errors.phone_number}
              />
            </div>
            <FieldError errors={[errors.phone_number]} />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="dob">
                Ngày sinh{" "}
                <span className="text-muted-foreground text-xs">
                  (tùy chọn)
                </span>
              </FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dob"
                  type="date"
                  className="pl-10"
                  {...register("dob")}
                  aria-invalid={!!errors.dob}
                />
              </div>
              <FieldError errors={[errors.dob]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="gender">
                Giới tính{" "}
                <span className="text-muted-foreground text-xs">
                  (tùy chọn)
                </span>
              </FieldLabel>
              <Select
                value={gender || ""}
                onValueChange={(value) =>
                  setValue("gender", value as "Nam" | "Nữ" | "Khác")
                }
              >
                <SelectTrigger id="gender" aria-invalid={!!errors.gender}>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.gender]} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
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

          <Field>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setValue("accept_terms", !acceptTerms)}
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                  acceptTerms
                    ? "bg-primary border-primary"
                    : "border-input hover:border-primary"
                }`}
              >
                {acceptTerms && (
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                )}
              </button>
              <Label
                htmlFor="accept_terms"
                className="text-sm leading-relaxed cursor-pointer"
                onClick={() => setValue("accept_terms", !acceptTerms)}
              >
                Tôi đồng ý với{" "}
                <a href="#" className="text-primary hover:underline">
                  điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-primary hover:underline">
                  chính sách bảo mật
                </a>
              </Label>
            </div>
            <FieldError errors={[errors.accept_terms]} />
          </Field>
        </div>

        <Field className="pt-2">
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-xs">
            Đã có tài khoản?{" "}
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
