import axios from "axios"; // Add axios import at the top
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Calendar } from "react-date-range";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { jwtDecode } from "jwt-decode";

const Room_Book = () => {
  const navigate = useNavigate(); // Initialize navigate
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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        let url = "http://localhost:5000/api/rooms";

        if (bookingDates.checkIn && bookingDates.checkOut) {
          const params = new URLSearchParams({
            checkIn: bookingDates.checkIn.toISOString(),
            checkOut: bookingDates.checkOut.toISOString(),
          });
          url = `http://localhost:5000/api/rooms/available?${params}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch rooms");
        }

        const data = await response.json();
        setRooms(data);
        setFilteredRooms(data);
      } catch (err) {
        setError(err.message);
        console.error("Fetch rooms error:", {
          message: err.message,
          stack: err.stack,
          url: url,
        });
      } finally {
        setLoading(false);
      }
    };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //adding part of reservation dates
  const handleDateSelect = (date, type) => {
    if (
      type === "checkOut" &&
      bookingDates.checkIn &&
      date <= bookingDates.checkIn
    ) {
      alert("Check-out date must be after check-in date");
      return;
    }

    setBookingDates((prev) => ({
      ...prev,
      [type]: date,
    }));
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
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

      // Append all form fields
      formData.append("roomNumber", selectedRoom.roomNumber);
      formData.append("roomType", selectedRoom.type);
      formData.append("checkIn", bookingDates.checkIn.toISOString());
      formData.append("checkOut", bookingDates.checkOut.toISOString());
      formData.append("fullName", e.target.elements.fullName.value.trim());
      formData.append(
        "phoneNumber",
        e.target.elements.phoneNumber.value.trim()
      );
      formData.append("nicNumber", e.target.elements.nicNumber.value.trim());
      formData.append(
        "whatsappNumber",
        e.target.elements.whatsappNumber.value.trim()
      );
      formData.append("adults", parseInt(e.target.elements.adults.value, 10));
      formData.append(
        "children",
        parseInt(e.target.elements.children.value, 10) || 0
      );
      formData.append(
        "specialRequests",
        e.target.elements.specialRequests.value.trim()
      );
      // Append user field
      formData.append("user", userId);

      // Validate adults count
      const adults = parseInt(e.target.elements.adults.value, 10);
      if (adults < 1 || isNaN(adults)) {
        throw new Error("Please select number of adults");
      }

      // Append document file
      if (fileInput.files[0]) {
        formData.append("document", fileInput.files[0]);
      } else {
        throw new Error("Document (Image/PDF) is required");
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

      // Handle success
      if (response.data.success) {
        alert(`✅ Booking Confirmed!\n
          Booking ID: ${response.data.bookingId}\n
          Room: ${response.data.details.roomNumber}\n
          Dates: ${new Date(
            response.data.details.dates.checkIn
          ).toLocaleDateString()} - ${new Date(
          response.data.details.dates.checkOut
        ).toLocaleDateString()}`);

        // Reset state
        setShowBookingForm(false);
        setSelectedRoom(null);
        setBookingDates({ checkIn: null, checkOut: null });
        setError(null);
        e.target.reset(); // Reset form fields including file input
      }
    } catch (error) {
      console.error("Booking error:", error);

      // Handle file validation errors
      if (error.message.includes("File size exceeds")) {
        alert("❌ File size exceeds 5MB limit");
        return;
      }

      // Handle server validation errors
      const serverError = error.response?.data;
      let errorMessage = "Booking failed. Please check your information.";

      if (serverError) {
        // Handle multiple error messages
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

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <Navbar />
  //       <div className="max-w-6xl mx-auto px-4 py-16 text-center text-red-500">
  //         <p>Error: {error}</p>
  //       </div>
  //     </div>
  //   );
  // }

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
              <div>
                <label className="block text-gray-700 mb-2">
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  date={bookingDates.checkIn}
                  onChange={(date) => handleDateSelect(date, "checkIn")}
                  minDate={new Date()}
                  className="border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Check-out Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  date={bookingDates.checkOut}
                  onChange={(date) => handleDateSelect(date, "checkOut")}
                  minDate={bookingDates.checkIn || new Date()}
                  className="border rounded-lg p-2"
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
                  <option value="4">4+ Adults</option>
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
          <h3 className="text-lg font-semibold mb-4">Select Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Check-in Date</label>
              <Calendar
                date={bookingDates.checkIn}
                onChange={(date) => handleDateSelect(date, "checkIn")}
                minDate={new Date()}
                className="border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Check-out Date</label>
              <Calendar
                date={bookingDates.checkOut}
                onChange={(date) => handleDateSelect(date, "checkOut")}
                minDate={bookingDates.checkIn || new Date()}
                className="border rounded-lg p-2"
              />
            </div>
          </div>
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