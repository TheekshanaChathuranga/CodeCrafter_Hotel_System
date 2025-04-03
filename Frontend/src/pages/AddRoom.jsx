import React from "react";
import { useState } from "react";
import axios from "axios";

export default function AddRoom() {
  const [formData, setFormData] = useState({ name: "", price: "", image: "", description: "", checkin: "", checkout: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Ensure checkout time cannot be earlier than check-in time
    if (e.target.name === "checkin" && formData.checkout) {
      const checkInDate = new Date(e.target.value);
      const checkOutDate = new Date(formData.checkout);
      if (checkOutDate <= checkInDate) {
        setFormData({ ...formData, checkout: "" }); // Reset invalid checkout time
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const checkinDate = new Date(formData.checkin);
    const checkoutDate = new Date(formData.checkout);

    if (checkinDate < now) {
      alert("❌ Check-in time cannot be in the past.");
      return;
    }

    if (checkoutDate <= checkinDate) {
      alert("❌ Checkout time must be after check-in time.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/rooms", formData);
      alert("✅ Room added successfully!");
      setFormData({ name: "", price: "", image: "", description: "", checkin: "", checkout: "" });
    } catch (error) {
      console.error("Error adding room:", error);
      alert("❌ Failed to add room");
    }
  };

  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input name="name" placeholder="Room Name" onChange={handleChange} value={formData.name} required />
      <input name="price" placeholder="Price" type="number" onChange={handleChange} value={formData.price} required />
      <input name="image" placeholder="Image URL" onChange={handleChange} value={formData.image} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} value={formData.description} required />
      <input
        name="checkin"
        type="datetime-local"
        onChange={handleChange}
        value={formData.checkin}
        min={`${today}T00:00`} // Restrict to today or later
        required
      />
      <input
        name="checkout"
        type="datetime-local"
        onChange={handleChange}
        value={formData.checkout}
        min={formData.checkin || `${today}T00:00`} // Ensure checkout is not earlier than check-in
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Room</button>
    </form>
  );
}
