"use client";
import { LayoutDefault } from "@/layouts";
import EnhancedCarousel from "@/components/banner";
import Card from "@/components/card/product-card";
import { SERVER_URL } from "@/contains";
import { useEffect, useState } from "react";
import notify from "@/components/notifications";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async (
      page = 1,
      perPage = 8,
      sortBy = "buyturn",
      sortOrder = "desc"
    ) => {
      try {
        // Xây dựng URL với tham số query string
        const url = new URL(`${SERVER_URL}/product/filter`); // Thay thế bằng URL thật của API
        const params = {
          page,
          per_page: perPage,
          sort_by: sortBy, // Sắp xếp theo số lượt mua (buyturn)
          sort_order: sortOrder, // 'desc' để sản phẩm bán chạy nhất lên đầu
        };
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );

        // Gửi yêu cầu GET tới API
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.statusText}`);
        }

        if (response.ok) {
          setFeaturedProducts(data.products); // Trả về danh sách sản phẩm
        } else {
          console.error("Lỗi khi lấy dữ liệu:", data);
          notify("error", "Đã xảy ra lỗi khi lấy dữ liệu");
        }
      } catch (error) {
        console.log("Đã xảy ra lỗi:", error);
        notify("error", "Đã xảy ra lỗi:" + error);
      }
    };

    const fetchNewProducts = async (
      page = 1,
      perPage = 8,
      sortBy = "created_at",
      sortOrder = "desc"
    ) => {
      try {
        // Xây dựng URL với tham số query string
        const url = new URL(`${SERVER_URL}/product/filter`); // Thay thế bằng URL thật của API
        const params = {
          page,
          per_page: perPage,
          sort_by: sortBy, // Sắp xếp theo số lượt mua (buyturn)
          sort_order: sortOrder, // 'desc' để sản phẩm bán chạy nhất lên đầu
        };
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );

        // Gửi yêu cầu GET tới API
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.statusText}`);
        }

        if (response.ok) {
          setNewProducts(data.products); // Trả về danh sách sản phẩm
        } else {
          console.error("Lỗi khi lấy dữ liệu:", data);
          notify("error", "Đã xảy ra lỗi khi lấy dữ liệu");
        }
      } catch (error) {
        console.log("Đã xảy ra lỗi:", error);
        notify("error", "Đã xảy ra lỗi:" + error);
      }
    };

    fetchFeaturedProducts();
    fetchNewProducts();
  }, []);

  return (
    <LayoutDefault>
      <EnhancedCarousel />
      <section className="container mx-auto my-5 px-4 py-8 rounded shadow-slate-400 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 ">
          Sản phẩm nổi bật
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
          {featuredProducts.length != 0 &&
            featuredProducts.map((product) => (
              <li key={product.id} className="mt-4 flex justify-center">
                <Card product={product} />
              </li>
            ))}
        </ul>
      </section>

      <section className="container mx-auto my-5 px-4 py-8 rounded shadow-slate-400 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 ">Sản phẩm mới</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
          {newProducts.length != 0 &&
            newProducts.map((product) => (
              <li key={product.id} className="mt-4 flex justify-center">
                <Card product={product} />
              </li>
            ))}
        </ul>
      </section>
    </LayoutDefault>
  );
}
