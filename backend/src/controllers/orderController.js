
import mongoose from "mongoose";
import Order from "../models/order.js";
import CryptoJS from "crypto-js";

// ⚠️ HAPUS CACHE MODEL (ES Modules style)
console.log("✅ Order controller loaded");

// ✅ HARCODE KEY (sama dengan di Order.js)
const ENCRYPTION_KEY = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

console.log("🔄 Order controller loaded with hardcoded key");

// Fungsi decrypt
const decryptData = (encryptedText) => {
  if (!encryptedText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || '';
  } catch (error) {
    console.error('❌ Decrypt error:', error);
    return encryptedText;
  }
};

// 📁 backend/src/controllers/orderController.js
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    const decryptedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // ✅ SIMPLE: Selalu gunakan encrypted data jika ada
      if (orderObj.encrypted_customerName) {
        const bytes = CryptoJS.AES.decrypt(orderObj.encrypted_customerName, ENCRYPTION_KEY);
        orderObj.customerName = bytes.toString(CryptoJS.enc.Utf8) || "N/A";
      } else {
        orderObj.customerName = orderObj.customerName || "N/A";
      }
      
      if (orderObj.encrypted_customerPhone) {
        const bytes = CryptoJS.AES.decrypt(orderObj.encrypted_customerPhone, ENCRYPTION_KEY);
        orderObj.customerPhone = bytes.toString(CryptoJS.enc.Utf8) || "-";
      }
      
      if (orderObj.encrypted_customerAddress) {
        const bytes = CryptoJS.AES.decrypt(orderObj.encrypted_customerAddress, ENCRYPTION_KEY);
        orderObj.customerAddress = bytes.toString(CryptoJS.enc.Utf8) || "-";
      }
      
      return orderObj;
    });
    
    res.json(decryptedOrders);
    
  } catch (error) {
    console.error('❌ GET ORDERS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// CREATE order
export const createOrder = async (req, res) => {
  try {
    console.log('📦 Creating order...');
    
    const { customerName, customerPhone, customerAddress, ...rest } = req.body;
    
    // Enkripsi manual
    const encryptedData = {};
    if (customerName) {
      encryptedData.encrypted_customerName = CryptoJS.AES.encrypt(
        customerName,
        ENCRYPTION_KEY
      ).toString();
    }
    if (customerPhone) {
      encryptedData.encrypted_customerPhone = CryptoJS.AES.encrypt(
        customerPhone,
        ENCRYPTION_KEY
      ).toString();
    }
    if (customerAddress) {
      encryptedData.encrypted_customerAddress = CryptoJS.AES.encrypt(
        customerAddress,
        ENCRYPTION_KEY
      ).toString();
    }
    
    const orderData = {
      ...req.body,
      ...encryptedData,
      status: 'pending'
    };
    
    const order = new Order(orderData);
    await order.save();
    
    console.log('✅ Order created');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
    
  } catch (error) {
    console.error('❌ ORDER ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// ... (getOrderById, updateOrderStatus, deleteOrder tetap sama)


// ... (fungsi lainnya tetap sama: getOrderById, updateOrderStatus, deleteOrder)

// GET single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status' 
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
