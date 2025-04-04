
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'reception', 'user'], default: 'user' }
});

const User = mongoose.model("User", userSchema);

export default User;
