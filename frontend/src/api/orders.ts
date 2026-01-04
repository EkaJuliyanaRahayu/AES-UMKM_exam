// 📁 src/api/orders.ts
import axios from './axios';

export interface OrderItem {
  productId: string;
  productName?: string;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  _id: string; // MongoDB ID
  id?: string; // Untuk backward compatibility
  orderNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

// ✅ GET semua orders
export const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/orders');
  return response.data;
};

// ✅ GET single order by ID
export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await axios.get(`/orders/${id}`);
  return response.data;
};

// ✅ CREATE order
export const createOrder = async (orderData: Omit<Order, '_id' | 'createdAt'>): Promise<Order> => {
  const response = await axios.post('/orders', orderData);
  return response.data;
};

// ✅ UPDATE order (general update - untuk update semua field)
export const updateOrder = async ({ id, data }: { id: string; data: Partial<Order> }): Promise<Order> => {
  const response = await axios.put(`/orders/${id}`, data);
  return response.data;
};

// ✅ UPDATE ORDER STATUS (spesifik untuk status saja) - 🔥 ENDPOINT BARU!
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const response = await axios.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

// ✅ DELETE order
export const deleteOrder = async (id: string): Promise<void> => {
  await axios.delete(`/orders/${id}`);
};

// 🔄 Opsional: Helper untuk backward compatibility (jika masih dipakai)
export const getOrderStatus = (order: Order): Order['status'] => {
  // Hapus atau minimalisir fungsi ini karena sekarang langsung dari database
  return order.status || 'pending';
};