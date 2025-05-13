import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: [true, "Room number is required"] 
  },
  roomType: { 
    type: String, 
    required: [true, "Room type is required"] 
  },
  checkIn: { 
    type: Date, 
    required: [true, "Check-in date is required"] 
  },
  checkOut: { 
    type: Date, 
    required: [true, "Check-out date is required"] 
  },
  fullName: { 
    type: String, 
    required: [true, "Full name is required"] 
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Must be 10 digits.`
    }
  },
  nicNumber: { 
    type: String 
  },
  whatsappNumber: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid WhatsApp number!`
    }
  },
  adults: { 
    type: Number, 
    required: [true, "Number of adults is required"],
    min: [1, "At least 1 adult required"] 
  },
  children: { 
    type: Number, 
    default: 0,
    min: [0, "Cannot have negative children"] 
  },
  specialRequests: { 
    type: String 
  },
  document: {
    type: String,
    required: [true, "Document (Image/PDF) is required"]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date
}, { 
  collection: 'onlinebooking',
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add index for better query performance
bookingSchema.index({ roomNumber: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model('Booking', bookingSchema)