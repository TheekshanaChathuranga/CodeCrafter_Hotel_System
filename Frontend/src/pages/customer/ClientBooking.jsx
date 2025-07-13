import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import coverCustomerMenu from "../../assets/cover-customer-menu.avif";

const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Other"
];

const initialForm = {
  contactName: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  eventTime: "",
  attendees: ""
};

export default function ClientBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelect = (value) => {
    setForm((prev) => ({ ...prev, eventType: value }));
    setErrors((prev) => ({ ...prev, eventType: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.contactName) newErrors.contactName = "Contact Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.phone) newErrors.phone = "Phone Number is required";
    else if (!/^\d{10,15}$/.test(form.phone)) newErrors.phone = "Invalid phone number";
    if (!form.eventType) newErrors.eventType = "Event Type is required";
    if (!form.eventDate) newErrors.eventDate = "Event Date is required";
    else {
      const selectedDate = new Date(form.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.eventDate = "Event date cannot be in the past";
    }
    if (!form.eventTime) newErrors.eventTime = "Event Time is required";
    if (!form.attendees) newErrors.attendees = "Number of Attendees is required";
    else if (isNaN(form.attendees) || Number(form.attendees) < 1) newErrors.attendees = "Must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to submit the booking
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert("Event booking submitted successfully! You will receive a confirmation email shortly.");
      setForm(initialForm);
      
      // Navigate to a confirmation page or back to home
      navigate("/mybookings");
    } catch (error) {
      alert("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl flex flex-col md:flex-row shadow-lg overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center p-6 md:p-10">
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="px-4 py-2"
              >
                ← Back
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0D141C] mb-2">Event Booking</h1>
            <p className="text-gray-600">Book your special event with us</p>
          </CardHeader>
          <CardContent className="p-0">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactName" className="mb-2">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  aria-invalid={!!errors.contactName}
                  className={errors.contactName ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="mb-2">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="mb-2">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  aria-invalid={!!errors.phone}
                  className={errors.phone ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="eventType" className="mb-2">Event Type</Label>
                <Select value={form.eventType} onValueChange={handleSelect} disabled={isSubmitting}>
                  <SelectTrigger className={"w-full " + (errors.eventType ? "border-red-500" : "") }>
                    <SelectValue placeholder="Select Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="eventDate" className="mb-2">Event Date</Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={form.eventDate}
                    onChange={handleChange}
                    aria-invalid={!!errors.eventDate}
                    className={errors.eventDate ? "border-red-500" : ""}
                    disabled={isSubmitting}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
                  {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="eventTime" className="mb-2">Event Time</Label>
                  <Input
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    value={form.eventTime}
                    onChange={handleChange}
                    aria-invalid={!!errors.eventTime}
                    className={errors.eventTime ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.eventTime && <p className="text-red-500 text-xs mt-1">{errors.eventTime}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="attendees" className="mb-2">Number of Attendees</Label>
                <Input
                  id="attendees"
                  name="attendees"
                  type="number"
                  min="1"
                  value={form.attendees}
                  onChange={handleChange}
                  aria-invalid={!!errors.attendees}
                  className={errors.attendees ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.attendees && <p className="text-red-500 text-xs mt-1">{errors.attendees}</p>}
              </div>
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base font-bold bg-[#0A80ED] hover:bg-[#0866c6]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Booking"}
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
        {/* Right: Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#F7FAFC] p-6">
          <img
            src={coverCustomerMenu}
            alt="Event Booking Illustration"
            className="max-w-full h-auto rounded-xl shadow-md"
            style={{ width: 360, height: 480, objectFit: "cover" }}
          />
        </div>
        {/* Mobile Illustration */}
        <div className="md:hidden flex justify-center mb-6">
          <img
            src={coverCustomerMenu}
            alt="Event Booking Illustration"
            className="max-w-xs w-full h-auto rounded-xl shadow-md"
            style={{ maxHeight: 240, objectFit: "cover" }}
          />
        </div>
      </Card>
    </div>
  );
} 