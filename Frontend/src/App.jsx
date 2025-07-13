import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
//import About from "./pages/About";
//import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MenuManagement from "./pages/admin/MenuManagement";
import ClientBooking from "./pages/customer/ClientBooking";
import DashboardLayout from "./layout/dashboardLayout";
import EventList from "./pages/admin/EventList";
import ManagePools from "./pages/admin/PoolManagement";
import ManageRooms from "./pages/admin/RoomManagement";
import ManageUsers from "./pages/admin/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import ReservationCalendar from "./pages/admin/AdminReservationCalendar";
import BookingConfirmation from "./pages/admin/BookingConfirmationManagement";
import BookingConfirmationDetails from "./pages/admin/BookingConfirmationDetails";
import MyBookings from "./pages/customer/MyBookings";

import Profile from "./pages/Profile";

import Room_Book from "./pages/customer/Room_Book";
import Pool_Book from "./pages/customer/Pool_Book";

import EventBooking from "./pages/admin/EventBooking";

// Receptionist/Reception imports
import ReceptionHome from "./pages/Receptionist/ReceptionHome";
import ReceptionRoomBooking from "./pages/Receptionist/ReceptionRoomBookingPage";
import BookingsListPage from "./pages/Receptionist/BookingsListPage";
import BookingDetailsPage from "./pages/Receptionist/BookingDetailsPage";
import BookingCalendar from "./pages/Receptionist/BookingCalendar";
import ConfirmationPage from "./pages/Receptionist/ConfirmationPage";
import BookingsList from "./components/Receptionist/BookingsList";
import PoolBooking from "./components/Receptionist/PoolBooking";

// import RoomBooking from "./pages/reception/RoomBooking";
// import PoolsBooking from "./pages/reception/PoolsBooking";

import MenuPage from "./pages/customer/Menu";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isreceptionistRoute = location.pathname.startsWith("/receptionist");
  const isReceptionRoute = location.pathname.startsWith("/reception");
  // Hide the public Navbar on the standalone Event Booking page as requested
  const isEventBookingRoute = location.pathname.startsWith("/event-booking");

  return (
<div>
  {/* Render the public Navbar on all public routes except the standalone Event Booking page */}
  {!isAdminRoute && !isreceptionistRoute && !isReceptionRoute && !isEventBookingRoute && <Navbar />}

  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    {/* <Route path="/about" element={<About />} /> */}
    {/* <Route path="/contact" element={<Contact />} /> */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
      path="/unauthorized"
      element={
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl text-red-500">Unauthorized Access</h1>
        </div>
      }
    />

    <Route path="/room-booking" element={<Room_Book />} />
    <Route path="/pool-booking" element={<Pool_Book />} />
    <Route path="/event-booking" element={<ClientBooking />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/profile" element={<Profile />} />
    <Route
      path="/event-booking"
      element={<EventBooking />}
    />
    <Route
      path="/mybookings"
      element={
        <ProtectedRoute allowedRoles={["user"]}>
          <MyBookings />
        </ProtectedRoute>
      }
    />

    {/* Admin routes */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<ManageRooms />} />
      <Route path="rooms" element={<ManageRooms />} />
      <Route path="pools" element={<ManagePools />} />
      <Route path="reservations" element={<ReservationCalendar />} />
      <Route path="event-booking" element={<EventBooking />} />
      <Route path="event-list" element={<EventList />} />
      <Route path="users" element={<ManageUsers />} />
      <Route
        path="bookingNotifications"
        element={<BookingConfirmation />}
      />
      <Route
        path="bookingNotifications/:id"
        element={<BookingConfirmationDetails />}
      />
      <Route path="menu-management" element={<MenuManagement />} />
    </Route>

    {/* receptionist routes */}
    <Route
      path="/receptionist"
      element={
        <ProtectedRoute allowedRoles={["receptionist", "reception"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<ReceptionHome />} />
      <Route path="home" element={<ReceptionHome />} />
      <Route path="rooms" element={<ReceptionRoomBooking />} />
      <Route path="roomBooking" element={<ReceptionRoomBooking />} />
      <Route path="bookings" element={<BookingsListPage />} />
      <Route path="bookingsList" element={<BookingsListPage />} />
      <Route path="bookings/:id" element={<BookingDetailsPage />} />
      <Route
        path="bookings/:id/edit"
        element={<div>Edit Booking Page - Coming Soon</div>}
      />
      <Route path="calendar" element={<BookingCalendar />} />
      <Route path="confirmation" element={<ConfirmationPage />} />
      <Route path="pool-booking" element={<PoolBooking />} />
      <Route path="pool-bookings" element={<BookingsList />} />
      <Route path="pool-schedules" element={<BookingsList />} />
      <Route path="pools" element={<ManagePools />} />
      <Route
        path="profile"
        element={<div>Profile Page - Coming Soon</div>}
      />
    </Route>

    {/* reception routes - for backward compatibility */}
    <Route
      path="/reception"
      element={
        <ProtectedRoute allowedRoles={["reception", "receptionist"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<ReceptionHome />} />
      <Route path="home" element={<ReceptionHome />} />
      <Route path="rooms" element={<ReceptionRoomBooking />} />
      <Route path="roomBooking" element={<ReceptionRoomBooking />} />
      <Route path="bookings" element={<BookingsListPage />} />
      <Route path="bookingsList" element={<BookingsListPage />} />
      <Route path="bookings/:id" element={<BookingDetailsPage />} />
      <Route
        path="bookings/:id/edit"
        element={<div>Edit Booking Page - Coming Soon</div>}
      />
      <Route path="calendar" element={<BookingCalendar />} />
      <Route path="confirmation" element={<ConfirmationPage />} />
      <Route path="pool-booking" element={<PoolBooking />} />
      <Route path="pool-bookings" element={<BookingsList />} />
      <Route path="pool-schedules" element={<BookingsList />} />
      <Route path="pools" element={<ManagePools />} />
      <Route
        path="profile"
        element={<div>Profile Page - Coming Soon</div>}
      />
    </Route>
  </Routes>
</div>
  );
};

export default App;
