import React from "react";

const EventDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Event Details - {event.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{event.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-medium">{event.eventType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hall</p>
                    <p className="font-medium">{event.hall}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">No of Guests</p>
                    <p className="font-medium">{event.noOfGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-In</p>
                    <p className="font-medium">{formatDate(event.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-Out</p>
                    <p className="font-medium">{formatDate(event.checkOut)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Primary Phone</p>
                    <p className="font-medium">{event.phone1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Secondary Phone</p>
                    <p className="font-medium">{event.phone2 || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{event.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {event.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">
                    Notes
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.notes}</p>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Food Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">
                  Food Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Unit</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2 text-right">Rate</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.tableData.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2">{item.unit}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">
                            Rs. {item.rate.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            Rs. {item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Extra Items */}
              {event.extraFields && event.extraFields.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">
                    Extra Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left">Description</th>
                          <th className="px-4 py-2 text-right">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.extraFields.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2 text-right">
                              Rs. {item.rate?.toFixed(2) ?? "0.00"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      Rs. {event.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Charge (10%):</span>
                    <span className="font-medium">
                      Rs. {event.serviceCharge.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extra Amount:</span>
                    <span className="font-medium">
                      Rs. {event.extraAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-lg font-semibold text-gray-800">
                      Grand Total:
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      Rs. {event.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal; 