import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PoolBooking = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    peopleCount: 1
  });
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalPeople: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings');
      setBookings(Array.isArray(res.data) ? res.data : []); // Ensure bookings is always an array
    } catch (err) {
      setError(prev => `${prev ? prev + '. ' : ''}Failed to fetch bookings`);
      console.error('Fetch bookings error:', err);
      setBookings([]); // Fallback to an empty array in case of error
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
    } catch (err) {
      setError(prev => `${prev ? prev + '. ' : ''}Failed to fetch statistics`);
      console.error('Fetch stats error:', err);
    }
  };

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
    setSuccess('');

    // Improved validation
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

    try {
      await axios.post('/api/bookings', formData);
      setSuccess('Booking successful!');
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        peopleCount: 1
      });
      await Promise.all([fetchBookings(), fetchStats()]); // Ensure both functions complete
    } catch (err) {
      setError(prev => `${prev ? prev + '. ' : ''}${err.response?.data?.message || 'Booking failed'}`);
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Hotel Pool Booking</h1>
          <p className="mt-2 text-blue-600">Rs.500 for two hours</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Form */}
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

              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="peopleCount">
                  Number of People <span className="text-red-500">*</span>
                </label>
                <select
                  id="peopleCount"
                  name="peopleCount"
                  value={formData.peopleCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4 p-4 bg-blue-100 rounded-md">
                <p className="font-medium">Total Amount: Rs.500 (for 2 hours)</p>
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

          {/* Stats and Recent Bookings */}
          <div>
            {/* Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Pool Usage Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.totalBookings}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-600">Total People</p>
                  <p className="text-2xl font-bold text-green-800">{stats.totalPeople}</p>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bookings.slice(0, 5).map(booking => (
                    <div key={booking._id || booking.id} className="border-b border-gray-200 pb-2">
                      <p className="font-medium">{booking.name}</p>
                      <p className="text-sm text-gray-600">
                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : 'Unknown Date'}
                      </p>
                      <p className="text-sm">People: {booking.peopleCount || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolBooking;