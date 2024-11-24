import { useState, useEffect } from "react";

/**
 * Custom Hook: useDebounce
 * Trì hoãn việc cập nhật giá trị cho đến khi người dùng ngừng thay đổi trong một khoảng thời gian nhất định.
 *
 * @param value - Giá trị cần debounce.
 * @param delay - Thời gian trì hoãn (ms).
 * @returns Giá trị đã được debounce.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa timeout khi giá trị hoặc delay thay đổi, để tránh chạy không cần thiết
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
