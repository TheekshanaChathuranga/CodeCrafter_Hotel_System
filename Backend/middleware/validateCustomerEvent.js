const validateCustomerEvent = (req, res, next) => {
  const { contactName, email, phone, eventType, eventDate, eventTime, attendees } = req.body;

  const errors = [];

  // Required checks
  if (!contactName) errors.push('Contact Name is required');
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }
  if (!phone) {
    errors.push('Phone Number is required');
  } else if (!/^\d{10}$/.test(phone)) {
    errors.push('Phone number must be exactly 10 digits');
  }
  if (!eventType) errors.push('Event Type is required');
  if (!eventDate) {
    errors.push('Event Date is required');
  } else {
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.push('Event date cannot be in the past');
    }
  }
  if (!eventTime) errors.push('Event Time is required');
  if (attendees === undefined || attendees === null) {
    errors.push('Number of Attendees is required');
  } else if (isNaN(attendees) || Number(attendees) < 1) {
    errors.push('Number of Attendees must be at least 1');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export default validateCustomerEvent; 