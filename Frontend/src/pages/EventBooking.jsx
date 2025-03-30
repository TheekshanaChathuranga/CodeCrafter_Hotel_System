import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";  

const EventBooking = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone1: "",
    phone2: "",
    eventType: "",
    date: "",
    checkIn: "",
    checkOut: "",
    email: "",
  });
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error.message, error.response?.data);
      alert(`Failed to fetch events: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting:", formData); // Debug log
      if (editingEvent) {
        const response = await axios.put(
          `${API_BASE_URL}/api/events/${editingEvent._id}`,
          formData
        );
        setEvents(events.map((ev) => (ev._id === editingEvent._id ? response.data : ev)));
        setEditingEvent(null);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/events`, formData);
        setEvents([...events, response.data]);
      }
      setFormData({
        name: "",
        phone1: "",
        phone2: "",
        eventType: "",
        date: "",
        checkIn: "",
        checkOut: "",
        email: "",
      });
      alert(editingEvent ? "Event updated!" : "Booking submitted!");
    } catch (error) {
      console.error("Error submitting booking:", error.message, error.response?.data);
      alert(`Something went wrong! ${error.message}${error.response?.data?.message ? `: ${error.response.data.message}` : ""}`);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      phone1: event.phone1,
      phone2: event.phone2 || "",
      eventType: event.eventType,
      date: event.date.slice(0, 10),
      checkIn: event.checkIn.slice(0, 10),
      checkOut: event.checkOut.slice(0, 10),
      email: event.email || "",
    });
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editingEvent ? "Edit Event" : "Book Your Event"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Phone Number 1:</label>
          <input
            type="tel"
            name="phone1"
            value={formData.phone1}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Phone Number 2 (Additional):</label>
          <input
            type="tel"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Event Type:</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value="">Select Event Type</option>
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="seminar">Seminar</option>
            <option value="party">Party</option>
          </select>
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Check-In:</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Check-Out:</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Email (Optional):</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingEvent ? "Update Booking" : "Submit Booking"}
        </button>
        {editingEvent && (
          <button
            type="button"
            onClick={() => setEditingEvent(null)}
            className="bg-gray-500 text-white p-2 rounded ml-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h2 className="text-xl font-bold mt-8">Your Events</h2>
      <div className="mt-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="border p-4 mb-2 flex justify-between">
              <div>
                <p><strong>Name:</strong> {event.name}</p>
                <p><strong>Event Type:</strong> {event.eventType}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Check-In:</strong> {new Date(event.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-Out:</strong> {new Date(event.checkOut).toLocaleDateString()}</p>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(event)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No events booked yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventBooking;