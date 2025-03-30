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
      <div className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Our Hotel</h1>
          <p className="text-xl mb-8">Experience luxury and comfort like never before</p>
          
          {/* Book Now Button */}
          <Link 
            to="/booking" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-blue-500 text-4xl mb-4">🛏️</div>
            <h3 className="text-xl font-bold mb-2">Luxurious Rooms</h3>
            <p className="text-gray-600">Spacious accommodations with modern amenities</p>
          </div>
          
          <div className="p-6">
            <div className="text-blue-500 text-4xl mb-4">🏊</div>
            <h3 className="text-xl font-bold mb-2">Pool Access</h3>
            <p className="text-gray-600">Enjoy our temperature-controlled infinity pool</p>
          </div>
          
          <div className="p-6">
            <div className="text-blue-500 text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold mb-2">Fine Dining</h3>
            <p className="text-gray-600">Experience our award-winning restaurants</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;