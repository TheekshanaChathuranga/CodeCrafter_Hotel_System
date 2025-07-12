import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5000/api/rooms");
        if (!res.ok) throw new Error("Failed to fetch rooms");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        setError(err.message || "Error fetching rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

      {/* Hero Section */}
      <div className="relative h-[634px] bg-[url('img/The_Lake1.jpeg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-6xl mx-auto px-4 text-center text-white">
            <h1 className="text-5xl font-bold mb-4">The Lake Hotel & Resort</h1>
            <p className="text-2xl mb-8">Where Luxury Meets Nature</p>
            <Link
              to="room-booking"
              className="inline-block bg-blue-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section id="about" className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          {/* Four-image grid */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-1/2">
            <img
              src="/img/about1.jpeg"
              alt="Resort View 1"
              className="rounded-xl shadow object-cover h-44 w-full"
            />
            <img
              src="/img/about2.jpeg"
              alt="Resort View 2"
              className="rounded-xl shadow object-cover h-44 w-full"
            />
            <img
              src="/img/about3.jpeg"
              alt="Resort View 3"
              className="rounded-xl shadow object-cover h-44 w-full"
            />
            <img
              src="/img/about4.jpeg"
              alt="Resort View 4"
              className="rounded-xl shadow object-cover h-44 w-full"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4 text-blue-700">About Us</h2>
            <p className="text-lg text-gray-700 mb-4">
              Situated in southern Sri Lanka along the Akuressa to Kamburupitiya
              main road. The hotel is 45 minutes from the famous Polhena beach.
              A place for Sri Lankans and tourists to relax and experience the
              calm natural environment of the Wilpita Forest and Wilpita Lake
              (also known as Lenabatuwa Lake).The hotel is at the bank of the
              lake.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>Elegant lakeside suites and villas</li>
              <li>Infinity pool with panoramic views</li>
              <li>Gourmet dining and signature cocktails</li>
              <li>Boat rides</li>
              <li>co-working space</li>
            </ul>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-blue-50 rounded-xl p-4 shadow w-48 text-center">
                <h3 className="text-xl font-semibold text-blue-700 mb-1">
                  Prime Location
                </h3>
                <p className="text-gray-600 text-sm">
                  Minutes from the city, yet a world away in tranquility.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 shadow w-48 text-center">
                <h3 className="text-xl font-semibold text-blue-700 mb-1">
                  Exceptional Service
                </h3>
                <p className="text-gray-600 text-sm">
                  Our staff is dedicated to making every moment special.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 shadow w-48 text-center">
                <h3 className="text-xl font-semibold text-blue-700 mb-1">
                  Modern Comforts
                </h3>
                <p className="text-gray-600 text-sm">
                  Luxury rooms and more for your comfort.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Accommodations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {["Single", "Double", "Triple"].map((roomType) => {
            const room = rooms.find((r) => r.type === roomType);
            return (
              <div
                key={roomType}
                className="flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden hover:shadow-blue-200 hover:scale-[1.025] transition-all duration-300 min-h-[480px]"
              >
                <div className="relative h-64 w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
                  {room && room.images && room.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${room.images[0]}`}
                      alt={room.type + " " + room.roomNumber}
                      className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/OptionImage.jpeg";
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-lg">
                      No image available
                    </span>
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow">
                    {roomType}
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-7 gap-3">
                  <h3 className="text-2xl font-extrabold text-blue-800 mb-1 tracking-tight drop-shadow-sm">
                    {roomType} Room
                  </h3>
                  <p className="text-gray-600 text-lg font-semibold">
                    {room && room.pricePerNight
                      ? `Starting from LKR ${room.pricePerNight.toLocaleString()}/night`
                      : "Price not set"}
                  </p>
                  <p className="text-gray-700 mb-2 flex-1 text-base">
                    {room && room.description
                      ? room.description
                      : "No description available."}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {room && room.acOption && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-100 font-medium">
                        {room.acOption}
                      </span>
                    )}
                    {room && room.hasAC && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs border border-blue-200 font-medium">
                        Air Conditioned
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-2">
                    <Link
                      to="room-booking"
                      className="block w-full text-center bg-blue-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow transition-colors"
                    >
                      Visit Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pool Description Section */}
      <section className="bg-blue-50 py-16 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <img
            src="/img/pool_description.jpeg"
            alt="Infinity Pool"
            className="w-full md:w-1/2 rounded-2xl shadow-xl object-cover h-96"
          />
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4 text-blue-700">
              Infinity Pool
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Escape the everyday and unwind at the serene Lenabatuwewa Pool,
              where modern elegance meets nature’s calm. Surrounded by lush
              greenery and contemporary architecture, our crystal-clear pool is
              the perfect place to relax, recharge, and reconnect
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>Open daily</li>
              <li>Poolside Lake view</li>
              <li>Family-Friendly Seating Areas</li>
              <li>Relaxing Loungers & Outdoor Umbrellas</li>
              <li>Perfect for Photos and Peaceful Moments</li>
              <li>Private Rooms available</li>
            </ul>
            <Link
              to="/pool-booking"
              className="inline-block mt-4 bg-blue-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold shadow transition"
            >
              Book Pool
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "🏊", title: "Infinity Pool" },
              { icon: "🍽️", title: "Fine Dining" },
              { icon: "📅", title: "Event Booking" },
              { icon: "🛏️", title: "Room Service" },
            ].map((amenity, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{amenity.icon}</div>
                <h3 className="text-lg font-semibold">{amenity.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-800">
            Contact Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-2xl text-blue-600">
                  <i className="fab fa-facebook-square"></i>
                </span>
                <a
                  href="https://www.facebook.com/thelakelenabatuwa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-blue-700 hover:underline font-semibold"
                >
                  Facebook
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl text-pink-500">
                  <i className="fab fa-instagram"></i>
                </span>
                <a
                  href="https://www.instagram.com/thelakelenabatuwa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-pink-600 hover:underline font-semibold"
                >
                  Instagram
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl text-green-500">
                  <i className="fab fa-whatsapp"></i>
                </span>
                <a
                  href="https://wa.me/94771234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-green-600 hover:underline font-semibold"
                >
                  WhatsApp: +94 77 0521 621
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl text-red-500">
                  <i className="fas fa-phone-alt"></i>
                </span>
                <span className="text-lg text-gray-700 font-semibold">
                  Hotline: (+94) 77 0521 621
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl text-blue-400">
                  <i className="fas fa-envelope"></i>
                </span>
                <a
                  href="mailto:info@lakehotel.com"
                  className="text-lg text-blue-700 hover:underline font-semibold"
                >
                  info@lakehotel.com
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl text-gray-700">
                  <i className="fas fa-map-marker-alt"></i>
                </span>
                <span className="text-lg text-gray-700 font-semibold">
                  The Lake Lenabatuwa Hotel & Resort Akuressa, Kamburupitiya
                  Road, Lenabatuwa
                </span>
              </div>
            </div>
            {/* Map Embed */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-80 w-full">
              <iframe
                title="Lake Hotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63313.07396447944!2d80.5386687!3d6.0838448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae143c63f47407f%3A0xaf300df4533de881!2sThe%20Lake%20Hotel%20and%20Resort!5e0!3m2!1sen!2slk!4v1720425600000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

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