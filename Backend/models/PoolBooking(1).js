// // 

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";

// const Pool_Book = () => {
//   const [pools, setPools] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [bookingStatus, setBookingStatus] = useState({});
//   const [availability, setAvailability] = useState(null);
//   const [remainingSlots, setRemainingSlots] = useState(0);

//   useEffect(() => {
//     const fetchPools = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/pools");
//         setPools(res.data);
//       } catch (err) {
//         console.error("Error fetching pools:", err);
//       }
//     };
//     fetchPools();
//   }, []);

//   const handleDateChange = async (e, poolId) => {
//     const selectedDate = e.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       [poolId]: {
//         ...prev[poolId],
//         date: selectedDate,
//       },
//     }));

//     if (!poolId || !selectedDate) return;

//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/poolBookings/${poolId}/${selectedDate}`
//       );
      
//       const totalGuests = res.data.totalGuests || 0;
//       const poolCapacity = pools.find((pool) => pool._id === poolId)?.capacity || 0;
//       const remaining = poolCapacity - totalGuests;
//       setRemainingSlots(remaining);

//       if (remaining <= 0) setAvailability("full");
//       else if (remaining <= 5) setAvailability("limited");
//       else setAvailability("available");
//     } catch (err) {
//       console.error("Error checking availability:", err);
//       setAvailability(null);
//     }
//   };

//   const handleChange = (e, poolId) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [poolId]: {
//         ...prev[poolId],
//         [name]: files ? files[0] : value,
//       },
//     }));
//   };

//   const handleSubmit = async (e, pool) => {
//     e.preventDefault();
//     const data = formData[pool._id];
//     const guestCount = parseInt(data?.guestCount, 10);

//     if (
//       !data?.fullName ||
//       !data?.date ||
//       !data?.guestCount ||
//       !data?.proof ||
//       !data?.checkInTime ||
//       !data?.checkOutTime ||
//       !data?.phoneNumber ||
//       isNaN(guestCount) ||
//       guestCount < 1
//     ) {
//       setBookingStatus((prev) => ({
//         ...prev,
//         [pool._id]: { message: "Please fill all required fields correctly", error: true },
//       }));
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/pool-bookings/${pool._id}/${data.date}`
//       );
//       const existingCount = res.data.totalGuests || 0;

//       if (existingCount + guestCount > pool.capacity) {
//         setBookingStatus((prev) => ({
//           ...prev,
//           [pool._id]: { message: "Pool capacity exceeded for this date(Day capacity)", error: true },
//         }));
//         return;
//       }

//       const bookingForm = new FormData();
//       bookingForm.append("fullName", data.fullName);
//       bookingForm.append("date", data.date);
//       bookingForm.append("request", data.request || "");
//       bookingForm.append("guestCount", guestCount);
//       bookingForm.append("paymentProof", data.proof);
//       bookingForm.append("poolId", pool._id);
//       bookingForm.append("checkInTime", data.checkInTime);
//       bookingForm.append("checkOutTime", data.checkOutTime);
//       bookingForm.append("phoneNumber", data.phoneNumber);
//       if (data.whatsappNumber) {
//         bookingForm.append("whatsappNumber", data.whatsappNumber);
//       }

//       await axios.post("http://localhost:5000/api/pool-bookings", bookingForm, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setBookingStatus((prev) => ({
//         ...prev,
//         [pool._id]: { message: "Booking successful!", error: false },
//       }));

//       setFormData((prev) => ({ ...prev, [pool._id]: {} }));

//       setTimeout(() => {
//         setBookingStatus((prev) => ({
//           ...prev,
//           [pool._id]: null,
//         }));
//       }, 5000);
//     } catch (error) {
//       console.error("Booking error:", error);
//       setBookingStatus((prev) => ({
//         ...prev,
//         [pool._id]: { message: "Booking failed", error: true },
//       }));
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="bg-gray-100 min-h-screen px-4 md:px-10 py-6">
//         <h2 className="text-3xl font-bold text-center mb-8">Pool Booking</h2>
        
//         {pools.map((pool) => (
//           <div
//             key={pool._id}
//             className="bg-white shadow-lg rounded-xl mb-10 overflow-hidden"
//           >
//             <div className="md:flex">
//               {pool.images.length > 0 ? (
//                 <img
//                   src={`http://localhost:5000${pool.images[0]}`}
//                   alt="Pool"
//                   className="w-full md:w-1/2 h-145 object-cover"
//                 />
//               ) : (
//                 <div className="w-full md:w-1/2 h-72 bg-gray-300 flex items-center justify-center text-gray-600">
//                   No Image Available
//                 </div>
//               )}

