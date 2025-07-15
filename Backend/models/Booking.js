import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: [true, "Booking ID is required"],
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
    },
    roomType: {
      type: String,
      required: [true, "Room type is required"],
    },
    acType: {
      type: String,
      enum: ["AC", "Non-AC"],
      required: function () {
        // Only required if the room's acOption is "Flexible"
        return this.roomAcOption === "Flexible";
      },
    },
    roomAcOption: {
      type: String,
      enum: ["AC", "Non-AC", "Flexible"],
      required: [true, "Room AC option is required"],
    },
    bookingType: {
      type: String,
      enum: ["Day", "Night"],
      required: [true, "Booking type is required"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price cannot be negative"],
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0, "Price cannot be negative"],
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid phone number! Must be 10 digits.`,
      },
    },
    nicNumber: {
      type: String,
    },
    whatsappNumber: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid WhatsApp number!`,
      },
    },
    adults: {
      type: Number,
      required: [true, "Number of adults is required"],
      min: [1, "At least 1 adult required"],
    },
    children: {
      type: Number,
      default: 0,
    },
    specialRequests: {
      type: String,
    },
    documentPath: {
      type: String,
      required: [true, "Document path is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "onlinebooking",
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Add index for searching overlapping bookings
bookingSchema.index({ roomNumber: 1, checkIn: 1, checkOut: 1 });

// Add methods
bookingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Add statics for finding overlapping bookings
bookingSchema.statics.findOverlappingBookings = async function (
  roomNumber,
  checkIn,
  checkOut
) {
  return this.find({
    roomNumber,
    status: { $ne: "cancelled" },
    $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
  });
};

// Add static method to generate next booking ID
bookingSchema.statics.generateNextBookingId = async function () {
  try {
    // Find the latest booking with bookingId matching the pattern #RO####
    const latestBooking = await this.findOne(
      { bookingId: { $regex: /^#RO\d{4}$/ } },
      {},
      { sort: { bookingId: -1 } }
    );

    let nextNumber = 1;

    if (latestBooking && latestBooking.bookingId) {
      // Extract the number part from the booking ID (last 4 digits)
      const currentNumber = parseInt(latestBooking.bookingId.slice(-4));
      nextNumber = currentNumber + 1;
    }

    // Format the number as 4-digit string with leading zeros
    const formattedNumber = nextNumber.toString().padStart(4, "0");

    // Return the complete booking ID
    return `#RO${formattedNumber}`;
  } catch (error) {
    console.error("Error generating booking ID:", error);
    // Fallback to a random number if there's an error
    const randomNumber = Math.floor(Math.random() * 9999) + 1;
    return `#RO${randomNumber.toString().padStart(4, "0")}`;
  }
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
