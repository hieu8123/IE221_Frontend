"use client";
import { useEffect, useState } from "react";
import Image from "next/legacy/image";
import ProductCard from "@/components/card/product-card";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import "./product-detail.css";
import { formatPrice } from "@/utils";

const ProductDetailClient = ({ product, relatedProducts }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isImageChanging, setIsImageChanging] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatch = useDispatch();

  const addToCartHandler = () => {
    dispatch(addToCart({ product: product, quantity: quantity }));
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <main className="container mx-auto py-6 px-6">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 space-y-4">
          <div className="border border-gray-300 rounded flex justify-center items-center">
            <Image
              src={product.images[currentImage]}
              width={400}
              height={400}
              alt={product.name}
              className={`transition-opacity duration-1000 ease-in-out ${
                isImageChanging ? "opacity-0" : "opacity-100"
              }`} // Fade effect on image change
              onLoadingComplete={() => setIsImageChanging(false)}
            />
          </div>

          <div className="w-full h-[90px] overflow-y-scroll flex justify-center space-x-4">
            {product.images.map((image, index) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImage(index);
                    setIsImageChanging(true);
                  }}
                  className={`w-20 h-20 border border-gray-300 rounded
                      ${currentImage === index ? "border-orange-500" : ""}`}
                >
                  <Image
                    src={image}
                    width={80}
                    height={80}
                    alt={product.name}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:w-2/3 lg:ml-8">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="text-orange-500 text-3xl font-semibold mt-4">
            {formatPrice(product.price)}
          </div>
          <div className="text-gray-400 line-through">
            {formatPrice(product.oldprice)}
          </div>

          <ul className="text-gray-700 mt-4 space-y-2">
            <li>
              <span className="font-bold">Hãng sản xuất:</span> {product.brand}
            </li>
            <li>
              <span className="font-bold">Bảo hành:</span> 2 năm
            </li>
            <li>
              <span className="font-bold">Giao hàng:</span> 2-4 ngày
            </li>
            <li>
              <span className="font-bold">Tình trạng:</span>{" "}
              {product.quantity > 0
                ? `Còn hàng(${product.quantity} sản phẩm)`
                : "Hết hàng"}
            </li>
          </ul>

          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center border border-gray-300 rounded">
              <button
                disabled={quantity === 1}
                onClick={() => setQuantity(quantity - 1)}
                className="px-4 py-2"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-12 text-center border-l border-r border-gray-300"
              />
              <button
                disabled={quantity === product.quantity}
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2"
              >
                +
              </button>
            </div>
            <button
              disabled={product.quantity === 0}
              onClick={addToCartHandler}
              className="bg-orange-500 text-white px-6 py-2 rounded"
            >
              THÊM GIỎ HÀNG
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="relative bg-white lg:col-span-2 shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
          <div className="w-full h-[4px] mb-3 bg-orange-500"></div>
          <div className="relative flex justify-center items-center">
            <div
              dangerouslySetInnerHTML={{
                __html: isExpanded
                  ? product.description
                  : product.description.slice(0, 1000),
              }}
              className="prose text-justify w-full max-w-2xl space-y-4"
            />
            {/* Overlay mờ dần từ trên xuống dưới khi thu gọn */}
            {!isExpanded && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10" />
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)} // Đổi trạng thái khi nhấn vào nút
            className={`
                ${
                  isExpanded
                    ? "mx-auto block"
                    : "absolute bottom-10 left-1/2 -translate-x-1/2  z-20"
                } p-2 bg-white  border rounded border-orange-300 text-blue-500 mt-2`}
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>

        {/* Specifications */}
        <div className="bg-white shadow rounded-lg py-4 px-1">
          <h2 className="text-xl font-semibold mb-2">Thông số kỹ thuật</h2>
          <div className="w-full h-[4px] mb-3 bg-orange-500"></div>
          <div className="w-full overflow-x-auto">
            <div
              className="prose specification-container"
              dangerouslySetInnerHTML={{
                __html: product.specification,
              }}
            ></div>
          </div>
        </div>
      </div>
      <section className="container mx-auto my-5 px-4 py-8 rounded shadow-slate-400 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 ">
          Sản phẩm liên quan
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
          {relatedProducts.length != 0 &&
            relatedProducts.map((product) => (
              <li key={product.id} className="mt-4 flex justify-center">
                <ProductCard product={product} />
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
};

export default ProductDetailClient;
