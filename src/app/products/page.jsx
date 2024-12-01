"use client";
import { LayoutDefault } from "@/layouts";
import Card from "@/components/card/product-card";
import { SERVER_URL } from "@/contains";
import { useEffect, useRef, useState } from "react";
import notify from "@/components/notifications";
import SelectDropdown from "@/components/drop-downs/select-drop-down";
import MultiRangeSlider from "@/components/slider/multi-range-slider";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const [filterdProducts, setFilterdProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filter, setFilter] = useState({
    page: 1,
    per_page: 12,
    min_price: 0,
    max_price: 100000000,
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [resetSlider, setResetSlider] = useState(false);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(filter.min_price);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(filter.max_price);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingURL = useRef(false);

  // Lấy các tham số từ URL và đồng bộ với filter khi load trang
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setFilter((prevFilter) => ({
      ...prevFilter,
      ...params,
    }));
  }, [searchParams]);

  // Đồng bộ filter lên URL
  useEffect(() => {
    if (isUpdatingURL.current) return; // Tránh vòng lặp khi đang cập nhật URL

    isUpdatingURL.current = true; // Đánh dấu đang cập nhật URL
    const queryParams = new URLSearchParams(filter).toString();
    router.replace(`/products?${queryParams}`);
    isUpdatingURL.current = false; // Reset lại trạng thái sau khi cập nhật xong
  }, [filter, router]);

  useEffect(() => {
    // Cập nhật debounce sau 0.3s không thay đổi
    const timerMinPrice = setTimeout(() => {
      setFilter((prevFilter) => ({
        ...prevFilter,
        min_price: debouncedMinPrice,
      }));
    }, 300);

    // Cleanup khi component unmount hoặc filter thay đổi
    return () => {
      clearTimeout(timerMinPrice);
    };
  }, [debouncedMinPrice]);

  useEffect(() => {
    // Cập nhật debounce sau 0.3s không thay đổi
    const timerMaxPrice = setTimeout(() => {
      setFilter((prevFilter) => ({
        ...prevFilter,
        max_price: debouncedMaxPrice,
      }));
    }, 300);

    // Cleanup khi component unmount hoặc filter thay đổi
    return () => {
      clearTimeout(timerMaxPrice);
    };
  }, [debouncedMaxPrice]);

  const clearFilter = () => {
    setFilter({
      page: 1,
      per_page: 12,
      min_price: 0,
      max_price: 100000000,
    });

    setSelectedBrand(null);
    setSelectedCategory(null);
    setResetSlider(true);
    setCurrentPage(1);
    setTimeout(() => {
      setResetSlider(false);
    }, 0);
  };

  // Hàm xử lý thay đổi sort
  const handleSortChange = (event) => {
    const selectedValue = event.target.value;
    const [sortBy, sortOrder] = selectedValue.split("-");

    setFilter((prevFilter) => ({
      ...prevFilter,
      sort_by: sortBy,
      sort_order: sortOrder || "asc",
      page: 1,
    }));
  };

  // Hàm xử lý thay đổi giá trị slider
  const handleSliderChange = (values) => {
    setDebouncedMaxPrice(values.max);
    setDebouncedMinPrice(values.min);
  };

  const fetchFilteredProducts = async () => {
    try {
      const queryParams = new URLSearchParams(filter).toString();
      console.log("Query params:", queryParams);
      const response = await fetch(
        `${SERVER_URL}/product/filter?${queryParams}`
      );
      const data = await response.json();
      setFilterdProducts(data.products);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
    } catch (error) {
      console.log("Lỗi khi lấy sản phẩm:", error);
      notify("error", "Đã xảy ra lỗi:" + error);
    }
  };

  useEffect(() => {
    console.log("Filter products:", filterdProducts);
  }, [filterdProducts]);

  // Fetch dữ liệu brands và categories
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/brand`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.statusText}`);
        }
        setBrands(data);
      } catch (error) {
        console.log("Đã xảy ra lỗi:", error);
        notify("error", "Đã xảy ra lỗi:" + error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/category`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.statusText}`);
        }
        setCategories(data);
      } catch (error) {
        console.log("Đã xảy ra lỗi:", error);
        notify("error", "Đã xảy ra lỗi:" + error);
      }
    };

    fetchBrands();
    fetchCategories();
    fetchFilteredProducts();
  }, []);

  // Chỉ fetch sản phẩm khi debouncedFilter thay đổi (tránh vòng lặp vô hạn)
  useEffect(() => {
    if (!filter) return; // Không gọi API nếu không có bộ lọc

    fetchFilteredProducts();
  }, [filter]); // Chỉ khi debouncedFilter thay đổi

  return (
    <LayoutDefault>
      <section className="container grid grid-cols-1 lg:grid-cols-2 rounded shadow-md p-10 mx-auto mt-7 gap-4">
        <div className="">
          <div className="flex justify-start gap-2">
            <SelectDropdown
              data={categories}
              type="category"
              setFilter={setFilter}
              selectedItem={selectedCategory}
              setSelectedItem={setSelectedCategory}
            />
            <SelectDropdown
              data={brands}
              type="brand"
              setFilter={setFilter}
              selectedItem={selectedBrand}
              setSelectedItem={setSelectedBrand}
            />
          </div>
        </div>

        <div className=" max-w-xs flex justify-self-end">
          <select
            id="sort-select"
            onChange={handleSortChange}
            value={
              filter.sort_by && filter.sort_order
                ? filter.sort_by + "-" + filter.sort_order
                : ""
            }
            className="block w-[180px] border border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="">Sắp xếp</option>
            <option value="created_at-desc">Mới nhất</option>
            <option value="created_at-asc">Cũ nhất</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
          </select>
        </div>

        <div className="col-span-2 justify-self-start">
          <MultiRangeSlider
            min={0}
            max={100000000}
            onChange={handleSliderChange}
            reset={resetSlider}
          />
        </div>

        <button
          onClick={clearFilter}
          className="w-40 mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Xóa bộ lọc
        </button>
      </section>

      <section className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 rounded shadow-md p-10 mx-auto mt-7 gap-10">
        {filterdProducts && filterdProducts.length > 0 ? (
          filterdProducts.map((product) => (
            <Card key={product.id} product={product} />
          ))
        ) : (
          <p>Không có sản phẩm nào</p>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="container mx-auto my-10 flex justify-center">
          <nav aria-label="Page navigation example">
            <ul className="flex -space-x-px text-base h-10">
              <li>
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setFilter((prevFilter) => ({
                        ...prevFilter,
                        page: currentPage - 1,
                      }));
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-l"
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }).map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      setFilter((prevFilter) => ({
                        ...prevFilter,
                        page: index + 1,
                      }));
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={`w-[40px] flex justify-center ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border border-gray-300 px-4 py-2`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setFilter((prevFilter) => ({
                        ...prevFilter,
                        page: currentPage + 1,
                      }));
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-r"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </LayoutDefault>
  );
}
