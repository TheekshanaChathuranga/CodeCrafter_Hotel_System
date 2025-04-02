import React from "react";
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const About = () => {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div className="p-4 md:p-8 bg-gray-100">
      <Navbar />
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Go Back
      </button>
      <h1 className="text-2xl font-bold text-center md:text-4xl text-gray-800">
        Discover Our Attractions
      </h1>
      <p className="text-gray-600 mt-2 text-center md:text-lg leading-relaxed">
        Welcome to The Lake Hotel & Resort, where breathtaking attractions and
        unforgettable experiences await you. Explore the beauty of nature,
        indulge in luxurious amenities, and create memories that last a
        lifetime.
      </p>
      <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-300 pb-2">
          Attractions & Experiences
        </h2>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-gray-600">
          <li className="hover:text-gray-800 transition-colors duration-200">
            Scenic Boat Rides on the Lake
          </li>
          <li className="hover:text-gray-800 transition-colors duration-200">
            Guided Nature Trails and Bird Watching
          </li>
          <li className="hover:text-gray-800 transition-colors duration-200">
            Relaxing Spa Treatments with Lake Views
          </li>
          <li className="hover:text-gray-800 transition-colors duration-200">
            Fine Dining with Local and International Cuisine
          </li>
          <li className="hover:text-gray-800 transition-colors duration-200">
            Evening Bonfires and Live Music
          </li>
        </ul>
      </div>
      <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-300 pb-2">
          Why Choose Us?
        </h2>
        <p className="text-gray-600 mt-4">
          At The Lake Hotel & Resort, we pride ourselves on offering a unique
          blend of luxury and adventure. Whether you're seeking relaxation or
          excitement, our resort provides the perfect setting for your dream
          getaway.
        </p>
      </div>
      <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-300 pb-2">
          Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <img
            src="https://via.placeholder.com/300x200?text=Lake+View"
            alt="Lake View"
            className="rounded shadow hover:scale-105 transition-transform duration-300"
          />
          <img
            src="https://via.placeholder.com/300x200?text=Nature+Trail"
            alt="Nature Trail"
            className="rounded shadow hover:scale-105 transition-transform duration-300"
          />
          <img
            src="https://via.placeholder.com/300x200?text=Spa+Experience"
            alt="Spa Experience"
            className="rounded shadow hover:scale-105 transition-transform duration-300"
          />
          <img
            src="https://via.placeholder.com/300x200?text=Fine+Dining"
            alt="Fine Dining"
            className="rounded shadow hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
