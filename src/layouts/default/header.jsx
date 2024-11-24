"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchableDropdown from "@/components/drop-downs/search-drop-down";
import Image from "next/image";
import useAuth from "@/hooks/use-auth";
import { IoIosMenu } from "react-icons/io";
import "tippy.js/dist/tippy.css";
import CategoriesDropdown from "@/components/drop-downs/catagories-drop-down";

export default function Header() {
  const { checkIsLoggedIn, user, logout } = useAuth();
  const isLoggedIn = checkIsLoggedIn();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [categories, setCatagories] = useState([]);

  const categoryMenuRef = useRef(null); // Tạo ref cho menu Danh mục
  const categoryButtonRef = useRef(null); // Tạo ref cho button Danh mục
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
        </div>

        {/* Center: Danh mục */}
        <CategoriesDropdown />

        {/* Center: Search Bar */}
        <SearchableDropdown />

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
