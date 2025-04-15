import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BookingPage = () => {
  const [adminDetails, setAdminDetails] = useState({
    name: "",
    mobile: "",
    email: "",
    whatsapp: "",
    checkIn: "",
    checkOut: "",
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [acType, setAcType] = useState("");
  const [packageType, setPackageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentType, setPaymentType] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const navigate = useNavigate();

  // Fetch available rooms when checkIn or checkOut changes
  useEffect(() => {
    if (adminDetails.checkIn && adminDetails.checkOut) {
      fetchAvailableRooms();
    }
  }, [adminDetails.checkIn, adminDetails.checkOut]);

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rooms/available', {
        params: {
          checkIn: adminDetails.checkIn,
          checkOut: adminDetails.checkOut
        }
      });
      setAvailableRooms(response.data);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "checkIn") {
      const checkInDate = new Date(value);
      const defaultCheckOutDate = new Date(checkInDate);
      defaultCheckOutDate.setDate(checkInDate.getDate() + 1);
      defaultCheckOutDate.setHours(12, 0, 0, 0);
      
      setAdminDetails({
        ...adminDetails,
        checkIn: value,
        checkOut: defaultCheckOutDate.toISOString().slice(0, 16),
      });
    } else {
      setAdminDetails({ ...adminDetails, [name]: value });
    }

    if (name === "checkIn" && adminDetails.checkOut) {
      const checkInDate = new Date(value);
      const checkOutDate = new Date(adminDetails.checkOut);
      if (checkOutDate <= checkInDate) {
        setAdminDetails(prev => ({ ...prev, checkOut: "" }));
      }
    }
  };

  const handlePackageChange = (e) => {
    const selectedPackage = e.target.value;
    setPackageType(selectedPackage);

    if (selectedPackage === "f/b" || selectedPackage === "h/b") {
      setSelectedRoomType("Double Room");
      setAcType("AC");
      setSelectedRoom("");
    } else {
      setSelectedRoomType("");
      setAcType("");
      setSelectedRoom("");
    }
  };

  const validateFields = () => {
    const newErrors = {};
    const now = new Date();
    const checkInDate = new Date(adminDetails.checkIn);
    const checkOutDate = new Date(adminDetails.checkOut);

    if (!packageType) newErrors.packageType = "Package selection is required.";
    if (!adminDetails.name) newErrors.name = "Name is required.";
    if (!adminDetails.mobile) newErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(adminDetails.mobile)) newErrors.mobile = "Mobile number must be exactly 10 digits.";
    if (adminDetails.email && !/\S+@\S+\.\S+/.test(adminDetails.email)) newErrors.email = "Invalid email format.";
    if (adminDetails.whatsapp && !/^\d{10}$/.test(adminDetails.whatsapp)) newErrors.whatsapp = "WhatsApp number must be exactly 10 digits.";
    if (!adminDetails.checkIn) newErrors.checkIn = "Check-in date is required.";
    else if (checkInDate < now) newErrors.checkIn = "Check-in time cannot be in the past.";
    if (!adminDetails.checkOut) newErrors.checkOut = "Check-out date is required.";
    else if (checkOutDate <= checkInDate) newErrors.checkOut = "Checkout time must be after check-in time.";
    if (!selectedRoomType) newErrors.selectedRoomType = "Room type selection is required.";
    if (!selectedRoom) newErrors.selectedRoom = "Room selection is required.";
    if (!acType) newErrors.acType = "AC/Non-AC selection is required.";
    if (!paymentType) newErrors.paymentType = "Payment type is required.";

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
      email: "",
      whatsapp: "",
      checkIn: "",
      checkOut: "",
    });
    setSelectedRoomType("");
    setSelectedRoom("");
    setAcType("");
    setPackageType("");
    setPaymentType("");
    setAdvanceAmount("");
    setTotalAmount(0);
    setRemainingAmount(0);
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
    
    // Apply package multipliers
    if (packageType === "f/b") amount *= 1.5; // 50% more for full board
    if (packageType === "h/b") amount *= 1.3; // 30% more for half board
    
    setTotalAmount(amount);
    return amount;
  };

  const handlePaymentTypeChange = (e) => {
    const selectedPaymentType = e.target.value;
    setPaymentType(selectedPaymentType);

    if (selectedPaymentType === "full") {
      const total = calculateTotalAmount();
      setAdvanceAmount(total);
      setRemainingAmount(0);
    } else if (selectedPaymentType === "advance") {
      calculateTotalAmount();
      setAdvanceAmount("");
      setRemainingAmount(totalAmount);
    } else {
      setAdvanceAmount(0);
      setRemainingAmount(totalAmount);
    }
  };

  const handleAdvanceAmountChange = (e) => {
    const advance = parseInt(e.target.value, 10) || 0;
    setAdvanceAmount(advance);
    setRemainingAmount(totalAmount - advance);
  };

  const confirmBooking = async () => {
    if (!validateFields()) {
      alert("❌ Please correct the highlighted errors.");
      return;
    }

    setLoading(true);

    const bookingData = {
      adminDetails,
      selectedRoom: { roomNumber: selectedRoom, acType },
      selectedRoomType,
      packageType,
      paymentDetails: {
        paymentType,
        advanceAmount: advanceAmount || 0,
        remainingAmount,
        totalAmount,
      },
    };

    try {
      const response = await axios.post('http://localhost:5000/api/bookings', bookingData);
      alert("✅ Booking successful!");
      navigate("/confirmation", {
        state: {
          adminDetails,
          selectedRoom,
          acType,
          packageType,
          paymentDetails: bookingData.paymentDetails,
          bookingId: response.data.booking._id
        },
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert("❌ Error creating booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomTypeChange = (e) => {
    setSelectedRoomType(e.target.value);
    setSelectedRoom("");
    setAcType("");
    calculateTotalAmount();
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);
    
    // Find the selected room to set its AC type
    const room = availableRooms.find(r => r.id === roomId);
    if (room) {
      if (room.id === "102") {
        setAcType("Non-AC");
      } else if (packageType === "f/b" || packageType === "h/b") {
        setAcType("AC");
      } else {
        setAcType(room.acType || "");
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">Hotel Room Booking</h2>
        </div>

        {showConfirmation ? (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Confirm Booking</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-blue-700">Guest Details:</p>
                  <p><span className="text-gray-600">Name:</span> {adminDetails.name}</p>
                  <p><span className="text-gray-600">Mobile:</span> {adminDetails.mobile}</p>
                  <p><span className="text-gray-600">Email:</span> {adminDetails.email || "N/A"}</p>
                  <p><span className="text-gray-600">WhatsApp:</span> {adminDetails.whatsapp || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">Booking Details:</p>
                  <p><span className="text-gray-600">Check-in:</span> {new Date(adminDetails.checkIn).toLocaleString()}</p>
                  <p><span className="text-gray-600">Check-out:</span> {new Date(adminDetails.checkOut).toLocaleString()}</p>
                  <p><span className="text-gray-600">Room No:</span> {selectedRoom}</p>
                  <p><span className="text-gray-600">Room Type:</span> {selectedRoomType}</p>
                  <p><span className="text-gray-600">AC Type:</span> {acType}</p>
                  <p><span className="text-gray-600">Package:</span> {packageType.toUpperCase()}</p>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="font-medium text-blue-700">Payment Details:</p>
                <p><span className="text-gray-600">Payment Type:</span> {paymentType === 'full' ? 'Full Payment' : paymentType === 'advance' ? 'Advance Payment' : 'No Payment'}</p>
                <p><span className="text-gray-600">Advance Amount:</span> Rs.{advanceAmount || 0}</p>
                <p><span className="text-gray-600">Remaining Amount:</span> Rs.{remainingAmount}</p>
                <p className="font-semibold"><span className="text-gray-600">Total Amount:</span> Rs.{totalAmount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button 
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                onClick={() => setShowConfirmation(false)}
              >
                Back to Edit
              </button>
              <button 
                className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center ${loading ? 'opacity-75' : ''}`}
                onClick={confirmBooking}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : "Confirm & Book"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Guest & Room Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guest Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    onChange={handleInputChange}
                    value={adminDetails.name}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No *</label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="10 digit mobile number"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
                    onChange={handleInputChange}
                    value={adminDetails.mobile}
                  />
                  {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    onChange={handleInputChange}
                    value={adminDetails.email}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp No (Optional)</label>
                  <input
                    type="text"
                    name="whatsapp"
                    placeholder="10 digit WhatsApp number"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.whatsapp ? "border-red-500" : "border-gray-300"}`}
                    onChange={handleInputChange}
                    value={adminDetails.whatsapp}
                  />
                  {errors.whatsapp && <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>}
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="checkIn"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.checkIn ? "border-red-500" : "border-gray-300"}`}
                    onChange={handleInputChange}
                    value={adminDetails.checkIn}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {errors.checkIn && <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="checkOut"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.checkOut ? "border-red-500" : "border-gray-300"}`}
                    onChange={handleInputChange}
                    value={adminDetails.checkOut}
                    min={adminDetails.checkIn || new Date().toISOString().slice(0, 16)}
                  />
                  {errors.checkOut && <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Type *</label>
                  <select
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.packageType ? "border-red-500" : "border-gray-300"}`}
                    value={packageType}
                    onChange={handlePackageChange}
                  >
                    <option value="">Select Package</option>
                    <option value="f/b">Full Board (f/b) - Includes all meals</option>
                    <option value="h/b">Half Board (h/b) - Includes breakfast & dinner</option>
                    <option value="normal">Normal - Room only</option>
                  </select>
                  {errors.packageType && <p className="mt-1 text-sm text-red-600">{errors.packageType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.selectedRoomType ? "border-red-500" : "border-gray-300"}`}
                    value={selectedRoomType}
                    onChange={handleRoomTypeChange}
                    disabled={packageType === "f/b" || packageType === "h/b"}
                  >
                    <option value="">Select Room Type</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Triple Room">Triple Room</option>
                  </select>
                  {errors.selectedRoomType && <p className="mt-1 text-sm text-red-600">{errors.selectedRoomType}</p>}
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                <select
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.selectedRoom ? "border-red-500" : "border-gray-300"}`}
                  value={selectedRoom}
                  onChange={handleRoomChange}
                  disabled={!selectedRoomType}
                >
                  <option value="">Select Room Number</option>
                  {availableRooms
                    .filter(room => {
                      if (selectedRoomType === "Single Room") return room.type === "Single Room";
                      if (selectedRoomType === "Double Room") return room.type === "Double Room";
                      if (selectedRoomType === "Triple Room") return room.type === "Triple Room";
                      return false;
                    })
                    .map(room => (
                      <option key={room.id} value={room.id}>
                        {room.id} - {room.type} ({room.acType})
                      </option>
                    ))}
                </select>
                {errors.selectedRoom && <p className="mt-1 text-sm text-red-600">{errors.selectedRoom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AC Type *</label>
                <select
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.acType ? "border-red-500" : "border-gray-300"}`}
                  value={acType}
                  onChange={(e) => setAcType(e.target.value)}
                  disabled={packageType === "f/b" || packageType === "h/b" || selectedRoom === "102"}
                >
                  <option value="">Select AC/Non-AC</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
                {errors.acType && <p className="mt-1 text-sm text-red-600">{errors.acType}</p>}
              </div>

              {/* Payment Information */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                  <select
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.paymentType ? "border-red-500" : "border-gray-300"}`}
                    value={paymentType}
                    onChange={handlePaymentTypeChange}
                  >
                    <option value="">Select Payment Type</option>
                    <option value="advance">Advance Payment</option>
                    <option value="full">Full Payment</option>
                    <option value="none">No Payment (Pay at Hotel)</option>
                  </select>
                  {errors.paymentType && <p className="mt-1 text-sm text-red-600">{errors.paymentType}</p>}
                </div>

                {paymentType === "advance" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount (Rs)</label>
                    <input
                      type="number"
                      placeholder="Enter advance amount"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={advanceAmount}
                      onChange={handleAdvanceAmountChange}
                      min="0"
                      max={totalAmount}
                    />
                  </div>
                )}

                {paymentType && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-blue-700">Total Amount:</p>
                        <p className="text-lg font-semibold">Rs.{totalAmount}</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700">Remaining Amount:</p>
                        <p className="text-lg font-semibold">RS.{remainingAmount}</p>
                      </div>
                    </div>
                    {paymentType === "advance" && advanceAmount > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-blue-700">Advance Paid:</p>
                        <p className="text-lg font-semibold text-green-600">Rs.{advanceAmount}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <button 
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                onClick={resetForm}
              >
                Reset Form
              </button>
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleBooking}
              >
                Next: Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;