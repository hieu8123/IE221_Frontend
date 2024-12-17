import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { MdMoneyOff } from "react-icons/md";
import { SERVER_URL } from "@/contains";
import notify from "../notifications";

const getValidStatuses = (currentStatus) => {
  switch (currentStatus) {
    case "pending":
      return ["paid", "cancelled", "awaiting payment", "cancelled", "error"]; // Allow transition to paid or cancelled
    case "paid":
      return ["paid", "refund requested"]; // Only allow refund request
    case "refund requested":
      return ["refund requested", "refunded", "cancelled", "error"]; // Refund can transition to refunded, cancelled, or error
    case "refunded":
      return ["refunded"]; // No valid transitions from refunded
    case "cancelled":
      return ["cancelled"]; // No valid transitions from cancelled
    case "error":
      return ["error"]; // No valid transitions from cancelled or error
    default:
      return ["paid"]; // Default to paid if no valid status
  }
};

const OrderDetailModal = ({
  open,
  handleClose,
  order,
  currentPage,
  fetchOrders,
}) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [status, setStatus] = useState(order?.status || "");
  const [note, setNote] = useState(order?.note || "");

  useEffect(() => {
    if (order) {
      setOrderDetails(order.order_details);
      setStatus(order.status);
      setNote(order.note || "");
    }
  }, [order]);

  const handleRefund = async (orderId) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/payment/vnpay/refund/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        notify("success", "Hoàn tiền thành công");
        fetchOrders(currentPage); // Refresh orders after refund
        handleClose(); // Close the modal after refund
      } else {
        notify("error", "Lỗi khi hoàn tiền");
      }
    } catch (error) {
      console.error("Lỗi khi hoàn tiền:", error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/order/update/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          note,
        }),
        credentials: "include",
      });
      if (response.ok) {
        notify("success", "Cập nhật trạng thái thành công");
        fetchOrders(currentPage); // Refresh orders after update
        handleClose(); // Close the modal after update
      } else {
        notify("error", "Lỗi khi cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Chi Tiết Hóa Đơn ID: {order?.id}</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Thông tin đơn hàng:</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">Trạng thái: {order?.status}</Typography>
            <Typography variant="body1">Ghi chú: </Typography>
            <textarea
              rows="4"
              style={{ width: "100%" }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Typography variant="body1">
              Tổng tiền: {order?.total.toLocaleString()} VND
            </Typography>
            <Typography variant="body1">
              Ngày tạo: {new Date(order?.created_at).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              Ngày cập nhật: {new Date(order?.updated_at).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            {order?.transaction_id && (
              <Typography variant="body1">
                Mã giao dịch: {order?.transaction_id}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Typography variant="h6" style={{ marginTop: "20px" }}>
          Chi tiết sản phẩm:
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="right">Giá</TableCell>
                <TableCell align="right">Số lượng</TableCell>
                <TableCell align="right">Tổng giá</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.product_id}</TableCell>
                  <TableCell align="right">
                    {detail.price.toLocaleString()} VND
                  </TableCell>
                  <TableCell align="right">{detail.quantity}</TableCell>
                  <TableCell align="right">
                    {(detail.price * detail.quantity).toLocaleString()} VND
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Cập nhật trạng thái */}
        <FormControl fullWidth style={{ marginTop: "20px" }}>
          <InputLabel id="status-label">Trạng thái</InputLabel>
          <Select
            labelId="status-label"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Trạng thái"
          >
            {getValidStatuses(order?.status).map((validStatus) => (
              <MenuItem key={validStatus} value={validStatus}>
                {validStatus}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        {order?.status === "refund requested" && order?.transaction_id && (
          <Button
            variant="outlined"
            startIcon={<MdMoneyOff />}
            color="error"
            onClick={() => handleRefund(order.id)}
          >
            Hoàn tiền
          </Button>
        )}
        <Button onClick={handleUpdateStatus} color="primary">
          Cập nhật trạng thái
        </Button>
        <Button onClick={handleClose} color="secondary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
