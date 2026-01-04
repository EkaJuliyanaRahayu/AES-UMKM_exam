// 📁 backend/src/controllers/financeController.js
import Finance from "../models/finance.js";
import { encrypt, decrypt } from "../utils/aes.js";

// ----------------------
//  CREATE FINANCE
// ----------------------
export const createFinance = async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;

    const plainData = JSON.stringify({
      type,
      amount,
      description,
      category,
      date,
    });

    const encrypted = encrypt(plainData);

    const newRecord = await Finance.create({ encrypted });

    res.status(201).json({ success: true, id: newRecord._id });
  } catch (error) {
    console.error("❌ CREATE FINANCE ERROR:", error);
    res.status(500).json({ error: "Gagal membuat catatan keuangan" });
  }
};


// ----------------------
//  GET ALL
// ----------------------
// Di getAllFinance function, tambahkan pembersihan:
export const getAllFinance = async (req, res) => {
  try {
    const records = await Finance.find().sort({ createdAt: -1 });

    const decryptedRecords = records.map((rec) => {
      try {
        const decrypted = decrypt(rec.encrypted);
        const parsed = JSON.parse(decrypted);

        // BERSIHKAN DESCRIPTION JIKA ADA "undefined"
        let cleanDescription = parsed.description || "";
        if (cleanDescription.includes("Pesanan #undefined - ")) {
          cleanDescription = cleanDescription.split(" - ")[1] || cleanDescription;
        }

        return {
          _id: rec._id,
          ...parsed,
          description: cleanDescription, // ← PAKAI YANG SUDAH DIBERSIHKAN
        };
      } catch (error) {
        console.error("❌ DECRYPT ERROR RECORD:", rec._id);
        return null;
      }
    }).filter(Boolean);

    res.json(decryptedRecords);
  } catch (error) {
    console.error("❌ GET FINANCE ERROR:", error);
    res.status(500).json({ error: "Gagal mengambil data keuangan" });
  }
};




// ----------------------
//  GET BY ID
// ----------------------

export const getFinance = async (req, res) => {
  try {
    const items = await Finance.find().sort({ createdAt: -1 });

    const result = items.map(f => {
      // decrypt AES yang berisi JSON
      const decrypted = decrypt(f.encrypted);

      let parsed = {};
      try {
        parsed = JSON.parse(decrypted); 
      } catch (e) {
        console.error("Gagal parsing decrypted JSON:", e.message);
      }

      return {
        _id: f._id,
        amount: parsed.amount || 0,
        description: parsed.description || "",
        category: parsed.category || "",
        date: parsed.date || "",
        createdAt: f.createdAt,
      };
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getFinanceById = async (req, res) => {
  try {
    const rec = await Finance.findById(req.params.id);
    if (!rec) return res.status(404).json({ error: "Data tidak ditemukan" });

    const decrypted = JSON.parse(decrypt(rec.encrypted));

    res.json({ _id: rec._id, ...decrypted });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};


// ----------------------
//  UPDATE
// ----------------------
export const updateFinance = async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;

    const plainData = JSON.stringify({
      type,
      amount,
      description,
      category,
      date,
    });

    const encrypted = encrypt(plainData);

    await Finance.findByIdAndUpdate(req.params.id, { encrypted });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Gagal update data" });
  }
};


// ----------------------
//  DELETE
// ----------------------
export const deleteFinance = async (req, res) => {
  try {
    await Finance.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus data" });
  }
};
