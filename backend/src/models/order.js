// 📁 backend/src/models/Order.js
import mongoose from "mongoose";
import CryptoJS from "crypto-js";

// ✅ HYBRID: .env first, fallback ke hardcode
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

console.log("🔑 Order.js - Key source:", 
  process.env.ENCRYPTION_KEY ? ".env" : "hardcode fallback"
);

const OrderSchema = new mongoose.Schema({
  // Data pelanggan
  customerName: { type: String, required: false },
  customerPhone: { type: String, required: false },
  customerAddress: { type: String, required: false },
  customerEmail: { type: String, required: false },
  
  // Field untuk data terenkripsi
  encrypted_customerName: String,
  encrypted_customerPhone: String,
  encrypted_customerAddress: String,
  encrypted_customerEmail: String,
  
  // ⚠️ required: false (sementara untuk testing)
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true
    },
    productName: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['transfer', 'cod', 'cash'],
    default: 'transfer'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  notes: String,
  
}, { timestamps: true });

// ✅✅✅ HANYA SATU pre-save HOOK (yang hapus plaintext)
OrderSchema.pre('save', function(next) {
  console.log("🚨🚨🚨 PRE-SAVE HOOK EXECUTING! 🚨🚨🚨");
  console.log("Customer Name to encrypt:", this.customerName);
  console.log("Using ENCRYPTION_KEY:", ENCRYPTION_KEY.substring(0, 20) + "...");
  
  try {
    // 1. Simpan plain text ke variabel sebelum dihapus
    const plainName = this.customerName;
    const plainPhone = this.customerPhone;
    const plainAddress = this.customerAddress;
    const plainEmail = this.customerEmail;
    
    // 2. Enkripsi data
    if (plainName && plainName.trim()) {
      const encrypted = CryptoJS.AES.encrypt(plainName, ENCRYPTION_KEY).toString();
      this.encrypted_customerName = encrypted;
      console.log(`✅ Encrypted name to: ${encrypted.substring(0, 30)}...`);
      
      // ⚠️ HAPUS PLAINTEXT DARI DOKUMEN
      this.customerName = undefined;
      console.log("🗑️  Removed plaintext customerName");
    }
    
    if (plainPhone && plainPhone.trim()) {
      const encrypted = CryptoJS.AES.encrypt(plainPhone, ENCRYPTION_KEY).toString();
      this.encrypted_customerPhone = encrypted;
      console.log(`✅ Encrypted phone to: ${encrypted.substring(0, 30)}...`);
      
      // ⚠️ HAPUS PLAINTEXT
      this.customerPhone = undefined;
      console.log("🗑️  Removed plaintext customerPhone");
    }
    
    if (plainAddress && plainAddress.trim()) {
      const encrypted = CryptoJS.AES.encrypt(plainAddress, ENCRYPTION_KEY).toString();
      this.encrypted_customerAddress = encrypted;
      console.log(`✅ Encrypted address to: ${encrypted.substring(0, 30)}...`);
      
      // ⚠️ HAPUS PLAINTEXT
      this.customerAddress = undefined;
      console.log("🗑️  Removed plaintext customerAddress");
    }
    
    if (plainEmail && plainEmail.trim()) {
      const encrypted = CryptoJS.AES.encrypt(plainEmail, ENCRYPTION_KEY).toString();
      this.encrypted_customerEmail = encrypted;
      this.customerEmail = undefined;
    }
    
  } catch (error) {
    console.error("❌ Encryption error in hook:", error.message);
  }
  
  next();
});

// ✅ HOOK untuk UPDATE juga
OrderSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  if (update.$set && (update.$set.customerName || update.$set.customerPhone || update.$set.customerAddress)) {
    console.log("🔐 Pre-update hook for encryption");
    
    // Enkripsi field yang diupdate
    if (update.$set.customerName) {
      update.$set.encrypted_customerName = CryptoJS.AES.encrypt(
        update.$set.customerName,
        ENCRYPTION_KEY
      ).toString();
      update.$set.customerName = undefined;
    }
    
    if (update.$set.customerPhone) {
      update.$set.encrypted_customerPhone = CryptoJS.AES.encrypt(
        update.$set.customerPhone,
        ENCRYPTION_KEY
      ).toString();
      update.$set.customerPhone = undefined;
    }
    
    if (update.$set.customerAddress) {
      update.$set.encrypted_customerAddress = CryptoJS.AES.encrypt(
        update.$set.customerAddress,
        ENCRYPTION_KEY
      ).toString();
      update.$set.customerAddress = undefined;
    }
  }
  
  next();
});

// ✅ POST-SAVE untuk verifikasi
OrderSchema.post('save', function(doc) {
  console.log("📝 POST-SAVE VERIFICATION:");
  console.log("   Order ID:", doc._id);
  console.log("   Has encrypted_customerName?", !!doc.encrypted_customerName);
  console.log("   Has plaintext customerName?", !!doc.customerName); // Harusnya false
});

export default mongoose.model("Order", OrderSchema);