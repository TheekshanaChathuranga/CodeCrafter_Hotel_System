import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      const fetchedEvents = response.data || [];
      const sanitizedEvents = fetchedEvents.map((event) => ({
        ...event,
        tableData: event.tableData || [],
        extraFields: event.extraFields || [],
      }));
      setEvents(sanitizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error.message, error.response?.data);
      setEvents([]);
      alert(`Failed to fetch events: ${error.message}`);
    }
  };

  const handleEdit = (event) => {
    navigate("/event-booking", { state: { event } });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`);
      setEvents(events.filter((ev) => ev._id !== id));
      alert("Event deleted!");
    } catch (error) {
      console.error("Error deleting event:", error.message, error.response?.data);
      alert(`Something went wrong! ${error.message}${error.response?.data?.message ? `: ${error.response.data.message}` : ""}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">Your Events</h2>
        <div className="mb-6">
          <button
            onClick={() => navigate("/event-booking")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Back to Event Booking
          </button>
        </div>
        <div className="space-y-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700"><strong>Name:</strong> {event.name}</p>
                    <p className="text-sm font-medium text-gray-700"><strong>No of Guests:</strong> {event.noOfGuests}</p>
                    <p className="text-sm font-medium text-gray-700"><strong>Event Type:</strong> {event.eventType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-gray-700"><strong>Check-In:</strong> {new Date(event.checkIn).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-gray-700"><strong>Check-Out:</strong> {new Date(event.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
                {event.notes && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-blue-600">Notes:</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.notes}</p>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Items</h3>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {event.tableData.map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.no}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.rate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount?.toFixed(2) || "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <p className="text-sm font-medium text-blue-800"><strong>Total Amount:</strong> {event.totalAmount?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm font-medium text-blue-800"><strong>Service Charge:</strong> {event.serviceCharge?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm font-medium text-blue-800"><strong>Extra Amount:</strong> {event.extraAmount?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm font-medium text-blue-800"><strong>Grand Total:</strong> {event.grandTotal?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm font-medium text-blue-800"><strong>Grand Total Rate PP:</strong> {(event.noOfGuests > 0 ? event.grandTotal / event.noOfGuests : 0).toFixed(2)}</p>
                </div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Extra Charges</h3>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {event.extraFields.map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.no}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.rate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount?.toFixed(2) || "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <p className="text-sm font-medium text-blue-800"><strong>Final Total:</strong> {event.finalTotal?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm font-medium text-blue-800"><strong>Final Total Rate PP:</strong> {(event.noOfGuests > 0 ? event.finalTotal / event.noOfGuests : 0).toFixed(2)}</p>
                </div>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={() => handleEdit(event)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No events booked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;