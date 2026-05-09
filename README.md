# 🏨 The Lake Resort — Hotel Management System

A full-stack hotel management system built with **React** (Vite) and **Node.js/Express** with **MongoDB Atlas**. The system supports role-based access for Admins, Receptionists, and Customers with real-time notifications via Socket.IO.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Demo Login Credentials](#-demo-login-credentials)
- [Available Routes](#-available-routes)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration & login with JWT
- Role-based access control (Admin / Receptionist / Customer)
- Password reset via email (SMTP)
- Protected routes per role

### 🛏️ Room Management
- Add, edit, delete rooms (Admin)
- Room availability checking
- Room booking with date selection
- Booking approval/rejection workflow

### 🏊 Pool Management
- Pool listing and details
- Pool time-slot booking
- Pool schedule management

### 🎉 Event Booking
- Browse and book events
- Custom event creation
- Event booking confirmation

### 🍽️ Menu & Food
- Food menu browsing
- Menu item management (Admin)

### 👤 User Management
- Admin user dashboard (manage all users)
- Activate/deactivate user accounts
- User profile editing with photo upload

### 📊 Admin Dashboard
- Booking statistics overview
- Real-time notifications via WebSocket
- Booking confirmation management

### 🛎️ Receptionist Panel
- Room booking on behalf of guests
- Booking calendar view
- Manage walk-in reservations
- Pool booking management

### 📧 Email Notifications
- Booking approval/rejection emails
- Password reset emails
- Gmail SMTP integration

---

## 🛠️ Tech Stack

| Layer       | Technology                                              |
|-------------|--------------------------------------------------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Material UI, Framer Motion |
| **Backend**  | Node.js, Express.js, Socket.IO                         |
| **Database** | MongoDB Atlas (Mongoose ODM)                           |
| **Auth**     | JWT (jsonwebtoken), bcryptjs                           |
| **Email**    | Nodemailer (Gmail SMTP)                                |
| **Upload**   | Multer                                                 |

---

## 📁 Project Structure

```
CodeCrafter_Hotel_System/
├── Backend/
│   ├── config/          # Email configuration
│   ├── middleware/       # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route handlers
│   ├── socket/          # Socket.IO configuration
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
│
├── Frontend/
│   ├── src/
│   │   ├── api/         # API service functions
│   │   ├── components/  # Reusable UI components
│   │   ├── config/      # Axios instance
│   │   ├── context/     # Auth & Socket context providers
│   │   ├── layout/      # Dashboard layout
│   │   ├── pages/       # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── customer/       # Customer pages
│   │   │   └── Receptionist/   # Receptionist pages
│   │   ├── services/    # Event & food services
│   │   └── App.jsx      # Main router
│   └── .env             # Frontend env variables
│
└── README.md
```

---

## 📦 Prerequisites

- **Node.js** v18+ (tested on v22)
- **npm** v9+
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TheekshanaChathuranga/CodeCrafter_Hotel_System.git
cd CodeCrafter_Hotel_System
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` folder (see [Environment Variables](#-environment-variables) section).

### 3. Setup Frontend

```bash
cd Frontend
npm install
```

### 4. Seed Demo Users

```bash
cd Backend
node createTestUsers.js
```

### 5. Start the Application

**Terminal 1 — Backend:**
```bash
cd Backend
npm start
```
> Backend runs on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```
> Frontend runs on `http://localhost:5173`

---

## 🔑 Demo Login Credentials

### Admin
| Field    | Value             |
|----------|-------------------|
| Email    | `admin@hotel.com` |
| Password | `Admin@123456`    |
| Access   | `/admin` dashboard — Full system management |

### Receptionist
| Field    | Value                  |
|----------|------------------------|
| Email    | `reception@hotel.com`  |
| Password | `Reception@123`        |
| Access   | `/receptionist` panel — Front desk operations |

### Customer
| Field    | Value                |
|----------|----------------------|
| Email    | `customer@hotel.com` |
| Password | `Customer@123`       |
| Access   | Public pages — Room, Pool & Event bookings |

### Additional Test Users
| Email                  | Password        | Role     |
|------------------------|-----------------|----------|
| `john.doe@email.com`   | `TestUser@123`  | Customer |
| `jane.smith@email.com` | `TestUser@123`  | Customer |

> **Note:** You can also register new accounts via the **Sign Up** page at `/signup`.

---

## 🗺️ Available Routes

### Public Routes
| Route               | Description              |
|---------------------|--------------------------|
| `/`                 | Home page                |
| `/login`            | Login page               |
| `/signup`           | Registration page        |
| `/forgot-password`  | Password reset request   |
| `/reset-password/:token` | Reset password form |
| `/room-booking`     | Browse & book rooms      |
| `/pool-booking`     | Browse & book pools      |
| `/event-booking`    | Browse & book events     |
| `/menu`             | View food menu           |
| `/profile`          | User profile             |

### Admin Routes (`/admin/*`)
| Route                              | Description                    |
|------------------------------------|--------------------------------|
| `/admin`                           | Admin dashboard                |
| `/admin/rooms`                     | Manage rooms                   |
| `/admin/pools`                     | Manage pools                   |
| `/admin/users`                     | Manage users                   |
| `/admin/reservations`              | Reservation calendar           |
| `/admin/menu-management`           | Manage food menu               |
| `/admin/event-booking`             | Event booking management       |
| `/admin/bookingNotifications`      | Booking approvals              |
| `/admin/bookingNotifications/:id`  | Booking detail & approve/reject|

### Receptionist Routes (`/receptionist/*`)
| Route                           | Description              |
|---------------------------------|--------------------------|
| `/receptionist`                 | Reception home           |
| `/receptionist/rooms`           | Room booking             |
| `/receptionist/bookings`        | All bookings list        |
| `/receptionist/calendar`        | Booking calendar         |
| `/receptionist/pool-booking`    | Pool booking             |
| `/receptionist/pool-bookings`   | Pool bookings list       |

### Customer Protected Routes
| Route             | Description         |
|-------------------|---------------------|
| `/mybookings`     | My room bookings    |
| `/mypoolbookings` | My pool bookings    |

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup              # Register new user
POST   /api/auth/login               # Login (returns JWT)
GET    /api/auth/verify              # Verify token & get user
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password/:token  # Reset password
GET    /api/auth/verify-reset-token/:token  # Validate reset token
```

### Rooms & Bookings
```
GET    /api/rooms                    # List available rooms
POST   /api/bookings                 # Create a booking
GET    /api/user-bookings            # Get user's bookings
DELETE /api/bookings/:id             # Cancel a booking
```

### Pools
```
GET    /api/pools                    # List pools
GET    /api/pool-details/:id         # Pool details
POST   /api/pool-booking             # Create pool booking
GET    /api/poolBookings             # User pool bookings
```

### Admin
```
GET    /api/dashboard                # Dashboard stats
GET    /api/manage/users             # List all users
POST   /api/manage/users/:id         # Update user
DELETE /api/manage/users/:id         # Delete user
POST   /api/admin/bookings/:id/confirm  # Approve booking
POST   /api/admin/bookings/:id/reject   # Reject booking
```

### Events
```
GET    /api/events                   # List events
POST   /api/customer-events          # Create customer event
```

### Other
```
GET    /api/health                   # Server health check
GET    /api/notifications            # User notifications
POST   /api/upload                   # File upload
GET    /api/fooditems                # Food menu items
```

---

## ⚙️ Environment Variables

### Backend (`Backend/.env`)

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/thelake?retryWrites=true&w=majority

# Server Port
PORT=5000

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Environment Mode
NODE_ENV=development

# Email (Gmail SMTP) for Password Reset
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
FRONTEND_URL=http://localhost:5173
```

> 📖 See [`SMTP_SETUP_INSTRUCTIONS.md`](./SMTP_SETUP_INSTRUCTIONS.md) for Gmail App Password setup.

### Frontend (`Frontend/.env`)

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

---

## 📜 Scripts

### Backend
```bash
npm start        # Start server (node server.js)
npm run dev      # Start with hot-reload (nodemon)
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Utility Scripts
```bash
# Seed demo users
node Backend/createTestUsers.js

# Reset & reseed demo users
node Backend/resetTestUsers.js && node Backend/createTestUsers.js
```

---

## 👥 Team — CodeCrafter

Developed as a group project for academic coursework.

---

## 📄 License

This project is for educational purposes.
