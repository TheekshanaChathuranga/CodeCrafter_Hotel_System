const mongoose = require('mongoose');

const poolBookingSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  whatsapp: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid WhatsApp number!`
    }
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  peopleCount: { 
    type: Number, 
    required: [true, 'Number of people is required'],
    min: [1, 'At least 1 person is required'],
    max: [20, 'Maximum 20 people allowed']
  },
  checkIn: { 
    type: Date, 
    required: [true, 'Check-in time is required'] 
  },
  checkOut: { 
    type: Date, 
    required: [true, 'Check-out time is required'] 
  },
  additionalHours: {
    type: Number,
    default: 0,
    min: [0, 'Additional hours cannot be negative']
  },
  totalAmount: { 
    type: Number, 
    required: [true, 'Total amount is required'],
    min: [500, 'Minimum amount is Rs.500']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  fullName: { type: String },
  guestCount: { type: Number },
  specificRequest: { type: String },
  paymentProof: { type: String },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  phoneNumber: { type: String },
  whatsappNumber: { type: String },
  status: { type: String },
});

// Validate checkOut is at least 2 hours after checkIn
poolBookingSchema.pre('save', function(next) {
  const minDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const actualDuration = this.checkOut - this.checkIn;
  
  if (actualDuration < minDuration) {
    const err = new Error('Check-out time must be at least 2 hours after check-in time');
    next(err);
  } else {
    // Calculate additional hours
    const baseHours = 2;
    const totalHours = actualDuration / (1000 * 60 * 60);
    this.additionalHours = Math.max(0, Math.ceil(totalHours - baseHours));
    next();
  }
});

// Indexes for better performance
poolBookingSchema.index({ checkIn: 1 });
poolBookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PoolBooking', poolBookingSchema);