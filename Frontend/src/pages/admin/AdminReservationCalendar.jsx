import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { FiCalendar, FiClock, FiUser, FiX, FiEdit, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import { useSnackbar } from 'notistack';
import ErrorDisplay from '../../components/ErrorDisplay';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EventDetailsModal from "../../components/events/EventDetailsModal";


const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS } // Make sure this matches your import
  });

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const navigate = useNavigate();


  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      // Fetch room bookings (online bookings)
      const roomRes = await axios.get('http://localhost:5000/api/admin/bookings/pending'); // adjust endpoint if needed
      const roomEvents = roomRes.data.map(booking => ({
        id: booking._id,
        title: `${booking.fullName} - Room ${booking.roomNumber} (Room)`,
        start: new Date(booking.checkIn),
        end: new Date(booking.checkOut),
        allDay: false,
        reservationData: { ...booking, _category: 'room' },
        type: 'room'
      }));

      // Fetch event bookings (same source used by EventList.jsx)
      const eventRes = await axios.get('http://localhost:5000/api/events');
      const eventEvents = eventRes.data.map(event => ({
        id: event._id,
        title: `${event.eventId ? event.eventId + ' - ' : ''}${event.name} - ${event.eventType} (Event)`,
        start: new Date(event.checkIn),
        end: new Date(event.checkOut),
        allDay: false,
        reservationData: { ...event, _category: 'event' },
        type: 'event'
      }));

      setEvents([...roomEvents, ...eventEvents]);
    } catch (error) {
      handleError(error, 'Failed to fetch reservations or event bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedReservation(event.reservationData);
    setShowModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/reservations/update/${selectedReservation._id}`,
        { status: newStatus }
      );
      enqueueSnackbar(`Reservation ${newStatus} successfully`, { variant: 'success' });
      fetchAllEvents(); // Re-fetch all events to update status
      setShowModal(false);
    } catch (error) {
      handleError(error, 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/reservations/delete/${selectedReservation._id}`);
      enqueueSnackbar('Reservation deleted successfully', { variant: 'success' });
      fetchAllEvents(); // Re-fetch all events to remove the deleted one
      setShowModal(false);
    } catch (error) {
      handleError(error, 'Failed to delete reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (eventData) => {
    // Navigate to EventBooking page with event data for editing
    navigate('/admin/event-booking', { state: { event: eventData } });
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await eventService.deleteEvent(eventId);
      enqueueSnackbar('Event deleted successfully', { variant: 'success' });
      fetchAllEvents();
      setShowModal(false);
    } catch (error) {
      handleError(error, 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error, defaultMessage) => {
    const message = error.response?.data?.error || defaultMessage;
    setError(message);
    enqueueSnackbar(message, { variant: 'error' });
    console.error(message, error);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';

    if (event.type === 'event') {
      backgroundColor = '#3b82f6'; // system blue
    } else {
      // room booking status colors
      if (event.reservationData.status === 'confirmed') {
        backgroundColor = '#2ecc71';
      } else if (event.reservationData.status === 'pending') {
        backgroundColor = '#f39c12';
      } else if (event.reservationData.status === 'cancelled' || event.reservationData.status === 'rejected') {
        backgroundColor = '#e74c3c';
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Reservation Management</h1>
        <button
          className="bg-[#16A085] hover:bg-[#138D75] text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowModal(true)}
        >
          <FiPlus className="mr-2" /> Add Reservation
        </button>
      </div>

      <ErrorDisplay error={error} />

      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="search-date" className="text-sm font-medium text-gray-700">Search by Date:</label>
        <DatePicker
            selected={currentDate}
            onChange={(date) => setCurrentDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded px-3 py-1 text-sm"
        />
        </div>

      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div style={{ height: 700 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    defaultView="month"
                    views={['month', 'day']}
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    view={currentView}
                    onView={(view) => setCurrentView(view)}
                />
            </div>
        </div>
      )}

      {selectedReservation && showModal && (
        selectedReservation._category === 'event' ? (
          <EventDetailsModal
            event={selectedReservation}
            onClose={() => setShowModal(false)}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Existing reservation modal content */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Reservation Details</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-lg flex items-center mb-3">
                      <FiUser className="mr-2" /> Guest Information
                    </h5>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedReservation.user?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedReservation.user?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedReservation.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-lg flex items-center mb-3">
                      <FiCalendar className="mr-2" /> Reservation Details
                    </h5>
                    <div className="space-y-2">
                      <p><strong>Room:</strong> {selectedReservation.room?.roomNumber || 'N/A'} ({selectedReservation.room?.type || 'N/A'})</p>
                      <p><strong>Dates:</strong> {format(new Date(selectedReservation.checkIn || selectedReservation.checkInDate), 'MMM d, yyyy')} - {format(new Date(selectedReservation.checkOut || selectedReservation.checkOutDate), 'MMM d, yyyy')}</p>
                      <p><strong>Status:</strong>
                          {selectedReservation.status ? (
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              selectedReservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              selectedReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {selectedReservation.status}
                            </span>
                          ) : (
                            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">event</span>
                          )}
                        </p>
                      <p><strong>Total:</strong> ${selectedReservation.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="font-medium text-lg mb-2">Special Requests</h5>
                  <p className="bg-gray-50 p-3 rounded">{selectedReservation.specialRequests || 'No special requests'}</p>
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-end space-x-3">
                {selectedReservation.status !== 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                )}
                
                {selectedReservation.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete()}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Delete
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ReservationManagement;