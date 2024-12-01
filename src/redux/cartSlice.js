import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SERVER_URL } from "@/contains";

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

      const existingItem = state.cartItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ product, quantity });
      }

      if (state.isClient) {
        try {
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
        } catch (error) {
          console.error("Failed to save cart to localStorage:", error);
        }
      }
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

export const { initializeCart, addToCart, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
