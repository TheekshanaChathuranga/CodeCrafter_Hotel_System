import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const BookingConfirmation = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Fetch pending bookings
    const fetchBookings = async () => {
      const res = await fetch('/api/admin/bookings/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPendingBookings(data);
    };

    fetchBookings();

    // Socket.io setup
    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('new-booking', (booking) => {
      setPendingBookings(prev => [booking, ...prev]);
      setNotification(`New booking from ${booking.fullName}`);
      setTimeout(() => setNotification(null), 5000);
    });

    socket.on('booking-updated', (data) => {
      setPendingBookings(prev => prev.filter(b => b._id !== data.bookingId));
    });

    return () => socket.disconnect();
  }, []);

  const handleApprove = async (id) => {
    await fetch(`/api/admin/bookings/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  };

  const handleReject = async (id) => {
    await fetch(`/api/admin/bookings/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  };

  return (
    <div className="admin-panel">
      {notification && <div className="notification">{notification}</div>}
      
      <h2>Pending Bookings ({pendingBookings.length})</h2>
      
      <div className="bookings-list">
        {pendingBookings.map(booking => (
          <div key={booking._id} className="booking-card">
            <h3>{booking.roomNumber} - {booking.roomType}</h3>
            <p>Guest: {booking.fullName}</p>
            <p>Dates: {new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}</p>
            
            <div className="booking-actions">
              <button onClick={() => handleApprove(booking._id)} className="approve-btn">
                Approve
              </button>
              <button onClick={() => handleReject(booking._id)} className="reject-btn">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};