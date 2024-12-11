"use client";

import { formatPrice } from "@/utils";
import Image from "next/legacy/image";
import notify from "../notifications";
import { SERVER_URL } from "@/contains";
import { useState } from "react";

const OrderDetailModal = ({ order, closeModal, setIsReload }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateReturnRequest = async (reason) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/payment/vnpay/request_refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: order.id,
            reason: reason,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create return request");
      }
      notify("success", "Yêu cầu hoàn trả đã được gửi");
      setIsReload(true);
      closeModal();
    } catch (error) {
      console.error("Failed to create return request", error);
      notify("error", error.message);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%]">
        <h2 className="text-xl text-center font-bold mb-4">
          Chi tiết đơn hàng
        </h2>
        <div className=" mx-auto place-items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="mb-2 self-center">
            <strong>Order ID:</strong> {order.id}
          </div>
          <div className="mb-2 self-center">
            <strong>Ngày tạo:</strong>{" "}
            {new Date(order.created_at).toLocaleDateString()}
          </div>
          <div className="mb-2 self-center">
            <strong>Tổng tiền:</strong> {order.total}
          </div>
          <div className="mb-2 self-center">
            <strong>Trạng thái:</strong> {order.status}
          </div>
        </div>
        <div className="mt-4">
          <strong>Chi tiết đơn hàng:</strong>
          <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Sản phẩm</th>
                <th className="border border-gray-300 px-4 py-2">Số lượng</th>
                <th className="border border-gray-300 px-4 py-2">Giá</th>
                <th className="border border-gray-300 px-4 py-2">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.order_details.map((item) => (
                <tr key={item.product_id}>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center gap-10">
                      <Image
                        src={item.product_image} // URL của ảnh sản phẩm
                        alt={item.product_name}
                        height={64}
                        width={64}
                        className="w-16 h-16 object-cover"
                      />
                      <span>{item.product_name}</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatPrice(item.price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {order.transaction_id ? (
            <div className="mt-4">
              <div className="mb-2">
                <strong>Phương thức thanh toán:</strong> VNPay
              </div>
              <strong>Transaction ID:</strong> {order.transaction_id}
            </div>
          ) : (
            <div className="mt-4">
              <div className="mb-2">
                <strong>Phương thức thanh toán:</strong> Thanh toán khi nhận
                hàng
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-8">
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Đóng
          </button>
          <button
            disabled={order.status != "paid" || !order.transaction_id}
            onClick={() => setIsOpen(true)}
            className={`mt-4 px-4 py-2 bg-orange-500 text-white rounded ${
              order.status == "paid" && order.transaction_id
                ? "hover:bg-orange-700"
                : "opacity-70"
            }`}
          >
            Tạo yêu cầu hoàn trả
          </button>
        </div>
      </div>
      {isOpen && (
        <ReasonForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          handleCreateReturnRequest={handleCreateReturnRequest}
          closeReasonForm={() => setIsOpen(false)} // Thêm logic để đóng form
        />
      )}
    </div>
  );
};

const ReasonForm = ({ isOpen, onClose, handleCreateReturnRequest }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50  flex items-center justify-center bg-gray-800 bg-opacity-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-[40%]">
        <h2 className="text-xl text-center font-bold mb-4">Lý do hoàn trả</h2>
        <textarea
          className="w-full h-24 border border-gray-300 p-2"
          placeholder="Nhập lý do hoàn trả"
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <div className="flex justify-end gap-8 mt-4">
          <button
            onClick={() => handleCreateReturnRequest(reason)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Gửi yêu cầu
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
