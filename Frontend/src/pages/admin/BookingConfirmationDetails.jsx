import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, FileText, Download, Clock } from "lucide-react";
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Chip
} from "@mui/material";

const BookingDetail = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/pending/${id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch booking details');
      }
      
      const data = await res.json();
      setBooking(data);
    } catch (err) {
      console.error('Fetch error:', err);
      enqueueSnackbar(err.message, { variant: 'error' });
      navigate('/admin/bookingNotifications');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async () => {
    try {
      setActionLoading(true);
      const url = `${API_BASE_URL}/api/admin/bookings/${id}/${actionType}`;
      
      const options = {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };
  
      // Only add body for reject action
      if (actionType === 'reject') {
        options.body = JSON.stringify({ reason: rejectionReason });
      }
  
      const res = await fetch(url, options);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${actionType} booking`);
      }
  
      const data = await res.json();
      enqueueSnackbar(`Booking ${actionType}d successfully`, { variant: 'success' });
      navigate('/admin/bookingNotifications');
    } catch (err) {
      console.error('Action error:', err);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setActionLoading(false);
      setActionDialogOpen(false);
    }
  };
  

  const viewDocument = () => {
    if (!booking?.document) {
      enqueueSnackbar('No document available', { variant: 'warning' });
      return;
    }
    window.open(`${API_BASE_URL}/uploads/${booking.document}`, '_blank');
  };

  const downloadDocument = () => {
    if (!booking?.document) {
      enqueueSnackbar('No document available', { variant: 'warning' });
      return;
    }
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/uploads/${booking.document}`;
    link.setAttribute('download', `document-${booking._id}${booking.document.includes('.pdf') ? '.pdf' : '.jpg'}`);
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
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl text-gray-700">Booking not found</p>
        <button 
          onClick={() => navigate('/admin/bookingNotifications')}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    confirmed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4" /> },
    rejected: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => navigate('/admin/bookingNotifications')}
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
                Booking #{booking._id.substring(18, 24).toUpperCase()}
              </h1>
              <div className="flex items-center mt-2 gap-2">
                <Chip
                  label={booking.status}
                  icon={statusConfig[booking.status]?.icon}
                  className={`${statusConfig[booking.status]?.color} capitalize`}
                  size="small"
                />
                <span className="text-sm text-gray-500">
                  Created: {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            {booking.status === 'pending' && (
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
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold">{booking.fullName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-lg">{booking.phoneNumber}</p>
                </div>
                {booking.whatsappNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                    <p className="text-lg">{booking.whatsappNumber}</p>
                  </div>
                )}
              </div>
              
              {booking.nicNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">NIC Number</p>
                  <p className="text-lg">{booking.nicNumber}</p>
                </div>
              )}
              
              {booking.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{booking.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Booking Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Room Number</p>
                  <p className="text-lg font-semibold">{booking.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Room Type</p>
                  <p className="text-lg capitalize">{booking.roomType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-In</p>
                  <p className="text-lg">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-Out</p>
                  <p className="text-lg">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Adults</p>
                  <p className="text-lg">{booking.adults}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Children</p>
                  <p className="text-lg">{booking.children || 0}</p>
                </div>
              </div>
              
              {booking.specialRequests && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Special Requests</p>
                  <p className="text-lg italic text-gray-700">
                    "{booking.specialRequests}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Section */}
        {booking.document && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Guest Document
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={viewDocument}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>View Document</span>
              </button>
              <button
                onClick={downloadDocument}
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
              `Are you sure you want to approve this booking for ${booking.fullName}?`
            ) : (
              <div className="space-y-4">
                <p>Are you sure you want to reject this booking for {booking.fullName}?</p>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
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
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BookingDetail;