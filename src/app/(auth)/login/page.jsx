"use client";
import Link from "next/link";
import useAuth from "@hooks/use-auth";
import SubmitButton from "@/components/buttons/submit-button";
import { z } from "zod";
import { useState } from "react";
import notify from "@/components/notifications";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Định nghĩa schema Zod để xác thực dữ liệu form
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").nonempty("Email là bắt buộc"),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự") // Sửa lại điều kiện min
    .nonempty("Mật khẩu là bắt buộc"),
});

export default function Login() {
  const [errorValidate, setErrorValidate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, user } = useAuth();
  const router = useRouter();

  // Hàm xử lý submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorValidate(null);
    setIsLoading(true);

    // Lấy dữ liệu từ form
    const form = new FormData(event.target);
    const email = form.get("email");
    const password = form.get("password");

    // Thực hiện xác thực với Zod
    const validationResult = loginSchema.safeParse({ email, password });

    // Nếu có lỗi xác thực, trả về thông báo lỗi
    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        acc[error.path[0]] = error.message; // Gán lỗi vào theo tên trường
        return acc;
      }, {});
      setErrorValidate(errors);
      setIsLoading(false);
      return;
    }

    // Nếu dữ liệu hợp lệ, thực hiện đăng nhập
    const err = await login(email, password);
    if (err) {
      setIsLoading(false);
      notify("error", error);
      return;
    }

    setIsLoading(false);
    notify("success", "Đăng nhập thành công");
    router.push("/"); // Chuyển hướng về trang chủ
  };

  return (
    <div className="flex min-h-[600px] items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-bold text-black">Đăng Nhập</h3>
        </div>
        <form
          onSubmit={handleSubmit} // Sử dụng onSubmit thay vì action
          className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16"
        >
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
            {errorValidate?.email && (
              <p className="text-red-500 text-xs">{errorValidate.email}</p>
            )}
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-xs text-gray-700  uppercase"
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
              className="absolute right-3 top-[30px] text-gray-500"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
            {errorValidate?.password && (
              <p className="text-red-500 text-xs">{errorValidate.password}</p>
            )}
          </div>
          <SubmitButton isLoading={isLoading}>Đăng nhập</SubmitButton>
          <p className="text-center text-sm text-gray-800">
            {"Bạn chưa có tài khoản? "}
            <Link href="/register" className="font-semibold text-blue-600">
              Đăng ký
            </Link>
            {" ngay."}
          </p>
        </form>
      </div>
    </div>
  );
}
