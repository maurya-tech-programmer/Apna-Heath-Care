import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const getStyleAndIcon = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50 border-red-100 text-red-800",
          icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" id="toast-icon-error" />,
        };
      case "info":
        return {
          bg: "bg-blue-50 border-blue-100 text-blue-800",
          icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" id="toast-icon-info" />,
        };
      case "success":
      default:
        return {
          bg: "bg-emerald-50 border-emerald-100 text-emerald-800",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" id="toast-icon-success" />,
        };
    }
  };

  const { bg, icon } = getStyleAndIcon();

  return (
    <AnimatePresence>
      <div className="fixed bottom-5 right-5 z-55 max-w-sm w-full p-1" id="toast-portal">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${bg}`}
          id="toast-container"
        >
          {icon}
          <div className="flex-1" id="toast-body">
            <p className="text-xs font-bold leading-tight" id="toast-msg">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-black/5 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close toast notification"
            id="toast-close-btn"
          >
            <X className="w-4 h-4" id="toast-close-icon" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
