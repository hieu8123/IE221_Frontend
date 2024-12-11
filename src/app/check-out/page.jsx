"use client";
import { z } from "zod";
import { LayoutDefault } from "@/layouts";
import { useEffect, useState } from "react";
import notify from "@/components/notifications";
import { useSelector } from "react-redux";
import { formatPrice } from "@/utils";
import { SERVER_URL } from "@/contains";
import { redirect } from "next/dist/server/api-utils";

// Zod validation schema
const checkoutSchema = z.object({
  name: z.string().min(1, "First name is required"),
  lineAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(
      /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
      "Invalid phone number format"
    ),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name: "",
    lineAddress: "",
    city: "",
    phone: "",
    email: "",
    notes: "",
    paymentOption: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Call API to fetch Vietnam provinces
  const fetchProvinces = async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
    }
  };

  const codPayment = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          name: formData.name,
          address: {
            address_line: formData.lineAddress,
            city: formData.city,
          },
          phone: formData.phone,
          email: formData.email,
          order_info: formData.notes,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        notify("error", "Failed to create order");
        return;
      }

      const data = await response.json();

      notify("success", "Order created successfully");
      redirect(`/check-out/success?order_id=${data.id}&status=SUCCESS`);
    } catch (error) {
      console.error("Failed to payment:", error);
      notify("error", "Failed to payment");
    }
  };

  const vnpayPayment = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/payment/vnpay/create_payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartItems: cartItems,
            name: formData.name,
            address: {
              address_line: formData.lineAddress,
              city: formData.city,
            },
            phone: formData.phone,
            email: formData.email,
            order_info: formData.notes,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        notify("error", "Failed to create order");
        return;
      }
      const data = await response.json();
      if (data.payment_url) {
        // Chuyển hướng người dùng đến URL thanh toán VNPAY
        window.location.href = data.payment_url;
      } else {
        notify("error", "Failed to generate payment URL");
      }
    } catch (error) {
      console.error("Failed to payment:", error);
      notify("error", "Failed to payment");
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.quantity * (item.product?.price || 0),
      0
    );
    console.log(subtotal);
    return subtotal;
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data using Zod
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.format();
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    console.log("Form data:", formData);
    if (formData.paymentOption === "cash") {
      codPayment();
    } else if (formData.paymentOption === "vnpay") {
      vnpayPayment();
    } else {
      notify("error", "Please select a payment option");
      return;
    }

    notify("success", "Order submitted successfully");
  };

  // Call to fetch provinces when the page loads
  useEffect(() => {
    fetchProvinces();
  }, []);

  return (
    <LayoutDefault>
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-2xl font-semibold mb-6">Chi tiết thanh toán</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block mt-2 text-sm font-medium text-gray-700"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block h-[40px] border  p-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {validationErrors.name && (
                  <span className="text-red-500 text-sm">
                    {validationErrors.name._errors[0]}
                  </span>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label
                  htmlFor="line-address"
                  className="block mt-2 text-sm font-medium text-gray-700"
                >
                  Địa chỉ chụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="line-address"
                  name="lineAddress"
                  value={formData.lineAddress}
                  onChange={handleChange}
                  className="mt-1 block h-[40px] border  p-2  w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {validationErrors.lineAddress && (
                  <span className="text-red-500 text-sm">
                    {validationErrors.lineAddress._errors[0]}
                  </span>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block mt-2 text-sm font-medium text-gray-700"
                >
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block h-[40px] border  p-2  w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces &&
                    provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block mt-2 text-sm font-medium text-gray-700"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block h-[40px] border  p-2  w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {validationErrors.phone && (
                    <span className="text-red-500 text-sm">
                      {validationErrors.phone._errors[0]}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mt-2 text-sm font-medium text-gray-700"
                  >
                    Địa chỉ email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block h-[40px] border  p-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {validationErrors.email && (
                    <span className="text-red-500 text-sm">
                      {validationErrors.email._errors[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid mt-8 gap-2">
                <label
                  htmlFor="notes"
                  className="block mt-2 text-sm font-medium text-gray-700"
                >
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows="4"
                  placeholder="Ghi chú về đơn hàng của bạn"
                ></textarea>

                {/* Payment Options */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="cash"
                      checked={formData.paymentOption === "cash"}
                      onChange={handleChange} // Gọi hàm chung để cập nhật trạng thái
                      className="mr-2"
                    />
                    <label>Thanh toán khi giao hàng</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="vnpay"
                      checked={formData.paymentOption === "vnpay"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label>VNPay</label>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Quy trình thanh toán
              </button>
            </form>
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-6">Đơn hàng của bạn</h1>
            <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Sản Phẩm</span>
                <span className="font-medium text-gray-700">Tổng Phụ</span>
              </div>
              <div className="space-y-2">
                {cartItems &&
                  cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span>
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="flex justify-between border-t pt-4 font-semibold">
                <span>Tổng tiền</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
      </div>
    </LayoutDefault>
  );
}
