import axios from "axios"; // Add axios import at the top
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/UserAuthContext";

const Room_Book = () => {
  const navigate = useNavigate(); // Initialize navigate
  const { user } = useAuth(); // Get authenticated user data
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDates, setBookingDates] = useState({
    checkIn: null,
    checkOut: null,
  });
  const [filters, setFilters] = useState({
    type: "all",
    acOption: "all",
    minPrice: "",
    maxPrice: "",
  });
  // Form data state for controlled inputs
  const [formInputs, setFormInputs] = useState({
    fullName: "",
    acType: "", // Add AC type state
    bookingType: "", // Add booking type state
  });

  // Calendar state - Show calendars by default
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(true);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchUrl = "http://localhost:5000/api/rooms";

        if (bookingDates.checkIn && bookingDates.checkOut) {
          // Ensure we're working with Date objects
          const checkIn = new Date(bookingDates.checkIn);
          const checkOut = new Date(bookingDates.checkOut);

          // Add one day to checkOut date to include the full last day
          const adjustedCheckOut = new Date(checkOut);
          adjustedCheckOut.setDate(adjustedCheckOut.getDate() + 1);

          // Validate dates
          if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            throw new Error("Invalid dates selected");
          }

          // Create URL with properly formatted dates
          const params = new URLSearchParams({
            checkIn: checkIn.toISOString(),
            checkOut: adjustedCheckOut.toISOString(),
          });
          fetchUrl = `http://localhost:5000/api/rooms/available?${params}`;

          console.log("Fetching rooms with URL:", fetchUrl);
        }

        const response = await fetch(fetchUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Received response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Failed to fetch rooms"
          );
        }

        // Handle the response data
        const roomsArray = data.rooms || data;
        if (!Array.isArray(roomsArray)) {
          throw new Error("Invalid data format received from server");
        }

        console.log(`Fetched ${roomsArray.length} rooms successfully`);

        setRooms(roomsArray);
        setFilteredRooms(roomsArray);
        setError(null);
      } catch (err) {
        console.error("Fetch rooms error:", err);
        setError(err.message || "Failed to load rooms. Please try again.");
        setRooms([]);
        setFilteredRooms([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if dates are selected or no dates are selected
    fetchRooms();
  }, [bookingDates.checkIn, bookingDates.checkOut]);

  // Apply filters
  useEffect(() => {
    let result = rooms;

    if (filters.type !== "all") {
      result = result.filter((room) => room.type === filters.type);
    }

    if (filters.acOption !== "all") {
      result = result.filter((room) => room.acOption === filters.acOption);
    }

    if (filters.minPrice) {
      result = result.filter(
        (room) => room.pricePerNight >= Number(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      result = result.filter(
        (room) => room.pricePerNight <= Number(filters.maxPrice)
      );
    }

    setFilteredRooms(result);
  }, [filters, rooms]);

  // Auto-fill full name when user data becomes available
  useEffect(() => {
    if (user) {
      const userFullName = user.fullName || user.username || "";
      if (userFullName) {
        setFormInputs((prev) => ({
          ...prev,
          fullName: userFullName,
          acType: "", // Reset AC type when user changes
          bookingType: "", // Reset booking type when user changes
        }));
      }
    }
  }, [user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //adding part of reservation dates
  const handleDateSelect = (date, type) => {
    // Ensure we're working with date objects
    const selectedDate = new Date(date);
    const currentDate = new Date();

    // Reset time part to midnight for accurate day comparison
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Validate selected date is not in the past
    if (selectedDate < currentDate) {
      alert("Cannot select dates in the past");
      return;
    }

    if (type === "checkOut" && bookingDates.checkIn) {
      const checkInDate = new Date(bookingDates.checkIn);
      checkInDate.setHours(0, 0, 0, 0);

      if (selectedDate <= checkInDate) {
        alert("Check-out date must be after check-in date");
        return;
      }
    }

    if (type === "checkIn" && bookingDates.checkOut) {
      const checkOutDate = new Date(bookingDates.checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      if (selectedDate >= checkOutDate) {
        // Reset checkout date if check-in date is after or equal to it
        setBookingDates((prev) => ({
          ...prev,
          checkOut: null,
          [type]: selectedDate,
        }));
        return;
      }
    }

    setBookingDates((prev) => ({
      ...prev,
      [type]: selectedDate,
    }));
  };

  // Calendar helper functions
  const getCalendarDays = (month) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date, type) => {
    const targetDate =
      type === "checkIn" ? bookingDates.checkIn : bookingDates.checkOut;
    if (!targetDate) return false;

    return (
      date.getDate() === targetDate.getDate() &&
      date.getMonth() === targetDate.getMonth() &&
      date.getFullYear() === targetDate.getFullYear()
    );
  };

  const isDateInRange = (date) => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) return false;
    return date >= bookingDates.checkIn && date <= bookingDates.checkOut;
  };

  const handleCalendarDateClick = (day, type) => {
    if (!day) return;

    const selectedDate = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );

    if (isDateDisabled(selectedDate)) return;

    handleDateSelect(selectedDate, type);

    // Keep calendars open - don't close them after selection
  };

  const navigateCalendarMonth = (direction) => {
    setCalendarMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Inline Calendar Component
  const InlineCalendar = ({ type, isVisible }) => {
    if (!isVisible) return null;

    const days = getCalendarDays(calendarMonth);

    return (
      <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigateCalendarMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h3 className="text-lg font-semibold">
            {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
          </h3>

          <button
            type="button"
            onClick={() => navigateCalendarMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2"></div>;
            }

            const date = new Date(
              calendarMonth.getFullYear(),
              calendarMonth.getMonth(),
              day
            );
            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date, type);
            const inRange = isDateInRange(date);

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleCalendarDateClick(day, type)}
                disabled={disabled}
                className={`
                  p-2 text-sm rounded-lg transition-all relative
                  ${
                    disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-blue-100 cursor-pointer"
                  }
                  ${selected ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                  ${inRange && !selected ? "bg-blue-100 text-blue-700" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Today Button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              if (!isDateDisabled(today)) {
                handleDateSelect(today, type);
                setCalendarMonth(today);
              }
            }}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    );
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    // Reset AC preference when selecting a new room
    setFormInputs((prev) => ({
      ...prev,
      acType: "",
      bookingType: "", // Reset booking type when selecting new room
    }));
    setShowBookingForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!bookingDates.checkIn || !bookingDates.checkOut) {
        throw new Error("Please select both check-in and check-out dates");
      }
      if (bookingDates.checkOut <= bookingDates.checkIn) {
        throw new Error("Check-out date must be after check-in date");
      }

      // Get user token from localStorage and decode userId
      let token =
        localStorage.getItem("userToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");
      if (!token) {
        throw new Error("User not logged in. Please log in to book a room.");
      }

      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId || decoded.id || decoded._id || decoded.sub;
      } catch (err) {
        throw new Error("Invalid user token. Please log in again.");
      }

      if (!userId) {
        throw new Error("User ID not found in token.");
      }

      // Create FormData object
      const formData = new FormData();
      const fileInput = e.target.elements.document;

      // Validate file
      if (!fileInput.files[0]) {
        throw new Error("Document (Image/PDF) is required");
      }

      // Validate adults count
      const adults = parseInt(e.target.elements.adults.value, 10);
      if (adults < 1 || isNaN(adults)) {
        throw new Error("Please select number of adults");
      }

      // Validate AC preference for Flexible rooms
      if (selectedRoom.acOption === "Flexible") {
        const acType = formInputs.acType || e.target.elements.acType?.value;
        if (!acType) {
          throw new Error("Please select AC type for this flexible room");
        }
      }

      // Validate booking type
      const bookingType =
        formInputs.bookingType || e.target.elements.bookingType?.value;
      if (!bookingType) {
        throw new Error("Please select booking type (Day or Night)");
      }

      // Append all form fields
      formData.append("roomNumber", selectedRoom.roomNumber);
      formData.append("roomType", selectedRoom.type);
      formData.append("roomAcOption", selectedRoom.acOption); // Add AC preference if the room is Flexible
      if (selectedRoom.acOption === "Flexible") {
        const acType = formInputs.acType || e.target.elements.acType?.value;
        formData.append("acType", acType);
      }

      // Add booking type and calculate price
      formData.append("bookingType", bookingType);

      // Calculate price based on booking type
      const pricePerUnit =
        bookingType === "Night"
          ? selectedRoom.pricePerNight
          : selectedRoom.pricePerDay;

      // Calculate total nights/days
      const timeDiff =
        new Date(bookingDates.checkOut) - new Date(bookingDates.checkIn);
      const numberOfUnits = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Number of days
      const totalPrice = pricePerUnit * numberOfUnits;

      formData.append("pricePerUnit", pricePerUnit);
      formData.append("totalPrice", totalPrice);

      formData.append("checkIn", bookingDates.checkIn.toISOString());
      formData.append("checkOut", bookingDates.checkOut.toISOString());
      formData.append(
        "fullName",
        formInputs.fullName.trim() || e.target.elements.fullName.value.trim()
      );
      formData.append(
        "phoneNumber",
        e.target.elements.phoneNumber.value.trim()
      );
      formData.append("nicNumber", e.target.elements.nicNumber.value.trim());
      formData.append(
        "whatsappNumber",
        e.target.elements.whatsappNumber.value.trim()
      );
      formData.append("adults", adults);
      formData.append(
        "children",
        parseInt(e.target.elements.children.value, 10) || 0
      );
      formData.append(
        "specialRequests",
        e.target.elements.specialRequests.value.trim()
      );
      formData.append("user", userId);
      formData.append("document", fileInput.files[0]);

      // Log form data for debugging
      for (let [key, value] of formData.entries()) {
        console.log(
          `Form Data: ${key} = ${value instanceof File ? value.name : value}`
        );
      }

      // Send to backend with multipart/form-data
      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Server response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Booking failed");
      }

      // Set booking confirmation details and show popup
      setBookingConfirmation({
        bookingId: response.data.bookingId,
        roomNumber: response.data.details.roomNumber,
        checkIn: new Date(
          response.data.details.dates.checkIn
        ).toLocaleDateString(),
        checkOut: new Date(
          response.data.details.dates.checkOut
        ).toLocaleDateString(),
      });

      // Show success popup
      setShowSuccessPopup(true);

      // Reset form state
      setShowBookingForm(false);
      setSelectedRoom(null);
      setError(null);

      // Reset controlled form inputs
      setFormInputs({
        fullName: user?.fullName || user?.username || "", // Keep user name for next booking
        acType: "", // Reset AC type
        bookingType: "", // Reset booking type
      });

      e.target.reset(); // Reset form fields including file input
    } catch (error) {
      console.error("Booking error:", error);

      // Handle file validation errors
      if (error.message.includes("File size exceeds")) {
        alert("❌ File size exceeds 5MB limit");
        return;
      }

      // Handle server validation errors
      const serverError = error.response?.data;
      let errorMessage =
        error.message || "Booking failed. Please check your information.";

      if (serverError) {
        if (Array.isArray(serverError.errors)) {
          errorMessage = serverError.errors.join("\n");
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
      }

      // Special case for date conflicts
      if (errorMessage.toLowerCase().includes("already booked")) {
        errorMessage += "\nPlease select different dates.";
      }

      // Update UI state and show alert
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
    }
  };

  // Booking Success Popup Component
  const BookingSuccessPopup = () => {
    if (!showSuccessPopup || !bookingConfirmation) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
          <div className="p-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Booking Confirmed!
            </h2>

            {/* Booking Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-semibold text-gray-800">
                      {bookingConfirmation.bookingId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Number</p>
                    <p className="font-semibold text-gray-800">
                      {bookingConfirmation.roomNumber}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Stay Duration</p>
                    <p className="font-semibold text-gray-800">
                      {bookingConfirmation.checkIn} -{" "}
                      {bookingConfirmation.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setBookingConfirmation(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setBookingConfirmation(null);
                  navigate("/mybookings"); // If you have a bookings page
                }}
                className="w-full bg-blue-100 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Rooms
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setError(null);
                  setBookingDates({ checkIn: null, checkOut: null });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setBookingDates({ checkIn: null, checkOut: null });
                  setFilters({
                    type: "all",
                    acOption: "all",
                    minPrice: "",
                    maxPrice: "",
                  });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

      {/* Hero Section */}
      <div className="relative h-95 bg-[url('img/RoomPage.jpeg')] bg-cover bg-center">
        {/* <button
          onClick={() => navigate(-1)}
          //className="absolute mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-700 z-10"
        >
          Go Back
        </button> */}
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-6xl mx-auto px-4 text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Room Booking</h1>
            <p className="text-xl">Choose your perfect accommodation</p>
          </div>
        </div>
      </div>

      {/* Booking Form (shown when a room is selected) */}
      {showBookingForm && selectedRoom && (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg my-8">
          <h2 className="text-2xl font-bold mb-4">
            Booking Room {selectedRoom.roomNumber}
          </h2>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="calendar-container">
                <label className="block text-gray-700 mb-2">
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      bookingDates.checkIn
                        ? bookingDates.checkIn.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Select check-in date"
                    }
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                    required
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <InlineCalendar
                  type="checkIn"
                  isVisible={showCheckInCalendar}
                />
              </div>
              <div className="calendar-container">
                <label className="block text-gray-700 mb-2">
                  Check-out Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      bookingDates.checkOut
                        ? bookingDates.checkOut.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Select check-out date"
                    }
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                    required
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <InlineCalendar
                  type="checkOut"
                  isVisible={showCheckOutCalendar}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  value={formInputs.fullName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">NIC Number</label>
                <input
                  name="nicNumber"
                  type="text"
                  placeholder="Optional"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phoneNumber"
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  name="whatsappNumber"
                  type="tel"
                  placeholder="Optional (if different from phone number)"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Number of Adults <span className="text-red-500">*</span>
                </label>
                <select
                  name="adults"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4+">4+ Adults</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Number of Children
                </label>
                <select
                  name="children"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">0 Children</option>
                  <option value="1">1 Child</option>
                  <option value="2">2 Children</option>
                  <option value="3">3 Children</option>
                  <option value="4+">4+ Children</option>
                </select>
              </div>
            </div>

            {/* AC/Non-AC Preference - Only show for Flexible rooms */}
            {selectedRoom && selectedRoom.acOption === "Flexible" && (
              <div>
                <label className="block text-gray-700 mb-2">
                  AC Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="acType"
                  value={formInputs.acType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select AC option</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  This room offers flexible AC options. Please select your
                  preference.
                </p>
              </div>
            )}

            {/* Booking Type - Day or Night */}
            <div>
              <label className="block text-gray-700 mb-2">
                Booking Type <span className="text-red-500">*</span>
              </label>
              <select
                name="bookingType"
                value={formInputs.bookingType}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select booking type</option>
                <option value="Day">
                  Day (LKR {selectedRoom?.pricePerDay}/day)
                </option>
                <option value="Night">
                  Night (LKR {selectedRoom?.pricePerNight}/night)
                </option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose between day rate or night rate for your stay.
              </p>
            </div>

            {/* Price Summary */}
            {formInputs.bookingType &&
              bookingDates.checkIn &&
              bookingDates.checkOut && (
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Price Summary
                  </h4>
                  {(() => {
                    const pricePerUnit =
                      formInputs.bookingType === "Night"
                        ? selectedRoom?.pricePerNight
                        : selectedRoom?.pricePerDay;
                    const timeDiff =
                      new Date(bookingDates.checkOut) -
                      new Date(bookingDates.checkIn);
                    const numberOfUnits = Math.ceil(
                      timeDiff / (1000 * 60 * 60 * 24)
                    );
                    const totalPrice = pricePerUnit * numberOfUnits;

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>
                            Rate per {formInputs.bookingType.toLowerCase()}:
                          </span>
                          <span>LKR {pricePerUnit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Number of {formInputs.bookingType.toLowerCase()}s:
                          </span>
                          <span>{numberOfUnits}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total Amount:</span>
                          <span>LKR {totalPrice}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            <div>
              <label className="block text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                name="specialRequests"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any special requirements or notes..."
              ></textarea>
            </div>
            {/* Add this section to the form */}
            <div>
              <label className="block text-gray-700 mb-2">
                Upload receipt of Advanced (Image/PDF){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="document"
                accept=".jpg,.jpeg,.png,.pdf"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5MB limit");
                    e.target.value = "";
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size: 5MB (Allowed formats: JPG, PNG, PDF)
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add this above the existing filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Select Your Stay Dates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="calendar-container">
              <label className="block text-gray-700 mb-3 font-medium">
                Check-in Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={
                    bookingDates.checkIn
                      ? bookingDates.checkIn.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Select check-in date"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <InlineCalendar type="checkIn" isVisible={showCheckInCalendar} />
            </div>

            <div className="calendar-container">
              <label className="block text-gray-700 mb-3 font-medium">
                Check-out Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={
                    bookingDates.checkOut
                      ? bookingDates.checkOut.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Select check-out date"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <InlineCalendar
                type="checkOut"
                isVisible={showCheckOutCalendar}
              />
            </div>
          </div>

          {/* Display selected date range */}
          {bookingDates.checkIn && bookingDates.checkOut && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">
                  Selected Stay Period
                </h4>
                <p className="text-blue-700">
                  <span className="font-medium">Check-in:</span>{" "}
                  {bookingDates.checkIn.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-blue-700">
                  <span className="font-medium">Check-out:</span>{" "}
                  {bookingDates.checkOut.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-blue-600 font-semibold mt-1">
                  Duration:{" "}
                  {Math.ceil(
                    (bookingDates.checkOut - bookingDates.checkIn) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  night(s)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Filter Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Room Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">AC Option</label>
              <select
                name="acOption"
                value={filters.acOption}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">All Options</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Min Price (LKR)
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min price"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Max Price (LKR)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max price"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/*Rooms Listing*/}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">
          Available Rooms ({filteredRooms.length})
        </h2>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">
              No rooms match your filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  type: "all",
                  acOption: "all",
                  minPrice: "",
                  maxPrice: "",
                })
              }
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  room.roomStatus !== "Available" ? "opacity-70" : ""
                }`}
              >
                {/* Room Image */}
                <div className="h-64 bg-gray-200 flex items-center justify-center relative">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${room.images[0]}`}
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No image available</span>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {room.roomNumber}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{room.type} Room</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        room.roomStatus === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.roomStatus}
                    </span>
                  </div>

                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 mr-4">{room.acOption}</span>
                    <span className="text-blue-600 font-semibold">
                      LKR {room.pricePerNight.toLocaleString()}/night
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {room.description || "No description available"}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.hasAC && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Air Conditioned
                      </span>
                    )}
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {room.type}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {room.pricePerDay
                        ? `LKR ${room.pricePerDay}/day`
                        : "Daily rate not set"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookNow(room)}
                    disabled={room.roomStatus !== "Available"}
                    className={`w-full text-center px-6 py-2 rounded-lg font-semibold transition-colors ${
                      room.roomStatus === "Available"
                        ? "bg-blue-600 hover:bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {room.roomStatus === "Available"
                      ? "Book Now"
                      : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Success Popup */}
      <BookingSuccessPopup />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2025 The Lake Hotel & Resort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Room_Book;
