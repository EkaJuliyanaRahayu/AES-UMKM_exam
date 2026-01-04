import axios from './axios';
import { useQuery } from '@tanstack/react-query';

// Types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalIncome: number;
 // totalExpense: number; //
 // netProfit: number; //
  todayIncome: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecord {
  _id?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

// 📊 API Functions untuk Dashboard

/**
 * 1. Fetch semua data sekaligus (OPTIMAL untuk dashboard)
 */
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  const response = await axios.get('/dashboard/stats');
  return response.data;
};

/**
 * 2. Atau fetch data terpisah (jika endpoint terpisah)
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get('/products');
  return response.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/orders');
  return response.data;
};

export const fetchFinancialRecords = async (): Promise<FinancialRecord[]> => {
  const response = await axios.get('/finance');
  return response.data;
};

/**
 * 3. Fetch data dashboard dengan Promise.all (jika tidak ada endpoint khusus)
 */
export const fetchDashboardDataCombined = async () => {
  const [products, orders, financialRecords] = await Promise.all([
    fetchProducts(),
    fetchOrders(),
    fetchFinancialRecords(),
  ]);
  
  // Hitung stats secara manual di frontend
  const stats = calculateDashboardStats(products, orders, financialRecords);
  return stats;
};

// Helper function untuk kalkulasi stats
const calculateDashboardStats = (
  products: Product[],
  orders: Order[],
  financialRecords: FinancialRecord[]
): DashboardStats => {
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const totalIncome = financialRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  // Hari ini
  const today = new Date().toDateString();
  const todayIncome = orders
    .filter(o => new Date(o.createdAt).toDateString() === today)
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const lowStockProducts = products
    .filter(p => p.stock < 10)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
    }));

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(o => ({
      id: o.id,
      customerName: o.customerName,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt,
    }));

  const topProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      name: p.name,
      sales: 0,
    }));

  return {
    totalProducts,
    totalOrders,
    pendingOrders,
    totalIncome,
    todayIncome,
    lowStockProducts,
    recentOrders,
    topProducts,
  };
};


// 📊 React Query Hooks untuk Dashboard

/**
 * Hook untuk mengambil data dashboard (REKOMENDASI)
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData, // Atau fetchDashboardDataCombined
    refetchInterval: 30000, // Auto-refresh setiap 30 detik
  });
};

/**
 * Hook untuk mengambil data terpisah
 */
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
};

export const useFinancialRecords = () => {
  return useQuery({
    queryKey: ['finance'],
    queryFn: fetchFinancialRecords,
  });
};