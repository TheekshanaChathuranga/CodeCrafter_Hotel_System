const validateEvent = (req, res, next) => {
  const { name, phone1, noOfGuests, eventType, hall, checkIn, checkOut, tableData, extraFields } = req.body;

  const errors = [];

  // Required fields validation
  if (!name) errors.push("Name is required");
  if (!phone1) errors.push("Phone number is required");
  if (!noOfGuests || noOfGuests < 1) errors.push("Number of guests must be at least 1");
  if (!eventType) errors.push("Event type is required");
  if (!hall) {
    errors.push("Hall selection is required");
  } else if (!["Hall No 1", "Hall No 2"].includes(hall)) {
    errors.push("Invalid hall selection. Must be either 'Hall No 1' or 'Hall No 2'");
  }
  if (!checkIn) errors.push("Check-in date is required");
  if (!checkOut) errors.push("Check-out date is required");

  // Phone number format validation
  const phoneRegex = /^\d{10}$/;
  if (phone1 && !phoneRegex.test(phone1)) {
    errors.push("Phone number must be exactly 10 digits");
  }
  if (req.body.phone2 && !phoneRegex.test(req.body.phone2)) {
    errors.push("Secondary phone number must be exactly 10 digits");
  }

  // Date validation
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      errors.push("Check-out must be after check-in (date and time)");
    }
  }

  // Email validation if provided
  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    errors.push("Invalid email format");
  }

  // Table data validation
  if (!Array.isArray(tableData) || tableData.length === 0) {
    errors.push("At least one food item is required");
  } else {
    tableData.forEach((item, index) => {
      if (!item.description) errors.push(`Food item ${index + 1}: Description is required`);
      if (!item.category) errors.push(`Food item ${index + 1}: Category is required`);
      if (!item.unit) errors.push(`Food item ${index + 1}: Unit is required`);
      if (item.quantity === undefined || item.quantity === null) {
        errors.push(`Food item ${index + 1}: Quantity is required`);
      } else if (item.quantity < 0) {
        errors.push(`Food item ${index + 1}: Quantity must be non-negative`);
      }
      if (item.rate === undefined || item.rate === null) {
        errors.push(`Food item ${index + 1}: Price is required`);
      } else if (item.rate < 0) {
        errors.push(`Food item ${index + 1}: Price must be non-negative`);
      }
    });
  }

  // Extra fields validation if provided
  if (extraFields && Array.isArray(extraFields)) {
    extraFields.forEach((item, index) => {
      if (item.description) {
        if (item.rate === undefined || item.rate === null) {
          errors.push(`Extra item ${index + 1}: Price is required`);
        } else if (item.rate < 0) {
          errors.push(`Extra item ${index + 1}: Price must be non-negative`);
        }
      }
    });
  }

  if (errors.length > 0) {
    console.log("Validation errors:", errors);
    return res.status(400).json({
      message: "Validation failed",
      errors: errors
    });
  }

  // Format hall number if needed
  if (hall && !hall.startsWith("Hall No ")) {
    req.body.hall = `Hall No ${hall}`;
  }

  next();
};

export default validateEvent;