# Vitalis: Smart Health Management & Disease Prediction System

A comprehensive hospital management system designed to streamline hospital operations, manage requests, and provide a seamless interface for operators, admins, and users.

---

## 📜 Description

Vitalis is a comprehensive hospital management system designed to streamline hospital operations, manage hospital requests, and provide a seamless interface for operators, admins, and users. It solves the problem of managing hospital data, verifying hospital requests, and notifying users in real-time. This project is ideal for healthcare administrators, hospital operators, and patients seeking nearby hospitals.

---

## ✨ Key Features

* **User Dashboard**: Allows users to search for nearby hospitals, book beds, book ambulances, and predict diseases based on symptoms.
* **Operator Dashboard**: Enables operators to add hospitals, manage beds, and handle ambulance bookings.
* **Admin Dashboard**: Allows admins to approve or reject hospital requests and manage pending operations.
* **Real-Time Notifications**: Uses Socket.IO to notify admins of new hospital requests.
* **Authentication**: Secure login and session management using JWT.
* **Disease Prediction**: Predicts diseases based on symptoms using a machine learning model.
* **Ambulance Booking**: Books ambulances with real-time availability and pricing.
* **Bed Management**: Manages hospital beds with availability and pricing details.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.IO
* **Frontend**: React, Vite, Tailwind CSS
* **Utilities**: JWT for authentication, Razorpay for payments, Cloudinary for image uploads
* **Other Tools**: Prettier, ESLint, dotenv

---

 

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* `npm` or `yarn`
* MongoDB (local or cloud instance)
* A `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=4000
    MONGO_URI=your_mongo_connection_string
    JWT_SECRET=your_jwt_secret
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/Vitalis-Smart-Health-Management-Disease-Prediction-System.git](https://github.com/your-username/Vitalis-Smart-Health-Management-Disease-Prediction-System.git)
    cd Vitalis-Smart-Health-Management-Disease-Prediction-System
    ```
2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```
4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory with the required variables as shown in the prerequisites.

5.  **Start the backend server:**
    ```bash
    cd ../backend
    npm run dev
    ```
6.  **Start the frontend server:**
    ```bash
    cd ../frontend
    npm run dev
    ```

---

## 📋 Usage

* **Users**: Search for hospitals, book beds, and predict diseases.
* **Operators**: Add hospitals, manage beds, and handle ambulance bookings.
* **Admins**: Approve or reject hospital requests and manage pending operations.

---

 
