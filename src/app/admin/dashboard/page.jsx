"use client";

import React, { useEffect, useState } from "react";
// import Chart from "chart.js/auto";
import Image from "next/legacy/image";
import { AdminLayout } from "@/layouts";
import { SERVER_URL } from "@/contains";
import { formatPrice } from "@/utils";
import TopProductsChart from "@/components/chart/top-product-chart";
import RevenueChart from "@/components/chart/revenue-chart";

const DashboardTab = () => {
  const [overviewData, setOverviewData] = useState(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/statistics/overview`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        console.log("Overview data", data);
        setOverviewData(data);
      } catch (error) {
        console.error("Failed to fetch overview data", error);
      }
    };

    fetchOverviewData();
  }, []);

  if (!overviewData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-5">
          <h3 className="text-gray-400 text-sm flex items-center space-x-2">
            <span>👁️</span>
            <span>Tổng doanh thu</span>
          </h3>
          <h2 className="text-2xl  font-bold">
            {formatPrice(overviewData?.total_revenue)}
          </h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-5">
          <h3 className="text-gray-400 text-sm flex items-center space-x-2">
            <span>🛒</span>
            <span>Tống số đơn hàng</span>
          </h3>
          <h2 className="text-2xl font-bold">{overviewData?.total_orders}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-5">
          <h3 className="text-gray-400 text-sm flex items-center space-x-2">
            <span>🛍️</span>
            <span>Số sản phẩm</span>
          </h3>
          <h2 className="text-2xl font-bold">{overviewData?.total_products}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-5">
          <h3 className="text-gray-400 text-sm flex items-center space-x-2">
            <span>👥</span>
            <span>Số người dùng</span>
          </h3>
          <h2 className="text-2xl font-bold">{overviewData?.total_users}</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <RevenueChart />
        </div>
        <div className="bg-white shadow rounded-lg p-6 ">
          <TopProductsChart />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AdminLayout>
      <DashboardTab />
    </AdminLayout>
  );
};

export default Dashboard;
