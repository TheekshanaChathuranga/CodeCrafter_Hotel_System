// import React from "react";
// import Navbar from "../components/Navbar";

// const Home = () => {
//   return (
//     <div>
//       <Navbar />
//       <h1 className="text-2xl font-bold">Home Page</h1>
//       <p>Welcome to our Hotel Management System!</p>
//     </div>
//   );
// };

// export default Home;
import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[634px] bg-[url('img/The_Lake1.jpeg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-6xl mx-auto px-4 text-center text-white">
            <h1 className="text-5xl font-bold mb-4">The Lake Hotel & Resort</h1>
            <p className="text-2xl mb-8">Where Luxury Meets Nature</p>
            <Link to="room-booking" className="inline-block bg-blue-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Rooms */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Accommodations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((room) => (
            <div key={room} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src={`https://source.unsplash.com/random/800x600/?hotel-room-${room}`}
                alt={`Room ${room}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Lakeside Suite</h3>
                <p className="text-gray-600 mb-4">Starting from LKR 4000/night</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Lake View</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Private Balcony</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Luxury Bath</span>
                </div>
                <Link 
                  to="room-booking"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🏊', title: 'Infinity Pool' },
              { icon: '🍽️', title: 'Fine Dining' },
              { icon: '📅', title: 'Event Booking' }, 
              { icon: '🛏️', title: 'Room Service' },
            ].map((amenity, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{amenity.icon}</div>
                <h3 className="text-lg font-semibold">{amenity.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2024 The Lake Hotel & Resort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;