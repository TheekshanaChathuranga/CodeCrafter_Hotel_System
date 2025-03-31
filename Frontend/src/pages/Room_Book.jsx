// // import React from 'react';

// // export default function Room_page() {
// //   return (
// //     <div>
// //       <h1>This is the Room booking page</h1>
// //     </div>
// //   );
// // }
// // frontend/src/pages/room_page.jsx
// // frontend/src/pages/room_page.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function RoomPage() {
//   const navigate = useNavigate();
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [formData, setFormData] = useState({
//     checkIn: '',
//     checkOut: '',
//     guests: 1,
//     specialRequests: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [showSuccess, setShowSuccess] = useState(false);

//   // Mock room data (replace with API call)
//   const rooms = [
//     {
//       id: 1,
//       name: "Deluxe Lake View",
//       price: 200,
//       description: "Spacious room with king bed and private balcony overlooking the lake",
//       amenities: ["Wi-Fi", "AC", "Mini-bar", "Coffee maker"],
//       capacity: 2,
//       images: [
//         'https://example.com/room1-1.jpg',
//         'https://example.com/room1-2.jpg'
//       ]
//     },
//     {
//       id: 2,
//       name: "Executive Suite",
//       price: 350,
//       description: "Luxurious suite with separate living area and jacuzzi",
//       amenities: ["Wi-Fi", "AC", "Kitchenette", "Smart TV"],
//       capacity: 4,
//       images: [
//         'https://example.com/room2-1.jpg',
//         'https://example.com/room2-2.jpg'
//       ]
//     }
//   ];

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
//     if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
//     if (formData.guests < 1 || formData.guests > selectedRoom?.capacity) 
//       newErrors.guests = `Guests must be between 1-${selectedRoom?.capacity}`;
//     if (new Date(formData.checkOut) <= new Date(formData.checkIn))
//       newErrors.checkOut = 'Check-out must be after check-in';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       // Connect to your backend API here
//       console.log('Booking data:', {
//         room: selectedRoom,
//         ...formData
//       });
//       setShowSuccess(true);
//       setShowBookingForm(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const calculateNights = () => {
//     if (formData.checkIn && formData.checkOut) {
//       const diff = new Date(formData.checkOut) - new Date(formData.checkIn);
//       return Math.ceil(diff / (1000 * 60 * 60 * 24));
//     }
//     return 0;
//   };

//   const totalPrice = selectedRoom ? calculateNights() * selectedRoom.price : 0;

//   return (
//     <div className="container mx-auto p-4">
//       <button 
//         onClick={() => navigate(-1)}
//         className="mb-8 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Go Back
//       </button>

//       <h1 className="text-3xl font-semibold mb-8">Available Rooms</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {rooms.map(room => (
//           <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
//             <div className="relative">
//               <div className="flex overflow-x-auto snap-x snap-mandatory h-64">
//                 {room.images.map((img, index) => (
//                   <img
//                     key={index}
//                     src={img}
//                     alt={room.name}
//                     className="w-full h-full object-cover snap-start"
//                   />
//                 ))}
//               </div>
//               <span className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
//                 ${room.price}/night
//               </span>
//             </div>

//             <div className="p-6">
//               <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
//               <p className="text-gray-600 mb-4">{room.description}</p>
              
//               <div className="flex flex-wrap gap-2 mb-4">
//                 {room.amenities.map((amenity, index) => (
//                   <span 
//                     key={index}
//                     className="bg-gray-100 px-2 py-1 rounded text-sm"
//                   >
//                     {amenity}
//                   </span>
//                 ))}
//               </div>

//               <button
//                 onClick={() => {
//                   setSelectedRoom(room);
//                   setShowBookingForm(true);
//                 }}
//                 className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//               >
//                 Book Now
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Booking Form Modal */}
//       {showBookingForm && selectedRoom && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full overflow-y-auto max-h-screen">
//             <h2 className="text-2xl font-bold mb-4">Book {selectedRoom.name}</h2>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Check-in Date</label>
//                 <input
//                   type="date"
//                   name="checkIn"
//                   value={formData.checkIn}
//                   onChange={handleChange}
//                   min={new Date().toISOString().split('T')[0]}
//                   className={`w-full p-2 border rounded ${
//                     errors.checkIn ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Check-out Date</label>
//                 <input
//                   type="date"
//                   name="checkOut"
//                   value={formData.checkOut}
//                   onChange={handleChange}
//                   min={formData.checkIn || new Date().toISOString().split('T')[0]}
//                   className={`w-full p-2 border rounded ${
//                     errors.checkOut ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Number of Guests</label>
//                 <input
//                   type="number"
//                   name="guests"
//                   min="1"
//                   max={selectedRoom.capacity}
//                   value={formData.guests}
//                   onChange={handleChange}
//                   className={`w-full p-2 border rounded ${
//                     errors.guests ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Special Requests</label>
//                 <textarea
//                   name="specialRequests"
//                   value={formData.specialRequests}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded"
//                   rows="3"
//                 ></textarea>
//               </div>

//               <div className="bg-blue-50 p-4 rounded">
//                 <p className="font-semibold">Price Breakdown:</p>
//                 <p>Nights: {calculateNights()}</p>
//                 <p>Price per night: ${selectedRoom.price}</p>
//                 <p className="text-xl font-bold mt-2">Total: ${totalPrice}</p>
//               </div>

//               <div className="flex gap-4 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowBookingForm(false)}
//                   className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//                 >
//                   Confirm Booking
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       {showSuccess && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg max-w-sm w-full">
//             <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
//             <p className="mb-4">
//               Your stay in {selectedRoom?.name} has been booked successfully. 
//               A confirmation email with details has been sent.
//             </p>
//             <button
//               onClick={() => setShowSuccess(false)}
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//////////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Room_Book() {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load rooms. Please try again later.');
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (formData.guests < 1 || formData.guests > selectedRoom?.capacity) 
      newErrors.guests = `Guests must be between 1-${selectedRoom?.capacity}`;
    if (new Date(formData.checkOut) <= new Date(formData.checkIn))
      newErrors.checkOut = 'Check-out must be after check-in';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        room: selectedRoom._id,
        ...formData,
        totalPrice: selectedRoom.price * calculateNights()
      });
      setShowSuccess(true);
      setShowBookingForm(false);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  // Calculate number of nights
  const calculateNights = () => {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Back Button */}
        <div className="mb-12">
          <div className="flex justify-start">
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
          
          <div className="text-center mt-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms</h1>
            <p className="text-xl text-gray-600">Discover your perfect stay</p>
          </div>
        </div>


        {/* Rooms Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {rooms.map(room => (
            <div key={room._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Image Section */}
              <div className="relative h-64">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg">
                  <span className="text-xl font-bold text-blue-600">
                    ${room.price}<span className="text-sm">/night</span>
                  </span>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h2>
                <p className="text-gray-600 mb-4">{room.description}</p>
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities?.map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowBookingForm(true);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {showBookingForm && selectedRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Book {selectedRoom.name}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields */}
                <div>
                  <label className="block mb-2 font-medium">Check-in Date</label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Check-out Date</label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                  {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium">Guests</label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    min="1"
                    max={selectedRoom.capacity}
                  />
                  {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold">Total: ${selectedRoom.price * calculateNights()}</p>
                  <p className="text-sm text-gray-600">{calculateNights()} nights</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl text-center max-w-sm">
              <h3 className="text-2xl font-bold mb-4 text-green-600">Booking Confirmed!</h3>
              <p className="mb-4">Your reservation for {selectedRoom?.name} is complete.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}