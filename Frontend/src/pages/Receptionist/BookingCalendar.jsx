import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

const BookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);

  // Helper function to safely access booking properties
  const getBookingData = (booking) => {
    return {
      guestName: booking?.guestDetails?.name || "Unknown Guest",
      roomNumber: booking?.bookingDetails?.roomNumber || "N/A",
      roomType: booking?.bookingDetails?.roomType || "Unknown",
      checkIn: booking?.bookingDetails?.checkIn || "",
      checkOut: booking?.bookingDetails?.checkOut || "",
      mobile: booking?.guestDetails?.mobile || "N/A",
      totalAmount: booking?.paymentDetails?.totalAmount || 0,
      status: booking?.status || "pending",
    };
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/receptionBookings"
        );
        const data = await response.json();
        setBookings(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      const bookingData = getBookingData(booking);
      if (!bookingData.checkIn || !bookingData.checkOut) return false;

      try {
        const checkIn = parseISO(bookingData.checkIn);
        const checkOut = parseISO(bookingData.checkOut);
        return date >= checkIn && date <= checkOut;
      } catch (error) {
        console.error("Error parsing booking dates:", error);
        return false;
      }
    });
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setSelectedBookings(getBookingsForDate(day));
  };

  const getBookingColor = (roomType) => {
    switch (roomType) {
      case "Single Room":
        return "bg-blue-200 border-blue-500";
      case "Double Room":
        return "bg-green-200 border-green-500";
      case "Triple Room":
        return "bg-purple-200 border-purple-500";
      default:
        return "bg-gray-200 border-gray-500";
    }
  };

  const daysInMonth = getDaysInMonth();
  const monthName = format(currentDate, "MMMM yyyy");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-24 p-1 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                  ${isToday ? "border-blue-500 border-2" : "border-gray-200"}
                  ${isSelected ? "ring-2 ring-blue-400" : ""}
                  hover:bg-gray-50`}
              >
                <div className="text-right mb-1">
                  <span
                    className={`inline-block rounded-full w-6 h-6 text-center leading-6
                    ${isToday ? "bg-blue-500 text-white" : ""}`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {dayBookings.slice(0, 2).map((booking) => {
                    const bookingData = getBookingData(booking);
                    return (
                      <div
                        key={booking._id}
                        className={`text-xs p-1 rounded border-l-4 truncate ${getBookingColor(
                          bookingData.roomType
                        )}`}
                        title={`${bookingData.guestName} - ${bookingData.roomNumber}`}
                      >
                        {bookingData.roomNumber}
                      </div>
                    );
                  })}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking Details Panel */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Bookings for {format(selectedDate, "MMMM d, yyyy")}
            </h3>

            {selectedBookings.length === 0 ? (
              <p className="text-gray-500">No bookings for this date</p>
            ) : (
              <div className="space-y-3">
                {selectedBookings.map((booking) => {
                  const bookingData = getBookingData(booking);
                  return (
                    <div
                      key={booking._id}
                      className={`p-3 rounded-lg border-l-4 ${getBookingColor(
                        bookingData.roomType
                      )}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {bookingData.guestName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Room {bookingData.roomNumber} (
                            {bookingData.roomType})
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full 
                          ${
                            bookingData.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : bookingData.status === "checked-in"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {bookingData.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Check-in:</span>{" "}
                          {bookingData.checkIn
                            ? format(parseISO(bookingData.checkIn), "MMM d")
                            : "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Check-out:</span>{" "}
                          {bookingData.checkOut
                            ? format(parseISO(bookingData.checkOut), "MMM d")
                            : "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Contact:</span>{" "}
                          {bookingData.mobile}
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span> Rs.{" "}
                          {bookingData.totalAmount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
