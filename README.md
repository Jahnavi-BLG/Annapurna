# Annapurna - Food Redistribution Platform

Annapurna is a robust full-stack web application designed to connect food donors (restaurants, individuals, etc.) with nearby NGOs, helping reduce food waste and feed those in need. 

## Key Features

1. **OTP Verification**: Secure registration process including OTP validation to ensure authentic users.
2. **Location-Based Suggestions**: Integrated with Haversine distance calculations to quickly sort and display the most relevant local donations to NGOs. Distance-based sorting ensures closest locations appear first.
3. **Admin Approval Workflow**: A secure admin dashboard allows the moderation of new registrations. New Donors and NGOs are placed in a "Pending Approval" state until verified by the platform admin, ensuring quality.
4. **Real-time Synchronization**: Built with Socket.IO so users see new donations and updates instantly.
5. **Distance & Tracking Details**: View real-time GPS-assisted distances between NGO and donor alongside hygiene confirmations.

## Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/annapurna` or replace `MONGO_URI` in `.env`)

### Installation 

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd annapurna
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with your mongo connection string and JWT_SECRET
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Accessing the App

- Application runs at: `http://localhost:5173`
- Backend API runs at: `https://annapurna-o299.onrender.com`

### Admin Panel
- Navigate to `/admin` route or select "Admin" during login.

---
*Developed with a focus on real-time assistance and minimizing food waste.*
