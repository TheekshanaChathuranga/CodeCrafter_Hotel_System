// import mongoose from "mongoose";

// const roomSchema = new mongoose.Schema({
//   roomNumber: {
//     type: String,
//     required: [true, "Room number is required"],
//     unique: true,
//     trim: true
//   },
//   type: {
//     type: String,
//     required: [true, "Room type is required"],
//     enum: ['Single', 'Double', 'Triple']
//   },
//   acOption: {
//     type: String,
//     required: [true, "AC option is required"],
//     enum: ['AC', 'Non-AC', 'Flexible'],
//     default: 'AC'
//   },
//   hasAC: {
//     type: Boolean,
//     required: true,
//     default: true
//   },
//   pricePerNight: {
//     type: Number,
//     required: [true, "Price is required"],
//     min: [0, "Price cannot be negative"]
//   },
//   pricePerDay: {
//     type: Number,
//     required: [true, "Price per day is required"],
//     min: [0, "Price cannot be negative"]
//   },
//   roomStatus: {
//     type: String,
//     enum: ['Available', 'Not Available'],
//     required: [true, "Room status is required"],
//     default: 'Available'
//   },
//   // Added unavailable period fields
//   unavailablePeriod: {
//     start: {
//       type: Date,
//       required: function() { return this.roomStatus === 'Not Available'; }
//     },
//     end: {
//       type: Date,
//       required: function() { return this.roomStatus === 'Not Available'; },
//       validate: {
//         validator: function(endDate) {
//           return endDate >= this.unavailablePeriod.start;
//         },
//         message: 'End date must be after or equal to start date'
//       }
//     }
//   },
//   description: {
//     type: String,
//     required: [true, "Description is required"],
//     trim: true
//   },
//   images: {
//     type: [String],
//     validate: {
//       validator: function(v) {
//         return v.length <= 5;
//       },
//       message: 'Maximum 5 images allowed'
//     }
//   },
//   floor: {
//     type: String,
//     default: ""
//   },
//   facilities: {
//     type: [String],
//     default: []
//   }
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Add index for better performance
// roomSchema.index({ roomNumber: 1 }, { unique: true });

// const Room = mongoose.model("Room", roomSchema);
// export default Room;


import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, "Room number is required"],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, "Room type is required"],
    enum: ['Single', 'Double', 'Triple']
  },
  acOption: {
    type: String,
    required: [true, "AC option is required"],
    enum: ['AC', 'Non-AC', 'Flexible'],
    default: 'AC'
  },
  hasAC: {
    type: Boolean,
    required: true,
    default: true
  },
  pricePerNight: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  pricePerDay: {
    type: Number,
    required: [true, "Price per day is required"],
    min: [0, "Price cannot be negative"]
  },
  roomStatus: {
    type: String,
    enum: ['Available', 'Not Available'],
    required: [true, "Room status is required"],
    default: 'Available'
  },
  // Added unavailable period fields
  unavailablePeriod: {
    start: {
      type: Date,
      required: function() { return this.roomStatus === 'Not Available'; }
    },
    end: {
      type: Date,
      required: function() { return this.roomStatus === 'Not Available'; },
      validate: {
        validator: function(endDate) {
          return endDate >= this.unavailablePeriod.start;
        },
        message: 'End date must be after or equal to start date'
      }
    }
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  floor: {
    type: String,
    default: ""
  },
  facilities: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Room = mongoose.model("Room", roomSchema);
export default Room;