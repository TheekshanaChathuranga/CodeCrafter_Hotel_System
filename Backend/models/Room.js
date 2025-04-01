import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
<<<<<<< Updated upstream
    required: true, 
=======
    required: true,
>>>>>>> Stashed changes
    unique: true 
  },
  type: { 
    type: String, 
<<<<<<< Updated upstream
    required: true, 
    enum: ['Single', 'Double', 'Triple'] 
  },
  acOption: { 
    type: String, 
    required: true, 
    enum: ['AC', 'Non-AC']  // Removed 'Both' option
  },
  hasAC: { 
    type: Boolean, 
    required: true 
=======
    required: true,
    enum: ["Single", "Double", "Suite", "Family"] 
  },
  acOption: {
    type: String,
    required: true,
    enum: ["AC", "Non-AC"]
  },
  hasAC: {
    type: Boolean,
    required: true
>>>>>>> Stashed changes
  },
  pricePerNight: { 
    type: Number, 
    required: true 
  },
  pricePerDay: { 
    type: Number, 
    required: true 
  },
<<<<<<< Updated upstream
  roomStatus: { 
    type: String, 
    required: true, 
    enum: ['Available', 'Not Available'] 
=======
  roomStatus: {
    type: String,
    required: true,
    enum: ["Available", "Occupied", "Maintenance"],
    default: "Available"
>>>>>>> Stashed changes
  },
  description: { 
    type: String, 
    required: true 
  },
  images: [{
<<<<<<< Updated upstream
    type: String
  }]
}, {
  timestamps: true,  // This automatically adds createdAt and updatedAt fields
  versionKey: false  // This removes the __v field
});

// Add index for frequently queried fields
roomSchema.index({ roomNumber: 1, type: 1, roomStatus: 1 });

const Room = mongoose.model('Room', roomSchema);
=======
    type: String,
    required: true
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Room = mongoose.model("Room", roomSchema);
>>>>>>> Stashed changes
export default Room;