"use client";

import { LayoutDefault } from "@/layouts";
import { fetchCartFromBackend } from "@/redux/cartSlice";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Suspense } from "react";

const SuccessContent = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const status = searchParams.get("status");

  useEffect(() => {
    dispatch(fetchCartFromBackend());
  }, [dispatch]);

  return (
    <div className="shadow-md p-10 flex flex-col gap-5">
      <h1 className="w-full text-center text-green-500 text-2xl">
        Thanh toán thành công!
      </h1>
      <p>Đơn hàng ID: {order_id}</p>
      <p>Trạng thái: {status}</p>
      <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
      <div className="w-full mt-5 flex justify-center">
        <Link
          href="/"
          className="text-blue-500 hover:font-bold hover:text-blue-600"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

const Success = () => {
  return (
    <LayoutDefault>
      <div className="h-[60vh] w-full flex justify-center items-center">
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </LayoutDefault>
  );
};

export default Success;
