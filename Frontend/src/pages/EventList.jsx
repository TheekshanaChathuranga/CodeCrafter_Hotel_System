import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";
import eventService from '../services/eventService';

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

      {/* Event Details Modal */}
      {showDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Event Details - {selectedEvent.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedEvent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Event Type</p>
                        <p className="font-medium">{selectedEvent.eventType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hall</p>
                        <p className="font-medium">{selectedEvent.hall}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">No of Guests</p>
                        <p className="font-medium">{selectedEvent.noOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-In</p>
                        <p className="font-medium">{formatDate(selectedEvent.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-Out</p>
                        <p className="font-medium">{formatDate(selectedEvent.checkOut)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Primary Phone</p>
                        <p className="font-medium">{selectedEvent.phone1}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Secondary Phone</p>
                        <p className="font-medium">{selectedEvent.phone2 || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedEvent.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-blue-600">Notes</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Food Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">Unit</th>
                            <th className="px-4 py-2 text-right">Quantity</th>
                            <th className="px-4 py-2 text-right">Rate</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEvent.tableData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{item.description}</td>
                              <td className="px-4 py-2">{item.unit}</td>
                              <td className="px-4 py-2 text-right">{item.quantity}</td>
                              <td className="px-4 py-2 text-right">Rs. {item.rate.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right">Rs. {item.amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedEvent.extraFields && selectedEvent.extraFields.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-blue-600">Extra Items</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left">Description</th>
                              <th className="px-4 py-2 text-left">Unit</th>
                              <th className="px-4 py-2 text-right">Quantity</th>
                              <th className="px-4 py-2 text-right">Rate</th>
                              <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEvent.extraFields.map((item, index) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2">{item.description}</td>
                                <td className="px-4 py-2">{item.unit}</td>
                                <td className="px-4 py-2 text-right">{item.quantity}</td>
                                <td className="px-4 py-2 text-right">Rs. {item.rate.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">Rs. {item.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">Rs. {selectedEvent.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Charge (10%):</span>
                        <span className="font-medium">Rs. {selectedEvent.serviceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extra Amount:</span>
                        <span className="font-medium">Rs. {selectedEvent.extraAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                        <span className="text-lg font-semibold text-blue-600">Rs. {selectedEvent.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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