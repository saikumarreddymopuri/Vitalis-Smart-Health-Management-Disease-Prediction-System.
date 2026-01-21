<p align="center">
  <img src="https://res.cloudinary.com/dk9b9pida/image/upload/v1763272181/Screenshot_2025-11-16_111647_jybiuh.png" alt="Vitalis Logo" width="150">
</p>

<h1 align="center">Vitalis: Smart Health Management & Disease Prediction System</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version">
</p>

---
**An AI-Powered Integrated Healthcare Ecosystem for Real-Time Medical Assistance.**

Vitalis is a sophisticated, role-based healthcare platform that bridges the gap between AI-driven diagnosis and emergency resource management. It integrates a custom Machine Learning engine with a real-time hospital resource tracking system to provide an end-to-end digital health solution.

---
### 🌐 Live Deployment
* **Live Application:** [Explore here](https://vitalis-front-liart.vercel.app/)

---
## 🔑 Demo Credentials (Quick Access)


| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vitalis.com` | `admin@123` | Full System Control & Verifications |
| **Operator** | `operator@vitalis.com` | `operator@123` | Hospital Resource & Booking Management |
| **User** | `user@vitalis.com` | `user@123` | Predictions, Bookings & Tracking |

---

## 💡 Core Logic & Full Potential
Unlike standard health tracking apps, Vitalis is architected as a complete healthcare pipeline. The "Soul" of this project lies in its seamless integration of different technologies to solve real-world emergency delays:

* **Intelligent Triage Engine:** Processes symptoms through a dedicated Python-based Flask Microservice to predict potential diseases with high accuracy, storing predictions in MongoDB for history tracking.
* **Automated Resource Mapping:** Once a disease is predicted, the system filters hospitals based on their ability to treat that specific condition and calculates proximity for immediate action.
* **Event-Driven Real-Time Sync:** Using **Socket.IO**, the platform ensures zero latency between a patient's booking and the hospital operator's dashboard. No page refreshes are required.

* **Financial & Operational Integrity:** Includes a full simulation of payment flows (Razorpay) and multi-step approval workflows (Pending → Approved/Rejected), mimicking a real-world enterprise healthcare system.

---

## 🚀 Key Features

### 🧠 Smart Diagnosis & Navigation
* **ML Disease Prediction:** Advanced symptom-to-disease mapping via a Flask-based ML API.
* **🗺️ Hospital Location & Navigation:** Integrated **Leaflet.js and OpenStreetMap** to help users visually locate and navigate to the nearest hospitals without relying on expensive proprietary APIs.


### 🏥 Resource & Emergency Management
* **Dynamic Bed Booking:** Real-time inventory management for ICU, Ventilator, and General beds with an automated approval workflow.
* **Ambulance Dispatch System:** Integrated ambulance booking linked directly to hospital operators for faster emergency response.
* **Interactive Notifications:** A persistent notification system (Socket.IO + MongoDB) that alerts users and admins of status changes instantly.

### ⚡ Technical Excellence
* **Role-Based Access Control (RBAC):** Secure, middleware-protected routes for Admin, Operator, and User roles.
* **Scalable Architecture:** Built with a decoupled MERN-P (MongoDB, Express, React, Node + Python) stack.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS v4, Context API, Socket.IO Client |
| **Backend** | Node.js, Express.js, JWT Authentication, Socket.IO, Nodemailer |
| **Database** | MongoDB |
| **ML Engine** | Python, Flask, Scikit-learn (Symptom-to-Disease Model) |
| **Deployment** | Vercel (Frontend & Backend), Render( ML Model) |

---

## 👥 Role-Based Capabilities

### 🧑‍⚕️ User (Patient)
- Predict diseases based on symptoms and view history.
- Locate verified hospitals on an interactive map using OpenStreetMap.
- Book hospital beds/ambulances and track real-time status.

### 🏥 Operator (Hospital Manager)
- Manage hospital profiles and inventory (Beds & Ambulances).
- Process real-time booking requests with instant approval/rejection alerts.

### 🛡️ Admin (System Overseer)
- Verify and approve new hospital registrations to maintain data integrity.
- Monitor system-wide activity and manage platform analytics.

---


## 👤 Author
**MOPURI SAIKUMAR REDDY** 

---
## 🤝 Connect with Me

<div align="left">
  <a href="www.linkedin.com/in/saikumarreddymopuri">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="mailto:saikumarmopuri8639@gmail.com">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail">
  </a>
</div>
