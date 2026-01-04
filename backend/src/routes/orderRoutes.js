// 📁 backend/src/routes/orderRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
// import { encryptSensitiveFields } from "../middlewares/encryption.js"; //
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// ✅ AKTIFKAN encryption untuk POST order
// router.post("/", authMiddleware, encryptSensitiveFields, createOrder); // 

// GET routes
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", authMiddleware, createOrder);
// DELETE dan UPDATE
router.delete("/:id", authMiddleware, deleteOrder);
router.put("/:id/status", authMiddleware, updateOrderStatus);

export default router;