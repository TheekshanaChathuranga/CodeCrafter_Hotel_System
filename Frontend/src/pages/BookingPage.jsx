import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const roomCategories = {
  "Single Room": [{ id: 1, type: "Single Room" }],
  "Double Room": [{ id: 2, type: "Double Room" }, { id: 3, type: "Double Room" }],
  "Triple Room": [{ id: 4, type: "Triple Room" }],
};

export default function BookingPage() {
  const [adminDetails, setAdminDetails] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    checkIn: "",
    checkOut: "",
    arrivalDate: "",
  });

  const [selectedRooms, setSelectedRooms] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });
  };

  const handleRoomSelection = (roomId, field, value) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [roomId]: { ...prev[roomId], [field]: value },
    }));
  };

  const handleBooking = () => {
    const bookingDetails = {
      adminDetails,
      selectedRooms: Object.entries(selectedRooms).map(([id, details]) => ({
        id: parseInt(id),
        type: details.type,
        acType: details.acType || "Non-AC",
      })),
    };

    console.log("Booking Data:", bookingDetails);

    fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingDetails),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Booking Successful", data);
        navigate("/confirmation", { state: { adminDetails, selectedRooms } });
      })
      .catch(error => console.error("Error:", error));
  };

  return (
    <div className="container mx-auto p-5">
      <h2 className="text-2xl font-bold mb-4">Admin Booking</h2>

      <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Admin Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" name="name" placeholder="Name" className="border p-2 rounded" onChange={handleInputChange} />
          <input type="text" name="mobile" placeholder="Mobile No" className="border p-2 rounded" onChange={handleInputChange} />
          <input type="text" name="whatsapp" placeholder="WhatsApp No (Optional)" className="border p-2 rounded" onChange={handleInputChange} />
          <input type="datetime-local" name="checkIn" placeholder="Check-in Time" className="border p-2 rounded" onChange={handleInputChange} />
          <input type="datetime-local" name="checkOut" placeholder="Check-out Time" className="border p-2 rounded" onChange={handleInputChange} />
          <input type="date" name="arrivalDate" placeholder="Arrival Date" className="border p-2 rounded" onChange={handleInputChange} />
        </div>
      </div>

      {Object.entries(roomCategories).map(([category, rooms]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xl font-semibold bg-gray-200 p-2">{category}</h3>
          <div className="grid grid-cols-1 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="border p-4 rounded-lg shadow-lg bg-white flex justify-between items-center">
                <div className="w-2/3">
                  <p className="text-lg font-bold">{room.type}</p>
                </div>
                <select
                  className="border p-2 rounded"
                  value={selectedRooms[room.id]?.acType || ""}
                  onChange={(e) => handleRoomSelection(room.id, "acType", e.target.value)}
                >
                  <option value="">Select AC/Non-AC</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="mt-5 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={handleBooking}>
        Book Now
      </button>
    </div>
  );
}
