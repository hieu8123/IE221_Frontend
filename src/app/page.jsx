import { LayoutDefault } from "@/layouts";
import EnhancedCarousel from "@/components/banner";
import Card from "@/components/card/product-card";
import { SERVER_URL } from "@/contains";
import LoadingSpinner from "@/components/loading";

async function fetchFeaturedProducts() {
  const featuredUrl = new URL(`${SERVER_URL}/product/filter`);
  featuredUrl.searchParams.append("page", "1");
  featuredUrl.searchParams.append("per_page", "8");
  featuredUrl.searchParams.append("sort_by", "buyturn");
  featuredUrl.searchParams.append("sort_order", "desc");

  const featuredResponse = await fetch(featuredUrl, { cache: "no-store" });
  if (!featuredResponse.ok) {
    throw new Error(
      `Error fetching featured products: ${featuredResponse.statusText}`
    );
  }
  const featuredData = await featuredResponse.json();
  return featuredData.products || [];
}

// Hàm để lấy dữ liệu sản phẩm mới
async function fetchNewProducts() {
  const newUrl = new URL(`${SERVER_URL}/product/filter`);
  newUrl.searchParams.append("page", "1");
  newUrl.searchParams.append("per_page", "8");
  newUrl.searchParams.append("sort_by", "created_at");
  newUrl.searchParams.append("sort_order", "desc");

  const newResponse = await fetch(newUrl, { cache: "no-store" });
  if (!newResponse.ok) {
    throw new Error(`Error fetching new products: ${newResponse.statusText}`);
  }
  const newData = await newResponse.json();
  return newData.products || [];
}

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    // Lấy dữ liệu sản phẩm nổi bật và sản phẩm mới
    const [featuredProducts, newProducts] = await Promise.all([
      fetchFeaturedProducts(),
      fetchNewProducts(),
    ]);

    if (!featuredProducts.length && !newProducts.length) {
      return (
        <LayoutDefault>
          <div className="relative h-[80vh]">
            <LoadingSpinner />
          </div>
        </LayoutDefault>
      );
    }

    return (
      <LayoutDefault>
        <EnhancedCarousel />
        <section className="container mx-auto my-5 px-4 py-8 rounded shadow-slate-400 shadow-sm">
          <h2 className="text-3xl font-semibold text-gray-900 ">
            Sản phẩm nổi bật
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
            {featuredProducts.map((product) => (
              <li key={product.id} className="mt-4 flex justify-center">
                <Card product={product} />
              </li>
            ))}
          </ul>
        </section>

        <section className="container mx-auto my-5 px-4 py-8 rounded shadow-slate-400 shadow-sm">
          <h2 className="text-3xl font-semibold text-gray-900 ">
            Sản phẩm mới
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
            {newProducts.map((product) => (
              <li key={product.id} className="mt-4 flex justify-center">
                <Card product={product} />
              </li>
            ))}
          </ul>
        </section>
      </LayoutDefault>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <LayoutDefault>
        <div className="container mx-auto py-6 px-6">
          <p className="text-red-500">Lỗi: Không thể tải dữ liệu sản phẩm.</p>
        </div>
      </LayoutDefault>
    );
  }
}
