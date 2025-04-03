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
  const [errors, setErrors] = useState({});
  const [tooltip, setTooltip] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });

    // Ensure checkout time cannot be earlier than check-in time
    if (e.target.name === "checkIn" && adminDetails.checkOut) {
      const checkInDate = new Date(e.target.value);
      const checkOutDate = new Date(adminDetails.checkOut);
      if (checkOutDate <= checkInDate) {
        setAdminDetails({ ...adminDetails, checkOut: "" }); // Reset invalid checkout time
      }
    }
  };

  const validateFields = () => {
    const newErrors = {};
    const now = new Date();
    const checkInDate = new Date(adminDetails.checkIn);
    const checkOutDate = new Date(adminDetails.checkOut);

    if (!adminDetails.name) newErrors.name = "Name is required.";
    if (!adminDetails.mobile) newErrors.mobile = "Mobile number is required.";
    if (!adminDetails.checkIn) newErrors.checkIn = "Check-in date is required.";
    else if (checkInDate < now) newErrors.checkIn = "Check-in time cannot be in the past.";
    if (!adminDetails.checkOut) newErrors.checkOut = "Check-out date is required.";
    else if (checkOutDate <= checkInDate) newErrors.checkOut = "Checkout time must be after check-in time.";
    if (!selectedRoom) newErrors.selectedRoom = "Room selection is required.";
    if (!acType) newErrors.acType = "AC/Non-AC selection is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!validateFields()) {
      alert("❌ Please correct the highlighted errors.");
      return;
    }
    setShowConfirmation(true);
  };

  const resetForm = () => {
    setAdminDetails({
      name: "",
      mobile: "",
      whatsapp: "",
      checkIn: "",
      checkOut: "",
    });
    setSelectedRoom("");
    setAcType("");
    setErrors({});
    setShowConfirmation(false);
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
            <input
              type="text"
              name="name"
              placeholder="Name *"
              className={`border p-2 rounded ${errors.name ? "border-red-500" : ""}`}
              onChange={handleInputChange}
              value={adminDetails.name}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            <input
              type="text"
              name="mobile"
              placeholder="Mobile No *"
              className={`border p-2 rounded ${errors.mobile ? "border-red-500" : ""}`}
              onChange={handleInputChange}
              value={adminDetails.mobile}
            />
            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp No (Optional)"
              className="border p-2 rounded"
              onChange={handleInputChange}
              value={adminDetails.whatsapp}
            />
            <input
              type="datetime-local"
              name="checkIn"
              className={`border p-2 rounded ${errors.checkIn ? "border-red-500" : ""}`}
              onChange={handleInputChange}
              value={adminDetails.checkIn}
              min={new Date().toISOString().split("T")[0] + "T00:00"} // Restrict to today or later
            />
            {errors.checkIn && <p className="text-red-500 text-sm">{errors.checkIn}</p>}
            <input
              type="datetime-local"
              name="checkOut"
              className={`border p-2 rounded ${errors.checkOut ? "border-red-500" : ""}`}
              onChange={handleInputChange}
              value={adminDetails.checkOut}
              min={adminDetails.checkIn || new Date().toISOString().split("T")[0] + "T00:00"} // Ensure checkout is not earlier than check-in
            />
            {errors.checkOut && <p className="text-red-500 text-sm">{errors.checkOut}</p>}

            <select
              className={`border p-2 rounded ${errors.selectedRoom ? "border-red-500" : ""}`}
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              onMouseOut={() => setTooltip("")}
            >
              <option value="">Select Room Number *</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.id} - {room.type}
                </option>
              ))}
            </select>
            {errors.selectedRoom && <p className="text-red-500 text-sm">{errors.selectedRoom}</p>}
            {tooltip && <p className="text-gray-500 text-sm">{tooltip}</p>}

            <select
              className={`border p-2 rounded ${errors.acType ? "border-red-500" : ""}`}
              value={acType}
              onChange={(e) => setAcType(e.target.value)}
            >
              <option value="">Select AC/Non-AC *</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
            {errors.acType && <p className="text-red-500 text-sm">{errors.acType}</p>}
          </div>

          <div className="flex justify-between mt-5">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={handleBooking}>
              Next: Confirm Booking
            </button>
            <button className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500" onClick={resetForm}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
