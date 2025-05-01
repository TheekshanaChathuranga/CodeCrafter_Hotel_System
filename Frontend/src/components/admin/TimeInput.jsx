import React from 'react';
import { FiClock } from 'react-icons/fi';

const TimeInput = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <div className="relative">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <FiClock className="absolute right-3 top-3 text-gray-400" />
      </div>
    </div>
  );
};

export default TimeInput;