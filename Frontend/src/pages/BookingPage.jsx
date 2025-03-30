import { useState } from "react";
import { useNavigate } from "react-router-dom";

const roomsData = [
  { id: 1, type: "Single Room", guests: "👤", oldPrice: 25000, newPrice: 12500, tax: 1200, meal: "Breakfast LKR 1,500", refundable: false },
  { id: 2, type: "Double Room (AC)", guests: "👥", oldPrice: 45000, newPrice: 22500, tax: 1800, meal: "Very good breakfast included", refundable: false },
  { id: 3, type: "Double Room (Non-AC)", guests: "👥", oldPrice: 40000, newPrice: 20000, tax: 1600, meal: "Breakfast LKR 1,500", refundable: false },
  { id: 4, type: "Double Room (AC)", guests: "👥", oldPrice: 45000, newPrice: 22500, tax: 1800, meal: "Very good breakfast included", refundable: false },
  { id: 5, type: "Double Room (AC)", guests: "👥", oldPrice: 45000, newPrice: 22500, tax: 1800, meal: "Very good breakfast included", refundable: false },
  { id: 6, type: "Double Room (AC)", guests: "👥", oldPrice: 45000, newPrice: 22500, tax: 1800, meal: "Very good breakfast included", refundable: false },
  { id: 7, type: "Triple Room", guests: "👥👤", oldPrice: 55000, newPrice: 27500, tax: 2200, meal: "Breakfast & Dinner included", refundable: false },
  { id: 8, type: "Triple Room", guests: "👥👤", oldPrice: 55000, newPrice: 27500, tax: 2200, meal: "Breakfast & Dinner included", refundable: false },
  { id: 9, type: "Triple Room", guests: "👥👤", oldPrice: 55000, newPrice: 27500, tax: 2200, meal: "Breakfast & Dinner included", refundable: false }
];

export default function BookingPage() {
  const [selectedRooms, setSelectedRooms] = useState({});
  const navigate = useNavigate();

  const handleSelectChange = (id, value) => {
    setSelectedRooms({ ...selectedRooms, [id]: value });
  };

  return (
    <div className="container mx-auto p-5">
      <h2 className="text-2xl font-bold mb-4">Select Your Rooms</h2>
      <div className="grid grid-cols-1 gap-4">
        {roomsData.map((room) => (
          <div key={room.id} className="border p-4 rounded-lg shadow-lg bg-white flex justify-between items-center">
            <div className="w-2/3">
              <p className="text-lg font-bold">{room.guests} {room.type}</p>
              <p className="text-red-500 line-through">LKR {room.oldPrice.toLocaleString()}</p>
              <p className="text-xl font-semibold">LKR {room.newPrice.toLocaleString()}</p>
              <p className="text-gray-600">+ LKR {room.tax.toLocaleString()} taxes and charges</p>
              <p className="bg-green-500 text-white px-2 py-1 inline-block rounded text-sm">67% off</p>
              <p className="text-green-700">{room.meal}</p>
              <p className="text-red-600">{room.refundable ? "Refundable" : "Non-refundable"}</p>
            </div>
            <select
              className="border p-2 rounded"
              value={selectedRooms[room.id] || 0}
              onChange={(e) => handleSelectChange(room.id, e.target.value)}
            >
              {[...Array(6)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button
        className="mt-5 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={() => navigate("/payment")}
      >
        Continue to Payment
      </button>
    </div>
  );
}
