"use client";

import { LayoutDefault } from "@/layouts";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const Fail = () => {
  const searchParams = useSearchParams(); // Lấy các tham số từ URL
  const order_id = searchParams.get("order_id");
  const status = searchParams.get("status");
  const response_code = searchParams.get("response_code");
  return (
    <LayoutDefault>
      <div className="h-[60vh] w-full flex justify-center items-center">
        <div className="shadow-md p-10 flex flex-col gap-5">
          <h1 className="w-full text-center text-red-500 text-2xl">
            Thanh toán thất bại!
          </h1>
          <p>Đơn hàng ID: {order_id}</p>
          <p>Trạng thái: {status}</p>
          <p>Mã lỗi: {response_code}</p>
          <p>
            Vui lòng thử lại hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp tục.
          </p>
          <div className="w-full mt-5 flex justify-center">
            <Link
              href="/"
              className="text-blue-500 hover:font-bold hover:text-blue-600"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </LayoutDefault>
  );
};

export default Fail;
