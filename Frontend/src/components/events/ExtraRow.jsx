import React from 'react';

const ExtraRow = ({ row, index, unitOptions, handleExtraChange, removeExtraRow }) => {
  return (
    <tr className="border-b">
      <td className="px-4 py-2">{row.no}</td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={row.description}
          onChange={(e) => handleExtraChange(index, 'description', e.target.value)}
          placeholder="Enter description"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={row.unit}
          onChange={(e) => handleExtraChange(index, 'unit', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        >
          <option value="">Select Unit</option>
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={row.quantity}
          onChange={(e) => handleExtraChange(index, 'quantity', e.target.value)}
          min="0"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={row.rate}
          onChange={(e) => handleExtraChange(index, 'rate', e.target.value)}
          min="0"
          step="0.01"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </td>
      <td className="px-4 py-2">{row.amount.toFixed(2)}</td>
      <td className="px-4 py-2">
        <button
          type="button"
          onClick={() => removeExtraRow(index)}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default ExtraRow; 