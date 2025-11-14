import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connect_Db from './config/config_db.js';
import authRoutes from './router/authRoutes.js';
import customerRoutes from './router/customerRoutes.js';
import eventManagerRoutes from './router/eventManagerRoutes.js';
import eventRoutes from './router/eventRoutes.js'; // Make sure this line exists
import ticketRoutes from './router/ticketRouter.js';
import productRoutes from './router/productRoutes.js';
import adminRoutes from './router/adminRoutes.js';
import cors from 'cors';

const app = express();

dotenv.config();
connect_Db();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", customerRoutes);
app.use("/api/eventManagers", eventManagerRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin',adminRoutes);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
});