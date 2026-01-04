// 📁 backend/src/routes/productRoutes.js
import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import upload from "../middlewares/upload.js"; // ← IMPORT BARU

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// TAMBAH upload.single('image') HANYA DI SINI
router.post("/", upload.single('image'), createProduct); // ← TAMBAH MIDDLEWARE
router.put("/:id", upload.single('image'), updateProduct); // ← TAMBAH MIDDLEWARE

router.delete("/:id", deleteProduct);

export default router;