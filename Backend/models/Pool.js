import mongoose from "mongoose";

const poolSchema = new mongoose.Schema({
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
        enum: ['Available', 'Not Available'],
        required: true,
    },
    openingTime: {
        type: String,
        required: true
      },
      closingTime: {
        type: String,
        required: true
      },
      images: [String],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }, { timestamps: true });
    
    export default mongoose.model('Pool', poolSchema);