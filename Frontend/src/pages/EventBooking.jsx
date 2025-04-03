import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Popup from "./Popup";

const API_BASE_URL = "http://localhost:5000";

const EventBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone1: "",
    phone2: "",
    noOfGuests: 0,
    eventType: "",
    checkIn: "",
    checkOut: "",
    email: "",
    notes: "",
  });
  const [tableData, setTableData] = useState([
    { no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  const [extraFields, setExtraFields] = useState([
    { no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [popup, setPopup] = useState({ message: "", type: "", showConfirm: false });
  const [errors, setErrors] = useState({});

  const foodOptions = [
    "Welcome Drink", "Kiribath", "Chicken fried rice", "Egg noodle", "White rice",
    "Chicken Curry", "Dhall Curry", "Devilled Fish", "Fried Lake fish", "Egg slices",
    "Desert Ice cream", "Cut Fruit"
  ];

  const unitOptions = ["Unit", "KG", "Plate", "Glass", "Set"]; // Options for Unit dropdown

  useEffect(() => {
    if (location.state?.event) {
      const event = location.state.event;
      setEditingEvent(event);
      setFormData({
        name: event.name || "",
        phone1: event.phone1 || "",
        phone2: event.phone2 || "",
        noOfGuests: event.noOfGuests || 0,
        eventType: event.eventType || "",
        checkIn: event.checkIn?.slice(0, 10) || "",
        checkOut: event.checkOut?.slice(0, 10) || "",
        email: event.email || "",
        notes: event.notes || "",
      });
      setTableData(event.tableData || [{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
      setExtraFields(event.extraFields || [{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone1) {
      newErrors.phone1 = "Phone Number 1 is required";
    } else if (!/^\d{10}$/.test(formData.phone1)) {
      newErrors.phone1 = "Phone Number 1 must be exactly 10 digits";
    }
    if (formData.phone2 && !/^\d{10}$/.test(formData.phone2)) {
      newErrors.phone2 = "Phone Number 2 must be exactly 10 digits";
    }
    if (!formData.noOfGuests || formData.noOfGuests < 1) newErrors.noOfGuests = "Number of Guests must be at least 1";
    if (!formData.eventType) newErrors.eventType = "Event Type is required";
    if (!formData.checkIn) newErrors.checkIn = "Check-In date is required";
    if (!formData.checkOut) newErrors.checkOut = "Check-Out date is required";
    if (formData.checkIn && formData.checkOut && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      newErrors.checkOut = "Check-Out must be after Check-In";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "noOfGuests" ? parseInt(value) || 0 : value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleTableChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = field === "description" || field === "unit" ? value : parseFloat(value) || 0;
    if (field === "quantity" || field === "rate") {
      updatedData[index].amount = updatedData[index].quantity * updatedData[index].rate;
    }
    setTableData(updatedData);
  };

  const addRow = () => {
    setTableData([...tableData, { no: tableData.length + 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeRow = (index) => {
    if (tableData.length === 1) {
      setPopup({ message: "Cannot remove the last row!", type: "warning", showConfirm: false });
      return;
    }
    const updatedData = tableData.filter((_, i) => i !== index).map((row, i) => ({ ...row, no: i + 1 }));
    setTableData(updatedData);
  };

  const handleExtraChange = (index, field, value) => {
    const updatedExtras = [...extraFields];
    updatedExtras[index][field] = field === "description" || field === "unit" ? value : parseFloat(value) || 0;
    if (field === "quantity" || field === "rate") {
      updatedExtras[index].amount = updatedExtras[index].quantity * updatedExtras[index].rate;
    }
    setExtraFields(updatedExtras);
  };

  const addExtraRow = () => {
    setExtraFields([...extraFields, { no: `E${extraFields.length + 1}`, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeExtraRow = (index) => {
    if (extraFields.length === 1) {
      setPopup({ message: "Cannot remove the last row!", type: "warning", showConfirm: false });
      return;
    }
    const updatedExtras = extraFields.filter((_, i) => i !== index).map((row, i) => ({ ...row, no: `E${i + 1}` }));
    setExtraFields(updatedExtras);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setPopup({ message: "Please correct the errors in the form!", type: "warning", showConfirm: false });
      return;
    }

    setPopup({
      message: "Are you sure you want to submit this booking?",
      type: "confirm",
      showConfirm: true,
      onConfirm: async () => {
        try {
          const totalAmount = tableData.reduce((sum, row) => sum + (row.amount || 0), 0);
          const extraAmount = extraFields.reduce((sum, row) => sum + (row.amount || 0), 0);
          const serviceCharge = totalAmount * 0.1;
          const grandTotal = totalAmount + serviceCharge + extraAmount;

          const dataToSubmit = {
            ...formData,
            tableData,
            extraFields,
            totalAmount,
            serviceCharge,
            extraAmount,
            grandTotal,
          };

          if (editingEvent) {
            await axios.put(`${API_BASE_URL}/api/events/${editingEvent._id}`, dataToSubmit);
            setEditingEvent(null);
            setPopup({ message: "Event updated successfully!", type: "success", showConfirm: false });
          } else {
            await axios.post(`${API_BASE_URL}/api/events`, dataToSubmit);
            setPopup({ message: "Booking submitted successfully!", type: "success", showConfirm: false });
          }

          setFormData({
            name: "",
            phone1: "",
            phone2: "",
            noOfGuests: 0,
            eventType: "",
            checkIn: "",
            checkOut: "",
            email: "",
            notes: "",
          });
          setTableData([{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
          setExtraFields([{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
        } catch (error) {
          console.error("Error submitting booking:", error.message, error.response?.data);
          setPopup({
            message: `Something went wrong! ${error.message}${error.response?.data?.message ? `: ${error.response.data.message}` : ""}`,
            type: "error",
            showConfirm: false,
          });
        }
      },
    });
  };

  const totalAmount = tableData.reduce((sum, row) => sum + (row.amount || 0), 0);
  const extraAmount = extraFields.reduce((sum, row) => sum + (row.amount || 0), 0);
  const serviceCharge = totalAmount * 0.1;
  const grandTotal = totalAmount + serviceCharge + extraAmount;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          {editingEvent ? "Edit Event" : "Book Your Event"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="seminar">Seminar</option>
                <option value="party">Party</option>
              </select>
              {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-In:</label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.checkIn ? "border-red-500" : ""}`}
              />
              {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-Out:</label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${errors.checkOut ? "border-red-500" : ""}`}
              />
              {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
            </div>
            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Add Notes (Optional):</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-32 resize-y"
                placeholder="e.g., Special requests, additional details, or instructions"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Add Food Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.no}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={row.description}
                          onChange={(e) => handleTableChange(index, "description", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          <option value="">Select Food Item</option>
                          {foodOptions.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={row.unit}
                          onChange={(e) => handleTableChange(index, "unit", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          <option value="">Select Unit</option>
                          {unitOptions.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          value={row.quantity}
                          onChange={(e) => handleTableChange(index, "quantity", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 100"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={row.rate}
                          onChange={(e) => handleTableChange(index, "rate", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 650.00"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition duration-200"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add Row
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-lg font-semibold text-blue-800">Total Amount: {totalAmount.toFixed(2)}</p>
            <p className="text-lg font-semibold text-blue-800">Service Charge (10%): {serviceCharge.toFixed(2)}</p>
            <p className="text-lg font-semibold text-blue-800">Extra Amount: {extraAmount.toFixed(2)}</p>
            <p className="text-lg font-semibold text-blue-800">Grand Total: {grandTotal.toFixed(2)}</p>
            <p className="text-lg font-semibold text-blue-800">Grand Total Rate PP: {(formData.noOfGuests > 0 ? grandTotal / formData.noOfGuests : 0).toFixed(2)}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Extra Charges</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extraFields.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.no}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => handleExtraChange(index, "description", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., Additional Lighting Setup"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={row.unit}
                          onChange={(e) => handleExtraChange(index, "unit", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          <option value="">Select Unit</option>
                          {unitOptions.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          value={row.quantity}
                          onChange={(e) => handleExtraChange(index, "quantity", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={row.rate}
                          onChange={(e) => handleExtraChange(index, "rate", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 3000.00"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => removeExtraRow(index)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition duration-200"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addExtraRow}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add Extra Row
            </button>
          </div>

          <div className="flex space-x-3 justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              {editingEvent ? "Update Booking" : "Submit Booking"}
            </button>
            {editingEvent && (
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({
                    name: "",
                    phone1: "",
                    phone2: "",
                    noOfGuests: 0,
                    eventType: "",
                    checkIn: "",
                    checkOut: "",
                    email: "",
                    notes: "",
                  });
                  setTableData([{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
                  setExtraFields([{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/event-list")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              View Your Events
            </button>
          </div>
        </form>
      </div>
      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "", showConfirm: false })}
        onConfirm={popup.onConfirm}
        showConfirm={popup.showConfirm}
      />
    </div>
  );
};

export default EventBooking;