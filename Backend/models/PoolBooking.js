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
  totalAmount: { 
    type: Number, 
    required: [true, 'Total amount is required'],
    min: [500, 'Minimum amount is Rs.500']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Validate checkOut is after checkIn
poolBookingSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    const err = new Error('Check-out time must be after check-in time');
    next(err);
  } else {
    next();
  }
});

// Indexes for better performance
poolBookingSchema.index({ checkIn: 1 });
poolBookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PoolBooking', poolBookingSchema);