"use client";
import Image from "next/legacy/image";
import React, { useState, useEffect } from "react";
import { SERVER_URL } from "@/contains";
import Link from "next/link";
import notify from "../notifications";
import Skeleton from "react-loading-skeleton";

const EnhancedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + banners.length) % banners.length
    );
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const autoSlide = setInterval(nextSlide, 5000);
    return () => clearInterval(autoSlide);
  }, [banners]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${SERVER_URL}/banners`);
        const data = await response.json();
        setBanners(data);
      } catch (error) {
        notify("error", "Error fetching banners");
        console.error("Error fetching banners", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (isLoading) {
    return <Skeleton height={350} count={1} />;
  }

  if (banners.length === 0) {
    return <div>No banners available</div>;
  }

  return (
    <div className="w-ful my-2">
      <div className="relative flex justify-around mx-2  mt-10">
        {/* Container chính với overflow hidden */}
        <div
          className="
       relative overflow-hidden w-[700px] h-[350px] xl:w-[900px] xl:h-[450px] rounded-lg shadow-md"
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 z-10 transform -translate-y-1/2 bg-white/80 text-gray-800 shadow-md rounded-full w-10 h-10 flex justify-center items-center hover:bg-white transition-colors"
          >
            &#8249;
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 z-10 transform -translate-y-1/2 bg-white/80 text-gray-800 shadow-md rounded-full w-10 h-10 flex justify-center items-center hover:bg-white transition-colors"
          >
            &#8250;
          </button>
          {/* Track với width là tổng của tất cả slides */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${banners.length * 100}%`,
              transform: `translateX(-${
                (currentIndex * 100) / banners.length
              }%)`,
            }}
          >
            {banners.map((slide, index) => (
              <div
                key={index}
                className="relative"
                style={{ width: `${100 / banners.length}%` }}
              >
                <Link
                  href={`/product-detail/${slide.product_id}`}
                  className="block p-4"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={slide.image}
                      alt={slide.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg shadow-md"
                      priority={index === 0}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden xl:block w-1/4 xl:w-3/12 xl:h-full">
          <div className="space-y-6 p-4 flex flex-col  justify-between">
            <div className="policy-item p-4 bg-gray-100 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-800">
                Bảo hành tận tâm
              </p>
              <span className="text-sm text-gray-600">
                NowShop luôn cam kết sẽ hỗ trợ khách hàng mọi vấn đề.
              </span>
            </div>
            <div className="policy-item p-4 bg-gray-100 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-800">
                Miễn phí vận chuyển
              </p>
              <span className="text-sm text-gray-600">
                100% đơn hàng đều được miễn phí vận chuyển khi thanh toán trước.
              </span>
            </div>
            <div className="policy-item p-4 bg-gray-100 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-800">
                Đổi trả 1-1 hoặc hoàn tiền
              </p>
              <span className="text-sm text-gray-600">
                Nếu phát sinh lỗi hoặc sản phẩm chưa đáp ứng được nhu cầu.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCarousel;
