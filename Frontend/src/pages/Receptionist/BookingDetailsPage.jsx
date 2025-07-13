import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalMessage, setStatusModalMessage] = useState("");

  // Edit booking states
  const [editingBooking, setEditingBooking] = useState(null);
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
  const [paymentType, setPaymentType] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // First try to fetch from receptionBookings (for reception-created bookings)
        let response;
        try {
          response = await axios.get(
            `http://localhost:5000/api/receptionBookings/${id}`
          );
        } catch (receptionError) {
          // If not found in reception bookings, try online bookings
          console.log('Not found in reception bookings, trying online bookings...');
          response = await axios.get(
            `http://localhost:5000/api/bookings/${id}`
          );
        }
        
        console.log('Booking data fetched:', response.data);
        setBooking(response.data);
        setStatus(response.data.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to fetch booking details');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Fetch available rooms when checkIn or checkOut changes, or when modal opens
  useEffect(() => {
    if (adminDetails.checkIn && adminDetails.checkOut && showEditModal) {
      fetchAvailableRooms();
    } else if (showEditModal && editingBooking) {
      // If modal opens but dates aren't set yet, still fetch available rooms for the current booking dates
      const checkIn = editingBooking.bookingDetails?.checkIn || editingBooking.checkIn;
      const checkOut = editingBooking.bookingDetails?.checkOut || editingBooking.checkOut;
      if (checkIn && checkOut) {
        fetchAvailableRoomsForDates(checkIn, checkOut);
      }
    }
  }, [adminDetails.checkIn, adminDetails.checkOut, showEditModal, editingBooking]);

  // Recalculate total amount when relevant fields change
  useEffect(() => {
    const newTotal = calculateTotalAmount();
    setTotalAmount(newTotal);
    setRemainingAmount(newTotal - (Number(advanceAmount) || 0));
  }, [selectedRoomType, acType, packageType, dayNightType, advanceAmount]);

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/receptionBookings/${id}`,
        { status }
      );
      setBooking({ ...booking, status, updatedAt: new Date() });
      setIsEditing(false);

      // Set appropriate success message based on status change
      let message = "";
      if (status === "cancelled") {
        message =
          "Booking cancelled successfully. The room is now available for new bookings.";
      } else if (status === "checked-out") {
        message =
          "Checked out successfully. The room is now available for new bookings.";
      } else {
        message = `Booking status updated to ${status} successfully.`;
      }

      setStatusModalMessage(message);
      setShowStatusModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/receptionBookings/${id}`);
      navigate("/receptionist/bookingsList", {
        state: { message: "Booking deleted successfully" },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditNavigation = () => {
    setShowEditModal(false);
    navigate(`/receptionist/bookings/${id}/edit`);
  };

  // Edit booking functions
  const fetchAvailableRooms = async () => {
    if (!adminDetails.checkIn || !adminDetails.checkOut) return;
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/receptionRooms/available?checkIn=${adminDetails.checkIn}&checkOut=${adminDetails.checkOut}`
      );
      setAvailableRooms(response.data);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setAvailableRooms([]);
    }
  };

  const fetchAvailableRoomsForDates = async (checkIn, checkOut) => {
    try {
      const checkInFormatted = new Date(checkIn).toISOString().slice(0, 16);
      const checkOutFormatted = new Date(checkOut).toISOString().slice(0, 16);
      
      const response = await axios.get(
        `http://localhost:5000/api/receptionRooms/available?checkIn=${checkInFormatted}&checkOut=${checkOutFormatted}`
      );
      setAvailableRooms(response.data);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setAvailableRooms([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFields = () => {
    const newErrors = {};

    // Only basic validation for edit mode - no required fields
    if (adminDetails.name && !adminDetails.name.trim()) newErrors.name = "Name cannot be empty if provided";
    if (adminDetails.mobile && !adminDetails.mobile.trim()) newErrors.mobile = "Mobile cannot be empty if provided";
    if (adminDetails.email && adminDetails.email.trim() && !/\S+@\S+\.\S+/.test(adminDetails.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (adminDetails.checkIn && adminDetails.checkOut && new Date(adminDetails.checkIn) >= new Date(adminDetails.checkOut)) {
      newErrors.checkOut = "Check-out must be after check-in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    if (!selectedRoomType || !acType || !packageType) return 0;

    let basePrice = 0;
    
    // Room type pricing
    const roomPrices = {
      "Single Room": 3000,
      "Double Room": 5000,
      "Triple Room": 7000
    };

    basePrice = roomPrices[selectedRoomType] || 0;

    if (packageType === "normal") {
      // Day/Night pricing for normal package
      if (dayNightType === "day") {
        basePrice *= 0.7; // 30% discount for day
      }
      // Night pricing remains full price
    } else {
      // Fixed pricing for meal packages
      const packagePrices = {
        "B/B": 8000,
        "H/B": 12000,
        "F/B": 15000
      };
      basePrice = packagePrices[packageType] || basePrice;
    }

    return basePrice;
  };

  const handleAdvanceAmountChange = (e) => {
    const advance = Number(e.target.value) || 0;
    setAdvanceAmount(advance);
    setRemainingAmount(totalAmount - advance);
  };

  const initializeEditBooking = (bookingData) => {
    setEditingBooking(bookingData);
    
    // Populate form with booking data
    setAdminDetails({
      name: bookingData.guestDetails?.name || bookingData.fullName || "",
      mobile: bookingData.guestDetails?.mobile || bookingData.phoneNumber || "",
      email: bookingData.guestDetails?.email || bookingData.email || "",
      whatsapp: bookingData.guestDetails?.whatsapp || bookingData.whatsappNumber || "",
      checkIn: new Date(bookingData.bookingDetails?.checkIn || bookingData.checkIn).toISOString().slice(0, 16),
      checkOut: new Date(bookingData.bookingDetails?.checkOut || bookingData.checkOut).toISOString().slice(0, 16),
    });
    
    setSelectedRoomType(bookingData.bookingDetails?.roomType || bookingData.roomType || "");
    setSelectedRoom(bookingData.bookingDetails?.roomNumber || bookingData.roomNumber || "");
    setAcType(bookingData.bookingDetails?.acType || "AC");
    setPackageType(bookingData.bookingDetails?.packageType || "normal");
    setDayNightType(bookingData.bookingDetails?.dayNightType || "");
    
    // Handle additional note from multiple sources
    const additionalNoteValue = bookingData.bookingDetails?.additionalNote || 
                               bookingData.originalData?.specialRequests || 
                               bookingData.specialRequests || "";
    setAdditionalNote(additionalNoteValue);
    
    setPaymentType(bookingData.paymentDetails?.paymentType || "cash");
    setAdvanceAmount(bookingData.paymentDetails?.advanceAmount || 0);
    setTotalAmount(bookingData.paymentDetails?.totalAmount || 0);
    setRemainingAmount(bookingData.paymentDetails?.remainingAmount || 0);
    
    setShowEditModal(true);
  };

  const updateBooking = async () => {
    if (!validateFields()) {
      setStatusModalMessage("❌ Please correct the highlighted errors before saving.");
      setShowStatusModal(true);
      return;
    }

    setLoading(true);

    const bookingData = {
      adminDetails: {
        name: adminDetails.name,
        mobile: adminDetails.mobile,
        email: adminDetails.email,
        whatsapp: adminDetails.whatsapp,
        checkIn: new Date(adminDetails.checkIn).toISOString(),
        checkOut: new Date(adminDetails.checkOut).toISOString(),
      },
      selectedRoom: {
        roomNumber: selectedRoom,
        acType: acType,
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

    console.log('Updating booking with ID:', editingBooking._id);
    console.log('Booking data:', bookingData);

    try {
      const response = await axios.put(`http://localhost:5000/api/receptionBookings/${editingBooking._id}`, bookingData);
      
      // Close edit modal first
      setShowEditModal(false);
      setEditingBooking(null);
      resetForm();
      
      // Show success modal
      setStatusModalMessage("Booking has been updated successfully!");
      setShowStatusModal(true);
      
      // Refresh the booking data - check which endpoint to use based on current booking type
      let bookingResponse;
      if (booking.bookingType === "online") {
        // For online bookings, first try receptionBookings (which handles both), fallback to bookings
        try {
          bookingResponse = await axios.get(`http://localhost:5000/api/receptionBookings/${id}`);
        } catch (error) {
          bookingResponse = await axios.get(`http://localhost:5000/api/bookings/${id}`);
        }
      } else {
        bookingResponse = await axios.get(`http://localhost:5000/api/receptionBookings/${id}`);
      }
      setBooking(bookingResponse.data);
    } catch (error) {
      console.error("Error updating booking:", error);
      console.error("Error response:", error);
      
      // Show error modal instead of alert
      setStatusModalMessage(`Error updating booking: ${error.response?.data?.error || error.message}`);
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
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
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Not Found:</strong>
        <span className="block sm:inline"> Booking not found</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete this booking? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Booking Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white">Edit Booking</h3>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Guest Details */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Guest Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={adminDetails.name}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Enter full name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={adminDetails.mobile}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.mobile ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Enter mobile number"
                      />
                      {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={adminDetails.email}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={adminDetails.whatsapp}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter WhatsApp number"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-In Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="checkIn"
                        value={adminDetails.checkIn}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.checkIn ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-Out Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="checkOut"
                        value={adminDetails.checkOut}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.checkOut ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
                    </div>
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Room Selection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type
                      </label>
                      <select
                        value={selectedRoomType}
                        onChange={(e) => {
                          setSelectedRoomType(e.target.value);
                          setSelectedRoom(""); // Reset room selection when room type changes
                        }}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.selectedRoomType ? "border-red-500" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select Room Type</option>
                        <option value="Single Room">Single Room</option>
                        <option value="Double Room">Double Room</option>
                        <option value="Triple Room">Triple Room</option>
                      </select>
                      {errors.selectedRoomType && <p className="text-red-500 text-sm mt-1">{errors.selectedRoomType}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number
                      </label>
                      <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.selectedRoom ? "border-red-500" : "border-gray-200"
                        }`}
                        disabled={!selectedRoomType}
                      >
                        <option value="">
                          {!selectedRoomType ? "Select Room Type First" : "Select Room"}
                        </option>
                        {selectedRoomType && availableRooms
                          .filter(room => room.roomType === selectedRoomType)
                          .map(room => (
                            <option key={room._id} value={room.roomNumber}>
                              Room {room.roomNumber}
                            </option>
                          ))
                        }
                        {/* Also include the current room if it's not in available rooms */}
                        {selectedRoom && !availableRooms.some(room => room.roomNumber === selectedRoom && room.roomType === selectedRoomType) && (
                          <option value={selectedRoom}>
                            Room {selectedRoom} (Current)
                          </option>
                        )}
                      </select>
                      {errors.selectedRoom && <p className="text-red-500 text-sm mt-1">{errors.selectedRoom}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AC Type
                      </label>
                      <select
                        value={acType}
                        onChange={(e) => setAcType(e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.acType ? "border-red-500" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select AC Type</option>
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                      </select>
                      {errors.acType && <p className="text-red-500 text-sm mt-1">{errors.acType}</p>}
                    </div>
                  </div>
                </div>

                {/* Package Selection */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Package Selection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Type
                      </label>
                      <select
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.packageType ? "border-red-500" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select Package</option>
                        <option value="normal">Room Only (Normal)</option>
                        <option value="B/B">Bed & Breakfast (B/B)</option>
                        <option value="H/B">Half Board (H/B)</option>
                        <option value="F/B">Full Board (F/B)</option>
                      </select>
                      {errors.packageType && <p className="text-red-500 text-sm mt-1">{errors.packageType}</p>}
                    </div>
                    
                    {packageType === "normal" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day/Night Type
                        </label>
                        <select
                          value={dayNightType}
                          onChange={(e) => setDayNightType(e.target.value)}
                          className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.dayNightType ? "border-red-500" : "border-gray-200"
                          }`}
                        >
                          <option value="">Select Type</option>
                          <option value="day">Day (30% Discount)</option>
                          <option value="night">Night (Full Price)</option>
                        </select>
                        {errors.dayNightType && <p className="text-red-500 text-sm mt-1">{errors.dayNightType}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Note (Optional)
                  </label>
                  <textarea
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter any additional notes or special requests..."
                  />
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Type
                      </label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.paymentType ? "border-red-500" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select Payment Type</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="online">Online Transfer</option>
                      </select>
                      {errors.paymentType && <p className="text-red-500 text-sm mt-1">{errors.paymentType}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount
                      </label>
                      <input
                        type="number"
                        value={totalAmount}
                        readOnly
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Advance Amount
                      </label>
                      <input
                        type="number"
                        value={advanceAmount}
                        onChange={handleAdvanceAmountChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter advance amount"
                        min="0"
                        max={totalAmount}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remaining Amount
                      </label>
                      <input
                        type="number"
                        value={remainingAmount}
                        readOnly
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingBooking(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateBooking}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Success Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <h3 className={`text-2xl font-bold mb-4 ${
                statusModalMessage.includes("Error") || statusModalMessage.includes("❌") 
                  ? "text-red-600" 
                  : "text-green-600"
              }`}>
                {statusModalMessage.includes("Error") || statusModalMessage.includes("❌") 
                  ? "Error!" 
                  : "Success!"
                }
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {statusModalMessage}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg ${
                    statusModalMessage.includes("Error") || statusModalMessage.includes("❌")
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Booking Details
              </h1>
              {booking.bookingType && (
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    booking.bookingType === "online"
                      ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                      : "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                  }`}
                >
                  {booking.bookingType === "online"
                    ? "Online Booking"
                    : "Reception Booking"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/receptionist/bookingsList")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Back to Bookings
              </button>
              <button
                onClick={() => initializeEditBooking(booking)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Edit Booking
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Guest & Booking Info */}
          <div className="xl:col-span-2 space-y-8">
            {/* Guest Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Guest Information
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Full Name
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                      {booking.guestDetails?.name || booking.fullName || "N/A"}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Mobile Number
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                      {booking.guestDetails?.mobile ||
                        booking.phoneNumber ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Email
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors break-all">
                      {booking.guestDetails?.email || booking.email || "N/A"}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      WhatsApp
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                      {booking.guestDetails?.whatsapp ||
                        booking.whatsappNumber ||
                        "N/A"}
                    </p>
                  </div>
                  {booking.bookingType === "online" && (
                    <>
                      <div className="group">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          NIC Number
                        </p>
                        <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {booking.originalData?.nicNumber || booking.nicNumber || "N/A"}
                        </p>
                      </div>
                      <div className="group">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Adults
                        </p>
                        <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {booking.originalData?.adults || booking.adults || "N/A"}
                        </p>
                      </div>
                      <div className="group">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Children
                        </p>
                        <p className="text-xl text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {booking.originalData?.children || booking.children || 0}
                        </p>
                      </div>
                      {(booking.originalData?.specialRequests || booking.specialRequests) && (
                        <div className="md:col-span-2 group">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Special Requests
                          </p>
                          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <p className="text-gray-800 font-medium leading-relaxed">
                              {booking.originalData?.specialRequests || booking.specialRequests}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Booking Information
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Check-In
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {formatDate(
                        booking.bookingDetails?.checkIn || booking.checkIn
                      )}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Check-Out
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {formatDate(
                        booking.bookingDetails?.checkOut || booking.checkOut
                      )}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Room Number
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {booking.bookingDetails?.roomNumber ||
                        booking.roomNumber ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Room Type
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {booking.bookingDetails?.roomType ||
                        booking.roomType ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      AC Type
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {booking.bookingDetails?.acType || "AC"}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Package Type
                    </p>
                    <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                      {(
                        booking.bookingDetails?.packageType || "room-only"
                      ).toUpperCase()}
                    </p>
                  </div>
                  {booking.bookingDetails?.dayNightType && (
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Day/Night Type
                      </p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-green-600 transition-colors">
                        {booking.bookingDetails.dayNightType.charAt(0).toUpperCase() + 
                         booking.bookingDetails.dayNightType.slice(1)}
                        {booking.bookingDetails.dayNightType === "day" && (
                          <span className="ml-2 text-sm text-green-600 font-semibold">(30% Discount)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Additional Note - Show if exists */}
                {(booking.bookingDetails?.additionalNote || 
                  booking.originalData?.specialRequests || 
                  booking.specialRequests) && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">
                      Additional Note / Special Requests
                    </p>
                    <p className="text-gray-800 leading-relaxed">
                      {booking.bookingDetails?.additionalNote || 
                       booking.originalData?.specialRequests || 
                       booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Information - Only for online bookings */}
            {booking.bookingType === "online" &&
              (booking.originalData?.document || booking.documentPath) && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                    <h2 className="text-2xl font-bold text-white">Payment Proof</h2>
                  </div>
                  <div className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                          Uploaded Payment Proof
                        </p>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mb-4">
                          <p className="text-sm text-purple-700 font-medium mb-1">
                            📄 Document Details
                          </p>
                          {/* <p className="text-xs text-purple-600">
                            Document Path: {booking.documentPath || booking.originalData?.document}
                          </p> */}
                          <p className="text-xs text-purple-600 mt-1">
                            This document may contain payment proof, ID verification, or booking confirmation.
                          </p>
                        </div>
                        <a
                          href={`http://localhost:5000${booking.documentPath || booking.originalData?.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Payment Proof
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Payment & Status */}
          <div className="space-y-8">
            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Payment Information
                </h2>
              </div>
              <div className="p-8">
                {booking.bookingType === "reception" &&
                booking.paymentDetails ? (
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Payment Type
                      </p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors capitalize">
                        {booking.paymentDetails.paymentType}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Total Amount
                      </p>
                      <p className="text-2xl text-gray-800 font-bold group-hover:text-orange-600 transition-colors">
                        Rs.{booking.paymentDetails.totalAmount}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Advance Paid
                      </p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                        Rs.{booking.paymentDetails.advanceAmount}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Remaining Amount
                      </p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                        Rs.{booking.paymentDetails.remainingAmount}
                      </p>
                    </div>
                  </div>
                ) : booking.bookingType === "online" ? (
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Payment Status
                      </p>
                      <p className="text-xl text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                        Pending - To be collected at check-in
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Room Details
                      </p>
                      <p className="text-lg text-gray-800 font-medium">
                        {booking.bookingDetails?.roomType || booking.roomType} - Room {booking.bookingDetails?.roomNumber || booking.roomNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-600 font-medium mb-2">
                        Payment information not available.
                      </p>
                      <p className="text-sm text-gray-500">
                        Payment will be collected at check-in.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Booking Status
                </h2>
              </div>
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Update Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                      >
                        {booking.bookingType === "online" ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                          </>
                        ) : (
                          <>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                            <option value="no-show">No Show</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleStatusUpdate}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                        Current Status
                      </p>
                      <span
                        className={`inline-flex items-center px-6 py-3 rounded-xl text-lg font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300"
                            : booking.status === "cancelled" ||
                              booking.status === "rejected"
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300"
                            : booking.status === "checked-in"
                            ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300"
                            : booking.status === "checked-out"
                            ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-2 border-purple-300"
                            : booking.status === "pending"
                            ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-300"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      Change Status
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Booking Timeline
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div className="ml-6">
                      <p className="text-lg font-semibold text-gray-900">
                        Booking Created
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  {booking.updatedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div className="ml-6">
                        <p className="text-lg font-semibold text-gray-900">
                          Status Updated
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(booking.updatedAt)} - Changed to{" "}
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
