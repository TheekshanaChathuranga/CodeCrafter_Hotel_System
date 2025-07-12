import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

const SimpleCalendar = ({ onDateSelect, selectedDate, bookings = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper function to safely access booking properties
  const getBookingData = (booking) => {
    return {
      checkIn: booking?.bookingDetails?.checkIn || booking?.checkIn || '',
      checkOut: booking?.bookingDetails?.checkOut || booking?.checkOut || '',
      roomType: booking?.bookingDetails?.roomType || booking?.roomType || 'Unknown'
    };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const bookingData = getBookingData(booking);
      if (!bookingData.checkIn || !bookingData.checkOut) return false;
      
      try {
        const checkIn = parseISO(bookingData.checkIn);
        const checkOut = parseISO(bookingData.checkOut);
        return (date >= checkIn && date <= checkOut);
      } catch (error) {
        console.error('Error parsing booking dates:', error);
        return false;
      }
    });
  };

  const handleDateClick = (day) => {
    if (onDateSelect) {
      onDateSelect(day);
    }
  };

  const getBookingColor = (roomType) => {
    switch (roomType) {
      case 'Single Room': return 'bg-blue-100';
      case 'Double Room': return 'bg-green-100';
      case 'Triple Room': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  const daysInMonth = getDaysInMonth();
  const monthName = format(currentDate, 'MMMM yyyy');

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => navigateMonth(-1)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
        <button 
          onClick={() => navigateMonth(1)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 text-sm py-1">
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
          const hasBookings = dayBookings.length > 0;

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`h-10 flex items-center justify-center text-sm cursor-pointer transition-colors relative
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'bg-blue-500 text-white rounded-full' : ''}
                ${isSelected ? 'ring-2 ring-blue-400 rounded' : ''}
                ${hasBookings && !isToday ? 'bg-blue-50' : ''}
                hover:bg-gray-100`}
            >
              <span className={isToday ? 'font-semibold' : ''}>
                {format(day, 'd')}
              </span>
              {hasBookings && !isToday && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleCalendar;
