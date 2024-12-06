"use client";
import Link from "next/link";
import useAuth from "@hooks/use-auth";
import { redirect } from "next/navigation";
import SubmitButton from "@/components/buttons/submit-button";
import { z } from "zod";
import { useState } from "react";
import notify from "@/components/notifications";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

// Định nghĩa schema Zod để xác thực dữ liệu form
const registerSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(1, "Nhập lại mật khẩu là bắt buộc"),
});

const registerFormSchema = registerSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  }
);

export default function Register() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, checkIsLoggedIn } = useAuth();

  // Hàm xử lý submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Lấy dữ liệu từ form
    const form = new FormData(event.target);
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    // Thực hiện xác thực với Zod
    const validationResult = registerFormSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    // Nếu có lỗi xác thực, trả về thông báo lỗi
    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        acc[error.path[0]] = error.message; // Gán lỗi vào theo tên trường
        return acc;
      }, {});
      setError(errors);
      setIsLoading(false);
      return;
    }

    // Nếu dữ liệu hợp lệ, thực hiện đăng ký
    const { user, error } = await register(email, password, name);
    if (!user) {
      setIsLoading(false);
      notify("error", error);
      return;
    }

    setIsLoading(false);
    notify("success", "Đăng ký thành công");
    redirect("/");
  };

  //   Kiểm tra nếu người dùng đã đăng nhập
  if (checkIsLoggedIn()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[600px] items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-bold text-black">Đăng ký</h3>
        </div>
        <form
          onSubmit={handleSubmit} // Sử dụng onSubmit thay vì action
          className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-xs text-gray-700 uppercase"
            >
              Tên người dùng
            </label>
            <input
              id="name"
              name="name"
              placeholder="Tên của bạn"
              required
              className="mt-1 block w-full text-gray-700 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
            {error?.name && (
              <p className="text-red-500 text-xs">{error.name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-xs text-gray-700 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              placeholder="user@gmail.com"
              required
              className="mt-1 block w-full text-gray-700 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
            {error?.email && (
              <p className="text-red-500 text-xs">{error.email}</p>
            )}
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-xs text-gray-700  uppercase re"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              className="mt-1 block w-full text-gray-700 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Thay đổi trạng thái showPassword khi click
              className="absolute right-3 top-[30px]  text-gray-500"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
            {error?.password && (
              <p className="text-red-500 text-xs">{error.password}</p>
            )}
          </div>
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-xs text-gray-700  uppercase"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="********"
              required
              className="mt-1 block w-full text-gray-700 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Thay đổi trạng thái showPassword khi click
              className="absolute right-3 top-[30px] text-gray-500"
            >
              {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
            {error?.confirmPassword && (
              <p className="text-red-500 text-xs">{error.confirmPassword}</p>
            )}
          </div>
          <SubmitButton isLoading={isLoading}>Đăng ký</SubmitButton>
          <p className="text-center text-sm text-gray-800">
            {"Bạn đã có tài khoản? "}
            <Link href="/login" className="font-semibold text-blue-600">
              Đăng ký
            </Link>
            {" ngay."}
          </p>
        </form>
      </div>
    </div>
  );
}
