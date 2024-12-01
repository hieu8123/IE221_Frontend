export const  calculateDiscountPercentag = (oldPrice, price) =>{
  if (oldPrice <= 0) {
    throw new Error("Giá cũ phải lớn hơn 0.");
  }
  const discount = ((oldPrice - price) / oldPrice) * 100;
  return Math.round(discount * 100) / 100; // Làm tròn đến 2 chữ số thập phân
}

export const formatPrice = (price) => {
  if (price === undefined || price === null) {
    throw new Error("Giá không được để trống.");
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}
