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
    let { name, value } = e.target;

    if (name === "phone") {
      // Allow only digits and limit to 10 characters
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    if (name === "attendees") {
      // Prevent negative values and leading zeros
      value = value.replace(/[^0-9]/g, "");
    }

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
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone number must be exactly 10 digits";
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
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const payload = {
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        eventType: form.eventType,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        attendees: Number(form.attendees)
      };
      const res = await fetch(`${API_BASE_URL}/customer-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to submit booking");
      }
      
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
    <>
      {/* Top Navigation Bar */}
      <nav
        className="shadow-lg"
        style={{ backgroundColor: "rgb(44, 62, 80)", color: "rgb(255, 255, 255)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <img alt="Logo" className="h-8 w-8 rounded-full" src="/img/logo.jpg" />
              <a
                className="ml-2 text-xl font-bold"
                style={{ color: "rgb(255, 255, 255)" }}
                href="/"
              >
                The Lake Resort
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34495E] transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
                href="/"
              >
                Home
              </a>
              <a
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34495E] transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
                href="/room-booking"
              >
                Room Booking
              </a>
              <a
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34495E] transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
                href="/pool-booking"
              >
                Pool Booking
              </a>
              <a
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34495E] transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
                href="/event-booking"
              >
                Event Booking
              </a>
              <a
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34495E] transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
                href="/menu"
              >
                Menu
              </a>
              <a
                href="/#about"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
              >
                About
              </a>
              <a
                href="/#contact"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                style={{ color: "rgb(255, 255, 255)" }}
              >
                Contact
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "rgb(52, 152, 219)", color: "rgb(255, 255, 255)" }}
                href="/login"
              >
                Login
              </a>
              <a
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "rgb(39, 174, 96)", color: "rgb(255, 255, 255)" }}
                href="/signup"
              >
                Sign Up
              </a>
            </div>
            <div className="md:hidden">
              <button className="p-2 rounded-md hover:bg-gray-700 transition-colors" aria-label="Toggle menu">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-[#F7FAFC] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 w-full flex flex-col md:flex-row shadow-lg overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center p-6 md:p-10">
          <CardHeader className="p-0 mb-6">
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
                  maxLength={10}
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
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2025 The Lake Hotel & Resort. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
} 