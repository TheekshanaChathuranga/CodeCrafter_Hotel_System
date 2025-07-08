import React, { useState } from 'react';
import BookingForm from './BookingForm';
import RecentBookings from './RecentBookings';

const PoolBooking = () => {
  const [success, setSuccess] = useState('');
  
  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Hotel Pool Booking</h1>
          <p className="mt-2 text-blue-600">Rs.500 for first 2 hours, Rs.200 per additional hour</p>
          <p className="mt-1 text-sm text-blue-500">Check-out time automatically set to 2 hours after check-in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BookingForm onSuccess={setSuccess} success={success} />
          <RecentBookings />
        </div>
      </div>
    </div>
  );
};

export default PoolBooking;