import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  type: { 
    type: String, 
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
  },
  pricePerNight: { 
    type: Number, 
    required: true 
  },
  pricePerDay: { 
    type: Number, 
    required: true 
  },
  roomStatus: { 
    type: String, 
    required: true, 
    enum: ['Available', 'Not Available'] 
  },
  description: { 
    type: String, 
    required: true 
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true,  // This automatically adds createdAt and updatedAt fields
  versionKey: false  // This removes the __v field
});

// Add index for frequently queried fields
roomSchema.index({ roomNumber: 1, type: 1, roomStatus: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;