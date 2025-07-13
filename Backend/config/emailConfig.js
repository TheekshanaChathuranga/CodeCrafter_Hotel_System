import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail',
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    // Skip email sending in development mode
    if (process.env.NODE_ENV?.toLowerCase() === 'development') {
      console.log('\n' + '='.repeat(80));
      console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`User: ${userName || 'User'}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log('='.repeat(80) + '\n');
      
      return { success: true, emailSent: false, development: true };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
    from: {
      name: 'Hotel Management System',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Password Reset Request - Hotel Management System',
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
      console.error('Email sending failed:', error.message);
      
      // Return success anyway since the token is generated and saved
      return { 
        success: true, 
        emailSent: false, 
        message: 'Password reset token generated but email failed to send.'
      };
    }
  } catch (connectionError) {
    console.error('Password reset error:', connectionError);
    return { 
      success: false, 
      error: 'Failed to generate password reset token'
    };
  }
};

export default { sendPasswordResetEmail };
