import Image from "next/legacy/image";
import { useState, useRef, useEffect } from "react";

export default function SelectDropdown({
  data,
  type,
  setFilter,
  selectedItem,
  setSelectedItem,
}) {
  const [isOpen, setIsOpen] = useState(false); // Trạng thái hiển thị dropdown
  const dropdownRef = useRef(null); // Tham chiếu đến dropdown

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (item) => {
    // Cập nhật bộ lọc theo type
    setFilter((prevFilter) => ({
      ...prevFilter,
      [`${type}_id`]: item.id, // Cập nhật category_id hoặc brand_id dựa vào type
      page: 1, // Reset về trang đầu tiên
    }));
    setSelectedItem(item);
    setIsOpen(false); // Đóng dropdown sau khi chọn
  };

  const handleClickOutside = (event) => {
    // Đóng dropdown nếu click bên ngoài
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Lắng nghe sự kiện click bên ngoài
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup khi component bị unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-[200px] h-[55px]  rounded-xl border bg-white px-4 py-2 text-left"
      >
        {selectedItem ? (
          <div className="flex items-center  gap-2 px-4 py-2 hover:bg-gray-10">
            {selectedItem.image && (
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                width={24}
                height={24}
                className=" rounded-full"
              />
            )}
            <span>{selectedItem.name}</span>
          </div>
        ) : type === "category" ? (
          "Chọn danh mục"
        ) : (
          "Chọn thương hiệu"
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full rounded-xl bg-white border border-gray-300 overflow-hidden shadow-lg z-10">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={24}
                  height={24}
                  className=" rounded-full"
                />
              )}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
