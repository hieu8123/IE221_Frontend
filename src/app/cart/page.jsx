"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartFromBackend,
  addToCart,
  removeFromCart,
  clearCart,
} from "@/redux/cartSlice";
import { SERVER_URL } from "@/contains";
import { LayoutDefault } from "@/layouts";
import useAuth from "@/hooks/use-auth";

const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems = [] } = useSelector((state) => state.cart);
  const { checkIsLoggedIn } = useAuth();

  // Tải giỏ hàng từ backend khi load trang
  useEffect(() => {
    dispatch(fetchCartFromBackend());
  }, []);

  // Xử lý tăng số lượng sản phẩm
  const handleIncreaseQuantity = (product) => {
    const existingItem = cartItems.find(
      (item) => item.product.id === product.id
    );

    if (existingItem?.quantity < product.quantity) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  // Xử lý giảm số lượng sản phẩm
  const handleDecreaseQuantity = (product) => {
    const existingItem = cartItems.find(
      (item) => item.product.id === product.id
    );
    if (existingItem?.quantity > 1) {
      dispatch(addToCart({ product, quantity: -1 }));
    }
  };

  // Xóa sản phẩm khỏi giỏ
  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // Xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Tổng tiền
  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.quantity * (item.product?.price || 0),
      0
    );
    console.log(subtotal);
    return subtotal;
  };

  if (!checkIsLoggedIn()) {
    return (
      <LayoutDefault>
        <div className="flex items-center bg-gray-50 p-6 w-full lg:w-[80%] mx-auto h-[70vh]">
          <div className=" mx-auto justify-center text-center bg-white p-6 rounded-lg shadow-md">
            <p>Bạn cần đăng nhập để xem giỏ hàng</p>
            <div className="flex justify-center mt-6">
              <Link
                href="/login"
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <div className="bg-gray-50 p-6 w-full lg:w-[80%] mx-auto">
        <div className=" mx-auto bg-white p-6 rounded-lg shadow-md">
          {/* Tiêu đề */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Giỏ hàng của bạn</h1>
            <button
              onClick={handleClearCart}
              className="text-red-500 text-sm hover:underline"
            >
              Xóa giỏ hàng
            </button>
          </div>

          {/* Bảng giỏ hàng */}
          {cartItems.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-4">Product</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr className="border-b" key={item.product.id}>
                    <td className="p-4 flex items-center gap-4">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name || "Product"}
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-lg"
                      />
                      <span>{item.product.name || "Sản phẩm"}</span>
                    </td>
                    <td className="p-4">
                      {(item.product.price || 0).toLocaleString()} ₫
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 bg-gray-100 rounded-md text-lg font-semibold text-gray-700 hover:bg-gray-200"
                          onClick={() => handleDecreaseQuantity(item.product)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="w-8 h-8 bg-gray-100 rounded-md text-lg font-semibold text-gray-700 hover:bg-gray-200"
                          onClick={() => handleIncreaseQuantity(item.product)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {(item.quantity * item.product.price).toLocaleString()} ₫
                    </td>
                    <td className="p-4">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(item.product.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Giỏ hàng của bạn đang trống!</p>
          )}

          {/* Tổng tiền và nút thanh toán */}
          <div className="flex justify-between items-center mt-6">
            <h2 className="text-xl font-semibold">
              Tổng cộng: {calculateTotal().toLocaleString()} ₫
            </h2>
            <Link
              href="/checkout"
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Thanh toán
            </Link>
          </div>
        </div>
      </div>
    </LayoutDefault>
  );
};

export default Cart;