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
    email: "", // Added email field
    whatsapp: "",
    checkIn: "",
    checkOut: "",
  });

  const [selectedRoomType, setSelectedRoomType] = useState(""); // Added room type state
  const [selectedRoom, setSelectedRoom] = useState("");
  const [acType, setAcType] = useState("");
  const [packageType, setPackageType] = useState(""); // Added package type state
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [tooltip, setTooltip] = useState("");
  const [paymentType, setPaymentType] = useState(""); // Added payment type state
  const [advanceAmount, setAdvanceAmount] = useState(""); // Added advance amount state
  const [totalAmount, setTotalAmount] = useState(0); // Added total amount state
  const [remainingAmount, setRemainingAmount] = useState(0); // Added remaining amount state
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "checkIn") {
      const checkInDate = new Date(value);
      const defaultCheckOutDate = new Date(checkInDate);
      defaultCheckOutDate.setDate(checkInDate.getDate() + 1); // Set to the next day
      defaultCheckOutDate.setHours(12, 0, 0, 0); // Set time to 12:00 PM
      setAdminDetails({
        ...adminDetails,
        checkIn: value,
        checkOut: defaultCheckOutDate.toISOString().slice(0, 16), // Format for datetime-local input
      });
    } else {
      setAdminDetails({ ...adminDetails, [name]: value });
    }

    // Ensure checkout time cannot be earlier than check-in time
    if (name === "checkIn" && adminDetails.checkOut) {
      const checkInDate = new Date(value);
      const checkOutDate = new Date(adminDetails.checkOut);
      if (checkOutDate <= checkInDate) {
        setAdminDetails({ ...adminDetails, checkOut: "" }); // Reset invalid checkout time
      }
    }
  };

  const handlePackageChange = (e) => {
    const selectedPackage = e.target.value;
    setPackageType(selectedPackage);

    if (selectedPackage === "f/b" || selectedPackage === "h/b") {
      setSelectedRoomType("Double Room"); // Auto-select room type as Double Room
      setAcType("AC"); // Auto-select AC type
      setSelectedRoom(""); // Reset room number
    } else {
      setSelectedRoomType(""); // Allow manual selection for "normal"
      setAcType(""); // Allow manual selection for "normal"
      setSelectedRoom(""); // Reset room number
    }
  };

  const validateFields = () => {
    const newErrors = {};
    const now = new Date();
    const checkInDate = new Date(adminDetails.checkIn);
    const checkOutDate = new Date(adminDetails.checkOut);

    if (!packageType) newErrors.packageType = "Package selection is required."; // Validate package type
    if (!adminDetails.name) newErrors.name = "Name is required.";
    if (!adminDetails.mobile) newErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(adminDetails.mobile)) newErrors.mobile = "Mobile number must be exactly 10 digits."; // Validate mobile number
    if (adminDetails.email && !/\S+@\S+\.\S+/.test(adminDetails.email)) newErrors.email = "Invalid email format."; // Email validation
    if (adminDetails.whatsapp && !/^\d{10}$/.test(adminDetails.whatsapp)) newErrors.whatsapp = "WhatsApp number must be exactly 10 digits."; // Validate WhatsApp number
    if (!adminDetails.checkIn) newErrors.checkIn = "Check-in date is required.";
    else if (checkInDate < now) newErrors.checkIn = "Check-in time cannot be in the past.";
    if (!adminDetails.checkOut) newErrors.checkOut = "Check-out date is required.";
    else if (checkOutDate <= checkInDate) newErrors.checkOut = "Checkout time must be after check-in time.";
    if (!selectedRoomType) newErrors.selectedRoomType = "Room type selection is required."; // Validate room type
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
      email: "", // Reset email field
      whatsapp: "",
      checkIn: "",
      checkOut: "",
      packageType: "",
    });
    setSelectedRoomType(""); // Reset room type
    setSelectedRoom("");
    setAcType("");
    setPackageType(""); // Reset package type
    setErrors({});
    setShowConfirmation(false);
  };

  const calculateTotalAmount = () => {
    let amount = 0;
    if (selectedRoomType === "Single Room") {
      amount = acType === "AC" ? 5000 : 4000;
    } else if (selectedRoomType === "Double Room") {
      amount = acType === "AC" ? 7500 : 5000;
    } else if (selectedRoomType === "Triple Room") {
      amount = acType === "AC" ? 9000 : 7500;
    }
    setTotalAmount(amount);
    return amount;
  };

  const handlePaymentTypeChange = (e) => {
    const selectedPaymentType = e.target.value;
    setPaymentType(selectedPaymentType);

    if (selectedPaymentType === "full") {
      const total = calculateTotalAmount();
      setAdvanceAmount(total); // Auto-fill full payment
      setRemainingAmount(0); // No remaining amount
    } else if (selectedPaymentType === "advance") {
      calculateTotalAmount(); // Calculate total amount for advance
      setAdvanceAmount(""); // Allow user to input advance amount
      setRemainingAmount(totalAmount); // Initially, remaining is the total amount
    } else {
      setAdvanceAmount(""); // No input for no payment
      setRemainingAmount(totalAmount); // Entire amount remains unpaid
    }
  };

  const handleAdvanceAmountChange = (e) => {
    const advance = parseInt(e.target.value, 10) || 0;
    setAdvanceAmount(advance);
    setRemainingAmount(totalAmount - advance); // Calculate remaining amount
  };

  const confirmBooking = () => {
    if (!validateFields()) {
      alert("❌ Please correct the highlighted errors.");
      return;
    }

    setLoading(true);

    const bookingDetails = {
      adminDetails,
      selectedRoom: { roomNumber: selectedRoom, acType },
      packageType,
      paymentDetails: {
        paymentType,
        advanceAmount,
        remainingAmount,
        totalAmount,
      },
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
        navigate("/confirmation", {
          state: { adminDetails, selectedRoom, acType, packageType, paymentDetails: bookingDetails.paymentDetails },
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  const handleRoomTypeChange = (e) => {
    setSelectedRoomType(e.target.value);
    setSelectedRoom(""); // Reset room selection when room type changes
    setAcType(""); // Reset AC type when room type changes
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
    if (e.target.value === "102") {
      setAcType("Non-AC"); // Automatically set AC type to Non-AC for room 102
    }
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
            <p><strong>Email:</strong> {adminDetails.email || "N/A"}</p> {/* Display email */}
            <p><strong>WhatsApp:</strong> {adminDetails.whatsapp || "N/A"}</p>
            <p><strong>Check-in:</strong> {adminDetails.checkIn}</p>
            <p><strong>Check-out:</strong> {adminDetails.checkOut}</p>
            <p><strong>Room No:</strong> {selectedRoom}</p>
            <p><strong>AC Type:</strong> {acType}</p>
            <p><strong>Package:</strong> {packageType}</p> {/* Display package type */}
            <p><strong>Payment Type:</strong> {paymentType}</p>
            <p><strong>Advance Amount:</strong> {advanceAmount || "N/A"}</p>
            <p><strong>Remaining Amount:</strong> {remainingAmount}</p>
            <p><strong>Total Amount:</strong> {totalAmount}</p>
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
              type="email"
              name="email"
              placeholder="Email (Optional)"
              className={`border p-2 rounded ${errors.email ? "border-red-500" : ""}`}
              onChange={handleInputChange}
              value={adminDetails.email}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
              className={`border p-2 rounded ${errors.packageType ? "border-red-500" : ""}`}
              value={packageType}
              onChange={handlePackageChange}
            >
              <option value="">Select Package *</option>
              <option value="f/b">Full Board (f/b)</option>
              <option value="h/b">Half Board (h/b)</option>
              <option value="normal">Normal</option>
            </select>
            {errors.packageType && <p className="text-red-500 text-sm">{errors.packageType}</p>}

            <select
              className={`border p-2 rounded ${errors.selectedRoomType ? "border-red-500" : ""}`}
              value={selectedRoomType}
              onChange={handleRoomTypeChange}
              disabled={packageType === "f/b" || packageType === "h/b"} // Disable manual selection for f/b and h/b
            >
              <option value="">Select Room Type *</option>
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Triple Room">Triple Room</option>
            </select>
            {errors.selectedRoomType && <p className="text-red-500 text-sm">{errors.selectedRoomType}</p>}

            <select
              className={`border p-2 rounded ${errors.selectedRoom ? "border-red-500" : ""}`}
              value={selectedRoom}
              onChange={handleRoomChange}
            >
              <option value="">Select Room Number *</option>
              {rooms
                .filter((room) => {
                  if (selectedRoomType === "Single Room") return room.type === "Single Room";
                  if (selectedRoomType === "Double Room") return room.type === "Double Room";
                  if (selectedRoomType === "Triple Room") return room.type === "Triple Room";
                  return false;
                })
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.id} - {room.type}
                  </option>
                ))}
            </select>
            {errors.selectedRoom && <p className="text-red-500 text-sm">{errors.selectedRoom}</p>}

            <select
              className={`border p-2 rounded ${errors.acType ? "border-red-500" : ""}`}
              value={acType}
              onChange={(e) => setAcType(e.target.value)}
              disabled={packageType === "f/b" || packageType === "h/b" || selectedRoom === "102"} // Disable for f/b, h/b, and room 102
            >
              <option value="">Select AC/Non-AC *</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
            {errors.acType && <p className="text-red-500 text-sm">{errors.acType}</p>}

            <select
              className="border p-2 rounded"
              value={paymentType}
              onChange={handlePaymentTypeChange}
            >
              <option value="">Select Payment Type *</option>
              <option value="advance">Advance Payment</option>
              <option value="full">Full Payment</option>
              <option value="none">No Payment</option>
            </select>

            {paymentType === "advance" && (
              <input
                type="number"
                placeholder="Enter Advance Amount (Rs)"
                className="border p-2 rounded"
                value={advanceAmount}
                onChange={handleAdvanceAmountChange}
              />
            )}

            {paymentType && (
              <div className="bg-gray-100 p-2 rounded">
                <p><strong>Total Amount:</strong> Rs {totalAmount}</p>
                <p><strong>Remaining Amount:</strong> Rs {remainingAmount}</p>
              </div>
            )}
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
