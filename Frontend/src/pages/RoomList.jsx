import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import axios from "axios";

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  return (
    <div className="container mx-auto mt-5">
      <h2 className="text-xl font-bold mb-3">Rooms</h2>
      <div className="grid grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room._id} className="border p-4 rounded-lg shadow-lg bg-white">
            <img src={room.image} alt={room.name} className="w-full h-40 object-cover rounded" />
            <h3 className="font-bold mt-2">{room.name}</h3>
            <p>Price: ${room.price}</p>
            <p className="text-gray-600">{room.description}</p>
            <Link to={`/rooms/${room._id}`}>
              <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
