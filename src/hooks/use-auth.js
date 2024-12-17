import { useState, useEffect } from "react";
import { SERVER_URL, USER_STORAGE_KEY as key } from "@/contains";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra session từ localStorage
    const storedUser = JSON.parse(localStorage.getItem(key));

    if (storedUser) {
      const { tokenExpiration } = storedUser;

      // Kiểm tra thời gian hết hạn của token
      const currentTime = Date.now();
      if (currentTime < tokenExpiration) {
        setUser(storedUser);
      } else {
        // Token đã hết hạn, xóa khỏi localStorage và set lại state
        setError("Token expired");
        localStorage.removeItem(key);
      }
    }

    setLoading(false);
  }, []);

  if (typeof window === "undefined") {
    return {
      login: () => {},
      logout: () => {},
      user: null,
      loading: false,
      error: "Hook chỉ chạy trên client-side",
      checkIsLoggedIn: () => false,
      checkIsAdmin: () => false,
      register: () => null,
      ensureTokenValidity: () => false,
    };
  }

  const refreshToken = async () => {
    try {
      // Gửi request để làm mới token
      const res = await fetch(`${SERVER_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Gửi cookie
      });

      const data = await res.json();

      if (res.ok) {
        // Lưu lại token mới và thời gian hết hạn mới vào localStorage
        const expirationTime = Date.now() + 3600000; // 1 giờ nữa
        const userWithNewToken = {
          ...data.user,
          tokenExpiration: expirationTime,
        };
        localStorage.setItem(key, JSON.stringify(userWithNewToken));
        setUser(userWithNewToken); // Cập nhật state người dùng
        setError(null);
        return true;
      } else {
        setError("Failed to refresh token");
        return false;
      }
    } catch (err) {
      setError("An error occurred during token refresh");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      // Gửi request tới API backend để đăng nhập
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Gửi kèm cookie
      });

      const data = await res.json();

      if (res.ok) {
        const expirationTime = Date.now() + 3600000; // Thêm 1 giờ cho token

        // Lưu thông tin người dùng và thời gian hết hạn token vào localStorage
        const userWithExpiration = {
          ...data.user,
          tokenExpiration: expirationTime, // Lưu thời gian hết hạn token
        };
        localStorage.setItem(key, JSON.stringify(userWithExpiration));
        setUser(userWithExpiration); // Cập nhật state người dùng
        setError(null);
        return null;
      } else {
        setError(data.error || "Login failed");
        return data;
      }
    } catch (err) {
      setError("An error occurred during login");
      return err;
    }
  };

  const register = async (email, password, name) => {
    try {
      // Gửi yêu cầu đăng ký đến API backend
      const res = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }), // Bao gồm cả tên người dùng
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        const expirationTime = Date.now() + 3600000; // Thêm 1 giờ cho token

        // Lưu thông tin người dùng và thời gian hết hạn token vào localStorage
        const userWithExpiration = {
          ...data.user,
          tokenExpiration: expirationTime, // Lưu thời gian hết hạn token
        };
        localStorage.setItem(key, JSON.stringify(userWithExpiration));
        setUser(userWithExpiration); // Cập nhật state người dùng
        setError(null); // Xóa thông báo lỗi nếu đăng ký thành công
        return data.user; // Trả về thông tin người dùng
      } else {
        setError(data.error || "Registration failed");
        return null;
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error(err);
      return null;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      localStorage.removeItem(key); // Xóa session khỏi localStorage
      setUser(null); // Xóa state người dùng
      setError(null); // Xóa thông báo lỗi
    } catch (err) {
      setError("An error occurred during logout");
      console.error(err);
    }
  };

  const checkIsLoggedIn = async () => {
    const storedUser = JSON.parse(localStorage.getItem(key));
    return !!storedUser; // Trả về true nếu người dùng có session
  };

  const checkIsAdmin = async () => {
    const storedUser = JSON.parse(localStorage.getItem(key));
    return storedUser?.role === "ROLE_ADMIN"; // Trả về true nếu role là admin
  };

  const ensureTokenValidity = async () => {
    const storedUser = JSON.parse(localStorage.getItem(key));
    if (storedUser) {
      const currentTime = Date.now();
      const tokenExpiration = storedUser.tokenExpiration;

      // Kiểm tra nếu token gần hết hạn (ví dụ 5 phút nữa)
      if (currentTime + 300000 >= tokenExpiration) {
        const isTokenRefreshed = await refreshToken();
        if (isTokenRefreshed) {
          // Token đã được làm mới
          return true;
        }
      }
    }
    return false;
  };

  return {
    login,
    logout,
    user,
    loading,
    error,
    checkIsLoggedIn,
    checkIsAdmin,
    register,
    ensureTokenValidity, // Thêm hàm kiểm tra token
  };
};

export default useAuth;
