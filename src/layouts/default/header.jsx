"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchableDropdown from "@/components/drop-downs/search-drop-down";
import Image from "next/image";
import useAuth from "@/hooks/use-auth";
import { CiUser } from "react-icons/ci";
import CategoriesDropdown from "@/components/drop-downs/catagories-drop-down";
import { IoIosCart } from "react-icons/io";
import notify from "@/components/notifications";
import { useDispatch, useSelector } from "react-redux";
import { SERVER_URL } from "@/contains";
import { useRouter } from "next/navigation";
import { initializeCart } from "@/redux/cartSlice";

export default function Header() {
  const { checkIsLoggedIn, user, logout, error, ensureTokenValidity } =
    useAuth();
  const isLoggedIn = checkIsLoggedIn();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const cartState = useSelector((state) => state.cart);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  // Đồng bộ giỏ hàng với backend khi load trang
  useEffect(() => {
    const syncCart = async () => {
      const productInCart =
        cartState.cartItems.length > 0
          ? cartState.cartItems.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
            }))
          : [];

      try {
        const response = await fetch(`${SERVER_URL}/cart/sync`, {
          method: "POST", // Hoặc PUT tùy nhu cầu
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_in_cart: productInCart,
          }),
          credentials: "include", // Gửi kèm cookie
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to sync cart");
        }
      } catch (err) {
        console.error("Error syncing cart:", err);
      }
    };

    const handleBeforeUnload = (event) => {
      // Cố gắng thực hiện sync trước khi unload, có thể delay
      syncCart();

      // Dừng hành động unload mặc định
      event.preventDefault();
      event.returnValue = ""; // Cần phải set giá trị này để tránh trình duyệt đóng ngay
    };

    // Thêm sự kiện trước khi unload trang
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router.event, cartState.cartItems, cartState.cartItems.quantity]);

  // kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      if (!ensureTokenValidity()) {
        notify("warning", error);
        logout();
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-400 text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between py-3">
        {/* Left: Logo and Danh mục */}
        <div className="flex w-[100px] items-center space-x-4">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/icons/logo_no_bg.png"
              alt="Logo"
              width={40}
              height={40}
              className="cursor-pointer"
            />
          </Link>
        </div>

        {/* Center: Danh mục */}
        <CategoriesDropdown />

        {/* Center: Search Bar */}
        <SearchableDropdown />

        {/* Right: Icons */}
        <div className="flex items-center justify-end space-x-10 text-sm">
          <Link href="/cart" className="flex items-center space-x-1">
            <IoIosCart className="scale-150" />
            <span className="hidden md:block">Giỏ hàng</span>
          </Link>
          <div className="relative">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="bg-white md:w-[150px] text-black px-3 py-2 rounded-lg flex items-center justify-center gap-4"
                >
                  <CiUser className="scale-150" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <div className="absolute hidden group-hover:block bg-white text-black text-sm p-4 shadow-lg rounded-md mt-2 right-0">
                  Đăng nhập để trải nghiệm mua sắm thuận tiện và dễ dàng hơn
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  ref={userButtonRef}
                  className="bg-white md:w-[150px] text-black px-3 py-2 rounded-lg flex items-center"
                >
                  <CiUser className="scale-150 text-pink-500" />
                  <span className="hidden sm:inline ml-2 text-pink-500">
                    Chào, {user.name}
                  </span>
                </button>
                <div
                  ref={userMenuRef}
                  className={`absolute ${
                    showUserMenu ? "block" : "hidden"
                  } bg-white text-black text-sm p-4 shadow-lg rounded-md mt-2 right-0 z-20`}
                >
                  <ul className="flex flex-col justify-between gap-5">
                    <li className="hover:scale-110 hover:text-blue-500">
                      <Link href="/profile">Hồ sơ cá nhân</Link>
                    </li>
                    <li className="hover:scale-110  hover:text-blue-500">
                      <Link href="/orders">Đơn hàng của tôi</Link>
                    </li>
                    <li className="hover:scale-110  hover:text-blue-500">
                      <button onClick={logout}>Đăng xuất</button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
