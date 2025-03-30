import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function RoomDetails() {
  const { id } = useParams(); // Get room ID from URL
  const [room, setRoom] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/rooms/${id}`)
      .then((res) => setRoom(res.data))
      .catch((err) => console.error("Error fetching room details:", err));
  }, [id]);

  if (!room) return <p className="text-center mt-10 text-lg">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <img src={room.image} alt={room.name} className="w-full h-60 object-cover rounded" />
      <h2 className="text-2xl font-bold mt-4">{room.name}</h2>
      <p className="text-gray-700 mt-2">{room.description}</p>
      <p className="text-lg font-semibold mt-2">Price: ${room.price}</p>
      <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
        Book Now
      </button>
    </div>
  );
}
