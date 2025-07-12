import React, { useEffect, useState } from "react";
import axios from "axios";
//
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/UserAuthContext";

const Pool_Book = () => {
  const { user } = useAuth(); // Get authenticated user data
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

  // Auto-fill full name when pools are loaded and user is available
  useEffect(() => {
    if (user && pools.length > 0) {
      const userFullName = user.fullName || user.username || "";
      if (userFullName) {
        setPools((currentPools) => {
          const updatedFormData = {};
          currentPools.forEach((pool) => {
            updatedFormData[pool._id] = {
              ...formData[pool._id],
              fullName: userFullName,
            };
          });
          setFormData((prev) => ({ ...prev, ...updatedFormData }));
          return currentPools;
        });
      }
    }
  }, [user, pools.length]); // Depend on user and pools length

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
        `http://localhost:5000/api/pool-booking/${poolId}/${selectedDate}`
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

  // Generate time options between pool's opening and closing times
  const generateTimeOptions = (openingTime, closingTime) => {
    const options = [];

    // Convert opening and closing times to minutes
    const [openHour, openMin] = openingTime.split(":").map(Number);
    const [closeHour, closeMin] = closingTime.split(":").map(Number);

    const openingMinutes = openHour * 60 + openMin;
    const closingMinutes = closeHour * 60 + closeMin;

    // Generate 30-minute intervals from opening to closing time
    // But ensure checkout time (opening + 2 hours) doesn't exceed closing time
    for (
      let minutes = openingMinutes;
      minutes <= closingMinutes - 120;
      minutes += 30
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      const timeValue = `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;

      // Format for display (12-hour format)
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? "PM" : "AM";
      const displayTime = `${displayHour.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")} ${period}`;

      options.push({ value: timeValue, display: displayTime });
    }

    return options;
  };

  // Generate check-out time options (from check-in time + 1 hour to closing time)
  const generateCheckOutTimeOptions = (
    openingTime,
    closingTime,
    checkInTime
  ) => {
    const options = [];

    if (!checkInTime) return options;

    // Convert times to minutes
    const [closeHour, closeMin] = closingTime.split(":").map(Number);
    const [checkInHour, checkInMin] = checkInTime.split(":").map(Number);

    const closingMinutes = closeHour * 60 + closeMin;
    const checkInMinutes = checkInHour * 60 + checkInMin;

    // Generate options from check-in time + 1 hour to closing time
    for (
      let minutes = checkInMinutes + 60;
      minutes <= closingMinutes;
      minutes += 30
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      const timeValue = `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;

      // Format for display (12-hour format)
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? "PM" : "AM";
      const displayTime = `${displayHour.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")} ${period}`;

      options.push({ value: timeValue, display: displayTime });
    }

    return options;
  };

  // Handle Check-In Time change and auto-fill Check-Out Time
  const handleCheckInTimeChange = (e, poolId) => {
    const checkInTime = e.target.value;

    // Calculate default Check-Out Time (2 hours after Check-In)
    let defaultCheckOutTime = "";
    if (checkInTime) {
      const [hours, minutes] = checkInTime.split(":");
      const checkInDate = new Date();
      checkInDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Add 2 hours for default checkout time
      const checkOutDate = new Date(checkInDate.getTime() + 2 * 60 * 60 * 1000);

      // Format back to HH:MM
      const checkOutHours = checkOutDate.getHours().toString().padStart(2, "0");
      const checkOutMinutes = checkOutDate
        .getMinutes()
        .toString()
        .padStart(2, "0");
      defaultCheckOutTime = `${checkOutHours}:${checkOutMinutes}`;

      // Validate that default checkout time doesn't exceed pool closing time
      const pool = pools.find((p) => p._id === poolId);
      if (pool && pool.closingTime) {
        const [closeHour, closeMin] = pool.closingTime.split(":").map(Number);
        const closingMinutes = closeHour * 60 + closeMin;
        const checkoutMinutes =
          checkOutDate.getHours() * 60 + checkOutDate.getMinutes();

        if (checkoutMinutes > closingMinutes) {
          // Set checkout to closing time if 2 hours exceeds closing
          defaultCheckOutTime = pool.closingTime;
        }
      }

      // Clear any previous error
      setFieldErrors((prev) => ({
        ...prev,
        [poolId]: {
          ...prev[poolId],
          checkInTime: undefined,
        },
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [poolId]: {
        ...prev[poolId],
        checkInTime: checkInTime,
        checkOutTime: defaultCheckOutTime, // Auto-fill but user can change
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
          message:
            "Please fill all required fields correctly. Make sure to select a Check-In Time.",
          error: true,
        },
      }));
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/pool-booking/${pool._id}/${data.date}`
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

      // Debug: Log the form data
      console.log("Sending booking data:", {
        fullName: data.fullName,
        date: data.date,
        request: data.request || "",
        guestCount: guestCount,
        poolId: pool._id,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber || "",
        hasPaymentProof: !!data.proof,
      });

      const response = await axios.post(
        "http://localhost:5000/api/pool-booking",
        bookingForm,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setBookingStatus((prev) => ({
        ...prev,
        [pool._id]: { message: "Booking successful!", error: false },
      }));

      setShowSuccess(true);

      setFormData((prev) => ({ ...prev, [pool._id]: {} }));
    } catch (error) {
      console.error("Booking error:", error);
      console.error("Error response:", error.response?.data);

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
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Handle general backend errors
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: { message: error.response.data.message, error: true },
        }));
      } else {
        // Handle network or other errors
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: `Booking failed: ${error.message || "Unknown error"}`,
            error: true,
          },
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
                {/* Pool Header */}
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {pool.name}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">
                    {pool.description}
                  </p>

                  {/* Pool Details Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Capacity Card */}
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center">
                        <div className="text-blue-600 mr-3">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Capacity</p>
                          <p className="text-xl font-bold text-blue-700">
                            {pool.capacity} People
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div
                      className={`rounded-lg p-4 border-l-4 ${
                        pool.poolStatus === "Available"
                          ? "bg-green-50 border-green-500"
                          : "bg-red-50 border-red-500"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`mr-3 ${
                            pool.poolStatus === "Available"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p
                            className={`text-xl font-bold ${
                              pool.poolStatus === "Available"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {pool.poolStatus}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opening Hours Card */}
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="flex items-center">
                        <div className="text-orange-600 mr-3">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Open Hours</p>
                          <p className="text-lg font-bold text-orange-700">
                            {pool.openingTime} - {pool.closingTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                        min={new Date().toISOString().split("T")[0]}
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
                      <select
                        name="checkInTime"
                        value={formData[pool._id]?.checkInTime || ""}
                        onChange={(e) => handleCheckInTimeChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Check-In Time</option>
                        {generateTimeOptions(
                          pool.openingTime,
                          pool.closingTime
                        ).map((timeOption) => (
                          <option
                            key={timeOption.value}
                            value={timeOption.value}
                          >
                            {timeOption.display}
                          </option>
                        ))}
                      </select>
                      {fieldErrors[pool._id]?.checkInTime && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].checkInTime}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Check-Out Time <span className="text-red-500">*</span>
                        <span className="text-sm text-gray-500 ml-2">
                          (Auto-filled: Can be editable)
                        </span>
                      </label>
                      <select
                        name="checkOutTime"
                        value={formData[pool._id]?.checkOutTime || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Check-Out Time</option>
                        {generateCheckOutTimeOptions(
                          pool.openingTime,
                          pool.closingTime,
                          formData[pool._id]?.checkInTime
                        ).map((timeOption) => (
                          <option
                            key={timeOption.value}
                            value={timeOption.value}
                          >
                            {timeOption.display}
                          </option>
                        ))}
                      </select>
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
                      onClick={() => {
                        // Clear form data for this pool
                        setFormData((prev) => ({ ...prev, [pool._id]: {} }));
                        // Clear any error messages
                        setBookingStatus((prev) => ({
                          ...prev,
                          [pool._id]: null,
                        }));
                        setFieldErrors((prev) => ({ ...prev, [pool._id]: {} }));
                      }}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Clear Form
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
