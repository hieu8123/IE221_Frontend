"use client";

import { useParams } from "next/navigation";

const Success = () => {
  const { order_id, status } = useParams();

  return (
    <div>
      <h1>Thanh toán thành công!</h1>
      <p>Đơn hàng ID: {order_id}</p>
      <p>Trạng thái: {status}</p>
      <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
    </div>
  );
};

export default Success;
