import React from 'react';
import { useLocation } from 'react-router-dom';

const ConfirmationPage = () => {
  const { state } = useLocation();
  const { adminDetails, selectedRoom, acType, packageType, paymentDetails, bookingId } = state || {};

  if (!state) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Booking Found</h2>
          <p className="text-gray-700">It seems you arrived here directly without completing a booking.</p>
          <a href="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Booking Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-green-600 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">Booking Confirmed!</h2>
          <p className="text-center mt-2">Your booking ID: {bookingId}</p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-green-700">Booking Summary</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Guest Information</h4>
                  <p><span className="text-gray-600">Name:</span> {adminDetails.name}</p>
                  <p><span className="text-gray-600">Mobile:</span> {adminDetails.mobile}</p>
                  {adminDetails.email && <p><span className="text-gray-600">Email:</span> {adminDetails.email}</p>}
                  {adminDetails.whatsapp && <p><span className="text-gray-600">WhatsApp:</span> {adminDetails.whatsapp}</p>}
                </div>

                <div>
                  <h4 className="font-medium text-green-700 mb-2">Booking Details</h4>
                  <p><span className="text-gray-600">Check-in:</span> {new Date(adminDetails.checkIn).toLocaleString()}</p>
                  <p><span className="text-gray-600">Check-out:</span> {new Date(adminDetails.checkOut).toLocaleString()}</p>
                  <p><span className="text-gray-600">Room No:</span> {selectedRoom}</p>
                  <p><span className="text-gray-600">AC Type:</span> {acType}</p>
                  <p><span className="text-gray-600">Package:</span> {packageType.toUpperCase()}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-green-700 mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="text-gray-600">Payment Type:</span> {paymentDetails.paymentType === 'full' ? 'Full Payment' : paymentDetails.paymentType === 'advance' ? 'Advance Payment' : 'Pay at Hotel'}</p>
                    {paymentDetails.advanceAmount > 0 && (
                      <p><span className="text-gray-600">Advance Paid:</span> ₹{paymentDetails.advanceAmount}</p>
                    )}
                  </div>
                  <div>
                    <p><span className="text-gray-600">Total Amount:</span> ₹{paymentDetails.totalAmount}</p>
                    {paymentDetails.paymentType === 'advance' && (
                      <p><span className="text-gray-600">Remaining Amount:</span> ₹{paymentDetails.remainingAmount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please present this booking ID at the hotel reception during check-in. 
                  {paymentDetails.remainingAmount > 0 && ` The remaining amount of ₹${paymentDetails.remainingAmount} should be paid at the hotel.`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <a 
              href="/" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Make Another Booking
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;