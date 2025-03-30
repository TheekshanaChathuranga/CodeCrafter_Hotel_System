import { useState } from "react";
import axios from "axios";

export default function AddRoom() {
  const [formData, setFormData] = useState({ name: "", price: "", image: "", description: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/rooms", formData);
      alert("✅ Room added successfully!");
      setFormData({ name: "", price: "", image: "", description: "" });
    } catch (error) {
      console.error("Error adding room:", error);
      alert("❌ Failed to add room");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input name="name" placeholder="Room Name" onChange={handleChange} value={formData.name} required />
      <input name="price" placeholder="Price" type="number" onChange={handleChange} value={formData.price} required />
      <input name="image" placeholder="Image URL" onChange={handleChange} value={formData.image} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} value={formData.description} required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Room</button>
    </form>
  );
}
