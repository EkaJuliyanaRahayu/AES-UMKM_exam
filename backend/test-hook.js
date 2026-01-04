// Buat file test-hook.js di backend
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();
// test-hook.js - versi sederhana
async function testHook() {
  await mongoose.connect(process.env.DB_URL);
  
  console.log("🧪 Testing hook...");
  
  const testOrder = new Order({
    customerName: "TEST HOOK FINAL",
    customerPhone: "08123456789",
    customerAddress: "Jl. Test Hook Final",
    items: [{ 
      productName: "Test Product",
      quantity: 1,
      price: 10000 
    }], // ⬅️ TIDAK PERLU productId karena required: false
    totalPrice: 10000
  });
  
  console.log("Before save:", {
    name: testOrder.customerName,
    hasEncrypted: !!testOrder.encrypted_customerName
  });
  
  const saved = await testOrder.save();
  
  console.log("\n✅ TEST RESULT:");
  console.log("   Hook executed? ✅ (lihat log di atas)");
  console.log("   encrypted_customerName:", saved.encrypted_customerName?.substring(0, 30) + '...');
  console.log("   Length:", saved.encrypted_customerName?.length);
  
  // Verifikasi di database
  const fromDB = await Order.findById(saved._id);
  console.log("\n📊 DATABASE VERIFICATION:");
  console.log("   encrypted_customerName in DB?", !!fromDB.encrypted_customerName);
  console.log("   Value:", fromDB.encrypted_customerName?.substring(0, 30) + '...');
  
  await mongoose.disconnect();
}

testHook().catch(console.error);