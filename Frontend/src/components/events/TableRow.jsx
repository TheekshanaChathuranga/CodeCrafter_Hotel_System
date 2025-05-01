import React from 'react';

const TableRow = ({ row, index, foodOptions, unitOptions, handleTableChange, removeRow }) => {
  return (
    <tr className="border-b">
      <td className="px-4 py-2">{row.no}</td>
      <td className="px-4 py-2">
        <select
          value={row.description}
          onChange={(e) => handleTableChange(index, 'description', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        >
          <option value="">Select Food Item</option>
          {foodOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <select
          value={row.unit}
          onChange={(e) => handleTableChange(index, 'unit', e.target.value)}
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
          onChange={(e) => handleTableChange(index, 'quantity', e.target.value)}
          min="0"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={row.rate}
          onChange={(e) => handleTableChange(index, 'rate', e.target.value)}
          min="0"
          step="0.01"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </td>
      <td className="px-4 py-2">{row.amount.toFixed(2)}</td>
      <td className="px-4 py-2">
        <button
          type="button"
          onClick={() => removeRow(index)}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default TableRow; 