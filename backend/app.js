import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

// ========== FIX 1: PAKAI await ==========
try {
  await connectDB(); // ✅ PAKAI AWAIT!
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}
// =========================================

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors());

app.use(express.json());

// ✅ SERVE STATIC FILES
app.use("/uploads", express.static("uploads"));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('API UMKM Kue Rumahan berjalan 🚀');
});

// 🔥 Health Check untuk Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;

// ========== FIX 2: BIND KE 0.0.0.0 ==========
app.listen(PORT, '0.0.0.0', () => {  // ✅ TAMBAH '0.0.0.0'
  console.log(`✅ Backend running on port ${PORT} (Railway ready)`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
});
// ============================================