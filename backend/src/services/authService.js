import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";

export const loginAdmin = async (username, password) => {
  // 1. Cari admin di database
  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new Error("Username tidak ditemukan");
  }

  // 2. Cocokkan password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error("Password salah");
  }

  // 3. Generate JWT
  const token = jwt.sign(
    {
      role: "admin",
      adminId: admin._id,
      username: admin.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return token;
};
