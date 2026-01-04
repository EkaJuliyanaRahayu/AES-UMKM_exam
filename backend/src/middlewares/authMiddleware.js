import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1. Ambil header Authorization
    const authHeader = req.headers.authorization;
    console.log("🔐 Auth Header:", authHeader); // DEBUG

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan.",
      });
    }

    // 2. Ambil token
    const token = authHeader.split(" ")[1];
    console.log("🔐 Token length:", token.length); // DEBUG

    // 3. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Token decoded successfully:", { 
      id: decoded.id, 
      role: decoded.role,
      username: decoded.username 
    }); // DEBUG

    // 4. Simpan data user ke request
    req.user = decoded;
    req.userId = decoded.id || decoded.adminId || decoded.userId;
    req.userRole = decoded.role || 'user';

    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.name, error.message);
    
    // Berikan pesan error yang spesifik
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token telah kadaluarsa. Silakan login kembali.",
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid.",
      });
    }

    // Error lainnya
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan dalam autentikasi.",
    });
  }
};

export default authMiddleware;