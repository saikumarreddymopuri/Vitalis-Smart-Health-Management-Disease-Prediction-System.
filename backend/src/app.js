import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js";
import authRoutes from './routes/auth.routes.js';
import passport from "passport";
import session from "express-session";
import "./controllers/auth.controller.js";
import symptomRoutes from "./routes/symptom.routes.js";





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

 
export { app }