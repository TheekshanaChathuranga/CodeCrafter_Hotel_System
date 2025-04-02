import React from "react";

const Popup = ({ message, type, onClose }) => {
  if (!message) return null;

  const typeStyles = {
    success: "bg-blue-600",
    error: "bg-red-600",
    warning: "bg-yellow-500",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 transition-opacity duration-300">
      <div
        className={`rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100 hover:scale-105 ${
          typeStyles[type] || "bg-blue-500"
        } text-white border-2 border-opacity-30 border-white`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold tracking-wide">
            {type === "success" ? "Success 🎉" : type === "error" ? "Error ⚠️" : "Warning ⚠️"}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-semibold">
            ✕
          </button>
        </div>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition duration-200 shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;