//               <div className="p-6 flex-1">
//                 <h3 className="text-2xl font-semibold mb-2">{pool.name}</h3>
//                 <p className="text-gray-700 mb-2">{pool.description}</p>
//                 <p className="text-sm text-gray-600 mb-1">Capacity: {pool.capacity}</p>
//                 <p className="text-sm mb-1">
//                   Status:{" "}
//                   <span
//                     className={`font-semibold ${
//                       pool.poolStatus === "Available" ? "text-green-600" : "text-red-600"
//                     }`}
//                   >
//                     {pool.poolStatus}
//                   </span>
//                 </p>
//                 <p className="text-sm text-gray-700 mb-4">
//                   Open: {pool.openingTime} - {pool.closingTime}
//                 </p>

//                 <form onSubmit={(e) => handleSubmit(e, pool)} className="space-y-4">
//                   <input
//                     type="text"
//                     name="fullName"
//                     placeholder="Full Name"
//                     value={formData[pool._id]?.fullName || ""}
//                     onChange={(e) => handleChange(e, pool._id)}
//                     className="w-full px-4 py-2 border rounded"
//                     required
//                   />

//                   <input
//                     type="date"
//                     name="date"
//                     value={formData[pool._id]?.date || ""}
//                     onChange={(e) => handleDateChange(e, pool._id)}
//                     className="w-full px-4 py-2 border rounded"
//                     required
//                   />

//                   {availability === "full" && (
//                     <p className="text-red-600 font-semibold">❌ Fully Booked for this date</p>
//                   )}
//                   {availability === "limited" && (
//                     <p className="text-yellow-500 font-semibold">
//                       ⚠️ Only {remainingSlots} slots left
//                     </p>
//                   )}
//                   {availability === "available" && (
//                     <p className="text-green-600 font-semibold">✅ Available</p>
//                   )}

//                   <p className="text-sm text-gray-700 mb-4">
//                     Available Slots: {remainingSlots} / {pool.capacity}
//                   </p>

//                   {/* New Contact Fields */}
//                   <input
//                     type="tel"
//                     name="phoneNumber"
//                     placeholder="Phone Number *"
//                     value={formData[pool._id]?.phoneNumber || ""}
//                     onChange={(e) => handleChange(e, pool._id)}
//                     className="w-full px-4 py-2 border rounded"
//                     required
//                   />
//                   <input
//                     type="tel"
//                     name="whatsappNumber"
//                     placeholder="WhatsApp Number (Optional)"
//                     value={formData[pool._id]?.whatsappNumber || ""}
//                     onChange={(e) => handleChange(e, pool._id)}
//                     className="w-full px-4 py-2 border rounded"
//                   />

//                   {/* Time Selection Fields */}
//                   <div className="flex gap-4">
//                     <div className="flex-1">
//                       <label className="block text-sm mb-1">Check-in Time *</label>
//                       <input
//                         type="time"
//                         name="checkInTime"
//                         value={formData[pool._id]?.checkInTime || ""}
//                         onChange={(e) => handleChange(e, pool._id)}
//                         className="w-full px-4 py-2 border rounded"
//                         required
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <label className="block text-sm mb-1">Check-out Time *</label>
//                       <input
//                         type="time"
//                         name="checkOutTime"
//                         value={formData[pool._id]?.checkOutTime || ""}
//                         onChange={(e) => handleChange(e, pool._id)}
//                         className="w-full px-4 py-2 border rounded"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <input
//                     type="number"
//                     name="guestCount"
//                     placeholder="Number of Guests *"
//                     min="1"
//                     value={formData[pool._id]?.guestCount || ""}
//                     onChange={(e) => handleChange(e, pool._id)}
//                     className="w-full px-4 py-2 border rounded"
//                     required
//                   />

//                   <textarea
//                     name="request"
//                     placeholder="Special Requests"
//                     value={formData[pool._id]?.request || ""}
//                     onChange={(e) => handleChange(e, pool._id)}
//                     className="w-full px-4 py-2 border rounded"
//                   />

//                   <div className="pt-2">
//                     <label className="block text-sm mb-2">Payment Proof *</label>
//                     <input
//                       type="file"
//                       name="proof"
//                       accept="image/*,application/pdf"
//                       onChange={(e) => handleChange(e, pool._id)}
//                       className="w-full"
//                       required
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
//                   >
//                     Book Now
//                   </button>

//                   {bookingStatus[pool._id] && (
//                     <p
//                       className={`text-sm mt-2 ${
//                         bookingStatus[pool._id].error ? "text-red-600" : "text-green-600"
//                       }`}
//                     >
//                       {bookingStatus[pool._id].message}
//                     </p>
//                   )}
//                 </form>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Pool_Book;


import mongoose from "mongoose";

const poolBookingSchema = new mongoose.Schema({
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: "Pool", required: true },
  fullName: { type: String, required: true },
  date: { type: Date, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  specificRequest: { type: String, default: "" },
  paymentProof: { type: String, required: true },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  whatsappNumber: { type: String, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("PoolBooking", poolBookingSchema);