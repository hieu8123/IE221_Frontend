import { toast } from "react-toastify";

let toastCounter = 0;

const notify = (type, message) => {
  const toastId = `toast-${toastCounter++}`;
  toast[type](message, {
    toastId, // Mỗi thông báo có một ID duy nhất
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    pauseOnFocusLoss: false,
  });
};

export default notify;
