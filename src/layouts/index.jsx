"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/use-auth";
import Footer from "@/layouts/default/footer";
import Header from "@/layouts/default/header";

export default function LayoutWithRole({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const { checkIsAdmin } = useAuth();

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
  }, []); // Chỉ chạy trên client sau khi component được tải

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      {/* Header */}
      {isAdmin ? <Header /> : <Header />}

      {/* Main Content */}
      <main>
        {children || (
          <div className="text-center py-10 text-gray-500">
            Không có nội dung hiển thị
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
