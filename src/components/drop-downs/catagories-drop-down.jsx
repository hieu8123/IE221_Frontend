import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoIosMenu } from "react-icons/io";
import { SERVER_URL } from "@/contains";
import notify from "../notifications";

const CategoriesDropdown = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [categories, setCategories] = useState([]);

  const categoryMenuRef = useRef(null);
  const categoryButtonRef = useRef(null);

  // Xử lý sự kiện click ngoài menu
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/category`);
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
        } else {
          notify("error", "Failed to fetch categories");
        }
      } catch (err) {
        notify("error", err.message || "An error occurred during fetch");
      }
    };
    fetchCategories();
  }, []);

  const toggleMenu = (e) => {
    setShowCategoryMenu((prev) => !prev);
  };

  return (
    <div className="relative w-[150px] flex justify-center">
      {/* Nút mở menu */}
      <button
        onClick={toggleMenu}
        className="text-primary px-4 py-2 rounded-lg flex items-center space-x-2"
        ref={categoryButtonRef}
      >
        <IoIosMenu />
        <span>Danh mục</span>
      </button>

      {/* Dropdown */}
      <div
        ref={categoryMenuRef}
        className={`absolute left-1/2 transform -translate-x-1/2 top-full bg-white text-black shadow-lg mt-1 w-64 z-50 rounded-lg overflow-hidden ${
          showCategoryMenu ? "block" : "hidden"
        }`}
      >
        <ul>
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-100"
            >
              <Image
                src={category.image}
                alt={category.name}
                width={20}
                height={20}
                className="cursor-pointer"
              />
              <Link
                href={`/products?category_id=${category.id}`}
                className="text-sm w-full h-full"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoriesDropdown;
