# SMTP Password Reset Setup Instructions

## Gmail SMTP Configuration

To use the forgot password functionality, you need to configure Gmail SMTP credentials in your `.env` file.

### Step 1: Enable 2-Factor Authentication on Your Gmail Account

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password

1. In the same Security section, look for "App passwords"
2. Click on "App passwords" (you may need to sign in again)
3. Select "Mail" as the app and your device
4. Google will generate a 16-character app password
5. Copy this password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables

Open `Backend/.env` and update these values:

```env
# Replace with your Gmail address
EMAIL_USER=your-actual-email@gmail.com

# Replace with the 16-character app password from Step 2
EMAIL_PASS=abcdefghijklmnop

# Update if your frontend runs on a different port
FRONTEND_URL=http://localhost:5173
```

### Step 4: Test the Configuration

1. Start the backend server: `npm run dev` (in Backend folder)
2. Start the frontend server: `npm run dev` (in Frontend folder)
3. Go to http://localhost:5173/forgot-password
4. Enter a valid email address that exists in your database
5. Check the email inbox for the password reset email

## Security Notes

- **Never commit your actual email credentials to version control**
- App passwords are more secure than your regular Gmail password
- The reset tokens expire after 1 hour for security
- Each reset token can only be used once

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**
   - Make sure 2FA is enabled on your Gmail account
   - Use app password, not your regular Gmail password
   - Double-check the EMAIL_USER and EMAIL_PASS values

2. **"Connection timeout"**
   - Check your internet connection
   - Some corporate networks block SMTP ports
   - Try using a different network

3. **"User not found"**
   - Make sure the email exists in your database
   - Check the User collection in MongoDB

4. **Email not received**
   - Check spam/junk folder
   - Verify the email address is correct
   - Check server logs for error messages

## API Endpoints

The password reset system provides these endpoints:

- `POST /api/auth/forgot-password` - Send reset email
- `GET /api/auth/verify-reset-token/:token` - Verify token validity
- `POST /api/auth/reset-password/:token` - Reset password with token

## Frontend Routes

- `/forgot-password` - Request password reset
- `/reset-password/:token` - Reset password form
