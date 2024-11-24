import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoIosMenu } from "react-icons/io";
import { SERVER_URL } from "@/contains";
import notify from "../Notifications";

const CategoriesDropdown = () => {
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/category`);
        const data = await res.json();
        if (res && res.ok) {
          setCatagories(data);
          console.log(data);
          return;
        }
      } catch (err) {
        console.error(err);
        notify("error", err.message || "An error occurred during fetch");
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <div
        className="relative grow-0 flex justify-center"
        ref={categoryButtonRef}
      >
        <button
          onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          className=" text-primary px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <IoIosMenu />
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
                <Image
                  src={category.image}
                  alt={category.name}
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
                <Link
                  href={`/products?category=${categories.id}`}
                  className="text-sm"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CategoriesDropdown;
