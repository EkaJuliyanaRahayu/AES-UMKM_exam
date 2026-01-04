import { useEffect, useState } from "react";
import api from "../api/axios";

type Product = {
  _id: string;
  name: string;
  price: number;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Daftar Produk</h2>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} - Rp{p.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
