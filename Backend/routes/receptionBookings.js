import express from "express";
import ReceptionBooking from "../models/ReceptionBooking.js";
import OnlineBooking from "../models/Booking.js";

const router = express.Router();

// Create new booking
router.post("/", async (req, res) => {
  try {
    console.log(
      "Reception booking request received:",
      JSON.stringify(req.body, null, 2)
    );

    // Validate required fields
    if (!req.body.adminDetails) {
      return res.status(400).json({ error: "adminDetails is required" });
    }

    if (!req.body.selectedRoom) {
      return res.status(400).json({ error: "selectedRoom is required" });
    }

    if (!req.body.paymentDetails) {
      return res.status(400).json({ error: "paymentDetails is required" });
    }

    // Validate required nested fields
    const {
      adminDetails,
      selectedRoom,
      selectedRoomType,
      packageType,
      dayNightType,
      additionalNote,
      paymentDetails,
    } = req.body;

    if (!adminDetails.name) {
      return res.status(400).json({ error: "Guest name is required" });
    }

    if (!adminDetails.mobile) {
      return res.status(400).json({ error: "Guest mobile is required" });
    }

    if (!adminDetails.checkIn) {
      return res.status(400).json({ error: "Check-in date is required" });
    }

    if (!adminDetails.checkOut) {
      return res.status(400).json({ error: "Check-out date is required" });
    }

    if (!selectedRoom.roomNumber) {
      return res.status(400).json({ error: "Room number is required" });
    }

    if (!selectedRoomType) {
      return res.status(400).json({ error: "Room type is required" });
    }

    if (!selectedRoom.acType) {
      return res.status(400).json({ error: "AC type is required" });
    }

    if (!packageType) {
      return res.status(400).json({ error: "Package type is required" });
    }

    if (!paymentDetails.paymentType) {
      return res.status(400).json({ error: "Payment type is required" });
    }

    if (
      paymentDetails.totalAmount === undefined ||
      paymentDetails.totalAmount === null
    ) {
      return res.status(400).json({ error: "Total amount is required" });
    }

    const booking = new ReceptionBooking({
      guestDetails: {
        name: adminDetails.name,
        mobile: adminDetails.mobile,
        email: adminDetails.email,
        whatsapp: adminDetails.whatsapp,
      },
      bookingDetails: {
        checkIn: adminDetails.checkIn,
        checkOut: adminDetails.checkOut,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoomType,
        acType: selectedRoom.acType,
        packageType: packageType,
        dayNightType: dayNightType || null,
        additionalNote: additionalNote || null,
      },
      paymentDetails: {
        paymentType: paymentDetails.paymentType,
        advanceAmount: paymentDetails.advanceAmount || 0,
        remainingAmount: paymentDetails.remainingAmount || 0,
        totalAmount: paymentDetails.totalAmount,
      },
    });

    await booking.save();
    console.log("Booking created successfully:", booking._id, "with ID:", booking.bookingId);
    res.status(201).json({ 
      message: "Booking created successfully", 
      booking,
      bookingId: booking.bookingId 
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
        message: validationErrors.join(", "),
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Get all bookings (both reception and online bookings)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    
    // Build search query for reception bookings
    let receptionQuery = {};
    if (search) {
      receptionQuery = {
        $or: [
          { bookingId: { $regex: search, $options: 'i' } },
          { 'guestDetails.name': { $regex: search, $options: 'i' } },
          { 'guestDetails.mobile': { $regex: search, $options: 'i' } },
          { 'bookingDetails.roomNumber': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get reception bookings with search
    const receptionBookings = await ReceptionBooking.find(receptionQuery)
      .sort({ createdAt: -1 })
      .lean();

    // Build search query for online bookings
    let onlineQuery = {};
    if (search) {
      onlineQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          { roomNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get online bookings with search
    const onlineBookings = await OnlineBooking.find(onlineQuery)
      .sort({ createdAt: -1 })
      .lean();

    // Transform online bookings to match reception booking structure
    const transformedOnlineBookings = onlineBookings.map((booking) => ({
      _id: booking._id,
      guestDetails: {
        name: booking.fullName,
        mobile: booking.phoneNumber,
        email: booking.email || null,
        whatsapp: booking.whatsappNumber || null,
      },
      bookingDetails: {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomNumber: booking.roomNumber,
        roomType: booking.roomType,
        acType: "AC", // Default for online bookings
        packageType: "room-only", // Default for online bookings
      },
      paymentDetails: {
        paymentType: "pending",
        advanceAmount: 0,
        remainingAmount: 0,
        totalAmount: 0,
      },
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      bookingType: "online", // Mark as online booking
      originalData: booking, // Keep original data for reference
    }));

    // Mark reception bookings
    const markedReceptionBookings = receptionBookings.map((booking) => ({
      ...booking,
      bookingType: "reception",
    }));

    // Combine and sort by creation date
    const allBookings = [
      ...markedReceptionBookings,
      ...transformedOnlineBookings,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single booking (handle both types)
router.get("/:id", async (req, res) => {
  try {
    let booking = await ReceptionBooking.findById(req.params.id).lean();
    let bookingType = "reception";

    // If not found in reception bookings, try online bookings
    if (!booking) {
      booking = await OnlineBooking.findById(req.params.id).lean();
      if (booking) {
        bookingType = "online";
        // Transform online booking to reception booking structure
        booking = {
          _id: booking._id,
          guestDetails: {
            name: booking.fullName,
            mobile: booking.phoneNumber,
            email: booking.email || null,
            whatsapp: booking.whatsappNumber || null,
          },
          bookingDetails: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomNumber: booking.roomNumber,
            roomType: booking.roomType,
            acType: "AC", // Default for online bookings
            packageType: "room-only", // Default for online bookings
            additionalNote: booking.specialRequests || null,
          },
          paymentDetails: {
            paymentType: "pending",
            advanceAmount: 0,
            remainingAmount: 0,
            totalAmount: 0,
          },
          status: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          bookingType: "online",
          originalData: {
            nicNumber: booking.nicNumber,
            adults: booking.adults,
            children: booking.children,
            specialRequests: booking.specialRequests,
            document: booking.documentPath,
          },
          // Add direct fields for compatibility
          fullName: booking.fullName,
          phoneNumber: booking.phoneNumber,
          roomNumber: booking.roomNumber,
          roomType: booking.roomType,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nicNumber: booking.nicNumber,
          adults: booking.adults,
          children: booking.children,
          specialRequests: booking.specialRequests,
          documentPath: booking.documentPath,
        };
      }
    } else {
      booking.bookingType = "reception";
    }

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update booking status (handle both types)
router.patch("/:id", async (req, res) => {
  try {
    let booking = await ReceptionBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    // If not found in reception bookings, try online bookings
    if (!booking) {
      booking = await OnlineBooking.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (booking) {
        // Transform back to reception booking structure for response
        booking = {
          _id: booking._id,
          guestDetails: {
            name: booking.fullName,
            mobile: booking.phoneNumber,
            email: booking.email || null,
            whatsapp: booking.whatsappNumber || null,
          },
          bookingDetails: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomNumber: booking.roomNumber,
            roomType: booking.roomType,
            acType: "AC",
            packageType: "room-only",
            additionalNote: booking.specialRequests || null,
          },
          paymentDetails: {
            paymentType: "pending",
            advanceAmount: 0,
            remainingAmount: 0,
            totalAmount: 0,
          },
          status: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          bookingType: "online",
          originalData: {
            nicNumber: booking.nicNumber,
            adults: booking.adults,
            children: booking.children,
            specialRequests: booking.specialRequests,
            document: booking.documentPath,
          },
          // Add direct fields for compatibility
          fullName: booking.fullName,
          phoneNumber: booking.phoneNumber,
          roomNumber: booking.roomNumber,
          roomType: booking.roomType,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nicNumber: booking.nicNumber,
          adults: booking.adults,
          children: booking.children,
          specialRequests: booking.specialRequests,
          documentPath: booking.documentPath,
        };
      }
    } else {
      booking.bookingType = "reception";
    }

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete booking (handle both types)
router.delete("/:id", async (req, res) => {
  try {
    let booking = await ReceptionBooking.findByIdAndDelete(req.params.id);

    // If not found in reception bookings, try online bookings
    if (!booking) {
      booking = await OnlineBooking.findByIdAndDelete(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update booking
router.put("/:id", async (req, res) => {
  try {
    console.log('=== PUT REQUEST RECEIVED ===');
    console.log('PUT request received for booking ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      adminDetails,
      selectedRoom,
      selectedRoomType,
      packageType,
      dayNightType,
      additionalNote,
      paymentDetails,
    } = req.body;

    const updateData = {
      guestDetails: {
        name: adminDetails.name,
        mobile: adminDetails.mobile,
        email: adminDetails.email,
        whatsapp: adminDetails.whatsapp,
      },
      bookingDetails: {
        checkIn: adminDetails.checkIn,
        checkOut: adminDetails.checkOut,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoomType,
        acType: selectedRoom.acType,
        packageType: packageType,
        dayNightType: dayNightType || null,
        additionalNote: additionalNote || null,
      },
      paymentDetails: {
        paymentType: paymentDetails.paymentType,
        advanceAmount: paymentDetails.advanceAmount || 0,
        remainingAmount: paymentDetails.remainingAmount || 0,
        totalAmount: paymentDetails.totalAmount,
      },
      updatedAt: new Date(),
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    // First try to find in ReceptionBooking collection
    let booking = await ReceptionBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    let bookingType = "reception";

    // If not found in reception bookings, try online bookings collection
    if (!booking) {
      console.log('Booking not found in ReceptionBooking, checking OnlineBooking...');
      
      // For online bookings, we need to update the original fields
      const onlineUpdateData = {
        fullName: adminDetails.name,
        phoneNumber: adminDetails.mobile,
        email: adminDetails.email,
        whatsappNumber: adminDetails.whatsapp,
        checkIn: adminDetails.checkIn,
        checkOut: adminDetails.checkOut,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoomType,
        specialRequests: additionalNote || null, // Update specialRequests field
        updatedAt: new Date(),
      };

      booking = await OnlineBooking.findByIdAndUpdate(
        req.params.id,
        onlineUpdateData,
        { new: true, runValidators: true }
      );

      if (booking) {
        bookingType = "online";
        console.log('Updated online booking successfully');
        
        // Transform back to reception booking structure for response
        booking = {
          _id: booking._id,
          guestDetails: {
            name: booking.fullName,
            mobile: booking.phoneNumber,
            email: booking.email || null,
            whatsapp: booking.whatsappNumber || null,
          },
          bookingDetails: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomNumber: booking.roomNumber,
            roomType: booking.roomType,
            acType: selectedRoom.acType,
            packageType: packageType,
            dayNightType: dayNightType || null,
            additionalNote: booking.specialRequests || null, // Use the updated specialRequests
          },
          paymentDetails: {
            paymentType: paymentDetails.paymentType,
            advanceAmount: paymentDetails.advanceAmount || 0,
            remainingAmount: paymentDetails.remainingAmount || 0,
            totalAmount: paymentDetails.totalAmount,
          },
          status: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          bookingType: "online",
          originalData: {
            nicNumber: booking.nicNumber,
            adults: booking.adults,
            children: booking.children,
            specialRequests: booking.specialRequests,
            document: booking.documentPath,
          },
          // Add direct fields for compatibility
          fullName: booking.fullName,
          phoneNumber: booking.phoneNumber,
          roomNumber: booking.roomNumber,
          roomType: booking.roomType,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nicNumber: booking.nicNumber,
          adults: booking.adults,
          children: booking.children,
          specialRequests: booking.specialRequests,
          documentPath: booking.documentPath,
        };
      }
    }

    if (!booking) {
      console.log('Booking not found with ID:', req.params.id);
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log('Successfully updated booking:', booking._id, 'Type:', bookingType);
    res.json({
      message: "Booking updated successfully",
      booking: booking,
      bookingType: bookingType,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Update booking status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["confirmed", "cancelled", "checked-in", "checked-out", "no-show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status",
        validStatuses: validStatuses 
      });
    }

    const booking = await ReceptionBooking.findByIdAndUpdate(
      req.params.id,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      message: "Booking status updated successfully",
      booking: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

export default router;
