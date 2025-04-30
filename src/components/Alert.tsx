import { useEffect, useState } from "react";
import { AiOutlineWarning, AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

interface AlertProps {
  type: "warning" | "error" | "success";
  message: string;
  onClose: () => void;
}

const alertConfig = {
    warning: {
      icon: <AiOutlineWarning/>,
      className: "alert-warning",
    },
    error: {
      icon: <AiOutlineCloseCircle/>,
      className: "alert-error",
    },
    success: {
      icon: <AiOutlineCheckCircle/>,
      className: "alert-success",
    },
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Delay to allow fade-out animation
    }, 5000); // Alert visible for 5 seconds

    return () => clearTimeout(timeout);
  }, [onClose]);

  const { icon, className } = alertConfig[type];

  return (
    <div className={`toast toast-end fixed top-4 right-4 z-50`}>
      <div
        role="alert"
        className={`alert transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        } ${className}`}
      >
        <div className="flex items-center gap-1 font-bold">
          {icon}
          <p className="ml-1">{message}</p>
        </div>
      </div>
    </div>
  );
}