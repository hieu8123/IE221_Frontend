"use client";

import { useSearchParams } from "next/navigation";

const Fail = () => {
  const searchParams = useSearchParams(); // Lấy các tham số từ URL
  const order_id = searchParams.get("order_id");
  const status = searchParams.get("status");
  const response_code = searchParams.get("response_code");
  return (
    <div>
      <h1>Thanh toán thất bại!</h1>
      <p>Đơn hàng ID: {order_id}</p>
      <p>Trạng thái: {status}</p>
      <p>Mã lỗi: {response_code}</p>
      <p>
        Vui lòng thử lại hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp tục.
      </p>
    </div>
  );
};

export default Fail;
