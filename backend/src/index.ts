import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// Route imports
import authRoutes from "./routes/auth.route.js";
import appointmentRoutes from "./routes/appointment.route.js";
import transactionRoutes from "./routes/transaction.routes.js";
import patientLabTestRoutes from "./routes/patientLabTest.route.js";
import pharmacyRoutes from "./routes/pharmacy.route.js";
import messageRoutes from "./routes/message.route.js";
import adminRoutes from "./routes/adminControls.route.js"
import labTestRoutes from "./routes/labTest.route.js"
import orderRoutes from "./routes/order.route.js"
import prescriptionRoutes from "./routes/prescription.routes.js";
import noteRoutes from "./routes/note.route.js"
import reviewRoutes from "./routes/review.route.js"

import { app, server } from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT;

// Configure middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/labTests", labTestRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/patientLabTests", patientLabTestRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/review", reviewRoutes)

// Start server
server.listen(PORT, () => {
    console.log("Backend is up on port: " + PORT);
    connectDB();
});