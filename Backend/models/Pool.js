// import mongoose from "mongoose";

// const poolSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     capacity: {
//         type: Number,
//         required: true,
//         min: 1,
//     },
//     poolStatus: {
//         type: String,
//         enum: ['Available', 'Not Available'],
//         required: true,
//     },
//     openingTime: {
//         type: String,
//         required: true
//       },
//       closingTime: {
//         type: String,
//         required: true
//       },
//       images: [String],
//       createdAt: {
//         type: Date,
//         default: Date.now
//       },
//       pricePerPersonHour: {
//         type: Number,
//         required: true,
//         min: 0
//       },
//       unavailablePeriod: {
//         start: {
//           type: Date,
//           required: function() { return this.poolStatus === 'Not Available'; }
//         },
//         end: {
//           type: Date,
//           required: function() { return this.poolStatus === 'Not Available'; }
//         }
//       }
//     }, { timestamps: true });

//     export default mongoose.model('Pool', poolSchema);

import mongoose from "mongoose";

const poolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    poolStatus: {
      type: String,
      enum: ["Available", "Not Available"],
      required: true,
      default: "Available",
    },
    openingTime: {
      type: String,
      required: true,
    },
    closingTime: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Maximum 5 images allowed",
      },
    },
    pricePerPersonHour: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerPersonDay: {
      type: Number,
      min: 0,
      default: function () {
        // Calculate default day price as 8 times hourly rate
        return this.pricePerPersonHour ? this.pricePerPersonHour * 8 : 0;
      },
    },
    unavailablePeriod: {
      start: {
        type: Date,
        required: function () {
          return this.poolStatus === "Not Available";
        },
      },
      end: {
        type: Date,
        required: function () {
          return this.poolStatus === "Not Available";
        },
        validate: {
          validator: function (endDate) {
            return endDate >= this.unavailablePeriod.start;
          },
          message: "End date must be after or equal to start date",
        },
      },
    },
    facilities: {
      type: [String],
      default: [],
    },
    maxBookingHours: {
      type: Number,
      default: 8,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual for checking current availability
poolSchema.virtual("isCurrentlyAvailable").get(function () {
  if (this.poolStatus === "Not Available") {
    const now = new Date();
    if (this.unavailablePeriod.start && this.unavailablePeriod.end) {
      return (
        now < this.unavailablePeriod.start || now > this.unavailablePeriod.end
      );
    }
    return false;
  }
  return true;
});

// Static method to check pool availability for a given time period
poolSchema.statics.checkAvailability = async function (
  poolId,
  startTime,
  endTime,
  excludeBookingId = null
) {
  const PoolBooking = mongoose.model("PoolBooking");

  const query = {
    poolId: poolId,
    status: { $in: ["pending", "confirmed", "approved"] },
    $or: [
      {
        checkIn: { $lt: endTime },
        checkOut: { $gt: startTime },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await PoolBooking.find(query);
  return conflictingBookings.length === 0;
};

// Add index for better performance
poolSchema.index({ name: 1 });
poolSchema.index({ poolStatus: 1 });

const Pool = mongoose.model("Pool", poolSchema);
export default Pool;
