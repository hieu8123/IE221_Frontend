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
} from "chart.js";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChartByCategories = () => {
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

    // Ensure startDate and endDate are in the correct format
    const formattedStartDate = startDate
      ? startDate.toISOString().split("T")[0]
      : defaultStartDate.toISOString().split("T")[0];
    const formattedEndDate = endDate
      ? endDate.toISOString().split("T")[0]
      : defaultEndDate.toISOString().split("T")[0];

    try {
      const response = await fetch(
        `${SERVER_URL}/statistics/revenue-by-category?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("Revenue data categories", data);
      formatChartData(data);
    } catch (error) {
      console.error("Error fetching revenue data", error);
    }
  };

  const formatChartData = (data) => {
    // Extract unique dates and sort them
    const allDates = new Set();
    data.forEach((item) => {
      item.daily_revenue.forEach((entry) => allDates.add(entry.date));
    });

    // Convert all dates to strings (if necessary) and sort them
    const sortedDates = Array.from(allDates)
      .map((date) => new Date(date).toISOString().split("T")[0])
      .sort();

    // Build datasets for each category
    const datasets = data.map((item, index) => {
      const colorPalette = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#FF9F40",
        "#4BC0C0",
        "#9966FF",
        "#C9CBCF",
        "#8e5ea2",
        "#3cba9f",
        "#e8c3b9",
      ];

      // Map each date to its corresponding revenue
      const revenueMap = item.daily_revenue.reduce((acc, entry) => {
        acc[entry.date] = entry.revenue;
        return acc;
      }, {});

      // Create data points for each date
      const dataPoints = sortedDates.map((date) => revenueMap[date] || 0);

      return {
        label: item.category_name,
        data: dataPoints,
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length],
        tension: 0.4,
      };
    });

    setRevenueData({
      labels: sortedDates,
      datasets: datasets,
    });
  };

  if (!revenueData) return null;

  return (
    <div className="relative">
      <h2>Doanh thu theo loại sản phẩm (Chọn khoảng thời gian)</h2>
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
        <h3>Doanh thu theo thời gian</h3>
        <Line data={revenueData} />
      </div>
    </div>
  );
};

export default RevenueChartByCategories;
