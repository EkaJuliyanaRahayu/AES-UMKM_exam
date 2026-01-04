import mongoose from "mongoose";

const financeSchema = new mongoose.Schema({
  encrypted: { type: String, required: true }, // AES encrypted
}, { timestamps: true });


export default mongoose.model("Finance", financeSchema);
