// import React from 'react';

// export default function Pool_page() {
//   return (
//     <div>
//       <h1>This is the Pool Booking page</h1>
//     </div>
//   );
// }

// frontend/src/pages/pool_page.jsx
////////////////////////////////////////////////////////////////////////
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header.jsx';

// export default function Pool_Page() {
//   const navigate = useNavigate();

//   return (
//     <div>
//       <Header />
//       <main className="container mx-auto p-4">
//         <button 
//           onClick={() => navigate(-1)}
//           className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Go Back
//         </button>
//         <h1 className="text-3xl font-semibold">Pool Booking</h1>
//         {/* Add pool booking form here */}
//       </main>
//     </div>
//   );
// }
////////////////////////////////////////////////////////////////
// frontend/src/pages/pool_page.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pool_Book() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 1,
    specialRequests: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [price, setPrice] = useState(1.7); // Base price

  const poolImages = [
    // 'https://example.com/pool1.jpg',
    // 'https://example.com/pool2.jpg',
    // 'https://example.com/pool3.jpg'
    'src/img/Pool1.jpeg',
    'src/img/Pool2.jpeg',
    'src/img/Pool3.jpeg'
    
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (formData.guests < 1 || formData.guests > 10) newErrors.guests = 'Guests must be between 1-10';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would connect to your backend API
      console.log('Form data:', formData);
      setShowSuccess(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Price calculation
    if (name === 'guests') {
      const guestCount = parseInt(value) || 0;
      setPrice(50 + (guestCount * 15));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        //className="mb-8 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go Back   
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <h1 className="text-3xl font-semibold mb-8">Pool Booking
            <span className="text-gray-500 text-sm">(${price} per person)</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pool Images */}
          <div className="space-y-4">
            {poolImages.map((img, index) => (
              <img 
                key={index}
                src={img}
                alt={`Pool ${index + 1}`}
                className="w-full h-78 object-cover rounded-lg shadow-lg"
              />
            ))}
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                } shadow-sm p-2`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time Slot</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                } shadow-sm p-2`}
              >
                <option value="">Select a time</option>
                <option value="09:00-11:00">9:00 AM - 11:00 AM</option>
                <option value="11:30-13:30">11:30 AM - 1:30 PM</option>
                <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
              </select>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Guests (Max 10)
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                max="10"
                value={formData.guests}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.guests ? 'border-red-500' : 'border-gray-300'
                } shadow-sm p-2`}
              />
              {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Special Requests
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                rows="4"
                placeholder="Any special requirements or notes..."
              ></textarea>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Pricing Details</h3>
              <p className="mt-2">
                Base Price: $50 <br />
                Additional Guests: ${(formData.guests - 1) * 15} ({formData.guests - 1} x $15) <br />
                <span className="font-bold text-xl">Total: ${price}</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Confirm Booking
            </button>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Successful!</h2>
              <p className="mb-4">Your pool booking has been confirmed. A confirmation email has been sent.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}