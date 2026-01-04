// 📁 backend/src/routes/financeRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js"; // ✅ HAPUS { requireAdmin }
// import authMiddleware, { requireAdmin } from "../middlewares/authMiddleware.js"; // ❌ HAPUS INI
import {
  getAllFinance,
  getFinanceById,
  createFinance,
  updateFinance,
  deleteFinance,
} from "../controllers/financeController.js";

const router = express.Router();

// Gunakan authMiddleware saja (tanpa requireAdmin)
router.get("/", authMiddleware, getAllFinance);
router.get("/:id", authMiddleware, getFinanceById);
router.post("/", authMiddleware, createFinance);
router.put("/:id", authMiddleware, updateFinance);
router.delete("/:id", authMiddleware, deleteFinance);

export default router;