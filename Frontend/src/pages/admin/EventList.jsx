import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";
import eventService from '../../services/eventService';
import EventDetailsModal from "../../components/events/EventDetailsModal";

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "", showConfirm: false });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      setPopup({
        message: `Error fetching events: ${error.message}`,
        type: "error",
        showConfirm: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    navigate("/event-booking", { state: { event } });
  };

  const handleDelete = (eventId) => {
    setPopup({
      message: "Are you sure you want to delete this event?",
      type: "confirm",
      showConfirm: true,
      onConfirm: async () => {
        try {
          await eventService.deleteEvent(eventId);
          setEvents(events.filter((event) => event._id !== eventId));
          setPopup({
            message: "Event deleted successfully!",
            type: "success",
            showConfirm: false,
          });
        } catch (error) {
          setPopup({
            message: `Error deleting event: ${error.message}`,
            type: "error",
            showConfirm: false,
          });
        }
      },
    });
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Your Events</h1>
          <button
            onClick={() => navigate("/event-booking")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No events found. Create your first event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.name}</h2>
                  <div className="space-y-2 text-gray-600">
                    <p><span className="font-medium">Event Type:</span> {event.eventType}</p>
                    <p><span className="font-medium">Hall:</span> {event.hall}</p>
                    <p><span className="font-medium">Guests:</span> {event.noOfGuests}</p>
                    <p><span className="font-medium">Check-In:</span> {formatDate(event.checkIn)}</p>
                    <p><span className="font-medium">Check-Out:</span> {formatDate(event.checkOut)}</p>
                    <p><span className="font-medium">Total Amount:</span> Rs. {event.grandTotal.toFixed(2)}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowDetails(false)}
        />
      )}

      {popup.message && (
        <Popup
          message={popup.message}
          type={popup.type}
          showConfirm={popup.showConfirm}
          onConfirm={popup.onConfirm}
          onClose={() => setPopup({ message: "", type: "", showConfirm: false })}
        />
      )}
    </div>
  );
};

export default EventList;