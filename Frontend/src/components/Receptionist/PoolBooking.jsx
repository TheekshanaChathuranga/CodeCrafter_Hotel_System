import React, { useState } from 'react';
import BookingForm from './BookingForm';

const PoolBooking = () => {
  const [success, setSuccess] = useState('');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BookingForm onSuccess={setSuccess} success={success} />
    </div>
  );
};

export default PoolBooking;