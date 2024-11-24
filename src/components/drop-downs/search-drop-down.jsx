import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import useDebounce from "@/hooks/use-debounce";
import { SERVER_URL } from "@/contains";

const SearchableDropdown = () => {
  const [inputValue, setInputValue] = useState(""); // Input value
  const [showResult, setShowResult] = useState(false); // To show/hide the result
  const [filteredData, setFilteredData] = useState([]);
  const inputRef = useRef(null); // Reference for the input element

  const debouncedInputValue = useDebounce(inputValue, 500);

  // Filter search data based on input value
  useEffect(() => {
    const search = async () => {
      try {
        const res = await fetch(
          `${SERVER_URL}/product/filter?name=${debouncedInputValue}`
        );
        const data = await res.json();
        if (res && res.ok) {
          console.log(data.products);
          setFilteredData(data.products);
          setShowResult(true);
          return;
        }
      } catch (err) {
        console.error(err);
        setShowResult(false);
        notify("error", err.message || "An error occurred during fetch");
      }
    };

    if (!debouncedInputValue) {
      setFilteredData([]);
      setShowResult(false);
      return;
    }

    search();
  }, [debouncedInputValue]);

  // Handle input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle focus on the input field
  const handleFocus = () => {
    if (inputValue) {
      setShowResult(true); // Show results when input has value
    }
  };

  // Handle click outside to close the dropdown
  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setShowResult(false);
    }
  };

  useEffect(() => {
    // Close dropdown if clicked outside the input
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus} // Show dropdown when input is focused
        className="w-full px-4 py-2 rounded-lg text-gray-800 border border-gray-300"
        placeholder="Tìm kiếm sản phẩm..."
      />

      {/* Dropdown results */}
      {showResult && filteredData.length > 0 && (
        <div className="absolute left-0 top-full w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto z-10">
          <div>
            {filteredData.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`}>
                <div className="flex items-center py-3 px-4 hover:bg-gray-100">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    height={40}
                    width={40}
                    quality={50}
                    priority
                    className="mr-3"
                  />
                  <span className=" ml-3 text-gray-700">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No results found */}
      {showResult && filteredData.length === 0 && (
        <div className="absolute left-0 top-full w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto z-10">
          <div className="py-3 px-4 text-gray-500">Không có kết quả nào</div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
