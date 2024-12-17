"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import notify from "@/components/notifications";
import { SERVER_URL } from "@/contains";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsChart = () => {
  const [topProductsWeek, setTopProductsWeek] = useState([]);
  const [topProductsMonth, setTopProductsMonth] = useState([]);
  const [timePeriod, setTimePeriod] = useState("week"); // 'week' or 'month'

  // Hàm lấy dữ liệu cho tuần và tháng
  const fetchTopProducts = async () => {
    try {
      // Lấy dữ liệu cho top sản phẩm trong tuần
      const weekResponse = await fetch(
        `${SERVER_URL}/statistics/top-products-of-week`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const weekData = await weekResponse.json();
      setTopProductsWeek(weekData);

      // Lấy dữ liệu cho top sản phẩm trong tháng
      const monthResponse = await fetch(
        `${SERVER_URL}/statistics/top-products-of-month`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const monthData = await monthResponse.json();
      setTopProductsMonth(monthData);
    } catch (error) {
      notify("error", "Failed to fetch top products");
      console.error("Failed to fetch top products", error);
    }
  };

  // Gọi fetchTopProducts khi component được render lần đầu
  useEffect(() => {
    fetchTopProducts();
  }, []);

  // Chọn dữ liệu theo thời gian (tuần hoặc tháng)
  const topProducts =
    timePeriod === "week" ? topProductsWeek : topProductsMonth;

  // Dữ liệu cho biểu đồ
  const data = {
    labels: topProducts.map((product) => product.product_name),
    datasets: [
      {
        label:
          timePeriod === "week"
            ? "Top Sản phẩm trong tuần"
            : "Top Sản phẩm trong tháng",
        data: topProducts.map((product) => product.total_revenue),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  // Các tùy chọn biểu đồ
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5000, // Điều chỉnh bước nhảy
          max:
            Math.max(...topProducts.map((product) => product.total_revenue)) +
            10000,
        },
      },
    },
    onClick: () => {
      // Thay đổi trạng thái khi nhấn vào bất kỳ đâu trên biểu đồ
      setTimePeriod(timePeriod === "week" ? "month" : "week");
    },
  };

  return (
    <div>
      <h2 className="font-bold">Top sản phẩm</h2>

      {/* Biểu đồ */}
      <Bar data={data} options={options} height={100} />
    </div>
  );
};

export default TopProductsChart;
