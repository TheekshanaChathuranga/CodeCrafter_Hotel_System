# Enhanced Reception Dashboard Installation Guide

## Overview
The enhanced Reception Home page now includes:
- Real-time data integration with backend APIs
- Interactive calendar with booking visualization
- Responsive design for mobile devices
- Quick action buttons for common tasks
- Real-time booking status management

## New Features Added

### 1. Real Data Integration
- **Dashboard Stats**: Live data from database showing today's check-ins/check-outs, room availability
- **Booking Management**: Real bookings from the database with status updates
- **Room Availability**: Dynamic room availability by type

### 2. Interactive Calendar
- **Visual Booking Calendar**: Shows bookings with color-coded indicators
- **Date Selection**: Click any date to view bookings for that day
- **Booking Indicators**: 
  - Green dots: Check-ins
  - Red dots: Check-outs
  - Blue dots: Occupied rooms

### 3. Enhanced User Interface
- **Responsive Design**: Mobile-friendly layout with card views for small screens
- **Quick Actions**: One-click check-in/check-out functionality
- **Loading States**: Loading spinners and error handling
- **Real-time Updates**: Refresh button to get latest data

### 4. Mobile Responsiveness
- **Mobile Table View**: Card-based layout for mobile devices
- **Touch-Friendly**: Large buttons and touch targets
- **Responsive Grid**: Adapts to different screen sizes

## Files Added/Modified

### Backend Files
1. **`Backend/routes/dashboard.js`** (New)
   - Dashboard statistics API
   - Date-specific booking queries
   - Revenue calculations

2. **`Backend/server.js`** (Modified)
   - Added dashboard route

### Frontend Files
1. **`Frontend/src/api/reception.js`** (New)
   - API functions for reception operations
   - Dashboard statistics
   - Booking management

2. **`Frontend/src/components/SimpleCalendar.jsx`** (New)
   - Interactive calendar component
   - Booking visualization
   - Date selection functionality

3. **`Frontend/src/pages/Receptionist/ReceptionHome.jsx`** (Enhanced)
   - Real data integration
   - Interactive calendar
   - Mobile-responsive design
   - Quick action buttons

## Installation Steps

### 1. Backend Setup
```bash
# Navigate to backend directory
cd Backend

# Install dependencies (if not already installed)
npm install

# Start the backend server
npm start
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies (if not already installed)
npm install

# Start the frontend development server
npm run dev
```

### 3. Database Requirements
Ensure your MongoDB database is running and contains:
- `ReceptionBooking` collection with booking data
- Proper booking status fields: 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'

## API Endpoints Added

### Dashboard Statistics
- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics
- `GET /api/dashboard/bookings/:date` - Get bookings for a specific date

### Reception Bookings (Existing, Enhanced)
- `GET /api/receptionBookings` - Get all bookings
- `PATCH /api/receptionBookings/:id` - Update booking status

## Usage Guide

### 1. Dashboard Overview
- View real-time statistics at the top of the page
- See today's check-ins, check-outs, available rooms, and occupied rooms

### 2. Calendar Navigation
- Use the calendar to navigate between dates
- Click on any date to view bookings for that day
- Look for colored dots indicating booking activity

### 3. Quick Actions
- **New Booking**: Navigate to booking creation page
- **Quick Check-in**: Check in the first confirmed booking
- **Quick Check-out**: Check out the first checked-in guest
- **View All Bookings**: Navigate to complete bookings list

### 4. Booking Management
- View today's bookings in both table (desktop) and card (mobile) formats
- Click "Check In" or "Check Out" buttons to update booking status
- Use the refresh button to get the latest data

### 5. Mobile Experience
- On mobile devices, the layout automatically switches to card view
- Calendar and booking details are stacked vertically
- Touch-friendly buttons and larger text

## Troubleshooting

### Common Issues
1. **Data not loading**: Ensure backend server is running on port 5000
2. **CORS errors**: Check CORS configuration in `server.js`
3. **Database connection**: Verify MongoDB URI in environment variables
4. **Calendar not updating**: Click refresh or reload the page

### Error Handling
- Loading states are shown while data is being fetched
- Error messages appear if API calls fail
- Fallback data is used when possible

## Future Enhancements
- Push notifications for new bookings
- Advanced filtering and search
- Export functionality for reports
- Integration with payment systems
- Guest communication features

## Performance Optimization
- Data is cached where possible
- Efficient API calls with proper error handling
- Responsive images and optimized assets
- Lazy loading for large datasets
