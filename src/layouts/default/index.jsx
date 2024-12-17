import Header from "@/layouts/default/header";
import Footer from "@/layouts/default/footer";

export default function LayoutDefault({ children }) {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main>
        {children || (
          <div className="text-center py-10 text-gray-500">
            Không có nội dung hiển thị
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
