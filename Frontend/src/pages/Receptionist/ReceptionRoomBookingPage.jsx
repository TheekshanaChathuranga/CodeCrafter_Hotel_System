import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReceptionRoomBookingPage = () => {
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const navigate = useNavigate();

  // Fetch available rooms when checkIn or checkOut changes
  useEffect(() => {
    if (adminDetails.checkIn && adminDetails.checkOut) {
      fetchAvailableRooms();
    }
  }, [adminDetails.checkIn, adminDetails.checkOut]);

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/receptionRooms/available",
        {
          params: {
            checkIn: adminDetails.checkIn,
            checkOut: adminDetails.checkOut,
          },
        }
      );
      setAvailableRooms(response.data);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
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
        setAdminDetails((prev) => ({ ...prev, checkOut: "" }));
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
    else if (!/^\d{10}$/.test(adminDetails.mobile))
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    if (adminDetails.email && !/\S+@\S+\.\S+/.test(adminDetails.email))
      newErrors.email = "Invalid email format.";
    if (adminDetails.whatsapp && !/^\d{10}$/.test(adminDetails.whatsapp))
      newErrors.whatsapp = "WhatsApp number must be exactly 10 digits.";
    if (!adminDetails.checkIn) newErrors.checkIn = "Check-in date is required.";
    else if (checkInDate < now)
      newErrors.checkIn = "Check-in time cannot be in the past.";
    if (!adminDetails.checkOut)
      newErrors.checkOut = "Check-out date is required.";
    else if (checkOutDate <= checkInDate)
      newErrors.checkOut = "Checkout time must be after check-in time.";
    if (!selectedRoomType)
      newErrors.selectedRoomType = "Room type selection is required.";
    if (!selectedRoom) newErrors.selectedRoom = "Room selection is required.";
    if (!acType) newErrors.acType = "AC/Non-AC selection is required.";
    if (!paymentType) newErrors.paymentType = "Payment type is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!validateFields()) {
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

    if (packageType === "f/b") amount *= 1.5;
    if (packageType === "h/b") amount *= 1.3;

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

    // Find the selected room details from availableRooms
    const selectedRoomDetails = availableRooms.find(
      (room) => room.id === selectedRoom
    );

    if (!selectedRoomDetails) {
      alert("❌ Selected room not found. Please select a room again.");
      setLoading(false);
      return;
    }

    // Ensure dates are properly formatted
    const checkInDate = new Date(adminDetails.checkIn);
    const checkOutDate = new Date(adminDetails.checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      alert("❌ Invalid date format. Please select valid dates.");
      setLoading(false);
      return;
    }

    const bookingData = {
      adminDetails: {
        ...adminDetails,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
      },
      selectedRoom: {
        roomNumber: selectedRoomDetails.id, // Use room ID as room number
        acType: acType || selectedRoomDetails.acType, // Use selected acType or default from room
      },
      selectedRoomType,
      packageType,
      paymentDetails: {
        paymentType,
        advanceAmount: Number(advanceAmount) || 0,
        remainingAmount: Number(remainingAmount) || 0,
        totalAmount: Number(totalAmount) || 0,
      },
    };

    console.log("Sending booking data:", JSON.stringify(bookingData, null, 2));

    try {
      const response = await axios.post(
        "http://localhost:5000/api/receptionBookings",
        bookingData
      );
      setBookingId(response.data.booking._id);
      setShowSuccessPopup(true);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      console.error("Error response:", error.response?.data);

      // Show more specific error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.details?.join(", ") ||
        "Error creating booking. Please try again.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    resetForm();
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

    const room = availableRooms.find((r) => r.id === roomId);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-12 px-4">
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg mb-4">
                <div className="h-8 w-8 text-white font-bold text-2xl">✓</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600 mb-4">
                Your reservation has been successfully created.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-6">
                <p className="text-lg font-bold text-blue-800 mb-4">
                  Booking ID: {bookingId}
                </p>
                <div className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Guest:</span>
                    <span className="text-gray-900">{adminDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Room:</span>
                    <span className="text-gray-900">
                      {selectedRoom} ({selectedRoomType})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Check-in:</span>
                    <span className="text-gray-900">
                      {new Date(adminDetails.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      Check-out:
                    </span>
                    <span className="text-gray-900">
                      {new Date(adminDetails.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-800">
                        Total Amount:
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        Rs.{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={closeSuccessPopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-1"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center relative z-10">
            Hotel Room Booking System
          </h2>
          <p className="text-center text-blue-100 mt-2 relative z-10">
            Complete your reservation in simple steps
          </p>
        </div>

        {showConfirmation ? (
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Review & Confirm Booking
              </h3>
              <p className="text-gray-600">
                Please verify all details before confirming your reservation
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-blue-800 mb-3 text-lg">
                      Guest Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Name:</span>
                        <span className="text-gray-900 font-semibold">
                          {adminDetails.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Mobile:
                        </span>
                        <span className="text-gray-900">
                          {adminDetails.mobile}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Email:
                        </span>
                        <span className="text-gray-900">
                          {adminDetails.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          WhatsApp:
                        </span>
                        <span className="text-gray-900">
                          {adminDetails.whatsapp || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-blue-800 mb-3 text-lg">
                      Booking Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Check-in:
                        </span>
                        <span className="text-gray-900">
                          {new Date(adminDetails.checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Check-out:
                        </span>
                        <span className="text-gray-900">
                          {new Date(adminDetails.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Room:</span>
                        <span className="text-gray-900 font-semibold">
                          {selectedRoom}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Type:</span>
                        <span className="text-gray-900">
                          {selectedRoomType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          AC Type:
                        </span>
                        <span className="text-gray-900">{acType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Package:
                        </span>
                        <span className="text-gray-900">
                          {packageType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-blue-800 mb-3 text-lg">
                  Payment Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Payment Type</p>
                    <p className="font-semibold text-gray-900">
                      {paymentType === "full"
                        ? "Full Payment"
                        : paymentType === "advance"
                        ? "Advance Payment"
                        : "No Payment"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Advance Paid</p>
                    <p className="font-bold text-green-600 text-lg">
                      Rs.{advanceAmount || 0}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-bold text-blue-600 text-xl">
                      Rs.{totalAmount}
                    </p>
                  </div>
                </div>
                {remainingAmount > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      Remaining Amount
                    </p>
                    <p className="font-bold text-orange-600 text-lg">
                      Rs.{remainingAmount}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                className="w-full sm:w-auto px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 border border-gray-300"
                onClick={() => setShowConfirmation(false)}
              >
                ← Back to Edit
              </button>
              <button
                className={`w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                  loading ? "opacity-75" : ""
                }`}
                onClick={confirmBooking}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm & Book →"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Guest & Room Details
              </h3>
              <p className="text-gray-600">
                Fill in the required information to proceed with the booking
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Guest Information Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="text-xl font-bold text-blue-800 mb-6 pb-2 border-b border-blue-200">
                  Guest Information
                </h4>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter guest's full name"
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.name
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      } shadow-sm`}
                      onChange={handleInputChange}
                      value={adminDetails.name}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="10 digit mobile number"
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.mobile
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      } shadow-sm`}
                      onChange={handleInputChange}
                      value={adminDetails.mobile}
                    />
                    {errors.mobile && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="guest@example.com"
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.email
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      } shadow-sm`}
                      onChange={handleInputChange}
                      value={adminDetails.email}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      placeholder="10 digit WhatsApp number"
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.whatsapp
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      } shadow-sm`}
                      onChange={handleInputChange}
                      value={adminDetails.whatsapp}
                    />
                    {errors.whatsapp && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.whatsapp}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Information Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <h4 className="text-xl font-bold text-purple-800 mb-6 pb-2 border-b border-purple-200">
                  Booking Information
                </h4>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check-in Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="checkIn"
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                          errors.checkIn
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white"
                        } shadow-sm`}
                        onChange={handleInputChange}
                        value={adminDetails.checkIn}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      {errors.checkIn && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.checkIn}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check-out Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="checkOut"
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                          errors.checkOut
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white"
                        } shadow-sm`}
                        onChange={handleInputChange}
                        value={adminDetails.checkOut}
                        min={
                          adminDetails.checkIn ||
                          new Date().toISOString().slice(0, 16)
                        }
                      />
                      {errors.checkOut && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.checkOut}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Package Type *
                    </label>
                    <select
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                        errors.packageType
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      } shadow-sm`}
                      value={packageType}
                      onChange={handlePackageChange}
                    >
                      <option value="">Select Package Type</option>
                      <option value="f/b">
                        🍽️ Full Board (f/b) - All meals included
                      </option>
                      <option value="h/b">
                        🥞 Half Board (h/b) - Breakfast & dinner
                      </option>
                      <option value="normal">🏨 Normal - Room only</option>
                    </select>
                    {errors.packageType && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.packageType}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Type *
                      </label>
                      <select
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                          errors.selectedRoomType
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white"
                        } shadow-sm ${
                          packageType === "f/b" || packageType === "h/b"
                            ? "opacity-50"
                            : ""
                        }`}
                        value={selectedRoomType}
                        onChange={handleRoomTypeChange}
                        disabled={
                          packageType === "f/b" || packageType === "h/b"
                        }
                      >
                        <option value="">Select Room Type</option>
                        <option value="Single Room">Single Room</option>
                        <option value="Double Room">Double Room</option>
                        <option value="Triple Room">Triple Room</option>
                      </select>
                      {errors.selectedRoomType && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.selectedRoomType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        AC Type *
                      </label>
                      <select
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                          errors.acType
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white"
                        } shadow-sm ${
                          packageType === "f/b" ||
                          packageType === "h/b" ||
                          selectedRoom === "102"
                            ? "opacity-50"
                            : ""
                        }`}
                        value={acType}
                        onChange={(e) => setAcType(e.target.value)}
                        disabled={
                          packageType === "f/b" ||
                          packageType === "h/b" ||
                          selectedRoom === "102"
                        }
                      >
                        <option value="">Select AC/Non-AC</option>
                        <option value="AC">❄️ AC</option>
                        <option value="Non-AC">🌬️ Non-AC</option>
                      </select>
                      {errors.acType && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.acType}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <select
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                        errors.selectedRoom
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white"
                      } shadow-sm ${!selectedRoomType ? "opacity-50" : ""}`}
                      value={selectedRoom}
                      onChange={handleRoomChange}
                      disabled={!selectedRoomType}
                    >
                      <option value="">Select Available Room</option>
                      {availableRooms
                        .filter((room) => {
                          if (selectedRoomType === "Single Room")
                            return room.type === "Single Room";
                          if (selectedRoomType === "Double Room")
                            return room.type === "Double Room";
                          if (selectedRoomType === "Triple Room")
                            return room.type === "Triple Room";
                          return false;
                        })
                        .map((room) => (
                          <option key={room.id} value={room.id}>
                            Room {room.id} - {room.type} ({room.acType})
                          </option>
                        ))}
                    </select>
                    {errors.selectedRoom && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.selectedRoom}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <h4 className="text-xl font-bold text-green-800 mb-6 pb-2 border-b border-green-200">
                Payment Information
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Type *
                  </label>
                  <select
                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.paymentType
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white"
                    } shadow-sm`}
                    value={paymentType}
                    onChange={handlePaymentTypeChange}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="advance">💳 Advance Payment</option>
                    <option value="full">💰 Full Payment</option>
                    <option value="none">🏨 Pay at Hotel</option>
                  </select>
                  {errors.paymentType && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.paymentType}
                    </p>
                  )}
                </div>

                {paymentType === "advance" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Advance Amount (Rs)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter advance amount"
                      className="w-full p-4 border-2 border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                      value={advanceAmount}
                      onChange={handleAdvanceAmountChange}
                      min="0"
                      max={totalAmount}
                    />
                  </div>
                )}
              </div>

              {paymentType && (
                <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h5 className="font-bold text-gray-800 mb-4 text-lg">
                    Payment Summary
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        Rs.{totalAmount}
                      </p>
                    </div>
                    {paymentType === "advance" && advanceAmount > 0 && (
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-600 mb-1">
                          Advance Paid
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          Rs.{advanceAmount}
                        </p>
                      </div>
                    )}
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-orange-600 mb-1">
                        Remaining
                      </p>
                      <p className="text-2xl font-bold text-orange-800">
                        Rs.{remainingAmount}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                className="w-full sm:w-auto px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 border border-gray-300"
                onClick={resetForm}
              >
                🔄 Reset Form
              </button>
              <button
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={handleBooking}
              >
                Next: Review Booking →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionRoomBookingPage;
