import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE_URL = "http://localhost:5000";

const EventBooking = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone1: "",
    phone2: "",
    noOfGuests: 0, // New field for No of Guests
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
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`);
      const fetchedEvents = response.data || [];
      const sanitizedEvents = fetchedEvents.map((event) => ({
        ...event,
        tableData: event.tableData || [],
        extraFields: event.extraFields || [],
      }));
      setEvents(sanitizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error.message, error.response?.data);
      setEvents([]);
      alert(`Failed to fetch events: ${error.message}`);
    }
  };

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
        const response = await axios.put(
          `${API_BASE_URL}/api/events/${editingEvent._id}`,
          dataToSubmit
        );
        setEvents(events.map((ev) => (ev._id === editingEvent._id ? response.data : ev)));
        setEditingEvent(null);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/events`, dataToSubmit);
        setEvents([...events, response.data]);
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

  const handleEdit = (event) => {
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
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`);
      setEvents(events.filter((ev) => ev._id !== id));
      alert("Event deleted!");
    } catch (error) {
      console.error("Error deleting event:", error.message, error.response?.data);
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editingEvent ? "Edit Event" : "Book Your Event"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Phone Number 1:</label>
          <input
            type="tel"
            name="phone1"
            value={formData.phone1}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Phone Number 2 (Additional):</label>
          <input
            type="tel"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>No of Guests:</label>
          <input
            type="number"
            name="noOfGuests"
            value={formData.noOfGuests}
            onChange={handleChange}
            className="border p-2 w-full"
            min="1"
            required
          />
        </div>
        <div>
          <label>Event Type:</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="border p-2 w-full"
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
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Check-In:</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Check-Out:</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Email (Optional):</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mt-4">
          <label>Upload Excel File (Optional):</label>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="border p-2" />
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Add Items</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">No</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Unit</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2">{row.no}</td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleTableChange(index, "description", e.target.value)}
                      className="border p-1 w-full"
                      placeholder="e.g., Egg Fried Rice (Basmathee)"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) => handleTableChange(index, "unit", e.target.value)}
                      className="border p-1 w-full"
                      maxLength={5}
                      placeholder="e.g., KG"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      step="0.1"
                      value={row.quantity}
                      onChange={(e) => handleTableChange(index, "quantity", parseFloat(e.target.value))}
                      className="border p-1 w-full"
                      placeholder="e.g., 100"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      step="0.01"
                      value={row.rate}
                      onChange={(e) => handleTableChange(index, "rate", parseFloat(e.target.value))}
                      className="border p-1 w-full"
                      placeholder="e.g., 650.00"
                    />
                  </td>
                  <td className="border p-2">{row.amount?.toFixed(2) || "0.00"}</td>
                  <td className="border p-2">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addRow}
            className="bg-green-500 text-white p-2 rounded mt-2 mr-2"
          >
            Add Row
          </button>
        </div>

        <div className="mt-2">
          <p className="text-lg font-bold">Total Amount: {totalAmount.toFixed(2)}</p>
          <p className="text-lg font-bold">Service Charge (10%): {serviceCharge.toFixed(2)}</p>
          <p className="text-lg font-bold">Extra Amount: {extraAmount.toFixed(2)}</p>
          <p className="text-lg font-bold">Grand Total: {grandTotal.toFixed(2)}</p>
          <p className="text-lg font-bold">Grand Total Rate PP: {grandTotalRatePP}</p>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Extra Charges</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">No</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Unit</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {extraFields.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2">{row.no}</td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleExtraChange(index, "description", e.target.value)}
                      className="border p-1 w-full"
                      placeholder="e.g., Pool Side Reservation"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) => handleExtraChange(index, "unit", e.target.value)}
                      className="border p-1 w-full"
                      maxLength={5}
                      placeholder="e.g., KG"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      step="0.1"
                      value={row.quantity}
                      onChange={(e) => handleExtraChange(index, "quantity", parseFloat(e.target.value))}
                      className="border p-1 w-full"
                      placeholder="e.g., 100"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      step="0.01"
                      value={row.rate}
                      onChange={(e) => handleExtraChange(index, "rate", parseFloat(e.target.value))}
                      className="border p-1 w-full"
                      placeholder="e.g., 5000"
                    />
                  </td>
                  <td className="border p-2">{row.amount?.toFixed(2) || "0.00"}</td>
                  <td className="border p-2">
                    <button
                      type="button"
                      onClick={() => removeExtraRow(index)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addExtraRow}
            className="bg-green-500 text-white p-2 rounded mt-2 mr-2"
          >
            Add Extra Row
          </button>
        </div>

        <div className="mt-2">
          <p className="text-lg font-bold">Final Total: {grandTotal.toFixed(2)}</p>
          <p className="text-lg font-bold">Final Total Rate PP: {finalTotalRatePP}</p>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingEvent ? "Update Booking" : "Submit Booking"}
        </button>
        {editingEvent && (
          <button
            type="button"
            onClick={() => setEditingEvent(null)}
            className="bg-gray-500 text-white p-2 rounded ml-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h2 className="text-xl font-bold mt-8">Your Events</h2>
      <div className="mt-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="border p-4 mb-2">
              <div>
                <p><strong>Name:</strong> {event.name}</p>
                <p><strong>No of Guests:</strong> {event.noOfGuests}</p>
                <p><strong>Event Type:</strong> {event.eventType}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Check-In:</strong> {new Date(event.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-Out:</strong> {new Date(event.checkOut).toLocaleDateString()}</p>
                <h3 className="text-lg font-bold mt-2">Items</h3>
                <table className="w-full border-collapse border">
                  <thead>
                    <tr>
                      <th className="border p-2">No</th>
                      <th className="border p-2">Description</th>
                      <th className="border p-2">Unit</th>
                      <th className="border p-2">Quantity</th>
                      <th className="border p-2">Rate</th>
                      <th className="border p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.tableData.map((row, index) => (
                      <tr key={index}>
                        <td className="border p-2">{row.no}</td>
                        <td className="border p-2">{row.description}</td>
                        <td className="border p-2">{row.unit}</td>
                        <td className="border p-2">{row.quantity}</td>
                        <td className="border p-2">{row.rate}</td>
                        <td className="border p-2">{row.amount?.toFixed(2) || "0.00"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p><strong>Total Amount:</strong> {event.totalAmount?.toFixed(2) || "0.00"}</p>
                <p><strong>Service Charge:</strong> {event.serviceCharge?.toFixed(2) || "0.00"}</p>
                <p><strong>Extra Amount:</strong> {event.extraAmount?.toFixed(2) || "0.00"}</p>
                <p><strong>Grand Total:</strong> {event.grandTotal?.toFixed(2) || "0.00"}</p>
                <p><strong>Grand Total Rate PP:</strong> {(event.noOfGuests > 0 ? event.grandTotal / event.noOfGuests : 0).toFixed(2)}</p>
                <h3 className="text-lg font-bold mt-2">Extra Charges</h3>
                <table className="w-full border-collapse border">
                  <thead>
                    <tr>
                      <th className="border p-2">No</th>
                      <th className="border p-2">Description</th>
                      <th className="border p-2">Unit</th>
                      <th className="border p-2">Quantity</th>
                      <th className="border p-2">Rate</th>
                      <th className="border p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.extraFields.map((row, index) => (
                      <tr key={index}>
                        <td className="border p-2">{row.no}</td>
                        <td className="border p-2">{row.description}</td>
                        <td className="border p-2">{row.unit}</td>
                        <td className="border p-2">{row.quantity}</td>
                        <td className="border p-2">{row.rate}</td>
                        <td className="border p-2">{row.amount?.toFixed(2) || "0.00"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p><strong>Final Total:</strong> {event.finalTotal?.toFixed(2) || "0.00"}</p>
                <p><strong>Final Total Rate PP:</strong> {(event.noOfGuests > 0 ? event.finalTotal / event.noOfGuests : 0).toFixed(2)}</p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No events booked yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventBooking;