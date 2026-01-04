import express from 'express';
import Product from '../models/product.js';
import Order from '../models/order.js';
import Finance from '../models/finance.js';
import CryptoJS from 'crypto-js';

const router = express.Router();

// AES KEY
const ENCRYPTION_KEY = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

// Fungsi decrypt finance
const decryptFinance = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
};

// Fungsi decrypt nama pelanggan
const decryptField = (encrypted) => {
  if (!encrypted) return "Tidak diketahui";
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || "Tidak diketahui";
  } catch {
    return "Tidak diketahui";
  }
};

router.get('/dashboard/stats', async (req, res) => {
  try {
    const [products, orders, finance] = await Promise.all([
      Product.find(),
      Order.find(),
      Finance.find()
    ]);

    // =============================
    // 🔓 DECRYPT FINANCE (untuk expense saja)
    // =============================
    const decryptedFinance = finance
      .map(f => decryptFinance(f.encrypted))
      .filter(Boolean);

    // =============================
    // 💰 TOTAL INCOME - DARI ORDER (FIXED!)
    // =============================
    // Status yang menghasilkan uang
    const revenueStatuses = ['paid', 'completed', 'delivered', 'confirmed'];
    
    const paidOrders = orders.filter(o => revenueStatuses.includes(o.status));
    
    const totalIncome = paidOrders.reduce((sum, order) => {
      return sum + (Number(order.totalPrice) || 0);
    }, 0);

    // =============================
    // 📅 PENDAPATAN HARI INI - DARI ORDER
    // =============================
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayIncome = paidOrders
      .filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

    // =============================
    // 💸 TOTAL EXPENSE - DARI FINANCE
    // =============================
    const totalExpense = decryptedFinance
      .filter(f => f.type === "expense")
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);

    // =============================
    // 🔐 RECENT ORDERS
    // =============================
    const decryptedRecentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order, index) => ({
        id: order._id ? `ORD-${order._id.toString().slice(-6).toUpperCase()}` : order._id,
        customerName: decryptField(order.encrypted_customerName),
        totalPrice: order.totalPrice || 0,
        status: order.status,
        createdAt: order.createdAt || "-"
      }));

    // =============================
    // 📊 RESPONSE
    // =============================
    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,

      // INI YANG DIPERBAIKI:
      totalIncome,        // Dari Order
      todayIncome,        // Dari Order  
      totalExpense,       // Dari Finance

      recentOrders: decryptedRecentOrders,

      lowStockProducts: products
        .filter(p => p.stock < 10)
        .slice(0, 5)
        .map(p => ({ id: p._id, name: p.name, stock: p.stock })),

      topProducts: products
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 3)
        .map(p => ({ id: p._id, name: p.name, sales: 0 }))
    });

  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;