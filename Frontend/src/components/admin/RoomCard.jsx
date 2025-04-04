import React from 'react';

const RoomCard = ({ room, onEdit }) => {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onEdit(room)}
    >
      {room.images?.[0] && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={`http://localhost:5000${room.images[0]}`}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {room.images.length} {room.images.length === 1 ? 'image' : 'images'}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${
            room.roomStatus === 'Available' ? 'bg-green-100 text-green-800' :
            room.roomStatus === 'Not Available' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {room.roomStatus}
          </span>
        </div>
        <p className="text-gray-600 mb-1">
          • {room.type} • {room.acOption === 'Both' ? 'AC/Non-AC' : room.acOption}
        </p>
        <p className="text-gray-600 mb-1">
          • LKR {room.pricePerNight.toFixed(2)}/night 
          • LKR {room.pricePerDay.toFixed(2)}/day
        </p>
        {room.description && (
          <p className="text-gray-500 text-sm line-clamp-2">{room.description}</p>
        )}
      </div>
    </div>
  );
};

export default RoomCard;