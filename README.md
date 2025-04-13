
# 🚌 Day Scholar Transport Management System

A full-stack project for managing day scholar transport in a college, with QR and OTP based attendance, admin dashboards, bus tracking with Leaflet maps, and faculty approval system.

## 🌟 Features

### 🔒 Authentication & Authorization
- Faculty registration with admin approval flow
- Login with session-based access
- Google Sign-In support

### 📍 Bus Tracking with Maps
- Display all bus routes and current locations using Leaflet.js
- "Locate Me" & "Locate Bus" features
- Polyline route tracking
- Source-to-destination routing

### 📲 Attendance System
- Manual Attendance
- OTP-based Attendance (expires in 30 sec)
- QR Code Attendance with session ID and expiry

### 📊 Admin Panel
- Dashboard for bus data, students, and notifications
- Faculty requests (approve/reject)
- Student attendance viewing

## ⚙️ Technologies Used

**Frontend:** React, Axios, Leaflet, QR Code Generator  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Auth:** Google Sign-In, JWT (optional)  
**QR/OTP:** Dynamically generated QR codes with session IDs & OTP system

## 📦 Folder Structure

```
📁 client/       # React frontend
📁 server/       # Express backend API
📁 public/       # Static files & images
```

## 🚀 Getting Started

### Backend Setup

```bash
cd server
npm install
node index.js
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## 🧠 Notes

- Ensure MongoDB is running locally or in the cloud.
- Set environment variables in `.env` (like `GOOGLE_CLIENT_ID`, Mongo URI, etc.)
- Update CORS origin in backend if using a different port or domain.

## 📷 Screenshots

_(Add screenshots here)_

## ✨ Author

Built with ❤️ by [M.Dhayanidhi] | 3rd year IT | Pre-final year


## 📄 License

MIT License
