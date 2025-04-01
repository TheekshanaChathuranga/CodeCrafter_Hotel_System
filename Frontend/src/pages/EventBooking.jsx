import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate, useLocation } from "react-router-dom";

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
    date: "",
    checkIn: "",
    checkOut: "",
    email: "",
  });
  const [tableData, setTableData] = useState([
    { no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  const [extraFields, setExtraFields] = useState([
    { no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  const [editingEvent, setEditingEvent] = useState(null);

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
        date: event.date?.slice(0, 10) || "",
        checkIn: event.checkIn?.slice(0, 10) || "",
        checkOut: event.checkOut?.slice(0, 10) || "",
        email: event.email || "",
      });
      setTableData(event.tableData || [{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
      setExtraFields(event.extraFields || [{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "noOfGuests" ? parseInt(value) : value });
  };

  const handleTableChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;

    if (field === "quantity" || field === "rate") {
      const quantity = updatedData[index].quantity || 0;
      const rate = updatedData[index].rate || 0;
      updatedData[index].amount = quantity * rate;
    }

    setTableData(updatedData);
  };

  const addRow = () => {
    setTableData([
      ...tableData,
      { no: tableData.length + 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
    ]);
  };

  const removeRow = (index) => {
    if (tableData.length === 1) {
      alert("Cannot remove the last row!");
      return;
    }
    const updatedData = tableData.filter((_, i) => i !== index);
    const reindexedData = updatedData.map((row, i) => ({ ...row, no: i + 1 }));
    setTableData(reindexedData);
  };

  const handleExtraChange = (index, field, value) => {
    const updatedExtras = [...extraFields];
    updatedExtras[index][field] = value;

    if (field === "quantity" || field === "rate") {
      const quantity = updatedExtras[index].quantity || 0;
      const rate = updatedExtras[index].rate || 0;
      updatedExtras[index].amount = quantity * rate;
    }

    setExtraFields(updatedExtras);
  };

  const addExtraRow = () => {
    setExtraFields([
      ...extraFields,
      { no: `E${extraFields.length + 1}`, description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
    ]);
  };

  const removeExtraRow = (index) => {
    if (extraFields.length === 1) {
      alert("Cannot remove the last row!");
      return;
    }
    const updatedExtras = extraFields.filter((_, i) => i !== index);
    const reindexedExtras = updatedExtras.map((row, i) => ({ ...row, no: `E${i + 1}` }));
    setExtraFields(reindexedExtras);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const newTableData = jsonData.map((row, index) => ({
        no: index + 1,
        description: row.Description || "",
        unit: row.Unit || "",
        quantity: row.Qty || 0,
        rate: row.Rate || 0,
        amount: (row.Qty || 0) * (row.Rate || 0),
      }));

      setTableData(newTableData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        grandTotal,
        finalTotal: grandTotal,
      };

      if (editingEvent) {
        await axios.put(
          `${API_BASE_URL}/api/events/${editingEvent._id}`,
          dataToSubmit
        );
        setEditingEvent(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/events`, dataToSubmit);
      }

      setFormData({
        name: "",
        phone1: "",
        phone2: "",
        noOfGuests: 0,
        eventType: "",
        date: "",
        checkIn: "",
        checkOut: "",
        email: "",
      });
      setTableData([{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
      setExtraFields([{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
      alert(editingEvent ? "Event updated!" : "Booking submitted!");
    } catch (error) {
      console.error("Error submitting booking:", error.message, error.response?.data);
      alert(`Something went wrong! ${error.message}${error.response?.data?.message ? `: ${error.response.data.message}` : ""}`);
    }
  };

  const totalAmount = tableData.reduce((sum, row) => sum + (row.amount || 0), 0);
  const extraAmount = extraFields.reduce((sum, row) => sum + (row.amount || 0), 0);
  const serviceCharge = totalAmount * 0.1;
  const grandTotal = totalAmount + serviceCharge + extraAmount;
  const grandTotalRatePP = formData.noOfGuests > 0 ? (grandTotal / formData.noOfGuests).toFixed(2) : "0.00";
  const finalTotalRatePP = formData.noOfGuests > 0 ? (grandTotal / formData.noOfGuests).toFixed(2) : "0.00";

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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number 1:</label>
              <input
                type="tel"
                name="phone1"
                value={formData.phone1}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number 2 (Additional):</label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No of Guests:</label>
              <input
                type="number"
                name="noOfGuests"
                value={formData.noOfGuests}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Type:</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              >
                <option value="">Select Event Type</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="seminar">Seminar</option>
                <option value="party">Party</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-In:</label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-Out:</label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email (Optional):</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Excel File (Optional):</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Add Items</h2>
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
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => handleTableChange(index, "description", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., Egg Fried Rice (Basmathee)"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleTableChange(index, "unit", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          maxLength={5}
                          placeholder="e.g., KG"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          value={row.quantity}
                          onChange={(e) => handleTableChange(index, "quantity", parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 100"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={row.rate}
                          onChange={(e) => handleTableChange(index, "rate", parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 650.00"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount?.toFixed(2) || "0.00"}</td>
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
            <p className="text-lg font-semibold text-blue-800">Grand Total Rate PP: {grandTotalRatePP}</p>
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
                          placeholder="e.g., Pool Side Reservation"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleExtraChange(index, "unit", e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          maxLength={5}
                          placeholder="e.g., KG"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          value={row.quantity}
                          onChange={(e) => handleExtraChange(index, "quantity", parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 100"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={row.rate}
                          onChange={(e) => handleExtraChange(index, "rate", parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          placeholder="e.g., 5000"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount?.toFixed(2) || "0.00"}</td>
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

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-lg font-semibold text-blue-800">Final Total: {grandTotal.toFixed(2)}</p>
            <p className="text-lg font-semibold text-blue-800">Final Total Rate PP: {finalTotalRatePP}</p>
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
                    date: "",
                    checkIn: "",
                    checkOut: "",
                    email: "",
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
    </div>
  );
};

export default EventBooking;