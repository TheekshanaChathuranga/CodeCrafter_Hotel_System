import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = ({ onSuccess, success }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    peopleCount: 1,
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 2 * 60 * 60 * 1000)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState({
    baseAmount: 500,
    additionalHours: 0,
    additionalAmount: 0,
    totalAmount: 500
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    calculateTotal();
  }, [formData.peopleCount, formData.checkIn, formData.checkOut]);

  const calculateTotal = () => {
    const durationHours = (formData.checkOut - formData.checkIn) / (1000 * 60 * 60);
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    
    let baseAmount = baseRate;
    let additionalHours = 0;
    let additionalAmount = 0;
    
    if (durationHours > baseHours) {
      additionalHours = Math.ceil(durationHours - baseHours);
      additionalAmount = additionalHours * additionalRate;
    }
    
    const totalAmount = (baseAmount + additionalAmount) * formData.peopleCount;
    
    setPricing({
      baseAmount,
      additionalHours,
      additionalAmount,
      totalAmount
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'peopleCount' ? Number(value) : value
    }));
  };

  const handleDateChange = (name, date) => {
    if (name === 'checkIn') {
      // When check-in changes, automatically set check-out to 2 hours later
      const newCheckOut = new Date(date.getTime() + 2 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        checkIn: date,
        checkOut: newCheckOut
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: date
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    onSuccess('');

    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim() || !formData.phone.trim() || !formData.peopleCount) {
      setError('Name, phone, and number of people are required');
      setLoading(false);
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setError('Invalid phone number format. Must be 10 digits.');
      setLoading(false);
      return;
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      setError('Invalid email format.');
      setLoading(false);
      return;
    }

    const durationHours = (formData.checkOut - formData.checkIn) / (1000 * 60 * 60);
    if (durationHours < 2) {
      setError('Check-out time must be at least 2 hours after check-in');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/bookings', {
        ...formData,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString()
      });
      
      onSuccess('Booking successful!');
      setShowSuccessModal(true);
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        peopleCount: 1,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 2 * 60 * 60 * 1000)
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">New Booking</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="whatsapp">
            WhatsApp Number (optional)
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="peopleCount">
            Number of People <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="peopleCount"
            name="peopleCount"
            min="1"
            max="20"
            value={formData.peopleCount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Check-in Time <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={formData.checkIn}
            onChange={(date) => handleDateChange('checkIn', date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Check-out Time <span className="text-red-500">*</span>
            <span className="text-sm text-gray-500 ml-2">(Auto-set to 2 hours after check-in)</span>
          </label>
          <DatePicker
            selected={formData.checkOut}
            onChange={(date) => handleDateChange('checkOut', date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={formData.checkIn}
            minTime={new Date(formData.checkIn.getTime() + 2 * 60 * 60 * 1000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4 p-4 bg-blue-100 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">Pricing Breakdown:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Base Rate (2 hours):</span>
              <span>Rs.{pricing.baseAmount}</span>
            </div>
            {pricing.additionalHours > 0 && (
              <div className="flex justify-between">
                <span>Additional Hours ({pricing.additionalHours} × Rs.200):</span>
                <span>Rs.{pricing.additionalAmount}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Per Person Total:</span>
              <span>Rs.{pricing.baseAmount + pricing.additionalAmount}</span>
            </div>
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount ({formData.peopleCount} person{formData.peopleCount > 1 ? 's' : ''}):</span>
                <span>Rs.{pricing.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </form>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-green-700">Booking Successful!</h3>
            <p className="mb-6 text-gray-700">The booking has been successfully created.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;