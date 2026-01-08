// 📁 src/api/products.ts
import axios from './axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================
// 📌 FIX DISINI → /api/products
// ==============================

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get('/products');
  return response.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await axios.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Product> => {
  const response = await axios.post('/products', productData);
  return response.data;
};

export const updateProduct = async ({
  id,
  data
}: {
  id: string;
  data: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>;
}): Promise<Product> => {
  const response = await axios.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`/products/${id}`);
};

export const createProductWithImage = async (
  formData: FormData
): Promise<Product> => {
  const response = await axios.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProductWithImage = async (
  id: string,
  formData: FormData
): Promise<Product> => {
  const response = await axios.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// React Query Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};

export const useCreateProductWithImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductWithImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};

export const useUpdateProductWithImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateProductWithImage(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};

// FILTER STOCK
export const fetchAvailableProducts = async (): Promise<Product[]> => {
  const products = await fetchProducts();
  return products.filter((p) => p.stock > 0);
};