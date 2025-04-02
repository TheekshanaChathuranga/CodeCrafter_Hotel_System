////////////////////////////////////////////////////////////////////////////////////////////////
//final code
// pages/Room_Book.jsx
// pages/Room_Book.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Calendar } from 'react-date-range';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const Room_Book = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDates, setBookingDates] = useState({
    checkIn: null,
    checkOut: null
  });
  const [filters, setFilters] = useState({
    type: 'all',
    acOption: 'all',
    minPrice: '',
    maxPrice: ''
  });

  // Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        setRooms(data);
        setFilteredRooms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = rooms;
    
    if (filters.type !== 'all') {
      result = result.filter(room => room.type === filters.type);
    }
    
    if (filters.acOption !== 'all') {
      result = result.filter(room => room.acOption === filters.acOption);
    }
    
    if (filters.minPrice) {
      result = result.filter(room => room.pricePerNight >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      result = result.filter(room => room.pricePerNight <= Number(filters.maxPrice));
    }
    
    setFilteredRooms(result);
  }, [filters, rooms]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date, type) => {
    setBookingDates(prev => ({
      ...prev,
      [type]: date
    }));
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the booking data to your backend
    alert(`Booking submitted for Room ${selectedRoom.roomNumber} from ${bookingDates.checkIn?.toLocaleDateString()} to ${bookingDates.checkOut?.toLocaleDateString()}`);
    // Reset form
    setShowBookingForm(false);
    setSelectedRoom(null);
    setBookingDates({ checkIn: null, checkOut: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-95 bg-[url('img/RoomPage.jpeg')] bg-cover bg-center">   
      <button 
              onClick={() => navigate(-1)}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go Back   
            </button> 
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-6xl mx-auto px-4 text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Room Booking</h1>
            <p className="text-xl">Choose your perfect accommodation</p>
          </div>
        </div>
      </div>

      {/* Booking Form (shown when a room is selected) */}
      {showBookingForm && selectedRoom && (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg my-8">
          <h2 className="text-2xl font-bold mb-4">Booking Room {selectedRoom.roomNumber}</h2>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Check-in Date</label>
                <Calendar
                  date={bookingDates.checkIn}
                  onChange={(date) => handleDateSelect(date, 'checkIn')}
                  minDate={new Date()}
                  className="border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Check-out Date</label>
                <Calendar
                  date={bookingDates.checkOut}
                  onChange={(date) => handleDateSelect(date, 'checkOut')}
                  minDate={bookingDates.checkIn || new Date()}
                  className="border rounded-lg p-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Special Requests</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Confirm Booking
              </button>
              <button 
                type="button" 
                onClick={() => setShowBookingForm(false)}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Filter Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Room Type</label>
              <select 
                name="type" 
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">AC Option</label>
              <select 
                name="acOption" 
                value={filters.acOption}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">All Options</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Min Price (LKR)</label>
              <input 
                type="number" 
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min price"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Max Price (LKR)</label>
              <input 
                type="number" 
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max price"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Listing */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Available Rooms ({filteredRooms.length})</h2>
        
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No rooms match your filters.</p>
            <button 
              onClick={() => setFilters({
                type: 'all',
                acOption: 'all',
                minPrice: '',
                maxPrice: ''
              })}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div 
                key={room._id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  room.roomStatus !== 'Available' ? 'opacity-70' : ''
                }`}
              >
                {/* Room Image */}
                <div className="h-64 bg-gray-200 flex items-center justify-center relative">
                  {room.images && room.images.length > 0 ? (
                    <img 
                      src={room.images[0]} 
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No image available</span>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {room.roomNumber}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{room.type} Room</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      room.roomStatus === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.roomStatus}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 mr-4">{room.acOption}</span>
                    <span className="text-blue-600 font-semibold">
                      LKR {room.pricePerNight.toLocaleString()}/night
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {room.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.hasAC && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Air Conditioned
                      </span>
                    )}
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {room.type}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {room.pricePerDay ? `LKR ${room.pricePerDay}/day` : 'Daily rate not set'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleBookNow(room)}
                    disabled={room.roomStatus !== 'Available'}
                    className={`w-full text-center px-6 py-2 rounded-lg font-semibold transition-colors ${
                      room.roomStatus === 'Available'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {room.roomStatus === 'Available' ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2025 The Lake Hotel & Resort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Room_Book;
