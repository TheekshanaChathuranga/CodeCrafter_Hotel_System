import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    peopleCount: 1,
    checkInDate: '',
    checkInTime: '',
    checkOutTime: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(500);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (formData.checkInDate && formData.checkInTime) {
      const [hours, minutes] = formData.checkInTime.split(':').map(Number);
      let newHours = hours + 2;
      if (newHours >= 24) newHours -= 24;
      
      const newCheckOutTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      setFormData(prev => ({
        ...prev,
        checkOutTime: newCheckOutTime
      }));
    }
  }, [formData.checkInTime]);

  const calculateTotal = () => {
    if (!formData.checkInTime || !formData.checkOutTime) return 500;
    
    const [inHours, inMinutes] = formData.checkInTime.split(':').map(Number);
    const [outHours, outMinutes] = formData.checkOutTime.split(':').map(Number);
    
    let durationHours = outHours - inHours;
    let durationMinutes = outMinutes - inMinutes;
    
    if (durationMinutes < 0) {
      durationHours--;
      durationMinutes += 60;
    }
    
    const totalDuration = durationHours + (durationMinutes / 60);
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    
    let calculatedAmount = baseRate;
    if (totalDuration > baseHours) {
      calculatedAmount += Math.ceil(totalDuration - baseHours) * additionalRate;
    }
    
    calculatedAmount *= formData.peopleCount;
    setTotalAmount(calculatedAmount);
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.peopleCount, formData.checkInTime, formData.checkOutTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim() || !formData.phone.trim() || !formData.peopleCount || 
        !formData.checkInDate || !formData.checkInTime || !formData.checkOutTime) {
      setError('All fields except WhatsApp and Email are required');
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

    const [inHours, inMinutes] = formData.checkInTime.split(':').map(Number);
    const [outHours, outMinutes] = formData.checkOutTime.split(':').map(Number);
    
    if (outHours < inHours || (outHours === inHours && outMinutes <= inMinutes)) {
      setError('Check-out time must be after check-in time');
      setLoading(false);
      return;
    }

    setShowConfirmation(true);
    setLoading(false);
  };

  const confirmBooking = async () => {
    setShowConfirmation(false);
    setLoading(true);
    
    try {
      const checkIn = new Date(`${formData.checkInDate}T${formData.checkInTime}`);
      const checkOut = new Date(`${formData.checkInDate}T${formData.checkOutTime}`);
      
      if (checkOut <= checkIn) {
        checkOut.setDate(checkOut.getDate() + 1);
      }

      await axios.post('http://localhost:5000/api/poolbookings', {
        ...formData,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        totalAmount
      });
      
      onSuccess('Booking successful!');
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        peopleCount: 1,
        checkInDate: '',
        checkInTime: '',
        checkOutTime: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">New Booking</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

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
          <label className="block text-gray-700 mb-2" htmlFor="checkInDate">
            Check-in Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="checkInTime">
            Check-in Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="checkInTime"
            name="checkInTime"
            value={formData.checkInTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="checkOutTime">
            Check-out Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="checkOutTime"
            name="checkOutTime"
            value={formData.checkOutTime}
            onChange={handleChange}
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

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Booking</h3>
            <div className="space-y-2 mb-6">
              <p><span className="font-medium">Name:</span> {formData.name}</p>
              <p><span className="font-medium">Date:</span> {formData.checkInDate}</p>
              <p><span className="font-medium">Time:</span> {formData.checkInTime} - {formData.checkOutTime}</p>
              <p><span className="font-medium">People:</span> {formData.peopleCount}</p>
              <p><span className="font-medium">Total:</span> Rs.{totalAmount}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;