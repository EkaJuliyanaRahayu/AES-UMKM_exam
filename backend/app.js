import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // ← TAMBAH INI
import { fileURLToPath } from 'url'; // ← TAMBAH INI
import connectDB from './src/config/db.js';

import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import dashboardRoutes from './src/routes/dashboard.js';

// Fix __dirname untuk ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors());

app.use(express.json());

// ✅ SERVE STATIC FILES (SETELAH import path)
app.use("/uploads", express.static("uploads"));


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api', dashboardRoutes); // Akan jadi /api/dashboard/stats

app.get('/', (req, res) => {
  res.send('API UMKM Kue Rumahan berjalan 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});