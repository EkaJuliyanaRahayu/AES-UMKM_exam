// 📁 backend/src/middlewares/encryption.js
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-123";

export const encryptSensitiveFields = (req, res, next) => {
  console.log("🔐 ENCRYPTION MIDDLEWARE TRIGGERED");
  console.log("Method:", req.method);
  console.log("Original body:", req.body);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    const fields = ['customerName', 'customerPhone', 'customerAddress', 'customerEmail'];
    
    fields.forEach(field => {
      if (req.body[field]) {
        console.log(`🔐 Encrypting ${field}:`, req.body[field].substring(0, 20));
        
        // ENKRIPSI
        const encrypted = CryptoJS.AES.encrypt(
          req.body[field], 
          ENCRYPTION_KEY
        ).toString();
        
        // SIMPAN di encrypted field
        req.body[`encrypted_${field}`] = encrypted;
        console.log(`🔐 encrypted_${field}:`, encrypted.substring(0, 30) + '...');
        
        // ⚠️ HAPUS plaintext (INI YANG PENTING!)
        delete req.body[field];
      }
    });
    
    console.log("🔐 Modified body:", req.body);
  }
  
  next();
};