import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SERVER_URL } from "@/contains";
import notify from "@/components/notifications";

// Helper: Lấy dữ liệu giỏ hàng từ localStorage chỉ trên client
const getInitialCartState = () => {
  if (typeof window !== "undefined") {
    try {
      const cartData = JSON.parse(localStorage.getItem("cart"));
      return Array.isArray(cartData) ? cartData : [];
    } catch (error) {
      console.error("Error parsing cart data from localStorage:", error);
    }
  }
  return []; // Trả về mảng rỗng nếu không chạy trên client hoặc có lỗi
};

const initialState = {
  cartItems: [], // Khởi tạo giỏ hàng rỗng
  addToCartStatus: null, // Trạng thái thêm sản phẩm vào giỏ
  isClient: false, // Đánh dấu nếu đang ở môi trường client
  error: null, // Lỗi khi thêm sản phẩm vào giỏ
};

// Thunk: Tải giỏ hàng từ backend
export const fetchCartFromBackend = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${SERVER_URL}/cart/user`, {
        method: "GET",
        credentials: "include", // Gửi kèm cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart");
      }

      const data = await response.json();
      const cartItems = data.map((cart) => ({
        id: cart.id,
        quantity: cart.quantity,
        product: cart.product,
      }));

      return { cartItems };
    } catch (error) {
      state.cartItems = [];
      return rejectWithValue(
        error.message || "Error fetching cart from backend"
      );
    }
  }
);

// Thunk: Đồng bộ giỏ hàng với backend
export const syncCartToBackend = createAsyncThunk(
  "cart/syncCart",
  async (cartState, { rejectWithValue }) => {
    try {
      const response = await fetch(`${SERVER_URL}/cart/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_in_cart: cartState.cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
        credentials: "include",
      });

      console.log("sync is running");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sync cart");
      }

      return true;
    } catch (error) {
      return rejectWithValue(error.message || "Error syncing cart to backend");
    }
  }
);

// Slice giỏ hàng
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initializeCart: (state) => {
      // Lấy giỏ hàng từ localStorage chỉ trên client
      if (typeof window !== "undefined") {
        try {
          const cartData = JSON.parse(localStorage.getItem("cart"));
          state.cartItems = Array.isArray(cartData) ? cartData : [];
        } catch (error) {
          console.error("Error initializing cart from localStorage:", error);
          state.cartItems = [];
        }
      }
      state.isClient = true; // Đánh dấu rằng đã chạy trên client
    },

    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;

      // Reset trạng thái trước khi thực hiện
      state.addToCartStatus = "idle";
      state.error = null;

      // Kiểm tra số lượng sản phẩm
      if (quantity > product.quantity) {
        state.addToCartStatus = "failed";
        state.error = `Số lượng sản phẩm "${product.name}" không đủ!`;
        notify("error", state.error);
        return;
      }

      // Cập nhật hoặc thêm sản phẩm mới vào giỏ
      const existingItem = state.cartItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > product.quantity) {
          state.addToCartStatus = "failed";
          state.error = `Số lượng sản phẩm "${product.name}" không đủ!`;
          notify("error", state.error);
          return;
        }
        // Nếu đủ, tăng số lượng sản phẩm
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ product, quantity });
      }

      // Đánh dấu thành công
      state.addToCartStatus = "success";
      state.error = null;
      notify("success", "Đã thêm sản phẩm vào giỏ hàng");

      // Cập nhật giỏ hàng trong localStorage nếu client
      if (state.isClient) {
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch (error) {
          console.error("Failed to save cart to localStorage:", error);
        }
      }

      return;
    },
    updateCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;

      // Reset trạng thái trước khi thực hiện
      state.addToCartStatus = "idle";
      state.error = null;

      // Kiểm tra số lượng sản phẩm
      const existingItem = state.cartItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > product.quantity) {
          state.addToCartStatus = "failed";
          state.error = `Số lượng sản phẩm "${product.name}" không đủ!`;
          notify("error", state.error);
          return;
        }
        // Nếu đủ, tăng số lượng sản phẩm
        existingItem.quantity += quantity;
      } else {
        notify("error", "Sản phẩm không tồn tại trong giỏ hàng");
      }

      // Đánh dấu thành công
      state.addToCartStatus = "success";
      state.error = null;

      // Cập nhật giỏ hàng trong localStorage nếu client
      if (state.isClient) {
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch (error) {
          console.error("Failed to save cart to localStorage:", error);
        }
      }

      return;
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;

      state.cartItems = state.cartItems.filter(
        (item) => item.product.id !== productId
      );

      if (state.isClient) {
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch (error) {
          console.error("Failed to save cart to localStorage:", error);
        }
      }
    },

    clearCart: (state) => {
      state.cartItems = [];

      if (state.isClient) {
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch (error) {
          console.error("Failed to clear cart in localStorage:", error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCartFromBackend.fulfilled, (state, action) => {
      state.cartItems = action.payload.cartItems;

      if (state.isClient) {
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch (error) {
          console.error("Failed to save fetched cart to localStorage:", error);
        }
      }
    });
  },
});

export const {
  initializeCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
