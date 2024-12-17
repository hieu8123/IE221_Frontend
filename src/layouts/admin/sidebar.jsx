"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dashboardTabs from "./dashboardTabs";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const [isFull, setIsFull] = useState(true);
  console.log(pathname);

  return (
    <aside className="relative w-64 h-full min-h-[100vh] bg-gray-900 text-white">
      <button
        onClick={() => setIsFull(!isFull)}
        className="absolute top-[50px] right-0 translate-x-1/2 bg-blue-600 p-2 rounded-full"
      >
        {isFull ? <FaArrowLeft /> : <FaArrowRight />}
      </button>

      <div className="p-4 text-center text-xl font-bold border-b border-gray-800">
        <span className="text-blue-500">Hiếu Store </span> Admin
      </div>
      <nav className="py-4 flex flex-col my-5">
        {dashboardTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={
              `${
                tab.path == pathname ? "bg-blue-500 text-white" : ""
              } p-4 rounded-lg cursor-pointer flex gap-3 items-center` + " mb-2"
            }
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
