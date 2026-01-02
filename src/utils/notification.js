import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Clean White + Red Theme
 */
const baseOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  style: {
    background: "#ffffff",
    color: "#1f2937",
    borderLeft: "6px solid #dc2626", // red
    fontSize: "14px",
    fontWeight: "500",
  },
};

export const notifySuccess = (message) =>
  toast.success(message, {
    ...baseOptions,
    icon: "✅",
  });

export const notifyError = (message) =>
  toast.error(message, {
    ...baseOptions,
    icon: "❌",
  });

export const notifyWarning = (message) =>
  toast.warning(message, {
    ...baseOptions,
    icon: "⚠️",
  });

export const notifyInfo = (message) =>
  toast.info(message, {
    ...baseOptions,
    icon: "ℹ️",
  });
