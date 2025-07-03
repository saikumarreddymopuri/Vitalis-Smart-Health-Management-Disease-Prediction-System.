import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js";
import authRoutes from './routes/auth.routes.js';
import passport from "passport";
import session from "express-session";
import "./controllers/auth.controller.js";
import symptomRoutes from "./routes/symptom.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import bedRoutes from "./routes/bed.routes.js";
import bookingRoutes from "./routes/bedbooking.routes.js";
import ambulanceRoutes from "./routes/ambulance.routes.js";
import ambulanceBookingRoutes from "./routes/ambulanceBooking.routes.js";









const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));



app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//google auth
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1/users", userRoutes);

// After other routes like userRoutes
app.use("/api/v1/auth", authRoutes);

app.use("/api/symptoms", symptomRoutes);

app.use("/api/hospitals", hospitalRoutes);
//bed routes
app.use("/api/beds", bedRoutes);
app.use("/api/bookings", bookingRoutes);

 //ambulance routes
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/ambulance-bookings", ambulanceBookingRoutes);
export { app }