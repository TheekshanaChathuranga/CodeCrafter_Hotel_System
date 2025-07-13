import mongoose from 'mongoose';

const customerEventSchema = new mongoose.Schema({
  contactName: {
    type: String,
    required: [true, 'Contact name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: {
      validator: function(v) {
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Must be exactly 10 digits.`
    }
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  eventTime: {
    type: String,
    required: [true, 'Event time is required']
  },
  attendees: {
    type: Number,
    required: [true, 'Number of attendees is required'],
    min: [1, 'Must have at least 1 attendee']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  collection: 'customer_events',
  timestamps: true
});

export default mongoose.model('CustomerEvent', customerEventSchema); 