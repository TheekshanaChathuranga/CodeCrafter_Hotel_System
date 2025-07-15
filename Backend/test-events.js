import mongoose from 'mongoose';
import Event from './models/Event.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hotel_management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testEvents() {
  try {
    const events = await Event.find();
    console.log('Total events in database:', events.length);
    
    events.forEach(event => {
      console.log('Event:', {
        eventId: event.eventId,
        name: event.name,
        status: event.status,
        totalAmount: event.totalAmount,
        grandTotal: event.grandTotal,
        serviceCharge: event.serviceCharge,
        extraAmount: event.extraAmount
      });
    });
    
    const confirmedEvents = events.filter(e => e.status === 'confirmed');
    console.log('Confirmed events:', confirmedEvents.length);
    
    const totalRevenue = confirmedEvents.reduce((sum, event) => sum + (event.grandTotal || 0), 0);
    console.log('Total revenue from confirmed events:', totalRevenue);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testEvents();
