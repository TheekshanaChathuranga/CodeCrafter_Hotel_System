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
  const [dayNightType, setDayNightType] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
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

  // Recalculate total amount when relevant fields change
  useEffect(() => {
    if (selectedRoomType && packageType) {
      if (packageType === "normal" && selectedRoomType !== "Honeymoon") {
        // For normal package (except Honeymoon), need Day/Night and AC selection
        if (dayNightType && acType) {
          calculateTotalAmount();
        }
      } else {
        // For other packages or Honeymoon, calculate immediately
        calculateTotalAmount();
      }
    }
  }, [selectedRoomType, acType, packageType, dayNightType]);

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

    // Reset all selections when package changes - no auto-selection
    setSelectedRoomType("");
    setAcType("");
    setSelectedRoom("");
    setDayNightType("");
    setAdditionalNote("");
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
    
    // AC type is required for all packages and room types
    if (!acType) {
      newErrors.acType = "AC/Non-AC selection is required.";
    }
    
    // Day/Night selection is required for normal package only
    if (packageType === "normal" && !dayNightType) {
      newErrors.dayNightType = "Day/Night selection is required for normal package.";
    }
    
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
    setDayNightType("");
    setAdditionalNote("");
    setPaymentType("");
    setAdvanceAmount("");
    setTotalAmount(0);
    setRemainingAmount(0);
    setErrors({});
    setShowConfirmation(false);
  };

  const calculateTotalAmount = () => {
    let amount = 0;
    
    if (packageType === "b/b") {
      // B/B package has fixed prices regardless of AC type and Day/Night
      if (selectedRoomType === "Single Room") {
        amount = 7000;
      } else if (selectedRoomType === "Double Room") {
        amount = 9000;
      } else if (selectedRoomType === "Triple Room") {
        amount = 11000;
      } else if (selectedRoomType === "Honeymoon") {
        amount = 15000;
      }
    } else if (packageType === "h/b") {
      // H/B package has fixed prices regardless of AC type and Day/Night
      if (selectedRoomType === "Single Room") {
        amount = 11000;
      } else if (selectedRoomType === "Double Room") {
        amount = 13500;
      } else if (selectedRoomType === "Triple Room") {
        amount = 15000;
      } else if (selectedRoomType === "Honeymoon") {
        amount = 18000;
      }
    } else if (packageType === "f/b") {
      // F/B package has fixed prices regardless of AC type and Day/Night
      if (selectedRoomType === "Single Room") {
        amount = 15000;
      } else if (selectedRoomType === "Double Room") {
        amount = 17500;
      } else if (selectedRoomType === "Triple Room") {
        amount = 19000;
      } else if (selectedRoomType === "Honeymoon") {
        amount = 22000;
      }
    } else if (packageType === "normal") {
      // Normal package pricing based on Room Type, AC/Non-AC, and Day/Night
      if (selectedRoomType === "Honeymoon") {
        // Honeymoon room has fixed price regardless of AC/Non-AC and Day/Night
        amount = 10000;
      } else {
        // Day/Night pricing for other room types
        if (dayNightType === "Day") {
          if (acType === "Non-AC") {
            if (selectedRoomType === "Single Room") amount = 3000;
            else if (selectedRoomType === "Double Room") amount = 4000;
            else if (selectedRoomType === "Triple Room") amount = 6000;
          } else if (acType === "AC") {
            if (selectedRoomType === "Single Room") amount = 4000;
            else if (selectedRoomType === "Double Room") amount = 5000;
            else if (selectedRoomType === "Triple Room") amount = 7500;
          }
        } else if (dayNightType === "Night") {
          if (acType === "Non-AC") {
            if (selectedRoomType === "Single Room") amount = 4000;
            else if (selectedRoomType === "Double Room") amount = 6000;
            else if (selectedRoomType === "Triple Room") amount = 7500;
          } else if (acType === "AC") {
            if (selectedRoomType === "Single Room") amount = 5000;
            else if (selectedRoomType === "Double Room") amount = 7500;
            else if (selectedRoomType === "Triple Room") amount = 9000;
          }
        }
      }
    }

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
      dayNightType: packageType === "normal" ? dayNightType : null,
      additionalNote: additionalNote.trim() || null,
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
    
    // Don't auto-set AC type, let reception choose manually
    setAcType("");
    
    // Reset Day/Night selection when room type changes
    setDayNightType("");
    
    calculateTotalAmount();
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);

    const room = availableRooms.find((r) => r.id === roomId);
    if (room) {
      // Only auto-set Non-AC for room 102 (if it's specifically a Non-AC room)
      if (room.id === "102" && room.acType === "Non-AC") {
        setAcType("Non-AC");
      }
      // For all other rooms, let reception choose manually
    }
  };

  // Helper function to get pricing information display
  const getPricingInfo = () => {
    if (!packageType || !selectedRoomType) return null;

    if (packageType === "b/b") {
      const prices = {
        "Single Room": "Rs.7,000",
        "Double Room": "Rs.9,000", 
        "Triple Room": "Rs.11,000",
        "Honeymoon": "Rs.15,000"
      };
      return `B/B Fixed Rate: ${prices[selectedRoomType]}`;
    } else if (packageType === "h/b") {
      const prices = {
        "Single Room": "Rs.11,000",
        "Double Room": "Rs.13,500",
        "Triple Room": "Rs.15,000", 
        "Honeymoon": "Rs.18,000"
      };
      return `H/B Fixed Rate: ${prices[selectedRoomType]}`;
    } else if (packageType === "f/b") {
      const prices = {
        "Single Room": "Rs.15,000",
        "Double Room": "Rs.17,500",
        "Triple Room": "Rs.19,000",
        "Honeymoon": "Rs.22,000"
      };
      return `F/B Fixed Rate: ${prices[selectedRoomType]}`;
    } else if (packageType === "normal") {
      if (selectedRoomType === "Honeymoon") {
        return "Honeymoon Suite: Rs.10,000 (Fixed rate)";
      } else if (dayNightType && acType) {
        const dayPrices = {
          "Single Room": { "AC": "Rs.4,000", "Non-AC": "Rs.3,000" },
          "Double Room": { "AC": "Rs.5,000", "Non-AC": "Rs.4,000" },
          "Triple Room": { "AC": "Rs.7,500", "Non-AC": "Rs.6,000" }
        };
        const nightPrices = {
          "Single Room": { "AC": "Rs.5,000", "Non-AC": "Rs.4,000" },
          "Double Room": { "AC": "Rs.7,500", "Non-AC": "Rs.6,000" },
          "Triple Room": { "AC": "Rs.9,000", "Non-AC": "Rs.7,500" }
        };
        const priceSet = dayNightType === "Day" ? dayPrices : nightPrices;
        return `${dayNightType} Rate (${acType}): ${priceSet[selectedRoomType]?.[acType]}`;
      }
    }
    return null;
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          
          {/* Navigation Tabs */}
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
                      {packageType === "normal" && dayNightType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">
                            Time:
                          </span>
                          <span className="text-gray-900">{dayNightType}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Package:
                        </span>
                        <span className="text-gray-900">
                          {packageType.toUpperCase()}
                        </span>
                      </div>
                      {additionalNote && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex flex-col">
                            <span className="text-gray-600 font-medium mb-1">
                              Additional Notes:
                            </span>
                            <span className="text-gray-900 text-sm bg-gray-50 p-2 rounded italic">
                              "{additionalNote}"
                            </span>
                          </div>
                        </div>
                      )}
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
                        🍽️ Full Board (f/b) - All meals included (Fixed rates)
                      </option>
                      <option value="h/b">
                        🥞 Half Board (h/b) - Breakfast & dinner (Fixed rates)
                      </option>
                      <option value="b/b">
                        🍳 Bed & Breakfast (b/b) - Breakfast included (Fixed rates)
                      </option>
                      <option value="normal">🏨 Normal - Room only (Day/Night rates)</option>
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
                        } shadow-sm`}
                        value={selectedRoomType}
                        onChange={handleRoomTypeChange}
                      >
                        <option value="">Select Room Type</option>
                        <option value="Single Room">Single Room</option>
                        <option value="Double Room">Double Room</option>
                        <option value="Triple Room">Triple Room</option>
                        <option value="Honeymoon">Honeymoon Suite</option>
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
                        } shadow-sm`}
                        value={acType}
                        onChange={(e) => setAcType(e.target.value)}
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

                  {/* Day/Night Selection - Only show for normal package */}
                  {packageType === "normal" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Day/Night Selection *
                      </label>
                      <select
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                          errors.dayNightType
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-white"
                        } shadow-sm`}
                        value={dayNightType}
                        onChange={(e) => setDayNightType(e.target.value)}
                      >
                        <option value="">Select Day/Night</option>
                        <option value="Day">☀️ Day Time</option>
                        <option value="Night">🌙 Night Time</option>
                      </select>
                      {errors.dayNightType && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.dayNightType}
                        </p>
                      )}
                    </div>
                  )}

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
                          if (selectedRoomType === "Honeymoon")
                            return room.type === "Double Room" || room.type === "Triple Room";
                          return false;
                        })
                        .map((room) => (
                          <option key={room.id} value={room.id}>
                            Room {room.id} - {room.type}
                          </option>
                        ))}
                    </select>
                    {errors.selectedRoom && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.selectedRoom}
                      </p>
                    )}
                  </div>

                  {/* Pricing Information Display */}
                  {getPricingInfo() && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💰</span>
                        <div>
                          <p className="font-semibold text-gray-800">Current Pricing</p>
                          <p className="text-lg font-bold text-green-600">{getPricingInfo()}</p>
                          {totalAmount > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Total Amount: <span className="font-bold text-blue-600">Rs.{totalAmount.toLocaleString()}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Note Section */}
            <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
              <h4 className="text-xl font-bold text-indigo-800 mb-6 pb-2 border-b border-indigo-200">
                Additional Notes
              </h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requests or Notes (Optional)
                </label>
                <textarea
                  placeholder="Any special requests, dietary requirements, accessibility needs, or other notes..."
                  className="w-full p-4 border-2 border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm resize-vertical"
                  rows={4}
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  maxLength={500}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {additionalNote.length}/500 characters
                </p>
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

