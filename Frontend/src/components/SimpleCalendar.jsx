import React, { useState, useEffect } from 'react';

const SimpleCalendar = ({ onDateSelect, selectedDate, bookings = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, bookings]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks of days
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dayBookings = getBookingsForDate(current);
        days.push({
          date: new Date(current),
          isCurrentMonth: current.getMonth() === month,
          isToday: isToday(current),
          isSelected: selectedDate && isSameDay(current, selectedDate),
          bookingsCount: dayBookings.length,
          hasCheckIns: dayBookings.some(b => isCheckInDay(b, current)),
          hasCheckOuts: dayBookings.some(b => isCheckOutDay(b, current))
        });
        current.setDate(current.getDate() + 1);
      }
    }
    
    setCalendarDays(days);
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.bookingDetails.checkIn);
      const checkOut = new Date(booking.bookingDetails.checkOut);
      return date >= checkIn && date <= checkOut;
    });
  };

  const isCheckInDay = (booking, date) => {
    const checkIn = new Date(booking.bookingDetails.checkIn);
    return isSameDay(checkIn, date);
  };

  const isCheckOutDay = (booking, date) => {
    const checkOut = new Date(booking.bookingDetails.checkOut);
    return isSameDay(checkOut, date);
  };

  const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    if (onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              relative p-2 text-sm min-h-[40px] rounded transition-colors
              ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
              ${day.isToday ? 'bg-blue-100 text-blue-900 font-bold' : ''}
              ${day.isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
              ${day.bookingsCount > 0 ? 'font-semibold' : ''}
            `}
          >
            <span>{day.date.getDate()}</span>
            
            {/* Booking indicators */}
            {day.bookingsCount > 0 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {day.hasCheckIns && (
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                )}
                {day.hasCheckOuts && (
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                )}
                {!day.hasCheckIns && !day.hasCheckOuts && day.bookingsCount > 0 && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Check-ins</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Check-outs</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;
