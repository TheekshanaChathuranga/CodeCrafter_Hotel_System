import React from 'react';
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { Input } from "../ui/input";

// Helper to get today's date in yyyy-mm-dd format
const getToday = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const BookingForm = ({ formData, errors, handleChange }) => {
  // Industry best practice: Always restrict date pickers to valid ranges on the client, and re-validate on the server.
  // This prevents accidental or malicious selection of past dates.
  const today = getToday();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name" className="mb-1">Name:</Label>
        <Input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="phone1" className="mb-1">Phone Number 1:</Label>
        <Input
          id="phone1"
          type="tel"
          name="phone1"
          value={formData.phone1}
          onChange={handleChange}
          maxLength={10}
          aria-invalid={!!errors.phone1}
        />
        {errors.phone1 && <p className="text-red-500 text-xs mt-1">{errors.phone1}</p>}
      </div>
      <div>
        <Label htmlFor="phone2" className="mb-1">Phone Number 2 (Optional):</Label>
        <Input
          id="phone2"
          type="tel"
          name="phone2"
          value={formData.phone2}
          onChange={handleChange}
          maxLength={10}
          aria-invalid={!!errors.phone2}
        />
        {errors.phone2 && <p className="text-red-500 text-xs mt-1">{errors.phone2}</p>}
      </div>
      <div>
        <Label htmlFor="noOfGuests" className="mb-1">No of Guests:</Label>
        <Input
          id="noOfGuests"
          type="number"
          name="noOfGuests"
          value={formData.noOfGuests}
          onChange={handleChange}
          min={1}
          aria-invalid={!!errors.noOfGuests}
        />
        {errors.noOfGuests && <p className="text-red-500 text-xs mt-1">{errors.noOfGuests}</p>}
      </div>
      <div>
        <Label htmlFor="eventType" className="mb-1">Event Type:</Label>
        <Select
          value={formData.eventType || ""}
          onValueChange={value => handleChange({ target: { name: "eventType", value } })}
        >
          <SelectTrigger className={`mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.eventType ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Select Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Wedding">Wedding</SelectItem>
            <SelectItem value="Birthday">Birthday</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
      </div>
      <div>
        <Label className="mb-1">Select Hall:</Label>
        <Select
          value={formData.hall || ""}
          onValueChange={value => handleChange({ target: { name: "hall", value } })}
        >
          <SelectTrigger className={`mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.hall ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Select Hall" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hall No 1">Hall No 1</SelectItem>
            <SelectItem value="Hall No 2">Hall No 2</SelectItem>
          </SelectContent>
        </Select>
        {errors.hall && <p className="text-red-500 text-xs mt-1">{errors.hall}</p>}
      </div>
      <div>
        <Label htmlFor="checkIn" className="mb-1">Check-In Date:</Label>
        <Input
          id="checkIn"
          type="date"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          aria-invalid={!!errors.checkIn}
          min={today}
        />
        {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
      </div>
      <div>
        <Label htmlFor="checkInTime" className="mb-1">Check-In Time:</Label>
        <Input
          id="checkInTime"
          type="time"
          name="checkInTime"
          value={formData.checkInTime}
          onChange={handleChange}
          aria-invalid={!!errors.checkInTime}
        />
        {errors.checkInTime && <p className="text-red-500 text-xs mt-1">{errors.checkInTime}</p>}
      </div>
      <div>
        <Label htmlFor="checkOut" className="mb-1">Check-Out Date:</Label>
        <Input
          id="checkOut"
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          aria-invalid={!!errors.checkOut}
          min={formData.checkIn || today}
        />
        {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
      </div>
      <div>
        <Label htmlFor="checkOutTime" className="mb-1">Check-Out Time:</Label>
        <Input
          id="checkOutTime"
          type="time"
          name="checkOutTime"
          value={formData.checkOutTime}
          onChange={handleChange}
          aria-invalid={!!errors.checkOutTime}
        />
        {errors.checkOutTime && <p className="text-red-500 text-xs mt-1">{errors.checkOutTime}</p>}
      </div>
      <div>
        <Label htmlFor="email" className="mb-1">Email (Optional):</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="excelFile" className="mb-1">Upload Excel Sheet:</Label>
        <Input
          id="excelFile"
          type="file"
          name="excelFile"
          accept=".xlsx,.xls"
          onChange={handleChange}
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="notes" className="mb-1">Notes:</Label>
        {/* Replace with shadcn Textarea if available */}
        <textarea
          id="notes"
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