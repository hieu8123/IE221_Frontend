"use client";
import { SERVER_URL } from "@/contains";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2"; // Sử dụng Line chart
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // CSS cho DatePicker
import "chartjs-adapter-date-fns"; // Để hỗ trợ trục thời gian

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Đăng ký trục thời gian
);

const RevenueChartByBrand = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate]);

  const fetchRevenueData = async () => {
    const today = new Date();
    let defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let defaultEndDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (!startDate) setStartDate(defaultStartDate);
    if (!endDate) setEndDate(defaultEndDate);

    try {
      const response = await fetch(
        `${SERVER_URL}/statistics/revenue-by-brand?start_date=${
          startDate
            ? startDate.toISOString().split("T")[0]
            : defaultStartDate.toISOString().split("T")[0]
        }&end_date=${
          endDate
            ? endDate.toISOString().split("T")[0]
            : defaultEndDate.toISOString().split("T")[0]
        }`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("Revenue data", data);
      formatChartData(data);
    } catch (error) {
      console.error("Error fetching revenue data", error);
    }
  };

  const formatChartData = (data) => {
    const brands = [...new Set(data.map((item) => item.brand_name))];
    const datasets = brands.map((brand, index) => {
      const brandData = data
        .filter((item) => item.brand_name === brand)
        .map((item) => ({
          x: item.date, // Ngày (trục X)
          y: item.daily_reveneu,
        }));

      const colors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#FF9F40",
        "#4BC0C0",
        "#9966FF",
        "#C9CBCF",
      ];

      return {
        label: brand,
        data: brandData,
        borderColor: colors[index % colors.length], // Màu đường
        backgroundColor: "rgba(0, 0, 0, 0)", // Không tô nền
        tension: 0.4, // Đường cong mượt
        fill: false,
      };
    });

    setRevenueData({
      datasets: datasets,
    });
  };

  if (!revenueData) return null;

  return (
    <div className="">
      <h2>Doanh thu theo thương hiệu (Chọn khoảng thời gian)</h2>
      <div>
        <label>Chọn ngày bắt đầu: </label>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
      <div>
        <label>Chọn ngày kết thúc: </label>
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
      <div>
        <h3>Doanh thu theo thương hiệu</h3>
        <Line
          data={revenueData}
          options={{
            scales: {
              x: {
                type: "time", // Trục thời gian
                time: {
                  unit: "day", // Hiển thị theo ngày
                },
                title: {
                  display: true,
                  text: "Ngày",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Doanh thu (VNĐ)",
                },
              },
            },
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default RevenueChartByBrand;
