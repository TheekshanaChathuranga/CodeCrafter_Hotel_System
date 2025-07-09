import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Icons (using simple SVG icons for modern look)
const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const BookingForm = ({ onSuccess, success }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    peopleCount: 1,
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 2 * 60 * 60 * 1000),
    paymentType: 'notPaid',
    advanceAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState({
    baseAmount: 500,
    additionalHours: 0,
    additionalAmount: 0,
    totalAmount: 500,
    reduceAmount: 0
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = localStorage.getItem('bookingDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData({
          ...parsedDraft,
          checkIn: new Date(parsedDraft.checkIn),
          checkOut: new Date(parsedDraft.checkOut)
        });
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  // Save draft whenever form data changes
  useEffect(() => {
    if (formData.name || formData.phone || formData.email) {
      localStorage.setItem('bookingDraft', JSON.stringify(formData));
    }
  }, [formData]);

  const clearDraft = () => {
    localStorage.removeItem('bookingDraft');
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.peopleCount, formData.checkIn, formData.checkOut, formData.paymentType, formData.advanceAmount]);

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
    let reduceAmount = totalAmount;

    if (formData.paymentType === 'advance' && formData.advanceAmount && !isNaN(formData.advanceAmount)) {
      reduceAmount = totalAmount - Number(formData.advanceAmount);
      if (reduceAmount < 0) reduceAmount = 0;
    } else if (formData.paymentType === 'full') {
      reduceAmount = 0;
    }

    setPricing({
      baseAmount,
      additionalHours,
      additionalAmount,
      totalAmount,
      reduceAmount
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format phone numbers
    let formattedValue = value;
    if (name === 'phone' || name === 'whatsapp') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'peopleCount' ? Number(formattedValue) : formattedValue
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

    // If paymentType is 'advance', validate advanceAmount
    if (formData.paymentType === 'advance') {
      if (!formData.advanceAmount || isNaN(formData.advanceAmount) || Number(formData.advanceAmount) <= 0) {
        setError('Advance amount is required and must be greater than 0');
        setLoading(false);
        return;
      }
      if (Number(formData.advanceAmount) > pricing.totalAmount) {
        setError('Advance amount cannot exceed total amount');
        setLoading(false);
        return;
      }
    }

    try {
      await axios.post('http://localhost:5000/api/poolBookings', {
        ...formData,
        advanceAmount: formData.paymentType === 'advance' ? Number(formData.advanceAmount) : 0,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString(),
        totalAmount: pricing.totalAmount, // Include calculated total amount
        status: 'approved' // <-- always send status as approved
      });
      onSuccess('Booking successful!');
      setShowSuccessModal(true);
      clearDraft(); // Clear saved draft on successful booking
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        peopleCount: 1,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 2 * 60 * 60 * 1000),
        paymentType: 'notPaid',
        advanceAmount: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pool Booking System
          </h1>
          <p className="text-gray-600">Create a new pool booking</p>
        </div>



        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-blue-600 p-4 text-white rounded-t-lg">
            <h2 className="text-xl font-semibold">New Pool Booking</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                Customer Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10-digit phone number"
                    required
                  />
                </div>

                {/* WhatsApp Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="whatsapp">
                    WhatsApp Number <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="WhatsApp number"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Booking Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                Booking Details
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* People Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="peopleCount">
                    Number of People <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="peopleCount"
                    name="peopleCount"
                    value={formData.peopleCount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {[...Array(20)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>

                {/* Check-in Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Time <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.checkIn}
                    onChange={(date) => handleDateChange('checkIn', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Check-out Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Time <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.checkOut}
                    onChange={(date) => handleDateChange('checkOut', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMM d, yyyy h:mm aa"
                    minDate={formData.checkIn}
                    minTime={new Date(formData.checkIn.getTime() + 2 * 60 * 60 * 1000)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-set to 2 hours after check-in</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                Payment Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentType">
                    Payment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentType"
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="notPaid">Not Paid</option>
                    <option value="advance">Advance Payment</option>
                    <option value="full">Full Payment</option>
                  </select>
                </div>

                {/* Advance Amount */}
                {formData.paymentType === 'advance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="advanceAmount">
                      Advance Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="advanceAmount"
                      name="advanceAmount"
                      min="1"
                      max={pricing.totalAmount}
                      value={formData.advanceAmount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter advance amount"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-3">
                Pricing Breakdown
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Base Rate (2 hours):</span>
                  <span className="font-medium">Rs.{pricing.baseAmount}</span>
                </div>
                
                {pricing.additionalHours > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Additional Hours ({pricing.additionalHours} × Rs.200):
                    </span>
                    <span className="font-medium">Rs.{pricing.additionalAmount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Per Person Total:</span>
                  <span className="font-medium">
                    Rs.{pricing.baseAmount + pricing.additionalAmount}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 bg-white rounded px-3 border border-blue-300 font-bold text-blue-800">
                  <span>
                    Total Amount ({formData.peopleCount} person{formData.peopleCount > 1 ? 's' : ''}):
                  </span>
                  <span>Rs.{pricing.totalAmount}</span>
                </div>
                
                {formData.paymentType === 'advance' && formData.advanceAmount && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Advance Paid:</span>
                    <span>- Rs.{formData.advanceAmount}</span>
                  </div>
                )}
                
                {(formData.paymentType === 'advance' || formData.paymentType === 'full') && (
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>Amount Due:</span>
                    <span>Rs.{pricing.reduceAmount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Custom CSS for DatePicker alignment */}
        <style jsx>{`
          .react-datepicker-wrapper {
            width: 100% !important;
          }
          
          .react-datepicker__input-container {
            width: 100% !important;
          }
          
          .react-datepicker__input-container input {
            width: 100% !important;
            box-sizing: border-box;
          }
        `}</style>
      </div>

      {/* Simple Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-green-500 p-4 rounded-t-lg text-white">
              <h3 className="text-lg font-semibold">Booking Confirmed!</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Your pool booking has been successfully created.
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;