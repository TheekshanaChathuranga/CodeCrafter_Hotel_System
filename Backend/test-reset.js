import mongoose from 'mongoose';
import crypto from 'crypto';
import User from './models/User.js';

const MONGODB_URI = "mongodb+srv://theekshanacnb:12345@cluster1.bktryu2.mongodb.net/thelake?retryWrites=true&w=majority&appName=Cluster1";

async function testResetToken() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find any user to test with
    const users = await User.find({}, 'email username resetPasswordToken resetPasswordExpires').limit(3);
    console.log('Found users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  Email:', user.email);
      console.log('  Username:', user.username);
      console.log('  Current reset token:', user.resetPasswordToken || 'None');
      console.log('  Token expires:', user.resetPasswordExpires || 'None');
      console.log('  Token expired:', user.resetPasswordExpires ? user.resetPasswordExpires <= new Date() : 'N/A');
      console.log('---');
    });
    
    // Generate a test token
    const testToken = crypto.randomBytes(32).toString('hex');
    console.log('Sample token format:', testToken);
    console.log('Sample token length:', testToken.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testResetToken();
