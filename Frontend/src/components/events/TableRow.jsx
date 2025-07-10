import React from 'react';

const TableRow = ({ row, index, foodOptions, handleTableChange, removeRow }) => {
  // foodOptions is now an array of objects: { name, unitType, unitPrice }
  const selectedFood = foodOptions.find(item => item.name === row.description);

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
            <option key={option._id || option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={selectedFood ? selectedFood.unitType : row.unit}
          disabled
          className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
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
          value={selectedFood ? selectedFood.unitPrice : row.rate}
          disabled
          className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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