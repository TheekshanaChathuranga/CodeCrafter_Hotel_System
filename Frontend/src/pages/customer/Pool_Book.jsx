import React, { useEffect, useState } from "react";
import axios from "axios";
//
import Navbar from "../../components/Navbar";

const Pool_Book = () => {
  const [pools, setPools] = useState([]);
  const [formData, setFormData] = useState({});
  const [bookingStatus, setBookingStatus] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [availability, setAvailability] = useState(null);
  const [remainingSlots, setRemainingSlots] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({});

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pools");
        const availablePools = res.data.filter(
          (pool) => pool.poolStatus === "Available"
        );
        setPools(availablePools);
      } catch (err) {
        console.error("Error fetching pools:", err);
      }
    };
    fetchPools();
  }, []);

  const handleDateChange = async (e, poolId) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [poolId]: {
        ...prev[poolId],
        date: selectedDate,
      },
    }));

    if (!poolId || !selectedDate) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/poolBookings/${poolId}/${selectedDate}`
      );
      const totalGuests = res.data.totalGuests || 0;
      const poolCapacity =
        pools.find((pool) => pool._id === poolId)?.capacity || 0;
      const remaining = poolCapacity - totalGuests;
      setRemainingSlots(remaining);

      if (remaining <= 0) setAvailability("full");
      else if (remaining <= 5) setAvailability("limited");
      else setAvailability("available");
    } catch (err) {
      console.error("Error checking availability:", err);
      setAvailability(null);
    }
  };

  const handleChange = (e, poolId) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [poolId]: {
        ...prev[poolId],
        [name]: files ? files[0] : value,
      },
    }));
  };

  const handleBookingRequest = (e, pool) => {
    e.preventDefault();
    setConfirmData({ event: e, pool });
    setShowConfirm(true);
  };

  const handleConfirmYes = async () => {
    const { event, pool } = confirmData;
    const data = formData[pool._id];
    const guestCount = parseInt(data?.guestCount, 10);
    setShowConfirm(false);

    setFieldErrors({});

    if (
      !data?.fullName ||
      !data?.date ||
      !data?.guestCount ||
      !data?.proof ||
      !data?.checkInTime ||
      !data?.checkOutTime ||
      !data?.phoneNumber ||
      isNaN(guestCount) ||
      guestCount < 1
    ) {
      setBookingStatus((prev) => ({
        ...prev,
        [pool._id]: {
          message: "Please fill all required fields correctly",
          error: true,
        },
      }));
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/pool-bookings/${pool._id}/${data.date}`
      );
      const existingCount = res.data.totalGuests || 0;

      if (existingCount + guestCount > pool.capacity) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Pool capacity exceeded for this date",
            error: true,
          },
        }));
        return;
      }

      const bookingForm = new FormData();
      bookingForm.append("fullName", data.fullName);
      bookingForm.append("date", data.date);
      bookingForm.append("request", data.request || "");
      bookingForm.append("guestCount", guestCount);
      bookingForm.append("paymentProof", data.proof);
      bookingForm.append("poolId", pool._id);
      bookingForm.append("checkInTime", data.checkInTime);
      bookingForm.append("checkOutTime", data.checkOutTime);
      bookingForm.append("phoneNumber", data.phoneNumber);
      if (data.whatsappNumber) {
        bookingForm.append("whatsappNumber", data.whatsappNumber);
      }

      await axios.post("http://localhost:5000/api/pool-bookings", bookingForm);

      setBookingStatus((prev) => ({
        ...prev,
        [pool._id]: { message: "Booking successful!", error: false },
      }));

      setShowSuccess(true);

      setFormData((prev) => ({ ...prev, [pool._id]: {} }));
      // Success popup handler
      const handleSuccessOk = () => {
        setShowSuccess(false);
      };
    } catch (error) {
      // Handle backend field errors
      if (error.response && error.response.data && error.response.data.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [pool._id]: {
            ...prev[pool._id],
            [error.response.data.field]: error.response.data.message,
          },
        }));
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: { message: error.response.data.message, error: true },
        }));
      } else {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: { message: "Booking failed", error: true },
        }));
      }
    }
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
  };

  return (
    <div>
      {/* <Navbar /> */}
      <div className="bg-gray-100 min-h-screen px-4 md:px-10 py-6">
        <h2 className="text-3xl font-bold text-center mb-8">Pool Booking</h2>

        {pools.map((pool) => (
          <div
            key={pool._id}
            className="bg-white shadow-lg rounded-xl mb-10 overflow-hidden"
          >
            <div className="md:flex">
              {pool.images.length > 0 ? (
                <img
                  src={`http://localhost:5000${pool.images[0]}`}
                  alt="Pool"
                  className="w-full md:w-1/2 h-195 object-cover"
                />
              ) : (
                <div className="w-full md:w-1/2 h-195 bg-gray-300 flex items-center justify-center text-gray-600">
                  No Image Available
                </div>
              )}

              <div className="p-6 flex-1">
                <h3 className="text-2xl font-semibold mb-2">{pool.name}</h3>
                <p className="text-gray-700 mb-2">{pool.description}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Capacity: {pool.capacity}
                </p>
                <p className="text-sm mb-1">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      pool.poolStatus === "Available"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {pool.poolStatus}
                  </span>
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  Open: {pool.openingTime} - {pool.closingTime}
                </p>

                <form
                  onSubmit={(e) => handleBookingRequest(e, pool)}
                  className="space-y-6"
                >
                  {/* Full Name and Phone Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData[pool._id]?.fullName || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {fieldErrors[pool._id]?.fullName && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].fullName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData[pool._id]?.phoneNumber || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {fieldErrors[pool._id]?.phoneNumber && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        placeholder="Optional"
                        value={formData[pool._id]?.whatsappNumber || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {fieldErrors[pool._id]?.whatsappNumber && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].whatsappNumber}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Booking Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData[pool._id]?.date || ""}
                        onChange={(e) => handleDateChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {fieldErrors[pool._id]?.date && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].date}
                        </div>
                      )}
                      {availability === "full" && (
                        <p className="text-red-600 font-medium mt-1">
                          ❌ Fully Booked for this date
                        </p>
                      )}
                      {availability === "limited" && (
                        <p className="text-yellow-600 font-medium mt-1">
                          ⚠️ Only {remainingSlots} slots left
                        </p>
                      )}
                      {availability === "available" && (
                        <p className="text-green-600 font-medium mt-1">
                          ✅ Available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Check-In and Check-Out */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Check-In Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="checkInTime"
                        value={formData[pool._id]?.checkInTime || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {fieldErrors[pool._id]?.checkInTime && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].checkInTime}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Check-Out Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="checkOutTime"
                        value={formData[pool._id]?.checkOutTime || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Guest Count and Request */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Number of Guests <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="guestCount"
                        min="1"
                        value={formData[pool._id]?.guestCount || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {/* Payment Proof Upload */}
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Upload Proof of Payment (Image/PDF){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        name="proof"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Max 5MB. Formats: JPG, PNG, PDF
                      </p>
                    </div>
                  </div>
                  {/* Request */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Specific Request
                    </label>
                    <textarea
                      name="request"
                      rows="3"
                      value={formData[pool._id]?.request || ""}
                      onChange={(e) => handleChange(e, pool._id)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional request..."
                    ></textarea>
                  </div>

                  {/* Buttons and Booking Status */}
                  <div className="pt-4 space-y-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Book Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>

                    {bookingStatus[pool._id] && (
                      <p
                        className={`text-sm mt-2 ${
                          bookingStatus[pool._id].error
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {bookingStatus[pool._id].message}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        ))}

        {/* Popup Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h3 className="text-lg font-semibold mb-2">
                Are You Sure Booking Now?
              </h3>
              <p className="text-gray-700 mb-2">
                Date:{" "}
                <span className="font-medium text-blue-600">
                  {formData[confirmData?.pool?._id]?.date || "N/A"}
                </span>
              </p>
              <div className="flex justify-center gap-6 mt-6">
                <button
                  onClick={handleConfirmYes}
                  className="bg-blue-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={handleConfirmNo}
                  className="bg-red-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h3 className="text-lg font-semibold mb-4 text-green-700">
                Booking Successfully!!
              </h3>
              <button
                onClick={handleSuccessOk}
                className="bg-blue-600 hover:bg-gray-700 text-white px-6 py-2 rounded text-lg font-semibold"
              >
                Ok
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2025 The Lake Hotel & Resort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pool_Book;
