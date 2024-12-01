import { calculateDiscountPercentag, formatPrice } from "@/utils";
import Image from "next/legacy/image";
import Link from "next/link";
import React from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { CiDeliveryTruck } from "react-icons/ci";
import { IoCartOutline } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import notify from "../notifications";

const ProductCard = ({ product }) => {
  const isLoading = Object.keys(product).length === 0; // Kiểm tra product có rỗng không

  const dispatch = useDispatch();
  const error = useSelector((state) => state.cart.error);

  const addToCartHandler = async () => {
    try {
      // Gọi action addToCart
      await dispatch(addToCart({ product: product }));
      notify("success", "Thêm vào giỏ hàng thành công");
    } catch (error) {
      notify("error", "Thêm vào giỏ hàng thất bại.");
    }
  };

  if (isLoading) {
    // Hiển thị skeleton khi đang tải
    return (
      <div className="rounded-lg border w-[300px] h-[550px] border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="h-56 w-full">
          <Skeleton height={224} />
        </div>

        <div className="pt-6">
          <div className="mb-4  gap-4">
            <Skeleton width="100%" />
          </div>
        </div>

        <div className="text-lg font-semibold line-clamp-2 leading-tight text-gray-900 hover:underline dark:text-white">
          <Skeleton width="100%" height={40} />
        </div>

        <div className="pt-6 space-y-3">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
          <Skeleton height={36} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border w-[300px] h-[530px] py-3 border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-56 w-full">
        <Link href="#">
          <Image
            className="mx-auto h-full dark:hidden"
            src={product.images[0]}
            width={250}
            height={224}
            alt={product.name}
          />
        </Link>
      </div>

      <div className="py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          {product.oldprice != product.price ? (
            <span className="me-2 rounded bg-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {calculateDiscountPercentag(product.oldprice, product.price)}% off
            </span>
          ) : (
            <div></div>
          )}

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              data-tooltip-target="tooltip-quick-look"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 "
            >
              <span className="sr-only">Xem nhanh</span>
              <MdOutlineRemoveRedEye />
            </button>
          </div>
        </div>

        <Link
          href={`/product-detail/${product.id}`}
          title={product.name}
          className="text-lg font-semibold text-gray-900 hover:underline overflow-hidden text-ellipsis line-clamp-2"
          style={{ minHeight: "3.5rem" }}
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 ">Lượt mua</p>
          <p className="text-sm font-medium text-gray-500 ">
            {product.buyturn}
          </p>
        </div>

        <div className="mt-4 flex justify-start gap-2">
          <p className="text-xl scale-105 font-extrabold leading-tight text-red-600 ">
            {formatPrice(product.price)}
          </p>
          {product.oldprice != product.price && (
            <p className="text-sm font-medium text-gray-500 line-through">
              {formatPrice(product.oldprice)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={addToCartHandler}
          className="flex justify-center gap-3 items-center w-full rounded-lg bg-blue-700 mt-3 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
        >
          <IoCartOutline />
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
