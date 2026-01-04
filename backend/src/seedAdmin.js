import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/admin.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.DB_URL);

  const hashedPassword = await bcrypt.hash("jul123", 10);

  await Admin.create({
    username: "ejull",
    password: hashedPassword,
  });

  console.log("✅ Admin berhasil dibuat");
  process.exit();
};

run();
