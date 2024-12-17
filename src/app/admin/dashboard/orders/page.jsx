"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { MdDelete, MdError } from "react-icons/md";
import {
  FaBan,
  FaCheckCircle,
  FaCreditCard,
  FaEdit,
  FaHourglassHalf,
} from "react-icons/fa";
import { SERVER_URL } from "@/contains";
import { AdminLayout } from "@/layouts";
import notify from "@/components/notifications";
import { formatPrice } from "@/utils";
import { RiRefund2Fill } from "react-icons/ri";
import OrderDetailAdminModal from "@/components/modals/order-detail-admin-modal";

const getStatusIcon = (status) => {
  switch (status) {
    case "paid":
      return <FaCheckCircle className="mr-2 h-4 w-4 text-green-600" />;
    case "pending":
      return <FaHourglassHalf className="mr-2 h-4 w-4 text-yellow-500" />;
    case "awaiting payment":
      return <FaCreditCard className="mr-2 h-4 w-4 text-blue-500" />;
    case "refund requested":
      return <RiRefund2Fill className="mr-2 h-4 w-4 text-orange-500" />;
    case "refunded":
      return <FaCheckCircle className="mr-2 h-4 w-4 text-blue-500" />;
    case "cancelled":
      return <FaBan className="mr-2 h-4 w-4 text-red-600" />;
    case "error":
      return <MdError className="mr-2 h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]); // Danh sách hóa đơn
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [orderId, setOrderId] = useState(""); // Bộ lọc mã hóa đơn
  const [date, setDate] = useState(""); // Bộ lọc ngày
  const [open, setOpen] = useState(false); // Trạng thái mở hộp thoại
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Hàm lấy danh sách hóa đơn
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/order/get-order?page=${page}&per_page=10&order_id=${orderId}&date=${date}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setOrders(data.orders);
      console.log(data.orders);
      setCurrentPage(data.current_page);
      setTotalPages(data.total_pages);
    } catch (error) {
      notify("error", "Lỗi khi tải danh sách hóa đơn");
      console.error("Lỗi khi tải danh sách hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa hóa đơn
  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/order/delete/${selectedOrder.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        notify("success", "Xóa hóa đơn thành công!");
        fetchOrders(currentPage); // Tải lại danh sách sau khi xóa
      } else {
        notify("error", "Lỗi khi xóa hóa đơn");
        console.error("Lỗi khi xóa hóa đơn:", response);
      }
    } catch (error) {
      notify("error", "Lỗi khi xóa hóa đơn");
      console.error("Lỗi khi xóa hóa đơn:", error);
    } finally {
      handleCloseDialog(); // Đóng dialog sau khi xử lý
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleFilter = () => {
    setCurrentPage(1); // Reset về trang đầu khi lọc
    fetchOrders(1);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Hóa Đơn
      </Typography>

      {/* Bộ lọc */}
      <Box sx={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {/* Lọc theo mã hóa đơn */}
        <TextField
          label="Mã Hóa Đơn"
          variant="outlined"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        {/* Lọc theo ngày */}
        <TextField
          label="Ngày (YYYY-MM-DD)"
          type="date"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {/* Nút lọc */}
        <Button variant="contained" color="primary" onClick={handleFilter}>
          Lọc
        </Button>
      </Box>

      {/* Bảng hiển thị hóa đơn */}
      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : orders?.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user_id}</TableCell>
                  <TableCell>
                    <div className="mt-1.5 inline-flex items-center rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium ">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </TableCell>
                  <TableCell>{order?.note || "không có ghi chú"}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>{order.created_at}</TableCell>
                  <TableCell>{order.updated_at}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenModal(order)}
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <MdDelete className="text-red-500" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có hóa đơn nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      <Pagination
        count={totalPages || 0}
        page={currentPage || 0}
        onChange={handlePageChange}
        color="primary"
      />
      <OrderDetailAdminModal
        open={modalOpen}
        handleClose={handleCloseModal}
        order={selectedOrder}
        currentPage={currentPage}
        fetchOrders={fetchOrders}
      />

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa hóa đơn ID:{" "}
            <strong>{selectedOrder?.id}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const OrderTab = () => {
  return (
    <AdminLayout>
      <OrderManagement />
    </AdminLayout>
  );
};

export default OrderTab;
