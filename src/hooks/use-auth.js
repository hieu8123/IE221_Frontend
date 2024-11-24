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
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Gửi request tới API backend để đăng nhập
      const res = await fetch(`${SERVER_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Lưu thông tin người dùng vào localStorage nếu đăng nhập thành công
        localStorage.setItem(key, JSON.stringify(data.user));
        setUser(data.user); // Cập nhật state người dùng
        setError(null);
        return data.user;
      } else {
        setError(data.error || "Login failed");
        return null;
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
      return null;
    }
  };

  const register = async (email, password, name) => {
    try {
      // Gửi yêu cầu đăng ký đến API backend
      const res = await fetch(`${process.env.SERVER_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }), // Bao gồm cả tên người dùng
      });

      const data = await res.json();

      if (res.ok) {
        // Lưu thông tin người dùng vào localStorage nếu đăng ký thành công
        localStorage.setItem(key, JSON.stringify(data.user)); // Lưu thông tin người dùng vào localStorage
        setUser(data.user); // Cập nhật state người dùng
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

  const logout = () => {
    localStorage.removeItem(key); // Xóa session khỏi localStorage
    setUser(null); // Xóa state người dùng
  };

  const checkIsLoggedIn = () => {
    return !!user; // Kiểm tra xem người dùng đã đăng nhập chưa
  };

  const checkIsAdmin = () => {
    return user?.role === "ADMIN"; // Kiểm tra quyền admin
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
  };
};

export default useAuth;
