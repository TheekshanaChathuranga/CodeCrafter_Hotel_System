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
          <p className="mt-2 text-blue-600">Rs.500 for first two hours, Rs.200 per additional hour</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BookingForm onSuccess={setSuccess} />
          <RecentBookings success={success} />
        </div>
      </div>
    </div>
  );
};

export default PoolBooking;