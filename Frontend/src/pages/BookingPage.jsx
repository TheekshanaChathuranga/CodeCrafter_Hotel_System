import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const rooms = [
  { id: 102, type: "Single Room" },
  { id: 101, type: "Double Room" },
  { id: 103, type: "Double Room" },
  { id: 104, type: "Double Room" },
 { id: 105, type: "Double Room" },
  { id: 106, type: "Double Room" },
  { id: 107, type: "Triple Room" },
  { id: 108, type: "Triple Room" },
  { id: 109, type: "Triple Room" },
];

export default function BookingPage() {
  const [adminDetails, setAdminDetails] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    checkIn: "",
    checkOut: "",
  });

  const [selectedRoom, setSelectedRoom] = useState("");
  const [acType, setAcType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });
  };

  const handleBooking = () => {
    if (!selectedRoom || !acType || !adminDetails.name || !adminDetails.mobile || !adminDetails.checkIn || !adminDetails.checkOut) {
      alert("❌ Please fill in all required fields.");
      return;
    }

    setShowConfirmation(true);
  };
  const bookingDetails = {
    adminDetails,
    selectedRoom: { roomNumber: selectedRoom, acType },
  };
  

  const confirmBooking = () => {
    setLoading(true);

    const bookingDetails = {
      adminDetails,
      selectedRoom: { roomNumber: selectedRoom, acType },
    };

    fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingDetails),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        alert("✅ Booking successful!");
        navigate("/confirmation", { state: { adminDetails, selectedRoom, acType } });
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Hotel Room Booking</h2>

      {/* Show Confirmation */}
      {showConfirmation ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Confirm Booking</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Name:</strong> {adminDetails.name}</p>
            <p><strong>Mobile:</strong> {adminDetails.mobile}</p>
            <p><strong>WhatsApp:</strong> {adminDetails.whatsapp || "N/A"}</p>
            <p><strong>Check-in:</strong> {adminDetails.checkIn}</p>
            <p><strong>Check-out:</strong> {adminDetails.checkOut}</p>
            <p><strong>Room No:</strong> {selectedRoom}</p>
            <p><strong>AC Type:</strong> {acType}</p>
          </div>

          <div className="flex justify-between mt-5">
            <button className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500" onClick={() => setShowConfirmation(false)}>
              Back
            </button>
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center" onClick={confirmBooking} disabled={loading}>
              {loading ? "Processing..." : "Confirm & Book"}
            </button>
          </div>
        </div>
      ) : (
        // Booking Form
        <div>
          <h3 className="text-lg font-semibold mb-2">Guest & Room Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <input type="text" name="name" placeholder="Name *" className="border p-2 rounded" onChange={handleInputChange} required />
            <input type="text" name="mobile" placeholder="Mobile No *" className="border p-2 rounded" onChange={handleInputChange} required />
            <input type="text" name="whatsapp" placeholder="WhatsApp No (Optional)" className="border p-2 rounded" onChange={handleInputChange} />
            <input type="datetime-local" name="checkIn" className="border p-2 rounded" onChange={handleInputChange} required />
            <input type="datetime-local" name="checkOut" className="border p-2 rounded" onChange={handleInputChange} required />

            <select className="border p-2 rounded" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} required>
              <option value="">Select Room Number *</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.id} - {room.type}
                </option>
              ))}
            </select>

            <select className="border p-2 rounded" value={acType} onChange={(e) => setAcType(e.target.value)} required>
              <option value="">Select AC/Non-AC *</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </div>

          <button className="mt-5 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full" onClick={handleBooking}>
            Next: Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
