import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "../../components/ui/dialog";
import { Table, TableHeader, TableRow as ShadTableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import BookingForm from "../../components/forms/BookingForm";
import TableRow from "../../components/events/TableRow";
import ExtraRow from "../../components/events/ExtraRow";
import SummarySection from "../../components/events/SummarySection";
import eventService from "../../services/eventService";
import foodService from "../../services/foodService";

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
    checkInTime: "",
    checkOut: "",
    checkOutTime: "",
    email: "",
    notes: "",
  });
  const [tableData, setTableData] = useState([
    { no: 1, category: "", description: "", unit: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  const [extraFields, setExtraFields] = useState([
    { description: "Pool Side reservation", rate: 5000, selected: false },
    { description: "Boat ride", rate: 5000, selected: false },
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

  // Combine date and time to ISO string
  const combineDateTime = (date, time) => {
    if (!date) return null;
    const formattedTime = time || "00:00";
    // Ensure seconds for valid ISO if time only hh:mm
    const isoString = new Date(`${date}T${formattedTime}:00`).toISOString();
    return isoString;
  };

  // Helper to extract time (hh:mm) from ISO string
  const extractTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toTimeString().slice(0,5);
  };

  useEffect(() => {
    if (location.state?.event) {
      const event = location.state.event;
      setEditingEvent(event);

      // ----- populate form data -----
      setFormData({
        name: event.name || "",
        phone1: event.phone1 || "",
        phone2: event.phone2 || "",
        noOfGuests: event.noOfGuests || 0,
        eventType: event.eventType || "",
        hall: event.hall || "",
        checkIn: event.checkIn ? formatDateForSubmission(event.checkIn) : "",
        checkInTime: event.checkIn ? extractTime(event.checkIn) : "",
        checkOut: event.checkOut ? formatDateForSubmission(event.checkOut) : "",
        checkOutTime: event.checkOut ? extractTime(event.checkOut) : "",
        email: event.email || "",
        notes: event.notes || "",
      });

      // ----- populate table data with serial numbers -----
      const tableDataWithNo = Array.isArray(event.tableData) && event.tableData.length > 0
        ? event.tableData.map((row, idx) => ({ no: idx + 1, ...row }))
        : [{ no: 1, category: "", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }];
      setTableData(tableDataWithNo);

      // ----- merge default extras and mark selected ones -----
      const defaultExtras = [
        { description: "Pool Side reservation", rate: 5000 },
        { description: "Boat ride", rate: 5000 },
      ];

      const eventExtras = Array.isArray(event.extraFields) ? event.extraFields : [];

      // Mark defaults as selected if present in eventExtras
      const mergedDefaults = defaultExtras.map((def) => {
        const matched = eventExtras.find((ex) => ex.description === def.description);
        return { ...def, selected: !!matched };
      });

      // Include any additional extras that aren't part of defaults
      const additionalExtras = eventExtras
        .filter((ex) => !defaultExtras.some((def) => def.description === ex.description))
        .map((ex) => ({ ...ex, selected: true }));

      setExtraFields([...mergedDefaults, ...additionalExtras]);
    }
  }, [location.state]);

  useEffect(() => {
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
    if (!formData.checkInTime) newErrors.checkInTime = "Check-In time is required";
    if (!formData.checkOut) newErrors.checkOut = "Check-Out date is required";
    if (!formData.checkOutTime) newErrors.checkOutTime = "Check-Out time is required";
    // Validate date-time combined comparison
    if (formData.checkIn && formData.checkInTime && formData.checkOut && formData.checkOutTime) {
      const checkInDT = new Date(`${formData.checkIn}T${formData.checkInTime}:00`);
      const checkOutDT = new Date(`${formData.checkOut}T${formData.checkOutTime}:00`);
      if (checkOutDT <= checkInDT) {
        newErrors.checkOutTime = "Check-Out must be after Check-In";
      }
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
    if (field === "category") {
      updatedData[index].category = value;
      // Reset dependent fields when category changes
      updatedData[index].description = "";
      updatedData[index].unit = "";
      updatedData[index].rate = 0;
      updatedData[index].amount = 0;
    } else if (field === "description") {
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
    setTableData([...tableData, { no: tableData.length + 1, category: "", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeRow = (index) => {
    if (tableData.length === 1) {
      setPopup({ message: "Cannot remove the last row!", type: "warning", showConfirm: false });
      return;
    }
    const updatedData = tableData.filter((_, i) => i !== index).map((row, i) => ({ ...row, no: i + 1 }));
    setTableData(updatedData);
  };

  const handleExtraToggle = (index) => {
    const updatedExtras = [...extraFields];
    updatedExtras[index].selected = !updatedExtras[index].selected;
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
          // Consider only the extras the user has actually selected
          const selectedExtras = extraFields.filter((row) => row.selected);
          const extraAmount = selectedExtras.reduce((sum, row) => sum + row.rate, 0);
          const serviceCharge = totalAmount * 0.1;
          const grandTotal = totalAmount + serviceCharge + extraAmount;

          // Format dates properly
          const formattedCheckIn = combineDateTime(formData.checkIn, formData.checkInTime);
          const formattedCheckOut = combineDateTime(formData.checkOut, formData.checkOutTime);

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
              category: row.category,
              description: row.description,
              unit: row.unit,
              quantity: Number(row.quantity),
              rate: Number(row.rate),
              amount: Number(row.amount)
            })),
            // Send only the extras that were chosen
            extraFields: selectedExtras.map(row => ({
              description: row.description,
              rate: Number(row.rate),
              selected: true,
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
              let errorMessage = "Error submitting booking. Please try again.";
              if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                errorMessage = (
                  <div>
                    <div className="font-semibold mb-2">Please fix the following errors:</div>
                    <ul className="list-disc list-inside text-left">
                      {error.response.data.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                  </div>
                );
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              }
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
            checkInTime: "",
            checkOut: "",
            checkOutTime: "",
            email: "",
            notes: "",
          });
          setTableData([{ no: 1, category: "", description: "", unit: "", quantity: 0, rate: 0, amount: 0 }]);
          setExtraFields([{ description: "Pool Side reservation", rate: 5000, selected: false }, { description: "Boat ride", rate: 5000, selected: false }]);
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
  const extraAmount = extraFields.reduce((sum, row) => sum + (row.selected ? row.rate : 0), 0);
  const serviceCharge = totalAmount * 0.1;
  const grandTotal = totalAmount + serviceCharge + extraAmount;

  // Add a helper to check if the form is valid for submit
  const isFormValid = () => {
    return (
      formData.name &&
      formData.phone1 &&
      formData.noOfGuests > 0 &&
      formData.eventType &&
      formData.hall &&
      formData.checkIn &&
      formData.checkInTime &&
      formData.checkOut &&
      formData.checkOutTime
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            {editingEvent ? "Edit Event" : "Book Your Event"}
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <BookingForm formData={formData} errors={errors} handleChange={handleChange} />

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Food Items</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <ShadTableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Food item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price(Rs)</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Action</TableHead>
                    </ShadTableRow>
                  </TableHeader>
                  <TableBody>
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
                  </TableBody>
                </Table>
              </div>
              <Button
                type="button"
                onClick={addRow}
                className="mt-4"
              >
                Add Row
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Extra Items</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <ShadTableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price(Rs)</TableHead>
                      <TableHead>Amount</TableHead>
                    </ShadTableRow>
                  </TableHeader>
                  <TableBody>
                    {extraFields.map((row, index) => (
                      <ShadTableRow key={index}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => handleExtraToggle(index)}
                          />
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.rate.toLocaleString()}</TableCell>
                        <TableCell>{row.selected ? row.rate.toLocaleString() : 0}</TableCell>
                      </ShadTableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <SummarySection
              totalAmount={totalAmount}
              serviceCharge={serviceCharge}
              extraAmount={extraAmount}
              grandTotal={grandTotal}
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={!isFormValid()}
              >
                {editingEvent ? "Update Event" : "Submit Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Dialog for popups */}
      <Dialog open={!!popup.message} onOpenChange={() => setPopup({ message: "", type: "", showConfirm: false })}>
        <DialogContent>
          <div className="text-center">
            <p className={popup.type === "error" ? "text-red-600" : popup.type === "warning" ? "text-yellow-600" : "text-gray-800"}>
              {popup.message}
            </p>
            {popup.showConfirm && (
              <div className="flex justify-center mt-4 space-x-4">
                <Button onClick={popup.onConfirm} variant="default">Confirm</Button>
                <Button onClick={() => setPopup({ message: "", type: "", showConfirm: false })} variant="secondary">Cancel</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventBooking;