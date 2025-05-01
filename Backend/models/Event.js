import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phone1: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  phone2: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
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
  noOfGuests: {
    type: Number,
    required: [true, "Number of guests is required"],
    min: [1, "Number of guests must be at least 1"]
  },
  eventType: {
    type: String,
    required: [true, "Event type is required"],
    enum: ["Wedding", "Birthday", "Corporate", "Other"]
  },
  hall: {
    type: String,
    required: [true, "Hall selection is required"],
    enum: ["Hall No 1", "Hall No 2"]
  },
  checkIn: {
    type: Date,
    required: [true, "Check-in date is required"]
  },
  checkOut: {
    type: Date,
    required: [true, "Check-out date is required"],
    validate: {
      validator: function(v) {
        const checkInDate = this.checkIn || this.getUpdate()?.$set?.checkIn;
        return v > checkInDate;
      },
      message: "Check-out date must be after check-in date"
    }
  },
  tableData: [{
    description: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  extraFields: [{
    description: String,
    unit: String,
    quantity: {
      type: Number,
      min: 0
    },
    rate: {
      type: Number,
      min: 0
    },
    amount: {
      type: Number,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  serviceCharge: {
    type: Number,
    required: true,
    min: 0
  },
  extraAmount: {
    type: Number,
    required: true,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String,
  excelFile: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Event = mongoose.model("Event", eventSchema);

export default Event;