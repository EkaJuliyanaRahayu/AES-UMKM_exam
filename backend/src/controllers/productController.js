import Product from "../models/product.js";
import fs from 'fs';
import path from 'path';

/**
 * GET all products - TIDAK DIUBAH
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE product - DITAMBAH HANDLE UPLOAD
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    
    // HANDLE UPLOAD GAMBAR JIKA ADA
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/products/${req.file.filename}`; // ⬅ benar
    }

    const product = new Product({
      name,
      price,
      description,
      category: category || 'Uncategorized', // Tambah default
      image: imageUrl, // Gunakan dari upload atau body
      stock: stock || 0  // biarkan undefined kalau tidak dikirim
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    // HAPUS FILE JIKA ERROR
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: err.message });
  }
};

/**
 * UPDATE product - DITAMBAH HANDLE UPLOAD
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let imageUrl = product.image;

    if (req.file) {
      imageUrl = `/uploads/products/${req.file.filename}`;

      // Hapus gambar lama (path benar!)
      if (product.image && product.image.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name ?? product.name,
        price: price ?? product.price,
        description: description ?? product.description,
        category: category ?? product.category,
        stock: stock ?? product.stock,
        image: imageUrl
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: err.message });
  }
};


/**
 * DELETE product - TAMBAH HAPUS GAMBAR
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image && product.image.startsWith("/uploads/")) {
      const imgPath = path.join(process.cwd(), product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
