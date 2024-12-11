"use client";
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaCreditCard,
  FaBan,
} from "react-icons/fa";

import { RiRefund2Fill } from "react-icons/ri";

import { MdError } from "react-icons/md";
import { SERVER_URL } from "@/contains";
import notify from "@/components/notifications";
import LoadingSpinner from "@/components/loading";
import OrderDetailModal from "@/components/modals/order-detail-modal";

export default function OrderComponent() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReload, setIsReload] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    per_page: 10,
    status: "all",
    duration: "all",
    order_id: "",
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCheckCircle className="mr-2 h-4 w-4 text-green-600" />;
      case "pending":
        return <FaHourglassHalf className="mr-2 h-4 w-4 text-yellow-500" />;
      case "awaiting payment":
        return <FaCreditCard className="mr-2 h-4 w-4 text-blue-500" />;
      case "refund requested":
        return <RiRefund2Fill className="mr-2 h-4 w-4 text-orange-500" />;
      case "refunded":
        return <FaCheckCircle className="mr-2 h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <FaBan className="mr-2 h-4 w-4 text-red-600" />;
      case "error":
        return <MdError className="mr-2 h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${SERVER_URL}/order/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        notify("error", "Đã xảy ra lỗi khi hủy đơn hàng");
        console.error("Error cancelling order:", response.statusText);
        return;
      }
      const data = await response.json();
      setOrders(orders.map((order) => (order.id === orderId ? data : order)));
      notify("success", "Đã hủy đơn hàng");
    } catch (error) {
      notify("error", "Đã xảy ra lỗi khi hủy đơn hàng");
      console.error("Error cancelling order:", error);
    }
  };

  const viewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null); // Đảm bảo xóa thông tin đơn hàng khi đóng modal
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${SERVER_URL}/order/user?status=${searchParams.status}&time=${searchParams.duration}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setOrders(data);
      console.log(data);
    } catch (error) {
      notify("error", "Đã xảy ra lỗi khi tải thông tin đơn hàng");
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  useEffect(() => {
    if (isReload) {
      fetchOrders();
      setIsReload(false);
    }
  }, [isReload]);
  return (
    <section className="bg-white py-8 antialiased md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="gap-4 md:flex md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-gray-900  md:text-2xl">
              Đơn hàng của tôi
            </h2>
            <div className="mt-6 gap-10 md:mt-0 md:flex md:items-center md:justify-end">
              <div>
                <label htmlFor="order-type" className="sr-only">
                  Select order type
                </label>
                <select
                  id="order-type"
                  className="block w-full min-w-[8rem] rounded-lg border bg-gray-50 p-2.5 text-sm "
                  value={searchParams.status}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, status: e.target.value })
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="pending">Đang chờ</option>
                  <option value="awaiting payment">Chờ thanh toán</option>
                  <option value="refund requested">Đã yêu cầu hoàn tiền</option>
                  <option value="refunded">Đã hoàn tiền</option>
                  <option value="error">Lỗi</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <span className="text-gray-500 ">from</span>
              <div>
                <label htmlFor="duration" className="sr-only">
                  Select duration
                </label>
                <select
                  id="duration"
                  className="block w-full rounded-lg border bg-gray-50 p-2.5 text-sm "
                  value={searchParams.duration}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      duration: e.target.value,
                    })
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="day">Trong ngày</option>
                  <option value="week">Trong tuần</option>
                  <option value="months">Trong tháng</option>
                  <option value="6months">Trong nửa năm</option>
                  <option value="year">trong năm</option>
                </select>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="relative">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col justify-center w-full h-[60vh] p-10  text-center gap-4">
              <h1 className="text-2xl font-bold">Không có đơn hàng nào</h1>
              <p className="text-gray-500">
                Bạn chưa có đơn hàng nào. Hãy mua hàng ngay
              </p>
            </div>
          ) : (
            <div className="mt-6 flow-root md:mt-8">
              <div className="divide-y divide-gray-200 ">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center gap-y-4 py-6"
                  >
                    <dl className="w-1/2 md:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 ">
                        Order ID:
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 ">
                        <a href="#" className="hover:underline">
                          {order.id}
                        </a>
                      </dd>
                    </dl>
                    <dl className="w-1/2 md:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 ">
                        Ngày tạo
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 ">
                        {new Date(order.created_at).toISOString().split("T")[0]}
                      </dd>
                    </dl>
                    <dl className="w-1/2 md:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 ">
                        Tổng tiền:
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 ">
                        {order.total}
                      </dd>
                    </dl>
                    <dl className="w-1/2 md:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 ">
                        Trạng thái:
                      </dt>
                      <dd className="mt-1.5 inline-flex items-center rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium ">
                        {getStatusIcon(order.status)} {order.status}
                      </dd>
                    </dl>
                    <div className="w-full grid md:grid-cols-2 lg:flex lg:w-64 lg:items-center lg:justify-end gap-4">
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={
                          order.status !== "pending" &&
                          order.status !== "awaiting payment"
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${
                          order.status == "pending" ||
                          order.status == "awaiting payment"
                            ? "border-red-700  text-red-700 hover:bg-red-700 hover:text-white"
                            : "border-red-300  text-red-300 "
                        } lg:w-auto`}
                      >
                        Hủy đơn
                      </button>
                      <button
                        onClick={() => viewDetails(order)}
                        className="w-full rounded-lg border border-green-500 px-3 py-2 text-center text-sm font-medium text-green-500 hover:bg-green-500 hover:text-white lg:w-auto"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          closeModal={closeModal}
          setIsReload={setIsReload}
        />
      )}
    </section>
  );
}
