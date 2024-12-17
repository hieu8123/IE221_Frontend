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

const RevenueChart = () => {
  const [RevenueDaily, setRevenueDaily] = useState([]);
  const [RevenueMonth, setRevenueMonth] = useState([]);
  const [timePeriod, setTimePeriod] = useState("daily"); // 'week' or 'month'

  // Hàm lấy dữ liệu cho tuần và tháng
  const fetchRevenue = async () => {
    try {
      // Lấy dữ liệu cho top sản phẩm trong tuần
      const dailyResponse = await fetch(
        `${SERVER_URL}/statistics/daily-revenue`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const dailyData = await dailyResponse.json();
      setRevenueDaily(dailyData);

      // Lấy dữ liệu cho top sản phẩm trong tháng
      const monthResponse = await fetch(
        `${SERVER_URL}/statistics/monthly-revenue`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const monthData = await monthResponse.json();
      setRevenueMonth(monthData);
    } catch (error) {
      notify("error", "Failed to fetch top products");
      console.error("Failed to fetch top products", error);
    }
  };

  // Gọi fetchRevenue khi component được render lần đầu
  useEffect(() => {
    fetchRevenue();
  }, []);

  useEffect(() => {
    console.log("RevenueDaily", RevenueDaily);
    console.log("RevenueMonth", RevenueMonth);
  }, [RevenueMonth, RevenueDaily]);
  // Chọn dữ liệu theo thời gian (tuần hoặc tháng)
  const Revenue = timePeriod === "daily" ? RevenueDaily : RevenueMonth;

  // Dữ liệu cho biểu đồ
  const data = {
    labels:
      timePeriod === "daily"
        ? Revenue.map((item) => `${item.day}`) // Dữ liệu theo ngày
        : Revenue.map((item) => `Tháng ${item.month}`), // Dữ liệu theo tháng
    datasets: [
      {
        label:
          timePeriod === "daily"
            ? `Doanh thu theo ngày trong tháng ${new Date().getMonth() + 1}`
            : `Doanh thu theo tháng trong năm ${new Date().getFullYear()}`,
        data: Revenue.map((item) => item.total_revenue),
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
            Math.max(...Revenue.map((product) => product.total_revenue)) +
            10000,
        },
      },
    },
    onClick: () => {
      // Thay đổi trạng thái khi nhấn vào bất kỳ đâu trên biểu đồ
      setTimePeriod(timePeriod === "daily" ? "month" : "daily");
    },
  };

  return (
    <div>
      <h2 className="font-bold">Thống kê doanh thu</h2>
      {/* Biểu đồ */}
      <Bar data={data} options={options} height={100} />
    </div>
  );
};

export default RevenueChart;
