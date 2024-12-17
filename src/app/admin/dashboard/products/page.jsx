"use client";

import React, { use, useEffect, useState } from "react";
// import Chart from "chart.js/auto";
import { AdminLayout } from "@/layouts";
import { SERVER_URL } from "@/contains";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Pagination,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  ListItemAvatar,
  Avatar,
} from "@mui/material";

import useDebounce from "@/hooks/use-debounce";
import Image from "next/legacy/image";
import ProductModal from "@/components/modals/product-model";
import notify from "@/components/notifications";

const ProductFilter = () => {
  // State lưu trữ danh sách sản phẩm, thông tin phân trang, và bộ lọc
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Bộ lọc
  const [filters, setFilters] = useState({
    name: "",
    min_price: "",
    max_price: "",
    category_id: "",
    brand_id: "",
    sort_by: "",
    sort_order: "asc",
  });

  const debouncedFilters = useDebounce(filters, 500);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/category/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/brand/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands", error);
    }
  };

  // Lấy danh sách sản phẩm từ API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        per_page: 10, // Số sản phẩm mỗi trang
        ...debouncedFilters,
      });

      const response = await fetch(
        `${SERVER_URL}/product/filter?${params.toString()}`
      );
      const data = await response.json();

      setProducts(data.products);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/product/delete/${productId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        notify("success", "Xóa sản phẩm thành công");
        fetchProducts();
        return;
      }

      notify("error", "Xóa sản phẩm thất bại");
      console.log("Failed to delete product", response);
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Gọi API khi trang hoặc bộ lọc thay đổi
  useEffect(() => {
    fetchProducts();
  }, [page, debouncedFilters]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Bộ lọc */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          label="Tên sản phẩm"
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Giá tối thiểu"
          name="min_price"
          value={filters.min_price}
          onChange={handleFilterChange}
          variant="outlined"
          size="small"
          type="number"
        />
        <TextField
          label="Giá tối đa"
          name="max_price"
          value={filters.max_price}
          onChange={handleFilterChange}
          variant="outlined"
          size="small"
          type="number"
        />
        <TextField
          label="Danh mục"
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          select
          variant="outlined"
          size="small"
          className="w-48"
        >
          <MenuItem value="">Tất cả</MenuItem>
          {categories.length > 0 &&
            categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
        </TextField>
        <TextField
          label="Thương hiệu"
          name="brand_id"
          value={filters.brand_id}
          onChange={handleFilterChange}
          select
          variant="outlined"
          size="small"
          className="w-48"
        >
          <MenuItem value="">Tất cả</MenuItem>
          {brands.length > 0 &&
            brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
        </TextField>
        <Button
          variant="contained"
          onClick={() =>
            setFilters({
              name: "",
              min_price: "",
              max_price: "",
              category_id: "",
              brand_id: "",
              sort_by: "",
              sort_order: "asc",
            })
          }
        >
          Xóa bộ lọc
        </Button>
        <Button
          variant="contained"
          className="bg-green-500"
          onClick={() => {
            setOpenModal(true);
            setSelectedProduct(null);
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {products.map((product) => (
            <ListItem
              key={product.id}
              className="flex items-center gap-6 border-b-2"
            >
              {/* Ảnh sản phẩm */}
              <ListItemAvatar>
                <Image
                  alt={product.name}
                  src={product.images[0]} // Giả sử 'images' là mảng chứa các URL ảnh
                  loading="lazy" // Lazy loading ảnh
                  width={100}
                  height={100} // Điều chỉnh kích thước ảnh và cách thức fit ảnh
                />
              </ListItemAvatar>

              {/* Thông tin sản phẩm */}
              <ListItemText
                primary={product.name}
                secondary={`Giá: ${product.price} - Danh mục: ${product.category}`}
                primaryTypographyProps={{ fontWeight: "bold" }} // Định dạng chữ chính
                secondaryTypographyProps={{ fontStyle: "italic" }} // Định dạng chữ phụ
              />

              {/* Nút sửa/xóa */}
              <Button
                className="bg-yellow-500 text-white hover:bg-yellow-600"
                onClick={() => {
                  setOpenModal(true);
                  setSelectedProduct(product);
                }}
              >
                Sửa
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  handleDeleteProduct(product.id);
                }}
              >
                Xóa
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      {/* Phân trang */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />
      <ProductModal
        open={openModal}
        setOpen={setOpenModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedProduct(null);
        }}
        productId={selectedProduct?.id}
        brands={brands}
        categories={categories}
      />
    </Box>
  );
};

const Dashboard = () => {
  return (
    <AdminLayout>
      <ProductFilter />
    </AdminLayout>
  );
};

export default Dashboard;
