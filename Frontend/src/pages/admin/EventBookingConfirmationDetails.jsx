import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";
import { useSnackbar } from "notistack";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";

const EventBookingDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/bookings/events/pending/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch event details");
      }

      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error("Fetch error:", err);
      enqueueSnackbar(err.message, { variant: "error" });
      navigate("/admin/bookingNotifications");
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async () => {
    try {
      setActionLoading(true);
      const url = `${API_BASE_URL}/admin/bookings/events/${id}/${actionType}`;

      const options = {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      };

      // Only add body for reject action
      if (actionType === "reject") {
        options.body = JSON.stringify({ reason: rejectionReason });
      }

      const res = await fetch(url, options);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${actionType} event`);
      }

      const data = await res.json();
      const emailMessage = actionType === "approve" 
        ? "Event approved successfully! Customer has been notified via email (check spam folder if not received)." 
        : "Event rejected successfully! Customer has been notified via email (check spam folder if not received).";
      
      enqueueSnackbar(emailMessage, {
        variant: "success",
      });
      navigate("/admin/bookingNotifications");
    } catch (err) {
      console.error("Action error:", err);
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setActionLoading(false);
      setActionDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <CircularProgress size={60} />
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl text-gray-700">Event not found</p>
        <button
          onClick={() => navigate("/admin/bookingNotifications")}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="w-4 h-4" />,
    },
    confirmed: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button
        onClick={() => navigate("/admin/bookingNotifications")}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Bookings</span>
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {event.eventId || `Event #${event._id.substring(18, 24).toUpperCase()}`}
              </h1>
              <div className="flex items-center mt-2 gap-2">
                <Chip
                  label={event.status || 'pending'}
                  icon={statusConfig[event.status || 'pending']?.icon}
                  className={`${
                    statusConfig[event.status || 'pending']?.color
                  } capitalize`}
                  size="small"
                />
                <span className="text-sm text-gray-500">
                  Created: {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {(!event.status || event.status === "pending") && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActionType("approve");
                    setActionDialogOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={actionLoading}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    setActionType("reject");
                    setActionDialogOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={actionLoading}
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Contact Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Name</p>
                <p className="text-lg font-semibold">{event.name || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Primary Phone
                  </p>
                  <p className="text-lg">{event.phone1 || "N/A"}</p>
                </div>
                {event.phone2 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Secondary Phone
                    </p>
                    <p className="text-lg">{event.phone2}</p>
                  </div>
                )}
              </div>

              {event.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{event.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Event Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Type</p>
                  <p className="text-lg font-semibold">{event.eventType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hall</p>
                  <p className="text-lg">{event.hall || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-In</p>
                  <p className="text-lg">
                    {event.checkIn ? new Date(event.checkIn).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-Out</p>
                  <p className="text-lg">
                    {event.checkOut ? new Date(event.checkOut).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Number of Guests</p>
                <p className="text-lg">{event.noOfGuests || 0}</p>
              </div>

              {event.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Special Notes
                  </p>
                  <p className="text-lg italic text-gray-700">
                    "{event.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Details */}
        {(event.totalAmount || event.grandTotal) && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Financial Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.totalAmount && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-800">
                    LKR {event.totalAmount.toFixed(2)}
                  </p>
                </div>
              )}
              {event.serviceCharge && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Service Charge</p>
                  <p className="text-xl font-bold text-gray-800">
                    LKR {event.serviceCharge.toFixed(2)}
                  </p>
                </div>
              )}
              {event.grandTotal && (
                <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm font-medium text-gray-500">Grand Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    LKR {event.grandTotal.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Data */}
        {event.tableData && event.tableData.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Event Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Unit</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {event.tableData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{item.category || "-"}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.description || "-"}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.unit || "-"}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity || 0}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">LKR {(item.rate || 0).toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">LKR {(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => !actionLoading && setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-gray-50">
          Confirm {actionType === "approve" ? "Approval" : "Rejection"}
        </DialogTitle>
        <DialogContent className="py-4">
          <DialogContentText>
            {actionType === "approve" ? (
              `Are you sure you want to approve this event for ${event.name}?`
            ) : (
              <div className="space-y-4">
                <p>
                  Are you sure you want to reject this event for{" "}
                  {event.name}?
                </p>
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reason for rejection (optional):
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </div>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="bg-gray-50 px-6 py-4">
          <Button
            onClick={() => setActionDialogOpen(false)}
            disabled={actionLoading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEventAction}
            color={actionType === "approve" ? "success" : "error"}
            disabled={actionLoading}
            variant="contained"
            startIcon={
              actionLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {actionLoading ? "Processing..." : `Confirm ${actionType}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventBookingDetail;
