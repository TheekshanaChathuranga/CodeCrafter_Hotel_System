
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   role: { type: String, enum: ['admin', 'reception', 'user'], default: 'user' }
// });

// const User = mongoose.model("User", userSchema);

// export default User;

// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['admin', 'receptionist', 'reception', 'user'], 
    default: 'user' 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const User = mongoose.model("User", userSchema);

export default User;