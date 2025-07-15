import nodemailer from "nodemailer";

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    // Skip email sending in development mode
    if (process.env.NODE_ENV?.toLowerCase() === "development") {
      console.log("\n" + "=".repeat(80));
      console.log("📧 PASSWORD RESET EMAIL (Development Mode)");
      console.log("=".repeat(80));
      console.log(`To: ${email}`);
      console.log(`User: ${userName || "User"}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log("=".repeat(80) + "\n");

      return { success: true, emailSent: false, development: true };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Hotel Management System",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Reset Request - Hotel Management System",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2C3E50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            background-color: #16A085; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Hotel Management System account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #16A085;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Hotel Management System Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, emailSent: true };
    } catch (error) {
      console.error("Email sending failed:", error.message);

      // Return success anyway since the token is generated and saved
      return {
        success: true,
        emailSent: false,
        message: "Password reset token generated but email failed to send.",
      };
    }
  } catch (connectionError) {
    console.error("Password reset error:", connectionError);
    return {
      success: false,
      error: "Failed to generate password reset token",
    };
  }
};

// Send booking approval email
export const sendBookingApprovalEmail = async (
  email,
  userName,
  bookingDetails
) => {
  try {
    // Skip email sending in development mode
    if (
      process.env.NODE_ENV?.toLowerCase() === "development" ||
      !process.env.EMAIL_USER
    ) {
      console.log(
        "⚠️  EMAIL NOT SENT - Development mode or EMAIL_USER not configured"
      );
      return { success: true, emailSent: false, development: true };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Hotel Management System",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "✅ Booking Approved - Hotel Management System",
      replyTo: process.env.EMAIL_USER,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #27AE60; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .success-badge { 
              background-color: #27AE60; 
              color: white; 
              padding: 8px 16px; 
              border-radius: 20px; 
              display: inline-block;
              margin: 10px 0;
            }
            .booking-details { 
              background-color: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #27AE60;
            }
            .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Approved!</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <div class="success-badge">✅ APPROVED</div>
              <p>Great news! Your ${
                bookingDetails.type || "room"
              } booking has been approved.</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
                <p><strong>Type:</strong> ${
                  bookingDetails.type || "Room Booking"
                }</p>
                ${
                  bookingDetails.roomNumber
                    ? `<p><strong>Room:</strong> ${bookingDetails.roomNumber}</p>`
                    : ""
                }
                ${
                  bookingDetails.checkIn
                    ? `<p><strong>Check-in:</strong> ${new Date(
                        bookingDetails.checkIn
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                ${
                  bookingDetails.checkOut
                    ? `<p><strong>Check-out:</strong> ${new Date(
                        bookingDetails.checkOut
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                ${
                  bookingDetails.date
                    ? `<p><strong>Date:</strong> ${new Date(
                        bookingDetails.date
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                ${
                  bookingDetails.eventType
                    ? `<p><strong>Event Type:</strong> ${bookingDetails.eventType}</p>`
                    : ""
                }
              </div>
              
              <p>Please save this email for your records. We look forward to serving you!</p>
              <p>If you have any questions, please contact our team.</p>
              <p>Best regards,<br>Hotel Management System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, emailSent: true };
    } catch (error) {
      console.error("Approval email sending failed:", error.message);
      return {
        success: true,
        emailSent: false,
        message: "Booking approved but email failed to send.",
      };
    }
  } catch (error) {
    console.error("Booking approval email error:", error);
    return {
      success: false,
      error: "Failed to send approval email",
    };
  }
};

// Send booking rejection email
export const sendBookingRejectionEmail = async (
  email,
  userName,
  bookingDetails,
  rejectionReason
) => {
  try {
    // Skip email sending in development mode
    if (
      process.env.NODE_ENV?.toLowerCase() === "development" ||
      !process.env.EMAIL_USER
    ) {
      console.log(
        "⚠️  EMAIL NOT SENT - Development mode or EMAIL_USER not configured"
      );
      return { success: true, emailSent: false, development: true };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Hotel Management System",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "❌ Booking Update - Hotel Management System",
      replyTo: process.env.EMAIL_USER,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #E74C3C; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .rejection-badge { 
              background-color: #E74C3C; 
              color: white; 
              padding: 8px 16px; 
              border-radius: 20px; 
              display: inline-block;
              margin: 10px 0;
            }
            .booking-details { 
              background-color: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #E74C3C;
            }
            .reason-box { 
              background-color: #fdf2f2; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 15px 0;
              border: 1px solid #E74C3C;
            }
            .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Update</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <div class="rejection-badge">❌ NOT APPROVED</div>
              <p>We regret to inform you that your ${
                bookingDetails.type || "room"
              } booking could not be approved at this time.</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
                <p><strong>Type:</strong> ${
                  bookingDetails.type || "Room Booking"
                }</p>
                ${
                  bookingDetails.roomNumber
                    ? `<p><strong>Room:</strong> ${bookingDetails.roomNumber}</p>`
                    : ""
                }
                ${
                  bookingDetails.checkIn
                    ? `<p><strong>Check-in:</strong> ${new Date(
                        bookingDetails.checkIn
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                ${
                  bookingDetails.checkOut
                    ? `<p><strong>Check-out:</strong> ${new Date(
                        bookingDetails.checkOut
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                ${
                  bookingDetails.date
                    ? `<p><strong>Date:</strong> ${new Date(
                        bookingDetails.date
                      ).toLocaleDateString()}</p>`
                    : ""
                }
                ${
                  bookingDetails.eventType
                    ? `<p><strong>Event Type:</strong> ${bookingDetails.eventType}</p>`
                    : ""
                }
              </div>
              
              ${
                rejectionReason
                  ? `
                <div class="reason-box">
                  <h4>Reason:</h4>
                  <p>${rejectionReason}</p>
                </div>
              `
                  : ""
              }
              
              <p>We apologize for any inconvenience. Please feel free to contact us if you have any questions or would like to make alternative arrangements.</p>
              <p>Thank you for your understanding.</p>
              <p>Best regards,<br>Hotel Management System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, emailSent: true };
    } catch (error) {
      console.error("Rejection email sending failed:", error.message);
      return {
        success: true,
        emailSent: false,
        message: "Booking rejected but email failed to send.",
      };
    }
  } catch (error) {
    console.error("Booking rejection email error:", error);
    return {
      success: false,
      error: "Failed to send rejection email",
    };
  }
};

export default {
  sendPasswordResetEmail,
  sendBookingApprovalEmail,
  sendBookingRejectionEmail,
};
