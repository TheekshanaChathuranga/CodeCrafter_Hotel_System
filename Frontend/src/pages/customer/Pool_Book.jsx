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
  const [isSubmitting, setIsSubmitting] = useState({});

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

    // Handle file upload validation
    if (name === "proof" && files && files[0]) {
      const file = files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        setFieldErrors((prev) => ({
          ...prev,
          [poolId]: {
            ...prev[poolId],
            paymentProof: "File size must be less than 5MB",
          },
        }));
        return;
      }

      // Clear any previous error for this field
      setFieldErrors((prev) => ({
        ...prev,
        [poolId]: {
          ...prev[poolId],
          paymentProof: undefined,
        },
      }));
    }

    // Handle phone number input validation (only allow digits)
    if ((name === "phoneNumber" || name === "whatsappNumber") && value) {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) {
        return; // Don't allow more than 10 digits
      }
      setFormData((prev) => ({
        ...prev,
        [poolId]: {
          ...prev[poolId],
          [name]: digitsOnly,
        },
      }));
    } else if (name === "fullName" && value) {
      // Handle full name validation (only allow letters, spaces, and dots)
      const validName = value.replace(/[^A-Za-z.\s]/g, "");
      setFormData((prev) => ({
        ...prev,
        [poolId]: {
          ...prev[poolId],
          [name]: validName,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [poolId]: {
          ...prev[poolId],
          [name]: files ? files[0] : value,
        },
      }));
    }

    // Clear field errors when user starts typing/selecting
    if (fieldErrors[poolId]?.[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [poolId]: {
          ...prev[poolId],
          [name]: undefined,
        },
      }));
    }
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

    // Prevent multiple submissions
    if (isSubmitting[pool._id]) {
      return;
    }

    // Clear any previous booking status
    setBookingStatus((prev) => ({
      ...prev,
      [pool._id]: null,
    }));

    setConfirmData({ event: e, pool });
    setShowConfirm(true);
  };

  const validateForm = (data, pool) => {
    const errors = {};

    // Full Name validation - only English letters, spaces, and dots
    if (!data.fullName?.trim()) {
      errors.fullName = "Full name is required";
    } else if (!/^[A-Za-z.\s]+$/.test(data.fullName.trim())) {
      errors.fullName =
        "Name can only contain English letters, spaces, and dots";
    }

    // Phone number validation - exactly 10 digits
    if (!data.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(data.phoneNumber.trim())) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    // WhatsApp number validation - exactly 10 digits (if provided)
    if (
      data.whatsappNumber?.trim() &&
      !/^[0-9]{10}$/.test(data.whatsappNumber.trim())
    ) {
      errors.whatsappNumber = "WhatsApp number must be exactly 10 digits";
    }

    // Date validation - must be today or future date
    if (!data.date) {
      errors.date = "Booking date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(data.date);
      bookingDate.setHours(0, 0, 0, 0);
      if (isNaN(bookingDate.getTime()) || bookingDate < today) {
        errors.date = "Booking date must be today or a future date";
      }
    }

    // Guest count validation
    const guestCount = parseInt(data.guestCount, 10);
    if (!data.guestCount || isNaN(guestCount) || guestCount < 1) {
      errors.guestCount = "Number of guests must be at least 1";
    } else if (guestCount > pool.capacity) {
      errors.guestCount = `Number of guests cannot exceed pool capacity (${pool.capacity})`;
    }

    // File validation
    if (!data.proof) {
      errors.paymentProof = "Payment proof is required";
    }

    // Time validation
    if (!data.checkInTime) {
      errors.checkInTime = "Check-in time is required";
    }
    if (!data.checkOutTime) {
      errors.checkOutTime = "Check-out time is required";
    }

    // Check if check-in/check-out times are within pool hours
    if (
      data.checkInTime &&
      data.checkOutTime &&
      pool.openingTime &&
      pool.closingTime
    ) {
      const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const checkInMins = timeToMinutes(data.checkInTime);
      const checkOutMins = timeToMinutes(data.checkOutTime);
      const openMins = timeToMinutes(pool.openingTime);
      const closeMins = timeToMinutes(pool.closingTime);

      if (checkInMins < openMins || checkInMins >= closeMins) {
        errors.checkInTime = `Check-in time must be within pool hours (${pool.openingTime} - ${pool.closingTime})`;
      }
      if (checkOutMins > closeMins || checkOutMins <= openMins) {
        errors.checkOutTime = `Check-out time must be within pool hours (${pool.openingTime} - ${pool.closingTime})`;
      }
      if (checkOutMins <= checkInMins) {
        errors.checkOutTime = "Check-out time must be after check-in time";
      }
    }

    return errors;
  };

  const handleConfirmYes = async () => {
    const { event, pool } = confirmData;
    const data = formData[pool._id];
    setShowConfirm(false);

    // Set submitting state
    setIsSubmitting((prev) => ({
      ...prev,
      [pool._id]: true,
    }));

    // Clear previous errors and status
    setFieldErrors((prev) => ({
      ...prev,
      [pool._id]: {},
    }));

    setBookingStatus((prev) => ({
      ...prev,
      [pool._id]: null,
    }));

    // Validate required fields
    if (!data) {
      setBookingStatus((prev) => ({
        ...prev,
        [pool._id]: {
          message: "Please fill all required fields.",
          error: true,
        },
      }));
      setIsSubmitting((prev) => ({
        ...prev,
        [pool._id]: false,
      }));
      return;
    }

    // Validate form with backend-matching validation
    const validationErrors = validateForm(data, pool);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [pool._id]: validationErrors,
      }));
      setBookingStatus((prev) => ({
        ...prev,
        [pool._id]: {
          message: "Please fix the form errors before submitting.",
          error: true,
        },
      }));
      setIsSubmitting((prev) => ({
        ...prev,
        [pool._id]: false,
      }));
      return;
    }

    const guestCount = parseInt(data.guestCount, 10);

    try {
      console.log("Starting booking process for pool:", pool._id);

      // Check availability
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
        setIsSubmitting((prev) => ({
          ...prev,
          [pool._id]: false,
        }));
        return;
      }

      // Additional validation before submitting
      if (!data.proof || !data.proof.name) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Please select a payment proof file.",
            error: true,
          },
        }));
        setIsSubmitting((prev) => ({
          ...prev,
          [pool._id]: false,
        }));
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(data.proof.type)) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Please upload a valid image (JPG, PNG) or PDF file.",
            error: true,
          },
        }));
        setIsSubmitting((prev) => ({
          ...prev,
          [pool._id]: false,
        }));
        return;
      }

      // Create form data for submission - send only the fields expected by the backend route
      const bookingForm = new FormData();

      // Required fields as expected by the backend route
      bookingForm.append("fullName", data.fullName.trim());
      bookingForm.append("date", data.date);
      bookingForm.append("guestCount", guestCount.toString());
      bookingForm.append("paymentProof", data.proof);
      bookingForm.append("poolId", pool._id);
      bookingForm.append("checkInTime", data.checkInTime);
      bookingForm.append("checkOutTime", data.checkOutTime);
      bookingForm.append("phoneNumber", data.phoneNumber.trim());

      // Add model-required fields that the backend route doesn't handle properly
      // These will help the model validation pass
      const checkInDate = new Date(`${data.date}T${data.checkInTime}`);
      const checkOutDate = new Date(`${data.date}T${data.checkOutTime}`);

      // Validate Date objects
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Invalid date or time format. Please check your input.",
            error: true,
          },
        }));
        setIsSubmitting((prev) => ({
          ...prev,
          [pool._id]: false,
        }));
        return;
      }

      // Add the required Date fields for the model
      bookingForm.append("checkIn", checkInDate.toISOString());
      bookingForm.append("checkOut", checkOutDate.toISOString());
      bookingForm.append("peopleCount", guestCount.toString());

      // Optional fields
      if (data.request?.trim()) {
        bookingForm.append("request", data.request.trim());
        bookingForm.append("specificRequest", data.request.trim()); // alias
      }

      if (data.whatsappNumber?.trim()) {
        bookingForm.append("whatsappNumber", data.whatsappNumber.trim());
      }

      console.log("Submitting booking form...");
      console.log("Form data values:", {
        fullName: data.fullName.trim(),
        date: data.date,
        guestCount: guestCount.toString(),
        peopleCount: guestCount.toString(),
        poolId: pool._id,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        checkIn: new Date(`${data.date}T${data.checkInTime}`).toISOString(),
        checkOut: new Date(`${data.date}T${data.checkOutTime}`).toISOString(),
        phoneNumber: data.phoneNumber.trim(),
        whatsappNumber: data.whatsappNumber?.trim() || "",
        request: data.request?.trim() || "",
        specificRequest: data.request?.trim() || "",
        proofFile: data.proof
          ? `${data.proof.name} (${data.proof.size} bytes)`
          : "No file",
      });

      // Get auth token if available
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Submit booking with improved error handling
      const response = await axios.post(
        "http://localhost:5000/api/pool-booking",
        bookingForm,
        {
          headers,
          timeout: 30000, // 30 second timeout
          maxContentLength: 10 * 1024 * 1024, // 10MB max content length
          maxBodyLength: 10 * 1024 * 1024, // 10MB max body length
        }
      );

      console.log("Booking successful:", response.data);

      // Success handling
      setBookingStatus((prev) => ({
        ...prev,
        [pool._id]: { message: "Booking successful!", error: false },
      }));

      setShowSuccess(true);

      // Clear form data for this pool
      setFormData((prev) => ({
        ...prev,
        [pool._id]: {
          fullName: user?.fullName || user?.username || "", // Keep user's name
        },
      }));
    } catch (error) {
      console.error("Booking error:", error);
      console.error("Error details:", {
        response: error.response,
        message: error.message,
        code: error.code,
        config: error.config,
      });

      // Handle backend field errors
      if (error.response?.data?.field) {
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
      } else if (error.response?.data?.message) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: { message: error.response.data.message, error: true },
        }));
      } else if (error.response?.status === 500) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Server error. Please try again later.",
            error: true,
          },
        }));
      } else if (error.code === "ECONNABORTED") {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Request timeout. Please try again.",
            error: true,
          },
        }));
      } else if (error.code === "ERR_NETWORK") {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Network error. Please check your connection.",
            error: true,
          },
        }));
      } else if (error.message) {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: { message: `Error: ${error.message}`, error: true },
        }));
      } else {
        setBookingStatus((prev) => ({
          ...prev,
          [pool._id]: {
            message: "Booking failed. Please try again.",
            error: true,
          },
        }));
      }
    } finally {
      // Reset submitting state
      setIsSubmitting((prev) => ({
        ...prev,
        [pool._id]: false,
      }));
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
                        placeholder="Enter your full name (letters, spaces, and dots only)"
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
                        placeholder="Enter 10-digit phone number"
                        pattern="[0-9]{10}"
                        maxLength="10"
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
                        placeholder="Optional - Enter 10-digit WhatsApp number"
                        pattern="[0-9]{10}"
                        maxLength="10"
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
                      {fieldErrors[pool._id]?.checkOutTime && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].checkOutTime}
                        </div>
                      )}
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
                        max={pool.capacity}
                        value={formData[pool._id]?.guestCount || ""}
                        onChange={(e) => handleChange(e, pool._id)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {fieldErrors[pool._id]?.guestCount && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].guestCount}
                        </div>
                      )}
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
                      {fieldErrors[pool._id]?.paymentProof && (
                        <div className="text-red-600 text-sm mt-1">
                          {fieldErrors[pool._id].paymentProof}
                        </div>
                      )}
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
                      disabled={isSubmitting[pool._id]}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isSubmitting[pool._id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-gray-700"
                      } text-white`}
                    >
                      {isSubmitting[pool._id] ? "Processing..." : "Book Now"}
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
