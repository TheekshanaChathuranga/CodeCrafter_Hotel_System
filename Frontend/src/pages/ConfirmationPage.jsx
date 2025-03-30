import React from "react";
import { useLocation } from "react-router-dom";

const ConfirmationPage = () => {
  const { state } = useLocation();

  return (
    <div className="container mx-auto p-5">
      <h2 className="text-2xl font-bold mb-4">Booking Confirmation</h2>
      <div className="bg-green-100 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold">Booking Successful</h3>
        <p className="mt-2">Thank you for your booking, {state?.adminDetails?.name}!</p>
        <div className="mt-4">
          <h4 className="font-semibold">Booking Details:</h4>
          <p>Name: {state?.adminDetails?.name}</p>
          <p>Mobile: {state?.adminDetails?.mobile}</p>
          <p>Check-in: {state?.adminDetails?.checkIn}</p>
          <p>Check-out: {state?.adminDetails?.checkOut}</p>
          <p>Arrival Date: {state?.adminDetails?.arrivalDate}</p>

          <h4 className="font-semibold mt-4">Room Details:</h4>
          {state?.selectedRooms?.map((room) => (
            <div key={room.id}>
              <p>Room Type: {room.type}</p>
              <p>AC Type: {room.acType}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
