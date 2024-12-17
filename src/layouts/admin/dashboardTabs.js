import {
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaClipboardList,
} from "react-icons/fa";

const dashboardTabs = [
  {
    id: 1,
    name: "Overview",
    path: "/admin/dashboard",
    icon: <FaTachometerAlt />, // Thêm icon Overview
  },
  {
    id: 2,
    name: "Users",
    path: "/admin/dashboard/users",
    icon: <FaUsers />, // Thêm icon Users
  },
  {
    id: 3,
    name: "Products",
    path: "/admin/dashboard/products",
    icon: <FaBox />, // Thêm icon Products
  },
  {
    id: 4,
    name: "Orders",
    path: "/admin/dashboard/orders",
    icon: <FaClipboardList />, // Thêm icon Orders
  },
];

export default dashboardTabs;
