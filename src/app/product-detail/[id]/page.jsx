import dynamic from "next/dynamic";
import { LayoutDefault } from "@/layouts";
import LoadingSpinner from "@/components/loading";
import { SERVER_URL } from "@/contains";

// Dynamic import ProductDetailClient (client-side component)
const ProductDetailClient = dynamic(() => import("./ProductDetailClient"), {
  loading: () => (
    <LayoutDefault>
      <div className="relative h-[80vh]">
        <LoadingSpinner />
      </div>
    </LayoutDefault>
  ),
});

// Fetch data tại Server Component
export default async function ProductDetailPage({ params }) {
  const { id } = params;

  try {
    // Fetch dữ liệu server-side
    const [productResponse, relatedResponse] = await Promise.all([
      fetch(`${SERVER_URL}/product/${id}`, { next: { revalidate: 10 } }),
      fetch(`${SERVER_URL}/product/${id}/recommend`, {
        next: { revalidate: 10 },
      }),
    ]);

    if (!productResponse.ok || !relatedResponse.ok) {
      throw new Error("Failed to fetch data");
    }

    const [product, relatedProducts] = await Promise.all([
      productResponse.json(),
      relatedResponse.json(),
    ]);

    // Render Layout và Client Component
    return (
      <LayoutDefault>
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </LayoutDefault>
    );
  } catch (error) {
    console.error("Error fetching data:", error);

    // Trường hợp lỗi khi fetch
    return (
      <LayoutDefault>
        <div className="relative h-[80vh]">
          <LoadingSpinner />
          <p className="text-center text-red-500 mt-4">
            Không thể tải dữ liệu. Vui lòng thử lại sau!
          </p>
        </div>
      </LayoutDefault>
    );
  }
}
