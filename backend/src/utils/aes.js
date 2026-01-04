import crypto from 'crypto';

// ✅ KEY FIXED - PASTIKAN DI .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  '1234567890abcdef1234567890abcdef'; // 32 karakter (32 bytes)

const algorithm = 'aes-256-cbc';
const IV_LENGTH = 16; // 16 bytes untuk AES-CBC

// ✅ ENKRIPSI: text → encrypted string
export const encrypt = (text) => {
  try {
    console.log('🔐 Encrypting text, length:', text.length);
    
    // Pastikan key 32 bytes
    let key = ENCRYPTION_KEY;
    if (key.length < 32) key = key.padEnd(32, '0');
    if (key.length > 32) key = key.substring(0, 32);
    
    const keyBuffer = Buffer.from(key, 'utf8');
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Format: iv:encrypted
    const result = `${iv.toString('hex')}:${encrypted}`;
    console.log('🔐 Encryption successful, result length:', result.length);
    
    return result;
    
  } catch (error) {
    console.error('🔴 ENCRYPT ERROR:', error);
    // Fallback: return as base64
    return `base64:${Buffer.from(text).toString('base64')}`;
  }
};

// ✅ DEKRIPSI: encrypted string → text
export const decrypt = (encryptedText) => {
  try {
    console.log('🔐 Decrypting text, length:', encryptedText?.length);
    
    // Handle fallback format
    if (encryptedText.startsWith('base64:')) {
      return Buffer.from(encryptedText.substring(7), 'base64').toString('utf8');
    }
    
    // Format normal: iv:encrypted
    const parts = encryptedText.split(':');
    if (parts.length < 2) {
      throw new Error('Format enkripsi tidak valid');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts.slice(1).join(':');
    
    // Pastikan key 32 bytes
    let key = ENCRYPTION_KEY;
    if (key.length < 32) key = key.padEnd(32, '0');
    if (key.length > 32) key = key.substring(0, 32);
    
    const keyBuffer = Buffer.from(key, 'utf8');
    
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log('🔐 Decryption successful');
    return decrypted;
    
  } catch (error) {
    console.error('🔴 DECRYPT ERROR:', error.message);
    console.error('🔴 Input was:', encryptedText?.substring(0, 100));
    throw new Error(`Gagal mendekripsi: ${error.message}`);
  }
};

// ✅ TEST FUNCTION
export const testAES = () => {
  const testData = 'Hello World AES Test 123';
  const encrypted = encrypt(testData);
  const decrypted = decrypt(encrypted);
  
  console.log('🧪 AES TEST RESULT:');
  console.log('  Original:', testData);
  console.log('  Encrypted:', encrypted.substring(0, 50) + '...');
  console.log('  Decrypted:', decrypted);
  console.log('  Success:', testData === decrypted ? '✅ YES' : '❌ NO');
  
  return testData === decrypted;
};