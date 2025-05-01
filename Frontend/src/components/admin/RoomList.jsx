import React from 'react';
import RoomCard from './RoomCard';

const RoomList = ({ rooms, loading, onEdit }) => {
  if (rooms.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No rooms found. Add your first room to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default RoomList;