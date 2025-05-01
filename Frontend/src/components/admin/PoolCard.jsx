import React from 'react';
import { FiClock } from 'react-icons/fi';

const PoolCard = ({ pool, onEdit }) => {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onEdit(pool)}
    >
      {pool.images?.[0] && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={`http://localhost:5000${pool.images[0]}`}
            alt={`${pool.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {pool.images.length} {pool.images.length === 1 ? 'image' : 'images'}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{pool.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${
            pool.poolStatus === 'Available' ? 'bg-green-100 text-green-800' :
            pool.poolStatus === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {pool.poolStatus}
          </span>
        </div>
        <p className="text-gray-600 mb-1">
          • Capacity: {pool.capacity} people
        </p>
        <p className="text-gray-600 mb-1 flex items-center">
          <FiClock className="mr-1" /> {pool.openingTime} - {pool.closingTime}
        </p>
        {pool.description && (
          <p className="text-gray-500 text-sm line-clamp-2">{pool.description}</p>
        )}
      </div>
    </div>
  );
};

export default PoolCard;