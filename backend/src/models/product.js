import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,           // ✅ SUDAH ADA! Untuk URL gambar
  category: String,        // ← TAMBAH INI untuk kategori produk
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {              // ← OPSIONAL: untuk soft delete
    type: Boolean,
    default: true
  },
  createdAt: {             // ← OPSIONAL: otomatis dari timestamps
    type: Date,
    default: Date.now
  }
}, { timestamps: true });  // ← TAMBAH INI untuk auto createdAt/updatedAt

export default mongoose.model("Product", productSchema);