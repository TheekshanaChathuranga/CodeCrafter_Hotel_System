import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Clock,
  FileText,
  Download,
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

const PoolBookingDetail = () => {
  const [booking, setBooking] = useState(null);
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

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/bookings/pool/pending/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch pool booking details");
      }

      const data = await res.json();
      setBooking(data);
    } catch (err) {
      console.error("Fetch error:", err);
      enqueueSnackbar(err.message, { variant: "error" });
      navigate("/admin/bookingNotifications");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async () => {
    try {
      setActionLoading(true);
      const url = `${API_BASE_URL}/admin/bookings/pool/${id}/${actionType}`;

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
        throw new Error(errorData.error || `Failed to ${actionType} pool booking`);
      }

      const data = await res.json();
      const emailMessage = actionType === "approve" 
        ? "Pool booking approved successfully! Customer has been notified via email (check spam folder if not received)." 
        : "Pool booking rejected successfully! Customer has been notified via email (check spam folder if not received).";
      
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

  const viewReceipt = () => {
    if (!booking?.paymentProof) {
      enqueueSnackbar("No payment proof available", { variant: "warning" });
      return;
    }
    // Remove leading slash from paymentProof if it exists to avoid double slashes
    const cleanPath = booking.paymentProof.startsWith('/') 
      ? booking.paymentProof.substring(1) 
      : booking.paymentProof;
    window.open(`${API_BASE_URL}/${cleanPath}`, "_blank");
  };

  const downloadReceipt = () => {
    if (!booking?.paymentProof) {
      enqueueSnackbar("No payment proof available", { variant: "warning" });
      return;
    }
    // Remove leading slash from paymentProof if it exists to avoid double slashes
    const cleanPath = booking.paymentProof.startsWith('/') 
      ? booking.paymentProof.substring(1) 
      : booking.paymentProof;
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/${cleanPath}`;
    link.setAttribute(
      "download",
      `pool-payment-proof-${booking._id}${
        booking.paymentProof.includes(".pdf") ? ".pdf" : ".jpg"
      }`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <CircularProgress size={60} />
        <p className="text-gray-600">Loading pool booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl text-gray-700">Pool booking not found</p>
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

  const guestName = booking.fullName || booking.name || "N/A";
  const phone = booking.phoneNumber || booking.phone || "N/A";
  const email = booking.email || "N/A";
  const bookingDate = booking.date || booking.checkIn;
  const guestCount = booking.guestCount || booking.peopleCount || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                Pool Booking #{booking._id.substring(18, 24).toUpperCase()}
              </h1>
              <div className="flex items-center mt-2 gap-2">
                <Chip
                  label={booking.status || 'pending'}
                  icon={statusConfig[booking.status || 'pending']?.icon}
                  className={`${
                    statusConfig[booking.status || 'pending']?.color
                  } capitalize`}
                  size="small"
                />
                <span className="text-sm text-gray-500">
                  Created: {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {(!booking.status || booking.status === "pending") && (
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
          {/* Guest Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Guest Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Guest Name</p>
                <p className="text-lg font-semibold">{guestName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-lg">{phone}</p>
              </div>

              {email !== "N/A" && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Pool Booking Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Booking Date</p>
                <p className="text-lg font-semibold">
                  {bookingDate ? new Date(bookingDate).toLocaleDateString() : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Number of Guests</p>
                <p className="text-lg">{guestCount}</p>
              </div>

              {booking.startTime && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Time</p>
                  <p className="text-lg">{booking.startTime}</p>
                </div>
              )}

              {booking.endTime && (
                <div>
                  <p className="text-sm font-medium text-gray-500">End Time</p>
                  <p className="text-lg">{booking.endTime}</p>
                </div>
              )}

              {booking.totalAmount && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    LKR {booking.totalAmount.toFixed(2)}
                  </p>
                </div>
              )}

              {booking.specialRequests && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Special Requests
                  </p>
                  <p className="text-lg italic text-gray-700">
                    "{booking.specialRequests}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Proof Section */}
        {booking.paymentProof && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Proof
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={viewReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>View Payment Proof</span>
              </button>
              <button
                onClick={downloadReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
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
              `Are you sure you want to approve this pool booking for ${guestName}?`
            ) : (
              <div className="space-y-4">
                <p>
                  Are you sure you want to reject this pool booking for{" "}
                  {guestName}?
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
            onClick={handleBookingAction}
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

export default PoolBookingDetail;
