export default function RoomCard({ room }) {
    return (
      <div className="border rounded-lg p-4 flex space-x-4 shadow-md">
        <img src={room.image} alt={room.name} className="w-40 h-32 rounded-md object-cover" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-blue-600">{room.name}</h2>
          <p className="text-sm text-gray-500">{room.description}</p>
          <p className="text-green-600 font-semibold">{room.price} LKR / night</p>
          <button className="bg-blue-500 text-white px-4 py-1 rounded mt-2">See availability</button>
        </div>
      </div>
    );
  }
// Removed incorrect function signature declaration for Navbar