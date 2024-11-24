"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useAuth from "@/hooks/use-auth";
import { CiSearch } from "react-icons/ci";
import useDebounce from "@/hooks/use-debounce";

const categories = [
  {
    icon: "📱",
    name: "Điện thoại, Tablet",
    href: "/danh-muc/dien-thoai-tablet",
  },
  { icon: "💻", name: "Laptop", href: "/danh-muc/laptop" },
  { icon: "🎧", name: "Âm thanh", href: "/danh-muc/am-thanh" },
  { icon: "⌚", name: "Đồng hồ, Camera", href: "/danh-muc/dong-ho-camera" },
  { icon: "🏠", name: "Đồ gia dụng", href: "/danh-muc/do-gia-dung" },
];

export default function Header() {
  const { checkIsLoggedIn, user, logout } = useAuth();
  const isLoggedIn = checkIsLoggedIn();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const categoryMenuRef = useRef(null); // Tạo ref cho menu Danh mục
  const categoryButtonRef = useRef(null); // Tạo ref cho button Danh mục
  const [inputValue, setInputValue] = useState(""); // Giá trị người dùng nhập vào
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Hàm xử lý việc đóng dropdown khi người dùng click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target)
      ) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("Debounced value: ", debouncedInputValue);
  }, [debouncedInputValue]);

  const handleSearch = () => {
    console.log("Searching...", inputValue);
  };

  return (
    <header className="bg-blue-400 text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between py-3">
        {/* Left: Logo and Danh mục */}
        <div className="flex items-center space-x-4">
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

          {/* Danh mục Button */}
          <div className="relative" ref={categoryButtonRef}>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className=" text-primary px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>📂</span>
              <span>Danh mục</span>
            </button>

            {/* Dropdown Menu */}
            <div
              ref={categoryMenuRef}
              className={`${
                showCategoryMenu ? "block" : "hidden"
              } absolute left-0 top-full bg-white text-black shadow-lg mt-1 w-64 z-50 rounded-lg overflow-hidden`}
            >
              <ul>
                {categories.map((category, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-100"
                  >
                    <span>{category.icon}</span>
                    <Link href={category.href} className="text-sm">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-grow max-w-lg mx-4">
          <input
            type="text"
            placeholder="Bạn cần tìm gì?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full px-4 py-2 rounded-lg focus:outline-none text-black"
          />
          <button
            className="absolute top-1/2  transform -translate-y-1/2 right-2"
            onClick={handleSearch}
          >
            <CiSearch className="scale-150  text-gray-500" />
          </button>
        </div>
        {/* Right: Icons */}
        <div className="flex items-center space-x-4 text-sm">
          <a href="#" className="hidden sm:flex items-center space-x-1">
            <span>📦</span>
            <span>Tra cứu đơn hàng</span>
          </a>
          <a href="#" className="flex items-center space-x-1">
            <span>🛒</span>
            <span>Giỏ hàng</span>
          </a>
          <div className="relative group">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="bg-white text-black px-3 py-2 rounded-lg flex items-center"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <div className="absolute hidden group-hover:block bg-white text-black text-sm p-4 shadow-lg rounded-md mt-2 right-0">
                  Đăng nhập để trải nghiệm mua sắm thuận tiện và dễ dàng hơn
                </div>
              </>
            ) : (
              <>
                <button className="bg-white text-black px-3 py-2 rounded-lg flex items-center">
                  <span>👤</span>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <div className="absolute hidden group-hover:block bg-white text-black text-sm p-4 shadow-lg rounded-md mt-2 right-0">
                  <ul>
                    <li>
                      <Link href="/profile">Hồ sơ cá nhân</Link>
                    </li>
                    <li>
                      <Link href="/orders">Đơn hàng của tôi</Link>
                    </li>
                    <li>
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
