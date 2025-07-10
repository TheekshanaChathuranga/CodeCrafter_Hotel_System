import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Popup from "./Popup";
import BookingForm from "../components/forms/BookingForm";
import TableRow from "../components/events/TableRow";
import ExtraRow from "../components/events/ExtraRow";
import SummarySection from "../components/events/SummarySection";
import eventService from "../services/eventService";
import foodService from "../services/foodService";

const EventBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone1: "",
    phone2: "",
    noOfGuests: 0,
    eventType: "",
    hall: "",
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
  const [foodItems, setFoodItems] = useState([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodError, setFoodError] = useState("");

  const unitOptions = ["Unit", "KG", "Plate", "Glass", "Set"];

  const formatDateForSubmission = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

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
        hall: event.hall || "",
        checkIn: event.checkIn ? formatDateForSubmission(event.checkIn) : "",
        checkOut: event.checkOut ? formatDateForSubmission(event.checkOut) : "",
        email: event.email || "",
        notes: event.notes || "",
      });
      setTableData(event.tableData || [{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
      setExtraFields(event.extraFields || [{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
    }
  }, [location.state]);

  useEffect(() => {
    // Fetch food items from backend
    setFoodLoading(true);
    foodService.getAllFoodItems()
      .then(items => {
        setFoodItems(items);
        setFoodLoading(false);
      })
      .catch(err => {
        setFoodError("Failed to load food items");
        setFoodLoading(false);
      });
  }, []);

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
    if (field === "description") {
      // Find the selected food item from foodItems
      const selectedFood = foodItems.find(item => item.name === value);
      updatedData[index].description = value;
      updatedData[index].unit = selectedFood ? selectedFood.unitType : "";
      updatedData[index].rate = selectedFood ? selectedFood.unitPrice : 0;
      updatedData[index].amount = updatedData[index].quantity * (selectedFood ? selectedFood.unitPrice : 0);
    } else if (field === "quantity") {
      updatedData[index].quantity = parseFloat(value) || 0;
      updatedData[index].amount = updatedData[index].quantity * updatedData[index].rate;
    } else {
      updatedData[index][field] = parseFloat(value) || 0;
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

          // Format dates properly
          const formattedCheckIn = formatDateForSubmission(formData.checkIn);
          const formattedCheckOut = formatDateForSubmission(formData.checkOut);

          // Validate dates
          if (new Date(formattedCheckOut) <= new Date(formattedCheckIn)) {
            setPopup({
              message: "Check-out date must be after check-in date",
              type: "error",
              showConfirm: false,
            });
            return;
          }

          const dataToSubmit = {
            ...formData,
            checkIn: formattedCheckIn,
            checkOut: formattedCheckOut,
            tableData: tableData.map(row => ({
              description: row.description,
              unit: row.unit,
              quantity: Number(row.quantity),
              rate: Number(row.rate),
              amount: Number(row.amount)
            })),
            extraFields: extraFields.map(row => ({
              description: row.description,
              unit: row.unit,
              quantity: Number(row.quantity),
              rate: Number(row.rate),
              amount: Number(row.amount)
            })),
            totalAmount,
            serviceCharge,
            extraAmount,
            grandTotal,
          };

          console.log("Submitting data:", dataToSubmit);

          if (editingEvent) {
            try {
              await eventService.updateEvent(editingEvent._id, dataToSubmit);
              setEditingEvent(null);
              setPopup({ message: "Event updated successfully!", type: "success", showConfirm: false });
            } catch (error) {
              console.error("Error updating event:", error);
              const errorMessage = error.response?.data?.errors?.join('\n') || error.response?.data?.message || "Error updating event. Please try again.";
              setPopup({
                message: errorMessage,
                type: "error",
                showConfirm: false,
              });
              return;
            }
          } else {
            try {
              await eventService.createEvent(dataToSubmit);
              setPopup({ message: "Booking submitted successfully!", type: "success", showConfirm: false });
            } catch (error) {
              console.error("Error creating event:", error);
              const errorMessage = error.response?.data?.errors?.join('\n') || error.response?.data?.message || "Error submitting booking. Please try again.";
              setPopup({
                message: errorMessage,
                type: "error",
                showConfirm: false,
              });
              return;
            }
          }

          // Reset form
          setFormData({
            name: "",
            phone1: "",
            phone2: "",
            noOfGuests: 0,
            eventType: "",
            hall: "",
            checkIn: "",
            checkOut: "",
            email: "",
            notes: "",
          });
          setTableData([{ no: 1, description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
          setExtraFields([{ no: "E1", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
        } catch (error) {
          console.error("Error submitting booking:", error);
          setPopup({
            message: error.response?.data?.message || "Error submitting booking. Please try again.",
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
          <BookingForm formData={formData} errors={errors} handleChange={handleChange} />

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Food Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">No</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Unit</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Rate</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <TableRow
                      key={index}
                      row={row}
                      index={index}
                      foodOptions={foodItems}
                      handleTableChange={handleTableChange}
                      removeRow={removeRow}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Row
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Extra Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">No</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Unit</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Rate</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {extraFields.map((row, index) => (
                    <ExtraRow
                      key={index}
                      row={row}
                      index={index}
                      unitOptions={unitOptions}
                      handleExtraChange={handleExtraChange}
                      removeExtraRow={removeExtraRow}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addExtraRow}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Extra Row
            </button>
          </div>

          <SummarySection
            totalAmount={totalAmount}
            serviceCharge={serviceCharge}
            extraAmount={extraAmount}
            grandTotal={grandTotal}
          />

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingEvent ? "Update Event" : "Submit Booking"}
            </button>
          </div>
        </form>
      </div>
      {popup.message && (
        <Popup
          message={popup.message}
          type={popup.type}
          showConfirm={popup.showConfirm}
          onConfirm={popup.onConfirm}
          onClose={() => setPopup({ message: "", type: "", showConfirm: false })}
        />
      )}
    </div>
  );
};

export default EventBooking;