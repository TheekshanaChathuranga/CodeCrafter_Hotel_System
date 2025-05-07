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
  const [totalAmount, setTotalAmount] = useState(500);

  useEffect(() => {
    calculateTotal();
  }, [formData.peopleCount, formData.checkIn, formData.checkOut]);

  const calculateTotal = () => {
    const durationHours = (formData.checkOut - formData.checkIn) / (1000 * 60 * 60);
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    
    let calculatedAmount = baseRate;
    if (durationHours > baseHours) {
      calculatedAmount += Math.ceil(durationHours - baseHours) * additionalRate;
    }
    
    calculatedAmount *= formData.peopleCount;
    setTotalAmount(calculatedAmount);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
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

    if (formData.checkOut <= formData.checkIn) {
      setError('Check-out time must be after check-in time');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/bookings', {
        ...formData,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString()
      });
      onSuccess('Booking successful!');
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
          </label>
          <DatePicker
            selected={formData.checkOut}
            onChange={(date) => handleDateChange('checkOut', date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={formData.checkIn}
            minTime={formData.checkIn}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4 p-4 bg-blue-100 rounded-md">
          <p className="font-medium">Total Amount: Rs.{totalAmount}</p>
          <p className="text-sm text-gray-600">
            {formData.peopleCount} person(s) × Rs.{totalAmount / formData.peopleCount}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;