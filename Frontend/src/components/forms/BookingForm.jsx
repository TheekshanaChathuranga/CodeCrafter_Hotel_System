import React from 'react';

const BookingForm = ({ formData, errors, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.name ? "border-red-500" : ""}`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number 1:</label>
        <input
          type="tel"
          name="phone1"
          value={formData.phone1}
          onChange={handleChange}
          maxLength="10"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.phone1 ? "border-red-500" : ""}`}
        />
        {errors.phone1 && <p className="text-red-500 text-xs mt-1">{errors.phone1}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number 2 (Optional):</label>
        <input
          type="tel"
          name="phone2"
          value={formData.phone2}
          onChange={handleChange}
          maxLength="10"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.phone2 ? "border-red-500" : ""}`}
        />
        {errors.phone2 && <p className="text-red-500 text-xs mt-1">{errors.phone2}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">No of Guests:</label>
        <input
          type="number"
          name="noOfGuests"
          value={formData.noOfGuests}
          onChange={handleChange}
          min="1"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.noOfGuests ? "border-red-500" : ""}`}
        />
        {errors.noOfGuests && <p className="text-red-500 text-xs mt-1">{errors.noOfGuests}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Event Type:</label>
        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.eventType ? "border-red-500" : ""}`}
        >
          <option value="">Select Event Type</option>
          <option value="Wedding">Wedding</option>
          <option value="Birthday">Birthday</option>
          <option value="Corporate">Corporate</option>
          <option value="Other">Other</option>
        </select>
        {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Hall:</label>
        <select
          name="hall"
          value={formData.hall}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.hall ? "border-red-500" : ""}`}
        >
          <option value="">Select Hall</option>
          <option value="Hall No 1">Hall No 1</option>
          <option value="Hall No 2">Hall No 2</option>
        </select>
        {errors.hall && <p className="text-red-500 text-xs mt-1">{errors.hall}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Check-In Date:</label>
        <input
          type="date"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.checkIn ? "border-red-500" : ""}`}
        />
        {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Check-Out Date:</label>
        <input
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.checkOut ? "border-red-500" : ""}`}
        />
        {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email (Optional):</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Upload Excel Sheet:</label>
        <input
          type="file"
          name="excelFile"
          accept=".xlsx,.xls"
          onChange={handleChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Notes:</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
    </div>
  );
};

export default BookingForm; 